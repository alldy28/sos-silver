'use server'

import { signOut } from '@/auth'
import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { db } from '@/lib/db'
import { addHours, isSameDay } from 'date-fns'
import z from 'zod'
import bcrypt from 'bcryptjs'
import { sendResetPasswordEmail } from '@/lib/mail'




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

// --- Forgot Password Actions ---

export type ForgotPasswordState = {
  status: 'idle' | 'success' | 'error' | 'info'
  message: string
}

const ForgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid.')
})

export async function forgotPasswordAction (
  prevState: ForgotPasswordState | undefined,
  formData: FormData
): Promise<ForgotPasswordState> {
  // ... (Validasi input & cek user tetap sama) ...
  const validatedFields = ForgotPasswordSchema.safeParse({
    email: formData.get('email')
  })

  if (!validatedFields.success) {
    return { status: 'error', message: 'Email tidak valid.' }
  }

  const { email } = validatedFields.data
  const user = await db.user.findUnique({ where: { email } })

  if (!user) {
    return {
      status: 'success',
      message: 'Jika email terdaftar, link reset telah dikirim.'
    }
  }

  // ... (Logika Rate Limiting tetap sama) ...
  const now = new Date()
  const lastAttempt = user.resetPasswordLastAttempt
  let attempts = user.resetPasswordAttempts

  if (!lastAttempt || !isSameDay(lastAttempt, now)) {
    attempts = 0
  }

  if (attempts >= 5) {
    return {
      status: 'error',
      message:
        'Batas request reset password hari ini (5x) habis. Coba lagi besok.'
    }
  }

  // --- PROSES RESET ---
  const resetToken = crypto.randomUUID()
  const expiresAt = addHours(now, 1)

  try {
    await db.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt,
        resetPasswordAttempts: attempts + 1,
        resetPasswordLastAttempt: now
      }
    })

    // [PERBAIKAN UTAMA]
    // Hapus console.log DEV ONLY, ganti dengan pengiriman email asli
    await sendResetPasswordEmail(user.email, resetToken)

    return {
      status: 'success',
      message: 'Jika email terdaftar, link reset telah dikirim ke inbox Anda.'
    }
  } catch (error) {
    console.error('Gagal reset password:', error)
    return {
      status: 'error',
      message: 'Terjadi kesalahan sistem saat mengirim email.'
    }
  }
}


// --- Reset Password Action (New) ---

export type ResetPasswordState = {
  status: 'success' | 'error' | 'info'
  message: string
}

const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token tidak ditemukan.'),
    password: z.string().min(6, 'Password minimal 6 karakter.'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Password tidak cocok.',
    path: ['confirmPassword']
  })

export async function resetPasswordAction (
  prevState: ResetPasswordState | undefined,
  formData: FormData
): Promise<ResetPasswordState> {
  const rawData = {
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword')
  }

  const validatedFields = ResetPasswordSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.issues[0].message
    }
  }

  const { token, password } = validatedFields.data

  // 1. Cari User berdasarkan Token
  // ERROR FIX: This requires 'resetPasswordToken' to be @unique in schema
  const user = await db.user.findUnique({
    where: { resetPasswordToken: token }
  })

  if (!user) {
    return {
      status: 'error',
      message: 'Token tidak valid atau sudah kedaluwarsa.'
    }
  }

  // 2. Cek apakah Token Kedaluwarsa
  if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
    return {
      status: 'error',
      message: 'Token sudah kedaluwarsa. Silakan request ulang.'
    }
  }

  // 3. Hash Password Baru (Membutuhkan bcryptjs)
  // Pastikan import bcrypt from "bcryptjs" ada di atas
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bcrypt = require('bcryptjs') // Lazy import if not at top
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // 4. Update User
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    })

    return {
      status: 'success',
      message: 'Password berhasil diubah! Silakan login dengan password baru.'
    }
  } catch (error) {
    console.error('Gagal update password:', error)
    return {
      status: 'error',
      message: 'Terjadi kesalahan saat menyimpan password.'
    }
  }
}
