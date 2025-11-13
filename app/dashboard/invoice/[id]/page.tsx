import { getInvoiceByIdAction } from "../../../../actions/invoice-actions";
import { notFound } from "next/navigation";
import GeneratePdfButton from "../_components/GeneratePdfButton";
import { InvoiceActionsClient } from "../_components/InvoiceActionsClient";
import { ConfirmPriceForm } from "../_components/ConfirmPriceForm";
// [PERBAIKAN] Impor templat baru
import { InvoiceTemplate } from "../_components/invoice/InvoiceTemplate";

// Helper Functions (dapat Anda pindahkan ke lib/utils.ts)


export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await getInvoiceByIdAction(params.id);

  if (!invoice) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* [PERBAIKAN] HTML Invoice sekarang dipanggil dari templat */}
      <InvoiceTemplate invoice={invoice} />

      {/* Action Buttons - Outside PDF */}
      <div className="mt-6 flex justify-end">
        <GeneratePdfButton />
      </div>

      {/* [LOGIKA SUDAH BENAR] Panel Aksi Admin */}
      <div className="mt-6">
        {invoice.status === "MENUNGGU_KONFIRMASI_ADMIN" ? (
          <ConfirmPriceForm
            invoiceId={invoice.id}
            subTotal={invoice.subTotal}
          />
        ) : (
          <InvoiceActionsClient
            invoiceId={invoice.id}
            currentStatus={invoice.status}
            currentProofUrl={invoice.paymentProofUrl}
          />
        )}
      </div>
    </div>
  );
}
