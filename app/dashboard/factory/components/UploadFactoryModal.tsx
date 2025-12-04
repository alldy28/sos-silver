"use client";

import { useEffect, useState, useRef } from "react";
import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud, FileImage, X } from "lucide-react";
import { uploadFactoryProofAction } from "@/actions/factory-actions";
import { toast } from "sonner";
import Image from "next/image";

interface UploadFactoryModalProps {
  paymentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const initialState = {
  status: "",
  message: "",
  errors: {},
};

export function UploadFactoryModal({
  paymentId,
  isOpen,
  onClose,
}: UploadFactoryModalProps) {
  const [state, dispatch, isPending] = useActionState(
    uploadFactoryProofAction,
    initialState
  );

  // State untuk preview
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // [1] Ref untuk mereset input file secara manual
  const fileInputRef = useRef<HTMLInputElement>(null);


   const handleReset = () => {
     setFile(null);
     if (previewUrl) URL.revokeObjectURL(previewUrl);
     setPreviewUrl(null);
     // Reset value input asli agar bisa pilih file yang sama jika mau
     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
   };


  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleReset();
      onClose();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleReset();
        onClose();
      }}
    >
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>Upload Bukti Pembayaran Pabrik</DialogTitle>
        </DialogHeader>

        <form action={dispatch} className="space-y-4 mt-2">
          <input type="hidden" name="id" value={paymentId} />

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="proof">File Gambar (Max 5MB)</Label>

            {/* [PERBAIKAN PENTING] 
               Input file dan Tampilan Preview dipisah.
               Input file TETAP ADA di DOM (hanya disembunyikan pakai class 'hidden' jika file sudah ada),
               supaya FormData tetap bisa menangkap filenya.
            */}

            {/* 1. TAMPILAN UPLOAD BOX (Muncul jika file belum dipilih) */}
            <div
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative group ${file ? "hidden" : "block"}`}
            >
              <div className="p-3 bg-indigo-50 rounded-full mb-3 group-hover:bg-indigo-100 transition">
                <UploadCloud className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Klik untuk upload bukti
              </span>
              <span className="text-xs text-gray-400 mt-1">
                JPG, PNG (Max 5MB)
              </span>

              {/* Input Asli */}
              <Input
                ref={fileInputRef}
                id="proof"
                name="file"
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isPending}
                onChange={handleFileChange}
                // Hapus required agar validasi server yang handle, atau biarkan required tapi pastikan input tetap ada
              />
            </div>

            {/* 2. TAMPILAN PREVIEW (Muncul jika file sudah dipilih) */}
            {file && (
              <div className="relative border rounded-lg p-3 flex items-center gap-3 bg-gray-50">
                {previewUrl ? (
                  <div className="relative h-16 w-16 rounded overflow-hidden border bg-white flex-shrink-0">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <FileImage className="h-10 w-10 text-indigo-600" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-red-500"
                  onClick={handleReset}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {state.errors?.file && (
              <p className="text-xs text-red-500">{state.errors.file[0]}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !file}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Mengupload..." : "Upload & Lunas"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
