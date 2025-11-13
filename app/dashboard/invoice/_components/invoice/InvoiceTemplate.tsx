import { Invoice, InvoiceItem, SossilverProduct } from "@prisma/client";
// Pastikan path ke utils Anda benar
import { formatCurrency, formatDate } from "@/lib/utils";

// Ini adalah tipe data lengkap yang dibutuhkan templat
export type FullInvoice = Invoice & {
  items: (InvoiceItem & {
    product: SossilverProduct;
  })[];
};

interface InvoiceTemplateProps {
  invoice: FullInvoice;
}

/**
 * Komponen ini HANYA berisi HTML untuk invoice,
 * sehingga bisa digunakan di halaman admin dan halaman download customer.
 */
export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  // Hitung diskon (subTotal dan discountPercent bisa jadi float)
  const discountAmount = (invoice.subTotal * invoice.discountPercent) / 100;

  return (
    <div
      id="invoice-pdf-content" // ID ini penting untuk tombol PDF
      className="bg-white p-8 rounded-lg shadow-lg"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {/* ... (Header, Info Perusahaan, Info Customer, dll - TIDAK BERUBAH) ... */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 flex items-center justify-center">
            <img
              src="/logosos-baru.png"
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
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
        <div>
          <h1 className="text-4xl font-bold text-blue-500 mb-2">INVOICE</h1>
        </div>
      </div>
      <div className="flex justify-between mb-8">
        <div className="text-sm">
          <p className="font-bold text-gray-800 mb-2">Shipping Address:</p>
          <p className="text-gray-600">{invoice.customerName}</p>
          <p className="text-gray-600">
            {invoice.customerAddress || "Alamat tidak tersedia"}
          </p>
          <p className="text-gray-600">{invoice.customerPhone || ""}</p>
        </div>
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
            <span className="font-semibold">{invoice.id.substring(0, 4)}</span>
          </div>
          <div>
            <span className="text-gray-600">Order Date: </span>
            <span className="font-semibold">
              {formatDate(invoice.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Items Table (TIDAK BERUBAH) */}
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
                <td className="py-3 px-2 text-sm text-gray-700">{index + 1}</td>
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

      {/* === [PERBAIKAN] Info Pembayaran & Total === */}
      <div className="flex justify-between items-start mb-8">
        {/* [PERBAIKAN BARU] Sisi Kiri: Info Pembayaran */}
        <div className="text-sm text-gray-700">
          <p className="font-bold text-gray-800 mb-2">Informasi Pembayaran:</p>
          <p>Silakan lakukan pembayaran ke rekening berikut:</p>
          <div className="mt-2">
            <p className="font-semibold">Bank BCA</p>
            <p>
              No. Rek: <span className="font-bold">4789999993</span>
            </p>
            <p>
              A/N: <span className="font-bold">NASRULHADI</span>
            </p>
          </div>
          {/* Anda bisa tambahkan bank lain di sini */}
          {/* <div className="mt-2">
            <p className="font-semibold">Bank Mandiri</p>
            <p>No. Rek: <span className="font-bold">098 765 4321</span></p>
            <p>A/N: <span className="font-bold">PT SOSSILVER INDONESIA</span></p>
          </div> */}
          <p className="mt-4 text-xs text-gray-500">
            *Mohon upload bukti bayar di halaman Akun Saya
            <br />
            setelah melakukan pembayaran.
          </p>
        </div>

        {/* Sisi Kanan: Total (YANG SUDAH ADA) */}
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
  );
}
