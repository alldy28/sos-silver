import { Suspense } from "react";
import { VerificationForm } from "./_components/verification-form";
import { Loader2 } from "lucide-react";

/**
 * Komponen Fallback untuk <Suspense>
 * Ini adalah apa yang dilihat pengguna saat komponen klien (verifikasi-form)
 * sedang dimuat.
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="text-gray-500">Memuat verifikasi...</p>
    </div>
  );
}

/**
 * Halaman Verifikasi (Server Component)
 * Tugasnya hanya menyediakan Suspense Boundary.
 */
export default function NewVerificationPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Verifikasi Akun Anda
        </h1>
        {/* [PERBAIKAN]
          Kita membungkus komponen klien (VerificationForm) 
          dengan <Suspense>.
        */}
        <Suspense fallback={<LoadingState />}>
          <VerificationForm />
        </Suspense>
      </div>
    </div>
  );
}
