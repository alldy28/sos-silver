"use client";

import { useActionState } from "react";
import { activateAffiliateAction } from "@/actions/affiliate-actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Tipe State yang konsisten dengan Server Action
type AffiliateActionState = {
  success?: boolean;
  error?: string;
};

// Initial state dengan tipe yang benar
const initialState: AffiliateActionState = {
  success: false,
  error: "",
};

export function ActivateAffiliateForm() {
  // Menggunakan useActionState untuk menangani proses server action
  const [state, formAction, isPending] = useActionState(
    activateAffiliateAction,
    initialState
  );

  return (
    <form action={formAction} className="w-full flex flex-col items-center">
      <Button
        size="lg"
        className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 h-auto w-full shadow-lg transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Memproses Aktivasi...
          </>
        ) : (
          "Aktifkan Affiliate Sekarang"
        )}
      </Button>

      {/* Tampilkan Pesan Error jika ada */}
      {state?.error && (
        <div className="mt-4 p-3 w-full bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-2">
          ⚠️ {state.error}
        </div>
      )}

      {/* Tampilkan Pesan Sukses (Biasanya akan redirect, tapi untuk UX yang baik) */}
      {state?.success && (
        <div className="mt-4 p-3 w-full bg-green-50 border border-green-200 rounded-md text-sm text-green-600 text-center animate-in fade-in slide-in-from-top-2">
          ✅ Berhasil! Halaman sedang memuat ulang...
        </div>
      )}
    </form>
  );
}
