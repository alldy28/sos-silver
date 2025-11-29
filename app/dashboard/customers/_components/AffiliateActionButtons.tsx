"use client";

import { useState } from "react";
import { toggleAffiliateStatusAction } from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, UserX, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function ToggleAffiliateButton({
  userId,
  isAffiliate,
}: {
  userId: string;
  isAffiliate: boolean;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (
      !confirm(
        `Apakah Anda yakin ingin ${isAffiliate ? "menonaktifkan" : "mengaktifkan"} status affiliate user ini?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    const res = await toggleAffiliateStatusAction(userId, !isAffiliate);

    if (res.success) {
      router.refresh(); // Refresh halaman untuk update UI
    } else {
      alert(res.error || "Gagal mengubah status");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2 justify-center">
      {/* Tombol Toggle Status */}
      {isAffiliate ? (
        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={handleToggle}
          disabled={isLoading}
          title="Nonaktifkan Affiliate"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
        </Button>
      ) : (
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={handleToggle}
          disabled={isLoading}
          title="Aktifkan Affiliate"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserCheck className="w-4 h-4" />
          )}
        </Button>
      )}

      {/* [BARU] Tombol Detail */}
      <Link href={`/dashboard/customers/${userId}`}>
        <Button
          size="sm"
          variant="ghost"
          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
          title="Lihat Detail"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
