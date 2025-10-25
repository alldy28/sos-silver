import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// Inisialisasi NextAuth dengan config Anda
export default NextAuth(authConfig).auth

// Tentukan rute mana yang ingin Anda lindungi
export const config = {
  matcher: [
    // Lindungi semua rute di dalam dashboard
    '/dashboard/:path*',
    // Lindungi halaman login (untuk redirect jika sudah login)
    '/login'
  ]
}
