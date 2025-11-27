import { auth } from './auth'
import { NextResponse } from 'next/server'

// Opsional: Konfigurasi runtime jika diperlukan
export const runtime = 'nodejs'

export default auth(req => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  const isAccessingAdminPath = nextUrl.pathname.startsWith('/dashboard')
  const isAccessingCustomerPath = nextUrl.pathname.startsWith('/myaccount')
  const loginPath = '/login'

  // --- [LOGIKA AFFILIATE] ---
  // Tangkap ?ref=... di halaman MANA SAJA
  const refCode = nextUrl.searchParams.get('ref')

  // [PENTING] Gunakan NextResponse.next() sebagai default response
  // agar kita bisa memodifikasi cookie-nya nanti jika perlu.
  const response = NextResponse.next()

  // Jika ada ref code, simpan ke cookie
  if (refCode) {
    // Buat URL tujuan tanpa parameter ref agar URL bersih (opsional)
    // Tapi di sini kita cukup set cookie pada response yang akan dikembalikan
    // Perhatikan: Jika kita melakukan redirect di bawah, kita harus
    // menempelkan cookie tersebut pada response redirect itu.

    // Cara paling aman di middleware Next.js untuk set cookie DAN redirect
    // adalah dengan membuat object response dulu.

    // Namun, karena logika di bawah ini melakukan return NextResponse.redirect(...),
    // kita harus hati-hati. Cookie hanya tersimpan jika kita me-return 'response' yang ini.

    // Strategi: Kita simpan cookie di objek response.
    // Nanti jika ada redirect, kita copy cookie-nya.
    response.cookies.set('sossilver_affiliate', refCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 Hari
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    })
  }

  // --- Logika Redirect Auth ---

  if (isLoggedIn) {
    // 1. CUSTOMER mencoba akses ADMIN -> Redirect ke /myaccount
    if (userRole === 'CUSTOMER' && isAccessingAdminPath) {
      const redirectResp = NextResponse.redirect(new URL('/myaccount', nextUrl))
      // Copy cookie affiliate jika ada (agar tidak hilang saat redirect)
      if (refCode) {
        redirectResp.cookies.set('sossilver_affiliate', refCode, {
          maxAge: 60 * 60 * 24 * 30
        })
      }
      return redirectResp
    }

    // 2. ADMIN mencoba akses CUSTOMER -> Redirect ke /dashboard
    if (userRole === 'ADMIN' && isAccessingCustomerPath) {
      const redirectResp = NextResponse.redirect(new URL('/dashboard', nextUrl))
      return redirectResp
    }

    // 3. User sudah login mencoba akses halaman login -> Redirect sesuai role
    if (nextUrl.pathname === loginPath) {
      const redirectUrl = userRole === 'ADMIN' ? '/dashboard' : '/myaccount'
      const redirectResp = NextResponse.redirect(new URL(redirectUrl, nextUrl))
      return redirectResp
    }
  } else {
    // 4. User BELUM login mencoba akses halaman yang dilindungi -> Redirect ke Login
    if (isAccessingAdminPath || isAccessingCustomerPath) {
      const redirectResp = NextResponse.redirect(new URL(loginPath, nextUrl))
      // Copy cookie affiliate jika ada (agar tersimpan walau disuruh login dulu)
      if (refCode) {
        redirectResp.cookies.set('sossilver_affiliate', refCode, {
          maxAge: 60 * 60 * 24 * 30
        })
      }
      return redirectResp
    }
  }

  // 5. Jika tidak ada redirect, kembalikan response default (yang mungkin berisi cookie affiliate)
  return response
})

export const config = {
  // Matcher menangkap semua path dashboard, myaccount, login,
  // DAN juga halaman publik agar tracking affiliate berjalan.
  // Kita mengecualikan file statis (_next, api, favicon) agar efisien.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
