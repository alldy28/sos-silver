"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

// [PERBAIKAN] Ganti ini dengan path ke server action login Anda
import { loginAction } from "@/actions/auth-actions";
// [PERBAIKAN] Hapus impor 'LoginState' dan 'initialState' dari action
// import { type LoginState, initialState } from '@/actions/auth-actions';

// [PERBAIKAN BARU] Definisikan Tipe State DI SINI (di file klien)
export type LoginState = {
  status: "info" | "error" | "success";
  message: string;
};

// [PERBAIKAN BARU] Definisikan Initial State DI SINI
export const initialState: LoginState = {
  status: "info",
  message: "",
};

// --- Simulasi Server Action (HAPUS JIKA SUDAH PUNYA) ---
// [DIHAPUS] Seluruh blok simulasi (loginAction dan initialState)
// sekarang dihapus. Kita menggunakan yang asli dari 'auth-actions'.
// --- Akhir Simulasi ---

/**
 * Komponen Klien yang berisi form, useSearchParams, dan useActionState
 */
export function LoginForm() {
  // [PERBAIKAN] Panggil useSearchParams DI DALAM komponen klien
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  // [PERBAIKAN] Gunakan useActionState untuk menangani state form
  // Ini sekarang akan memanggil 'loginAction' yang asli
  const [state, dispatch, isPending] = useActionState(
    loginAction,
    initialState
  );

  // Tentukan pesan error
  let errorMessage: string | null = null;
  if (state.status === "error" && state.message) {
    // Error dari action (saat form disubmit)
    errorMessage = state.message;
  } else if (urlError === "CredentialsSignin") {
    // Error dari Auth.js (saat di-redirect kembali)
    errorMessage = "Email atau password salah. Silakan coba lagi.";
  } else if (urlError) {
    // Error lain dari URL
    errorMessage = "Terjadi kesalahan. Silakan coba lagi.";
  }

  return (
    <form action={dispatch} className="space-y-6">
      {/* Tampilkan Error Box */}
      {errorMessage && (
        <div className="bg-red-50 p-3 rounded-md flex items-center gap-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@anda.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Login
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Daftar di sini
        </Link>
      </div>
    </form>
  );
}
