"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  addPaymentProofAction,
  type InvoiceState,
} from "@/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";

interface UploadProps {
  invoiceId: string;
  // Kita tidak perlu 'currentProofUrl' lagi,
  // karena InvoiceCard hanya akan me-render ini jika statusnya 'UNPAID'
}

const initialState: InvoiceState = { status: "info", message: "" };

export function CustomerUploadForm({ invoiceId }: UploadProps) {
  const [state, dispatch, isPending] = useActionState(
    addPaymentProofAction,
    initialState
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      alert(state.message); // Ganti dengan Toast
    }
    if (state.status === "success") {
      alert("Upload berhasil!"); // Ganti dengan Toast
      // Halaman akan di-revalidate oleh action,
      // jadi form ini akan hilang dan diganti status "Verifikasi"
    }
  }, [state]);

  return (
    <form action={dispatch} className="space-y-3">
      <input type="hidden" name="id" value={invoiceId} />
      <div>
        <Label
          htmlFor={`upload-${invoiceId}`}
          className="text-sm font-semibold text-gray-700"
        >
          Upload Bukti Pembayaran
        </Label>
        <div className="mt-1 flex items-center gap-2">
          <Input
            id={`upload-${invoiceId}`}
            name="file"
            type="file"
            className="flex-1 bg-white"
            accept="image/png, image/jpeg, image/webp"
            ref={fileInputRef}
            disabled={isPending}
            required
          />
        </div>
        {state.errors?.file && (
          <p className="text-sm text-red-500 mt-1">{state.errors.file[0]}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto"
        size="sm"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Mengunggah..." : "Konfirmasi Pembayaran"}
      </Button>
    </form>
  );
}
