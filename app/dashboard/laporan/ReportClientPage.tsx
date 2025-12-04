/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  getReportDataAction,
  type ReportSummary,
} from "@/actions/report-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileDown, Calendar, Search, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const formatCurrency = (amount: number) =>
  `Rp ${amount.toLocaleString("id-ID")}`;

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Pastikan tipe data ini sesuai dengan return dari server action Anda
// Interface ini biasanya di import, tapi saya tulis disini untuk konteks
// interface ReportRow {
//   ...
//   products: string; // <-- Pastikan ada field ini (misal: "Sepatu A (1), Kaos B (2)")
// }

export default function ReportClientPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reportData, setReportData] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");

    const firstDay = `${yyyy}-${mm}-01`;
    const currentDay = `${yyyy}-${mm}-${String(today.getDate()).padStart(2, "0")}`;

    setStartDate(firstDay);
    setEndDate(currentDay);
  }, []);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert("Harap pilih tanggal mulai dan tanggal akhir.");
      return;
    }
    if (startDate > endDate) {
      alert("Tanggal Mulai tidak boleh lebih besar dari Tanggal Akhir.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await getReportDataAction(startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Laporan Transaksi Sossilver", 14, 15);

    doc.setFontSize(10);
    doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 22);

    doc.text(`Total Transaksi: ${reportData.totalTransaction}`, 14, 28);
    doc.text(`Total Omset: ${formatCurrency(reportData.totalRevenue)}`, 14, 33);

    const tableColumn = [
      "No",
      "No. Invoice",
      "Tanggal",
      "Pelanggan",
      "Produk", // [UBAH 1] Tambah Header PDF
      "Status",
      "Total",
    ];

    // Asumsi row punya property 'products' (string)
    // Jika data products berupa array, gunakan: row.products.map(p => p.name).join(", ")
    const tableRows = reportData.data.map((row: any, index) => [
      index + 1,
      row.invoiceNumber,
      formatDate(row.date),
      row.customerName,
      row.products || "-", // [UBAH 2] Isi Data Produk PDF
      row.status,
      formatCurrency(row.totalAmount),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
      },
      headStyles: {
        fillColor: [63, 81, 181],
        fontSize: 9,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { cellWidth: 40 }, // Lebar kolom produk di PDF
      },
    });

    doc.save(`Laporan-Sossilver-${startDate}-to-${endDate}.pdf`);
  };

  const toggleExpandRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* ... (Header & Filter Card Code SAMA seperti sebelumnya) ... */}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Laporan Penjualan
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Kelola dan pantau data transaksi Anda
          </p>
        </div>

        {/* Filter Card */}
        <Card className="mb-6 shadow-sm">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Filter Periode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-3 sm:items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Dari Tanggal
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Sampai Tanggal
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-sm"
              />
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={handleFilter}
                disabled={isLoading || !startDate || !endDate}
                className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">Tampilkan</span>
                <span className="sm:hidden">Cari</span>
              </Button>
              {reportData && reportData.data.length > 0 && (
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="flex-1 sm:flex-none border-green-600 text-green-600 hover:bg-green-50 text-sm"
                >
                  <FileDown className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {reportData && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Stats (SAMA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">
                    Total Transaksi
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                    {reportData.totalTransaction}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                    Total Pendapatan
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-900 break-words">
                    {formatCurrency(reportData.totalRevenue)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Pelanggan
                      </th>
                      {/* [UBAH 3] Tambah Header Kolom Produk */}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Produk Dibeli
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6} // Update colspan karena kolom bertambah
                          className="px-4 py-8 text-center text-sm text-gray-500"
                        >
                          Tidak ada data transaksi pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      reportData.data.map((row: any) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {row.invoiceNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatDate(row.date)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.customerName}
                          </td>
                          {/* [UBAH 4] Tambah Sel Data Produk */}
                          <td
                            className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate"
                            title={row.products}
                          >
                            {row.products || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span
                              className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full 
                              ${row.status === "PAID" || row.status === "SELESAI" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                            {formatCurrency(row.totalAmount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {reportData.data.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <p className="text-sm text-gray-500">
                      Tidak ada data transaksi pada periode ini.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reportData.data.map((row: any) => (
                  <Card key={row.id} className="shadow-sm">
                    <div
                      onClick={() => toggleExpandRow(row.id)}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {row.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {row.customerName}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                            expandedRows.has(row.id) ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${row.status === "PAID" || row.status === "SELESAI" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                        >
                          {row.status}
                        </span>
                        <p className="text-sm font-bold text-gray-900">
                          {formatCurrency(row.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedRows.has(row.id) && (
                      <div className="px-4 py-3 border-t bg-gray-50 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tanggal:</span>
                          <span className="font-medium text-gray-900">
                            {formatDate(row.date)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Pelanggan:</span>
                          <span className="font-medium text-gray-900">
                            {row.customerName}
                          </span>
                        </div>
                        {/* [UBAH 5] Data Produk di Tampilan Mobile */}
                        <div className="flex flex-col text-sm gap-1">
                          <span className="text-gray-600">Produk Dibeli:</span>
                          <span className="font-medium text-gray-900 bg-white p-2 rounded border">
                            {row.products || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-gray-600">Invoice:</span>
                          <span className="font-medium text-gray-900">
                            {row.invoiceNumber}
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
