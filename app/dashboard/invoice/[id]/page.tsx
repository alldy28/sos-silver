// src/app/dashboard/invoice/[id]/page.tsx

import { getInvoiceByIdAction } from "@/actions/invoice-actions";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import GeneratePdfButton from "../_components/GeneratePdfButton";
import { InvoiceActionsClient } from "../_components/InvoiceActionsClient";
import { ConfirmPriceForm } from "../_components/ConfirmPriceForm";
import { InvoiceTemplate } from "../_components/invoice/InvoiceTemplate";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const { id } = await params;

  // Fetch invoice data
  const invoice = await getInvoiceByIdAction(id);

  if (!invoice) {
    notFound();
  }

  const isWaitingForAdmin = invoice.status === "MENUNGGU_KONFIRMASI_ADMIN";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Invoice Template (Tampilan Struk) */}
      <section className="bg-white rounded-lg shadow-sm">
        <InvoiceTemplate invoice={invoice} />
      </section>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <GeneratePdfButton />
      </div>

      {/* Admin Actions Panel (Form Aksi) */}
      <section className="bg-gray-50 rounded-lg p-6">
        <Suspense fallback={<AdminActionsSkeleton />}>
          {isWaitingForAdmin ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Konfirmasi Harga Invoice
              </h3>
              <ConfirmPriceForm
                invoiceId={invoice.id}
                subTotal={invoice.subTotal}
              />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-4">Aksi Invoice</h3>
              <InvoiceActionsClient
                invoiceId={invoice.id}
                currentStatus={invoice.status}
                currentProofUrl={invoice.paymentProofUrl}
                // ✅ [PENTING] Tambahkan baris ini agar resi muncul di form input
                currentResi={invoice.trackingNumber}
              />
            </div>
          )}
        </Suspense>
      </section>
    </div>
  );
}

// Generate metadata untuk SEO
export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const invoice = await getInvoiceByIdAction(id);

  if (!invoice) {
    return { title: "Invoice Not Found" };
  }

  return {
    title: `Invoice #${invoice.invoiceNumber || id} | Dashboard`,
    description: `Detail invoice untuk ${invoice.customerName || "customer"}`,
  };
}

function AdminActionsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  );
}
