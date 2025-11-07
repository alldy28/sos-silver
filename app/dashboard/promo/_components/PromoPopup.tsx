"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Impor untuk Carousel
import Slider from "react-slick";
// CSS Impor dipindahkan ke app/layout.tsx untuk memperbaiki error TypeScript

// Tipe data yang kita harapkan dari layout/page (array of slides)
import type { PromoSlide } from "@prisma/client";

// --- PERBAIKAN: Tipe untuk props panah navigasi (menggantikan 'any') ---
interface ArrowProps {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}
// -----------------------------------------------------------------

interface PromoPopupProps {
  // Sekarang menerima array of PromoSlide
  promoSlides: PromoSlide[];
}

// Komponen panah navigasi kustom untuk slider
function NextArrow(props: ArrowProps) {
  // <-- PERBAIKAN: Tipe 'any' diganti 'ArrowProps'
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} flex! items-center! justify-center! bg-black/40! hover:bg-black/60! w-8! h-8! rounded-full! right-2! z-10`}
      style={{ ...style }}
      onClick={onClick}
      aria-label="Next slide"
    >
      {/* <ChevronRight className="w-5 h-5 text-white" /> */}
    </button>
  );
}

function PrevArrow(props: ArrowProps) {
  // <-- PERBAIKAN: Tipe 'any' diganti 'ArrowProps'
  const { className, style, onClick } = props;
  return (
    <button
      className={`${className} flex! items-center! justify-center! bg-black/40! hover:bg-black/60! w-8! h-8! rounded-full! left-2! z-10`}
      style={{ ...style }}
      onClick={onClick}
      aria-label="Previous slide"
    >
      {/* <ChevronLeft className="w-5 h-5 text-white" /> */}
    </button>
  );
}

export function PromoPopup({ promoSlides }: PromoPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const PROMO_SEEN_KEY = "sossilver_promo_seen_v2"; // Ubah versi jika struktur berubah

  useEffect(() => {
    const promoSeen = sessionStorage.getItem(PROMO_SEEN_KEY);
    // Tampilkan jika ada slide DAN belum pernah dilihat
    if (promoSlides && promoSlides.length > 0 && !promoSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [promoSlides]);

  const handleClose = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(PROMO_SEEN_KEY, "true");
    } catch (error) {
      console.error("Gagal menyimpan session storage:", error);
    }
  };

  // Pengaturan untuk react-slick
  const sliderSettings = {
    dots: true, // Tampilkan titik navigasi
    infinite: true, // Loop slide
    speed: 500, // Kecepatan transisi (ms)
    slidesToShow: 1, // Tampilkan 1 slide per waktu
    slidesToScroll: 1,
    autoplay: true, // Putar otomatis
    autoplaySpeed: 5000, // Pindah slide setiap 5 detik
    pauseOnHover: true, // Jeda saat mouse di atasnya
    nextArrow: <NextArrow />, // Panah navigasi kustom
    prevArrow: <PrevArrow />,
    appendDots: (
      dots: React.ReactNode // Styling titik navigasi
    ) => (
      <div style={{ bottom: "10px" }}>
        <ul style={{ margin: "0px" }}> {dots} </ul>
      </div>
    ),
    customPaging: (
    ) => (
      <div className="w-2 h-2 rounded-full bg-white/50 transition-colors duration-300 slick-dots-inactive"></div>
    ),
  };

  return (
    <AnimatePresence>
      {isVisible && promoSlides && promoSlides.length > 0 && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-60 backdrop-blur-sm" // Naikkan z-index
            onClick={handleClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />

          {/* Konten Popup */}
          <motion.div
            className="fixed top-1/2 left-1/2 z-70 w-[90vw] max-w-lg p-4" // Lebarkan sedikit
            initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ transform: "translate(-50%, -50%)" }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl relative pt-8 p-1">
              {" "}
              {/* Tambah padding top untuk tombol X */}
              {/* Tombol Tutup (X) - Pindah ke dalam */}
              <button
                onClick={handleClose}
                className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-gray-600/50 text-white rounded-full transition-all hover:scale-110 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Tutup popup promo"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Carousel Slider */}
              <Slider {...sliderSettings}>
                {promoSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="px-1 outline-none focus:outline-none"
                  >
                    {/* Bungkus dengan Link jika ada destinationUrl */}
                    {slide.destinationUrl ? (
                      <Link
                        href={slide.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer outline-none focus:outline-none"
                        onClick={handleClose} // Tutup saat diklik
                      >
                        <Image
                          src={slide.imageUrl}
                          alt="Promo Sossilver Slide"
                          width={500} // Sesuaikan dengan max-w popup
                          height={500} // Sesuaikan rasio
                          className="w-full h-auto rounded-md object-contain max-h-[60vh]"
                        />
                      </Link>
                    ) : (
                      // Jika tidak ada link tujuan
                      <div className="relative outline-none focus:outline-none">
                        <Image
                          src={slide.imageUrl}
                          alt="Promo Sossilver Slide"
                          width={500}
                          height={500}
                          className="w-full h-auto rounded-md object-contain max-h-[60vh]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </Slider>
            </div>
            {/* Styling untuk titik dots aktif */}
            <style jsx global>{`
              .slick-dots li.slick-active div {
                background-color: white !important;
              }
            `}</style>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
