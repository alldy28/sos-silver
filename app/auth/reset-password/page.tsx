"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
// Pastikan import action dan tipe benar
import {
  resetPasswordAction,
  type ResetPasswordState,
} from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Lock,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

// [PERBAIKAN] initialState sekarang valid karena tipe di actions sudah support 'info'
const initialState: ResetPasswordState = { status: "info", message: "" };

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  // [PERBAIKAN] Hook ini sekarang seharusnya tidak error
  const [state, formAction, isPending] = useActionState(
    resetPasswordAction,
    initialState
  );

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.status === "success") {
      const timeout = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [state, router]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white p-8 rounded shadow">
          <h1 className="text-xl font-bold mb-4">Token Tidak Ditemukan</h1>
          <Link
            href="/auth/forgot-password"
            className="text-blue-600 underline"
          >
            Request Ulang
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Masukkan password baru Anda.
          </p>
        </div>

        {state?.status === "success" ? (
          <div className="rounded-md bg-green-50 p-6 text-center dark:bg-green-900/20">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200">
              Berhasil!
            </h3>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              Password berhasil diubah. Mengalihkan ke login...
            </p>
            <Button
              asChild
              className="mt-4 w-full bg-green-600 hover:bg-green-700"
            >
              <Link href="/login">Login Sekarang</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" action={formAction}>
            <input type="hidden" name="token" value={token} />

            <div className="space-y-4">
              <div>
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10"
                    placeholder="Minimal 6 karakter"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="pl-10 pr-10"
                    placeholder="Ulangi password baru"
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {state?.status === "error" && state.message && (
              <div className="flex items-center p-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800">
                <AlertTriangle className="flex-shrink-0 inline w-4 h-4 mr-3" />
                <div>{state.message}</div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 py-6"
              >
                {isPending ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  "Simpan Password Baru"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h2>
        </div>
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    </div>
  );
}

// [PERBAIKAN] Tambahkan Suspense untuk mengatasi error useSearchParams pada pre-render
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
