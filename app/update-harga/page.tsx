import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

// ------------------------------------------------------------------
// RE-USE DARI app/page.tsx (Anda bisa pindahkan ini ke file terpisah)
// ------------------------------------------------------------------
function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logosos-baru.png"
              alt="Sossilver Logo"
              width={140}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex md:gap-8">
            <Link
              href="/#produk"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Produk
            </Link>
            <Link
              href="/#fitur"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Keunggulan
            </Link>
            <Link
              href="/verifikasi"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Verifikasi
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Login Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-slate-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image
              src="/logosos-baru"
              alt="Sossilver Logo"
              width={120}
              height={34}
              className="h-8 w-auto opacity-80"
            />
          </div>
          <nav className="flex gap-6">
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Tentang Kami
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Kontak
            </Link>
            <Link
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              FAQ
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-gray-300 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Sossilver.co.id. Hak Cipta
            Dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
// ------------------------------------------------------------------

export default async function PublicUpdateHargaPage() {
  // Ambil URL gambar saat ini dari database
  const priceImage = await db.priceImage.findUnique({
    where: { id: "current_price_list" },
  });

  const currentImageUrl = priceImage?.imageUrl || null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SiteHeader />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white p-6 sm:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Daftar Harga Jual & Buyback Sossilver
          </h1>

          {currentImageUrl ? (
            <div className="w-full overflow-hidden rounded-md border border-gray-200">
              <Image
                src={currentImageUrl}
                alt="Daftar Harga Sossilver Terbaru"
                width={1200}
                height={900}
                className="w-full h-auto object-contain"
                priority // Penting untuk LCP
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg text-gray-500">
                Daftar harga belum tersedia.
              </p>
              <p className="text-sm text-gray-400">
                Silakan cek kembali nanti.
              </p>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
