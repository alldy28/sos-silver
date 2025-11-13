"use client";

import { useCart } from "../context/CartContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea"; // Kita pakai Textarea untuk alamat
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, Loader2, AlertCircle } from "lucide-react";
import {
  checkoutAction,
  type CreateInvoiceState,
} from "@/actions/invoice-actions";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Definisikan initial state untuk form action
const initialState: CreateInvoiceState = { status: "info", message: "" };

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    itemCount,
    totalPrice,
    updateQuantity,
    removeFromCart,
    clearCart, // Kita butuh ini!
  } = useCart();

  // Siapkan form action untuk checkout
  const [state, checkoutDispatch, isPending] = useActionState(
    checkoutAction,
    initialState
  );

  // Pantau hasil checkout
  useEffect(() => {
    if (state.status === "success" && state.invoiceId) {
      // Jika checkout sukses:
      // 1. Beri notifikasi (opsional, tapi bagus)
      alert(state.message); // Ganti dengan Toast
      // 2. Kosongkan keranjang di localStorage
      clearCart();
      // 3. Arahkan ke halaman "My Account"
      router.push(`/myaccount`);
    }
  }, [state, clearCart, router]);

  if (itemCount === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h2 className="text-2xl font-semibold mb-4">Keranjang Anda Kosong</h2>
        <p className="text-gray-600 mb-6">
          Ayo, isi dengan produk-produk kami!
        </p>
        <Button asChild>
          <Link href="/produk">Lihat Katalog Produk</Link>
        </Button>
      </div>
    );
  }

  return (
    // [PERBAIKAN] <form> sekarang membungkus seluruh grid
    <form
      action={checkoutDispatch}
      className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Kolom Kiri: Daftar Item & Detail Pengiriman */}
      <div className="lg:col-span-2 space-y-6">
        {/* Bagian 1: Detail Pengiriman */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Detail Pengiriman</h2>
          <div className="space-y-4">
            {/* Input Nama Customer (Diambil otomatis, jadi 'disabled') */}
            {/* Catatan: Kita tidak perlu input nama di sini, 
              karena 'checkoutAction' mengambilnya dari sesi login.
            */}

            {/* Input Nomor Telepon */}
            <div>
              <Label htmlFor="customerPhone" className="font-semibold">
                Nomor Telepon/WA (Wajib)
              </Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                type="tel"
                placeholder="0812..."
                required
                className="mt-1"
                disabled={isPending}
              />
              {state.errors?.customerPhone && (
                <p className="text-sm text-red-500 mt-1">
                  {state.errors.customerPhone[0]}
                </p>
              )}
            </div>

            {/* Input Alamat Pengiriman */}
            <div>
              <Label htmlFor="customerAddress" className="font-semibold">
                Alamat Pengiriman (Wajib)
              </Label>
              <Textarea
                id="customerAddress"
                name="customerAddress"
                placeholder="Jl. Merdeka No. 17, Kelurahan, Kecamatan, Kota, Kode Pos"
                required
                className="mt-1"
                rows={4}
                disabled={isPending}
              />
              {state.errors?.customerAddress && (
                <p className="text-sm text-red-500 mt-1">
                  {state.errors.customerAddress[0]}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bagian 2: Daftar Item */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Item di Keranjang ({itemCount})
          </h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 border rounded-lg"
              >
                <Image
                  src={item.image || "https://placehold.co/100x100"}
                  alt={item.name}
                  width={100}
                  height={100}
                  className="rounded-md object-cover"
                />
                <div className="flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.gramasi} gr</p>
                  <p className="font-bold">
                    {formatCurrency(item.priceAtTime)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Update Kuantitas */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      type="button" // Pastikan 'type' adalah 'button'
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={isPending}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-10 text-center">{item.quantity}</span>
                    <Button
                      type="button" // Pastikan 'type' adalah 'button'
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={isPending}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button" // Pastikan 'type' adalah 'button'
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(item.productId)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Ringkasan & Checkout */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Ringkasan</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal ({itemCount} item)</span>
            <span className="font-bold">{formatCurrency(totalPrice)}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span>Ongkos Kirim</span>
            <span className="font-bold">(Akan diinfo Admin)</span>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>

          {/* Input Tersembunyi untuk Data Keranjang */}
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

          {/* Tampilkan error global dari action */}
          {state.status === "error" && !state.errors && (
            <div className="mb-4 bg-red-50 p-3 rounded-md flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span>{state.message}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Checkout (Menunggu Konfirmasi Admin)"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
