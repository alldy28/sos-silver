"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback, // <-- WAJIB: Impor useCallback
} from "react";
import { SossilverProduct } from "@prisma/client"; // Impor SossilverProduct (hanya untuk tipe, tidak dipakai langsung)

// [PERBAIKAN 1] Definisikan tipe minimal yang dibutuhkan
// Tipe ini harus sesuai dengan data yang dikirim dari ProductCard
export interface ProductForCart {
  id: string;
  nama: string;
  hargaJual: number;
  gramasi: number;
  fineness: number; // Dari ProductCard
  gambarUrl: string | null;
}

/**
 * Tipe data untuk item di keranjang
 */
export interface CartItem {
  productId: string;
  name: string;
  priceAtTime: number; // Harga yang digunakan untuk total
  gramasi: number;
  image: string | null; // URL gambar
  quantity: number;
}

/**
 * Tipe data untuk Konteks Keranjang
 */
interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  addToCart: (product: ProductForCart) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "sossilver_cart";

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
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(JSON.parse(storedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Simpan cart ke localStorage setiap kali berubah
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems, isHydrated]);

  // --- FUNGSI-FUNGSI DENGAN useCallBack (Mencegah Loop Tak Terbatas) ---

  // [PERBAIKAN LOOP] Gunakan useCallback
  const addToCart = useCallback((product: ProductForCart) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Tambahkan item baru
        const newItem: CartItem = {
          productId: product.id,
          name: product.nama,
          priceAtTime: product.hargaJual,
          gramasi: product.gramasi,
          image: product.gambarUrl,
          quantity: 1,
        };
        return [...prevItems, newItem];
      }
    });
  }, []); // Dependensi kosong karena fungsi setter tidak berubah

  // [PERBAIKAN LOOP] Gunakan useCallback
  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
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
    },
    []
  );

  // [PERBAIKAN LOOP] Gunakan useCallback
  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.productId !== productId)
    );
  }, []);

  // [PERBAIKAN LOOP] Gunakan useCallback (INI MEMPERBAIKI INFINITE LOOP DI CHECKOUT)
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Hitung jumlah total item (computed value)
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Hitung total harga (computed value)
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.priceAtTime * item.quantity,
    0
  );

  // Check apakah item ada (computed value)
  const isInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId);
  };

  const value: CartContextType = {
    cartItems,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
