import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Gem,
  Package,
  ArrowRight,
  ChevronRight,
  Award,
} from "lucide-react";

// --- Data Mockup untuk Produk Unggulan ---
// Nanti Anda bisa mengambil ini dari database jika mau
const featuredProducts = [
  {
    id: "1",
    nama: "Sossilver Bar 10 gr",
    gramasi: 100,
    fineness: 999.9,
    gambarUrl: "https://www.minigold.co.id/wp-content/uploads/2025/10/sos.png",
  },
  {
    id: "2",
    nama: "Sossilver Bar 50 gr",
    gramasi: 50,
    fineness: 999.9,
    gambarUrl: "https://www.minigold.co.id/wp-content/uploads/2025/10/sos.png",
  },
  {
    id: "3",
    nama: "Sossilver Bar 250 gr",
    gramasi: 250,
    fineness: 999.9,
    gambarUrl: "https://www.minigold.co.id/wp-content/uploads/2025/10/sos.png",
  },
  {
    id: "4",
    nama: "Sossilver Bar 500 gr",
    gramasi: 500,
    fineness: 999.9,
    gambarUrl: "https://www.minigold.co.id/wp-content/uploads/2025/10/sos.png",
  },
];

/**
 * Komponen Header/Navbar
 */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logosos.png" // Mengambil dari /public/logosos.png
              alt="Sossilver Logo"
              width={140} // Atur lebar asli gambar (atau rasio)
              height={40} // Atur tinggi asli gambar (atau rasio)
              className="h-10 w-auto" // Tinggi 40px, lebar otomatis
              priority // Membantu LCP
            />
          </Link>

          {/* Navigasi */}
          <nav className="hidden md:flex md:gap-8">
            <Link
              href="#produk"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Produk
            </Link>
            <Link
              href="#fitur"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Keunggulan
            </Link>
            <Link
              href="/verif"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Verifikasi
            </Link>
          </nav>

          {/* Tombol Aksi */}
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard" // <-- Mengarah ke dasbor login Anda
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

/**
 * Komponen Footer
 */
function SiteFooter() {
  return (
    <footer className="bg-slate-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Gem className="h-5 w-5 text-slate-700" />
            <span className="text-lg font-semibold text-slate-800">
              Sossilver
            </span>
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

/**
 * Halaman Utama (Homepage)
 */
export default function Homepage() {
  return (
    <div className="bg-white text-slate-800">
      <SiteHeader />

      {/* --- Hero Section --- */}
      <main>
        <section className="relative bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Kolom Teks */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Investasi Perak Murni,
                  <span className="block text-gray-500">
                    Keaslian Terjamin.
                  </span>
                </h1>
                <p className="mt-6 text-lg text-gray-600 max-w-lg mx-auto lg:mx-0">
                  Temukan kemurnian perak 999.9 bersertifikat dari Sossilver.
                  Pilihan terpercaya untuk melindungi nilai aset Anda dengan
                  standar tertinggi.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="#produk"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 transition-colors shadow-lg"
                  >
                    Lihat Katalog Produk
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/verif"
                    className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    Verifikasi Keaslian
                  </Link>
                </div>
              </div>

              {/* Kolom Gambar */}
              <div className="hidden lg:block">
                <Image
                  src="https://www.minigold.co.id/wp-content/uploads/2025/10/sos.png"
                  alt="Perak batangan Sossilver"
                  width={800}
                  height={600}
                  className="rounded-lg shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- Fitur / Keunggulan --- */}
        <section id="fitur" className="bg-slate-50 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Mengapa Memilih Sossilver?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Kami memberikan jaminan terbaik untuk investasi perak Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Fitur 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Kemurnian 999.9
                </h3>
                <p className="text-gray-600">
                  Setiap produk Sossilver memiliki kadar kemurnian perak 999.9,
                  standar investasi internasional.
                </p>
              </div>
              {/* Fitur 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Keaslian Terverifikasi
                </h3>
                <p className="text-gray-600">
                  Dilengkapi dengan kode unik yang dapat Anda verifikasi
                  keasliannya kapan saja melalui website kami.
                </p>
              </div>
              {/* Fitur 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Desain Eksklusif
                </h3>
                <p className="text-gray-600">
                  Produk kami hadir dalam kemasan yang aman, terlindungi, dan
                  desain yang elegan untuk koleksi Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Produk Unggulan --- */}
        <section id="produk" className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Produk Unggulan Kami
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Pilihan investasi perak terbaik untuk Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col"
                >
                  <div className="relative w-full h-64 bg-gray-100">
                    <Image
                      src={product.gambarUrl}
                      alt={product.nama}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="p-6 bg-white flex-grow">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {product.nama}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {product.gramasi} Gram | Fineness {product.fineness}
                    </p>
                  </div>
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <Link
                      href="#"
                      className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Lihat Detail <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
