/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  History,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { RequestPayoutModal } from "./RequestPayoutModal";

// [PERBAIKAN DISINI]
// Mengubah status menjadi 'string' agar cocok dengan data dari database (Prisma)
interface Payout {
  id: string;
  createdAt: Date | string;
  bankName: string;
  accountNumber: string;
  amount: number;
  status: string; // <-- Diubah dari union type ketat menjadi string biasa
  proofUrl?: string | null;
}

interface PayoutSectionProps {
  availableBalance: number;
  payouts: Payout[];
}

export function PayoutSection({
  availableBalance,
  payouts,
}: PayoutSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Kartu Saldo & Tombol */}
      <Card className="lg:col-span-1 bg-indigo-50 border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-indigo-800 flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Saldo Komisi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-indigo-600 mb-1">Siap Dicairkan</p>
          <p className="text-3xl font-bold text-indigo-900 mb-6">
            Rp {availableBalance.toLocaleString("id-ID")}
          </p>

          <Button
            onClick={() => setIsModalOpen(true)}
            disabled={availableBalance < 10000}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Cairkan Komisi
          </Button>
          <p className="text-xs text-indigo-400 mt-2 text-center">
            Minimal penarikan Rp 50.000
          </p>
        </CardContent>
      </Card>

      {/* Tabel Riwayat Penarikan */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4" /> Riwayat Penarikan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payouts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              Belum ada riwayat penarikan.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2">Tanggal</th>
                    <th className="px-4 py-2">Bank</th>
                    <th className="px-4 py-2">Jumlah</th>
                    <th className="px-4 py-2 text-right">Status</th>
                    <th className="px-4 py-2 text-right">Bukti Transfer</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payouts.map((p) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        {new Date(p.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{p.bankName}</span>
                        <br />
                        <span className="text-xs text-gray-500">
                          {p.accountNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold">
                        Rp {p.amount.toLocaleString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.status === "PENDING" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Clock className="w-3 h-3 mr-1" /> Proses
                          </span>
                        )}
                        {p.status === "PROCESSED" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> Selesai
                          </span>
                        )}
                        {p.status === "REJECTED" && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle className="w-3 h-3 mr-1" /> Ditolak
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {p.status === "PROCESSED" && p.proofUrl ? (
                          <a
                            href={p.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs font-semibold hover:underline"
                          >
                            Lihat Bukti
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <RequestPayoutModal
          availableBalance={availableBalance}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
