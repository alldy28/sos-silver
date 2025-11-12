// src/app/produk/components/AddToCartButton.tsx
"use client";

import { useState } from "react";
// [PERBAIKAN] Impor 'useCart' dan 'ProductForCart' dari file context
import { useCart, ProductForCart } from "../../context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, LogIn, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Tipe 'ProductForCart' sekarang diimpor dari Context

interface AddToCartButtonProps {
  product: ProductForCart; // Tipe ini sekarang cocok
  isLoggedIn: boolean;
}

export function AddToCartButton({ product, isLoggedIn }: AddToCartButtonProps) {
  const router = useRouter();
  // [PERBAIKAN] 'isInCart' sekarang ada di context
  const { addToCart, isInCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  // Cek apakah item sudah ada di keranjang
  const isAlreadyInCart = isInCart(product.id); // <-- Ini akan berhasil

  // --- 1. Logika jika user BELUM LOGIN ---
  if (!isLoggedIn) {
    return (
      <Button
        className="w-full"
        onClick={() => router.push("/login")}
        variant="outline"
      >
        <LogIn className="mr-2 h-4 w-4" />
        Login untuk Membeli
      </Button>
    );
  }

  // --- 2. Logika jika user SUDAH LOGIN ---
  const handleAddToCart = () => {
    setIsLoading(true);

    // [PERBAIKAN] Kita tidak perlu membuat 'newItem' di sini lagi.
    // Cukup panggil 'addToCart' dengan 'product' prop.
    // Konteks akan menangani sisanya.
    addToCart(product);

    // Beri sedikit jeda agar user melihat feedback
    setTimeout(() => {
      setIsLoading(false);
      // Anda bisa tambahkan notifikasi Toast di sini
      // toast.success(`${product.nama} ditambahkan ke keranjang!`);
    }, 500);
  };

  return (
    <Button
      className="w-full"
      onClick={handleAddToCart}
      disabled={isAlreadyInCart || isLoading}
    >
      {isAlreadyInCart ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Sudah di Keranjang
        </>
      ) : isLoading ? (
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
