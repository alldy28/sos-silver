"use client";

// [PERBAIKAN 1] Impor 'useFormStatus' dari 'react-dom'
import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
// [PERBAIKAN] Pastikan Anda mengimpor 'addPaymentProofAction'
import {
  addPaymentProofAction,
  type InvoiceState,
} from "../../../../actions/invoice-actions";
import { Loader2, UploadCloud, ExternalLink, Paperclip } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UploadPaymentProofProps {
  invoiceId: string;
  currentProofUrl: string | null;
}

// Definisikan initial state untuk hook
const initialState: InvoiceState = { status: "info", message: "" };

/**
 * Tombol Submit khusus untuk form upload ini.
 * Menampilkan status pending.
 */
function SubmitUploadButton() {
  // [PERBAIKAN 2] Ganti 'useActionState' menjadi 'useFormStatus'
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <UploadCloud className="mr-2 h-4 w-4" />
      )}
      {pending ? "Mengunggah..." : "Upload File"}
    </Button>
  );
}

export function UploadPaymentProof({
  invoiceId, // <-- [PERBAIKAN] Tambahkan invoiceId di sini
  currentProofUrl,
}: UploadPaymentProofProps) {
  // [PERBAIKAN] Gunakan useActionState
  const [state, dispatch, isPending] = useActionState(
    addPaymentProofAction,
    initialState
  );

  // Gunakan ref untuk me-reset file input setelah sukses
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      alert(`Error: ${state.message}`);
    }
    if (state.status === "success") {
      // Jika sukses, notifikasi akan ditangani oleh server action
      // (via revalidate). Kita juga bisa me-reset file input.
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      alert("Upload sukses!"); // Atau gunakan Toast
    }
  }, [state]);

  // Jika sudah ada bukti bayar, tampilkan
  if (currentProofUrl) {
    return (
      <div className="space-y-2">
        <Label>Bukti Pembayaran (Sudah Diunggah)</Label>
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
        <p className="text-sm text-gray-500">
          Mengunggah file baru akan menggantikan file yang ada.
        </p>
      </div>
    );
  }

  // Jika belum ada, tampilkan form upload
  return (
    <form action={dispatch} className="space-y-4">
      {/* [PERBAIKAN] Kirim ID sebagai input tersembunyi */}
      <input type="hidden" name="id" value={invoiceId} />

      <div>
        <Label htmlFor="payment-upload">Upload Bukti Bayar</Label>
        <div className="mt-1 flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-gray-500" />
          <Input
            id="payment-upload"
            name="file" // <-- Nama 'file' harus cocok dengan Skema Zod
            type="file"
            className="flex-1"
            accept="image/png, image/jpeg, image/webp"
            ref={fileInputRef}
            disabled={isPending}
            required
          />
        </div>
        {/* Tampilkan error validasi file */}
        {state.errors?.file && (
          <p className="text-sm text-red-500 mt-1">{state.errors.file[0]}</p>
        )}
      </div>

      {/* [PERBAIKAN] Tombol submit sekarang ada di dalam form.
        Anda bisa gunakan 'useFormStatus' jika tombol ini dipisah ke komponen sendiri.
        Untuk kesederhanaan, kita gunakan 'isPending' dari 'useActionState'.
      */}
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Mengunggah..." : "Upload File"}
      </Button>
    </form>
  );
}
