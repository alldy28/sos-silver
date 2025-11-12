// components/Navbar.tsx
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LogIn, User, LogOut, ShoppingBag, MenuIcon } from "lucide-react";
import { CartIcon } from "./CartIcon"; // Komponen Klien Keranjang Anda
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Definisikan link navigasi Anda di satu tempat
const navItems = [
  { href: "/produk", label: "Katalog Produk" },
  // { href: "#produk", label: "Produk" }, // Komentar/hapus link anchor jika tidak dipakai
  { href: "/#fitur", label: "Keunggulan" },
  { href: "/verif", label: "Verifikasi" },
];

/**
 * Komponen Navigasi untuk Tampilan Mobile (di dalam Sheet)
 * Dibuat terpisah agar rapi
 */
function MobileNavLinks({
  user,
}: {
  user: { name?: string | null; role?: string } | undefined;
}) {
  return (
    <nav className="flex flex-col gap-6 mt-8">
      {/* 1. Link Navigasi */}
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-lg font-medium text-gray-700 hover:text-gray-900"
        >
          {item.label}
        </Link>
      ))}

      <hr className="my-4" />

      {/* 2. Tombol Akun/Login (Versi Mobile) */}
      {user ? (
        // --- Tampilan Jika Sudah Login (Mobile) ---
        <div className="flex flex-col space-y-4">
          <Link
            href={user.role === "CUSTOMER" ? "/myaccount" : "/dashboard"}
            passHref
          >
            <Button variant="ghost" size="sm" className="justify-start gap-2">
              <User className="w-4 h-4" />
              {user.name || "Akun Saya"}
            </Button>
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </form>
        </div>
      ) : (
        // --- Tampilan Jika Belum Login (Mobile) ---
        <Link href="/login" passHref>
          <Button
            variant="default"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogIn className="w-4 h-4" />
            Login / Register
          </Button>
        </Link>
      )}
    </nav>
  );
}

/**
 * Komponen Server Navbar Utama
 */
export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* === SISI KIRI (Logo & Navigasi) === */}
          <div className="flex items-center space-x-2 md:space-x-6">
            {/* [PERBAIKAN] Tombol Menu Burger (Hanya Mobile) */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">Buka menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="sr-only">Navigasi</SheetTitle>
                  </SheetHeader>
                  {/* [PERBAIKAN] Memanggil komponen MobileNavLinks */}
                  <MobileNavLinks user={user} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logosos-baru.png"
                alt="Sossilver Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
              Sossilver
            </Link>

            {/* Navigasi Desktop (Hanya Desktop) */}
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  {/* Ganti ikon jika perlu, contoh: Katalog Produk */}
                  {item.href === "/produk" && (
                    <ShoppingBag className="w-4 h-4 mr-1 inline-block" />
                  )}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* === SISI KANAN (Akun & Keranjang) === */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* [PERBAIKAN] Tombol Akun/Login (Hanya Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                // --- Tampilan Jika Sudah Login (Desktop) ---
                <>
                  <Link
                    href={
                      user.role === "CUSTOMER" ? "/myaccount" : "/dashboard"
                    }
                    passHref
                  >
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {user.name || "Akun Saya"}
                    </Button>
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await signOut();
                    }}
                  >
                    <Button type="submit" variant="outline" size="sm">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                // --- Tampilan Jika Belum Login (Desktop) ---
                <Link href="/login" passHref>
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login / Register
                  </Button>
                </Link>
              )}
              {/* Pemisah Vertikal (Hanya Desktop) */}
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-600" />
            </div>

            {/* [PERBAIKAN] Ikon Keranjang (Selalu Terlihat) */}
            <CartIcon />
          </div>
        </div>
      </div>
    </nav>
  );
}
