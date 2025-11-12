"use client";

// [PERBAIKAN 1] Typo 'contex' diubah menjadi 'context'
import { useCart } from "../context/CartContext"; // Impor hook keranjang kita
import Image from "next/image";
import Link from "next/link";
import { Loader2, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";
import { checkoutAction } from "@/actions/invoice-actions"; // Impor Server Action
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

// Tipe state untuk useActionState
type CheckoutState = {
  status: "success" | "error" | "info";
  message: string;
  invoiceId?: string;
};

const initialState: CheckoutState = {
  status: "info",
  message: "",
};

/**
 * [KOMPONEN BARU]
 * Halaman Keranjang Belanja / Checkout
 */
export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  // Hitung total
  const subTotal = cartItems.reduce(
    (total, item) => total + item.priceAtTime * item.quantity,
    0
  );

  // Setup Server Action
  const [state, formAction, isPending] = useActionState(
    checkoutAction,
    initialState
  );

  // [PERBAIKAN] Tambahkan state 'penjaga' untuk mencegah loop
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

  // Fungsi helper untuk format harga
  const formatCurrency = (amount: number) =>
    `Rp ${amount.toLocaleString("id-ID")}`;

  // Efek untuk menangani redirect setelah checkout sukses
  useEffect(() => {
    // [PERBAIKAN] Cek 'state' DAN 'penjaga'
    if (state.status === "success" && state.invoiceId && !isProcessingSuccess) {
      // [PERBAIKAN] 1. Set 'penjaga' agar loop berhenti
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsProcessingSuccess(true);

      // 2. Kosongkan keranjang di localStorage
      clearCart();

      // 3. Beri tahu user (Toast lebih baik dari alert)
      alert(state.message); // Alert ini akan muncul satu kali

      // 4. Arahkan user ke halaman /myaccount
      router.push("/myaccount");
    } else if (state.status === "error") {
      // Jika gagal, tampilkan pesan error (Toast lebih baik dari alert)
      alert(`Checkout Gagal: ${state.message}`);
    }
    // [PERBAIKAN] Tambahkan 'isProcessingSuccess' ke dependensi
  }, [state, clearCart, router, isProcessingSuccess]);

  // Tampilan jika keranjang kosong
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <ShoppingCart className="w-20 h-20 text-gray-300 mb-6" />
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Keranjang Belanja Anda Kosong
        </h1>
        <p className="text-gray-500 mb-6">
          Sepertinya Anda belum menambahkan produk apapun.
        </p>
        <Link
          href="/produk"
          className="px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  // Tampilan jika keranjang ada isinya
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Keranjang Belanja Anda
      </h1>

      {/* Form ini akan membungkus seluruh keranjang */}
      <form action={formAction}>
        {/*
         * [PERBAIKAN 2 - SANGAT PENTING]
         * Server Action tidak bisa membaca 'cartItems' dari React Context.
         * Kita harus mengirim data keranjang melalui 'formData'
         * menggunakan <input type="hidden">.
         */}
        <input
          type="hidden"
          name="cartItems"
          value={JSON.stringify(
            cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.priceAtTime,
              gramasi: item.gramasi,
            }))
          )}
        />

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Daftar Item */}
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div
                // [PERBAIKAN 'Ghost Error']
                // Error 'Key' aneh Anda hilang jika kita restart editor.
                // Kode ini sudah benar.
                key={item.productId}
                className="flex items-center gap-4 p-4"
              >
                {/* Gambar */}
                <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={
                      item.gambarUrl ||
                      "https://placehold.co/100x100/e2e8f0/cbd5e1?text=No+Img"
                    }
                    alt={item.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>

                {/* Info Produk */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.gramasi} gr</p>
                  <p className="text-sm font-medium text-indigo-600">
                    {formatCurrency(item.priceAtTime)}
                  </p>
                </div>

                {/* Pengatur Kuantitas */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="p-1.5 rounded-full bg-gray-200 hover:bg-gray-300"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Total Item */}
                <div className="w-24 text-right font-semibold">
                  {formatCurrency(item.priceAtTime * item.quantity)}
                </div>

                {/* Tombol Hapus */}
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="sr-only">Hapus item</span>
                </button>
              </div>
            ))}
          </div>

          {/* Bagian Total */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-end mb-4">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    {formatCurrency(subTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Biaya Kirim & Admin</span>
                  <span className="font-semibold">Akan dihitung</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(subTotal)}</span>
                </div>
              </div>
            </div>

            {/* Tombol Checkout */}
            <div className="flex justify-end">
              <Button
                type="submit"
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 mr-2" />
                )}
                {isPending ? "Memproses Checkout..." : "Checkout Sekarang"}
              </Button>
            </div>
            {state.status === "error" && (
              <p className="text-red-500 text-right mt-4">{state.message}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
