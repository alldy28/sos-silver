// app/dashboard/invoice/_components/UpdateStatusButton.tsx
"use client";

import { useTransition } from "react";
import { updateInvoiceStatusAction } from "../../../../actions/invoice-actions";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type InvoiceStatus = "PAID" | "UNPAID" | "CANCELLED";

interface Props {
  invoiceId: string;
  currentStatus: InvoiceStatus;
}

export default function UpdateStatusButton({
  invoiceId,
  currentStatus,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newStatus: InvoiceStatus) => {
    if (newStatus === currentStatus) return;

    // Tampilkan konfirmasi sebelum membatalkan
    if (newStatus === "CANCELLED") {
      if (!confirm("Apakah Anda yakin ingin membatalkan invoice ini?")) {
        return;
      }
    }

    startTransition(async () => {
      try {
        const result = await updateInvoiceStatusAction(invoiceId, newStatus);
        if (!result.success) {
          alert(result.message);
        }
        // Halaman akan otomatis revalidasi oleh server action
      } catch (error) {
        alert("Terjadi kesalahan.");
      }
    });
  };

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

  // Jika status UNPAID
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <button
        onClick={() => handleUpdate("PAID")}
        disabled={isPending}
        className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:bg-gray-400"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <CheckCircle className="w-5 h-5 mr-2" />
        )}
        Tandai LUNAS
      </button>
      <button
        onClick={() => handleUpdate("CANCELLED")}
        disabled={isPending}
        className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-gray-400"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <XCircle className="w-5 h-5 mr-2" />
        )}
        Batalkan
      </button>
    </div>
  );
}
