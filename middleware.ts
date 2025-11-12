import { auth } from './auth'
import { NextResponse } from 'next/server'


export const runtime = 'nodejs'


export default auth(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isAccessingAdminPath = nextUrl.pathname.startsWith('/dashboard')
  const isAccessingCustomerPath = nextUrl.pathname.startsWith('/myaccount')
  const loginPath = '/login'
  // const homePath = '/' // <-- Kita tidak perlu ini lagi

  if (isLoggedIn) {
    // CUSTOMER mencoba akses ADMIN
    if (userRole === 'CUSTOMER' && isAccessingAdminPath) {
      return NextResponse.redirect(new URL('/myaccount', nextUrl))
    }

    // ADMIN mencoba akses CUSTOMER
    if (userRole === 'ADMIN' && isAccessingCustomerPath) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }

    // User sudah login ke /login
    if (nextUrl.pathname === loginPath) {
      const redirectUrl = userRole === 'ADMIN' ? '/dashboard' : '/myaccount'
      return NextResponse.redirect(new URL(redirectUrl, nextUrl))
    }

    // [DIHAPUS] Blok 'if' yang me-redirect dari homepage (homePath)
    // sudah dihapus dari sini.
  } else {
    // User belum login mencoba akses protected page
    if (isAccessingAdminPath || isAccessingCustomerPath) {
      return NextResponse.redirect(new URL(loginPath, nextUrl))
    }
  }

  // Izinkan semua request lainnya (termasuk user login ke homepage)
  return NextResponse.next()
})

export const config = {
  // [PERBAIKAN] Hapus '/' dari matcher.
  // Homepage sekarang murni halaman publik dan middleware tidak perlu berjalan di sana.
  matcher: ['/dashboard/:path*', '/myaccount/:path*', '/login']
}
