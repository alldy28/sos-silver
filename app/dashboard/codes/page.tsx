import { db } from "@/lib/db";
import { SossilverProduct } from "@prisma/client";
import { CodeGeneratorForm } from "./CodeGeneratorForm";
import { Package, QrCode } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Halaman untuk me-render Form Generator Kode.
 * Ini adalah Server Component yang mengambil data produk.
 */
export default async function GenerateCodesPage() {
  // 1. Ambil semua produk untuk ditampilkan di dropdown
  const products: SossilverProduct[] = await db.sossilverProduct.findMany({
    orderBy: {
      nama: "asc",
    },
  });

  // 2. Ambil statistik sederhana
  const totalCodes = await db.generatedCode.count();
  const totalProducts = products.length;

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Tombol Kembali */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom Kiri: Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Generate Kode Unik
              </h1>
              {/* 3. Render Client Component (Form) dan berikan data produk */}
              <CodeGeneratorForm products={products} />
            </div>
          </div>

          {/* Kolom Kanan: Statistik */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistik
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Kode Dibuat
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalCodes.toLocaleString("id-ID")}
                    </dd>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="shrink-0 bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full">
                    <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Produk
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalProducts.toLocaleString("id-ID")}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
