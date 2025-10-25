import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { db } from './lib/db'
import bcrypt from 'bcrypt'
import { authConfig } from './auth.config'

// Fungsi helper untuk mengambil user
async function getUser (email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } })
    return user
  } catch (error) {
    console.error('Gagal mengambil user:', error)
    throw new Error('Gagal mengambil user.')
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true, // Add this line
  basePath: '/api/auth',
  providers: [
    Credentials({
      async authorize (credentials) {
        // Validasi input menggunakan Zod
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)
          if (!user) return null // User tidak ditemukan

          // Cocokkan password
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user
        }

        // Jika kredensial salah
        console.log('Email atau password salah.')
        return null
      }
    })
  ],
  session: {
    // Gunakan JWT (JSON Web Tokens) untuk sesi
    strategy: 'jwt'
  }
})