"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralLinkCardProps {
  referralLink: string;
  referralCode: string;
}

export function ReferralLinkCard({
  referralLink,
  referralCode,
}: ReferralLinkCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setIsCopied(true);
      // Kembalikan icon ke 'Copy' setelah 2 detik
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin teks:", err);
    }
  };

  return (
    <Card className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-none shadow-lg overflow-hidden relative">
      {/* Hiasan background */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

      <CardContent className="p-6 md:p-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <p className="text-indigo-100 font-medium mb-1">
              Link Referral Anda
            </p>
            <h3 className="text-2xl font-bold">Bagikan & Dapatkan Komisi</h3>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
            <span className="text-xs text-indigo-200 uppercase tracking-wider block">
              Kode Referral
            </span>
            <span className="text-xl font-mono font-bold">{referralCode}</span>
          </div>
        </div>

        <div className="bg-black/20 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center border border-white/10">
          <Share2 className="w-5 h-5 text-indigo-200 hidden sm:block" />

          <code className="flex-1 text-sm sm:text-base font-mono break-all text-white">
            {referralLink}
          </code>

          {/* Tombol Copy */}
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="sm"
            className="shrink-0 bg-white text-indigo-700 hover:bg-indigo-50 transition-all duration-200 min-w-[100px]"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Disalin!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Salin Link
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-indigo-200 mt-4">
          Bagikan link ini ke media sosial. Komisi otomatis cair saat pesanan
          statusnya SELESAI
        </p>
      </CardContent>
    </Card>
  );
}
