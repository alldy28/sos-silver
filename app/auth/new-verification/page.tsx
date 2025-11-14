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

export default function NewVerificationPage() {
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
        // [PERBAIKAN] Gunakan variabel 'error'
        console.error("Verification failed:", error); // 'error' digunakan di sini
        setStatus("error");
        setMessage("Terjadi kesalahan. Gagal memverifikasi.");
      }
    };

    // Jalankan verifikasi saat halaman dimuat
    runVerification();
  }, [token]); // 'useEffect' ini hanya berjalan 1x saat 'token' didapat

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        {/* Judul Halaman */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Verifikasi Akun Anda
        </h1>

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

        {/* [PERBAIKAN UI] 
          Tampilkan tombol Login setelah proses selesai (baik sukses atau error)
          agar user tahu langkah selanjutnya.
        */}
        {(status === "success" || status === "error") && (
          <Button
            asChild
            className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700"
          >
            <Link href="/login">Lanjutkan ke Halaman Login</Link>
          </Button>
        )}
      </div>
    </main>
  );
}
