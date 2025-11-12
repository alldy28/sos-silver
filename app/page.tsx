import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  ArrowRight,
  ChevronRight,
  Award,
} from "lucide-react";

// [DIHAPUS] CSS Slick Carousel tidak boleh diimpor di Server Component
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

import { db } from "@/lib/db";
import { PromoPopup } from "@/app/dashboard/promo/_components/PromoPopup";

// [PERBAIKAN] Impor komponen header dan footer yang sudah dipisah
import { SiteFooter } from "../components/landing/site-footer";

// --- Data Mockup untuk Produk Unggulan ---
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

// [DIHAPUS] Komponen SiteHeader dan SiteFooter dipindahkan ke file terpisah

/**
 * Halaman Utama (Homepage)
 */
export default async function Homepage() {
  let promoSlides: {
    id: string;
    createdAt: Date;
    imageUrl: string;
    destinationUrl: string | null;
    order: number;
    isActive: boolean;
    updatedAt: Date;
  }[] = [];
  try {
    promoSlides = await db.promoSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Gagal mengambil data slide promo (homepage):", error);
  }

  return (
    <div className="bg-white text-slate-800">

      {/* --- Hero Section --- */}
      <main>
        <section className="relative bg-white">
          {/* ... (Konten Hero Section Anda tidak berubah) ... */}
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
          {/* ... (Konten Fitur Section Anda tidak berubah) ... */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* --- Kolom 1: Video Lokal (Diubah untuk Portrait) --- */}
            <div className="block lg:block rounded-lg shadow-xl overflow-hidden max-w-sm mx-auto">
              {" "}
              <video
                className="w-full h-auto opacity-80" // Tinggi menyesuaikan rasio
                src="/sossilver.mp4"
                autoPlay
                muted
                loop
                playsInline
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
                    {/* [PERBAIKAN] Menggunakan sintaks Image modern */}
                    <Image
                      src={product.gambarUrl}
                      alt={product.nama}
                      fill // Menggantikan layout="fill"
                      style={{ objectFit: "cover" }} // Menggantikan objectFit="cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                    {/* [PERBAIKAN] Arahkan link ke halaman produk */}
                    <Link
                      href="/produk"
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
