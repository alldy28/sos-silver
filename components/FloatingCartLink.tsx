// components/FloatingCartLink.tsx
"use client";

import Link from "next/link";
import { useCart } from "../app/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils"; // Impor fungsi format Anda

/**
 * Komponen ini akan mengambang di pojok kanan bawah
 * dan hanya muncul jika ada item di keranjang.
 */
export function FloatingCartLink() {
  const { itemCount, totalPrice } = useCart();

  // 1. Sembunyikan jika keranjang kosong
  if (itemCount === 0) {
    return null;
  }

  // 2. Tampilkan jika ada item
  return (
    <Link
      href="/cart"
      // Styling untuk membuatnya mengambang di pojok
      className="fixed bottom-6 right-6 z-50"
    >
      <Button size="lg" className="shadow-xl rounded-full h-16 w-auto px-6">
        <ShoppingCart className="w-6 h-6 mr-3" />
        <div className="flex flex-col items-start">
          <span className="text-lg font-bold">{itemCount} Item</span>
          <span className="text-sm font-light -mt-1">
            {formatCurrency(totalPrice)}
          </span>
        </div>
      </Button>
    </Link>
  );
}
