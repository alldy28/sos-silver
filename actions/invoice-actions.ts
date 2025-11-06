'use server'

import { db } from '@/lib/db'
import { auth } from '@/auth' // Impor auth untuk mendapatkan ID admin
import { revalidatePath } from 'next/cache'
import { put, del } from '@vercel/blob' // Pastikan 'del' diimpor

// Tipe data untuk item di keranjang (dari sisi klien)
export interface CartItemInput {
  productId: string
  quantity: number
  priceAtTime: number
  gramasi: number
}

// Tipe data untuk info pelanggan
export interface CustomerInput {
  customerName: string
  customerPhone: string
  customerAddress: string
}

interface CustomerData {
  customerName: string
  customerPhone: string
  customerAddress: string
}

/**
 * Aksi untuk mencari produk berdasarkan nama
 */
export async function searchProductsAction (query: string) {
  if (!query) {
    return []
  }
  try {
    const products = await db.sossilverProduct.findMany({
      where: {
        nama: {
          contains: query,
          mode: 'insensitive' // Tidak case-sensitive
        }
      },
      take: 10 // Batasi 10 hasil
    })
    return products
  } catch (error) {
    console.error('Gagal mencari produk:', error)
    return []
  }
}

/**
 * ==========================================================
 * Aksi untuk membuat Invoice baru (TELAH DISESUAIKAN)
 * ==========================================================
 */
export async function createInvoiceAction (
  customer: CustomerData, // 1.
  itemsInput: CartItemInput[], // 2.
  subTotal: number, // 3. <-- DISESUAIKAN
  shippingFee: number, // 4.
  discountPercent: number = 0, // 5. <-- DISESUAIKAN
  totalAmount: number // 6.
) {
  // 1. Dapatkan sesi user yang sedang login
  const session = await auth()
  if (!session?.user?.id) {
    return {
      success: false,
      message: 'Anda harus login untuk membuat invoice.'
    }
  }
  const userId = session.user.id

  // 2. Buat nomor invoice unik
  const invoiceNumber = `INV-${Date.now()}`

  try {
    const newInvoice = await db.invoice.create({
      data: {
        invoiceNumber,

        // Data Keuangan
        subTotal: subTotal, // <-- DISIMPAN
        shippingFee: shippingFee,
        discountPercent: discountPercent, // <-- DISIMPAN
        totalAmount: totalAmount,
        status: 'UNPAID', // <-- Status awal

        // Data Pelanggan
        customerName: customer.customerName,
        customerPhone: customer.customerPhone,
        customerAddress: customer.customerAddress,

        createdById: userId, // Tautkan ke user yang membuat

        // Item Invoice
        items: {
          create: itemsInput.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtTime: item.priceAtTime,
            gramasi: item.gramasi // <-- DISIMPAN
          }))
        }
      }
    })

    // Revalidasi path agar halaman list ter-update
    revalidatePath('/dashboard/invoice')

    return {
      success: true,
      message: 'Invoice berhasil dibuat.',
      invoiceId: newInvoice.id
    }
  } catch (error) {
    console.error('Gagal membuat invoice:', error)
    return { success: false, message: 'Gagal membuat invoice.' }
  }
}

/**
 * Mengambil semua invoice
 */
export async function getInvoicesAction () {
  try {
    const invoices = await db.invoice.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        items: {
          // Kita tetap perlu 'items' untuk menampilkannya di list
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
  try {
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })
    return invoice
  } catch (error) {
    console.error('Error fetching invoice by ID:', error)
    return null
  }
}

/**
 * Mengubah status invoice (misal: PAID, CANCELLED)
 */
export async function updateInvoiceStatusAction (
  invoiceId: string,
  newStatus: 'PAID' | 'UNPAID' | 'CANCELLED'
) {
  try {
    await db.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus } // Asumsi ada field 'status' di model Invoice
    })

    // Revalidasi path agar halaman detail dan list menampilkan data terbaru
    revalidatePath('/dashboard/invoice')
    revalidatePath(`/dashboard/invoice/${invoiceId}`)

    return { success: true, message: 'Status invoice berhasil diperbarui.' }
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return { success: false, message: 'Gagal memperbarui status.' }
  }
}

/**
 * ==========================================================
 * Upload bukti bayar (TELAH DISESUAIKAN)
 * - Sekarang menghapus file lama sebelum upload
 * ==========================================================
 */
export async function uploadPaymentProofAction (
  invoiceId: string,
  formData: FormData
) {
  const file = formData.get('paymentProof') as File

  if (!file || file.size === 0) {
    return { success: false, message: 'File tidak ditemukan.' }
  }

  // Validasi (Opsional tapi direkomendasikan)
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      message: 'Tipe file tidak valid (JPG, PNG, WEBP).'
    }
  }

  const fileExtension = file.name.split('.').pop()
  const uniqueFileName = `payment-proof-${invoiceId}-${Date.now()}.${fileExtension}`

  try {
    // 1. Cek & Hapus file lama jika ada
    const existingInvoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      select: { paymentProofUrl: true }
    })

    if (existingInvoice?.paymentProofUrl) {
      try {
        await del(existingInvoice.paymentProofUrl)
      } catch (delError) {
        console.warn('Gagal menghapus file lama:', delError)
        // Tidak perlu menghentikan proses, lanjutkan upload
      }
    }

    // 2. Upload file baru ke Vercel Blob
    const blob = await put(uniqueFileName, file, {
      access: 'public' // Jadikan file bisa diakses publik
    })

    // 3. Update database dengan URL file baru
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentProofUrl: blob.url,
        status: 'PAID' // Otomatis ubah status jadi PAID setelah upload
      }
    })

    // 4. Revalidasi path
    revalidatePath(`/dashboard/invoice/${invoiceId}`)
    revalidatePath('/dashboard/invoice')

    return {
      success: true,
      message: 'Bukti bayar berhasil diupload.',
      url: blob.url
    }
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return { success: false, message: 'Gagal mengupload file.' }
  }
}
