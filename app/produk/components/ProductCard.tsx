// src/app/produk/components/ProductCard.tsx

import Image from "next/image";
import { SossilverProduct } from "@prisma/client";
import { formatCurrency } from "@/lib/utils"; // Impor dari utilitas baru
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: SossilverProduct;
  isLoggedIn: boolean;
}

/**
 * Komponen ini adalah Server Component.
 * Ia menerima data penuh dari Prisma (product).
 */
export function ProductCard({ product, isLoggedIn }: ProductCardProps) {
  // [PERBAIKAN UTAMA]
  // Buat objek yang aman dan serializable untuk dikirim ke Client Component.
  // Kita hanya memilih field yang DIPERLUKAN oleh tombol.
  const productForCart = {
    id: product.id,
    nama: product.nama,
    hargaJual: product.hargaJual,
    gramasi: product.gramasi,
    fineness: product.fineness,
    gambarUrl: product.gambarUrl,
  };

  return (
    <div
      key={product.id}
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl"
    >
      {/* Gambar Produk */}
      {/* Menggunakan aspect-square untuk rasio yang konsisten */}
      <div className="relative w-full aspect-square bg-gray-200">
        <Image
          src={
            product.gambarUrl ||
            "https://placehold.co/600x600/e2e8f0/cbd5e1?text=No+Image"
          }
          alt={product.nama}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Optimasi gambar
        />
      </div>

      {/* Detail Produk */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {product.nama}
        </h3>
        <p className="text-sm text-gray-500">
          {product.gramasi} gr | {product.fineness}
        </p>
        <div className="mt-2 mb-4 flex-grow">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(product.hargaJual)}
          </span>
        </div>

        {/* [PERBAIKAN UTAMA]
          Kirim 'productForCart' (objek aman), bukan 'product' (objek Prisma).
        */}
        <AddToCartButton product={productForCart} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
