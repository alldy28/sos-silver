"use client"; // <-- INI ADALAH KUNCI PERBAIKAN

import type { SossilverProduct } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

// --- Komponen Helper (UI) ---

/**
 * Komponen Lencana "100% Original" dengan animasi
 */
const AnimatedOriginalBadge = () => (
  <div className="absolute bottom-0 right-0 z-10 w-28 h-28 transform -rotate-12 translate-x-5 translate-y-5">
    {/* Kelas 'animate-stamp-effect' sekarang akan menggunakan 
      keyframe yang di-inject oleh StampAnimationStyles
    */}
    <Image
      src="/originalsilver.png" // Pastikan gambar ini ada di /public/100 original.png
      alt="100% Original Badge"
      fill
      style={{ objectFit: "contain" }}
      className="animate-stamp-effect opacity-60" // Mengubah opacity menjadi 60%
    />
  </div>
);

/**
 * Komponen untuk menampilkan detail produk
 */
export function ProductDetails({ product }: { product: SossilverProduct }) {
  if (!product) return null;

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6 text-left">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Detail Produk Terverifikasi
      </h3>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {product.gambarUrl && (
          // Container gambar dibuat 'relative' agar badge 'absolute' menempel padanya
          <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
            <Image
              src={product.gambarUrl}
              alt={product.nama}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 640px) 100vw, 640px"
            />
            {/* Badge diletakkan di dalam container gambar */}
            <AnimatedOriginalBadge />
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
                Tahun Release
              </dt>
              <dd className="text-gray-900 dark:text-white font-semibold">
                {product.tahunPembuatan || "-"}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500 dark:text-gray-400">
                Tanggal Produksi
              </dt>
              <dd className="text-gray-900 dark:text-white font-semibold">
                {/* [PERBAIKAN ERROR TANGGAL]
                  Objek 'Date' tidak bisa dirender. Ubah menjadi string.
                */}
                {new Date(product.createdAt).toLocaleDateString("id-ID")}
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
export function ResultLayout({
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

/**
 * [KOMPONEN BARU]
 * Komponen ini hanya merender tag <style> global
 * untuk animasi 'stamp-effect'.
 */
export function StampAnimationStyles() {
  return (
    <style jsx global>{`
      @keyframes stamp-effect {
        0% {
          transform: scale(1.8) rotate(-30deg) translateY(-100px);
          opacity: 0;
        }
        30% {
          transform: scale(1.8) rotate(-30deg) translateY(0);
          opacity: 0.8;
        }
        50% {
          transform: scale(1) rotate(-12deg) translateY(0);
          opacity: 0.6;
        }
        60% {
          transform: scale(1.05) rotate(-12deg);
          opacity: 0.6;
        }
        70% {
          transform: scale(0.98) rotate(-12deg);
          opacity: 0.6;
        }
        80%,
        100% {
          transform: scale(1) rotate(-12deg);
          opacity: 0.6;
        }
      }

      .animate-stamp-effect {
        /* Mulai animasi setelah 0.5s (delay), 
          durasi 0.8s, 
          1 kali, 
          dan berhenti di frame terakhir (forwards) 
        */
        animation: stamp-effect 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s 1
          forwards;
        opacity: 0; /* Mulai dari transparan sebelum animasi */
      }
    `}</style>
  );
}
