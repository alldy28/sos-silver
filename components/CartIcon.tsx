// components/CartIcon.tsx
"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
// Pastikan path impor ini benar sesuai struktur Anda
import { useCart } from "../app/context/CartContext";

/**
 * Komponen Klien khusus untuk menampilkan ikon keranjang dan badge.
 * Menggunakan hook useCart() untuk mendapatkan 'itemCount'.
 */
export function CartIcon() {
  // Ambil 'itemCount' dari context
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      aria-label={`Keranjang belanja, ${itemCount} item`}
    >
      <ShoppingCart className="w-6 h-6" />

      {/* Badge Kuantitas */}
      {/* Hanya tampilkan badge jika ada item */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
