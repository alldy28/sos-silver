import { db } from "@/lib/db";
import { NewPromoSlideForm } from "./_components/NewPromoSlideForm";
import { ExistingSlidesList } from "./_components/ExistingSlidesList";

/**
 * Fungsi untuk mengambil semua slide promo dari database
 */
async function getAllPromoSlides() {
  try {
    const slides = await db.promoSlide.findMany({
      orderBy: { order: "asc" }, // Urutkan berdasarkan 'order'
    });
    return slides;
  } catch (error) {
    console.error("Gagal mengambil semua slide promo:", error);
    return []; // Kembalikan array kosong jika error
  }
}

/**
 * Halaman Admin untuk Mengelola Carousel Promo (CRUD)
 */
export default async function PromoCarouselAdminPage() {
  const slides = await getAllPromoSlides();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md my-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4">
        Kelola Popup Promo Carousel
      </h1>

      {/* Bagian 1: Form untuk menambah slide baru */}
      <section className="mb-12 p-6 border rounded-lg bg-gray-50 dark:bg-gray-700">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-5">
          Tambah Slide Promo Baru
        </h2>
        <NewPromoSlideForm />
      </section>

      {/* Bagian 2: Daftar slide yang sudah ada */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-5">
          Daftar Slide Promo Saat Ini
        </h2>
        <ExistingSlidesList initialSlides={slides} />
      </section>
    </div>
  );
}
