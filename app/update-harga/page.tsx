import { db } from "@/lib/db";
import Image from "next/image";
import { AlertCircle } from "lucide-react";

// [DIHAPUS] Komponen SiteHeader dan SiteFooter dihapus dari sini.
// Navbar dan Footer global Anda akan dimuat dari app/layout.tsx.

export default async function PublicUpdateHargaPage() {
  // Ambil URL gambar saat ini dari database
  const priceImage = await db.priceImage.findUnique({
    where: { id: "current_price_list" },
  });

  const currentImageUrl = priceImage?.imageUrl || null;

  return (
    // Kita tidak perlu <div> pembungkus, <main> sudah cukup.
    // layout.tsx akan menyediakan padding/margin global.
    <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white p-6 sm:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Daftar Harga
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
            <p className="text-sm text-gray-400">Silakan cek kembali nanti.</p>
          </div>
        )}
      </div>
    </main>
    // [DIHAPUS] <SiteFooter /> dihapus.
  );
}
