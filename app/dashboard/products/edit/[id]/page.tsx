import { updateProductAction } from "@/actions/product-actions";
import { db } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Halaman Form untuk Meng-edit Produk
 * Compatible dengan Next.js 15+ (params sebagai Promise)
 */
export default async function EditProductPage(props: EditProductPageProps) {
  // Await params untuk mendapatkan id
  const params = await props.params;
  const { id } = params;

  console.log("MERENDER HALAMAN EDIT. ID DARI PARAMS:", id);

  // Guard clause - validasi id
  if (!id) {
    console.error("EditProductPage: ID parameter tidak ditemukan di params.");
    notFound();
  }

  // Ambil data produk dari database
  const product = await db.sossilverProduct.findUnique({
    where: { id: id },
  });

  // Jika produk tidak ditemukan
  if (!product) {
    console.error(`Produk dengan ID ${id} tidak ditemukan di database.`);
    notFound();
  }

  // Tampilkan form edit
  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Tombol Kembali */}
        <Link
          href="/dashboard/products"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar Produk
        </Link>

        {/* Form Edit Produk */}
        <form
          action={updateProductAction}
          className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
        >
          {/* Hidden input untuk ID produk */}
          <input type="hidden" name="productId" value={product.id} />

          {/* Header */}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Edit Produk: {product.nama}
          </h1>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nama Produk */}
            <div className="md:col-span-2">
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nama Produk <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama"
                id="nama"
                required
                defaultValue={product.nama}
                placeholder="Contoh: Emas Batangan 24K"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* Seri */}
            <div>
              <label
                htmlFor="series"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Seri
              </label>
              <input
                type="text"
                name="series"
                id="series"
                defaultValue={product.series || ""}
                placeholder="Contoh: SERIES-2024"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* Gramasi (Berat) */}
            <div>
              <label
                htmlFor="gramasi"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Gramasi (gram) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="gramasi"
                id="gramasi"
                required
                step="0.001"
                min="0"
                defaultValue={product.gramasi}
                placeholder="Contoh: 10.5"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* Fineness (Kadar) */}
            <div>
              <label
                htmlFor="fineness"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Kadar (Fineness) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fineness"
                id="fineness"
                required
                min="0"
                max="9999"
                // step="0.1"
                defaultValue={product.fineness}
                placeholder="Contoh: 999.9"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* Tahun Pembuatan */}
            <div>
              <label
                htmlFor="tahunPembuatan"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Tahun Pembuatan
              </label>
              <input
                type="number"
                name="tahunPembuatan"
                id="tahunPembuatan"
                min="1900"
                max={new Date().getFullYear()}
                defaultValue={product.tahunPembuatan || ""}
                placeholder={`Contoh: ${new Date().getFullYear()}`}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* Harga Jual */}
            <div>
              <label
                htmlFor="hargaJual"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Harga Jual (IDR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hargaJual"
                id="hargaJual"
                required
                min="0"
                // step="1000"
                defaultValue={product.hargaJual}
                placeholder="Contoh: 10000000"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* Harga Buyback */}
            <div>
              <label
                htmlFor="hargaBuyback"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Harga Buyback (IDR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hargaBuyback"
                id="hargaBuyback"
                required
                min="0"
                // step="1000"
                defaultValue={product.hargaBuyback}
                placeholder="Contoh: 9500000"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
            </div>

            {/* URL Gambar */}
            <div className="md:col-span-2">
              <label
                htmlFor="gambarUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                URL Gambar
              </label>
              <input
                type="url"
                name="gambarUrl"
                id="gambarUrl"
                defaultValue={product.gambarUrl || ""}
                placeholder="https://example.com/image.jpg"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
              />
              {product.gambarUrl && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Preview gambar saat ini tersedia
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/dashboard/products"
              className="inline-flex justify-center items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
