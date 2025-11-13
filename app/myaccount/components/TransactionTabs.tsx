"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Kita akan buat komponen InvoiceCard terpisah agar rapi
import { InvoiceCard, type FullInvoice } from "./InvoiceCard"; // Impor tipe baru

interface TransactionTabsProps {
  transactions: FullInvoice[];
}

export function TransactionTabs({ transactions }: TransactionTabsProps) {
  // Gunakan useMemo agar tidak perlu mem-filter ulang di setiap render
  const filteredLists = useMemo(() => {
    // [PERBAIKAN] Tab baru untuk status 'MENUNGGU_KONFIRMASI_ADMIN'
    const waitingAdmin = transactions.filter(
      (t) => t.status === "MENUNGGU_KONFIRMASI_ADMIN"
    );
    const unpaid = transactions.filter((t) => t.status === "UNPAID");
    const verifying = transactions.filter(
      (t) => t.status === "WAITING_VERIFICATION"
    );
    // [PERBAIKAN] Mengelompokkan status "Diproses"
    const processing = transactions.filter(
      (t) => t.status === "SEDANG_DISIAPKAN" || t.status === "SEDANG_PENGIRIMAN"
    );
    const completed = transactions.filter((t) => t.status === "SELESAI");
    const cancelled = transactions.filter((t) => t.status === "CANCELLED");

    return {
      waitingAdmin,
      unpaid,
      verifying,
      processing,
      completed,
      cancelled,
    };
  }, [transactions]);

  // Helper untuk menampilkan daftar atau pesan kosong
  const renderList = (list: FullInvoice[], emptyMessage: string) => {
    if (list.length === 0) {
      return <p className="text-gray-500 text-center py-10">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-4">
        {list.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="waitingAdmin" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto flex-wrap">
        <TabsTrigger value="waitingAdmin">Menunggu (Baru)</TabsTrigger>
        <TabsTrigger value="unpaid">Belum Bayar</TabsTrigger>
        <TabsTrigger value="verifying">Verifikasi</TabsTrigger>
        <TabsTrigger value="processing">Diproses</TabsTrigger>
        <TabsTrigger value="completed">Selesai</TabsTrigger>
        <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
      </TabsList>

      {/* [PERBAIKAN] Tab Konten BARU */}
      <TabsContent value="waitingAdmin" className="mt-4">
        {renderList(
          filteredLists.waitingAdmin,
          "Tidak ada order baru yang menunggu konfirmasi."
        )}
      </TabsContent>
      <TabsContent value="unpaid" className="mt-4">
        {renderList(
          filteredLists.unpaid,
          "Tidak ada tagihan yang belum dibayar."
        )}
      </TabsContent>
      <TabsContent value="verifying" className="mt-4">
        {renderList(
          filteredLists.verifying,
          "Tidak ada pembayaran yang sedang diverifikasi."
        )}
      </TabsContent>
      <TabsContent value="processing" className="mt-4">
        {renderList(
          filteredLists.processing,
          "Tidak ada order yang sedang diproses/dikirim."
        )}
      </TabsContent>
      <TabsContent value="completed" className="mt-4">
        {renderList(filteredLists.completed, "Tidak ada order yang selesai.")}
      </TabsContent>
      <TabsContent value="cancelled" className="mt-4">
        {renderList(
          filteredLists.cancelled,
          "Tidak ada order yang dibatalkan."
        )}
      </TabsContent>
    </Tabs>
  );
}
