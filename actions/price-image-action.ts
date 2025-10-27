'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * Server Action untuk meng-update URL gambar harga di database.
 * Ini dipanggil oleh form admin.
 */
export async function updatePriceImageUrlAction (
  prevState: { message: string; success: boolean },
  formData: FormData
): Promise<{ message: string; success: boolean }> {
  const imageUrl = formData.get('imageUrl') as string

  // Validasi URL (sederhana)
  if (!imageUrl || !imageUrl.startsWith('https://')) {
    return {
      message: 'URL tidak valid. Harus dimulai dengan https://',
      success: false
    }
  }

  try {
    // 3. Simpan URL baru ke Database
    // upsert = update jika ada, atau create jika tidak ada
    await db.priceImage.upsert({
      where: { id: 'current_price_list' },
      update: { imageUrl: imageUrl },
      create: { imageUrl: imageUrl }
    })

    // Revalidasi halaman publik agar menampilkan gambar baru
    revalidatePath('/update-harga')

    return {
      message: 'URL gambar harga berhasil diperbarui!',
      success: true
    }
  } catch (error) {
    console.error('Gagal menyimpan URL harga:', error)
    return {
      message: 'Terjadi kesalahan pada database.',
      success: false
    }
  }
}
