import { db } from "@/lib/db";
import Image from "next/image";
import { UrlForm } from "./_components/UrlForm"; // <-- Menggunakan form URL baru
import { AlertCircle } from "lucide-react";

// Ini adalah Server Component (induk)
export default async function UpdateHargaPage() {
  // 1. Ambil URL gambar saat ini dari database
  const priceImage = await db.priceImage.findUnique({
    where: { id: "current_price_list" },
  });

  const currentImageUrl = priceImage?.imageUrl || null;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg my-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Update Gambar Harga Jual/Buyback (via URL)
      </h1>

      {/* 2. Tampilkan gambar saat ini */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">
          Gambar Saat Ini:
        </h2>
        {currentImageUrl ? (
          <Image
            src={currentImageUrl}
            alt="Harga Sossilver Saat Ini"
            width={800}
            height={600}
            className="rounded-md border border-gray-200 object-contain w-full h-auto"
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-md">
            <AlertCircle className="w-8 h-8 text-gray-400 mr-2" />
            <p className="text-gray-500">
              Belum ada gambar harga yang di-upload.
            </p>
          </div>
        )}
      </div>

      {/* 3. Tampilkan form input URL (Client Component) */}
      <UrlForm currentImageUrl={currentImageUrl} />
    </div>
  );
}
