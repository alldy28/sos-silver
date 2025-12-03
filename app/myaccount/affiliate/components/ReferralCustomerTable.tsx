"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// Tipe data yang sama dengan di page.tsx
interface ReferralCustomer {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
}

interface ReferralCustomerTableProps {
  referrals: ReferralCustomer[];
}

const ITEMS_PER_PAGE = 5;

const formatDate = (dateString: string | Date): string => {
  try {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("id-ID");
};

export function ReferralCustomerTable({
  referrals,
}: ReferralCustomerTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Hitung total halaman
  const totalPages = Math.ceil(referrals.length / ITEMS_PER_PAGE);

  // Hitung data yang ditampilkan saat ini
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = referrals.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className="shadow-sm border-t-4 border-t-indigo-500">
      <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-800/50 dark:border-gray-700 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-white">
            <Users className="w-5 h-5 text-indigo-600" />
            Daftar Pelanggan Referral
          </CardTitle>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
            Total: {referrals.length}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {referrals.length === 0 ? (
          <div className="text-center py-12 px-4 text-gray-500">
            Belum ada pelanggan yang menggunakan link Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase font-medium text-xs">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3">Kontak</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentData.map((ref) => (
                  <tr
                    key={ref.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(ref.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {ref.customerName}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        #{ref.invoiceNumber.substring(0, 10)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ref.customerPhone ? (
                        <Link
                          href={`https://wa.me/${ref.customerPhone
                            .replace(/^0/, "62")
                            .replace(
                              /\D/g,
                              ""
                            )}?text=Halo%20${encodeURIComponent(
                            ref.customerName
                          )},%20terima%20kasih%20telah%20berbelanja%20di%20Sossilver!`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-green-700 hover:text-green-800 font-medium bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-md transition-colors text-xs"
                        >
                          <Phone className="w-3 h-3" />
                          Chat WA
                        </Link>
                      ) : (
                        <span className="text-gray-400 italic text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            ref.status === "SELESAI" || ref.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : ref.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        `}
                      >
                        {ref.status === "UNPAID"
                          ? "Belum Bayar"
                          : ref.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                      Rp {formatCurrency(ref.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between border-t bg-gray-50/50 p-4">
          <div className="text-xs text-gray-500">
            Menampilkan <strong>{startIndex + 1}</strong>-
            <strong>{Math.min(endIndex, referrals.length)}</strong> dari{" "}
            <strong>{referrals.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[2rem] text-center">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
