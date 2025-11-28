"use client";

import { useState, useEffect, useCallback } from "react";
import { useActionState } from "react";
import {
  processPayoutAction,
  rejectPayoutAction,
} from "@/actions/affiliate-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, UploadCloud, CheckCircle, XCircle, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

// Tipe data sederhana (sesuaikan dengan hasil Prisma)
type PayoutRequest = {
  id: string;
  amount: number;
  status: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  createdAt: Date | string;
  proofUrl: string | null;
  affiliate: {
    name: string | null;
    affiliateCode: string | null;
  };
};

const initialState = { success: false, error: "" };
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function PayoutList({ requests }: { requests: PayoutRequest[] }) {
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequest | null>(
    null
  );
  const [isProcessModalOpen, setProcessModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const router = useRouter();

  // State untuk Form Action
  const [state, formAction, isPending] = useActionState(
    processPayoutAction,
    initialState
  );

  // Buat handleCloseModal dengan useCallback
  const handleCloseModal = useCallback(() => {
    setProcessModalOpen(false);
    setSelectedRequest(null);
    setSelectedFile(null);
    setFileError("");
  }, []);

  // Auto-close modal setelah success
  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        handleCloseModal();
        router.refresh();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.success, handleCloseModal, router]);

  // Reset file state ketika modal dibuka
  useEffect(() => {
    if (isProcessModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedFile(null);
      setFileError("");
    }
  }, [isProcessModalOpen]);

  const handleProcessClick = (req: PayoutRequest) => {
    setSelectedRequest(req);
    setProcessModalOpen(true);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      handleCloseModal();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      setFileError("");
      return;
    }

    // Validasi ukuran file
    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File terlalu besar. Maksimal 5MB, file Anda ${(file.size / 1024 / 1024).toFixed(2)}MB`
      );
      setSelectedFile(null);
      return;
    }

    // Validasi tipe file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      setFileError("Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau PDF");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setFileError("");
  };

  const handleReject = async (id: string) => {
    if (confirm("Yakin ingin menolak permintaan ini?")) {
      try {
        await rejectPayoutAction(id);
        router.refresh();
      } catch (error) {
        console.error("Error rejecting payout:", error);
        alert("Gagal menolak permintaan");
      }
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Affiliate</th>
              <th className="px-6 py-3">Info Rekening</th>
              <th className="px-6 py-3">Jumlah</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  {new Date(req.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold">{req.affiliate.name}</p>
                  <p className="text-xs text-gray-500">
                    {req.affiliate.affiliateCode}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{req.bankName}</p>
                  <p>{req.accountNumber}</p>
                  <p className="text-xs text-gray-500">a.n {req.accountName}</p>
                </td>
                <td className="px-6 py-4 font-bold text-base">
                  Rp {req.amount.toLocaleString("id-ID")}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      req.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : req.status === "PROCESSED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {req.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleProcessClick(req)}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Proses
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(req.id)}
                      >
                        Tolak
                      </Button>
                    </>
                  )}
                  {req.status === "PROCESSED" && req.proofUrl && (
                    <a href={req.proofUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" /> Bukti
                      </Button>
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="text-center py-8 text-gray-500">
            Tidak ada permintaan pencairan.
          </p>
        )}
      </div>

      {/* MODAL UPLOAD BUKTI */}
      <Dialog open={isProcessModalOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Proses Pencairan Dana</DialogTitle>
            <DialogDescription>
              Transfer{" "}
              <strong>
                Rp {selectedRequest?.amount.toLocaleString("id-ID")}
              </strong>{" "}
              ke:
              <br />
              {selectedRequest?.bankName} - {selectedRequest?.accountNumber}
              <br />
              a.n {selectedRequest?.accountName}
            </DialogDescription>
          </DialogHeader>

          {state?.success ? (
            <div className="text-center py-6 text-green-600">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <p className="font-semibold">Berhasil diproses!</p>
              <p className="text-sm text-gray-600 mt-1">
                Menutup dalam beberapa detik...
              </p>
            </div>
          ) : (
            <form action={formAction} className="space-y-4 mt-4">
              {/* Input hidden untuk ID */}
              <input
                type="hidden"
                name="id"
                value={selectedRequest?.id || ""}
              />

              <div className="space-y-2">
                <Label htmlFor="file-upload">Upload Bukti Transfer</Label>
                <label
                  htmlFor="file-upload"
                  className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-indigo-500 transition cursor-pointer bg-gray-50 block"
                >
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p className="text-sm font-medium">
                    {selectedFile ? "File dipilih ✓" : "Klik untuk upload"}
                  </p>
                  <p className="text-xs mt-1">
                    Format: JPG, PNG, GIF, PDF (Max 5MB)
                  </p>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/gif,application/pdf"
                  onChange={handleFileChange}
                  disabled={isPending}
                  className="hidden"
                  required
                />

                {/* Display nama file yang dipilih */}
                {selectedFile && (
                  <div className="text-sm text-green-600 font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {selectedFile.name}
                  </div>
                )}

                {/* Display file error */}
                {fileError && (
                  <div className="text-sm text-red-600 font-medium flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    {fileError}
                  </div>
                )}
              </div>

              {/* Display action error */}
              {state?.error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">
                  {state.error}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isPending || !selectedFile || fileError !== ""}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Memproses...
                    </>
                  ) : (
                    "Upload & Selesaikan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
