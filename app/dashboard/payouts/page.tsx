import { db } from "@/lib/db";
import { PayoutList } from "./_components/PayoutList"; // Kita akan buat ini

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  // Ambil semua request, urutkan status PENDING di atas
  const requests = await db.payoutRequest.findMany({
    include: {
      affiliate: {
        select: { name: true, email: true, affiliateCode: true },
      },
    },
    orderBy: [
      { status: "asc" }, // PENDING (P) akan muncul sebelum PROCESSED
      { createdAt: "desc" },
    ],
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Permintaan Pencairan Komisi
      </h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <PayoutList requests={requests} />
      </div>
    </div>
  );
}
