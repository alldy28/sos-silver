// src/app/dashboard/factory/page.tsx

import { db } from "@/lib/db";
import { CreateFactoryBatchForm } from "./components/CreateFactoryBatchForm";
import { FactoryPaymentCard } from "./components/FactoryPaymentCard";
import { Factory } from "lucide-react"; // Ikon opsional untuk header

export const metadata = {
  title: "Manajemen Pabrik | Dashboard",
};

export default async function FactoryPage() {
  // 1. Ambil data tagihan dari database
  // Diurutkan dari yang paling baru dibuat
  const batches = await db.factoryPayment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true }, // Hitung jumlah invoice di dalam setiap tagihan
      },
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600">
          <Factory className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pembayaran Pabrik
          </h1>
          <p className="text-sm text-gray-500">
            Kelola cut-off invoice dan pelunasan tagihan produksi.
          </p>
        </div>
      </div>

      {/* BAGIAN 1: FORM GENERATE TAGIHAN */}
      <section>
        <CreateFactoryBatchForm />
      </section>

      <hr className="border-gray-200" />

      {/* BAGIAN 2: LIST RIWAYAT TAGIHAN */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          Riwayat Tagihan
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {batches.length}
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {batches.length > 0 ? (
            batches.map((batch) => (
              <FactoryPaymentCard
                key={batch.id}
                data={batch}
                invoiceCount={batch._count.invoices}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Belum ada riwayat tagihan pabrik.</p>
              <p className="text-sm text-gray-400">
                Silakan buat tagihan baru di form atas.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
