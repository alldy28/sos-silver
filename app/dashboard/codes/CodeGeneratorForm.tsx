"use client";

import { SossilverProduct } from "@prisma/client";
import { generateCodesAction } from "@/actions/code-actions";
import { useState, useTransition } from "react";
import { Download } from "lucide-react"; // <-- Impor ikon download

// Tipe untuk props
interface CodeGeneratorFormProps {
  products: SossilverProduct[];
}

// Tipe untuk state hasil
type FormResult = {
  success?: string;
  error?: string;
  codes?: { kode: string }[]; // <-- Tipe baru untuk menampung kode
  productName?: string; // <-- Tipe baru untuk nama file
};

/**
 * Client Component untuk form generator kode.
 * Menerima daftar produk sebagai props.
 */
export function CodeGeneratorForm({ products }: CodeGeneratorFormProps) {
  // State untuk menampilkan pesan sukses/error
  const [result, setResult] = useState<FormResult | null>(null);
  // useTransition untuk menangani loading state tanpa memblokir UI
  const [isPending, startTransition] = useTransition();

  /**
   * Fungsi yang dipanggil saat form disubmit
   */
  async function handleSubmit(formData: FormData) {
    setResult(null); // Reset pesan

    startTransition(async () => {
      const actionResult = await generateCodesAction(formData);
      setResult(actionResult); // Tampilkan pesan (termasuk kode jika sukses)
    });
  }

  /**
   * Fungsi helper untuk men-download file CSV
   */
  function downloadCSV(codes: { kode: string }[], productName: string) {
    // 1. Buat header CSV
    const csvHeader = "kode\n";
    // 2. Buat baris-baris CSV
    const csvRows = codes.map((c) => c.kode).join("\n");
    // 3. Gabungkan header dan baris
    const csvContent = csvHeader + csvRows;

    // 4. Buat Blob (file di memori)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // 5. Buat link download palsu
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // 6. Buat nama file yang bersih
    const safeProductName = productName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();
    link.setAttribute("href", url);
    link.setAttribute("download", `kode_verifikasi_${safeProductName}.csv`);
    link.style.visibility = "hidden";

    // 7. Klik link tersebut secara otomatis
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Pilihan Produk */}
      <div>
        <label
          htmlFor="productId"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Pilih Produk <span className="text-red-500">*</span>
        </label>
        <select
          id="productId"
          name="productId"
          required
          disabled={isPending}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
        >
          <option value="">-- Pilih satu produk --</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.nama} ({product.gramasi} gr)
            </option>
          ))}
        </select>
      </div>

      {/* Jumlah Kode */}
      <div>
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Jumlah Kode <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="quantity"
          id="quantity"
          required
          min="1"
          max="1000"
          disabled={isPending}
          placeholder="Contoh: 100"
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Jumlah kode unik yang ingin Anda buat (Maks. 1000).
        </p>
      </div>

      {/* Tombol Submit */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Sedang Memproses..." : "Generate Kode"}
        </button>
      </div>

      {/* Tampilkan Pesan Hasil */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-md text-sm ${
            result.error
              ? "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200"
              : "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200"
          }`}
        >
          <p className="font-medium">{result.error || result.success}</p>

          {/* <-- Tombol Download Baru --> */}
          {result.success && result.codes && result.productName && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => downloadCSV(result.codes!, result.productName!)}
                className="inline-flex items-center gap-2 rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download {result.codes.length} Kode (.csv)
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
