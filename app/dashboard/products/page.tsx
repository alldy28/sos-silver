import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {
  Edit,
  Trash2,
  PackageSearch,
  PlusCircle,
  ArrowLeft,
} from "lucide-react";
import { deleteProductAction } from "@/actions/product-actions";

// Helper function untuk memformat mata uang Rupiah
const formatCurrency = (amount: number) => {
  if (isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Halaman untuk menampilkan semua produk (Manajemen Produk)
 */
export default async function ProductsListPage() {
  // Ambil data dari database
  const products = await db.sossilverProduct.findMany({
    orderBy: {
      createdAt: "desc", // Tampilkan yang terbaru di atas
    },
  });

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Tombol Kembali */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        {/* Header Halaman */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manajemen Produk ({products.length})
          </h1>
          <Link
            href="/dashboard/products/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 w-full md:w-auto"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Tambah Produk Baru
          </Link>
        </div>

        {/* Kontainer Tabel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Gambar
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Nama Produk
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Gramasi
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Harga Jual
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Harga Buyback
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Tampilkan pesan jika tidak ada produk */}
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <PackageSearch className="w-12 h-12" />
                        <h3 className="mt-2 text-sm font-medium">
                          Belum Ada Produk
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          Klik Tambah Produk Baru untuk memulai.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Loop (map) data produk
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Image
                          src={
                            product.gambarUrl ||
                            "https://placehold.co/600x600/e2e8f0/cbd5e1?text=No+Image"
                          }
                          alt={product.nama}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-md object-cover border dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.nama}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {product.series || "Reguler"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {product.gramasi} gr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(product.hargaJual)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                        {formatCurrency(product.hargaBuyback)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          {/* Link Edit (belum dibuat) */}
                          <Link
                            href={`/dashboard/products/edit/${product.id}`}
                            className="text-indigo-600 hover:text-indigo-800"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>

                          {/* Form Hapus (Delete Action) */}
                          <form action={deleteProductAction}>
                            <input
                              type="hidden"
                              name="productId"
                              value={product.id}
                            />

                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
