"use client";

import { useState } from "react";
import { Loader2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";

export default function GeneratePdfButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const contentElementId = "invoice-pdf-content";

  const getInvoiceIdForFilename = () => {
    if (typeof window === "undefined") return "invoice";
    const pathParts = window.location.pathname.split("/");
    const id = pathParts[pathParts.length - 1];
    return id.substring(0, 8) || "invoice"; // Ambil 8 karakter
  };

  const handleGeneratePdf = async () => {
    const input = document.getElementById(contentElementId);
    if (!input) {
      alert("Elemen konten untuk PDF tidak ditemukan!");
      return;
    }

    setIsGenerating(true);

    // [PERBAIKAN] Simpan style asli untuk dikembalikan nanti
    const originalWidth = input.style.width;
    const originalMaxWidth = input.style.maxWidth;

    try {
      // [PERBAIKAN] Paksa elemen untuk dirender pada lebar desktop (1200px)
      // Ini memastikan tabel (yang ada di dalamnya) tidak terpotong saat di-capture
      input.style.width = "1200px";
      input.style.maxWidth = "1200px";

      // 1. Capture element dengan html2canvas
      const canvas = await html2canvas(input, {
        scale: 2, // Skala 2 sudah cukup
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        // [PERBAIKAN] Beri tahu html2canvas untuk menggunakan lebar yang baru kita set
        width: 1200,
      });

      // 2. Get image data
      const imgData = canvas.toDataURL("image/png");

      // 3. PDF Configuration (A4 size)
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate dimensions to fit A4
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgScaledWidth = imgWidth * ratio;
      const imgScaledHeight = imgHeight * ratio;

      // Center the image
      const x = (pdfWidth - imgScaledWidth) / 2;
      const y = 0;

      // 4. Add image to PDF
      pdf.addImage(imgData, "PNG", x, y, imgScaledWidth, imgScaledHeight);

      // 5. Save PDF
      const invoiceId = getInvoiceIdForFilename();
      pdf.save(`invoice-${invoiceId}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      // [PERBAIKAN] Kembalikan style elemen ke semula
      input.style.width = originalWidth;
      input.style.maxWidth = originalMaxWidth;
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      variant="default"
      className="bg-blue-600 hover:bg-blue-700 shadow-md print:hidden"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Membuat PDF...</span>
        </>
      ) : (
        <>
          <Printer className="w-5 h-5 mr-2" />
          <span>Cetak PDF</span>
        </>
      )}
    </Button>
  );
}
