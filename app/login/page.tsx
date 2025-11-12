import { Suspense } from "react";
import { LoginForm } from "./_components/login-form";
import { Loader2 } from "lucide-react";

/**
 * Komponen Fallback untuk <Suspense>
 * Tampil saat <LoginForm> (komponen klien) sedang dimuat.
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-48">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      <p className="text-gray-500">Memuat form login...</p>
    </div>
  );
}

/**
 * Halaman Login (Server Component)
 * Tugasnya hanya menyediakan tata letak dan Suspense Boundary.
 */
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Login ke Akun Anda
        </h1>

        {/* [PERBAIKAN]
          Kita membungkus komponen klien (LoginForm) 
          dengan <Suspense>.
        */}
        <Suspense fallback={<LoadingState />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
