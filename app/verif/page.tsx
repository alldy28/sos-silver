"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Search } from "lucide-react";

/**
 * Halaman form untuk memasukkan kode verifikasi 8 digit.
 */
export default function VerifyPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Menangani submit form
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error
    setIsLoading(true);

    // Validasi sederhana
    if (!code || code.length < 8) {
      setError("Kode verifikasi harus 8 digit.");
      setIsLoading(false);
      return;
    }

    // Ubah kode menjadi huruf besar (sesuai 'nanoid' di action)
    const formattedCode = code.toUpperCase();

    // Arahkan ke halaman hasil dinamis
    router.push(`/verif/${formattedCode}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
              <QrCode className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Verifikasi Keaslian Produk
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Masukkan 8 digit kode unik yang Anda temukan pada produk.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 sr-only"
              >
                Kode Verifikasi
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="code"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isLoading}
                  maxLength={8}
                  placeholder="Contoh: U1VVG1B8"
                  // Otomatis ubah ke huruf besar saat diketik
                  onInput={(e) =>
                    (e.currentTarget.value =
                      e.currentTarget.value.toUpperCase())
                  }
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white px-4 py-3 text-lg text-center tracking-widest font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex justify-center items-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memeriksa..." : "Verifikasi Sekarang"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
