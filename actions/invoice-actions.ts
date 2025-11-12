'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { put, del } from '@vercel/blob'
import { z } from 'zod'
import { Prisma, SossilverProduct, Role } from '@prisma/client'
import { redirect } from 'next/navigation'

// --- Tipe Data dari Client ---

export interface CartItemInput {
  productId: string
  quantity: number
  priceAtTime: number
  gramasi: number
}

export interface CustomerInput {
  customerName: string
  customerPhone: string
  customerAddress: string
}

// --- Tipe State (Konsisten untuk semua Form Actions) ---
export type InvoiceState = {
  status: 'success' | 'error' | 'info'
  message: string
  errors?: {
    // [PENYEMPURNAAN] Menambahkan field errors yang umum
    id?: string[]
    status?: string[]
    file?: string[]
    customer?: string[]
    itemsInput?: string[]
    _form?: string[] // Untuk error umum
  }
}

export type CreateInvoiceState = InvoiceState & {
  invoiceId?: string
}

// --- Skema Zod (Ditempatkan di level atas) ---

const CartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().min(1),
  priceAtTime: z.number().min(0),
  gramasi: z.number().min(0)
})

const CustomerSchema = z.object({
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi.'),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional()
})

const CreateInvoiceSchema = z.object({
  customer: CustomerSchema,
  itemsInput: z.array(CartItemSchema).min(1, 'Keranjang tidak boleh kosong.'),
  shippingFee: z.number().min(0),
  discountPercent: z.number().min(0).max(100)
})

// [PENYEMPURNAAN] Skema untuk update status
const StatusEnum = z.enum([
  'PAID',
  'UNPAID',
  'CANCELLED',
  'WAITING_VERIFICATION',
  'SEDANG_DISIAPKAN',
  'SEDANG_PENGIRIMAN',
  'SELESAI'
])

const UpdateStatusSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  // Cukup gunakan skema enum secara langsung.
  // Zod akan menangani validasi dan tipe.
  status: StatusEnum
})


// [PENYEMPURNAAN] Skema untuk upload file (dipindah ke atas)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

const FileSchema = z
  .instanceof(File, { message: 'File wajib diisi.' })
  .refine(file => file.size > 0, 'File tidak boleh kosong.')
  .refine(file => file.size <= MAX_FILE_SIZE, `Ukuran file maksimal 5MB.`)
  .refine(
    file => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Tipe file tidak valid (JPG, PNG, WEBP).'
  )

// [PENYEMPURNAAN] Skema untuk form upload bukti (menggabungkan ID dan file)
const AddProofSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  file: FileSchema
})

// --- SERVER ACTIONS ---

/**
 * Aksi untuk mencari produk berdasarkan nama
 */
export async function searchProductsAction (
  query: string
): Promise<SossilverProduct[]> {
  if (!query) {
    return []
  }
  try {
    const products = await db.sossilverProduct.findMany({
      where: {
        nama: {
          contains: query,
          mode: 'insensitive'
        }
      },
      take: 10
    })
    return products
  } catch (error) {
    console.error('Gagal mencari produk:', error)
    return []
  }
}

/**
 * Aksi untuk membuat Invoice baru (dari KASIR ADMIN)
 * Catatan: Aksi ini dipanggil secara imperatif (bukan via <form>),
 * sehingga menerima argumen langsung, bukan FormData.
 */
export async function createInvoiceAction (
  customer: CustomerInput,
  itemsInput: CartItemInput[],
  shippingFee: number,
  discountPercent: number
): Promise<CreateInvoiceState> {
  const validatedFields = CreateInvoiceSchema.safeParse({
    customer,
    itemsInput,
    shippingFee,
    discountPercent
  })

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Validasi data gagal.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { itemsInput: items, customer: customerInfo } = validatedFields.data

  const session = await auth()
  if (!session?.user?.id || session.user.role === Role.CUSTOMER) {
    return {
      status: 'error',
      message: 'Anda harus login sebagai Admin/Staff.',
      errors: { _form: ['Akses ditolak.'] }
    }
  }
  const userId = session.user.id

  const invoiceNumber = `INV-${Date.now()}`

  const subTotal = items.reduce(
    (acc, item) => acc + item.priceAtTime * item.quantity,
    0
  )
  const discountAmount = (subTotal * discountPercent) / 100
  const totalAmount = subTotal - discountAmount + shippingFee

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount: totalAmount,
        subTotal: subTotal,
        shippingFee: shippingFee,
        discountPercent: discountPercent,
        status: 'UNPAID',
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        customerAddress: customerInfo.customerAddress,
        createdById: userId,
        items: {
          create: itemsInput.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            gramasi: item.gramasi
          }))
        }
      }
    })

    revalidatePath('/dashboard/invoice')

    return {
      status: 'success',
      message: 'Invoice berhasil dibuat.',
      invoiceId: newInvoice.id
    }
  } catch (error) {
    console.error('Gagal membuat invoice:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        if (error.meta?.field_name === 'Invoice_createdById_fkey') {
          return {
            status: 'error',
            message: 'Gagal membuat invoice: ID User (Admin) tidak valid.'
          }
        }
      }
    }
    return {
      status: 'error',
      message: 'Gagal membuat invoice: Terjadi kesalahan server.'
    }
  }
}

/**
 * Mengambil semua invoice
 */
export async function getInvoicesAction () {
  // [PENYEMPURNAAN] Tambahkan Cek Sesi (Asumsi hanya admin/staff)
  const session = await auth()
  if (session?.user?.role === Role.CUSTOMER) {
    console.warn('Akses getInvoicesAction ditolak untuk CUSTOMER.')
    return []
  }

  try {
    const invoices = await db.invoice.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
    return invoices
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
}

/**
 * Mengambil satu invoice berdasarkan ID
 * (Bisa diakses oleh Admin atau Customer yang memiliki invoice tsb)
 */
export async function getInvoiceByIdAction (invoiceId: string) {
  const session = await auth()
  if (!session?.user) {
    return null // Tidak login
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        createdBy: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // [PENYEMPURNAAN] Cek kepemilikan jika role-nya CUSTOMER
    if (
      session.user.role === Role.CUSTOMER &&
      invoice?.customerId !== session.user.id
    ) {
      console.warn('Akses getInvoiceByIdAction ditolak.')
      return null
    }

    return invoice
  } catch (error) {
    console.error('Error fetching invoice by ID:', error)
    return null
  }
}

/**
 * [DISEMPURNAKAN] Mengubah status invoice (misal: PAID, CANCELLED)
 * Menggunakan Zod untuk validasi.
 */
export async function updateInvoiceStatusAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {


  const receivedStatus = formData.get('status');
  console.log('SERVER MENERIMA STATUS:', receivedStatus);

  // [PERBAIKAN] 1. Validasi input menggunakan Skema Zod
  const validatedFields = UpdateStatusSchema.safeParse({
    id: formData.get('id'),
    status: receivedStatus,
  })

  // [PERBAIKAN] 2. Jika validasi gagal, kembalikan 'errors'
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Validasi gagal. Mohon periksa input Anda.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  // Data sekarang aman untuk digunakan
  const { id, status } = validatedFields.data

  // [PENYEMPURNAAN] Cek otorisasi (Asumsi hanya Admin/Staff)
  const session = await auth()
  if (session?.user?.role === Role.CUSTOMER) {
    return {
      status: 'error',
      message: 'Anda tidak memiliki izin untuk mengubah status.',
      errors: { _form: ['Akses ditolak.'] }
    }
  }

  try {
    // [PERBAIKAN] 3. Lakukan operasi database
    await db.invoice.update({
      where: { id: id },
      data: { status: status }
    })

    // 4. Revalidasi path
    revalidatePath('/dashboard/invoice')
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount') // Untuk customer

    // [PERBAIKAN] 5. Kembalikan state sukses
    return {
      status: 'success',
      message: 'Status invoice berhasil diperbarui.',
      errors: {}
    }
  } catch (error) {
    console.error('Error updating invoice status:', error)

    // [PERBAIKAN] 6. Kembalikan state error
    return {
      status: 'error',
      message: 'Terjadi kesalahan pada server. Gagal memperbarui status.',
      errors: {
        _form: ['Gagal memperbarui status. Silakan coba lagi.']
      }
    }
  }
}

/**
 * [DISEMPURNAKAN] Upload bukti bayar
 * Menggunakan skema Zod gabungan (AddProofSchema).
 */
export async function addPaymentProofAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  // [PENYEMPURNAAN] 1. Validasi ID dan File secara bersamaan
  const validatedFields = AddProofSchema.safeParse({
    id: formData.get('id'),
    file: formData.get('file')
  })

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Validasi gagal.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id: invoiceId, file } = validatedFields.data

  // [PENYEMPURNAAN] Cek Sesi (Bisa Admin atau Customer pemilik)
  const session = await auth()
  if (!session?.user) {
    return { status: 'error', message: 'Anda harus login.' }
  }

  const fileExtension = file.name.split('.').pop()
  const uniqueFileName = `payment-proof-${invoiceId}-${Date.now()}.${fileExtension}`

  try {
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { paymentProofUrl: true, status: true, customerId: true }
    })

    if (!existingInvoice) {
      return { status: 'error', message: 'Invoice tidak ditemukan.' }
    }

    // [PENYEMPURNAAN] Cek Otorisasi: Admin Boleh, Customer hanya milik sendiri
    if (
      session.user.role === Role.CUSTOMER &&
      existingInvoice.customerId !== session.user.id
    ) {
      return { status: 'error', message: 'Ini bukan invoice Anda.' }
    }

    // Cek Status
    if (
      existingInvoice.status !== 'UNPAID' &&
      existingInvoice.status !== 'WAITING_VERIFICATION'
    ) {
      return {
        status: 'error',
        message: `Invoice ini sudah dalam status ${existingInvoice.status}.`
      }
    }

    // Hapus file lama jika ada
    if (existingInvoice?.paymentProofUrl) {
      try {
        await del(existingInvoice.paymentProofUrl)
      } catch (delError) {
        console.warn('Gagal menghapus file lama:', delError)
        // Tidak perlu stop, lanjut upload file baru
      }
    }

    // Upload file baru
    const blob = await put(uniqueFileName, file, {
      access: 'public'
    })

    // Update DB
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: blob.url,
        status: 'WAITING_VERIFICATION' // Otomatis update status
      }
    })

    revalidatePath(`/dashboard/invoice/${invoiceId}`)
    revalidatePath('/dashboard/invoice')
    revalidatePath('/myaccount')

    return {
      status: 'success',
      message: 'Bukti bayar berhasil diupload.'
    }
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return {
      status: 'error',
      message: 'Gagal mengupload file karena kesalahan server.'
    }
  }
}

/**
 * ==========================================================
 * Aksi untuk membuat Order dari sisi PELANGGAN (Tombol Beli Cepat)
 * Catatan: Aksi ini menggunakan pola 'throw/redirect'.
 * Error akan ditangkap oleh error.tsx, sukses akan redirect.
 * ==========================================================
 */
export async function createCustomerOrderAction (
  formData: FormData
): Promise<void> {
  const session = await auth()
  if (!session?.user || !session.user.id || session.user.role !== 'CUSTOMER') {
    throw new Error('Anda harus login sebagai pelanggan untuk memesan.')
  }
  const userId = session.user.id

  const productId = formData.get('productId') as string
  if (!productId) {
    throw new Error('Produk ID tidak ditemukan.')
  }

  try {
    const [customer, product] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.sossilverProduct.findUnique({ where: { id: productId } })
    ])

    if (!customer) {
      throw new Error('Akun pelanggan tidak ditemukan.')
    }
    if (!product) {
      throw new Error('Produk tidak ditemukan.')
    }

    const invoiceNumber = `INV-${Date.now()}`
    const totalAmount = product.hargaJual

    await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount: totalAmount,
        subTotal: totalAmount,
        shippingFee: 0,
        discountPercent: 0,
        status: 'UNPAID',

        customerName: customer.name || customer.email,
        customerPhone: null, // Asumsi
        customerAddress: null, // Asumsi

        createdById: userId, // Dibuat oleh customer sendiri
        customerId: userId, // Dimiliki oleh customer

        items: {
          create: [
            {
              productId: product.id,
              quantity: 1,
              priceAtTime: product.hargaJual,
              gramasi: product.gramasi
            }
          ]
        }
      }
    })
  } catch (error) {
    console.error('Gagal membuat order pelanggan:', error)
    throw new Error('Gagal memproses pesanan Anda.')
  }

  revalidatePath('/myaccount')
  redirect('/myaccount') // Redirect ke halaman akun setelah sukses
}

/**
 * ==========================================================
 * [SUDAH BAGUS] Aksi untuk CHECKOUT KERANJANG BELANJA
 * Dipanggil dari halaman /cart
 * Catatan: Aksi ini sudah aman, memvalidasi harga di server.
 * ==========================================================
 */
export async function checkoutAction (
  prevState: CreateInvoiceState | undefined,
  formData: FormData
): Promise<CreateInvoiceState> {
  // 1. Dapatkan sesi user
  const session = await auth()
  if (
    !session?.user ||
    !session.user.id ||
    session.user.role !== Role.CUSTOMER
  ) {
    return { status: 'error', message: 'Anda harus login untuk checkout.' }
  }
  const userId = session.user.id

  // 2. Ambil data pelanggan dari DB
  const customer = await db.user.findUnique({ where: { id: userId } })
  if (!customer) {
    return { status: 'error', message: 'Akun pelanggan tidak ditemukan.' }
  }

  // 3. Ambil 'cartItems' dari input tersembunyi
  const cartItemsJSON = formData.get('cartItems') as string
  if (!cartItemsJSON) {
    return { status: 'error', message: 'Keranjang Anda kosong.' }
  }

  let itemsInput: CartItemInput[] = []
  try {
    // Validasi input keranjang dengan Zod
    const CartItemsArraySchema = z.array(CartItemSchema)
    const parsedItems = CartItemsArraySchema.safeParse(
      JSON.parse(cartItemsJSON)
    )

    if (!parsedItems.success) {
      return { status: 'error', message: 'Data keranjang tidak valid.' }
    }
    itemsInput = parsedItems.data
    if (itemsInput.length === 0) {
      return { status: 'error', message: 'Keranjang tidak boleh kosong.' }
    }
  } catch (e) {
    return { status: 'error', message: 'Gagal memproses data keranjang.' }
  }

  // 4. Hitung ulang total di server (SANGAT PENTING)
  let subTotal = 0
  try {
    const productPrices = await Promise.all(
      itemsInput.map(item =>
        db.sossilverProduct.findUnique({
          where: { id: item.productId },
          select: { hargaJual: true, nama: true }
        })
      )
    )

    // Cocokkan harga dan hitung subtotal
    for (let i = 0; i < itemsInput.length; i++) {
      const product = productPrices[i]
      const item = itemsInput[i]
      if (!product) {
        return {
          status: 'error',
          message: `Produk ${item.productId} tidak ditemukan.`
        }
      }
      // [KEAMANAN] Gunakan harga dari DB, bukan dari client
      const priceFromDB = product.hargaJual
      subTotal += priceFromDB * item.quantity
      // [KEAMANAN] Perbarui priceAtTime di input
      item.priceAtTime = priceFromDB
    }
  } catch (error) {
    console.error('Gagal verifikasi harga produk:', error)
    return { status: 'error', message: 'Gagal memverifikasi harga produk.' }
  }

  const totalAmount = subTotal // Asumsi ongkir & diskon 0 saat checkout
  const invoiceNumber = `INV-${Date.now()}`

  // 5. Buat Invoice
  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount: totalAmount,
        subTotal: subTotal,
        shippingFee: 0,
        discountPercent: 0,
        status: 'UNPAID',

        // Data pelanggan diambil dari sesi
        customerName: customer.name || customer.email,
        customerPhone: null, // TODO: Ambil dari data user jika ada
        customerAddress: null, // TODO: Ambil dari data user jika ada

        createdById: userId,
        customerId: userId, // [PENTING] Ditautkan ke pelanggan

        // Item Invoice
        items: {
          create: itemsInput.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime, // <-- Harga aman dari DB
            gramasi: item.gramasi
          }))
        }
      }
    })

    // 6. Jika sukses
    revalidatePath('/myaccount')
    // Client akan redirect menggunakan 'invoiceId' ini
    return {
      status: 'success',
      message: 'Checkout berhasil! Silakan lakukan pembayaran.',
      invoiceId: newInvoice.id
    }
  } catch (error) {
    console.error('Gagal checkout:', error)
    return {
      status: 'error',
      message: 'Gagal memproses checkout karena kesalahan server.'
    }
  }
}
