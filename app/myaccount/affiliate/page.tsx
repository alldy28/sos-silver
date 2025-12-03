import { auth } from "@/auth";
import { getAffiliateData } from "@/actions/affiliate-actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Share2,
  DollarSign,
  Link as LinkIcon,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
// Pastikan path import komponen ini benar sesuai struktur folder Anda
import { ActivateAffiliateForm } from "./components/ActivateAffiliateForm";
import { PayoutSection } from "./components/PayoutSection";
import { ReferralCustomerTable } from "./components/ReferralCustomerTable";

// --- Definisi Tipe Data ---
interface CommissionLog {
  id: string;
  createdAt: Date | string;
  amount: number;
  invoice: {
    customerName: string;
    invoiceNumber: string;
  };
}

interface PayoutLog {
  id: string;
  amount: number;
  status: string;
  bankName: string;
  accountNumber: string;
  createdAt: Date | string;
}

// [BARU] Tipe untuk data referral pelanggan
interface ReferralCustomer {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
}

interface AffiliateData {
  isAffiliate: boolean;
  code: string | null;
  totalCommission: number;
  availableBalance: number;
  pendingPayout: number;
  paidPayout: number;
  history: CommissionLog[];
  payouts: PayoutLog[];
  // [BARU] Tambahkan field ini
  referrals: ReferralCustomer[];
}

// --- Helper Functions ---

const getBaseUrl = (): string => {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
};

const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "-";
  }
};

const formatCurrency = (amount: number | undefined | null): string => {
  if (amount == null || isNaN(amount)) return "0";
  return amount.toLocaleString("id-ID");
};

const ErrorFallback = () => (
  <div className="flex items-center justify-center py-12 px-4">
    <div className="w-full max-w-md bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
      <h3 className="font-semibold text-red-800">Gagal Memuat Data</h3>
      <p className="text-sm text-red-700 mt-1">Silakan coba lagi nanti.</p>
    </div>
  </div>
);

export default async function AffiliatePage() {
  const session = await auth();
  if (!session?.user) redirect("/login-customer");

  let data: AffiliateData | null = null;

  try {
    // Pastikan getAffiliateData di actions/affiliate-actions.ts
    // sudah diupdate untuk mengembalikan field 'referrals' juga.
    // Jika belum, Anda perlu update action tersebut.
    // (Lihat catatan di bawah kode ini)
    data = (await getAffiliateData()) as unknown as AffiliateData;
  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    return <ErrorFallback />;
  }

  // --- KONDISI 1: BELUM DAFTAR AFFILIATE ---
  if (!data || !data.isAffiliate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[60vh]">
        <div className="w-full max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Program Affiliate Sossilver
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Dapatkan penghasilan tambahan dengan mereferensikan produk kami!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ... (Bagian Benefit sama seperti sebelumnya) ... */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col items-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">1. Dapatkan Link</h3>
              <p className="text-sm text-gray-500">
                Dapatkan link referral unik Anda.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">2. Bagikan</h3>
              <p className="text-sm text-gray-500">
                Share ke teman atau sosmed.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">3. Terima Komisi</h3>
              <p className="text-sm text-gray-500">
                Dapatkan <strong>2.5%</strong> dari setiap transaksi sukses.
              </p>
            </div>
          </div>

          <div className="pt-4 w-full max-w-md mx-auto">
            <ActivateAffiliateForm />
          </div>
        </div>
      </div>
    );
  }

  // --- KONDISI 2: DASHBOARD AFFILIATE ---
  const baseUrl = getBaseUrl();
  const referralLink = `${baseUrl}/produk?ref=${data.code || ""}`;
  const whatsappUrl = `https://wa.me/?text=Beli%20produk%20silver%20berkualitas%20di%20Sossilver!%20Cek%20di%20sini:%20${encodeURIComponent(
    referralLink
  )}`;

  const {
    availableBalance = 0,
    payouts = [],
    history = [],
    referrals = [],
  } = data;
  const historyCount = history.length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Affiliate
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Pantau kinerja & komisi Anda.
        </p>
      </div>

      {/* --- INLINED REFERRAL LINK CARD (Server Component Version) --- */}
      <Card className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-none shadow-lg overflow-hidden relative">
        {/* Hiasan background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <p className="text-indigo-100 font-medium mb-1">
                Link Referral Anda
              </p>
              <h3 className="text-2xl font-bold">Bagikan & Dapatkan Komisi</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30 whitespace-nowrap">
              <span className="text-xs text-indigo-200 uppercase tracking-wider block">
                Kode Referral
              </span>
              <span className="text-xl font-mono font-bold">{data.code}</span>
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center border border-white/10">
            <Share2 className="w-5 h-5 text-indigo-200 hidden sm:block flex-shrink-0" />

            <code className="flex-1 text-sm sm:text-base font-mono break-all text-white overflow-hidden select-all">
              {referralLink}
            </code>

            {/* Tombol Share WhatsApp (Pengganti Copy Button agar bisa 1 file) */}
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 transition-all duration-200 min-w-[100px]"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Bagikan ke WhatsApp"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Share WA
              </a>
            </Button>
          </div>

          <p className="text-sm text-indigo-200 mt-4">
            Bagikan link ini ke media sosial. Komisi otomatis cair saat pesanan
            statusnya SELESAI.
          </p>
        </CardContent>
      </Card>

      <PayoutSection availableBalance={availableBalance} payouts={payouts} />

      <ReferralCustomerTable referrals={referrals} />

      {/* 3. [BARU] Daftar Pelanggan Referral */}

      {/* 4. Riwayat Komisi (Tetap Ada) */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Riwayat Komisi Masuk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* ... (Kode tabel komisi Anda yang lama bisa ditaruh di sini) ... */}
          {historyCount === 0 ? (
            <div className="text-center py-8 px-4 text-gray-500 text-sm">
              Belum ada komisi masuk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase">
                  <tr>
                    <th className="px-6 py-3">Tanggal</th>
                    <th className="px-6 py-3">Dari Invoice</th>
                    <th className="px-6 py-3 text-right">Komisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.map((log) => (
                    <tr key={log.id}>
                      <td className="px-6 py-3 text-gray-500">
                        {formatDate(log.createdAt)}
                      </td>
                      <td className="px-6 py-3">
                        {log.invoice.invoiceNumber} <br />
                        <span className="text-xs text-gray-400">
                          {log.invoice.customerName}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-green-600">
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
