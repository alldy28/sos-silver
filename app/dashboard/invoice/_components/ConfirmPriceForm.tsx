"use client";

import { useActionState, useEffect, useState } from "react";
// Pastikan path ini benar
import {
  confirmInvoicePriceAction,
  type InvoiceState,
} from "@/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Impor helper formatCurrency Anda
// Sesuaikan path ke file utils Anda jika perlu
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation"; // [PERBAIKAN] Gunakan router untuk redirect

interface ConfirmPriceFormProps {
  invoiceId: string;
  subTotal: number;
}

const initialState: InvoiceState = { status: "info", message: "" };

export function ConfirmPriceForm({
  invoiceId,
  subTotal,
}: ConfirmPriceFormProps) {
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(
    confirmInvoicePriceAction,
    initialState
  );

  // State untuk input form
  const [discountPercent, setDiscountPercent] = useState(0);

  // [PERBAIKAN] State penjaga untuk mencegah infinite loop alert
  const [isSuccessProcessed, setIsSuccessProcessed] = useState(false);

  useEffect(() => {
    // Jika error, tampilkan alert
    if (state.status === "error") {
      alert(state.message);
    }

    // Jika sukses DAN belum diproses
    if (state.status === "success" && !isSuccessProcessed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSuccessProcessed(true); // Tandai sudah diproses agar tidak loop

      alert(state.message); // Tampilkan pesan sukses

      // Opsional: Redirect atau refresh halaman
      // router.refresh();
      // atau jika ingin ke halaman detail:
      // router.push(`/dashboard/invoice/${invoiceId}`);
    }
  }, [state, isSuccessProcessed, router, invoiceId]);

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-300 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-yellow-800 mb-4">
        Konfirmasi Harga & Ongkir
      </h3>
      <p className="text-gray-700 mb-2">
        Subtotal Produk:{" "}
        <span className="font-bold">{formatCurrency(subTotal)}</span>
      </p>

      <form action={dispatch} className="space-y-4">
        <input type="hidden" name="id" value={invoiceId} />

        <div className="space-y-2">
          <Label htmlFor="shippingFee" className="text-gray-800">
            Ongkos Kirim (Rp)
          </Label>
          <Input
            id="shippingFee"
            name="shippingFee"
            type="number"
            defaultValue="0"
            required
            className="bg-white"
            disabled={isPending}
          />
          {state.errors?.shippingFee && (
            <p className="text-sm text-red-500">
              {state.errors.shippingFee[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountPercent" className="text-gray-800">
            Diskon (%)
          </Label>
          <Input
            id="discountPercent"
            name="discountPercent"
            type="number"
            // [PERBAIKAN] Gunakan logika value yang aman untuk UX
            value={discountPercent === 0 ? "" : discountPercent}
            onChange={(e) => {
              const val = e.target.value;

              // Handle jika input dikosongkan
              if (val === "") {
                setDiscountPercent(0);
                return;
              }

              // [PERBAIKAN] Gunakan parseFloat agar bisa desimal
              let value = parseFloat(val);

              // Validasi batas 0-100
              if (isNaN(value)) value = 0;
              if (value < 0) value = 0;
              if (value > 100) value = 100;

              setDiscountPercent(value);
            }}
            max="100"
            min="0"
            step="0.1" // [PERBAIKAN] Izinkan desimal
            required
            className="bg-white"
            disabled={isPending}
            placeholder="0"
          />
          {state.errors?.discountPercent && (
            <p className="text-sm text-red-500">
              {state.errors.discountPercent[0]}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-yellow-600 hover:bg-yellow-700"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Konfirmasi & Kirim Total ke Customer
        </Button>
      </form>
    </div>
  );
}
