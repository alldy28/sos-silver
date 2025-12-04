/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PrintAutoTrigger from "../../_components/PrintAutoTrigger";
import { MapPin, Phone } from "lucide-react";

// --- FUNGSI AMBIL DATA ---
async function getInvoiceData(id: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!invoice) return null;

  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt,
    shippingFee: invoice.shippingFee,

    // DATA PENERIMA
    customer: {
      name: invoice.customerName,
      phone: invoice.customerPhone || "-",
      address: invoice.customerAddress || "-",
    },

    // DATA PENGIRIM
    sender: {
      name: "SOS SILVER",
      phone: "08131114586",
      address:
        "Ruko Colony Blok DE 1 No 37 Perumahan Metland Cileungsi-setu Serang KM 02, Cipenjo, Cileungsi Kabupaten Bogor, Jawa Barat 16820",
    },

    // LIST BARANG
    items: invoice.items.map((item: any) => ({
      name: item.product?.name || "Produk",
      qty: item.quantity || 1,
    })),
  };
}

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoiceData(id);

  if (!invoice) {
    return notFound();
  }

  const ongkirText = invoice.shippingFee === 0 ? "GRATIS ONGKIR" : "DIBAYAR";

  return (
    // [SOLUSI] Class 'fixed inset-0 z-[9999]' membuat halaman ini menutupi Navbar/Header
    <div className="fixed inset-0 z-[9999] bg-gray-100 overflow-y-auto p-8 print:static print:p-0 print:bg-white flex flex-col items-center justify-center">
      {/* Tombol Print & Warning */}
      <div className="w-full max-w-[100mm] mb-4 print:hidden relative z-50">
        <PrintAutoTrigger />
        <p className="text-xs text-gray-500 text-center mt-2">
          *Pastikan opsi <b>Headers and footers</b> dimatikan di browser*
        </p>
      </div>

      {/* --- KANVAS LABEL (100mm x 150mm - A6) --- */}
      <div className="bg-white w-[100mm] min-h-[150mm] shadow-lg print:shadow-none border border-gray-300 print:border-none p-6 text-black font-sans relative box-border mx-auto">
        {/* HEADER: No Invoice & Barcode */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-2/3">
            <h1 className="text-lg font-bold font-mono tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-xs font-bold mt-1 uppercase">
              ONGKIR: {ongkirText}
            </p>
          </div>

          <div className="w-1/3 flex flex-col items-end">
            <div className="border border-black px-2 py-3 w-full text-center mb-1">
              <span className="text-[8px] uppercase tracking-wider text-gray-500">
                Barcode Area
              </span>
            </div>
            <p className="text-[10px] text-gray-600">
              Tgl Order:{" "}
              {new Date(invoice.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        {/* GARIS TEBAL PEMBATAS */}
        <div className="w-full h-1 bg-black mb-6"></div>

        {/* BAGIAN PENERIMA (KOTAK) */}
        <div className="mb-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 ml-1">
            PENERIMA
          </p>
          <div className="border border-slate-400 rounded-md p-3">
            <h2 className="text-base font-bold mb-1 text-black">
              {invoice.customer.name}
            </h2>

            <div className="flex items-center gap-2 mb-1">
              <Phone className="w-3 h-3 text-gray-600" />
              <span className="text-sm font-bold">
                {invoice.customer.phone}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-3 h-3 text-gray-600 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-700 leading-snug">
                {invoice.customer.address}
              </p>
            </div>
          </div>
        </div>

        {/* GARIS PUTUS-PUTUS PEMBATAS */}
        <div className="border-t border-dashed border-gray-300 my-4"></div>

        {/* PENGIRIM */}
        <div className="mb-6 pl-1">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold w-16 uppercase text-gray-600">
              PENGIRIM:
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-black">
                {invoice.sender.name}
              </p>
              <p className="text-xs text-gray-800">{invoice.sender.phone}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {invoice.sender.address}
              </p>
            </div>
          </div>
        </div>

        {/* GARIS PUTUS-PUTUS PEMBATAS */}
        <div className="border-t border-dashed border-gray-300 my-4"></div>

        {/* LIST ITEM */}
        <div>
          <p className="text-xs font-bold mb-2 text-black uppercase">
            DETAIL ISI PAKET (PENTING):
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 font-bold text-gray-700">
                  Produk
                </th>
                <th className="text-right py-1 font-bold text-gray-700">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 pr-2 align-top text-gray-800">
                    {item.name}
                  </td>
                  <td className="py-2 align-top text-right font-bold text-black">
                    {item.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
