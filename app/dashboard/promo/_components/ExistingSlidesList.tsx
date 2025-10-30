"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PromoSlide } from "@prisma/client";
import {
  deletePromoSlideAction,
  togglePromoSlideAction,
} from "../../../../actions/promo-action";
import { Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";

interface ExistingSlidesListProps {
  initialSlides: PromoSlide[];
}

export function ExistingSlidesList({ initialSlides }: ExistingSlidesListProps) {
  const router = useRouter();

  // Gunakan 'useTransition' untuk loading state (tanpa state error)
  const [isPending, startTransition] = useTransition();

  // Handler untuk menghapus slide
  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus slide ini?")) {
      startTransition(async () => {
        const result = await deletePromoSlideAction(id);
        if (!result.success) {
          alert(result.message || "Gagal menghapus slide.");
        } else {
          alert(result.message);
          router.refresh(); // Refresh data di Server Component
        }
      });
    }
  };

  // Handler untuk mengubah status aktif/nonaktif
  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await togglePromoSlideAction(id, currentStatus);
      if (!result.success) {
        alert(result.message || "Gagal mengubah status.");
      }
      // Tidak perlu alert sukses, toggle sudah cukup jelas
      // router.refresh(); // revalidatePath sudah menangani ini
    });
  };

  if (initialSlides.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Belum ada slide promo yang ditambahkan.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white p-6 border-b dark:border-gray-700">
        Daftar Slide Promo Aktif
      </h2>

      <div className="divide-y dark:divide-gray-700">
        {initialSlides.map((slide) => (
          <div
            key={slide.id}
            className="flex flex-col md:flex-row items-center justify-between p-4 gap-4"
          >
            {/* Info Slide */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Image
                src={slide.imageUrl}
                alt="Preview Promo"
                width={80}
                height={80}
                className="w-20 h-20 rounded-md object-cover border dark:border-gray-600"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Urutan: <span className="font-bold">{slide.order}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                  {slide.destinationUrl || "(Tidak ada link tujuan)"}
                </p>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-end">
              {/* Tombol Toggle Status */}
              <button
                onClick={() => handleToggle(slide.id, slide.isActive)}
                disabled={isPending}
                className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50
                  ${
                    slide.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-500"
                  }`}
                aria-label={slide.isActive ? "Nonaktifkan" : "Aktifkan"}
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : slide.isActive ? (
                  <ToggleRight className="w-4 h-4" />
                ) : (
                  <ToggleLeft className="w-4 h-4" />
                )}
                {slide.isActive ? "Aktif" : "Nonaktif"}
              </button>

              {/* Tombol Hapus */}
              <button
                onClick={() => handleDelete(slide.id)}
                disabled={isPending}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                aria-label="Hapus slide"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
