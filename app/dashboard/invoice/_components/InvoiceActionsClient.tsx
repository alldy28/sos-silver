"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import {
  updateInvoiceStatusAction,
  addPaymentProofAction,
  updateTrackingNumberAction, // [BARU] Import action baru
  type InvoiceState,
} from "../../../../actions/invoice-actions";
import {
  Loader2,
  UploadCloud,
  CheckCircle,
  ExternalLink,
  Printer,
  Truck, // [BARU] Icon Truck
  Save, // [BARU] Icon Save
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InvoiceActionsProps {
  invoiceId: string;
  currentStatus: string;
  currentProofUrl: string | null;
  currentResi?: string | null; // [BARU] Tambahkan properti ini
}

const initialState: InvoiceState = {
  status: "info",
  message: "",
  errors: {},
};

// ... (Komponen UploadButton TETAP SAMA, tidak perlu diubah) ...
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

// ... (Komponen StatusButton TETAP SAMA) ...
function StatusButton({
  isDisabled,
  buttonText,
}: {
  isDisabled: boolean;
  buttonText: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
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

// [BARU] Tombol Submit khusus untuk Resi
function ResiSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="icon" disabled={pending}>
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Save className="w-4 h-4" />
      )}
    </Button>
  );
}

export function InvoiceActionsClient({
  invoiceId,
  currentStatus,
  currentProofUrl,
  currentResi, // [BARU] Ambil props resi
}: InvoiceActionsProps) {
  const router = useRouter();

  // 1. State Upload
  const [uploadState, uploadDispatch] = useActionState(
    addPaymentProofAction,
    initialState
  );

  // 2. State Update Status
  const [updateStatusState, updateStatusDispatch, isStatusPending] =
    useActionState(updateInvoiceStatusAction, initialState);

  // 3. [BARU] State Update Resi
  const [resiState, resiDispatch] = useActionState(
    updateTrackingNumberAction,
    initialState
  );

  // --- Effects ---
  useEffect(() => {
    if (uploadState.status === "success") {
      alert("Upload Sukses: " + uploadState.message);
      router.refresh();
    }
  }, [uploadState, router]);

  useEffect(() => {
    if (updateStatusState.status === "success") {
      alert("Update Status Sukses: " + updateStatusState.message);
      router.refresh();
    }
  }, [updateStatusState, router]);

  // [BARU] Effect Resi
  useEffect(() => {
    if (resiState.status === "success") {
      alert("Resi Berhasil Disimpan!");
      router.refresh();
    } else if (resiState.status === "error") {
      alert("Gagal: " + resiState.message);
    }
  }, [resiState, router]);

  const canUpload = currentStatus === "UNPAID" && !currentProofUrl;
  const canUpdateStatus =
    currentStatus !== "SELESAI" && currentStatus !== "CANCELLED";

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

  const nextStatus = nextStatusMap[currentStatus] || "PAID";
  const buttonText =
    statusConfig[currentStatus as StatusKey] || "Update Status";

  const isFinishedOrCancelled =
    currentStatus === "SELESAI" || currentStatus === "CANCELLED";

  const handlePrintLabel = () => {
    window.open(`/dashboard/invoices/${invoiceId}/print`, "_blank");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Aksi Invoice
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- KOLOM KIRI: Upload Bukti Bayar --- */}
        <form action={uploadDispatch} className="space-y-2">
          {/* ... (Kode Form Upload tetap sama) ... */}
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
          {/* ... Error message upload ... */}
        </form>

        {/* --- KOLOM KANAN: Ubah Status & Resi --- */}
        <div className="space-y-2">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ubah Status Order
          </Label>

          {/* 1. Tombol Utama Status */}
          {isFinishedOrCancelled ? (
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
            <form action={updateStatusDispatch}>
              <input type="hidden" name="id" value={invoiceId} />
              <input type="hidden" name="status" value={nextStatus} />
              <StatusButton
                isDisabled={!canUpdateStatus}
                buttonText={buttonText}
              />
            </form>
          )}

          {/* 2. Tombol Print Label (Hanya Muncul Jika SEDANG_DISIAPKAN) */}
          {currentStatus === "SEDANG_DISIAPKAN" && (
            <Button
              type="button"
              variant="secondary"
              onClick={handlePrintLabel}
              className="w-full flex items-center justify-center gap-2 mt-2 border-dashed border-2 border-indigo-200 hover:border-indigo-400"
            >
              <Printer className="w-4 h-4" />
              Cetak Label Pengiriman
            </Button>
          )}

          {/* 3. [BARU] Input Resi (Hanya Muncul Jika SEDANG_PENGIRIMAN) */}
          {currentStatus === "SEDANG_PENGIRIMAN" && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
              <form action={resiDispatch} className="space-y-2">
                <input type="hidden" name="id" value={invoiceId} />
                <Label className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  <Truck className="w-4 h-4" />
                  Input Nomor Resi
                </Label>
                <div className="flex gap-2">
                  <Input
                    name="trackingNumber"
                    placeholder="Contoh: JP12345678"
                    defaultValue={currentResi || ""}
                    className="flex-1"
                  />
                  <ResiSubmitButton />
                </div>
                {resiState.errors?.trackingNumber && (
                  <p className="text-xs text-red-500">
                    {resiState.errors.trackingNumber[0]}
                  </p>
                )}
                {currentResi && (
                  <p className="text-xs text-green-600">
                    Resi saat ini: <b>{currentResi}</b>
                  </p>
                )}
              </form>
            </div>
          )}

          {/* 4. Tombol Batal */}
          {currentStatus !== "CANCELLED" && currentStatus !== "SELESAI" && (
            <form action={updateStatusDispatch} className="mt-2 pt-2">
              <input type="hidden" name="id" value={invoiceId} />
              <input type="hidden" name="status" value="CANCELLED" />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:text-red-700 border-none hover:bg-red-50"
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
