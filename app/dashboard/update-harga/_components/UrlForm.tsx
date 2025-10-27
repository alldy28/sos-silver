"use client";

// Gunakan React.useActionState (nama baru untuk useFormState di React 19 / Next 15)
import { useActionState, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePriceImageUrlAction } from "../../../../actions/price-image-action";
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react";

// Tipe untuk state form
const initialState = { message: "", success: false };

export function UrlForm({
  currentImageUrl,
}: {
  currentImageUrl: string | null;
}) {
  const router = useRouter();

  // Gunakan useActionState untuk menangani Server Action
  const [state, formAction] = useActionState(
    updatePriceImageUrlAction,
    initialState
  );

  // State terpisah untuk melacak 'pending' (loading) dari React
  // Kita gunakan state manual karena 'isPending' dari useActionState
  // mungkin belum stabil di semua versi Next.js/React
  const [isPending, setIsPending] = useState(false);
  const [url, setUrl] = useState(currentImageUrl || "");

  // Efek untuk me-refresh router saat sukses
  useEffect(() => {
    if (state.success) {
      router.refresh(); // Refresh data di Server Component induk
    }
  }, [state, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Mencegah submit default
    setIsPending(true); // Mulai loading

    const formData = new FormData(event.currentTarget);
    await formAction(formData); // Panggil server action

    setIsPending(false); // Selesai loading
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-medium text-gray-700"
        >
          Tempel URL Gambar Harga (.png/.jpg)
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... (contoh: dari Imgur, dll)"
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
          disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Menyimpan..." : "Simpan URL Gambar"}
      </button>

      {/* Tampilkan pesan sukses atau error dari Server Action */}
      {state.message && (
        <div
          className={`flex items-center p-3 rounded-md text-sm ${
            state.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {state.success ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {state.message}
        </div>
      )}
    </form>
  );
}
