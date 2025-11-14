"use client"; // [PENTING] Menandakan ini adalah Client Component

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
// [PENTING] Pastikan Anda sudah me-restart editor (VS Code)
// agar file baru ini terdeteksi
import { newVerificationAction } from "@/actions/new-verification-action";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
// [BARU] Impor tombol
import { Button } from "@/components/ui/button";

/**
 * [FILE BARU]
 * Ini adalah file '_components/verification-form.tsx' Anda.
 * File ini berisi SEMUA logika Client (hooks) yang sebelumnya
 * ada di 'page.tsx' saya.
 */
export function VerificationForm() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Memverifikasi akun Anda...");

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // [PERBAIKAN] Logika dipindah ke dalam useEffect
  useEffect(() => {
    // Fungsi async internal untuk verifikasi
    const runVerification = async () => {
      // 1. Cek apakah token ada di URL
      if (!token) {
        setStatus("error");
        setMessage("Token verifikasi tidak ditemukan di URL.");
        return;
      }

      // 2. Panggil Server Action
      try {
        const result = await newVerificationAction(token);

        if (result.status === "success") {
          // 3. Jika Server Action sukses
          setStatus("success");
          setMessage(result.message);
        } else {
          // 4. Jika Server Action mengembalikan error (misal: token tidak valid)
          setStatus("error");
          setMessage(result.message);
        }
      } catch (error) {
        // 5. Jika Server Action crash (error tidak terduga)
        console.error("Verification failed:", error); // 'error' digunakan di sini
        setStatus("error");
        setMessage("Terjadi kesalahan. Gagal memverifikasi.");
      }
    };

    // Jalankan verifikasi saat halaman dimuat
    runVerification();
  }, [token]); // 'useEffect' ini hanya berjalan 1x saat 'token' didapat

  return (
    // Kita tidak perlu 'main' atau 'div' pembungkus
    // karena itu sudah ada di 'page.tsx'
    <>
      {/* Konten Dinamis (Loading, Sukses, Error) */}
      <div className="flex flex-col items-center justify-center min-h-[100px]">
        {status === "loading" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
            <p className="text-gray-500 mt-4">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-10 w-10 text-green-500" />
            <p className="text-green-600 mt-4">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-red-600 mt-4">{message}</p>
          </>
        )}
      </div>

      {/* Tombol Login */}
      {(status === "success" || status === "error") && (
        <Button
          asChild
          className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700"
        >
          <Link href="/login">Lanjutkan ke Halaman Login</Link>
        </Button>
      )}
    </>
  );
}
