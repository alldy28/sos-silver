"use client";

import { useState } from "react";
// [PERBAIKAN] Gunakan tipe 'SossilverProduct' dari Prisma
import { SossilverProduct } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Check, LogIn } from "lucide-react";
import Link from "next/link";
// [PERBAIKAN] Gunakan 'useCart' dari context yang benar
import { useCart } from "../../context/CartContext";
import { usePathname, useSearchParams } from "next/navigation";

interface AddToCartButtonProps {
  product: SossilverProduct; // [PERBAIKAN] Tipe data yang benar
  isLoggedIn: boolean;
}

export function AddToCartButton({ product, isLoggedIn }: AddToCartButtonProps) {
  // [PERBAIKAN] Ambil 'cartItems' untuk mengecek ketersediaan
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // 1. Mengambil URL saat ini + Parameter (seperti ?ref=AFFILIATE)
  // Ini PENTING agar Affiliate Tracking tidak putus saat user login
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;

  // 2. [PERBAIKAN] Cek apakah item sudah ada di keranjang secara manual
  // karena 'isInCart' tidak ada di context.
  const isAlreadyInCart = cartItems.some(
    (item) => item.productId === product.id
  );

  // 3. Logika jika user BELUM LOGIN
  if (!isLoggedIn) {
    return (
      <Button
        asChild
        className="w-full bg-gray-600 hover:bg-gray-700"
        variant="outline"
      >
        {/* Gunakan Link dengan callbackUrl */}
        <Link href={loginUrl}>
          <LogIn className="mr-2 h-4 w-4" />
          Login untuk Membeli
        </Link>
      </Button>
    );
  }

  // 4. Logika jika user SUDAH LOGIN
  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);

    // Beri sedikit jeda visual
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <Button
      type="button"
      className={`w-full transition-colors ${
        isAdding || isAlreadyInCart
          ? "bg-green-600 hover:bg-green-700" // Warna hijau jika sukses/sudah ada
          : "bg-indigo-600 hover:bg-indigo-700" // Warna default
      }`}
      onClick={handleAddToCart}
      disabled={isAlreadyInCart || isAdding}
    >
      {isAlreadyInCart ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Sudah di Keranjang
        </>
      ) : isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Menambahkan...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Tambah ke Keranjang
        </>
      )}
    </Button>
  );
}
