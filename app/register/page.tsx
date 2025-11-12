"use client";

import { useActionState } from "react";
import Link from "next/link";
// [PERBAIKAN] Menggunakan alias path '@/'
import { registerAction } from "@/actions/register-action"; 
import { AtSign, Lock, AlertCircle, ArrowRight, User } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerAction, // Menggunakan action yang sudah diimpor
    undefined
  );

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buat Akun Baru
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Silakan isi data diri Anda.
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {/* Nama Lengkap */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nama Lengkap
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="Nama Anda"
                className="block w-full py-3 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <AtSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="email@anda.com"
                className="block w-full py-3 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                placeholder="••••••••"
                className="block w-full py-3 pl-10 pr-4 text-gray-900 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                                disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? "Mendaftarkan..." : "Daftar"}
              {!isPending && <ArrowRight className="w-5 h-5 ml-2 -mr-1" />}
            </button>
          </div>

          {/* Menampilkan Error atau Success Message */}
          {state && (
            <div
              className={`flex items-center p-4 text-sm rounded-lg ${
                state.status === 'success' 
                  ? 'text-green-700 bg-green-100 dark:bg-green-200 dark:text-green-800'
                  : 'text-red-700 bg-red-100 dark:bg-red-200 dark:text-red-800'
              }`}
              role="alert"
            >
              <AlertCircle className="w-5 h-5 mr-3" />
              <p>{state.message}</p>
            </div>
          )}
        </form>

        {/* Link ke Halaman Login */}
        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link
            href="/login" // [PERBAIKAN] Arahkan ke /login-customer
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Login di sini
          </Link>
        </div>
      </div>
    </main>
  );
}