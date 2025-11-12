// Di file: /next-auth.d.ts (atau /types/next-auth.d.ts)

import { type DefaultSession } from 'next-auth'
import { JWT } from 'next-auth/jwt'

// Definisikan tipe peran (role) Anda
type UserRole = 'ADMIN' | 'CUSTOMER'

// Perluas tipe 'JWT'
declare module 'next-auth/jwt' {
  interface JWT {
    /** Menambahkan 'role' dan 'id' ke token */
    role?: UserRole
    id?: string
  }
}

// Perluas tipe 'Session' dan 'User'
declare module 'next-auth' {
  interface Session {
    user: {
      /** Menambahkan 'role' dan 'id' ke sesi pengguna */
      role?: UserRole
      id?: string
    } & DefaultSession['user'] // Gabungkan dengan tipe 'user' default
  }

  // Perluas tipe 'User' dasar jika perlu
  interface User {
    /** Menambahkan 'role' ke objek 'user' */
    role?: UserRole
  }
}
