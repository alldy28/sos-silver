// app/dashboard/invoice/_components/GeneratePdfButton.tsx
"use client";

import { useState } from "react";
import { Loader2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function GeneratePdfButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  // ID elemen yang akan dicetak
  // Kita akan definisikan <div id="invoice-pdf-content"> di halaman detail
  const contentElementId = "invoice-pdf-content";

  // Ambil ID invoice dari URL untuk nama file
  const getInvoiceIdForFilename = () => {
    if (typeof window === "undefined") return "invoice";
    const pathParts = window.location.pathname.split("/");
    return pathParts[pathParts.length - 1] || "invoice";
  };

  const handleGeneratePdf = async () => {
    const input = document.getElementById(contentElementId);
    if (!input) {
      alert("Elemen konten untuk PDF tidak ditemukan!");
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Gunakan html2canvas untuk "menggambar" div
      const canvas = await html2canvas(input, {
        scale: 2, // Meningkatkan resolusi gambar hasil canvas
        useCORS: true, // Izinkan gambar eksternal (jika ada)
      });

      // 2. Dapatkan data gambar dari canvas
      const imgData = canvas.toDataURL("image/png");

      // 3. Konfigurasi PDF (A4 = 210mm x 297mm)
      const pdfWidth = 210;
      const pageMargin = 10; // Margin 10mm di kiri dan kanan
      const contentWidth = pdfWidth - pageMargin * 2;

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Hitung rasio untuk fit ke lebar konten
      const ratio = imgWidth / contentWidth;
      const calculatedHeight = imgHeight / ratio;

      // 4. Buat dokumen jsPDF
      // 'p' = portrait, 'mm' = millimeters, 'a4' = A4
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = calculatedHeight;
      let position = 0; // Posisi vertikal untuk gambar

      // 5. Tambahkan halaman pertama (dengan margin)
      pdf.addImage(
        imgData,
        "PNG",
        pageMargin,
        position + pageMargin,
        contentWidth,
        calculatedHeight
      );
      heightLeft -= pdfHeight - pageMargin * 2;

      // 6. Jika konten lebih panjang dari 1 halaman, tambahkan halaman baru
      while (heightLeft > 0) {
        position = heightLeft - calculatedHeight; // Posisikan gambar sisanya
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          pageMargin,
          position,
          contentWidth,
          calculatedHeight
        );
        heightLeft -= pdfHeight;
      }

      // 7. Simpan file PDF
      pdf.save(`invoice-${getInvoiceIdForFilename()}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      className="flex items-center px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Printer className="w-4 h-4 mr-2" />
      )}
      {isGenerating ? "Membuat PDF..." : "Cetak PDF"}
    </button>
  );
}
