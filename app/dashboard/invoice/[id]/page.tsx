// app/dashboard/invoice/[id]/page.tsx

import { getInvoiceByIdAction } from "../../../../actions/invoice-actions";
import { notFound } from "next/navigation";
import type { InvoiceItem, SossilverProduct } from "@prisma/client";
import {
  User,
  Phone,
  MapPin,
  Package,
  DollarSign,
} from "lucide-react";
import UpdateStatusButton from "../_components/UpdateStatusButton";
import GeneratePdfButton from "../_components/GeneratePdfButton";
import UploadPaymentProof from "../_components/UploadPaymentProof";

// --- Fungsi Helper (Bisa dipindah ke file utils jika mau) ---

type InvoiceItemWithProduct = InvoiceItem & {
  product: SossilverProduct;
};

const formatDate = (date: Date) =>
  new Date(date).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString("id-ID")}`;

const formatStatus = (status: string) => {
  switch (status) {
    case "PAID":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          LUNAS
        </span>
      );
    case "UNPAID":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          BELUM LUNAS
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
          BATAL
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
          {status}
        </span>
      );
  }
};
// --- Batas Fungsi Helper ---

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

    const awaitedParams = await params;

  const invoice = await getInvoiceByIdAction(awaitedParams.id);

  if (!invoice) {
    notFound();
  }

  // Hitung subtotal dari item
  const subTotal = invoice.items.reduce(
    (acc: number, item: InvoiceItemWithProduct) =>
      acc + item.priceAtTime * item.quantity,
    0
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* =========================================================
        KONTEN YANG AKAN DI-PRINT SEBAGAI PDF DIMULAI DARI SINI
        =========================================================
      */}
      <div
        id="invoice-pdf-content"
        className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-lg shadow-lg"
      >
        {/* Header Invoice */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Invoice #{invoice.invoiceNumber.substring(0, 8)}...
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Dibuat pada: {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-2">{formatStatus(invoice.status)}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ID: {invoice.id}
            </p>
          </div>
        </div>

        {/* Info Pelanggan */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center dark:text-white">
            <User className="w-5 h-5 mr-2" />
            Pelanggan
          </h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-base dark:text-white">
              {invoice.customerName}
            </p>
            <p className="flex items-center text-gray-600 dark:text-gray-300">
              <Phone className="w-4 h-4 mr-2" />
              {invoice.customerPhone || "Tidak ada no. telp"}
            </p>
            <p className="flex items-start text-gray-600 dark:text-gray-300">
              <MapPin className="w-4 h-4 mr-2 mt-1 shrink-0" />
              <span>{invoice.customerAddress || "Tidak ada alamat"}</span>
            </p>
          </div>
        </div>

        {/* Rincian Item */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
            <Package className="w-5 h-5 mr-2" />
            Rincian Item
          </h2>
          <div className="flow-root">
            <ul
              role="list"
              className="divide-y divide-gray-200 dark:divide-gray-700"
            >
              {invoice.items.map((item: InvoiceItemWithProduct) => (
                <li key={item.id} className="py-4 flex">
                  <div className="flex-1">
                    <p className="font-medium dark:text-white">
                      {item.product.nama}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {item.quantity} x {formatCurrency(item.priceAtTime)}
                    </p>
                  </div>
                  <div className="font-semibold dark:text-white">
                    {formatCurrency(item.quantity * item.priceAtTime)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rangkuman Total */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center dark:text-white">
            <DollarSign className="w-5 h-5 mr-2" />
            Rangkuman
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Biaya Kirim</span>
              <span>{formatCurrency(invoice.shippingFee)}</span>
            </div>
            <div className="border-t dark:border-gray-700 pt-3 mt-3">
              <div className="flex justify-between text-xl font-bold dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* =========================================================
        BATAS AKHIR KONTEN PDF
        =========================================================
      */}

      {/* --- Tombol Aksi (Hanya PDF) - DILUAR KONTEN PDF --- */}
      <div className="mt-6 flex justify-end">
        <GeneratePdfButton />
      </div>

      {/* --- Panel Aksi Admin - DILUAR KONTEN PDF --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Panel 1: Ubah Status Manual */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">
            Ubah Status Manual
          </h2>
          <UpdateStatusButton
            invoiceId={invoice.id}
            currentStatus={invoice.status as "PAID" | "UNPAID" | "CANCELLED"}
          />
        </div>

        {/* Panel 2: Upload Bukti Bayar */}
        <UploadPaymentProof
          invoiceId={invoice.id}
          currentProofUrl={invoice.paymentProofUrl}
        />
      </div>
    </div>
  );
}
