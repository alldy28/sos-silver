import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { db } from './lib/db'
import bcryptjs from 'bcryptjs' // Ganti ke bcryptjs
import { authConfig } from './auth.config'

type UserRole = 'ADMIN' | 'CUSTOMER'

interface DbUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  password: string
}

async function getUser (email: string): Promise<DbUser | null> {
  try {
    const user = await db.user.findUnique({ where: { email } })
    return user as DbUser | null
  } catch (error) {
    console.error('Gagal mengambil user:', error)
    throw new Error('Gagal mengambil user.')
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize (credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)

          if (!user || !user.password) return null

          // Gunakan bcryptjs.compare
          const passwordsMatch = await bcryptjs.compare(password, user.password)

          if (passwordsMatch) {
            const { password: _, ...userWithoutPassword } = user
            return userWithoutPassword
          }
        }

        console.log('Email atau password salah.')
        return null
      }
    })
  ],

  callbacks: {
    async jwt ({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as DbUser).role
      }
      return token
    },

    async session ({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  }
})
