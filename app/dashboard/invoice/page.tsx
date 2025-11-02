// app/dashboard/invoice/page.tsx

import Link from "next/link";
import { getInvoicesAction } from "../../../actions/invoice-actions";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  ChevronRight,
} from "lucide-react";

// --- Fungsi Helper (Bisa dipindah ke file utils jika mau) ---

// Fungsi untuk format tanggal
function formatDate(dateString: Date) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Fungsi untuk format status
function formatStatus(status: string) {
  switch (status) {
    case "PAID":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900 dark:text-green-300">
          LUNAS
        </span>
      );
    case "UNPAID":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
          BELUM LUNAS
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full dark:bg-red-900 dark:text-red-300">
          BATAL
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300">
          {status}
        </span>
      );
  }
}
// --- Batas Fungsi Helper ---

export default async function InvoiceListPage() {
  const invoices = await getInvoicesAction();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        Daftar Invoice
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden">
        {invoices.length === 0 ? (
          <p className="p-10 text-center text-gray-500 dark:text-gray-400">
            Belum ada invoice yang dibuat.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pelanggan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                        <span className="font-medium text-sm dark:text-white truncate">
                          #{invoice.invoiceNumber.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm dark:text-gray-300">
                          {/* INI SUDAH DIPERBAIKI: Mengambil 'customerName' langsung */}
                          {invoice.customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm dark:text-gray-300">
                          {formatDate(invoice.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-semibold dark:text-white">
                          Rp {invoice.totalAmount.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatStatus(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/invoice/${invoice.id}`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center justify-end"
                      >
                        Lihat Detail
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
