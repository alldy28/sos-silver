/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/auth";
import { getAffiliateData } from "@/actions/affiliate-actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Share2,
  Users,
  DollarSign,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import { ActivateAffiliateForm } from "../components/ActivateAffiliateForm";
import { ReferralLinkCard } from "./components/ReferralLinkCard";
import { PayoutSection } from "./components/PayoutSection";

// Types
interface CommissionLog {
  id: string;
  createdAt: string | Date;
  amount: number;
  invoice: {
    customerName: string;
    invoiceNumber: string;
  };
}

interface AffiliateData {
  isAffiliate: boolean;
  code: string | null;
  totalCommission: number;
  availableBalance: number;
  pendingPayout: number;
  paidPayout: number;
  history: CommissionLog[];
  payouts: any[];
}

// Utility functions
const getBaseUrl = (): string => {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) {
    console.error("NEXTAUTH_URL atau NEXT_PUBLIC_APP_URL tidak diset");
    throw new Error("Base URL configuration missing");
  }

  return baseUrl;
};

const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return "Tanggal tidak valid";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Tanggal tidak valid";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Tanggal tidak valid";
  }
};

const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0";
  }

  return amount.toLocaleString("id-ID");
};

const ErrorFallback = () => (
  <div className="flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
      <div className="flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800 dark:text-red-200">
            Gagal Memuat Data
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Terjadi kesalahan saat memuat data affiliate. Silakan coba lagi atau
            hubungi support.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default async function AffiliatePage() {
  const session = await auth();
  if (!session?.user) redirect("/login-customer");

  // Error handling untuk getAffiliateData
  let data: AffiliateData | null = null;

  try {
    data = await getAffiliateData();
  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    return <ErrorFallback />;
  }

  // --- KONDISI 1: BELUM DAFTAR AFFILIATE ---
  if (!data || !data.isAffiliate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-full max-w-2xl text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Program Affiliate Sossilver
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Bergabunglah dengan program kami dan dapatkan penghasilan tambahan!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <div
                className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"
                role="img"
                aria-label="Ikon dapatkan link referral"
              >
                <LinkIcon className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">Dapatkan Link</h3>
              <p className="text-sm text-gray-500">
                Aktifkan akun dan dapatkan link referral unik Anda.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <div
                className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                role="img"
                aria-label="Ikon bagikan ke media sosial"
              >
                <Share2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">Bagikan</h3>
              <p className="text-sm text-gray-500">
                Share link ke teman atau media sosial Anda.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <div
                className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4"
                role="img"
                aria-label="Ikon dapatkan komisi"
              >
                <DollarSign className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold mb-2">Dapat Komisi</h3>
              <p className="text-sm text-gray-500">
                Terima komisi <strong>2.5%</strong> dari setiap transaksi
                sukses.
              </p>
            </div>
          </div>

          <div className="pt-8">
            <ActivateAffiliateForm />
          </div>
        </div>
      </div>
    );
  }

  // --- KONDISI 2: SUDAH JADI AFFILIATE (DASHBOARD) ---
  const baseUrl = getBaseUrl();
  const referralLink = `${baseUrl}/produk?ref=${data.code || ""}`;
  const { totalCommission, availableBalance, history, payouts } = data;
  const hasHistory = history && history.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Affiliate
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Pantau kinerja referral dan komisi Anda di sini.
        </p>
      </div>

      <ReferralLinkCard
        referralLink={referralLink}
        referralCode={data.code || ""}
      />

      <PayoutSection availableBalance={availableBalance} payouts={payouts} />

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
          <CardTitle className="text-lg">
            Riwayat Komisi Masuk {hasHistory && `(${history.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!hasHistory ? (
            <div className="text-center py-12 px-4">
              <div
                className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"
                role="img"
                aria-label="Ikon tidak ada komisi"
              >
                <DollarSign className="w-8 h-8" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Belum ada komisi
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Bagikan link referral Anda sekarang untuk mulai mendapatkan
                komisi dari setiap pembelian.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm text-left"
                aria-label="Tabel riwayat komisi masuk"
              >
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Tanggal</th>
                    <th className="px-6 py-4 whitespace-nowrap">Pelanggan</th>
                    <th className="px-6 py-4 whitespace-nowrap">No. Invoice</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">
                      Komisi (2.5%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {history.map((log: CommissionLog) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {log.invoice?.customerName || "Tidak tersedia"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {log.invoice?.invoiceNumber || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                        + Rp {formatCurrency(log.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
