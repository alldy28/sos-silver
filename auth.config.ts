import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  // Tentukan halaman login Anda
  pages: {
    signIn: "/login",
  },
  providers: [
    // Kita akan tambahkan provider (seperti username/password) di file auth.ts
    // Biarkan kosong di sini
  ],
  callbacks: {
    // Callback ini akan melindungi rute Anda
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        if (isLoggedIn) return true; // Izinkan jika sudah login
        return false; // Redirect ke halaman login jika belum
      } else if (isLoggedIn) {
        // Jika sudah login dan mencoba akses /login, redirect ke dashboard
        if (nextUrl.pathname === "/login") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      // Izinkan semua rute lain (seperti /verif)
      return true;
    },
  },
} satisfies NextAuthConfig;
