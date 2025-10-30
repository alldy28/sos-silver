'use server'

import { db } from '@/lib/db'
import { PromoSlide } from '@prisma/client'
import { revalidatePath } from 'next/cache'

// --- Tipe Data ---
// Tipe untuk hasil return dari Server Action (state)
export type ActionResult = {
  success: boolean
  message: string
  slide?: PromoSlide // Kembalikan slide yang baru dibuat (untuk reset form)
  error?: {
    field?: 'imageUrl' | 'destinationUrl' | 'order'
    message: string
  } | null
}
// -----------------

/**
 * Aksi untuk membuat slide promo baru
 * DIUBAH: Menerima 'FormData' sebagai argumen kedua
 */
export async function createPromoSlideAction (
  // Tipe state sebelumnya (digunakan oleh useActionState)
  prevState: ActionResult,
  // Data dari form (sekarang FormData)
  formData: FormData
): Promise<ActionResult> {
  // 1. Validasi Input (Parsing manual dari FormData)
  // Buat objek data dari FormData
  const data = {
    imageUrl: formData.get('imageUrl') as string,
    destinationUrl: (formData.get('destinationUrl') as string) || null,
    order: parseInt(formData.get('order') as string, 10),
    isActive: formData.get('isActive') === 'true'
  }

  // Validasi URL Gambar
  if (!data.imageUrl) {
    return {
      success: false,
      message: 'Input tidak valid.',
      error: { field: 'imageUrl', message: 'URL Gambar wajib diisi.' }
    }
  }
  if (
    !data.imageUrl.startsWith('http://') &&
    !data.imageUrl.startsWith('https://')
  ) {
    return {
      success: false,
      message: 'Input tidak valid.',
      error: { field: 'imageUrl', message: 'URL Gambar tidak valid.' }
    }
  }

  // Validasi URL Tujuan (jika ada)
  if (
    data.destinationUrl &&
    !data.destinationUrl.startsWith('http://') &&
    !data.destinationUrl.startsWith('https://')
  ) {
    return {
      success: false,
      message: 'Input tidak valid.',
      error: { field: 'destinationUrl', message: 'URL Tujuan tidak valid.' }
    }
  }

  // Validasi Urutan
  if (isNaN(data.order) || data.order <= 0) {
    return {
      success: false,
      message: 'Input tidak valid.',
      error: { field: 'order', message: 'Urutan harus angka lebih dari 0.' }
    }
  }

  // 2. Proses ke Database
  try {
    const newSlide = await db.promoSlide.create({
      data: {
        imageUrl: data.imageUrl,
        destinationUrl: data.destinationUrl,
        order: data.order,
        isActive: data.isActive
      }
    })

    // 3. Revalidasi Path (refresh data)
    revalidatePath('/dashboard/promo') // Refresh halaman admin
    revalidatePath('/') // Refresh homepage

    // 4. Kembalikan data sukses
    return {
      success: true,
      message: 'Slide promo baru berhasil ditambahkan.',
      slide: newSlide // Kirim kembali slide baru agar form bisa di-reset
    }
  } catch (error) {
    console.error('Gagal membuat slide promo:', error)
    return {
      success: false,
      message: 'Gagal menyimpan ke database.',
      error: { message: 'Terjadi kesalahan server.' }
    }
  }
}

/**
 * Aksi untuk menghapus slide promo
 */
export async function deletePromoSlideAction (
  slideId: string
): Promise<ActionResult> {
  if (!slideId) {
    return {
      success: false,
      message: 'ID Slide tidak ditemukan.',
      error: { message: 'ID Slide tidak ditemukan.' }
    }
  }

  try {
    await db.promoSlide.delete({
      where: { id: slideId }
    })

    revalidatePath('/dashboard/promo')
    revalidatePath('/')

    return { success: true, message: 'Slide berhasil dihapus.' }
  } catch (error) {
    console.error('Gagal menghapus slide:', error)
    return {
      success: false,
      message: 'Gagal menghapus slide.',
      error: { message: 'Terjadi kesalahan server.' }
    }
  }
}

/**
 * Aksi untuk mengubah status (Aktif/Nonaktif)
 */
export async function togglePromoSlideAction (
  slideId: string,
  currentStatus: boolean
): Promise<ActionResult> {
  if (!slideId) {
    return {
      success: false,
      message: 'ID Slide tidak ditemukan.',
      error: { message: 'ID Slide tidak ditemukan.' }
    }
  }

  try {
    await db.promoSlide.update({
      where: { id: slideId },
      data: {
        isActive: !currentStatus // Balikkan status
      }
    })

    revalidatePath('/dashboard/promo')
    revalidatePath('/')

    return { success: true, message: 'Status slide berhasil diubah.' }
  } catch (error) {
    console.error('Gagal mengubah status slide:', error)
    return {
      success: false,
      message: 'Gagal mengubah status.',
      error: { message: 'Terjadi kesalahan server.' }
    }
  }
}
