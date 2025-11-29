"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CustomerData } from "@/actions/admin-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, UserX, Eye } from "lucide-react";
import { ToggleAffiliateButton } from "./AffiliateActionButtons";
import { useDebouncedCallback } from "use-debounce"; // Optional: npm install use-debounce

export function CustomerTable({ data }: { data: CustomerData[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Search Handler (Debounced agar tidak spam request saat ketik)
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("q", term);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div>
      {/* Toolbar */}
      <div className="p-4 border-b dark:border-gray-700 flex items-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cari nama, email, atau kode..."
            className="pl-9 bg-white dark:bg-gray-800"
            onChange={(e) => handleSearch(e.target.value)}
            defaultValue={searchParams.get("q")?.toString()}
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase font-semibold dark:bg-gray-800 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3">User Info</th>
              <th className="px-6 py-3">Status Affiliate</th>
              <th className="px-6 py-3 text-right">Total Penjualan</th>
              <th className="px-6 py-3 text-right">Total Komisi</th>
              <th className="px-6 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              data.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {user.name || "Tanpa Nama"}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Gabung:{" "}
                      {new Date(user.joinedAt).toLocaleDateString("id-ID")}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {user.isAffiliate ? (
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3 mr-1" /> Aktif
                        </span>
                        <div className="mt-1 text-xs font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded inline-block">
                          {user.affiliateCode}
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <UserX className="w-3 h-3 mr-1" /> Non-Aktif
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="font-medium">
                      {user.totalSalesCount} Transaksi
                    </div>
                    <div className="text-xs text-gray-500">
                      Total Gramasi: <strong>{user.totalSalesGramasi}g</strong>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    Rp {user.totalCommission.toLocaleString("id-ID")}
                  </td>

                  <td className="px-6 py-4 text-center space-x-2">
                    {/* Tombol Toggle Status */}
                    <ToggleAffiliateButton
                      userId={user.id}
                      isAffiliate={user.isAffiliate}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
