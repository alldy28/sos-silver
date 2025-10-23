import { createProductAction } from "@/actions/product-actions";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Halaman Form untuk Menambah Produk Baru
 * Ini adalah Server Component yang menggunakan Server Action
 */
export default function CreateProductPage() {
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Tombol Kembali */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        {/* Form Utama */}
        <form
          action={createProductAction}
          className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Tambah Produk Baru
          </h1>

          {/* Grid untuk layout form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Produk */}
            <div className="md:col-span-2">
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nama Produk
              </label>
              <input
                type="text"
                name="nama"
                id="nama"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Contoh: Logam Mulia Sossilver"
              />
            </div>

            {/* Seri */}
            <div>
              <label
                htmlFor="series"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Seri (Opsional)
              </label>
              <input
                type="text"
                name="series"
                id="series"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="Contoh: Edisi Batik"
              />
            </div>

            {/* Gramasi (Berat) */}
            <div>
              <label
                htmlFor="gramasi"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Gramasi (cth: 0.5)
              </label>
              <input
                type="number"
                name="gramasi"
                id="gramasi"
                required
                step="0.001"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.5"
              />
            </div>

            {/* Fineness (Kadar) */}
            <div>
              <label
                htmlFor="fineness"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Kadar (Fineness)
              </label>
              <input
                type="number"
                name="fineness"
                id="fineness"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="999"
              />
            </div>

            {/* Tahun Pembuatan */}
            <div>
              <label
                htmlFor="tahunPembuatan"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tahun Pembuatan
              </label>
              <input
                type="number"
                name="tahunPembuatan"
                id="tahunPembuatan"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="2024"
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label
                htmlFor="hargaJual"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Harga Jual (IDR)
              </label>
              <input
                type="number"
                name="hargaJual"
                id="hargaJual"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="1500000"
              />
            </div>

            {/* Harga Buyback */}
            <div>
              <label
                htmlFor="hargaBuyback"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Harga Buyback (IDR)
              </label>
              <input
                type="number"
                name="hargaBuyback"
                id="hargaBuyback"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="1350000"
              />
            </div>

            {/* URL Gambar */}
            <div className="md:col-span-2">
              <label
                htmlFor="gambarUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                URL Gambar (Opsional)
              </label>
              <input
                type="text"
                name="gambarUrl"
                id="gambarUrl"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://.../gambar.png"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex justify-end gap-4 mt-8">
            <Link
              href="/dashboard"
              className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
