"use client";

import { Invoice, InvoiceItem, SossilverProduct } from "@prisma/client";
import { CustomerUploadForm } from "./CustomerUploadForm";
import { formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

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

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      {/* Bagian Atas: Info, Total, dan Tombol Download */}
      <div className="flex flex-col sm:flex-row justify-between items-start">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {invoice.invoiceNumber}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tanggal Order: {formatDate(invoice.createdAt)}
          </p>

          {canDownload && (
            <Button asChild variant="outline" size="sm" className="mt-2">
              <Link href={`/invoice/${invoice.id}`} target="_blank">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Link>
            </Button>
          )}
        </div>
        <div className="text-left sm:text-right mt-2 sm:mt-0">
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

      <hr className="my-3" />

      {/* --- INI BAGIAN LOGIKA STATUS ANDA --- */}

      {/* Status 1: MENUNGGU_KONFIRMASI_ADMIN */}
      {invoice.status === "MENUNGGU_KONFIRMASI_ADMIN" && (
        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-md">
          <p className="font-semibold text-yellow-800">
            Menunggu Konfirmasi Admin
          </p>
          <p className="text-sm text-yellow-700">
            Admin kami sedang menghitung total akhir (termasuk ongkir/diskon).
            Harap tunggu sebelum melakukan pembayaran.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Subtotal Awal: {formatCurrency(invoice.subTotal)}
          </p>
        </div>
      )}

      {/* Status 2: UNPAID (Siap Bayar) */}
      {invoice.status === "UNPAID" && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-md">
          <p className="font-semibold text-red-800">Menunggu Pembayaran</p>
          <p className="text-lg text-red-700 font-bold">
            Total Tagihan: {formatCurrency(invoice.totalAmount)}
          </p>
          <hr className="my-3 border-red-200" />
          <CustomerUploadForm invoiceId={invoice.id} />
        </div>
      )}

      {/* Status 3: WAITING_VERIFICATION */}
      {invoice.status === "WAITING_VERIFICATION" && (
        <div className="p-3 bg-blue-50 border border-blue-300 rounded-md">
          <p className="font-semibold text-blue-800">
            Pembayaran sedang diverifikasi...
          </p>
          <p className="text-sm text-blue-700">
            Bukti bayar Anda sudah kami terima dan akan segera diperiksa oleh
            admin.
          </p>
          {invoice.paymentProofUrl && (
            <div className="mt-2">
              <a
                href={invoice.paymentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Image
                  src={invoice.paymentProofUrl}
                  alt="Bukti bayar"
                  width={80}
                  height={80}
                  className="rounded-md object-cover border hover:opacity-80"
                />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Status 4 & 5: Diproses/Dikirim */}
      {(invoice.status === "SEDANG_DISIAPKAN" ||
        invoice.status === "SEDANG_PENGIRIMAN") && (
        <div className="p-3 bg-indigo-50 border border-indigo-300 rounded-md">
          <p className="font-semibold text-indigo-800">
            {invoice.status === "SEDANG_DISIAPKAN"
              ? "Pesanan Disiapkan"
              : "Pesanan Dikirim"}
          </p>
          <p className="text-sm text-indigo-700">
            Pesanan Anda sedang kami proses.
          </p>
        </div>
      )}

      {/* Status 6: Selesai */}
      {invoice.status === "SELESAI" && (
        <div className="p-3 bg-green-50 border border-green-300 rounded-md">
          <p className="font-semibold text-green-800">Pesanan Selesai</p>
        </div>
      )}

      {/* Status 7: Dibatalkan */}
      {invoice.status === "CANCELLED" && (
        <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
          <p className="font-semibold text-gray-700">Pesanan Dibatalkan</p>
          {/* [PERBAIKAN] Mengganti </D> menjadi </p> */}
        </div>
      )}
      {/* --- AKHIR LOGIKA STATUS --- */}
    </div>
  );
}
