"use client";

// Impor React (termasuk useActionState dan useEffect/useRef)
import { useEffect, useRef } from "react";
// Impor hook 'useActionState' dari 'react' (bukan 'react-dom')
import { useActionState } from "react";
import { useRouter } from "next/navigation";

// Impor Server Action dan Tipe Data
import {
  createPromoSlideAction,
  type ActionResult,
  // Kita tidak lagi butuh CreateSlideInput di sini
} from "../../../../actions/promo-action";

import { Loader2, PlusCircle } from "lucide-react";

// Tipe state awal untuk useActionState
const initialState: ActionResult = {
  success: false,
  message: "",
  error: null,
};

export function NewPromoSlideForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null); // Ref untuk form

  // Gunakan 'useActionState' untuk menangani form
  const [state, formAction, isPending] = useActionState(
    createPromoSlideAction,
    initialState
  );

  // Efek untuk memantau 'state.success'
  useEffect(() => {
    if (state.success && state.slide) {
      // Jika sukses, tampilkan alert dan reset form
      alert(state.message);
      formRef.current?.reset(); // Reset form setelah sukses
      router.refresh(); // Refresh halaman (opsional, karena revalidatePath sudah ada)
    } else if (!state.success && state.message && !state.error) {
      // Menangani pesan error umum (non-field)
      alert(state.message);
    }
  }, [state, router]);

  return (
    <form
      ref={formRef} // Terapkan ref ke form
      action={formAction} // Panggil Server Action
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Tambah Slide Promo Baru
      </h2>

      {/* --- URL Gambar --- */}
      <div className="mb-4">
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL Gambar
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl" // 'name' harus cocok dengan FormData
          placeholder="https://.../gambar-promo.png"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {/* Tampilkan error spesifik field */}
        {state.error?.field === "imageUrl" && (
          <p className="text-sm text-red-500 mt-1">{state.error.message}</p>
        )}
      </div>

      {/* --- URL Tujuan (Opsional) --- */}
      <div className="mb-4">
        <label
          htmlFor="destinationUrl"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          URL Tujuan (Link Saat Diklik)
        </label>
        <input
          type="url"
          id="destinationUrl"
          name="destinationUrl"
          placeholder="https://wa.me/... (Opsional)"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {state.error?.field === "destinationUrl" && (
          <p className="text-sm text-red-500 mt-1">{state.error.message}</p>
        )}
      </div>

      {/* --- Urutan & Status (Satu Baris) --- */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label
            htmlFor="order"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Urutan
          </label>
          <input
            type="number"
            id="order"
            name="order"
            defaultValue="1"
            min="1"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {/* Tampilkan error spesifik field */}
          {state.error?.field === "order" && (
            <p className="text-sm text-red-500 mt-1">{state.error.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="isActive"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status
          </label>
          <select
            id="isActive"
            name="isActive"
            defaultValue="true"
            required
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="true">Aktif (Tampilkan)</option>
            <option value="false">Nonaktif (Sembunyikan)</option>
          </select>
        </div>
      </div>

      {/* Tombol Submit */}
      <button
        type="submit"
        disabled={isPending} // Nonaktifkan tombol saat loading
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <PlusCircle className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Menyimpan..." : "Tambah Slide Baru"}
      </button>
    </form>
  );
}
