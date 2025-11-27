'use server'

import { signOut } from '@/auth'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { db } from '@/lib/db'

// [PERBAIKAN] Definisikan tipe state sebagai objek, bukan string
export type LoginState =
  | {
      status: 'success' | 'error' | 'info'
      message: string
    }
  | undefined

/**
 * Server Action untuk Login
 */
export async function loginAction (
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    const email = formData.get('email') as string
    const callbackUrl = formData.get('callbackUrl') as string

    // 1. Tentukan URL Tujuan Default
    let redirectUrl = '/myaccount' // Default untuk customer

    // 2. Cek apakah ada 'callbackUrl' (Misal: dari halaman produk/affiliate)
    // Jika ada, INI MENANG. Kita prioritaskan ini.
    if (callbackUrl && callbackUrl !== 'null' && callbackUrl !== 'undefined') {
      redirectUrl = callbackUrl
    } else {
      // 3. Jika TIDAK ada callbackUrl, baru kita cek Role untuk menentukan dashboard
      // Kita perlu fetch user sebentar untuk tahu role-nya
      const user = await db.user.findUnique({ where: { email } })
      if (user?.role === 'ADMIN') {
        redirectUrl = '/dashboard'
      }
    }

    // 4. Lakukan Sign In dengan URL yang sudah ditentukan
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: redirectUrl // <-- Next-Auth akan menggunakan ini
    })

    // Jika signIn berhasil, biasanya akan melempar error redirect.
    // Jika sampai di sini (jarang terjadi untuk redirect), kita kembalikan sukses.
    return { status: 'success', message: 'Login berhasil.' }
  } catch (error: unknown) {
    // Cek error redirect (ini tanda sukses di Next.js)
    if (
      typeof error === 'object' &&
      error !== null &&
      'digest' in error &&
      typeof (error as { digest: string }).digest === 'string' &&
      (error as { digest: string }).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw error
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { status: 'error', message: 'Email atau Password salah.' }
        case 'CallbackRouteError':
          if (error.cause?.err?.message === 'ACCOUNT_NOT_VERIFIED') {
            return {
              status: 'error',
              message: 'Akun Anda belum diaktivasi. Silakan cek email Anda.'
            }
          }
          return { status: 'error', message: 'Terjadi kesalahan pada server.' }
        default:
          return {
            status: 'error',
            message: 'Terjadi kesalahan. Silakan coba lagi.'
          }
      }
    }

    console.error('Login Error:', error)
    return { status: 'error', message: 'Terjadi kesalahan internal.' }
  }
}

export async function logoutAction () {
  await signOut()
}
