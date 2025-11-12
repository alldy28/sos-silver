"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  updateInvoiceStatusAction,
  addPaymentProofAction,
  type InvoiceState, // <-- Impor tipe State
} from "../../../../actions/invoice-actions";
import { Loader2, UploadCloud, CheckCircle, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button"; // [SOLUSI 2] Menggunakan shadcn Button
import { Input } from "@/components/ui/input"; // Asumsi shadcn/ui
import { Label } from "@/components/ui/label"; // Asumsi shadcn/ui

interface InvoiceActionsProps {
  invoiceId: string;
  currentStatus: string;
  currentProofUrl: string | null;
}

// Definisikan initial state untuk form
const initialState: InvoiceState = {
  status: "info",
  message: "",
  errors: {},
};

/**
 * Tombol Submit untuk Form Upload
 * Menggunakan useFormStatus untuk menampilkan loading
 * (Tidak ada perubahan di sini)
 */
function UploadButton({ isDisabled }: { isDisabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Label
      htmlFor="payment-upload"
      className={`relative flex justify-center w-full h-32 px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md ${
        isDisabled || pending
          ? "bg-gray-100 dark:bg-gray-700 opacity-50 cursor-not-allowed"
          : "cursor-pointer hover:border-indigo-500"
      }`}
    >
      {pending || isDisabled ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {pending ? "Mengunggah..." : "Upload dinonaktifkan"}
          </span>
        </div>
      ) : (
        <div className="space-y-1 text-center">
          <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Klik untuk upload (PNG, JPG)
          </span>
        </div>
      )}
      <Input
        id="payment-upload"
        name="file"
        type="file"
        className="sr-only"
        accept="image/png, image/jpeg"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        disabled={isDisabled || pending}
      />
    </Label>
  );
}

/**
 * [SOLUSI 2] Tombol Submit untuk Form Update Status
 * Disederhanakan: Hanya menampilkan status loading/disabled
 * Menggunakan <Button> (shadcn)
 */
function StatusButton({
  isDisabled,
  buttonText,
}: {
  isDisabled: boolean;
  buttonText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button // <-- MENGGUNAKAN <Button> DARI SHADCN
      type="submit"
      // TIDAK ADA 'name' ATAU 'value'
      disabled={isDisabled || pending}
      className="w-full bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 px-4 py-2 rounded-md font-medium flex items-center justify-center gap-2"
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <CheckCircle className="w-5 h-5" />
      )}
      {pending ? "Memperbarui..." : buttonText}
    </Button>
  );
}

export function InvoiceActionsClient({
  invoiceId,
  currentStatus,
  currentProofUrl,
}: InvoiceActionsProps) {
  const router = useRouter();

  // --- State untuk Form Upload Bukti Bayar ---
  const [uploadState, uploadDispatch, isUploadPending] = useActionState(
    addPaymentProofAction,
    initialState
  );

  // --- State untuk Form Ubah Status ---
  const [updateStatusState, updateStatusDispatch, isStatusPending] =
    useActionState(updateInvoiceStatusAction, initialState);

  // --- Effect untuk memantau hasil upload ---
  useEffect(() => {
    if (uploadState.status === "success") {
      alert("Upload Sukses: " + uploadState.message);
      router.refresh();
    } else if (uploadState.status === "error") {
      alert("Upload Error: " + uploadState.message);
    }
  }, [uploadState, router]);

  // --- Effect untuk memantau hasil update status ---
  useEffect(() => {
    if (updateStatusState.status === "success") {
      alert("Update Status Sukses: " + updateStatusState.message);
      router.refresh();
    } else if (updateStatusState.status === "error") {
      alert("Update Status Error: " + updateStatusState.message);
    }
  }, [updateStatusState, router]);

  // Kapan admin bisa upload? (Hanya jika UNPAID dan BELUM ADA BUKTI)
  const canUpload = currentStatus === "UNPAID" && !currentProofUrl;
  // Kapan admin bisa update status? (Selama belum selesai atau batal)
  const canUpdateStatus =
    currentStatus !== "SELESAI" && currentStatus !== "CANCELLED";

  // [SOLUSI 2] Logika status dipindahkan ke komponen utama
  const statusConfig = {
    UNPAID: "Tandai Lunas (PAID)",
    WAITING_VERIFICATION: "Konfirmasi Lunas (SEDANG_DISIAPKAN)",
    SEDANG_DISIAPKAN: "Tandai Sudah Dikirim",
    SEDANG_PENGIRIMAN: "Tandai Selesai",
    SELESAI: "Order Selesai",
    CANCELLED: "Order Dibatalkan",
    PAID: "Sudah Lunas (Lanjut Siapkan)",
  };
  type StatusKey = keyof typeof statusConfig;

  const nextStatusMap: Record<string, string> = {
    UNPAID: "PAID",
    PAID: "SEDANG_DISIAPKAN",
    WAITING_VERIFICATION: "SEDANG_DISIAPKAN",
    SEDANG_DISIAPKAN: "SEDANG_PENGIRIMAN",
    SEDANG_PENGIRIMAN: "SELESAI",
  };

  // [SOLUSI 2] Hitung 'nextStatus' dan 'buttonText' di sini
  const nextStatus = nextStatusMap[currentStatus] || "PAID";
  const buttonText =
    statusConfig[currentStatus as StatusKey] || "Update Status";

  // [SOLUSI 2] Cek apakah sudah selesai/dibatalkan
  const isFinishedOrCancelled =
    currentStatus === "SELESAI" || currentStatus === "CANCELLED";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Aksi Invoice
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- Bagian Upload Bukti Bayar (Form) --- */}
        <form action={uploadDispatch} className="space-y-2">
          <input type="hidden" name="id" value={invoiceId} />
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Bukti Bayar (Admin)
          </Label>

          {currentProofUrl ? (
            <div className="group relative w-full h-48 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <Image
                src={currentProofUrl}
                alt="Bukti Pembayaran"
                fill
                style={{ objectFit: "contain" }}
                className="bg-gray-100 dark:bg-gray-700"
              />
              <a
                href={currentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ExternalLink className="w-8 h-8 text-white" />
              </a>
            </div>
          ) : (
            <UploadButton isDisabled={!canUpload} />
          )}

          {uploadState.errors?.file && (
            <p className="text-sm text-red-500 mt-1">
              {uploadState.errors.file[0]}
            </p>
          )}
          {!canUpload && !currentProofUrl && (
            <p className="text-sm text-yellow-600 mt-1">
              Hanya bisa upload jika status UNPAID.
            </p>
          )}
        </form>

        {/* --- Bagian Ubah Status (Form) --- */}
        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ubah Status Order
          </Label>

          {/* [SOLUSI 2] Logika render dipindahkan ke sini */}
          {isFinishedOrCancelled ? (
            // Jika Selesai atau Batal, tampilkan tombol disabled
            <Button
              type="button"
              disabled
              variant="outline"
              className={`w-full flex justify-center items-center gap-2 ${
                currentStatus === "SELESAI"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>{buttonText}</span>
            </Button>
          ) : (
            // Jika belum selesai, tampilkan form
            <form action={updateStatusDispatch}>
              <input type="hidden" name="id" value={invoiceId} />

              {/* [PERBAIKAN SOLUSI 2] 
                  Tambahkan input tersembunyi untuk mengirim 'status'
              */}
              <input type="hidden" name="status" value={nextStatus} />
              {/* ----------------------------- */}

              <StatusButton
                isDisabled={!canUpdateStatus}
                buttonText={buttonText}
              />

              {updateStatusState.errors?.status && (
                <p className="text-sm text-red-500 mt-1">
                  {updateStatusState.errors.status[0]}
                </p>
              )}
            </form>
          )}

          {/* Tombol Batal (Form terpisah) */}
          {currentStatus !== "CANCELLED" && currentStatus !== "SELESAI" && (
            <form action={updateStatusDispatch} className="mt-2">
              <input type="hidden" name="id" value={invoiceId} />
              <input type="hidden" name="status" value="CANCELLED" />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:text-red-700"
                disabled={isStatusPending}
              >
                Batalkan Order (CANCELLED)
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
