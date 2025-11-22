import { Metadata } from "next";
import ReportClientPage from "./ReportClientPage";

export const metadata: Metadata = {
  title: "Laporan Penjualan | Sossilver Admin",
};

export default function LaporanPage() {
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <ReportClientPage />
    </div>
  );
}
