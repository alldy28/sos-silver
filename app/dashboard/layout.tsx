import { logoutAction } from "@/actions/auth-actions";
import {
  PowerIcon,
  HomeIcon,
  ShoppingCartIcon,
  ClipboardListIcon,
  PackageIcon,
  MenuIcon, // Ditambahkan untuk menu mobile
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Asumsi Anda menggunakan shadcn/ui
import {
  Sheet,
  SheetContent,
  SheetHeader, // DI-TAMBAHKAN
  SheetTitle, // DI-TAMBAHKAN
  SheetTrigger,
} from "@/components/ui/sheet"; // Asumsi Anda menggunakan shadcn/ui

// Data link navigasi
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
    label: "Invoices",
  },
  {
    href: "/dashboard/produk",
    icon: PackageIcon,
    label: "Produk",
  },
];

/**
 * Komponen NavLink untuk Sidebar
 * (Membantu menjaga layout tetap bersih)
 */
function NavLink({ href, icon: Icon, label }: (typeof navLinks)[0]) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

/**
 * Komponen LogoutButton
 */
function LogoutButton() {
  return (
    <form action={logoutAction} className="w-full">
      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50">
        <PowerIcon className="h-4 w-4" />
        Logout
      </button>
    </form>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Menggunakan CSS Grid untuk layout sidebar + konten
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* 1. Sidebar (Desktop) */}
      <div className="hidden border-r bg-gray-100/40 md:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          {/* Logo/Judul Sidebar */}
          <div className="flex h-16 items-center border-b px-6">
            <Link
              href="/dashboard"
              className="text-lg font-bold text-gray-900 dark:text-white"
            >
              Sossilver Admin
            </Link>
          </div>
          {/* Navigasi Utama */}
          <nav className="flex-1 overflow-auto py-2 px-4 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>
          {/* Tombol Logout di Bawah Sidebar */}
          <div className="mt-auto p-4">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* 2. Konten Utama (Header + Main) */}
      <div className="flex flex-col">
        {/* Header (Versi Mobile dan Konten Kanan) */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 px-6">
          {/* Menu Tombol Mobile (kiri) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              {/* PERBAIKAN: 
                Tambahkan SheetHeader dan SheetTitle untuk aksesibilitas (screen reader).
                Kita gunakan 'sr-only' agar judul ini tidak tampil secara visual,
                karena judul visual sudah ada di dalam <Link> di bawah.
              */}
              <SheetHeader>
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  Sossilver Admin
                </Link>
                {navLinks.map((link) => (
                  <NavLink key={link.href} {...link} />
                ))}
              </nav>
              <div className="mt-auto">
                <LogoutButton />
              </div>
            </SheetContent>
          </Sheet>

          {/* Spacer (mendorong elemen kanan ke ujung) */}
          <div className="flex-1"></div>

          {/* Tombol Logout (Desktop - Kanan Atas) */}
          {/* <div className="hidden md:block">
            <form action={logoutAction}>
              <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <PowerIcon className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </form>
          </div> */}
        </header>

        {/* Konten Halaman */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
