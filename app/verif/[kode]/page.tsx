import { db } from "@/lib/db";
import { notFound } from "next/navigation";
// [PERBAIKAN] Impor komponen UI dari file client
import {
  ResultLayout,
  ProductDetails,
  StampAnimationStyles,
} from "./VerifComponents";

// Paksa halaman ini untuk selalu dinamis
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Tipe untuk props halaman
interface VerifyResultPageProps {
  // [PERBAIKAN] Next.js mengirimkan 'params' sebagai Promise
  params: Promise<{
    kode: string; // 'kode' ini adalah nama folder '[kode]'
  }>;
}

/**
 * Halaman Server Component untuk menampilkan hasil verifikasi.
 */
export default async function VerifyResultPage(props: VerifyResultPageProps) {
  // Langsung gunakan params
  const params = await props.params;
  const { kode } = params;

  // Guard clause - validasi kode
  if (!kode) {
    console.error(
      "VerifyResultPage: Kode parameter tidak ditemukan di params."
    );
    notFound();
  }

  // 1. Cari kode di database, LANGSUNG ambil data produk terkait
  const foundCode = await db.generatedCode.findUnique({
    where: {
      kode: kode,
    },
    include: {
      product: true, // Ini adalah kunci relasinya
    },
  });

  // --- KASUS 1: KODE TIDAK DITEMUKAN ---
  if (!foundCode) {
    return (
      <ResultLayout
        status="error"
        title="Kode Tidak Valid"
        message={`Kode verifikasi "${kode}" tidak ditemukan di sistem kami.`}
      />
    );
  }

  const product = foundCode.product;

  // --- KASUS 2 & 3: KODE DITEMUKAN (Logika Baru) ---

  // Jika ini adalah verifikasi PERTAMA kali, tandai sebagai "telah digunakan".
  if (!foundCode.isUsed) {
    await db.generatedCode.update({
      where: { id: foundCode.id },
      data: { isUsed: true },
    });
  }

  // Selalu tampilkan "Verifikasi Berhasil" jika kode ditemukan.
  return (
    <ResultLayout
      status="success"
      title="Verifikasi Berhasil!"
      message="Produk Anda telah terverifikasi sebagai produk asli."
    >
      {/* Panggil komponen <style> di sini.
        Ini akan meng-inject keyframes CSS ke dalam <head> dokumen.
      */}
      <StampAnimationStyles />

      {/* Menampilkan kode yang diverifikasi */}
      <div className="my-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Kode Terverifikasi:
        </p>
        <p className="mt-1 text-2xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
          {kode}
        </p>
      </div>

      <ProductDetails product={product} />
    </ResultLayout>
  );
}

// --- Komponen Helper (UI) ---

// [PERBAIKAN] SEMUA KOMPONEN DI BAWAH INI TELAH DIPINDAHKAN
// KE 'app/verif/[kode]/VerifComponents.tsx'

/**
 * Komponen Lencana "100% Original" dengan animasi
 */
// ... HAPUS DARI SINI ...

/**
 * Komponen untuk menampilkan detail produk
 */
// ... HAPUS DARI SINI ...

/**
 * Komponen layout untuk halaman hasil (Sukses, Error, Warning)
 */
// ... HAPUS DARI SINI ...

/**
 * [KOMPONEN BARU]
 * Komponen ini hanya merender tag <style> global
 * untuk animasi 'stamp-effect'.
 */
// ... HAPUS SAMPAI SINI ...
