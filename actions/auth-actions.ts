'use server'

import { signOut } from '@/auth'
import { signIn } from '@/auth' // Impor dari auth.ts
import { AuthError } from 'next-auth'

// [PERBAIKAN 1] Tipe state didefinisikan secara lokal, TIDAK DI-EKSPOR
type LoginState = {
  status: 'info' | 'error' | 'success'
  message: string
}

// [PERBAIKAN 2] 'initialState' DIHAPUS DARI SINI
// Pindahkan ke file 'login-form.tsx'

/**
 * Fungsi ini akan dipanggil oleh form login
 * [PERBAIKAN 3] Ganti nama 'authenticate' -> 'loginAction'
 * dan perbarui parameter/return type
 */
export async function loginAction (
  prevState: LoginState, // <-- Diperbarui
  formData: FormData
): Promise<LoginState> {
  // <-- Diperbarui
  try {
    // Coba login menggunakan provider 'credentials'
    await signIn('credentials', formData)

    // Jika signIn berhasil, middleware akan me-redirect.
    // Kode ini mungkin tidak akan tercapai, tapi sebagai fallback.
    return { status: 'success', message: 'Login berhasil.' }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          // [PERBAIKAN 4] Kembalikan objek LoginState
          return { status: 'error', message: 'Email atau password salah.' }
        default:
          // [PERBAIKAN 4] Kembalikan objek LoginState
          return { status: 'error', message: 'Terjadi kesalahan. Coba lagi.' }
      }
    }
    // Jika error bukan dari NextAuth, lempar lagi agar ditangani
    throw error
  }
}

export async function logoutAction () {
  // Panggil signOut dari file terpisah
  await signOut({ redirectTo: '/login' })
}
