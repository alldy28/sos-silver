import { auth } from "@/auth"; // Impor helper auth Anda
import { db } from "@/lib/db"; // Impor Prisma client
import { redirect } from "next/navigation";
import { TransactionTabs } from "./components/TransactionTabs"; // Impor Tab
import { Role } from "@prisma/client";

/**
 * [FILE BARU]
 * Ini adalah halaman default untuk /myaccount
 * Isinya HANYA logika untuk mengambil dan menampilkan transaksi.
 */
export default async function MyAccountTransactionsPage() {
  // 1. Dapatkan sesi user
  const session = await auth();

  if (!session?.user || session.user.role !== Role.CUSTOMER) {
    redirect("/login-customer");
  }

  // 2. Ambil data invoice (transaksi) milik user ini dari database
  const userTransactions = await db.invoice.findMany({
    where: {
      customerId: session.user.id, // Ambil HANYA invoice milik user ini
    },
    include: {
      items: {
        include: {
          product: true, // Ambil detail produk untuk setiap item
        },
      },
    },
    orderBy: {
      createdAt: "desc", // Tampilkan yang terbaru di atas
    },
  });

  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Order Saya
      </h2>
      <TransactionTabs transactions={userTransactions} />
    </>
  );
}
