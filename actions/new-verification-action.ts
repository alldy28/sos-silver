'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
// [PERBAIKAN] Menggunakan 'lib/mail.ts' yang baru
import { sendVerificationEmail } from '@/lib/mail'

// Tipe state yang dikembalikan ke form (useActionState)
type RegisterState = {
  status: 'success' | 'error'
  message: string
}

type VerificationState = {
  status: 'success' | 'error'
  message: string
}

// Skema validasi menggunakan Zod
const RegisterSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter')
})

export async function register (
  prevState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  // 1. Validasi input
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.issues[0].message
    }
  }

  const { name, email, password } = validatedFields.data

  // 2. Enkripsi password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Cek apakah email sudah terdaftar
  try {
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { status: 'error', message: 'Email ini sudah terdaftar.' }
    }

    // 4. Buat user baru di database
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken: uuidv4() // Buat token unik
        // 'role' akan default ke 'CUSTOMER' (sesuai skema Prisma)
      }
    })

    // 5. Kirim email verifikasi
    // [PERBAIKAN] Memeriksa return value dari Nodemailer
    const emailResult = await sendVerificationEmail(
      user.email,
      user.verificationToken as string
    )

    if (!emailResult.success) {
      // Jika email gagal terkirim, kembalikan error
      // (Kita bisa biarkan user-nya di DB, mereka bisa minta kirim ulang nanti)
      return {
        status: 'error',
        message: 'Gagal mengirim email verifikasi. Silakan coba lagi nanti.'
      }
    }

    // 6. Kembalikan pesan sukses
    return {
      status: 'success',
      message: 'Email konfirmasi telah dikirim! Silakan cek inbox Anda.'
    }
  } catch (error) {
    console.error('Registrasi gagal:', error)
    return {
      status: 'error',
      message: 'Terjadi kesalahan. Gagal mendaftarkan akun.'
    }
  }
}


export async function newVerificationAction (
  token: string
): Promise<VerificationState> {
  // 1. Cek apakah token ada (meskipun client sudah cek)
  if (!token) {
    return { status: 'error', message: 'Token tidak ditemukan.' }
  }

  try {
    // 2. Cari pengguna berdasarkan token verifikasi
    const existingUser = await db.user.findUnique({
      where: {
        verificationToken: token
      }
    })

    // 3. Jika token tidak valid / tidak ditemukan
    if (!existingUser) {
      return { status: 'error', message: 'Token tidak valid atau kedaluwarsa.' }
    }

    // 4. Jika pengguna sudah terverifikasi (misal, klik link 2x)
    if (existingUser.emailVerified) {
      return { status: 'success', message: 'Akun Anda sudah terverifikasi.' }
    }

    // 5. Verifikasi pengguna dan hapus token
    // Kita update user-nya:
    // - Set 'emailVerified' dengan tanggal hari ini
    // - Set 'verificationToken' menjadi null agar tidak bisa dipakai lagi
    await db.user.update({
      where: { id: existingUser.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null // Ini penting untuk keamanan!
      }
    })

    // 6. Kembalikan pesan sukses
    return {
      status: 'success',
      message: 'Email berhasil diverifikasi! Anda sekarang bisa login.'
    }
  } catch (error) {
    console.error('Gagal verifikasi email:', error)
    return {
      status: 'error',
      message: 'Terjadi kesalahan. Gagal memverifikasi akun.'
    }
  }
}

