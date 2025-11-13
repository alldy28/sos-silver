// app/invoice/[id]/page.tsx

import { getInvoiceByIdAction } from "@/actions/invoice-actions";
import { notFound } from "next/navigation";
import { InvoiceTemplate } from "@/app/dashboard/invoice/_components/invoice/InvoiceTemplate";
import GeneratePdfButton from "@/app/dashboard/invoice/_components/GeneratePdfButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { Metadata } from "next";

/**
 * Halaman publik untuk customer melihat dan men-download invoice mereka.
 * Dilindungi dengan otorisasi di level action (getInvoiceByIdAction).
 */

// ✅ Tipe yang benar untuk Next.js 15
interface PublicInvoicePageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PublicInvoicePage({
  params,
}: PublicInvoicePageProps) {
  // ✅ Await params untuk Next.js 15
  const { id } = await params;

  // Fetch invoice dengan authorization check
  const invoice = await getInvoiceByIdAction(id);

  // Handle not found
  if (!invoice) {
    notFound();
  }

  // Jika masih menunggu konfirmasi admin
  if (invoice.status === "MENUNGGU_KONFIRMASI_ADMIN") {
    return <WaitingForConfirmationView />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header Actions */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button asChild variant="outline" size="default">
            <Link href="/myaccount" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Akun Saya
            </Link>
          </Button>

          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <StatusBadge status={invoice.status} />

            {/* Download Button - Only for confirmed invoices */}
            {invoice.status !== "MENUNGGU_KONFIRMASI_ADMIN" && (
              <GeneratePdfButton />
            )}
          </div>
        </header>

        {/* Invoice Template */}
        <main className="bg-white rounded-lg shadow-sm overflow-hidden">
          <InvoiceTemplate invoice={invoice} />
        </main>

        {/* Footer Info */}
        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>
            Jika ada pertanyaan tentang invoice ini, silakan hubungi customer
            service kami.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ✅ Generate metadata untuk SEO
export async function generateMetadata({
  params,
}: PublicInvoicePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const invoice = await getInvoiceByIdAction(id);

    if (!invoice) {
      return {
        title: "Invoice Tidak Ditemukan",
        description: "Invoice yang Anda cari tidak tersedia.",
      };
    }

    return {
      title: `Invoice #${invoice.invoiceNumber || id}`,
      description: `Detail invoice untuk ${invoice.customerName || "customer"}`,
      robots: {
        index: false, // Jangan index halaman invoice di search engine
        follow: false,
      },
    };
  } catch (error) {
    return {
      title: "Invoice",
      description: "Detail invoice",
    };
  }
}

// Component: Status Badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon?: React.ReactNode }
  > = {
    MENUNGGU_KONFIRMASI_ADMIN: {
      label: "Menunggu Konfirmasi",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Clock className="h-3 w-3" />,
    },
    UNPAID: {
      label: "Belum Dibayar",
      className: "bg-red-100 text-red-800 border-red-200",
    },
    PAID: {
      label: "Sudah Dibayar",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    PENDING: {
      label: "Pending",
      className: "bg-gray-100 text-gray-800 border-gray-200",
    },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}

// Component: Waiting for Confirmation View
function WaitingForConfirmationView() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-yellow-100 rounded-full p-4">
            <Clock className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Invoice Sedang Diproses
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          Admin sedang mengkonfirmasi total harga dan ongkos kirim untuk invoice
          Anda. Harap tunggu beberapa saat.
        </p>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Yang sedang dikonfirmasi:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Perhitungan total harga</li>
                <li>• Biaya ongkos kirim</li>
                <li>• Diskon (jika ada)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/myaccount">Kembali ke Akun Saya</Link>
          </Button>
          <Button asChild variant="default" className="flex-1">
            <Link href="/contact">Hubungi Admin</Link>
          </Button>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-500">
          Anda akan menerima notifikasi ketika invoice sudah siap
        </p>
      </div>
    </div>
  );
}
