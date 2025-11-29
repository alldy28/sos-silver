import { db } from "@/lib/db";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  User,
  ShoppingCart,
  Percent,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

// Helper format uang
const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString("id-ID")}`;

// Helper format tanggal
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== Role.ADMIN) {
    redirect("/login-customer");
  }

  const { userId } = await params;

  // Ambil data user lengkap
  const customer = await db.user.findUnique({
    where: { id: userId },
    include: {
      // Riwayat belanja customer sendiri
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      },
      // Riwayat komisi affiliate (jika ada)
      commissions: {
        orderBy: { createdAt: "desc" },
        include: {
          invoice: { select: { invoiceNumber: true, customerName: true } },
        },
      },
      // Riwayat penjualan referral (jika ada)
      referredInvoices: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          customerName: true,
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  // Hitung statistik
  const totalSpent = customer.orders.reduce(
    (acc, order) => acc + order.totalAmount,
    0
  );
  const totalCommissionEarned = customer.commissions.reduce(
    (acc, comm) => acc + comm.amount,
    0
  );
  const totalReferralSales = customer.referredInvoices.reduce(
    (acc, inv) => acc + inv.totalAmount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Detail Pelanggan
        </h1>
      </div>

      {/* Info Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu Profil */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-indigo-500" /> Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Nama Lengkap</p>
              <p className="font-medium">{customer.name || "Tanpa Nama"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status Akun</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${customer.emailVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"}`}
                >
                  {customer.emailVerified
                    ? "Terverifikasi"
                    : "Belum Verifikasi"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${customer.isAffiliate ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}
                >
                  {customer.isAffiliate ? "Affiliate Aktif" : "Bukan Affiliate"}
                </span>
              </div>
            </div>
            {customer.isAffiliate && (
              <div>
                <p className="text-xs text-gray-500">Kode Referral</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                  {customer.affiliateCode}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kartu Statistik */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Ringkasan Aktivitas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-medium">Total Belanja</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {customer.orders.length} Pesanan
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Total Komisi</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(totalCommissionEarned)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                Dari program affiliate
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Percent className="w-4 h-4" />
                <span className="text-sm font-medium">Omset Referral</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {formatCurrency(totalReferralSales)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                {customer.referredInvoices.length} Pesanan Direferensikan
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat Pesanan (Belanja Sendiri) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Riwayat Pesanan (Belanja Pribadi)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.orders.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">
              Belum ada pesanan.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">
                        {order.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100">
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/dashboard/invoice/${order.id}`}
                          className="text-indigo-600 hover:underline text-xs"
                        >
                          Lihat
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Riwayat Referral (Jika Affiliate) */}
      {customer.isAffiliate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Referral & Komisi</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.commissions.length === 0 ? (
              <p className="text-center text-gray-500 py-4 text-sm">
                Belum ada komisi yang didapatkan.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3">Tanggal Komisi</th>
                      <th className="px-4 py-3">Dari Pesanan</th>
                      <th className="px-4 py-3">Pelanggan</th>
                      <th className="px-4 py-3 text-right">Jumlah Komisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.commissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {formatDate(comm.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {comm.invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-3">
                          {comm.invoice.customerName}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-green-600">
                          + {formatCurrency(comm.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
