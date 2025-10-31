'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  searchProductsAction,
  createInvoiceAction,
  type CartItemInput,
} from '../../../actions/invoice-actions'; // Impor dari actions
import type { SossilverProduct } from '@prisma/client';
import {
  Search,
  X,
  Plus,
  Minus,
  Loader2,
  User,
  ShoppingCart,
  DollarSign,
  Package,
} from 'lucide-react';

// Tipe untuk item di keranjang UI (termasuk nama dan gambar)
interface CartItem extends CartItemInput {
  name: string;
  gambarUrl: string | null;
}

// Tipe untuk data pelanggan
interface CustomerData {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
}

export default function KasirPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SossilverProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // State untuk keranjang
  const [cart, setCart] = useState<CartItem[]>([]);

  // State untuk pelanggan dan biaya
  const [customer, setCustomer] = useState<CustomerData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
  });
  const [shippingFee, setShippingFee] = useState(0);

  /**
   * Menangani pencarian produk
   */
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const results = await searchProductsAction(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  /**
   * Menambah produk ke keranjang
   */
  const addToCart = (product: SossilverProduct) => {
    // Cek apakah produk sudah ada di keranjang
    const existingItem = cart.find((item) => item.productId === product.id);

    if (existingItem) {
      // Jika sudah ada, tambah quantity
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Jika belum ada, tambahkan item baru
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.nama,
          gambarUrl: product.gambarUrl,
          quantity: 1,
          priceAtTime: product.hargaJual, // Ambil harga jual saat ini
        },
      ]);
    }
    // Kosongkan hasil pencarian
    setSearchQuery('');
    setSearchResults([]);
  };

  /**
   * Mengubah kuantitas item di keranjang
   */
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Hapus item jika kuantitas < 1
      setCart(cart.filter((item) => item.productId !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  /**
   * Menghitung subtotal dan total
   */
  const subTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.priceAtTime * item.quantity, 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    return subTotal + shippingFee;
  }, [subTotal, shippingFee]);

  /**
   * Menangani input pelanggan
   */
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomer({
      ...customer,
      [e.target.name]: e.target.value,
    });
  };

  /**
   * Menangani submit invoice
   */
  const handleSubmitInvoice = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }
    if (!customer.customerName) {
      alert('Nama pelanggan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    
    // Siapkan data item (hanya ID, qty, dan price)
    const itemsInput: CartItemInput[] = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime
    }));

    const result = await createInvoiceAction(
      customer,
      itemsInput,
      shippingFee,
      totalAmount
    );

    setIsSubmitting(false);

    if (result.success) {
      alert(result.message);
      // Kosongkan state setelah berhasil
      setCart([]);
      setCustomer({ customerName: '', customerPhone: '', customerAddress: '' });
      setShippingFee(0);
      // (Opsional) Redirect ke halaman detail invoice
      // router.push(`/dashboard/invoices/${result.invoiceId}`);
    } else {
      alert(`Gagal membuat invoice: ${result.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kolom Kiri: Kasir & Keranjang */}
      <div className="lg:col-span-2 space-y-6">
        {/* --- Pencarian Produk --- */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Cari Produk
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Ketik nama produk (min. 2 huruf)..."
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
            {isSearching && <Loader2 className="absolute right-3 top-2.5 w-5 h-5 animate-spin text-gray-400" />}
            
            {/* Hasil Pencarian */}
            {searchResults.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((product) => (
                  <li
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <Package className="w-5 h-5 mr-3 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium">{product.nama}</p>
                      <p className="text-sm text-gray-500">
                        Stok: ... | Harga: {product.hargaJual.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* --- Keranjang Belanja --- */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Keranjang
          </h2>
          <div className="space-y-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Keranjang masih kosong.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 border-b dark:border-gray-700 pb-4"
                >
                  <div className="flex-1 flex flex-col">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-indigo-500">
                      Rp {item.priceAtTime.toLocaleString('id-ID')}
                    </p>
                  </div>
                  {/* Kuantitas */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
                    >
                      {item.quantity === 1 ? <X className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                    </button>
                    <span className="w-10 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="p-1 rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Subtotal Item */}
                  <div className="w-28 text-right font-semibold">
                    Rp {(item.priceAtTime * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Pelanggan & Total */}
      <div className="lg:col-span-1 space-y-6">
        {/* --- Data Pelanggan --- */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700 space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="w-5 h-5 mr-2" />
            Data Pelanggan
          </h2>
          <div>
            <label htmlFor="customerName" className="text-sm font-medium">Nama Pelanggan*</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={customer.customerName}
              onChange={handleCustomerChange}
              required
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="customerPhone" className="text-sm font-medium">No. Telepon</label>
            <input
              type="text"
              id="customerPhone"
              name="customerPhone"
              value={customer.customerPhone}
              onChange={handleCustomerChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label htmlFor="customerAddress" className="text-sm font-medium">Alamat</label>
            <textarea
              id="customerAddress"
              name="customerAddress"
              rows={3}
              value={customer.customerAddress}
              onChange={handleCustomerChange}
              className="mt-1 w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* --- Rangkuman Total --- */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700 space-y-3">
          <h2 className="text-xl font-semibold flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Total
          </h2>
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Subtotal</span>
            <span>Rp {subTotal.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center">
            <label htmlFor="shippingFee" className="text-gray-600 dark:text-gray-300">Biaya Kirim</label>
            <input
              type="number"
              id="shippingFee"
              value={shippingFee}
              onChange={(e) => setShippingFee(parseInt(e.target.value, 10) || 0)}
              className="w-32 px-2 py-1 border rounded-lg text-right dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="border-t dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* --- Tombol Aksi --- */}
        <button
          onClick={handleSubmitInvoice}
          disabled={isSubmitting || cart.length === 0}
          className="w-full py-3 px-4 rounded-lg bg-indigo-600 text-white font-semibold text-lg shadow-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
          ) : (
            <ShoppingCart className="w-6 h-6 mr-2" />
          )}
          {isSubmitting ? 'Memproses...' : 'Buat Invoice (UNPAID)'}
        </button>
      </div>
    </div>
  );
}