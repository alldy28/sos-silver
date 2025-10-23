'use server'

import { db } from '@/lib/db'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

/**
 * Server Action untuk membuat kode unik
 */
export async function generateCodesAction (formData: FormData) {
  try {
    const productId = formData.get('productId') as string
    const quantity = parseInt(formData.get('quantity') as string, 10)

    // 1. Validasi input
    if (!productId) {
      return { error: 'Produk harus dipilih.' }
    }
    if (isNaN(quantity) || quantity <= 0 || quantity > 1000) {
      return { error: 'Jumlah tidak valid. (Min 1, Maks 1000).' }
    }

    // 2. Cek apakah produk ada
    const product = await db.sossilverProduct.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { error: 'Produk tidak ditemukan.' }
    }

    // 3. Buat array data kode
    const codesToCreate = []
    for (let i = 0; i < quantity; i++) {
      codesToCreate.push({
        kode: nanoid(8).toUpperCase(), // Membuat 8 digit kode acak (contoh: 'U1VVG1B8')
        productId: productId
      })
    }

    // 4. Simpan semua kode ke database dalam satu operasi
    const result = await db.generatedCode.createMany({
      data: codesToCreate,
      skipDuplicates: true // Jika (secara kebetulan) ada duplikat, lewati
    })

    // 5. Revalidasi path (refresh data)
    revalidatePath('/dashboard') // Refresh data di halaman dashboard
    revalidatePath('/dashboard/codes')

    // AMBIL HANYA KODE-NYA UNTUK DIKEMBALIKAN
    const generatedCodes = codesToCreate.map(c => ({ kode: c.kode }))

    return {
      success: `${result.count} kode unik berhasil dibuat untuk ${product.nama}.`,
      codes: generatedCodes, // <-- KEMBALIKAN KODE
      productName: product.nama // <-- KEMBALIKAN NAMA PRODUK UNTUK NAMA FILE
    }
  } catch (error) {
    console.error('Error generating codes:', error)
    return { error: 'Terjadi kesalahan pada server.' }
  }
}
