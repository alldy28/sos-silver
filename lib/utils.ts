import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fungsi 'cn' (opsional tapi umum digunakan dengan shadcn)
export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * [PENYEMPURNAAN]
 * Fungsi format mata uang yang lebih tangguh.
 * Menerima 'number' atau 'bigint' untuk keamanan tipe dari Prisma.
 */
export function formatCurrency (amount: number | bigint) {
  // Konversi BigInt ke Number jika perlu
  const numberAmount = typeof amount === 'bigint' ? Number(amount) : amount

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0 // Opsional: Hapus desimal
  }).format(numberAmount)
}

/**
 * [PENYEMPURNAAN]
 * Menambahkan fungsi format tanggal yang dibutuhkan oleh komponen lain.
 */
export const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
