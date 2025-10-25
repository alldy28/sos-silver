import { db } from "@/lib/db"; // Sesuaikan path ke file db.ts Anda
import { Badge, Barcode, Package, CheckCircle, XCircle } from "lucide-react";

/**
 * Halaman ini adalah Server Component untuk menampilkan daftar semua kode unik.
 */
export default async function ListKodePage() {
  // 1. Mengambil data kode dari database
  // Kita menggunakan 'include' untuk mengambil data produk yang terhubung (relasi)
  const codes = await db.generatedCode.findMany({
    include: {
      product: true, // Ini akan mengambil data SossilverProduct yang terkait
    },
    orderBy: {
      sequentialId: "desc", // Menampilkan ID terbaru di atas
    },
    take: 100, // Batasi untuk 100 kode terbaru (untuk performa)
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kode Unik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Menampilkan {codes.length} kode terbaru yang ada di database.
          </p>
        </div>
        {/* Anda bisa tambahkan tombol Link ke halaman generator jika perlu */}
      </div>

      {/* Kontainer Tabel */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full divide-y divide-gray-200">
          {/* Header Tabel */}
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Kode Unik
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Produk Terkait
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Gramasi
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
            </tr>
          </thead>

          {/* Body Tabel */}
          <tbody className="bg-white divide-y divide-gray-200">
            {codes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Belum ada kode yang di-generate.
                </td>
              </tr>
            )}

            {codes.map((code) => (
              <tr key={code.id} className="hover:bg-gray-50">
                {/* ID (Sequential) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                  #{code.sequentialId}
                </td>

                {/* Kode Unik */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                  <div className="flex items-center gap-2">
                    <Barcode className="h-4 w-4 text-gray-400" />
                    {code.kode}
                  </div>
                </td>

                {/* Nama Produk (dari relasi) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {code.product ? (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-500" />
                      {code.product.nama}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>

                {/* Gramasi (dari relasi) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {code.product ? (
                    `${code.product.gramasi} gr`
                  ) : (
                    <span className="text-gray-400 italic">N/A</span>
                  )}
                </td>

                {/* Status (isUsed) */}
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {code.isUsed ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <XCircle className="h-3 w-3" />
                      Digunakan
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3" />
                      Tersedia
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
