"use client";

import { useActionState } from "react";
import {
  forgotPasswordAction,
  type ForgotPasswordState,
} from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";

const initialState: ForgotPasswordState = { status: "info", message: "" };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Lupa Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Masukkan email terdaftar. Maksimal 5x request per hari.
          </p>
        </div>

        {state?.status === "success" ? (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20 text-center">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
              Cek Email Anda
            </h3>
            <p className="mt-2 text-sm text-green-700 dark:text-green-300">
              {state.message}
            </p>
            <Button
              asChild
              className="mt-4 w-full bg-green-600 hover:bg-green-700"
            >
              <Link href="/login">Kembali ke Login</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-8 space-y-6" action={formAction}>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10"
                  placeholder="email@anda.com"
                />
              </div>
            </div>

            {state?.status === "error" && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                {state.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Link Reset
            </Button>
          </form>
        )}

        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Batal
          </Link>
        </div>
      </div>
    </div>
  );
}
