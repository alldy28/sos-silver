'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


/**
 * Server Action untuk membuat produk baru.
 * Fungsi ini berjalan di server, aman untuk database.
 */
export async function createProductAction (formData: FormData) {
  // 1. Ambil dan validasi data dari FormData
  const nama = formData.get('nama') as string
  const series = (formData.get('series') as string) || null
  const gambarUrl = (formData.get('gambarUrl') as string) || null
  const gramasi = parseFloat(formData.get('gramasi') as string)
  const fineness = parseInt(formData.get('fineness') as string)
  const hargaJual = parseInt(formData.get('hargaJual') as string)
  const hargaBuyback = parseInt(formData.get('hargaBuyback') as string)
  const tahunPembuatan = parseInt(formData.get('tahunPembuatan') as string)

  // Validasi sederhana (bisa Anda kembangkan)
  if (!nama || isNaN(gramasi) || isNaN(hargaJual)) {
    throw new Error('Nama, Gramasi, dan Harga Jual wajib diisi.')
  }

  // 2. Simpan ke database menggunakan Prisma
  try {
    await db.sossilverProduct.create({
      data: {
        nama,
        series,
        gambarUrl,
        gramasi,
        fineness,
        hargaJual,
        hargaBuyback,
        tahunPembuatan
      }
    })
  } catch (error) {
    console.error('Gagal membuat produk:', error)
    // Handle error (misal: jika 'nama' unik sudah ada)
    throw new Error('Gagal menyimpan produk ke database.')
  }

  // 3. Revalidasi cache & Redirect
  // Beri tahu Next.js untuk me-refresh data di halaman ini
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/products')

  // Arahkan pengguna kembali ke halaman daftar produk
  redirect('/dashboard/products') // Kita akan buat halaman /products selanjutnya
}


export async function deleteProductAction (formData: FormData) {
  // Ambil 'productId' dari data form
  const productId = formData.get('productId') as string

  if (!productId) {
    throw new Error('Product ID tidak valid.')
  }

  // 2. Hapus dari database menggunakan Prisma
  try {
    await db.sossilverProduct.delete({
      where: { id: productId }
    })
  } catch (error) {
    console.error('Gagal menghapus produk:', error)
    // Handle error
    throw new Error('Gagal menghapus produk dari database.')
  }

  // 3. Revalidasi cache
  // Beri tahu Next.js untuk me-refresh data di halaman ini
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/products')
}

export async function updateProductAction (formData: FormData) {
  // 1. Ambil ID dan data lain dari FormData
  const id = formData.get('productId') as string
  const nama = formData.get('nama') as string
  const series = (formData.get('series') as string) || null
  const gambarUrl = (formData.get('gambarUrl') as string) || null
  const gramasi = parseFloat(formData.get('gramasi') as string)
  const fineness = parseInt(formData.get('fineness') as string)
  const hargaJual = parseInt(formData.get('hargaJual') as string)
  const hargaBuyback = parseInt(formData.get('hargaBuyback') as string)
  const tahunPembuatan = parseInt(formData.get('tahunPembuatan') as string)

  if (!id) {
    throw new Error('Product ID tidak ditemukan.')
  }

  // 2. Update data di database
  try {
    await db.sossilverProduct.update({
      where: { id: id },
      data: {
        nama,
        series,
        gambarUrl,
        gramasi,
        fineness,
        hargaJual,
        hargaBuyback,
        tahunPembuatan
      }
    })
  } catch (error) {
    console.error('Gagal meng-update produk:', error)
    throw new Error('Gagal meng-update produk di database.')
  }

  // 3. Revalidasi cache & Redirect
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/products')
  revalidatePath(`/dashboard/products/edit/${id}`)

  // Arahkan pengguna kembali ke halaman daftar produk
  redirect('/dashboard/products')
}



