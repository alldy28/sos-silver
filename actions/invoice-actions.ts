'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { put, del } from '@vercel/blob'
import { z } from 'zod'
import { Prisma, SossilverProduct, Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers' // [PENTING] Untuk membaca cookie affiliate

// --- Tipe Data & Interface ---

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

// Tipe State untuk useActionState
export type InvoiceState = {
  status: 'success' | 'error' | 'info'
  message: string
  errors?: Record<string, string[] | undefined>
}

export type CreateInvoiceState = InvoiceState & {
  invoiceId?: string
}

// --- Skema Validasi Zod ---

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

const UpdateStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum([
    'PAID',
    'UNPAID',
    'CANCELLED',
    'WAITING_VERIFICATION',
    'SEDANG_DISIAPKAN',
    'SEDANG_PENGIRIMAN',
    'SELESAI',
    'MENUNGGU_KONFIRMASI_ADMIN'
  ])
})

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
 * 1. Cari Produk (Untuk Kasir Admin & Pencarian Umum)
 */
export async function searchProductsAction (
  query: string
): Promise<SossilverProduct[]> {
  if (!query) return []
  try {
    const products = await db.sossilverProduct.findMany({
      where: {
        nama: { contains: query, mode: 'insensitive' }
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
 * 2. Buat Invoice (KASIR ADMIN)
 * - Menghitung total di server
 * - Tidak ada affiliate (karena dibuat admin)
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
  if (!session?.user?.id) {
    return { status: 'error', message: 'Anda harus login.' }
  }
  const userId = session.user.id

  // Hitung total
  const subTotal = items.reduce(
    (acc, item) => acc + item.priceAtTime * item.quantity,
    0
  )
  const discountAmount = (subTotal * discountPercent) / 100
  const totalAmount = subTotal - discountAmount + shippingFee
  const invoiceNumber = `INV-${Date.now()}`

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        subTotal, // [PENTING] Simpan subTotal
        shippingFee,
        discountPercent, // [PENTING] Simpan diskon
        status: 'UNPAID',
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        customerAddress: customerInfo.customerAddress,
        createdById: userId,
        items: {
          create: items.map(item => ({
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
    return { status: 'error', message: 'Gagal membuat invoice.' }
  }
}

/**
 * 3. Ambil Semua Invoice (List)
 */
export async function getInvoicesAction () {
  try {
    const invoices = await db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: true,
        items: { include: { product: true } }
      }
    })
    return invoices
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return []
  }
}

/**
 * 4. Ambil Detail Invoice by ID
 */
export async function getInvoiceByIdAction (invoiceId: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        createdBy: true,
        items: { include: { product: true } },
        commission: true // Cek apakah sudah ada komisi
      }
    })
    return invoice
  } catch (error) {
    console.error('Error fetching invoice by ID:', error)
    return null
  }
}

/**
 * 5. CHECKOUT CUSTOMER (KERANJANG BELANJA)
 * - Membaca cookie affiliate
 * - Menyimpan affiliateId
 * - Verifikasi harga produk dari DB
 */
export async function checkoutAction (
  prevState: CreateInvoiceState | undefined,
  formData: FormData
): Promise<CreateInvoiceState> {
  // 1. Cek Login Pelanggan
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'CUSTOMER') {
    return { status: 'error', message: 'Anda harus login untuk checkout.' }
  }
  const userId = session.user.id

  // 2. Ambil data pelanggan
  const customer = await db.user.findUnique({ where: { id: userId } })
  if (!customer) {
    return { status: 'error', message: 'Akun pelanggan tidak ditemukan.' }
  }

  // 3. [AFFILIATE] Cek Cookie (Next.js 15 fix: await cookies())
  const cookieStore = await cookies()
  const affiliateCode = cookieStore.get('sossilver_affiliate')?.value
  let affiliateId = null

  if (affiliateCode) {
    const affiliateUser = await db.user.findUnique({
      where: { affiliateCode: affiliateCode }
    })
    // Pastikan tidak mereferensikan diri sendiri
    if (affiliateUser && affiliateUser.id !== userId) {
      affiliateId = affiliateUser.id
    }
  }

  // 4. Ambil Item Keranjang
  const cartItemsJSON = formData.get('cartItems') as string
  if (!cartItemsJSON) {
    return { status: 'error', message: 'Keranjang kosong.' }
  }

  let itemsInput: CartItemInput[] = []
  try {
    itemsInput = JSON.parse(cartItemsJSON)
    if (itemsInput.length === 0) throw new Error()
  } catch {
    return { status: 'error', message: 'Data keranjang tidak valid.' }
  }

  // 5. Hitung Total & Verifikasi Harga
  let subTotal = 0
  try {
    // Ambil harga terbaru dari DB untuk keamanan
    const productPrices = await Promise.all(
      itemsInput.map(item =>
        db.sossilverProduct.findUnique({
          where: { id: item.productId },
          select: { hargaJual: true, gramasi: true }
        })
      )
    )

    for (let i = 0; i < itemsInput.length; i++) {
      const product = productPrices[i]
      const item = itemsInput[i]

      if (!product) {
        return {
          status: 'error',
          message: `Produk ID ${item.productId} tidak ditemukan.`
        }
      }

      // Gunakan harga & gramasi dari DB
      subTotal += product.hargaJual * item.quantity
      item.priceAtTime = product.hargaJual
      item.gramasi = product.gramasi
    }
  } catch (error) {
    return { status: 'error', message: 'Gagal memverifikasi harga produk.' }
  }

  const totalAmount = subTotal // Ongkir & diskon 0 di awal
  const invoiceNumber = `INV-${Date.now()}`

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        subTotal, // [PENTING] Simpan subTotal
        shippingFee: 0,
        discountPercent: 0,
        status: 'MENUNGGU_KONFIRMASI_ADMIN', // Status awal checkout
        customerName: customer.name || customer.email || 'Customer',
        customerPhone: (formData.get('customerPhone') as string) || null, // Ambil dari form
        customerAddress: (formData.get('customerAddress') as string) || null, // Ambil dari form
        createdById: userId,
        customerId: userId,

        // [AFFILIATE] Simpan ID Affiliate
        affiliateId: affiliateId,

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
      message: 'Checkout berhasil! Menunggu konfirmasi admin.',
      invoiceId: newInvoice.id
    }
  } catch (error) {
    console.error('Gagal checkout:', error)
    return { status: 'error', message: 'Gagal memproses checkout.' }
  }
}

/**
 * 6. UPDATE STATUS & HITUNG KOMISI AFFILIATE
 * - Admin mengubah status
 * - Jika SELESAI -> Hitung komisi 1.2%
 */
export async function updateInvoiceStatusAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  // 1. Validasi Input
  const validatedFields = UpdateStatusSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status')
  })

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: 'Validasi gagal.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id, status } = validatedFields.data

  // 2. Cek Hak Akses Admin
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    // 3. Ambil data invoice lama
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
      include: { commission: true } // Cek komisi lama
    })

    if (!existingInvoice) {
      return { status: 'error', message: 'Invoice tidak ditemukan.' }
    }

    // 4. Update Status
    await db.invoice.update({
      where: { id },
      data: { status }
    })

    // 5. [LOGIKA KOMISI AFFILIATE]
    // Syarat: Status SELESAI (atau PAID), ada Affiliate, dan belum ada komisi tercatat
    if (
      (status === 'SELESAI' || status === 'PAID') &&
      existingInvoice.affiliateId &&
      !existingInvoice.commission
    ) {
      // Hitung 1.2% dari Subtotal (Harga barang saja, tanpa ongkir)
      const commissionAmount = Math.floor(existingInvoice.subTotal * 0.012)

      if (commissionAmount > 0) {
        await db.affiliateCommission.create({
          data: {
            amount: commissionAmount,
            percentage: 1.2,
            affiliateId: existingInvoice.affiliateId,
            invoiceId: existingInvoice.id
          }
        })
        console.log(`💰 Komisi Rp${commissionAmount} dibuat untuk affiliate.`)
      }
    }

    revalidatePath('/dashboard/invoice')
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')
    revalidateTag('invoices')

    return {
      status: 'success',
      message: `Status diperbarui menjadi ${status}. Komisi dihitung jika berlaku.`
    }
  } catch (error) {
    console.error('Error update status:', error)
    return { status: 'error', message: 'Gagal memperbarui status.' }
  }
}

/**
 * 7. Konfirmasi Harga (Admin mengisi Ongkir & Diskon)
 */
export async function confirmInvoicePriceAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
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
  const session = await auth()

  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      select: { subTotal: true, status: true }
    })

    if (!invoice)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }

    // Hitung total baru
    const discountAmount = (invoice.subTotal * discountPercent) / 100
    const totalAmount = Math.round(
      invoice.subTotal - discountAmount + shippingFee
    )

    await db.invoice.update({
      where: { id },
      data: {
        shippingFee,
        discountPercent,
        totalAmount,
        status: 'UNPAID' // Kembalikan ke UNPAID agar user bisa bayar
      }
    })

    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')

    return {
      status: 'success',
      message: 'Harga dikonfirmasi. Menunggu pembayaran customer.'
    }
  } catch (error) {
    console.error('Error confirming price:', error)
    return { status: 'error', message: 'Gagal memperbarui database.' }
  }
}

/**
 * 8. Upload Bukti Bayar
 */
export async function addPaymentProofAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  const file = formData.get('file') as File
  const invoiceId = formData.get('id') as string

  // Validasi File
  if (!file || file.size === 0)
    return { status: 'error', message: 'File wajib diisi.' }
  if (file.size > 5 * 1024 * 1024)
    return { status: 'error', message: 'Max 5MB.' }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
    return { status: 'error', message: 'Format file tidak didukung.' }
  }

  try {
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { paymentProofUrl: true, status: true }
    })

    if (!existingInvoice)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }

    // Hapus file lama jika ada
    if (existingInvoice.paymentProofUrl) {
      try {
        await del(existingInvoice.paymentProofUrl)
      } catch (e) {}
    }

    // Upload ke Vercel Blob
    const filename = `proof-${invoiceId}-${Date.now()}.${ext}`
    const blob = await put(filename, file, { access: 'public' })

    // Update DB
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: blob.url,
        status: 'WAITING_VERIFICATION'
      }
    })

    revalidatePath(`/dashboard/invoice/${invoiceId}`)
    revalidatePath('/myaccount')

    return { status: 'success', message: 'Bukti bayar berhasil diupload.' }
  } catch (error) {
    console.error('Upload error:', error)
    return { status: 'error', message: 'Gagal upload file.' }
  }
}

/**
 * 9. Beli Cepat (Customer - Direct Order)
 * - Mencegah self-referral
 */
export async function createCustomerOrderAction (
  formData: FormData
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'CUSTOMER') {
    throw new Error('Login diperlukan.')
  }
  const userId = session.user.id
  const productId = formData.get('productId') as string

  // [AFFILIATE] Cek Cookie untuk Beli Cepat (Next.js 15 fix)
  const cookieStore = await cookies()
  const affiliateCode = cookieStore.get('sossilver_affiliate')?.value
  let affiliateId = null

  if (affiliateCode) {
    const affiliateUser = await db.user.findUnique({ where: { affiliateCode } })

    // [PENTING] Logika Pencegahan Self-Referral
    if (affiliateUser && affiliateUser.id !== userId) {
      affiliateId = affiliateUser.id
    }
  }

  try {
    const [customer, product] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.sossilverProduct.findUnique({ where: { id: productId } })
    ])

    if (!product || !customer) throw new Error('Data invalid.')

    await db.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        totalAmount: product.hargaJual,
        subTotal: product.hargaJual,
        shippingFee: 0,
        discountPercent: 0,
        status: 'UNPAID', // Atau MENUNGGU_KONFIRMASI jika perlu ongkir
        customerName: customer.name || customer.email || 'Customer',
        createdById: userId,
        customerId: userId,

        // [AFFILIATE] Simpan ID
        affiliateId: affiliateId,

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
    throw new Error('Gagal memproses pesanan.')
  }
  redirect('/myaccount')
}
