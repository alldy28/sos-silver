import { Suspense } from "react";
import { Loader2 } from "lucide-react";
// Impor komponen client Anda
import { VerificationForm } from "./_components/verification-form";

/**
 * [PERBAIKAN] Ini adalah file page.tsx (Server Component) Anda.
 * Tugasnya HANYA untuk membungkus komponen Client (form)
 * dengan <Suspense>.
 */

// Komponen Fallback (Loading) untuk Suspense
function VerificationLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100px]">
      <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
      <p className="text-gray-500 mt-4">Memuat komponen verifikasi...</p>
    </div>
  );
}

export default function NewVerificationPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        {/* Judul Halaman */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Verifikasi Akun Anda
        </h1>

        {/* [PERBAIKAN PENTING]
          Bungkus komponen Client Anda (VerificationForm) 
          dengan <Suspense> karena ia menggunakan useSearchParams.
        */}
        <Suspense fallback={<VerificationLoading />}>
          <VerificationForm />
        </Suspense>
      </div>
    </main>
  );
}
