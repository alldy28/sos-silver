// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Fungsi 'cn' (opsional tapi umum digunakan dengan shadcn)
export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// [PERBAIKAN] Utilitas format mata uang yang lebih standar
export function formatCurrency (amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0 // Opsional: Hapus desimal
  }).format(amount)
}
