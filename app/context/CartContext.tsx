// src/context/CartContext.tsx
"use client";

import { SossilverProduct } from "@prisma/client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// [PERBAIKAN 1] Definisikan tipe minimal yang dibutuhkan
// Ini adalah tipe yang sama dengan 'ProductForCart' dari ProductCard
// Kita letakkan di sini agar bisa di-share.
export interface ProductForCart {
  id: string;
  nama: string;
  hargaJual: number;
  gramasi: number;
  gambarUrl: string | null;
}

/**
 * Tipe data untuk item di keranjang
 */
export interface CartItem {
  productId: string; // ID unik dari produk
  name: string;
  price: number; // Harga satuan produk saat ini (untuk display)
  priceAtTime: number; // Harga pada saat ditambahkan ke cart
  gramasi: number;
  gambarUrl: string | null;
  quantity: number;
}

/**
 * Tipe data untuk Konteks Keranjang
 */
interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  // [PERBAIKAN 2] Ubah parameter 'addToCart' agar lebih aman
  // Kita tidak perlu *seluruh* objek Prisma, hanya data minimal
  addToCart: (product: ProductForCart) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  isInCart: (productId: string) => boolean; // [PERBAIKAN 3] Tambah 'isInCart'
}

// 1. Buat Konteks
const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Hook untuk menggunakan Cart Context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart harus digunakan di dalam CartProvider");
  }
  return context;
}

/**
 * Cart Provider - Membungkus aplikasi di layout.tsx
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart dari localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("sossilver_cart");
    if (storedCart) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        localStorage.removeItem("sossilver_cart");
      }
    }
    setIsHydrated(true);
  }, []);

  // Simpan cart ke localStorage
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem("sossilver_cart", JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  /**
   * Menambah produk ke keranjang
   */
  // [PERBAIKAN 2] Parameter sekarang adalah 'ProductForCart'
  const addToCart = (product: ProductForCart) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        // Jika sudah ada, tambah kuantitas
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Jika belum ada, tambahkan sebagai item baru
        const newItem: CartItem = {
          productId: product.id,
          name: product.nama,
          price: product.hargaJual,
          priceAtTime: product.hargaJual, // Simpan harga saat ditambahkan
          gramasi: product.gramasi,
          gambarUrl: product.gambarUrl, // <-- Sudah benar
          quantity: 1,
        };
        return [...prevItems, newItem];
      }
    });
  };

  /**
   * Mengubah kuantitas item
   */
  const updateQuantity = (productId: string, newQuantity: number) => {
    setCartItems((prevItems) => {
      if (newQuantity < 1) {
        return prevItems.filter((item) => item.productId !== productId);
      } else {
        return prevItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
    });
  };

  /**
   * Menghapus item dari keranjang
   */
  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  };

  /**
   * Mengosongkan keranjang
   */
  const clearCart = () => {
    setCartItems([]);
  };

  // [PERBAIKAN 3] Tambahkan implementasi 'isInCart'
  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId);
  };

  // Hitung jumlah total item
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Hitung total harga
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.priceAtTime * item.quantity,
    0
  );

  const value: CartContextType = {
    cartItems,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart, // [PERBAIKAN 3] Tambahkan 'isInCart' ke value
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
