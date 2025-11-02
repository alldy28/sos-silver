// app/dashboard/invoice/_components/UploadPaymentProof.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import { uploadPaymentProofAction } from "../../../../actions/invoice-actions";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

interface Props {
  invoiceId: string;
  currentProofUrl: string | null;
}

export default function UploadPaymentProof({
  invoiceId,
  currentProofUrl,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Ref untuk mereset input file
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Pilih file untuk diupload.");
      return;
    }

    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("paymentProof", file);

    startTransition(async () => {
      const result = await uploadPaymentProofAction(invoiceId, formData);
      if (result.success) {
        setSuccess(result.message);
        setFile(null); // Kosongkan state file
        // Reset input file DOM
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-3">Bukti Pembayaran</h2>

      {/* Tampilkan bukti yang sudah ada */}
      {currentProofUrl ? (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Bukti Terupload:</p>
          <Image
            src={currentProofUrl}
            alt="Bukti Pembayaran"
            width={300}
            height={300}
            className="rounded-lg border dark:border-gray-600 object-cover w-full h-auto"
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          Belum ada bukti pembayaran. Upload akan otomatis mengubah status
          menjadi <span className="font-medium text-green-600">LUNAS</span>.
        </p>
      )}

      {/* Form Upload */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="paymentProof"
            className="block text-sm font-medium mb-1"
          >
            Upload File Baru
          </label>
          <input
            type="file"
            id="paymentProof"
            name="paymentProof"
            ref={fileInputRef}
            accept="image/*" // Hanya terima file gambar
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full text-sm border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:bg-gray-100 dark:file:bg-gray-700 dark:border-gray-600 dark:text-gray-300 hover:file:bg-gray-200"
          />
        </div>

        {/* Tampilkan pesan Error atau Sukses */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}

        <button
          type="submit"
          disabled={isPending || !file}
          className="w-full flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Upload className="w-5 h-5 mr-2" />
          )}
          {isPending ? "Mengupload..." : "Upload & Tandai Lunas"}
        </button>
      </form>
    </div>
  );
}
