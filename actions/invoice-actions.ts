'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { put, del } from '@vercel/blob'
import { z } from 'zod'
import { SossilverProduct, Role } from '@prisma/client'
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
    id?: string[]
    status?: string[]
    file?: string[]
    // [PERBAIKAN] Menghapus 'customer' dan menambahkan field spesifik
    customerPhone?: string[]
    customerAddress?: string[]
    // Akhir perbaikan
    itemsInput?: string[]
    _form?: string[]
    shippingFee?: string[]
    discountPercent?: string[]
  }
}

export type CreateInvoiceState = InvoiceState & {
  invoiceId?: string
}

// --- Skema Zod ---

const CartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().min(1),
  priceAtTime: z.number().min(0),
  gramasi: z.number().min(0)
})

// [PERBAIKAN] Menambah validasi phone dan address di CustomerInput
const CustomerInputSchema = z.object({
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi.'),
  customerPhone: z.string().min(8, 'Nomor telepon wajib diisi.'),
  customerAddress: z.string().min(10, 'Alamat pengiriman wajib diisi.')
})

// [PENYEMPURNAAN] Skema untuk update status (semua status)
const StatusEnum = z.enum([
  'PAID',
  'UNPAID',
  'CANCELLED',
  'WAITING_VERIFICATION',
  'SEDANG_DISIAPKAN',
  'SEDANG_PENGIRIMAN',
  'SELESAI',
  'MENUNGGU_KONFIRMASI_ADMIN'
])

const UpdateStatusSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  status: StatusEnum
})

// Skema untuk upload file
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

// Skema untuk form upload bukti
const AddProofSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  file: FileSchema
})

// [SKEMA BARU] Skema untuk form konfirmasi harga oleh admin
const ConfirmPriceSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  shippingFee: z.coerce.number().min(0, 'Ongkir tidak boleh negatif.'),
  discountPercent: z.coerce
    .number()
    .min(0, 'Diskon tidak boleh negatif.')
    .max(100, 'Diskon maksimal 100%.')
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
 */
export async function createInvoiceAction (
  customer: CustomerInput,
  itemsInput: CartItemInput[],
  shippingFee: number,
  discountPercent: number
): Promise<CreateInvoiceState> {
  // [PERBAIKAN] Gunakan CustomerInputSchema baru jika diperlukan validasi ketat
  // Kita abaikan validasi Zod karena ini dipanggil dari form kasir yang datanya sudah siap

  const { customerName, customerPhone, customerAddress } = customer

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

  const subTotal = itemsInput.reduce(
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
        status: 'UNPAID', // Kasir langsung 'UNPAID'
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
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
    return {
      status: 'error',
      message: 'Gagal membuat invoice: Terjadi kesalahan server.'
    }
  }
}

/**
 * Mengambil semua invoice (Hanya Admin)
 */
export async function getInvoicesAction () {
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
 */
export async function getInvoiceByIdAction (invoiceId: string) {
  // [PERBAIKAN] Cek jika ID tidak ada (untuk menghindari error "id: undefined")
  if (!invoiceId) {
    return null
  }

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

    // Cek kepemilikan jika role-nya CUSTOMER
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
 * Mengubah status invoice (Aksi Admin)
 */
export async function updateInvoiceStatusAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  const receivedStatus = formData.get('status')

  const validatedFields = UpdateStatusSchema.safeParse({
    id: formData.get('id'),
    status: receivedStatus
  })

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Validasi gagal. Mohon periksa input Anda.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id, status } = validatedFields.data

  const session = await auth()
  if (session?.user?.role === Role.CUSTOMER) {
    return {
      status: 'error',
      message: 'Anda tidak memiliki izin untuk mengubah status.',
      errors: { _form: ['Akses ditolak.'] }
    }
  }

  try {
    await db.invoice.update({
      where: { id: id },
      data: { status: status }
    })

    revalidatePath('/dashboard/invoice')
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')

    return {
      status: 'success',
      message: 'Status invoice berhasil diperbarui.',
      errors: {}
    }
  } catch (error) {
    console.error('Error updating invoice status:', error)
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
 * Upload bukti bayar (Aksi Customer/Admin)
 */
export async function addPaymentProofAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  try {
    // 1. Validasi input
    const validatedFields = AddProofSchema.safeParse({
      id: formData.get('id'),
      file: formData.get('file')
    })

    if (!validatedFields.success) {
      console.error('❌ Validation failed:', validatedFields.error.flatten())
      return {
        status: 'error',
        message: 'Validasi gagal.',
        errors: validatedFields.error.flatten().fieldErrors
      }
    }

    const { id: invoiceId, file } = validatedFields.data

    // 2. Cek authentication
    const session = await auth()
    if (!session?.user) {
      console.error('❌ No session/user found')
      return { status: 'error', message: 'Anda harus login.' }
    }

    console.log('📝 Upload attempt:', {
      invoiceId,
      userId: session.user.id,
      userRole: session.user.role,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    // 3. Validasi file
    if (file.size === 0) {
      return { status: 'error', message: 'File kosong, tidak bisa diupload.' }
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return {
        status: 'error',
        message: `File terlalu besar. Maksimal 5MB, file Anda: ${(
          file.size /
          1024 /
          1024
        ).toFixed(2)}MB`
      }
    }

    // 4. Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const uniqueFileName = `payment-proof-${invoiceId}-${Date.now()}.${fileExtension}`
    console.log('📄 Generated filename:', uniqueFileName)

    // 5. Cek invoice existence
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { paymentProofUrl: true, status: true, customerId: true }
    })

    if (!existingInvoice) {
      console.error('❌ Invoice not found:', invoiceId)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }
    }

    console.log('✅ Invoice found:', {
      invoiceId,
      status: existingInvoice.status,
      customerId: existingInvoice.customerId,
      hasPaymentProof: !!existingInvoice.paymentProofUrl
    })

    // 6. Cek otorisasi: Admin boleh, Customer hanya milik sendiri
    if (
      session.user.role === Role.CUSTOMER &&
      existingInvoice.customerId !== session.user.id
    ) {
      console.error('❌ Unauthorized:', {
        userId: session.user.id,
        customerId: existingInvoice.customerId
      })
      return { status: 'error', message: 'Ini bukan invoice Anda.' }
    }

    // 7. Cek status invoice
    const allowedStatuses = ['UNPAID', 'WAITING_VERIFICATION']
    if (!allowedStatuses.includes(existingInvoice.status)) {
      console.error('❌ Invalid invoice status:', existingInvoice.status)
      return {
        status: 'error',
        message: `Tidak bisa upload. Status invoice saat ini: ${existingInvoice.status}. Harap tunggu konfirmasi admin.`
      }
    }

    // 8. Hapus file lama jika ada
    if (existingInvoice?.paymentProofUrl) {
      try {
        console.log('🗑️ Deleting old file:', existingInvoice.paymentProofUrl)
        await del(existingInvoice.paymentProofUrl)
        console.log('✅ Old file deleted successfully')
      } catch (delError) {
        console.warn('⚠️ Failed to delete old file:', delError)
        // Jangan return error, lanjut upload file baru
      }
    }

    // 9. Upload file ke Vercel Blob
    console.log('🚀 Starting upload to Vercel Blob...')
    console.log('- BLOB token exists:', !!process.env.BLOB_READ_WRITE_TOKEN)
    console.log('- NODE_ENV:', process.env.NODE_ENV)

    const blob = await put(uniqueFileName, file, {
      access: 'public'
    })

    console.log('✅ File uploaded successfully:', blob.url)

    // 10. Update database
    console.log('💾 Updating invoice in database...')
    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: blob.url,
        status: 'WAITING_VERIFICATION'
      }
    })

    console.log('✅ Invoice updated:', {
      invoiceId: updatedInvoice.id,
      paymentProofUrl: updatedInvoice.paymentProofUrl,
      status: updatedInvoice.status
    })

    // 11. Revalidate paths
    console.log('🔄 Revalidating paths...')
    revalidatePath(`/dashboard/invoice/${invoiceId}`)
    revalidatePath('/dashboard/invoice')
    revalidatePath('/myaccount')
    console.log('✅ Paths revalidated')

    return {
      status: 'success',
      message: 'Bukti bayar berhasil diupload.'
    }
  } catch (error) {
    // 12. Comprehensive error handling
    console.error('❌ ERROR in addPaymentProofAction:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error
    })

    // Specific error messages
    let errorMessage = 'Gagal mengupload file karena kesalahan server.'

    if (error instanceof Error) {
      if (error.message.includes('BLOB_READ_WRITE_TOKEN')) {
        errorMessage = 'Konfigurasi server tidak lengkap (BLOB token missing).'
      } else if (error.message.includes('timeout')) {
        errorMessage =
          'Upload timeout. Coba lagi atau gunakan file yang lebih kecil.'
      } else if (error.message.includes('network')) {
        errorMessage = 'Masalah koneksi. Periksa internet Anda dan coba lagi.'
      } else if (error.message.includes('unauthorized')) {
        errorMessage = 'Akses ditolak. Token mungkin expired atau invalid.'
      }
    }

    return {
      status: 'error',
      message: errorMessage
    }
  }
}


/**
 * ==========================================================
 * [DIPERBARUI] Aksi "Beli Cepat" dari sisi PELANGGAN
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
    const totalAmount = product.hargaJual // Total Awal

    await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount: totalAmount,
        subTotal: totalAmount,
        shippingFee: 0,
        discountPercent: 0,

        // [PERBAIKAN UTAMA] Status awal adalah MENUNGGU_KONFIRMASI_ADMIN
        status: 'MENUNGGU_KONFIRMASI_ADMIN',

        customerName: customer.name || customer.email,
        customerPhone: null, // Asumsi
        customerAddress: null, // Asumsi

        createdById: userId,
        customerId: userId,

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
  redirect('/myaccount')
}

/**
 * ==========================================================
 * [DIPERBARUI] Aksi untuk CHECKOUT KERANJANG BELANJA
 * ==========================================================
 */
export async function checkoutAction (
  prevState: CreateInvoiceState | undefined,
  formData: FormData
): Promise<CreateInvoiceState> {
  const session = await auth()
  if (
    !session?.user ||
    !session.user.id ||
    session.user.role !== Role.CUSTOMER
  ) {
    return { status: 'error', message: 'Anda harus login untuk checkout.' }
  }
  const userId = session.user.id

  // 1. Ambil dan validasi data pengiriman
  const customerData = {
    customerPhone: formData.get('customerPhone'),
    customerAddress: formData.get('customerAddress')
  }

  const validatedCustomer = CustomerInputSchema.safeParse({
    customerName: session.user.name, // Ambil dari sesi
    ...customerData
  })

  if (!validatedCustomer.success) {
    return {
      status: 'error',
      message: 'Mohon lengkapi detail pengiriman.',
      errors: validatedCustomer.error.flatten().fieldErrors
    }
  }

  const customer = await db.user.findUnique({ where: { id: userId } })
  if (!customer) {
    return { status: 'error', message: 'Akun pelanggan tidak ditemukan.' }
  }

  const cartItemsJSON = formData.get('cartItems') as string
  if (!cartItemsJSON) {
    return { status: 'error', message: 'Keranjang Anda kosong.' }
  }

  let itemsInput: CartItemInput[] = []
  try {
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return { status: 'error', message: 'Gagal memproses data keranjang.' }
  }

  // 4. Hitung ulang total di server
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

    for (let i = 0; i < itemsInput.length; i++) {
      const product = productPrices[i]
      const item = itemsInput[i]
      if (!product) {
        return {
          status: 'error',
          message: `Produk ${item.productId} tidak ditemukan.`
        }
      }
      const priceFromDB = product.hargaJual
      subTotal += priceFromDB * item.quantity
      item.priceAtTime = priceFromDB
    }
  } catch (error) {
    console.error('Gagal verifikasi harga produk:', error)
    return { status: 'error', message: 'Gagal memverifikasi harga produk.' }
  }

  const totalAmount = subTotal // Total Awal (sebelum ongkir)
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

        status: 'MENUNGGU_KONFIRMASI_ADMIN',

        customerName: customer.name || customer.email,
        // [PERBAIKAN] Simpan data pengiriman dari form
        customerPhone: validatedCustomer.data.customerPhone,
        customerAddress: validatedCustomer.data.customerAddress,

        createdById: userId,
        customerId: userId,

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

    revalidatePath('/myaccount')
    return {
      status: 'success',
      message: 'Checkout berhasil! Menunggu admin mengkonfirmasi ongkir.',
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

/**
 * ==========================================================
 * [AKSI BARU] Untuk Admin mengkonfirmasi Ongkir & Diskon
 * ==========================================================
 */
export async function confirmInvoicePriceAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  // 1. Validasi Input
  const validatedFields = ConfirmPriceSchema.safeParse({
    id: formData.get('id'),
    shippingFee: formData.get('shippingFee'),
    discountPercent: formData.get('discountPercent')
  })

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Validasi gagal.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id, shippingFee, discountPercent } = validatedFields.data

  // Otorisasi Admin
  const session = await auth()
  if (!session?.user || session.user.role !== Role.ADMIN) {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    // 2. Ambil data invoice (terutama subTotal)
    const invoice = await db.invoice.findUnique({
      where: { id: id },
      select: { subTotal: true, status: true }
    })

    if (!invoice) {
      return { status: 'error', message: 'Invoice tidak ditemukan.' }
    }

    if (invoice.status !== 'MENUNGGU_KONFIRMASI_ADMIN') {
      return {
        status: 'error',
        message: 'Invoice ini tidak sedang menunggu konfirmasi.'
      }
    }

    // 3. Hitung ulang Total Akhir
    const subTotal = invoice.subTotal
    const discountAmount = (subTotal * discountPercent) / 100
    // Pastikan operasi float aman
    const totalAmount = Math.round(subTotal - discountAmount + shippingFee)

    // 4. Update Invoice di Database
    await db.invoice.update({
      where: { id: id },
      data: {
        shippingFee: shippingFee,
        discountPercent: discountPercent,
        totalAmount: totalAmount,
        status: 'UNPAID' // <-- Status diubah ke UNPAID (Siap dibayar customer)
      }
    })

    // 5. Revalidasi & Sukses
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount') // Agar customer juga melihat update

    return {
      status: 'success',
      message:
        'Total harga berhasil dikonfirmasi. Menunggu pembayaran customer.'
    }
  } catch (error) {
    console.error('Gagal konfirmasi harga:', error)
    return { status: 'error', message: 'Gagal memperbarui database.' }
  }
}
