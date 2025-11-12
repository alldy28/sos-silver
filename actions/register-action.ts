'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid' // Untuk generate token
import { sendVerificationEmail } from '@/lib/mail'

// Skema validasi menggunakan Zod
const RegisterSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  name: z.string().min(1, { message: 'Nama wajib diisi.' })
})

// Tipe state yang dikembalikan
type RegisterState =
  | {
      status: 'success' | 'error'
      message: string
    }
  | undefined

export async function registerAction (
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  // 1. Validasi input
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      status: 'error',
      // [PERBAIKAN] 'errors' diganti menjadi 'issues'
      message: validatedFields.error.issues[0].message
    }
  }

  const { name, email, password } = validatedFields.data

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // 3. Cek apakah user sudah ada
  const existingUser = await db.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    // Jika user ada TAPI belum verifikasi, kita bisa kirim ulang email
    if (!existingUser.emailVerified) {
      const verificationToken = uuidv4()
      await db.user.update({
        where: { email },
        data: { verificationToken }
      })
      await sendVerificationEmail(existingUser.email, verificationToken)
      return {
        status: 'success',
        message:
          'Email sudah terdaftar. Kami telah mengirim ulang link aktivasi.'
      }
    }
    // Jika sudah terdaftar DAN terverifikasi
    return { status: 'error', message: 'Email ini sudah digunakan.' }
  }

  // 4. Buat user baru dan token verifikasi
  const verificationToken = uuidv4()
  try {
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        role: 'CUSTOMER' // Otomatis set sebagai CUSTOMER
      }
    })

    // 5. Kirim email verifikasi
    await sendVerificationEmail(email, verificationToken)

    return {
      status: 'success',
      message: 'Email konfirmasi telah dikirim! Silakan cek inbox Anda.'
    }
  } catch (error) {
    console.error('Gagal membuat user:', error)
    return { status: 'error', message: 'Terjadi kesalahan. Gagal mendaftar.' }
  }
}
