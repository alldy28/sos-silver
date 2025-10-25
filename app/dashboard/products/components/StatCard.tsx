import React from "react";

// Definisikan interface untuk props
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  className?: string; // <-- 1. Tambahkan prop className (opsional)
}

/**
 * Komponen reusable untuk menampilkan kartu statistik di dasbor.
 * Menerima 'className' untuk styling kustom (misalnya, hover effect).
 */
export function StatCard({
  title,
  value,
  icon,
  description,
  className, // <-- 2. Terima prop di sini
}: StatCardProps) {
  return (
    // <-- 3. Gabungkan className default dengan prop yang diterima
    <div
      className={`bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex items-start gap-4 ${
        className || ""
      }`}
    >
      {/* Icon */}
      {/* Pastikan ikon yang Anda kirim (misal: <QrCode />) sudah memiliki styling (cth: "w-8 h-8 text-green-500") */}
      <div className="flex-shrink-0">{icon}</div>

      {/* Konten Teks */}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
          {title}
        </p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

// Default export (opsional, tapi praktik yang baik)
export default StatCard;
