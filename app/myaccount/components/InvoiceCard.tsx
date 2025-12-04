// app/myaccount/components/InvoiceCard.tsx
"use client";

import { useState } from "react";
import { Invoice, InvoiceItem, SossilverProduct } from "@prisma/client";
import { UploadProofModal } from "./UploadProofModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download, UploadCloud, Truck, Copy } from "lucide-react"; // [BARU] Import Truck & Copy
import Link from "next/link";
import { toast } from "sonner"; // Opsional: Untuk notifikasi copy

export type FullInvoice = Invoice & {
  items: (InvoiceItem & {
    product: SossilverProduct;
  })[];
};

interface InvoiceCardProps {
  invoice: FullInvoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const canDownload = invoice.status !== "MENUNGGU_KONFIRMASI_ADMIN";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCloseModal = () => setIsModalOpen(false);

  const handleCopyResi = () => {
    if (invoice.trackingNumber) {
      navigator.clipboard.writeText(invoice.trackingNumber);
      // Jika pakai Sonner/Toast library:
      toast.success("Nomor resi disalin!");
      // Atau alert biasa:
      // alert("Nomor resi disalin!");
    }
  };

  return (
    <>
      <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800 transition-shadow hover:shadow-md">
        {/* Bagian Atas: Info, Total, dan Tombol Download */}
        <div className="flex flex-col sm:flex-row justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tanggal Order: {formatDate(invoice.createdAt)}
            </p>

            {canDownload && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href={`/invoice/${invoice.id}`} target="_blank">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Link>
              </Button>
            )}
          </div>

          <div className="text-left sm:text-right mt-4 sm:mt-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Harga
            </p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {invoice.status === "MENUNGGU_KONFIRMASI_ADMIN"
                ? `(Menunggu Konfirmasi)`
                : formatCurrency(invoice.totalAmount)}
            </p>
          </div>
        </div>

        <hr className="my-4 border-gray-100 dark:border-gray-700" />

        {/* --- LOGIKA STATUS INVOICE --- */}

        {/* Status 1: MENUNGGU_KONFIRMASI_ADMIN */}
        {invoice.status === "MENUNGGU_KONFIRMASI_ADMIN" && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="font-semibold text-yellow-800 flex items-center gap-2">
              ⏳ Menunggu Konfirmasi Admin
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Admin kami sedang menghitung total akhir (termasuk ongkir/diskon).
              Harap tunggu sebentar.
            </p>
            <p className="text-sm text-gray-600 mt-2 font-medium">
              Subtotal Awal: {formatCurrency(invoice.subTotal)}
            </p>
          </div>
        )}

        {/* Status 2: UNPAID (Siap Bayar) */}
        {invoice.status === "UNPAID" && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="font-semibold text-red-800">
                  Menunggu Pembayaran
                </p>
                <p className="text-lg text-red-700 font-bold mt-1">
                  Tagihan: {formatCurrency(invoice.totalAmount)}
                </p>
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Upload Bukti Bayar
              </Button>
            </div>
          </div>
        )}

        {/* Status 3: WAITING_VERIFICATION */}
        {invoice.status === "WAITING_VERIFICATION" && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <p className="font-semibold text-blue-800">
                🔍 Pembayaran sedang diverifikasi
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Terima kasih! Bukti bayar Anda sedang kami cek. Proses ini
                biasanya memakan waktu 1x24 jam.
              </p>
            </div>
            {invoice.paymentProofUrl && (
              <div className="flex-shrink-0">
                <p className="text-xs text-blue-600 mb-1 font-medium">
                  Bukti Anda:
                </p>
                <img
                  src={invoice.paymentProofUrl}
                  alt="Bukti bayar"
                  className="w-16 h-16 rounded border border-blue-200 object-cover"
                />
              </div>
            )}
          </div>
        )}

        {/* Status 4 & 5: Diproses / Dikirim */}
        {(invoice.status === "SEDANG_DISIAPKAN" ||
          invoice.status === "SEDANG_PENGIRIMAN") && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-md space-y-3">
            <div>
              <p className="font-semibold text-indigo-800 flex items-center gap-2">
                {invoice.status === "SEDANG_DISIAPKAN" ? (
                  <>📦 Pesanan Sedang Disiapkan</>
                ) : (
                  <>🚚 Pesanan Sedang Dikirim</>
                )}
              </p>
              <p className="text-sm text-indigo-700 mt-1">
                {invoice.status === "SEDANG_DISIAPKAN"
                  ? "Pesanan Anda sedang dipacking dengan aman."
                  : "Paket Anda sudah diserahkan ke kurir ekspedisi."}
              </p>
            </div>

            {/* [BARU] TAMPILKAN RESI JIKA ADA */}
            {invoice.trackingNumber && (
              <div className="mt-3 bg-white p-3 rounded border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-indigo-500 uppercase font-bold tracking-wide">
                    Nomor Resi
                  </p>
                  <p className="font-mono font-medium text-indigo-900 text-lg">
                    {invoice.trackingNumber}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyResi}
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                  title="Salin Resi"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Status 6: Selesai */}
        {invoice.status === "SELESAI" && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-semibold text-green-800 flex items-center gap-2">
              ✅ Pesanan Selesai
            </p>
            <p className="text-sm text-green-700 mt-1">
              Terima kasih telah berbelanja di Sossilver!
            </p>

            {/* Tampilkan Resi juga di status Selesai untuk arsip */}
            {invoice.trackingNumber && (
              <div className="mt-2 text-sm text-green-800/70 flex items-center gap-2">
                <Truck className="w-3 h-3" />
                <span>
                  Resi:{" "}
                  <span className="font-mono">{invoice.trackingNumber}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status 7: Dibatalkan */}
        {invoice.status === "CANCELLED" && (
          <div className="p-4 bg-gray-100 border border-gray-200 rounded-md">
            <p className="font-semibold text-gray-700">❌ Pesanan Dibatalkan</p>
            <p className="text-sm text-gray-600 mt-1">
              Jika Anda merasa ini kesalahan, silakan hubungi admin.
            </p>
          </div>
        )}

        {/* --- AKHIR LOGIKA STATUS --- */}
      </div>

      {/* Modal untuk upload bukti pembayaran */}
      {isModalOpen && (
        <UploadProofModal invoice={invoice} onClose={handleCloseModal} />
      )}
    </>
  );
}
