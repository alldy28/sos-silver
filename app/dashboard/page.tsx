import { db } from "@/lib/db"; // Menggunakan alias path '@/'
import { SossilverProduct } from "@prisma/client";
import {
  Package,
  QrCode,
  CheckCheck,
  PlusCircle,
  LayoutGrid,
  History,
  AlertCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
// 1. TAMBAHKAN IMPORT StatCard dari file eksternal
import { StatCard } from "./products/components/StatCard";

/**
 * Fungsi untuk mengambil data statistik utama dari database.
 * Dijalankan di server.
 */
async function getDashboardStats() {
  try {
    // Menjalankan semua query secara paralel untuk performa maksimal
    const [productCount, codeCount, usedCodeCount, recentProducts] =
      await Promise.all([
        db.sossilverProduct.count(),
        db.generatedCode.count(),
        db.generatedCode.count({ where: { isUsed: true } }),
        db.sossilverProduct.findMany({
          orderBy: { createdAt: "desc" },
          take: 5, // Ambil 5 produk terbaru
          select: {
            // Hanya pilih data yang dibutuhkan
            id: true,
            nama: true,
            gambarUrl: true,
            gramasi: true,
            createdAt: true,
          },
        }),
      ]);

    return { productCount, codeCount, usedCodeCount, recentProducts };
  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
    // Kembalikan nilai default jika terjadi error
    return {
      productCount: 0,
      codeCount: 0,
      usedCodeCount: 0,
      recentProducts: [],
    };
  }
}

/**
 * Halaman Utama Dashboard
 * Ini adalah Server Component (async)
 */
export default async function DashboardPage() {
  // Ambil data saat server me-render halaman
  const { productCount, codeCount, usedCodeCount, recentProducts } =
    await getDashboardStats();

  return (
    <div className="p-4 md:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {/* Bagian Kartu Statistik (KPI) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Produk"
          value={productCount.toLocaleString("id-ID")}
          icon={<Package className="w-8 h-8 text-blue-500" />}
          description="Jumlah semua produk unik"
        />
        <Link href="/dashboard/products/list-kode">
          {/* Sekarang ini akan menggunakan StatCard yang diimpor, 
            yang sudah menerima 'className' 
          */}
          <StatCard
            title="Total Kode Dibuat"
            value={codeCount.toLocaleString("id-ID")}
            icon={<QrCode className="w-8 h-8 text-green-500" />}
            description="Jumlah semua kode verifikasi"
            className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          />
        </Link>
        <StatCard
          title="Kode Telah Digunakan"
          value={usedCodeCount.toLocaleString("id-ID")}
          icon={<CheckCheck className="w-8 h-8 text-indigo-500" />}
          description="Kode yang telah diverifikasi"
        />
      </section>

      {/* Bagian Konten Utama (Aksi & Aktivitas) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Aksi Cepat */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Aksi Cepat
          </h2>
          <QuickActionCard
            title="Tambah Produk Baru"
            href="/dashboard/products/create" // Arahkan ke halaman create
            icon={<PlusCircle className="w-7 h-7 text-white" />}
            iconBgColor="bg-blue-500"
          />
          <QuickActionCard
            title="Generate Kode Verifikasi"
            href="/dashboard/codes" // Arahkan ke halaman generator
            icon={<QrCode className="w-7 h-7 text-white" />}
            iconBgColor="bg-green-500"
          />
          <QuickActionCard
            title="Lihat Semua Produk"
            href="/dashboard/products" // Arahkan ke halaman list produk
            icon={<LayoutGrid className="w-7 h-7 text-white" />}
            iconBgColor="bg-gray-500"
          />
        </div>

        {/* Kolom Kanan: Aktivitas Terbaru */}
        <div className="lg:col-span-2">
          <RecentActivityCard products={recentProducts} />
        </div>
      </section>
    </div>
  );
}

// --- Komponen-Komponen Pendukung ---

// 2. DEFINISI LOKAL StatCard DAN StatCardProps DIHAPUS DARI SINI

/**
 * Komponen Tombol Aksi Cepat
 */
interface QuickActionCardProps {
  title: string;
  href: string;
  icon: ReactNode;
  iconBgColor: string;
}

function QuickActionCard({
  title,
  href,
  icon,
  iconBgColor,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
    >
      <div className={`p-3 rounded-lg ${iconBgColor}`}>{icon}</div>
      <span className="ml-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
        {title}
      </span>
    </Link>
  );
}

/**
 * Komponen Kartu Aktivitas/Produk Terbaru
 */
interface RecentActivityCardProps {
  // Kita bisa gunakan tipe parsial yang diambil oleh getDashboardStats
  products: {
    id: string;
    nama: string;
    gambarUrl: string | null;
    gramasi: number;
    createdAt: Date;
  }[];
}

function RecentActivityCard({ products }: RecentActivityCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-4">
        <History className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
          Produk Terbaru
        </h2>
      </div>

      {/* Daftar Produk */}
      <div className="space-y-4">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>Belum ada produk yang ditambahkan.</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Image
                src={
                  product.gambarUrl ||
                  "https://placehold.co/600x600/e2e8f0/cbd5e1?text=No+Image"
                }
                alt={product.nama}
                width={48}
                height={48}
                className="w-12 h-12 rounded-md object-cover border dark:border-gray-600"
              />
              <div className="ml-4 grow">
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {product.nama}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {product.gramasi} gram
                </p>
              </div>
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {product.createdAt.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
