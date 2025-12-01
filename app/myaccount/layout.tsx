import { auth } from "@/auth"; // Impor helper auth Anda
import { db } from "@/lib/db"; // Impor Prisma client
import { redirect } from "next/navigation";
import { CreditCard, LogOut, Package, User, Users } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions"; // Impor server action logout
import { Role } from "@prisma/client";

/**
 * [REFAKTOR] Ini sekarang adalah Layout untuk semua rute /myaccount/*
 * Ini adalah Server Component (async)
 */
export default async function MyAccountLayout({
  children, // 'children' akan berisi 'page.tsx' (Transaksi, Profil, atau Pembayaran)
}: {
  children: React.ReactNode;
}) {
  // 1. Dapatkan sesi user (dilindungi oleh middleware)
  const session = await auth();

  // Middleware seharusnya sudah menangani ini, tapi sebagai pengaman ganda:
  if (!session?.user || session.user.role !== Role.CUSTOMER) {
    redirect("/login-customer");
  }

  // 2. [DIHAPUS] Logika pengambilan data transaksi dipindah ke app/myaccount/page.tsx

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Halaman */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Akun Saya
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Selamat datang kembali, {session.user.name || session.user.email}!
          </p>
        </div>
      </header>

      {/* Konten Utama (Layout 2 kolom) */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Kolom 1: Navbar Akun (Menu Samping) */}
        <aside className="md:col-span-1">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <nav className="space-y-1">
              <Link
                href="/myaccount"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Package className="w-4 h-4" />
                Order Saya
              </Link>
              <Link
                href="/myaccount/profile" // [BARU] Link ke halaman Profil
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <User className="w-4 h-4" />
                Profil Saya
              </Link>
              <Link
                href="/myaccount/payment" // [BARU] Link ke halaman Pembayaran
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <CreditCard className="w-4 h-4" />
                Metode Pembayaran
              </Link>
              <Link
                href="/myaccount/affiliate" // [BARU] Link ke halaman Pembayaran
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <Users className="w-4 h-4" />
                Dashboard Affiliate
              </Link>
              <div className="pt-2 border-t dark:border-gray-700">
                <form action={logoutAction} className="w-full">
                  <button className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </form>
              </div>
            </nav>
          </div>
        </aside>

        {/* Kolom 2: Konten Utama (Daftar Transaksi) */}
        <section className="md:col-span-3">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
            {/* [PERUBAHAN] Konten halaman (page.tsx) akan dirender di sini */}
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
