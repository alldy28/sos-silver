// src/app/produk/page.tsx

import { Suspense } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { SossilverProduct } from "@prisma/client";
import { ProductCard } from "./components/ProductCard";
import { Loader2, PackageX } from "lucide-react"; // Ikon untuk loading/empty

/**
 * Komponen Skeleton untuk Loading State
 */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500">
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="text-lg font-semibold">Memuat produk...</p>
    </div>
  );
}

/**
 * Komponen terpisah untuk fetching data.
 * Ini adalah pola yang bagus untuk digunakan dengan <Suspense>.
 */
async function ProductList() {
  // 1. Ambil sesi
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // 2. Ambil data produk
  const products = await db.sossilverProduct.findMany({
    orderBy: {
      gramasi: "asc",
    },
    // [PROFESIONAL] Hanya pilih data yang Anda perlukan
    select: {
      id: true,
      nama: true,
      gramasi: true,
      fineness: true,
      hargaJual: true,
      gambarUrl: true,
      // Kita tidak perlu hargaBeli, createdAt, etc. di sini
    },
  });

  // 3. [PERBAIKAN] Penanganan Empty State
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 col-span-full">
        <PackageX className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold">Produk Tidak Ditemukan</h2>
        <p>Maaf, kami belum memiliki produk untuk ditampilkan saat ini.</p>
      </div>
    );
  }

  // 4. Render list
  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product as SossilverProduct}
          isLoggedIn={isLoggedIn}
        />
      ))}
    </>
  );
}

/**
 * Halaman Publik Utama untuk Katalog Produk
 * Sekarang jauh lebih bersih!
 */
export default async function ProdukPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Katalog Produk Sossilver
        </h1>

        {/* [PERBAIKAN] Grid dengan Suspense */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Suspense fallback={<LoadingSkeleton />}>
            {/* Komponen async ini akan di-render saat datanya siap */}
            <ProductList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
