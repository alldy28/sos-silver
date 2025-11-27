import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Role, Invoice, InvoiceItem } from "@prisma/client";
import { TransactionTabs } from "./components/TransactionTabs";
import { SossilverProduct } from "@prisma/client";

/**
 * MyAccount Transactions Page
 * Halaman untuk menampilkan semua order/transaksi milik customer
 */

// ✅ Enable dynamic rendering untuk cache revalidation
export const dynamic = "force-dynamic";

// ✅ Revalidate setiap 60 detik (untuk cache ISR)
export const revalidate = 60;

/**
 * Type definition untuk transaksi
 */
export type FullInvoice = Invoice & {
  items: (InvoiceItem & {
    product: SossilverProduct;
  })[];
};

/**
 * Metadata untuk SEO
 */
export const metadata = {
  title: "Order Saya | Sossilver",
  description: "Kelola dan lihat semua order Anda di Sossilver",
  robots: {
    index: false, // Jangan index halaman akun
    follow: false,
  },
};

/**
 * Main Component
 */
export default async function MyAccountTransactionsPage() {
  try {
    // 1. Dapatkan sesi user
    const session = await auth();

    // 2. Validasi user
    if (!session?.user) {
      console.warn("⚠️ No session found, redirecting to login");
      redirect("/login-customer");
    }

    // 3. Validasi role
    if (session.user.role !== Role.CUSTOMER) {
      console.warn("⚠️ User is not a customer, access denied");
      redirect("/login-customer");
    }

    const userId = session.user.id;
    console.log("📋 Fetching transactions for user:", userId);

    // 4. Ambil data invoice (transaksi) milik user dari database
    const userTransactions = await db.invoice.findMany({
      where: {
        customerId: userId, // HANYA invoice milik user ini
      },
      include: {
        items: {
          include: {
            product: true, // Detail produk untuk setiap item
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Terbaru di atas
      },
    });

    console.log(
      `✅ Found ${userTransactions.length} transactions for user ${userId}`
    );

    // 5. Render halaman
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order Saya
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kelola dan lihat status semua order Anda
          </p>
        </div>

        {/* Status Summary */}
        <OrderSummary transactions={userTransactions} />

        {/* Tabs Content */}
        {userTransactions.length > 0 ? (
          <TransactionTabs transactions={userTransactions} />
        ) : (
          <EmptyState />
        )}
      </div>
    );
  } catch (error) {
    console.error("❌ Error in MyAccountTransactionsPage:", error);

    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-4">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Terjadi Kesalahan
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kami tidak dapat memuat order Anda. Silakan coba lagi nanti.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          Muat Ulang
        </button>
      </div>
    );
  }
}

/**
 * Order Summary Component
 * Menampilkan ringkasan status order
 */
function OrderSummary({ transactions }: { transactions: FullInvoice[] }) {
  const stats = {
    total: transactions.length,
    pending: transactions.filter((t) => t.status === "UNPAID").length,
    processing: transactions.filter(
      (t) => t.status === "SEDANG_DISIAPKAN" || t.status === "SEDANG_PENGIRIMAN"
    ).length,
    completed: transactions.filter((t) => t.status === "SELESAI").length,
    cancelled: transactions.filter((t) => t.status === "CANCELLED").length,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {/* Total Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.total}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Total Order
        </div>
      </div>

      {/* Pending Payment */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
          {stats.pending}
        </div>
        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
          Menunggu Bayar
        </div>
      </div>

      {/* Processing */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {stats.processing}
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Diproses
        </div>
      </div>

      {/* Completed */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {stats.completed}
        </div>
        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
          Selesai
        </div>
      </div>

      {/* Cancelled */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-600">
        <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          {stats.cancelled}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          Dibatalkan
        </div>
      </div>
    </div>
  );
}

/**
 * Empty State Component
 * Ditampilkan ketika user belum punya order
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
      <div className="text-center space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Belum ada order
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Anda belum melakukan pemesanan apapun. Mulai belanja sekarang!
        </p>
        <div className="pt-4">
          <a
            href="/produk"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition"
          >
            Mulai Belanja
          </a>
        </div>
      </div>
    </div>
  );
}
