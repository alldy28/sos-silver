import { getInvoiceByIdAction } from "@/actions/invoice-actions";
import { notFound } from "next/navigation";
import { InvoiceTemplate } from "../../dashboard/invoice/_components/invoice/InvoiceTemplate";
// Kita gunakan tombol PDF yang sama dengan yang dipakai admin
import GeneratePdfButton from "@/app/dashboard/invoice/_components/GeneratePdfButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Halaman ini HANYA untuk customer melihat dan men-download invoice mereka.
 * Halaman ini aman karena 'getInvoiceByIdAction' sudah memiliki
 * logika otorisasi (mengecek customerId).
 */
export default async function PublicInvoicePage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await getInvoiceByIdAction(params.id);

  if (!invoice) {
    notFound();
  }

  // Customer tidak boleh download jika admin belum konfirmasi
  if (invoice.status === "MENUNGGU_KONFIRMASI_ADMIN") {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Invoice Belum Siap</h1>
        <p className="text-gray-600 mb-6">
          Admin belum selesai mengkonfirmasi total harga dan ongkos kirim. Harap
          tunggu.
        </p>
        <Button asChild variant="outline">
          <Link href="/myaccount">Kembali ke Akun Saya</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Tombol Aksi di Atas */}
      <div className="mb-6 flex justify-between items-center">
        <Button asChild variant="outline">
          <Link href="/myaccount">{"<"} Kembali ke Akun Saya</Link>
        </Button>
        <GeneratePdfButton />
      </div>

      {/* Templat Invoice */}
      <InvoiceTemplate invoice={invoice} />
    </div>
  );
}
