'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { SossilverProduct, Role } from '@prisma/client'
import { redirect } from 'next/navigation'

import fs from 'fs/promises'
import path from 'path'


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

// --- Skema Zod ---

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

/**
 * Cek apakah user adalah admin
 */
function isAdmin(userRole?: string): boolean {
  return userRole === Role.ADMIN || userRole === 'ADMIN'
}

/**
 * Cek apakah user adalah customer
 */
function isCustomer(userRole?: string): boolean {
  return userRole === Role.CUSTOMER || userRole === 'CUSTOMER'
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(): string {
  return `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

/**
 * Calculate invoice totals
 */
function calculateTotals(
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
 * Aksi untuk mencari produk berdasarkan nama
 */
export async function searchProductsAction(
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
 * Aksi untuk membuat Invoice baru (dari KASIR ADMIN)
 */
export async function createInvoiceAction(
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

  const userId = session.user.id

  // Validasi input
  if (!itemsInput || itemsInput.length === 0) {
    return {
      status: 'error',
      message: 'Harus ada minimal 1 item dalam invoice.',
      errors: { itemsInput: ['Tidak ada item'] }
    }
  }

  // Validasi customer data
  const validatedCustomer = CustomerInputSchema.safeParse(customer)
  if (!validatedCustomer.success) {
    return {
      status: 'error',
      message: 'Data pelanggan tidak lengkap.',
      errors: validatedCustomer.error.flatten().fieldErrors
    }
  }

  const { customerName, customerPhone, customerAddress } = validatedCustomer.data
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
        createdById: userId,
        items: {
          create: itemsInput.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            gramasi: item.gramasi
          }))
        }
      },
      include: {
        items: true
      }
    })

    console.log('✅ Invoice created:', {
      id: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      totalAmount: newInvoice.totalAmount
    })

    revalidatePath('/dashboard/invoice')

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
 * Mengambil semua invoice (Hanya Admin)
 */
export async function getInvoicesAction() {
  const session = await auth()

  if (!session?.user?.id || isCustomer(session.user.role)) {
    console.warn('❌ Unauthorized access to getInvoicesAction')
    return []
  }

  try {
    const invoices = await db.invoice.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
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
 * Mengambil satu invoice berdasarkan ID
 */
export async function getInvoiceByIdAction(invoiceId: string) {
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
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!invoice) {
      console.warn('❌ Invoice not found:', invoiceId)
      return null
    }

    // Cek kepemilikan jika role-nya CUSTOMER
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
 * Mengubah status invoice (Aksi Admin)
 */
export async function updateInvoiceStatusAction(
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
      return {
        status: 'error',
        message: 'Invoice tidak ditemukan.'
      }
    }

    // Log perubahan status
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

    return {
      status: 'success',
      message: 'Status invoice berhasil diperbarui.'
    }
  } catch (error) {
    console.error('❌ Error updating invoice status:', error)
    return {
      status: 'error',
      message: 'Terjadi kesalahan pada server. Gagal memperbarui status.'
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
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension) {
      return { status: 'error', message: 'Tipe file tidak valid.' }
    }

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

    // 6. Cek otorisasi
    if (
      isCustomer(session.user.role) &&
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

    // 8. Setup upload directory
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'payment-proofs'
    )

    try {
      await fs.mkdir(uploadDir, { recursive: true })
      console.log('📁 Upload directory ready:', uploadDir)
    } catch (mkdirError) {
      console.error('❌ Failed to create upload directory:', mkdirError)
      return { status: 'error', message: 'Gagal membuat folder upload.' }
    }

    // 9. Save file ke disk
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

    // 10. Generate file URL
    const fileUrl = `/uploads/payment-proofs/${uniqueFileName}`
    console.log('🔗 Generated file URL:', fileUrl)

    // 11. Delete old file jika ada
    if (existingInvoice?.paymentProofUrl) {
      try {
        // Jika URL adalah local path
        if (existingInvoice.paymentProofUrl.startsWith('/uploads/')) {
          const oldFilePath = path.join(
            process.cwd(),
            'public',
            existingInvoice.paymentProofUrl
          )
          await fs.unlink(oldFilePath)
          console.log('🗑️ Old file deleted:', oldFilePath)
        }
      } catch (delError) {
        console.warn('⚠️ Failed to delete old file:', delError)
        // Lanjut, jangan stop
      }
    }

    // 12. Update database
    console.log('💾 Updating invoice in database...')
    const updatedInvoice = await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: fileUrl,
        status: 'WAITING_VERIFICATION'
      }
    })

    console.log('✅ Invoice updated:', {
      invoiceId: updatedInvoice.id,
      paymentProofUrl: updatedInvoice.paymentProofUrl,
      status: updatedInvoice.status
    })

    // 13. Revalidate paths
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
    console.error('❌ ERROR in addPaymentProofAction:', {
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    let errorMessage = 'Gagal mengupload file karena kesalahan server.'

    if (error instanceof Error) {
      if (error.message.includes('EACCES')) {
        errorMessage = 'Folder upload tidak memiliki permission. Hubungi admin.'
      } else if (error.message.includes('ENOENT')) {
        errorMessage = 'Folder upload tidak ditemukan.'
      } else if (error.message.includes('timeout')) {
        errorMessage =
          'Upload timeout. Coba lagi atau gunakan file yang lebih kecil.'
      }
    }

    return {
      status: 'error',
      message: errorMessage
    }
  }
}


/**
 * Aksi "Beli Cepat" dari sisi PELANGGAN
 */
export async function createCustomerOrderAction(formData: FormData): Promise<void> {
  const session = await auth()

  if (
    !session?.user?.id ||
    !isCustomer(session.user.role)
  ) {
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

    if (!customer) {
      throw new Error('Akun pelanggan tidak ditemukan.')
    }

    if (!product) {
      throw new Error('Produk tidak ditemukan.')
    }

    const invoiceNumber = generateInvoiceNumber()
    const totalAmount = product.hargaJual

    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,
        totalAmount,
        subTotal: totalAmount,
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

    console.log('✅ Customer order created:', {
      id: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      customerId: userId
    })

    revalidatePath('/myaccount')
  } catch (error) {
    console.error('❌ Error creating customer order:', error)
    throw new Error('Gagal memproses pesanan Anda.')
  }

  redirect('/myaccount')
}

/**
 * Aksi untuk CHECKOUT KERANJANG BELANJA
 */
export async function checkoutAction(
  prevState: CreateInvoiceState | undefined,
  formData: FormData
): Promise<CreateInvoiceState> {
  const session = await auth()

  if (
    !session?.user?.id ||
    !isCustomer(session.user.role)
  ) {
    return { status: 'error', message: 'Anda harus login untuk checkout.' }
  }

  const userId = session.user.id

  // 1. Validasi data pengiriman
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

  // 2. Ambil data customer
  const customer = await db.user.findUnique({ where: { id: userId } })
  if (!customer) {
    return { status: 'error', message: 'Akun pelanggan tidak ditemukan.' }
  }

  // 3. Validasi cart items
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

  // 4. Verifikasi harga produk dari database
  let subTotal = 0
  try {
    const productPrices = await Promise.all(
      itemsInput.map(item =>
        db.sossilverProduct.findUnique({
          where: { id: item.productId },
          select: { hargaJual: true, nama: true, gramasi: true }
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

      const priceFromDB = product.hargaJual
      subTotal += priceFromDB * item.quantity
      item.priceAtTime = priceFromDB
    }
  } catch (error) {
    console.error('❌ Error verifying product prices:', error)
    return { status: 'error', message: 'Gagal memverifikasi harga produk.' }
  }

  const invoiceNumber = generateInvoiceNumber()
  const { totalAmount } = calculateTotals(subTotal, 0, 0)

  // 5. Buat Invoice
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

    console.log('✅ Checkout successful:', {
      id: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
      customerId: userId,
      itemCount: itemsInput.length,
      totalAmount
    })

    revalidatePath('/myaccount')

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
 * Aksi untuk Admin mengkonfirmasi Ongkir & Diskon
 */
export async function confirmInvoicePriceAction(
  prevState: InvoiceState,
  formData: FormData
): Promise<InvoiceState> {
  // 1. Validasi input
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

  // 2. Otorisasi Admin
  const session = await auth()
  if (!session?.user?.id || !isAdmin(session.user.role)) {
    return { status: 'error', message: 'Akses ditolak.' }
  }

  try {
    // 3. Ambil data invoice
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

    // 4. Hitung ulang total
    const { totalAmount } = calculateTotals(
      invoice.subTotal,
      shippingFee,
      discountPercent
    )

    // 5. Update invoice
    await db.invoice.update({
      where: { id },
      data: {
        shippingFee,
        discountPercent,
        totalAmount,
        status: 'UNPAID'
      }
    })

    console.log('✅ Invoice price confirmed:', {
      id,
      shippingFee,
      discountPercent,
      totalAmount,
      confirmedBy: session.user.id
    })

    // 6. Revalidate
    revalidatePath(`/dashboard/invoice/${id}`)
    revalidatePath('/myaccount')

    return {
      status: 'success',
      message: 'Total harga berhasil dikonfirmasi. Menunggu pembayaran customer.'
    }
  } catch (error) {
    console.error('Gagal konfirmasi harga:', error)
    return { status: 'error', message: 'Gagal memperbarui database.' }
  }
}
