import { auth } from "@/auth";
import { getAffiliateData } from "@/actions/affiliate-actions";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Users, DollarSign, Link as LinkIcon } from "lucide-react";
// [NEW] Import the client form
import { ActivateAffiliateForm } from "../components/ActivateAffiliateForm";

export default async function AffiliatePage() {
  const session = await auth();
  if (!session?.user) redirect("/login-customer");

  const data = await getAffiliateData();

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
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Dapatkan Link</h3>
              <p className="text-sm text-gray-500">
                Aktifkan akun dan dapatkan link referral unik Anda.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Bagikan</h3>
              <p className="text-sm text-gray-500">
                Share link ke teman atau media sosial Anda.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700">
              <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Dapat Komisi</h3>
              <p className="text-sm text-gray-500">
                Terima komisi <strong>2.5%</strong> dari setiap transaksi
                sukses.
              </p>
            </div>
          </div>

          <div className="pt-8">
            {/* [FIX] Use the Client Component here */}
            <ActivateAffiliateForm />
          </div>
        </div>
      </div>
    );
  }

  // --- KONDISI 2: SUDAH JADI AFFILIATE (DASHBOARD) ---
  const referralLink = `${process.env.NEXTAUTH_URL || "https://sossilver.co.id"}/produk?ref=${data.code}`;

  // [FIX] Ensure numbers are safe to use (defaults to 0 if undefined)
  const totalCommission = data.totalCommission ?? 0;
  const historyCount = data.history ? data.history.length : 0;

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

      <Card className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-none shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <p className="text-indigo-100 font-medium mb-1">
                Link Referral Anda
              </p>
              <h3 className="text-2xl font-bold">Bagikan & Dapatkan Komisi</h3>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
              <span className="text-xs text-indigo-200 uppercase tracking-wider block">
                Kode Referral
              </span>
              <span className="text-xl font-mono font-bold">{data.code}</span>
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center">
            <code className="flex-1 text-sm sm:text-base font-mono break-all text-indigo-50">
              {referralLink}
            </code>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Komisi Cair
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                Rp {totalCommission.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
              <DollarSign className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Transaksi Referral
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {historyCount}{" "}
                <span className="text-base font-normal text-gray-400">
                  Pesanan
                </span>
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
              <Users className="w-8 h-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700">
          <CardTitle className="text-lg">Riwayat Komisi Masuk</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!data.history || data.history.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <DollarSign className="w-8 h-8" />
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
              <table className="w-full text-sm text-left">
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
                  {/* [FIX] Removing 'any' type */}
                  {data.history.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Date(log.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {log.invoice.customerName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {log.invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600 dark:text-green-400">
                        + Rp {log.amount.toLocaleString("id-ID")}
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
