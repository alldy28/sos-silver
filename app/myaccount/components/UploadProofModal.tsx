"use client";

import { useEffect, useState } from "react";
// [PERBAIKAN] useActionState diimpor dari 'react'
import { useActionState } from "react";
// [PERBAIKAN] useFormStatus diimpor dari 'react-dom'
import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, AlertCircle, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// Impor action yang SUDAH ADA
import {
  addPaymentProofAction,
  type InvoiceState,
} from "@/actions/invoice-actions";

interface UploadProofModalProps {
  invoice: { id: string; invoiceNumber: string };
  onClose: () => void;
}

// Initial state untuk form action
const initialState: InvoiceState = {
  status: "info",
  message: "",
};

/**
 * Komponen Tombol Submit internal
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UploadCloud className="w-4 h-4 mr-2" />
      )}
      {pending ? "Mengunggah..." : "Upload Bukti Pembayaran"}
    </Button>
  );
}

/**
 * Komponen Modal
 */
export function UploadProofModal({ invoice, onClose }: UploadProofModalProps) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  // Gunakan useActionState untuk form upload
  const [state, formAction, isPending] = useActionState(
    addPaymentProofAction,
    initialState
  );

  // Tampilkan pratinjau gambar saat dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Efek untuk menangani hasil dari server action
  useEffect(() => {
    if (state.status === "success") {
      // Jika sukses, beri waktu 2 detik lalu tutup modal & refresh
      setTimeout(() => {
        onClose();
        router.refresh(); // Refresh halaman untuk memperbarui daftar transaksi
      }, 2000);
    }
  }, [state.status, onClose, router]);

  return (
    // 'open' dikontrol oleh state di 'TransactionTabs'
    // 'onOpenChange' akan memanggil 'onClose' saat modal ditutup
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {/* Tampilkan pesan sukses di atas form */}
        {state.status === "success" ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl">Upload Berhasil!</DialogTitle>
            <DialogDescription className="mt-2">
              {state.message} Halaman akan dimuat ulang.
            </DialogDescription>
          </div>
        ) : (
          <>
            {/* Form Upload */}
            <DialogHeader>
              <DialogTitle>Upload Bukti Pembayaran</DialogTitle>
              <DialogDescription>
                Untuk Invoice #{invoice.invoiceNumber.substring(0, 8)}...
              </DialogDescription>
            </DialogHeader>

            <form action={formAction} className="space-y-4">
              {/* Input tersembunyi untuk ID invoice */}
              <input type="hidden" name="id" value={invoice.id} />

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="file">Bukti Transfer (Max 5MB)</Label>
                <Input
                  id="file"
                  name="file" // 'name' harus "file" agar cocok dengan action
                  type="file"
                  required
                  accept="image/png, image/jpeg"
                  onChange={handleFileChange}
                  disabled={isPending}
                />
              </div>

              {/* Pratinjau Gambar */}
              {preview && (
                <div className="w-full h-48 relative bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={preview}
                    alt="Pratinjau"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              )}

              {/* Menampilkan Pesan Error */}
              {state.status === "error" && (
                <div className="flex items-center p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>{state.message}</span>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <SubmitButton />
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
