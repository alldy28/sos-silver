import { db } from "@/lib/db";
import { SossilverProduct } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

// Paksa halaman ini untuk selalu dinamis
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Tipe untuk props halaman (params adalah Promise di Next.js 15+)
interface VerifyResultPageProps {
  params: Promise<{
    kode: string; // 'kode' ini adalah nama folder '[kode]'
  }>;
}

/**
 * Halaman Server Component untuk menampilkan hasil verifikasi.
 */
export default async function VerifyResultPage(props: VerifyResultPageProps) {
  // Await params (ini adalah perbaikan untuk Next.js 15+)
  const params = await props.params;
  const { kode } = params;

  console.log("MERENDER HALAMAN VERIF. KODE DARI PARAMS:", kode); // Debugging

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
  // Jika sudah pernah, lewati langkah update ini.
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
      {/* -- PERUBAHAN DIMULAI DI SINI -- */}
      {/* Menampilkan kode yang diverifikasi */}
      <div className="my-6">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Kode Terverifikasi:
        </p>
        <p className="mt-1 text-2xl font-mono font-bold tracking-widest text-gray-900 dark:text-white">
          {kode}
        </p>
      </div>
      {/* -- PERUBAHAN BERAKHIR DI SINI -- */}

      <ProductDetails product={product} />
    </ResultLayout>
  );
}

// --- Komponen Helper (UI) ---

/**
 * Komponen untuk menampilkan detail produk
 */
function ProductDetails({ product }: { product: SossilverProduct }) {
  if (!product) return null;

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 text-left">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Detail Produk Terverifikasi
      </h3>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {product.gambarUrl && (
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
            <Image
              src={product.gambarUrl}
              alt={product.nama}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </div>
        )}
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {product.nama}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {product.series || "Seri Reguler"}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">
                Gramasi
              </dt>
              <dd className="text-gray-900 dark:text-white font-semibold">
                {product.gramasi} gr
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">
                Kadar
              </dt>
              <dd className="text-gray-900 dark:text-white font-semibold">
                {product.fineness}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">
                Tahun
              </dt>
              <dd className="text-gray-900 dark:text-white font-semibold">
                {product.tahunPembuatan || "-"}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponen layout untuk halaman hasil (Sukses, Error, Warning)
 */
function ResultLayout({
  status,
  title,
  message,
  children,
}: {
  status: "success" | "error" | "warning";
  title: string;
  message: string;
  children?: React.ReactNode;
}) {
  const config = {
    success: {
      icon: CheckCircle,
      iconClass: "text-green-600 dark:text-green-400",
      bgClass: "bg-green-100 dark:bg-green-900",
    },
    error: {
      icon: XCircle,
      iconClass: "text-red-600 dark:text-red-400",
      bgClass: "bg-red-100 dark:bg-red-900",
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "text-yellow-600 dark:text-yellow-400",
      bgClass: "bg-yellow-100 dark:bg-yellow-900",
    },
  };

  const { icon: Icon, iconClass, bgClass } = config[status];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${bgClass} mb-4`}
          >
            <Icon className={`w-8 h-8 ${iconClass}`} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{message}</p>

          {/* Render detail produk jika ada */}
          {children}

          <div className="mt-8">
            <Link
              href="/verif"
              className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Coba verifikasi kode lain
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
