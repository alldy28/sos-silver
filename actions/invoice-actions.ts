'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
// Hapus put dan del dari @vercel/blob karena kita pakai fs
// import { put, del } from "@vercel/blob";
import { z } from 'zod'
import { Prisma, SossilverProduct, Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import fs from 'fs/promises'
import path from 'path'

// ... (Interface & Tipe Data TETAP SAMA) ...
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

export type InvoiceState = {
  status: 'success' | 'error' | 'info'
  message: string
  errors?: Record<string, string[] | undefined>
}

export type CreateInvoiceState = InvoiceState & {
  invoiceId?: string
}

// ... (Skema Zod TETAP SAMA) ...
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
  shippingFee: z.coerce
    .number()
    .min(0, 'Ongkir tidak boleh negatif.')
    .default(0),
  discountPercent: z.coerce
    .number()
    .min(0, 'Diskon tidak boleh negatif.')
    .max(100, 'Diskon maksimal 100%.')
    .default(0)
})

// --- Helper Functions ---
function calculateTotals (
  subTotal: number,
  shippingFee: number,
  discountPercent: number
) {
  const discountAmount = (subTotal * discountPercent) / 100
  const totalAmount = Math.round(subTotal - discountAmount + shippingFee)
  return { discountAmount, totalAmount }
}

function generateInvoiceNumber (): string {
  return `INV-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`
}

// --- SERVER ACTIONS ---

// ... (searchProductsAction TETAP SAMA) ...
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

// ... (createInvoiceAction TETAP SAMA) ...
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

  const subTotal = items.reduce(
    (acc, item) => acc + item.priceAtTime * item.quantity,
    0
  )
  const { totalAmount } = calculateTotals(
    subTotal,
    shippingFee,
    discountPercent
  )
  const invoiceNumber = generateInvoiceNumber()

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        subTotal,
        shippingFee,
        discountPercent,
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

// ... (getInvoicesAction TETAP SAMA) ...
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

// ... (getInvoiceByIdAction TETAP SAMA) ...
export async function getInvoiceByIdAction (invoiceId: string) {
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        createdBy: true,
        items: { include: { product: true } },
        commission: true
      }
    })
    return invoice
  } catch (error) {
    console.error('Error fetching invoice by ID:', error)
    return null
  }
}

// ... (checkoutAction TETAP SAMA) ...
export async function checkoutAction (
  prevState: CreateInvoiceState | undefined,
  formData: FormData
): Promise<CreateInvoiceState> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'CUSTOMER') {
    return { status: 'error', message: 'Anda harus login untuk checkout.' }
  }
  const userId = session.user.id

  const customer = await db.user.findUnique({ where: { id: userId } })
  if (!customer) {
    return { status: 'error', message: 'Akun pelanggan tidak ditemukan.' }
  }

  const cookieStore = await cookies()
  const affiliateCode = cookieStore.get('sossilver_affiliate')?.value
  let affiliateId: string | null = null

  if (affiliateCode) {
    const affiliateUser = await db.user.findUnique({
      where: { affiliateCode: affiliateCode }
    })
    if (affiliateUser && affiliateUser.id !== userId) {
      affiliateId = affiliateUser.id
    }
  }

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

  let subTotal = 0
  try {
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

      subTotal += product.hargaJual * item.quantity
      item.priceAtTime = product.hargaJual
      item.gramasi = product.gramasi
    }
  } catch (error) {
    return { status: 'error', message: 'Gagal memverifikasi harga produk.' }
  }

  const { totalAmount } = calculateTotals(subTotal, 0, 0)
  const invoiceNumber = generateInvoiceNumber()

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        subTotal,
        shippingFee: 0,
        discountPercent: 0,
        status: 'MENUNGGU_KONFIRMASI_ADMIN',
        customerName: customer.name || customer.email || 'Customer',
        customerPhone: (formData.get('customerPhone') as string) || null,
        customerAddress: (formData.get('customerAddress') as string) || null,
        createdById: userId,
        customerId: userId,
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

// ... (updateInvoiceStatusAction TETAP SAMA) ...
export async function updateInvoiceStatusAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
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
  const session = await auth()
  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    const existingInvoice = await db.invoice.findUnique({
      where: { id },
      include: { commission: true }
    })
    if (!existingInvoice)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }

    await db.invoice.update({ where: { id }, data: { status } })

    if (
      (status === 'SELESAI' || status === 'PAID') &&
      existingInvoice.affiliateId &&
      !existingInvoice.commission
    ) {
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
      }
    }

    revalidatePath('/dashboard/invoice')
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')
    revalidateTag('invoices')

    return {
      status: 'success',
      message: `Status diperbarui menjadi ${status}.`
    }
  } catch (error) {
    console.error('Error update status:', error)
    return { status: 'error', message: 'Gagal memperbarui status.' }
  }
}

// ... (confirmInvoicePriceAction TETAP SAMA) ...
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

  if (!session?.user?.id || session.user.role !== Role.ADMIN) {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      select: { subTotal: true, status: true }
    })

    if (!invoice)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }

    const { totalAmount } = calculateTotals(
      invoice.subTotal,
      shippingFee,
      discountPercent
    )

    await db.invoice.update({
      where: { id },
      data: {
        shippingFee,
        discountPercent,
        totalAmount,
        status: 'UNPAID'
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

// =======================================================
// 8. Upload Bukti Bayar (DIPERBAIKI: Menggunakan File System)
// =======================================================
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
    // Cek invoice
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { paymentProofUrl: true, status: true, customerId: true }
    })

    if (!existingInvoice)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }

    // Cek permission (jika customer, harus miliknya sendiri)
    const session = await auth()
    if (
      session?.user?.role === 'CUSTOMER' &&
      existingInvoice.customerId !== session.user.id
    ) {
      return { status: 'error', message: 'Bukan invoice Anda.' }
    }

    // --- PROSES UPLOAD LOKAL (Local File System) ---

    // 1. Buat nama file unik
    const uniqueFileName = `proof-${invoiceId}-${Date.now()}.${ext}`

    // 2. Tentukan direktori tujuan: public/uploads/payment-proofs
    // (process.cwd() adalah root project Anda)
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'payment-proofs'
    )

    // 3. Pastikan folder ada, jika tidak buat foldernya
    try {
      await fs.mkdir(uploadDir, { recursive: true })
    } catch (err) {
      console.error('Gagal membuat direktori upload:', err)
      return {
        status: 'error',
        message: 'Gagal menyiapkan folder penyimpanan.'
      }
    }

    // 4. Konversi file ke Buffer dan tulis ke disk
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, uniqueFileName)
    await fs.writeFile(filePath, buffer)

    // 5. Buat URL publik (Path relatif dari folder 'public')
    // Ini yang akan disimpan di database
    const fileUrl = `/api/uploads/uploads/payment-proofs/${uniqueFileName}`
    console.log('🔗 Generated file URL:', fileUrl)

    // 6. Hapus file lama jika ada (untuk menghemat ruang)
    if (
      existingInvoice.paymentProofUrl &&
      existingInvoice.paymentProofUrl.startsWith('/uploads/')
    ) {
      try {
        // Gabungkan root project + path file lama
        const oldFilePath = path.join(
          process.cwd(),
          'public',
          existingInvoice.paymentProofUrl
        )
        await fs.unlink(oldFilePath)
      } catch (e) {
        console.warn('Gagal menghapus file bukti lama:', e)
      }
    }
    // ---------------------------------------------

    // Update Database
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: fileUrl, // Simpan path relatif
        status: 'WAITING_VERIFICATION'
      }
    })

    // Revalidasi Cache
    revalidatePath(`/dashboard/invoice/${invoiceId}`)
    revalidatePath('/myaccount')
    revalidateTag(`invoice-${invoiceId}`)

    return { status: 'success', message: 'Bukti bayar berhasil diupload.' }
  } catch (error) {
    console.error('Upload error:', error)
    return { status: 'error', message: 'Gagal upload file.' }
  }
}

// ... (createCustomerOrderAction TETAP SAMA) ...
export async function createCustomerOrderAction (
  formData: FormData
): Promise<void> {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== 'CUSTOMER') {
    throw new Error('Login diperlukan.')
  }
  const userId = session.user.id
  const productId = formData.get('productId') as string

  const cookieStore = await cookies()
  const affiliateCode = cookieStore.get('sossilver_affiliate')?.value
  let affiliateId: string | null = null

  if (affiliateCode) {
    const affiliateUser = await db.user.findUnique({ where: { affiliateCode } })
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
        status: 'UNPAID',
        customerName: customer.name || customer.email || 'Customer',
        createdById: userId,
        customerId: userId,
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
