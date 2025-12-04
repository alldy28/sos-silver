// src/components/PrintAutoTrigger.tsx (atau buat inline di file page jika mau)
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintAutoTrigger() {
  useEffect(() => {
    // Timeout sedikit agar CSS load sempurna sebelum dialog print muncul
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print:hidden mb-6 flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
      <p className="text-sm text-blue-700">
        Jendela cetak akan terbuka otomatis. Jika tidak, klik tombol di kanan.
      </p>
      <Button onClick={() => window.print()} className="gap-2">
        <Printer className="w-4 h-4" />
        Cetak Sekarang
      </Button>
    </div>
  );
}
