"use client";

// [PERBAIKAN] Impor 'LoginState' dari actions agar tipe sinkron
import { loginAction, type LoginState } from "@/actions/auth-actions";
import { useActionState } from "react";
import { AlertTriangle, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  // [PERBAIKAN] Gunakan initialState yang sesuai dengan tipe LoginState (undefined valid)
  // TypeScript sekarang seharusnya senang karena tipe di action dan di sini cocok.
  const [errorMessage, dispatch, isPending] = useActionState(
    loginAction,
    undefined
  );

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <form action={dispatch} className="space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Alamat Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        {/* [BARU] Link Lupa Password */}
        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Lupa password?
        </Link>
      </div>

      {errorMessage && (
        <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-md border border-red-200">
          <AlertTriangle className="w-5 h-5 mr-2 shrink-0" />
          <p>{errorMessage.message}</p>{" "}
          {/* PERBAIKAN: Akses properti .message */}
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isPending ? "Memproses..." : "Masuk"}
          {!isPending && <LogIn className="w-5 h-5 ml-2" />}
        </button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          className="mx-auto h-12 w-auto"
          src="/logosos-baru.png"
          alt="Sossilver Logo"
          width={200}
          height={50}
          unoptimized
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Login ke Akun Anda
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Admin & Customer
          <br />
          <span className="text-gray-500">Belum punya akun? </span>
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Daftar di sini
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
