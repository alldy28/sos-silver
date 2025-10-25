'use server'

import { signOut } from "@/auth";
import { signIn } from '@/auth' // Impor dari auth.ts
import { AuthError } from 'next-auth'

// Fungsi ini akan dipanggil oleh form login
export async function authenticate (
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // Coba login menggunakan provider 'credentials'
    await signIn('credentials', formData)
    return // Jika sukses, redirect akan ditangani oleh middleware
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email atau password salah.'
        default:
          return 'Terjadi kesalahan. Coba lagi.'
      }
    }
    // Jika error bukan dari NextAuth, lempar lagi
    throw error
  }
}

export async function logoutAction () {
  // Panggil signOut dari file terpisah
  await signOut({ redirectTo: '/login' })
}

