import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link"; // <-- Diperlukan untuk WhatsAppBubble
import "./globals.css";

// Setup font
const inter = Inter({ subsets: ["latin"] });

// --- Perbaikan Metadata (Judul Tab) ---
export const metadata: Metadata = {
  title: "Sossilver - Investasi Perak Murni Terjamin",
  description:
    "Temukan kemurnian perak 999.9 bersertifikat dari Sossilver. Pilihan terpercaya untuk melindungi nilai aset Anda.",
  // Next.js akan otomatis mencari 'favicon.ico' di /app
};

/**
 * Komponen Tombol WhatsApp Mengambang
 * (Kode yang Anda pilih, sekarang ada di sini)
 */
function WhatsAppBubble() {
  // --- GANTI NOMOR DAN PESAN DI SINI ---
  const phoneNumber = "628131114586"; // GANTI DENGAN NOMOR WA ADMIN (Format 62...)
  const message = "Halo Sossilver, saya tertarik dengan produk Anda."; // GANTI PESAN OTOMATIS
  // -------------------------------------

  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <Link
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg transition-transform hover:scale-110"
      title="Hubungi kami di WhatsApp"
    >
      {/* Ikon WhatsApp SVG */}
      <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.06 21.94L7.31 20.58C8.75 21.38 10.36 21.82 12.04 21.82C17.5 21.82 21.95 17.37 21.95 11.91C21.95 6.45 17.5 2 12.04 2ZM12.04 20.13C10.52 20.13 9.04 19.72 7.76 19L7.31 18.73L3.92 19.7L5.02 16.42L4.72 15.96C3.96 14.59 3.53 13.07 3.53 11.91C3.53 7.31 7.37 3.47 12.04 3.47C16.71 3.47 20.55 7.31 20.55 11.91C20.55 16.51 16.71 20.13 12.04 20.13ZM17.37 14.31C17.11 14.18 15.79 13.52 15.54 13.43C15.29 13.33 15.11 13.29 14.93 13.54C14.75 13.79 14.24 14.41 14.11 14.59C13.98 14.77 13.86 14.81 13.61 14.72C13.36 14.62 12.45 14.3 11.39 13.37C10.53 12.62 9.94 11.72 9.77 11.47C9.6 11.22 9.72 11.11 9.84 10.99C9.95 10.87 10.09 10.68 10.21 10.53C10.33 10.38 10.38 10.28 10.46 10.1C10.54 9.92 10.49 9.77 10.42 9.65C10.35 9.53 9.8 8.25 9.59 7.7C9.38 7.15 9.17 7.22 9.02 7.21C8.87 7.2 8.69 7.2 8.51 7.2C8.33 7.2 8.08 7.27 7.86 7.52C7.64 7.77 7.01 8.34 7.01 9.53C7.01 10.72 7.89 11.84 8.01 12C8.13 12.16 9.78 14.68 12.23 15.76C12.84 16.03 13.31 16.2 13.69 16.33C14.28 16.51 14.79 16.48 15.21 16.4C15.68 16.31 17.11 15.49 17.37 14.88C17.63 14.27 17.63 13.79 17.55 13.66C17.47 13.54 17.23 13.43 17.05 13.33" />
      </svg>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <WhatsAppBubble /> {/* <-- Tombol WA dipanggil di sini */}
      </body>
    </html>
  );
}
