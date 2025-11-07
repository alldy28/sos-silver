import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  // Gem,
  Package,
  ArrowRight,
  ChevronRight,
  Award,
  MenuIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";



import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";



import { db } from '@/lib/db';
import { PromoPopup } from '@/app/dashboard/promo/_components/PromoPopup'; // Impor komponen popup

// --- Data Mockup untuk Produk Unggulan ---
// Nanti Anda bisa mengambil ini dari database jika mau
const featuredProducts = [
  {
    id: "2",
    nama: "SoS Silver 100 gr",
    gramasi: 100,
    fineness: 999.9,
    gambarUrl: "/images/products/sos-100gr.png",
  },
  {
    id: "1",
    nama: "SoS Silver 50 gr",
    gramasi: 50,
    fineness: 999.9,
    gambarUrl: "/images/products/sos-50gr.png",
  },
  {
    id: "3",
    nama: "SoS Silver 250 gr",
    gramasi: 250,
    fineness: 999.9,
    gambarUrl: "/images/products/sos-250gr.png",
  },
  {
    id: "4",
    nama: "SoS Silver 500 gr",
    gramasi: 500,
    fineness: 999.9,
    gambarUrl: "/images/products/sos-500gr.png",
  },
];


const navItems = [
  { href: "#produk", label: "Produk" },
  { href: "#fitur", label: "Keunggulan" },
  { href: "/verif", label: "Verifikasi" },
];

/**
 * Komponen Header/Navbar
 */
function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/*
          Layout 3-kolom:
          - (Kiri) Slot 1: flex-1, md:hidden -> Untuk Tombol Menu Mobile
          - (Tengah) Slot 2: flex-1, justify-center -> Untuk Logo
          - (Kanan) Slot 3: flex-1, justify-end -> Untuk Navigasi Desktop
          Ini secara otomatis akan menengahkan logo di mobile
        */}
        <div className="flex justify-between items-center h-16">
          {/* --- SLOT KIRI: Tombol Menu Mobile --- */}
          <div className="flex-1 md:hidden">
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
                {/* Navigasi Versi Mobile (di dalam Sidebar) */}
                <nav className="flex flex-col gap-6 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-gray-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {/* Tombol Login Admin di Mobile */}
                  {/* <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  >
                    Login Admin
                  </Link> */}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* --- SLOT TENGAH: Logo (Center di Mobile) --- */}
          <div className="flex-1 flex justify-center md:justify-start md:flex-none">
            <Link href="/" className="flex items-center">
              <Image
                src="/logosos-baru.png"
                alt="Sossilver Logo"
                width={140}
                height={40}
                className="h-10 w-auto"
                priority
              />
              <div className="text-lg font-semibold text-slate-800">
                SoS Silver
              </div>
            </Link>
          </div>

          {/* --- SLOT KANAN: Navigasi Desktop & Aksi --- */}
          <div className="flex-1 hidden md:flex justify-end items-center gap-8">
            {/* Navigasi Desktop */}
            <nav className="flex gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Tombol Aksi (Login Admin) */}
            {/* <div className="flex items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Login Admin
              </Link>
            </div> */}
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
            <Link href="/" className="flex items-center">
              <Image
                src="/logosos-baru.png" // Mengambil dari /public/logosos-baru.png
                alt="Sossilver Logo"
                width={140} // Atur lebar asli gambar (atau rasio)
                height={40} // Atur tinggi asli gambar (atau rasio)
                className="h-10 w-auto" // Tinggi 40px, lebar otomatis
                priority // Membantu LCP
              />
              <div className="text-lg font-semibold text-slate-800">
                {" "}
                SoS Silver{" "}
              </div>
            </Link>
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
            &copy; {new Date().getFullYear()} sosilver.co.id. Hak Cipta
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
export default async function Homepage() {

  let promoSlides: { id: string; createdAt: Date; imageUrl: string; destinationUrl: string | null; order: number; isActive: boolean; updatedAt: Date; }[] = []; // Default array kosong
  try {
    promoSlides = await db.promoSlide.findMany({
      where: { isActive: true }, // Hanya ambil yang aktif
      orderBy: { order: 'asc' }, // Urutkan berdasarkan order
    });
  } catch (error) {
    console.error("Gagal mengambil data slide promo (homepage):", error);
  }


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
                  Temukan kemurnian perak 999.9 bersertifikat dari SoS Silver.
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
                  <Link
                    href="/update-harga"
                    className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50 transition-colors shadow-lg"
                  >
                    Update harga
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
        <section id="fitur" className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* --- Kolom 1: Video Lokal (Diubah untuk Portrait) --- */}
            {/* DIUBAH: Hapus aspect-video, tambahkan max-w-sm dan mx-auto */}
            <div className="block lg:block rounded-lg shadow-xl overflow-hidden max-w-sm mx-auto">
              {" "}
              {/* Batasi lebar */}
              <video
                className="w-full h-auto opacity-80" // Tinggi menyesuaikan rasio
                src="/sossilver.mp4" // <-- GANTI NAMA FILE INI
                autoPlay // Putar otomatis
                muted // Harus di-mute agar autoplay berfungsi di banyak browser
                loop // Ulangi video
                playsInline // Penting untuk autoplay di iOS
                // controls // Hapus komentar ini jika ingin menampilkan kontrol video
              >
                Browser Anda tidak mendukung tag video. {/* Fallback text */}
              </video>
            </div>

            {/* --- Kolom 2: Teks Fitur --- */}
            <div>
              <div className="text-left mb-16">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  KEUNGGULAN KAMI
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">
                  Mengapa Memilih SoS Silver?
                </h2>
                <p className="mt-4 text-lg text-slate-600">
                  SoS Silver bersertifikat resmi dan terjamin keasliannya,
                  berpengaruh terhadap investasi jangka panjang Anda.
                </p>
              </div>

              {/* Layout List Fitur (Tema Terang) */}
              <div className="space-y-10">
                {/* Fitur 1 */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-gray-600">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {" "}
                      {/* Ukuran font diperkecil */}
                      Jaminan Keaslian & Kemurnian
                    </h3>
                    <p className="text-slate-600">
                      Setiap produk perak yang kami tawarkan dilengkapi
                      sertifikat resmi, dan menjamin kemurnian 999.9.
                    </p>
                  </div>
                </div>
                {/* Fitur 2 */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-gray-600">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {" "}
                      {/* Ukuran font diperkecil */}
                      Keaslian Terverifikasi
                    </h3>
                    <p className="text-slate-600">
                      Dilengkapi dengan kode unik yang dapat Anda verifikasi
                      keasliannya kapan saja melalui website kami.
                    </p>
                  </div>
                </div>
                {/* Fitur 3 */}
                <div className="flex items-start gap-6">
                  <div className="shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-gray-600">
                    <Package className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      {" "}
                      {/* Ukuran font diperkecil */}
                      Desain Eksklusif & Aman
                    </h3>
                    <p className="text-slate-600">
                      Produk kami hadir dalam kemasan yang aman, terlindungi,
                      dan desain yang elegan untuk koleksi Anda.
                    </p>
                  </div>
                </div>
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
                  <div className="p-6 bg-white grow">
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
                      className="inline-flex items-center font-medium text-gray-600 hover:text-indigo-800"
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

      <PromoPopup promoSlides={promoSlides} />
    </div>
  );
}
