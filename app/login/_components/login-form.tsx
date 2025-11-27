"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth-actions";
import { AtSign, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

// Define initial state to match LoginState type (which includes undefined)
// but providing a concrete initial value avoids some undefined checks.
const initialState: LoginState = {
  status: "info",
  message: "",
};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />

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

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? "Loading..." : "Login"}
          {!isPending && <ArrowRight className="w-5 h-5 ml-2 -mr-1" />}
        </button>
      </div>

      {/* [FIX] Safely access state properties using optional chaining (?.) */}
      {state?.status === "error" && (
        <div
          className="flex items-center p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 mr-3" />
          <p>{state.message}</p>
        </div>
      )}

      {/* Optional: Show success message */}
      {state?.status === "success" && (
        <div
          className="flex items-center p-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
          role="alert"
        >
          <p>{state.message}</p>
        </div>
      )}
    </form>
  );
}
