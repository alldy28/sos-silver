"use client";

import { useActionState, useEffect, useState } from "react";
import {
  confirmInvoicePriceAction,
  type InvoiceState,
} from "@/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

  // [PERBAIKAN] State untuk input bisa string (untuk support kosong)
  const [discountPercent, setDiscountPercent] = useState<string | number>("");
  
  // [PERBAIKAN] State penjaga loop
  const [isSuccessProcessed, setIsSuccessProcessed] = useState(false);

  useEffect(() => {
    if (state.status === "error") {
      alert(state.message);
    }
    if (state.status === "success" && !isSuccessProcessed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSuccessProcessed(true);
      alert(state.message);
      router.refresh(); // Refresh data invoice
    }
  }, [state, isSuccessProcessed, router]);

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
            type="number" // Tetap number agar keyboard HP muncul angka
            // [PERBAIKAN] Value bisa string kosong
            value={discountPercent}
            onChange={(e) => {
              const val = e.target.value;
              
              // Izinkan kosong
              if (val === "") {
                setDiscountPercent(""); 
                return;
              }

              let numVal = parseFloat(val);
              
              // Batasi 0 - 100
              if (numVal < 0) numVal = 0;
              if (numVal > 100) numVal = 100;
              
              setDiscountPercent(numVal);
            }}
            max="100"
            min="0"
            step="0.1"
            // [PERBAIKAN] Hapus 'required' agar bisa dikosongkan (akan dianggap 0 di server)
            className="bg-white"
            disabled={isPending}
            placeholder="0" // Placeholder muncul saat kosong
          />
          {/* Input hidden untuk mengirim nilai '0' ke server jika field kosong */}
          {discountPercent === "" && (
             <input type="hidden" name="discountPercent" value="0" />
          )}
          
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