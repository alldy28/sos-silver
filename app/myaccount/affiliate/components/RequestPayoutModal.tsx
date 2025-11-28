"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { requestPayoutAction } from "@/actions/affiliate-actions"; // Path sesuaikan dengan struktur Anda
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// [PERBAIKAN] Tipe initialState yang konsisten
const initialState = { success: false, error: "", message: "" };

interface RequestPayoutModalProps {
  availableBalance: number;
  onClose: () => void;
}

export function RequestPayoutModal({
  availableBalance,
  onClose,
}: RequestPayoutModalProps) {
  const router = useRouter();

  // State lokal untuk input jumlah pencairan
  const [withdrawAmount, setWithdrawAmount] = useState(availableBalance);

  const [state, formAction, isPending] = useActionState(
    requestPayoutAction,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        onClose();
        router.refresh();
      }, 2000);
    }
  }, [state, onClose, router]);

  // Validasi input
  const isAmountValid =
    withdrawAmount >= 50000 && withdrawAmount <= availableBalance;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cairkan Komisi</DialogTitle>
          <DialogDescription>
            Saldo tersedia:{" "}
            <strong>Rp {availableBalance.toLocaleString("id-ID")}</strong>
          </DialogDescription>
        </DialogHeader>

        {state?.success ? (
          <div className="py-6 text-center text-green-600 bg-green-50 rounded-lg">
            <p className="font-semibold">Permintaan Terkirim!</p>
            <p className="text-sm">Admin akan segera memproses.</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            {/* [PERBAIKAN] Input Jumlah Pencairan (Bisa diatur user) */}
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah Pencairan (Rp)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                min={50000}
                max={availableBalance}
                className={
                  !isAmountValid ? "border-red-500 focus:ring-red-500" : ""
                }
              />
              {!isAmountValid && (
                <p className="text-xs text-red-500">
                  Minimal Rp 50.000 dan maksimal Rp{" "}
                  {availableBalance.toLocaleString("id-ID")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <Input
                id="bankName"
                name="bankName"
                placeholder="NAMA BANK"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Nomor Rekening</Label>
              <Input
                id="accountNumber"
                name="accountNumber"
                placeholder="1234567890"
                type="number"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountName">Atas Nama</Label>
              <Input
                id="accountName"
                name="accountName"
                placeholder="Nama Pemilik Rekening"
                required
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {state.error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={isPending || !isAmountValid} // Tombol mati jika tidak valid
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cairkan Dana
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
