"use client";

// [PERBAIKAN] Impor useActionState dan useEffect
import { useActionState, useEffect } from "react";
// [PERBAIKAN] Impor sintaks yang benar
import {
  updateInvoiceStatusAction,
  type InvoiceState,
} from "../../../../actions/invoice-actions";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button"; // Menggunakan Button shadcn agar konsisten


interface Props {
  invoiceId: string;
  // [PERBAIKAN] Ubah currentStatus agar bisa menerima status lain
  currentStatus: string;
}

// Definisikan initial state untuk hook
const initialState: InvoiceState = { status: "info", message: "" };

export default function UpdateStatusButton({
  invoiceId,
  currentStatus,
}: Props) {
  // [PERBAIKAN] Gunakan useActionState.
  // 'isPending' akan otomatis didapat dari hook ini.
  const [state, dispatch, isPending] = useActionState(
    updateInvoiceStatusAction,
    initialState
  );

  // [PERBAIKAN] Hapus 'alert()' dari action.
  // Gunakan useEffect untuk menampilkan error jika ada.
  useEffect(() => {
    if (state.status === "error") {
      // PENTING: 'alert' adalah UI yang buruk.
      // Ganti ini dengan notifikasi 'Toast' untuk aplikasi profesional.
      alert(`Error: ${state.message}`);
    }
    // Jika sukses, action akan me-revalidasi path
    // dan komponen akan me-render ulang dengan status baru.
  }, [state]);

  // [PERBAIKAN] Hapus `confirm()`.
  // Ini adalah UI yang buruk dan memblokir.
  // Tindakan "Batalkan" harus disengaja oleh user.

  if (currentStatus === "PAID") {
    return (
      <div className="flex items-center p-3 rounded-lg bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700">
        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
        <span className="font-medium text-green-700 dark:text-green-300">
          Invoice sudah lunas.
        </span>
      </div>
    );
  }

  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex items-center p-3 rounded-lg bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700">
        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
        <span className="font-medium text-red-700 dark:text-red-300">
          Invoice telah dibatalkan.
        </span>
      </div>
    );
  }

  // Jika status UNPAID (atau status lain yang bisa diubah)
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* [PERBAIKAN] Tombol LUNAS sekarang adalah <form> */}
      <form action={dispatch}>
        <input type="hidden" name="id" value={invoiceId} />
        <input type="hidden" name="status" value="PAID" />
        <Button
          type="submit"
          disabled={isPending}
          variant="default"
          className="flex-1 w-full bg-green-600 hover:bg-green-700"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <CheckCircle className="w-5 h-5 mr-2" />
          )}
          Tandai LUNAS
        </Button>
      </form>

      {/* [PERBAIKAN] Tombol BATALKAN sekarang adalah <form> */}
      <form action={dispatch}>
        <input type="hidden" name="id" value={invoiceId} />
        <input type="hidden" name="status" value="CANCELLED" />
        <Button
          type="submit"
          disabled={isPending}
          variant="destructive" // Menggunakan variant destructive
          className="flex-1 w-full bg-red-600 hover:bg-red-700"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <XCircle className="w-5 h-5 mr-2" />
          )}
          Batalkan
        </Button>
      </form>
    </div>
  );
}
