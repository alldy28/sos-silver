"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

// Ganti ini dengan path ke server action Anda, contoh:
// import { newVerificationAction } from '@/actions/auth-actions';

// --- Simulasi Server Action (Hapus jika sudah punya) ---
// Ganti ini dengan Server Action Anda yang sebenarnya
const newVerificationAction = (
  token: string
): Promise<{ status: "success" | "error"; message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (token === "12345") {
        // Simulasi token valid
        resolve({ status: "success", message: "Email berhasil diverifikasi!" });
      } else {
        // Simulasi token invalid
        resolve({ status: "error", message: "Token verifikasi tidak valid." });
      }
    }, 1500);
  });
};
// --- Akhir Simulasi ---

/**
 * Komponen Klien yang berisi logika useSearchParams
 */
export function VerificationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // State untuk melacak status verifikasi
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Sedang memverifikasi token Anda...");

  // Fungsi untuk memanggil server action
  const runVerification = useCallback(async () => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan di URL.");
      return;
    }

    try {
      // Panggil server action Anda
      const result = await newVerificationAction(token);

      if (result.status === "success") {
        setStatus("success");
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage("Terjadi kesalahan. Silakan coba lagi.");
    }
  }, [token]);

  // Jalankan verifikasi saat komponen dimuat
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runVerification();
  }, [runVerification]);

  // Tampilkan UI berdasarkan status
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {status === "loading" && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <p className="text-gray-500">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle className="h-8 w-8 text-green-500" />
          <p className="text-green-600">{message}</p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-8 w-8 text-red-500" />
          <p className="text-red-600">{message}</p>
        </>
      )}
    </div>
  );
}
