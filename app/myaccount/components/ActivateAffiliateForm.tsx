"use client";

import { useActionState } from "react";
import { activateAffiliateAction } from "@/actions/affiliate-actions";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AffiliateState = {
  success?: boolean;
  error?: string;
};

// [FIX] Adjusted initialState to be compatible with the expected type.
// Instead of having both keys, we start with a neutral state.
const initialState: AffiliateState = {
  success: false,
  error: "",
};

export function ActivateAffiliateForm() {
  // [FIX] Removed the unused @ts-expect-error directive
  // [FIX] The type mismatch usually happens because the Action returns
  // { success: true } OR { error: "msg" }, but our state has both.
  // We can cast the initialState or let TS infer it from the action.

  const [state, formAction, isPending] = useActionState(
    activateAffiliateAction,
    // Casting initialState to 'any' is a quick fix if types are complex unions,
    // but better is ensuring activateAffiliateAction returns a consistent type.
    // Assuming activateAffiliateAction returns { success?: boolean; error?: string }
    initialState
  );

  return (
    <form action={formAction} className="w-full">
      <Button
        size="lg"
        className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 h-auto w-full shadow-lg transition-all hover:scale-[1.02]"
        disabled={isPending}
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
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 text-center animate-in fade-in slide-in-from-top-2">
          {state.error}
        </div>
      )}

      {/* Tampilkan Pesan Sukses (Opsional, biasanya action akan redirect/revalidate) */}
      {state?.success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-600 text-center animate-in fade-in slide-in-from-top-2">
          Berhasil! Mengalihkan ke dashboard...
        </div>
      )}
    </form>
  );
}
