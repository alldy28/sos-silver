"use client";

import { useState } from "react";
import { Calendar, CheckCircle, Clock, FileText, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadFactoryModal } from "./UploadFactoryModal"; // Pastikan path import ini benar sesuai folder Anda
import Image from "next/image";

interface FactoryPaymentCardProps {
  data: {
    id: string;
    code: string;
    periodEnd: Date;
    totalGramasi: number; // Menggunakan Gramasi (Float)
    status: string;
    createdAt: Date;
    paidAt: Date | null;
    proofUrl: string | null;
  };
  invoiceCount?: number;
}

export function FactoryPaymentCard({
  data,
  invoiceCount,
}: FactoryPaymentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPaid = data.status === "PAID";

  // Helper format tanggal: "04 Des 2024"
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <div
        className={`border rounded-xl p-5 shadow-sm transition-all duration-200 ${
          isPaid
            ? "bg-green-50/50 border-green-200 shadow-green-100"
            : "bg-white border-gray-200 hover:shadow-md"
        }`}
      >
        {/* HEADER CARD */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4
                className={`font-bold text-lg ${isPaid ? "text-green-900" : "text-gray-900"}`}
              >
                Tagihan per {formatDate(data.periodEnd)}
              </h4>
              <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {data.code}
              </span>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {invoiceCount || 0} Invoice Siap Produksi
              <span className="mx-1">•</span>
              <Calendar className="w-3.5 h-3.5" />
              Dibuat: {formatDate(data.createdAt)}
            </p>
          </div>

          {/* TAMPILAN TOTAL GRAMASI */}
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Total Berat Produksi</p>
            <div className="flex items-center justify-end gap-1 text-gray-900">
              <Weight className="w-5 h-5 text-indigo-600" />
              <p className="font-bold text-2xl">
                {/* Menampilkan angka gramasi */}
                {data.totalGramasi.toLocaleString("id-ID")}{" "}
                <span className="text-base font-normal text-gray-600">gr</span>
              </p>
            </div>
          </div>
        </div>

        <hr
          className={`my-4 ${isPaid ? "border-green-200" : "border-gray-100"}`}
        />

        {/* STATUS BAR & ACTION */}
        <div className="flex justify-between items-center">
          {isPaid ? (
            // --- TAMPILAN JIKA SUDAH LUNAS ---
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
              {/* Badge Lunas */}
              <div className="flex items-center gap-3 bg-white text-green-700 px-4 py-2.5 rounded-lg border border-green-200 shadow-sm flex-1">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-green-800">
                    LUNAS
                  </span>
                  <span className="text-xs text-green-700">
                    Dibayar tgl:{" "}
                    <b>{data.paidAt ? formatDate(data.paidAt) : "-"}</b>
                  </span>
                </div>
              </div>

              {/* Thumbnail Bukti Bayar */}
              {data.proofUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-700 font-medium hidden sm:inline">
                    Bukti:
                  </span>
                  <a
                    href={data.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-400 transition shadow-sm group"
                    title="Klik untuk melihat bukti penuh"
                  >
                    <Image
                      src={data.proofUrl}
                      alt="Bukti Transfer"
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  </a>
                </div>
              )}
            </div>
          ) : (
            // --- TAMPILAN JIKA BELUM LUNAS ---
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md border border-orange-100">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">Belum Dibayar</span>
              </div>

              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200"
              >
                Upload Bukti & Bayar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Render Modal (Popup Upload) */}
      <UploadFactoryModal
        paymentId={data.id}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
