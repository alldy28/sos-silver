// app/dashboard/invoice/page.tsx

import Link from "next/link";
import { getInvoicesAction } from "../../../actions/invoice-actions";
import {
  FileText,
  User,
  Calendar,
  DollarSign,
  ChevronRight,
  MoreVertical,
} from "lucide-react";

// --- Fungsi Helper ---

function formatDate(dateString: Date) {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  switch (status) {
    case "PAID":
      return (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full dark:bg-green-900 dark:text-green-300 whitespace-nowrap">
          LUNAS
        </span>
      );
    case "UNPAID":
      return (
        <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full dark:bg-yellow-900 dark:text-yellow-300 whitespace-nowrap">
          BELUM LUNAS
        </span>
      );
    case "CANCELLED":
      return (
        <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full dark:bg-red-900 dark:text-red-300 whitespace-nowrap">
          BATAL
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full dark:bg-gray-700 dark:text-gray-300 whitespace-nowrap">
          {status}
        </span>
      );
  }
}

// --- Batas Fungsi Helper ---

export default async function InvoiceListPage() {
  const invoices = await getInvoicesAction();

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Daftar Invoice
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Total: <span className="font-semibold">{invoices.length}</span>{" "}
            invoice
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Belum ada invoice yang dibuat.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Pelanggan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                          <span className="font-medium text-sm dark:text-white truncate">
                            #{invoice.invoiceNumber.substring(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm dark:text-gray-300 truncate">
                            {invoice.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm dark:text-gray-300">
                            {formatDate(invoice.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-semibold dark:text-white">
                            Rp {invoice.totalAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatStatus(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={`/dashboard/invoice/${invoice.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                        >
                          Lihat Detail
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 sm:space-y-4">
          {invoices.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Belum ada invoice yang dibuat.
              </p>
            </div>
          ) : (
            invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/invoice/${invoice.id}`}
                className="block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-4 hover:shadow-md transition-all hover:border-indigo-300 dark:hover:border-indigo-600">
                  {/* Top Row: Invoice & Status */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          #{invoice.invoiceNumber.substring(0, 8)}...
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {invoice.customerName}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {formatStatus(invoice.status)}
                    </div>
                  </div>

                  {/* Middle Row: Date & Total */}
                  <div className="space-y-2 mb-3 py-3 border-y border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Tanggal
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(invoice.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Total
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        Rp {invoice.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Action */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-gray-400">
                      Lihat selengkapnya
                    </span>
                    <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
