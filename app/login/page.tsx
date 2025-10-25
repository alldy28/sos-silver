"use client";

// PERBAIKAN: Impor 'useActionState' dari 'react', bukan 'useFormState'
import { useActionState } from "react";
import { authenticate } from "@/actions/auth-actions"; // Asumsi path ke server action Anda
import { AtSign, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  // PERBAIKAN: Ganti 'useFormState' menjadi 'useActionState'
  // Tipe untuk state adalah [state, formAction]
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sossilver Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Silakan login untuk melanjutkan
          </p>
        </div>

        {/* Kita gunakan form action di sini.
          Saat form disubmit, 'formAction' akan dipanggil.
        */}
        <form action={formAction} className="space-y-6">
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
                placeholder="admin@sossilver.com"
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
                autoComplete="current-password"
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
              disabled={isPending} // 'isPending' otomatis didapat dari useActionState
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPending ? "Loading..." : "Login"}
              {!isPending && <ArrowRight className="w-5 h-5 ml-2 -mr-1" />}
            </button>
          </div>

          {/* Menampilkan Error Message */}
          {errorMessage && (
            <div
              className="flex items-center p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
              role="alert"
            >
              <AlertCircle className="w-5 h-5 mr-3" />
              <p>{errorMessage}</p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
