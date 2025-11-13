import { getInvoiceByIdAction } from "../../../../actions/invoice-actions";
import { notFound } from "next/navigation";
// [PERBAIKAN PATH] Path yang benar adalah '../_components'
import GeneratePdfButton from "../_components/GeneratePdfButton";
import { InvoiceActionsClient } from "../_components/InvoiceActionsClient";
import { ConfirmPriceForm } from "../_components/ConfirmPriceForm";

// --- Helper Functions ---
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatCurrency = (amount: number | bigint) => {
  // Konversi BigInt ke Number jika perlu (hati-hati dengan angka besar)
  const numberAmount = typeof amount === "bigint" ? Number(amount) : amount;
  return `Rp${numberAmount.toLocaleString("id-ID")}`;
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await getInvoiceByIdAction(params.id);

  if (!invoice) {
    notFound();
  }

  // Hitung diskon (subTotal dan discountPercent bisa jadi float)
  const discountAmount = (invoice.subTotal * invoice.discountPercent) / 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* PDF Content Start */}
      <div
        id="invoice-pdf-content"
        className="bg-white p-8 rounded-lg shadow-lg"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        {/* Header with Logo and Company Info */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-start gap-4">
            {/* Logo (menggunakan <img> standar untuk PDF) */}
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src="/logosos-baru.png" // Pastikan path logo ini benar
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Company Info */}
            <div className="text-sm leading-relaxed">
              <p className="font-bold text-gray-800">SoS Silver</p>
              <p className="text-gray-600">
                Ruko Colony Blok DE 1 No 37 Perumahan Metland
              </p>
              <p className="text-gray-600">
                Cileungsi-setu Serang KM 02, Cipenjo, Cileungsi
              </p>
              <p className="text-gray-600">Kabupaten Bogor, Jawa Barat 16820</p>
            </div>
          </div>

          {/* Invoice Title */}
          <div>
            <h1 className="text-4xl font-bold text-blue-500 mb-2">INVOICE</h1>
          </div>
        </div>

        {/* Shipping Address and Invoice Info */}
        <div className="flex justify-between mb-8">
          {/* Shipping Address */}
          <div className="text-sm">
            <p className="font-bold text-gray-800 mb-2">Shipping Address:</p>
            <p className="text-gray-600">{invoice.customerName}</p>
            <p className="text-gray-600">
              {invoice.customerAddress || "Alamat tidak tersedia"}
            </p>
            <p className="text-gray-600">{invoice.customerPhone || ""}</p>
          </div>

          {/* Invoice Info */}
          <div className="text-sm text-right">
            <div className="mb-1">
              <span className="text-gray-600">Invoice Date: </span>
              <span className="font-semibold">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
            <div className="mb-1">
              <span className="text-gray-600">Invoice No.: </span>
              <span className="font-semibold">
                {invoice.invoiceNumber.substring(0, 8)}
              </span>
            </div>
            <div className="mb-1">
              <span className="text-gray-600">Order No.: </span>
              <span className="font-semibold">
                {invoice.id.substring(0, 4)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Order Date: </span>
              <span className="font-semibold">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-t-2 border-b-2 border-black">
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-800">
                  S.NO
                </th>
                <th className="text-left py-3 px-2 text-sm font-bold text-gray-800">
                  PRODUCT
                </th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-800">
                  GRAMASI
                </th>
                <th className="text-center py-3 px-2 text-sm font-bold text-gray-800">
                  QUANTITY
                </th>
                <th className="text-right py-3 px-2 text-sm font-bold text-gray-800">
                  PRICE
                </th>
                <th className="text-right py-3 px-2 text-sm font-bold text-gray-800">
                  TOTAL PRICE
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3 px-2 text-sm text-gray-700">
                    {index + 1}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-700">
                    {item.product.nama}
                  </td>
                  <td className="py-3 px-2 text-sm text-center text-gray-700">
                    {item.gramasi ? `${item.gramasi}g` : "-"}
                  </td>
                  <td className="py-3 px-2 text-sm text-center text-gray-700">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-sm text-right text-gray-700">
                    {formatCurrency(item.priceAtTime)}
                  </td>
                  <td className="py-3 px-2 text-sm text-right text-gray-700">
                    {formatCurrency(item.quantity * item.priceAtTime)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* === BAGIAN TOTAL YANG DISEMPURNAKAN === */}
        <div className="flex justify-end mb-8">
          <div className="w-72">
            {/* 1. Subtotal (dari database) */}
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-700">Subtotal</span>
              <span className="text-gray-700">
                {formatCurrency(invoice.subTotal)}
              </span>
            </div>

            {/* 2. Biaya Kirim (Baru) */}
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-700">Biaya Kirim</span>
              <span className="text-gray-700">
                {formatCurrency(invoice.shippingFee)}
              </span>
            </div>

            {/* 3. Diskon (Baru, hanya tampil jika ada) */}
            {invoice.discountPercent > 0 && (
              <div className="flex justify-between py-2 text-sm text-red-600">
                <span>Diskon ({invoice.discountPercent}%)</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* 4. Total (dari database) */}
            <div className="flex justify-between py-2 border-t border-b-2 border-black text-base font-bold">
              <span className="text-gray-800">Total</span>
              <span className="text-gray-800">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
          </div>
        </div>
        {/* ====================================== */}
      </div>
      {/* PDF Content End */}

      {/* Action Buttons - Outside PDF */}
      <div className="mt-6 flex justify-end">
        <GeneratePdfButton />
      </div>

      {/* [LOGIKA SUDAH BENAR] Logika Kondisional untuk Panel Aksi Admin
       */}
      <div className="mt-6">
        {invoice.status === "MENUNGGU_KONFIRMASI_ADMIN" ? (
          // 1. Jika status MENUNGGU_KONFIRMASI_ADMIN, tampilkan Form Ongkir
          <ConfirmPriceForm
            invoiceId={invoice.id}
            subTotal={invoice.subTotal}
          />
        ) : (
          // 2. Jika status LAIN (UNPAID, PAID, dll), tampilkan Aksi normal
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
