"use client";

import { Invoice, InvoiceItem, SossilverProduct } from "@prisma/client";
import Image from "next/image";
// Menggunakan utilitas yang sudah kita buat
import { formatCurrency, formatDate } from "@/lib/utils"; 

// Definisikan tipe data lengkap yang akan diterima
export type FullInvoice = Invoice & {
  items: (InvoiceItem & {
    product: SossilverProduct;
  })[];
};

interface InvoiceTemplateProps {
  invoice: FullInvoice;
}

// Data Bank (Dapat dipindahkan ke file konfigurasi atau database)
const bankDetails = {
  bank: "Bank BCA",
  accountName: "NASRULHADI",
  accountNumber: "4789999993",
};

/**
 * Komponen Templat Invoice (Digunakan untuk Tampilan dan Cetak/PDF)
 */
export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  // Hitung diskon yang sudah diterapkan
  const discountAmount = (invoice.subTotal * invoice.discountPercent) / 100;
  
  return (
    // [PERBAIKAN CSS] Styling untuk mencetak (print:w-full)
    <div
      id="invoice-pdf-content"
      className="bg-white p-6 sm:p-8 rounded-lg shadow-lg print:shadow-none print:p-0 print:m-0 print:w-full"
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

      {/* Shipping Address and Invoice Info (Mobile: Berjejer Vertikal) */}
      <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4 sm:gap-0">
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
        <div className="text-sm sm:text-right">
          <div className="mb-1">
            <span className="text-gray-600">Invoice Date: </span>
            <span className="font-semibold">
              {formatDate(invoice.createdAt)}
            </span>
          </div>
          <div className="mb-1">
            <span className="text-gray-600">Invoice No.: </span>
            <span className="font-semibold">
              {invoice.invoiceNumber || invoice.id.substring(0, 8)}
            </span>
          </div>
          <div className="mb-1">
            <span className="text-gray-600">Order ID: </span>
            <span className="font-semibold">
              {invoice.id.substring(0, 8)}
            </span>
          </div>
          <div className="mb-1">
            <span className="text-gray-600">Status: </span>
            <span className="font-bold text-red-500">{invoice.status}</span>
          </div>
        </div>
      </div>

      {/* Items Table (Dibuat responsif) */}
      <div className="mb-8 overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-t-2 border-b-2 border-black">
              {/* [PERBAIKAN LEBAR KOLOM] Total 100% */}
              <th className="text-left py-3 px-2 text-sm font-bold text-gray-800 w-[5%]">
                NO
              </th>
              <th className="text-left py-3 px-2 text-sm font-bold text-gray-800 w-[40%]">
                PRODUK
              </th>
              <th className="text-center py-3 px-2 text-sm font-bold text-gray-800 w-[10%]">
                GRAMASI
              </th>
              <th className="text-center py-3 px-2 text-sm font-bold text-gray-800 w-[10%]">
                QTY
              </th>
              <th className="text-right py-3 px-2 text-sm font-bold text-gray-800 w-[15%]">
                HARGA SATUAN
              </th>
              <th className="text-right py-3 px-2 text-sm font-bold text-gray-800 w-[20%]">
                TOTAL HARGA
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

      {/* === BAGIAN TOTAL & BANK (Responsif & Cetak-Aman) === */}
      <div className="flex flex-col sm:flex-row justify-between">
        
        {/* Kolom Kiri: Informasi Bank */}
        <div className="w-full sm:w-1/2 text-sm mb-6 sm:mb-0 pr-4">
          <p className="font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
            Informasi Pembayaran
          </p>
          <p className="text-gray-700 font-semibold">{bankDetails.bank}</p>
          <p className="text-gray-600">A/N: {bankDetails.accountName}</p>
          <p className="text-gray-600 font-bold text-lg">
            No. Rek: {bankDetails.accountNumber}
          </p>
        </div>

        {/* Kolom Kanan: Detail Total */}
        <div className="w-full sm:w-72">
          {/* 1. Subtotal */}
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-700">Subtotal</span>
            <span className="text-gray-700">
              {formatCurrency(invoice.subTotal)}
            </span>
          </div>

          {/* 2. Biaya Kirim */}
          <div className="flex justify-between py-2 text-sm">
            <span className="text-gray-700">Biaya Kirim</span>
            <span className="text-gray-700">
              {formatCurrency(invoice.shippingFee)}
            </span>
          </div>

          {/* 3. Diskon (hanya tampil jika ada) */}
          {invoice.discountPercent > 0 && (
            <div className="flex justify-between py-2 text-sm text-red-600">
              <span>Diskon ({invoice.discountPercent}%)</span>
              <span>- {formatCurrency(discountAmount)}</span>
            </div>
          )}

          {/* 4. Total Akhir */}
          <div className="flex justify-between py-2 border-t border-b-2 border-black text-base font-bold">
            <span className="text-gray-800">TOTAL TAGIHAN</span>
            <span className="text-gray-800">
              {formatCurrency(invoice.totalAmount)}
            </span>
          </div>
        </div>
      </div>
      {/* ====================================== */}

      {/* Tanda Tangan */}
      {/* <div className="mt-12 flex justify-end">
        <div className="text-center">
            <p className="mb-12 text-sm">Hormat Kami,</p>
            <p className="font-semibold border-t border-black pt-1">
                Admin SoS Silver
            </p>
        </div>
      </div> */}
    </div>
  );
}