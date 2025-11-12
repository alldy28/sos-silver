"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Asumsi Anda punya komponen Badge
import { Button } from "@/components/ui/button";
import { type Invoice } from "@prisma/client"; // Impor tipe dari Prisma
import { UploadProofModal } from "./UploadProofModal"; // Impor modal

// Definisikan tipe transaksi yang menyertakan relasi
type TransactionWithItems = Invoice & {
  items: { product: { nama: string } }[];
};

interface TransactionTabsProps {
  transactions: TransactionWithItems[];
}

// Fungsi helper untuk memformat mata uang
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

// Fungsi helper untuk memformat tanggal
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

/**
 * Komponen ini menampilkan daftar transaksi dalam bentuk tabel
 */
function TransactionTable({
  transactions,
  onUploadClick,
}: {
  transactions: TransactionWithItems[];
  onUploadClick: (invoice: TransactionWithItems) => void;
}) {
  if (transactions.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
        Tidak ada transaksi di kategori ini.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. Invoice</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">
              #{invoice.invoiceNumber.substring(0, 8)}...
            </TableCell>
            <TableCell>{formatDate(invoice.createdAt)}</TableCell>
            <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
            <TableCell>
              {/* Anda bisa membuat komponen Badge yang lebih canggih */}
              <Badge variant="outline">{invoice.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {/* Tampilkan tombol "Saya Sudah Bayar" HANYA jika status UNPAID */}
              {invoice.status === "UNPAID" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onUploadClick(invoice)}
                >
                  Saya Sudah Bayar
                </Button>
              )}
              {(invoice.status === "PAID" ||
                invoice.status === "WAITING_VERIFICATION") && (
                <Button variant="outline" size="sm" disabled>
                  Menunggu Konfirmasi
                </Button>
              )}
              {/* Anda bisa tambahkan status lain di sini (Dikirim, Selesai, dll) */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/**
 * Komponen utama untuk Tab
 */
export function TransactionTabs({ transactions }: TransactionTabsProps) {
  // State untuk modal upload
  const [selectedInvoice, setSelectedInvoice] =
    useState<TransactionWithItems | null>(null);

  // Fungsi untuk membuka modal
  const handleUploadClick = (invoice: TransactionWithItems) => {
    setSelectedInvoice(invoice);
  };

  // Fungsi untuk menutup modal
  const handleCloseModal = () => {
    setSelectedInvoice(null);
  };

  // Logika pemfilteran untuk setiap tab
  const unpaid = transactions.filter((t) => t.status === "UNPAID");
  const waiting = transactions.filter(
    (t) => t.status === "WAITING_VERIFICATION"
  );
  // [PERMINTAAN ANDA] Tambahkan status-status baru di sini
  const preparing = transactions.filter((t) => t.status === "SEDANG_DISIAPKAN");
  const shipping = transactions.filter((t) => t.status === "SEDANG_PENGIRIMAN");
  const completed = transactions.filter(
    (t) => t.status === "SELESAI" || t.status === "PAID"
  );

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 mb-4">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="unpaid">Belum Bayar</TabsTrigger>
          <TabsTrigger value="waiting">Diproses</TabsTrigger>
          <TabsTrigger value="shipping">Dikirim</TabsTrigger>
          <TabsTrigger value="completed">Selesai</TabsTrigger>
        </TabsList>

        {/* Tab 1: Semua */}
        <TabsContent value="all">
          <TransactionTable
            transactions={transactions}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>

        {/* Tab 2: Belum Bayar */}
        <TabsContent value="unpaid">
          <TransactionTable
            transactions={unpaid}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>

        {/* Tab 3: Diproses (Menunggu Verifikasi + Sedang Disiapkan) */}
        <TabsContent value="waiting">
          <TransactionTable
            transactions={[...waiting, ...preparing]}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>

        {/* Tab 4: Dikirim */}
        <TabsContent value="shipping">
          <TransactionTable
            transactions={shipping}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>

        {/* Tab 5: Selesai */}
        <TabsContent value="completed">
          <TransactionTable
            transactions={completed}
            onUploadClick={handleUploadClick}
          />
        </TabsContent>
      </Tabs>

      {/* Modal Upload Bukti Bayar
        Hanya muncul jika 'selectedInvoice' ada isinya
      */}
      {selectedInvoice && (
        <UploadProofModal
          invoice={selectedInvoice}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
