// app/dashboard/invoice/_components/GeneratePdfButton.tsx
"use client";

import { useState } from "react";
import { Loader2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function GeneratePdfButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const contentElementId = "invoice-pdf-content";

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
      // 1. Capture element dengan html2canvas
      const canvas = await html2canvas(input, {
        scale: 3, // High quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
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
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGeneratePdf}
      disabled={isGenerating}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Membuat PDF...</span>
        </>
      ) : (
        <>
          <Printer className="w-5 h-5" />
          <span>Cetak PDF</span>
        </>
      )}
    </button>
  );
}
