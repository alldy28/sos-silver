"use client";

import { useState } from "react";
import { createFactoryPaymentBatch } from "@/actions/factory-actions"; // Pastikan path import benar
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CreateFactoryBatchForm() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("23:59"); // Default ke akhir hari
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!date || !time)
      return toast.error("Harap pilih tanggal dan jam cut-off!");

    // Gabungkan tanggal dan jam format ISO (YYYY-MM-DDTHH:mm)
    const dateTimeStr = `${date}T${time}`;

    const confirm = window.confirm(
      `Buat tagihan untuk semua invoice sampai tanggal ${date} jam ${time}?`
    );
    if (!confirm) return;

    setLoading(true);
    try {
      // Kirim string datetime lengkap ke server action
      const res = await createFactoryPaymentBatch(dateTimeStr);

      if (res.success) {
        toast.success(res.message);
        setDate("");
        setTime("23:59"); // Reset jam ke default
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex flex-col gap-2 mb-4">
        <Label className="font-semibold text-gray-700 text-lg">
          Buat Tagihan Baru (Cut-off)
        </Label>
        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
          Sistem akan menarik semua invoice siap produksi
          (Disiapkan/Dikirim/Selesai) yang dibuat <b>sebelum</b> waktu yang Anda
          tentukan di bawah ini.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-4">
        {/* INPUT TANGGAL */}
        <div className="w-full md:w-1/4 space-y-2">
          <Label
            htmlFor="cutoff-date"
            className="text-xs font-medium text-gray-600"
          >
            Tanggal
          </Label>
          <Input
            id="cutoff-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="cursor-pointer"
          />
        </div>

        {/* INPUT JAM */}
        <div className="w-full md:w-1/4 space-y-2">
          <Label
            htmlFor="cutoff-time"
            className="text-xs font-medium text-gray-600 flex items-center gap-1"
          >
            <Clock className="w-3 h-3" /> Jam (WIB)
          </Label>
          <Input
            id="cutoff-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="cursor-pointer"
          />
        </div>

        {/* TOMBOL AKSI */}
        <div className="w-full md:w-auto">
          <Button
            onClick={handleSubmit}
            disabled={loading || !date || !time}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full md:w-auto"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Generate Tagihan
          </Button>
        </div>
      </div>
    </div>
  );
}
