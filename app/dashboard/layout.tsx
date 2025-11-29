"use client"; // Diperlukan untuk usePathname (Highlight menu aktif)

import { logoutAction } from "@/actions/auth-actions";
import {
  PowerIcon,
  HomeIcon,
  ShoppingCartIcon,
  ClipboardListIcon,
  PackageIcon,
  MenuIcon,
  BarChart3,
  Package,
  Wallet,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Hook untuk cek URL aktif
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

// Konfigurasi Menu Navigasi
const navLinks = [
  {
    href: "/dashboard",
    icon: HomeIcon,
    label: "Dashboard",
  },
  {
    href: "/dashboard/kasir",
    icon: ShoppingCartIcon,
    label: "Kasir",
  },
  {
    href: "/dashboard/invoice",
    icon: ClipboardListIcon,
    label: "Invoices / Order",
  },
  {
    href: "/dashboard/products",
    icon: PackageIcon,
    label: "Produk",
  },
  {
    href: "/dashboard/laporan",
    icon: BarChart3,
    label: "Laporan",
  },
  {
    href: "/dashboard/payouts",
    icon: Wallet, // Menggunakan Wallet untuk membedakan dengan Laporan
    label: "Komisi Affiliate",
  },
  {
    href: "/dashboard/customers", // URL halaman baru
    icon: Users,
    label: "Pelanggan & Affiliate",
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Ambil URL saat ini
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fungsi render link navigasi (digunakan di Desktop & Mobile)
  const renderNavLinks = () => {
    return navLinks.map((link) => {
      // Cek apakah link ini sedang aktif
      const isActive = pathname === link.href;

      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setIsMobileOpen(false)} // Tutup menu mobile saat diklik
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 
            ${
              isActive
                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            }`}
        >
          <link.icon
            className={`h-4 w-4 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`}
          />
          {link.label}
        </Link>
      );
    });
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[260px_1fr]">
      {/* ========================
          1. SIDEBAR DESKTOP
         ======================== */}
      <div className="hidden border-r bg-gray-50/40 md:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400"
            >
              <Package className="h-6 w-6" />
              <span>Sossilver Admin</span>
            </Link>
          </div>

          {/* Navigasi Desktop */}
          <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
            {renderNavLinks()}
          </nav>

          {/* Footer Sidebar Desktop */}
          <div className="mt-auto p-4 border-t dark:border-gray-700">
            <form action={logoutAction}>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                <PowerIcon className="h-4 w-4" />
                Keluar (Logout)
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ========================
          2. AREA KONTEN UTAMA
         ======================== */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* HEADER MOBILE & DESKTOP */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
          {/* --- KIRI: Tombol Menu Mobile (Hanya muncul di Mobile) --- */}
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                <MenuIcon className="h-6 w-6 text-gray-600" />
                <span className="sr-only">Buka menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex flex-col w-[280px] sm:w-[300px] p-0"
            >
              <SheetHeader className="p-6 border-b text-left">
                <SheetTitle className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                  <Package className="h-6 w-6" /> Sossilver
                </SheetTitle>
              </SheetHeader>

              {/* Navigasi Mobile */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                {renderNavLinks()}
              </nav>

              <div className="p-4 border-t">
                <form action={logoutAction}>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400">
                    <PowerIcon className="h-4 w-4" />
                    Keluar
                  </button>
                </form>
              </div>
            </SheetContent>
          </Sheet>

          {/* --- TENGAH: Logo Mobile (Absolute Center) --- */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              Admin Panel
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* --- KANAN: Info User / Logout (Desktop) --- */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-right hidden lg:block">
              <p className="font-medium text-gray-700 dark:text-gray-200">
                Administrator
              </p>
              <p className="text-xs text-gray-500">Kelola Toko</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              A
            </div>
          </div>
        </header>

        {/* MAIN CONTENT (Scrollable) */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-gray-900 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
