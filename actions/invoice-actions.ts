'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { SossilverProduct, Role } from '@prisma/client'
import { redirect } from 'next/navigation'
import fs from 'fs/promises'
import path from 'path'

// --- TYPES ---

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
  errors?: {
    id?: string[]
    status?: string[]
    file?: string[]
    customerPhone?: string[]
    customerAddress?: string[]
    itemsInput?: string[]
    _form?: string[]
    shippingFee?: string[]
    discountPercent?: string[]
  }
}

export type CreateInvoiceState = InvoiceState & {
  invoiceId?: string
}

// --- SCHEMAS ---

const CartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().min(1),
  priceAtTime: z.number().min(0),
  gramasi: z.number().min(0)
})

const CustomerInputSchema = z.object({
  customerName: z.string().min(1, 'Nama pelanggan wajib diisi.'),
  customerPhone: z.string().min(8, 'Nomor telepon wajib diisi.'),
  customerAddress: z.string().min(10, 'Alamat pengiriman wajib diisi.')
})

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

const MAX_FILE_SIZE = 5 * 1024 * 1024
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

const AddProofSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  file: FileSchema
})

const ConfirmPriceSchema = z.object({
  id: z.string().min(1, 'ID Invoice diperlukan.'),
  shippingFee: z.coerce.number().min(0, 'Ongkir tidak boleh negatif.'),
  discountPercent: z.coerce
    .number()
    .min(0, 'Diskon tidak boleh negatif.')
    .max(100, 'Diskon maksimal 100%.')
})

// --- HELPER FUNCTIONS ---

function isAdmin (userRole?: string): boolean {
  return userRole === Role.ADMIN || userRole === 'ADMIN'
}

function isCustomer (userRole?: string): boolean {
  return userRole === Role.CUSTOMER || userRole === 'CUSTOMER'
}

function generateInvoiceNumber (): string {
  return `INV-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)
    .toUpperCase()}`
}

function calculateTotals (
  subTotal: number,
  shippingFee: number,
  discountPercent: number
) {
  const discountAmount = (subTotal * discountPercent) / 100
  const totalAmount = Math.round(subTotal - discountAmount + shippingFee)
  return { discountAmount, totalAmount }
}

// --- SERVER ACTIONS ---

/**
 * Search products by name
 */
export async function searchProductsAction (
  query: string
): Promise<SossilverProduct[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  try {
    const products = await db.sossilverProduct.findMany({
      where: {
        nama: {
          contains: query.trim(),
          mode: 'insensitive'
        }
      },
      take: 10,
      orderBy: {
        nama: 'asc'
      }
    })
    return products
  } catch (error) {
    console.error('❌ Error searching products:', error)
    return []
  }
}

/**
 * Create invoice (Admin only)
 */
export async function createInvoiceAction (
  customer: CustomerInput,
  itemsInput: CartItemInput[],
  shippingFee: number,
  discountPercent: number
): Promise<CreateInvoiceState> {
  const session = await auth()

  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return {
      status: 'error',
      message: 'Anda harus login sebagai Admin/Staff.',
      errors: { _form: ['Akses ditolak.'] }
    }
  }

  if (!itemsInput || itemsInput.length === 0) {
    return {
      status: 'error',
      message: 'Harus ada minimal 1 item dalam invoice.',
      errors: { itemsInput: ['Tidak ada item'] }
    }
  }

  const validatedCustomer = CustomerInputSchema.safeParse(customer)
  if (!validatedCustomer.success) {
    return {
      status: 'error',
      message: 'Data pelanggan tidak lengkap.',
      errors: validatedCustomer.error.flatten().fieldErrors
    }
  }

  const { customerName, customerPhone, customerAddress } =
    validatedCustomer.data
  const invoiceNumber = generateInvoiceNumber()
  const subTotal = itemsInput.reduce(
    (acc, item) => acc + item.priceAtTime * item.quantity,
    0
  )
  const { totalAmount } = calculateTotals(
    subTotal,
    shippingFee,
    discountPercent
  )

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        subTotal,
        shippingFee,
        discountPercent,
        status: 'UNPAID',
        customerName,
        customerPhone,
        customerAddress,
        createdById: session.user.id,
        items: {
          create: itemsInput.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            gramasi: item.gramasi
          }))
        }
      },
      include: { items: true }
    })

    console.log('✅ Invoice created:', {
      id: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      totalAmount: newInvoice.totalAmount
    })

    revalidatePath('/dashboard/invoice')
    revalidateTag('invoices')

    return {
      status: 'success',
      message: 'Invoice berhasil dibuat.',
      invoiceId: newInvoice.id
    }
  } catch (error) {
    console.error('❌ Error creating invoice:', error)
    return {
      status: 'error',
      message: 'Gagal membuat invoice: Terjadi kesalahan server.'
    }
  }
}

/**
 * Get all invoices (Admin only)
 */
export async function getInvoicesAction () {
  const session = await auth()

  if (!session?.user?.id || isCustomer(session.user.role)) {
    console.warn('❌ Unauthorized access to getInvoicesAction')
    return []
  }

  try {
    const invoices = await db.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    })
    return invoices
  } catch (error) {
    console.error('❌ Error fetching invoices:', error)
    return []
  }
}

/**
 * Get invoice by ID
 */
export async function getInvoiceByIdAction (invoiceId: string) {
  if (!invoiceId || invoiceId.trim().length === 0) {
    console.error('❌ Invalid invoiceId')
    return null
  }

  const session = await auth()
  if (!session?.user) {
    console.warn('❌ No session found')
    return null
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    })

    if (!invoice) {
      console.warn('❌ Invoice not found:', invoiceId)
      return null
    }

    if (
      isCustomer(session.user.role) &&
      invoice.customerId !== session.user.id
    ) {
      console.warn('❌ Unauthorized access to invoice:', invoiceId)
      return null
    }

    return invoice
  } catch (error) {
    console.error('❌ Error fetching invoice:', error)
    return null
  }
}

/**
 * Update invoice status (Admin only)
 */
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
      message: 'Validasi gagal. Mohon periksa input Anda.',
      errors: validatedFields.error.flatten().fieldErrors
    }
  }

  const { id, status } = validatedFields.data
  const session = await auth()

  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return {
      status: 'error',
      message: 'Anda tidak memiliki izin untuk mengubah status.',
      errors: { _form: ['Akses ditolak.'] }
    }
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
      select: { id: true, status: true }
    })

    if (!invoice) {
      return { status: 'error', message: 'Invoice tidak ditemukan.' }
    }

    console.log('📝 Status update:', {
      invoiceId: id,
      oldStatus: invoice.status,
      newStatus: status,
      updatedBy: session.user.id
    })

    await db.invoice.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/dashboard/invoice')
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')
    revalidateTag(`invoice-${id}`)
    revalidateTag('invoices')

    return {
      status: 'success',
      message: 'Status invoice berhasil diperbarui.'
    }
  } catch (error) {
    console.error('❌ Error updating invoice status:', error)
    return {
      status: 'error',
      message: 'Terjadi kesalahan pada server.'
    }
  }
}

/**
 * Upload payment proof (Customer/Admin)
 * ✅ IMPROVED: Better caching with revalidateTag
 */
export async function addPaymentProofAction (
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  try {
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

    if (file.size === 0) {
      return { status: 'error', message: 'File kosong, tidak bisa diupload.' }
    }

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

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension) {
      return { status: 'error', message: 'Tipe file tidak valid.' }
    }

    const uniqueFileName = `payment-proof-${invoiceId}-${Date.now()}.${fileExtension}`
    console.log('📄 Generated filename:', uniqueFileName)

    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { paymentProofUrl: true, status: true, customerId: true }
    })

    if (!existingInvoice) {
      console.error('❌ Invoice not found:', invoiceId)
      return { status: 'error', message: 'Invoice tidak ditemukan.' }
    }

    if (
      isCustomer(session.user.role) &&
      existingInvoice.customerId !== session.user.id
    ) {
      console.error('❌ Unauthorized')
      return { status: 'error', message: 'Ini bukan invoice Anda.' }
    }

    const allowedStatuses = ['UNPAID', 'WAITING_VERIFICATION']
    if (!allowedStatuses.includes(existingInvoice.status)) {
      console.error('❌ Invalid invoice status:', existingInvoice.status)
      return {
        status: 'error',
        message: `Tidak bisa upload. Status saat ini: ${existingInvoice.status}`
      }
    }

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'payment-proofs'
    )

    try {
      await fs.mkdir(uploadDir, { recursive: true })
      console.log('📁 Upload directory ready')
    } catch (mkdirError) {
      console.error('❌ Failed to create upload directory:', mkdirError)
      return { status: 'error', message: 'Gagal membuat folder upload.' }
    }

    console.log('💾 Saving file to disk...')
    const filePath = path.join(uploadDir, uniqueFileName)

    try {
      const buffer = await file.arrayBuffer()
      await fs.writeFile(filePath, Buffer.from(buffer))
      console.log('✅ File saved to disk:', filePath)
    } catch (writeError) {
      console.error('❌ Failed to write file:', writeError)
      return { status: 'error', message: 'Gagal menyimpan file.' }
    }

    const fileUrl = `/api/uploads/uploads/payment-proofs/${uniqueFileName}`
    console.log('🔗 Generated file URL:', fileUrl)

    // Delete old file
    if (existingInvoice?.paymentProofUrl) {
      try {
        if (existingInvoice.paymentProofUrl.startsWith('/uploads/')) {
          const oldFilePath = path.join(
            process.cwd(),
            'public',
            existingInvoice.paymentProofUrl
          )
          await fs.unlink(oldFilePath)
          console.log('🗑️ Old file deleted')
        }
      } catch (delError) {
        console.warn('⚠️ Failed to delete old file:', delError)
      }
    }

    console.log('💾 Updating invoice in database...')
    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: fileUrl,
        status: 'WAITING_VERIFICATION'
      }
    })

    console.log('✅ Invoice updated')

    // ✅ IMPROVED: Better cache revalidation
    console.log('🔄 Revalidating cache...')
    revalidatePath(`/dashboard/invoice/${invoiceId}`)
    revalidatePath('/dashboard/invoice')
    revalidatePath('/myaccount')
    revalidateTag(`invoice-${invoiceId}`)
    revalidateTag('invoices')
    console.log('✅ Cache revalidated')

    return {
      status: 'success',
      message: 'Bukti bayar berhasil diupload.'
    }
  } catch (error) {
    console.error('❌ ERROR in addPaymentProofAction:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    })

    let errorMessage = 'Gagal mengupload file karena kesalahan server.'

    if (error instanceof Error) {
      if (error.message.includes('EACCES')) {
        errorMessage = 'Folder upload tidak memiliki permission.'
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Folder upload tidak ditemukan.'
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Upload timeout. Coba lagi.'
      }
    }

    return { status: 'error', message: errorMessage }
  }
}

/**
 * Quick order from customer
 */
export async function createCustomerOrderAction (
  formData: FormData
): Promise<void> {
  const session = await auth()

  if (!session?.user?.id || !isCustomer(session.user.role)) {
    throw new Error('Anda harus login sebagai pelanggan untuk memesan.')
  }

  const userId = session.user.id
  const productId = formData.get('productId') as string

  if (!productId || productId.trim().length === 0) {
    throw new Error('Produk ID tidak ditemukan.')
  }

  try {
    const [customer, product] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.sossilverProduct.findUnique({ where: { id: productId } })
    ])

    if (!customer || !product) {
      throw new Error('Data tidak ditemukan.')
    }

    const invoiceNumber = generateInvoiceNumber()

    await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount: product.hargaJual,
        subTotal: product.hargaJual,
        shippingFee: 0,
        discountPercent: 0,
        status: 'MENUNGGU_KONFIRMASI_ADMIN',
        customerName: customer.name || customer.email || 'Customer',
        customerPhone: null,
        customerAddress: null,
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

    console.log('✅ Customer order created')
    revalidatePath('/myaccount')
    revalidateTag('invoices')
  } catch (error) {
    console.error('❌ Error creating customer order:', error)
    throw new Error('Gagal memproses pesanan Anda.')
  }

  redirect('/myaccount')
}

/**
 * Checkout shopping cart
 */
export async function checkoutAction (
  prevState: CreateInvoiceState | undefined,
  formData: FormData
): Promise<CreateInvoiceState> {
  const session = await auth()

  if (!session?.user?.id || !isCustomer(session.user.role)) {
    return { status: 'error', message: 'Anda harus login untuk checkout.' }
  }

  const userId = session.user.id
  const customerData = {
    customerPhone: formData.get('customerPhone') as string,
    customerAddress: formData.get('customerAddress') as string
  }

  const validatedCustomer = CustomerInputSchema.safeParse({
    customerName: session.user.name || 'Customer',
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
  } catch {
    return { status: 'error', message: 'Gagal memproses data keranjang.' }
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
          message: `Produk dengan ID ${item.productId} tidak ditemukan.`
        }
      }

      subTotal += product.hargaJual * item.quantity
      item.priceAtTime = product.hargaJual
    }
  } catch (error) {
    console.error('❌ Error verifying product prices:', error)
    return { status: 'error', message: 'Gagal memverifikasi harga produk.' }
  }

  const invoiceNumber = generateInvoiceNumber()
  const { totalAmount } = calculateTotals(subTotal, 0, 0)

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

    console.log('✅ Checkout successful')
    revalidatePath('/myaccount')
    revalidateTag('invoices')

    return {
      status: 'success',
      message: 'Checkout berhasil! Menunggu admin mengkonfirmasi ongkir.',
      invoiceId: newInvoice.id
    }
  } catch (error) {
    console.error('❌ Error during checkout:', error)
    return {
      status: 'error',
      message: 'Gagal memproses checkout karena kesalahan server.'
    }
  }
}

/**
 * Admin confirm price with shipping fee and discount
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

  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    const invoice = await db.invoice.findUnique({
      where: { id },
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

    console.log('✅ Invoice price confirmed')

    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')
    revalidateTag(`invoice-${id}`)
    revalidateTag('invoices')

    return {
      status: 'success',
      message:
        'Total harga berhasil dikonfirmasi. Menunggu pembayaran customer.'
    }
  } catch (error) {
    console.error('❌ Error confirming price:', error)
    return { status: 'error', message: 'Gagal memperbarui database.' }
  }
}
