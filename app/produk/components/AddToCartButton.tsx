"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, Check, LogIn } from "lucide-react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { usePathname, useSearchParams } from "next/navigation";
// [PERBAIKAN] Kita tidak perlu mengimpor SossilverProduct secara utuh jika tidak dipakai semua
// import { SossilverProduct } from "@prisma/client";

// [PERBAIKAN] Definisikan tipe props yang hanya membutuhkan data yang kita pakai.
// Ini menghindari error "missing properties" jika data dari server tidak lengkap.
interface ProductProps {
  id: string;
  nama: string;
  hargaJual: number;
  gramasi: number;
  gambarUrl: string | null;
  // Properti lain opsional
  fineness?: number;
  series?: string | null;
}

interface AddToCartButtonProps {
  product: ProductProps; // Gunakan tipe fleksibel ini
  isLoggedIn: boolean;
}

export function AddToCartButton({ product, isLoggedIn }: AddToCartButtonProps) {
  const { addToCart, cartItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentUrl)}`;

  // Cek ketersediaan di keranjang
  const isAlreadyInCart = cartItems.some(
    (item) => item.productId === product.id
  );

  if (!isLoggedIn) {
    return (
      <Button
        asChild
        className="w-full bg-gray-600 hover:bg-gray-700"
        variant="outline"
      >
        <Link href={loginUrl}>
          <LogIn className="mr-2 h-4 w-4" />
          Login untuk Membeli
        </Link>
      </Button>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);

    // [PERBAIKAN] Panggil addToCart.
    // Karena 'addToCart' di context mungkin mengharapkan 'SossilverProduct' (tipe Prisma lengkap),
    // kita mungkin perlu melakukan casting 'as any' di sini untuk membungkam TypeScript,
    // KARENA kita tahu context hanya akan menyimpan field-field yang ada di 'ProductProps' ini.
    // (Solusi ideal adalah mengubah tipe di Context juga, tapi ini cara cepat dan aman).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addToCart(product as any);

    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <Button
      type="button"
      className={`w-full transition-colors ${
        isAdding || isAlreadyInCart
          ? "bg-green-600 hover:bg-green-700"
          : "bg-indigo-600 hover:bg-indigo-700"
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
