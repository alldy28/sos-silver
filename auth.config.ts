import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  // Tentukan halaman login Anda (Sudah Benar)
  pages: {
    signIn: '/login',
  },
  providers: [
    // Biarkan kosong, provider (Credentials) akan ditangani di file auth.ts
  ],
  callbacks: {
    /**
     * Callback 'jwt' dipanggil SAAT token dibuat (yaitu saat login).
     * Apapun yang Anda kembalikan di sini akan disimpan di dalam token (cookie).
     */
    jwt({ token, user }) {
      if (user) {
        // 'user' object hanya tersedia saat login.
        // Kita tambahkan ID, nama, dan email dari database ke dalam token.
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token; // Token ini yang disimpan
    },

    /**
     * Callback 'session' dipanggil SAAT sesi dibaca (yaitu saat memanggil await auth()).
     * Kita mengambil data dari 'token' (yang sudah kita isi di atas) dan
     * memasukkannya ke object 'session.user' agar bisa diakses di Server Actions.
     */
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
      }
      return session;
    },

    // Callback 'authorized' Anda (Sudah Benar)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true; // Izinkan jika sudah login
        return false; // Redirect ke halaman login jika belum
      } else if (isLoggedIn) {
        // Jika sudah login dan mencoba akses /login, redirect ke dashboard
        if (nextUrl.pathname === '/login') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      // Izinkan semua rute lain (seperti /, /verif, /update-harga)
      return true;
    },
  },
} satisfies NextAuthConfig;
