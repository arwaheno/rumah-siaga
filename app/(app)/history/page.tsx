import type { Metadata } from "next";
import { HistoryView } from "@/components/dashboard/history-view";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Riwayat Perhitungan" };

export default function HistoryPage() {
  return (
    <>
      <PageHeader title="Riwayat Perhitungan" description="Buka kembali, duplikasi, ekspor, atau hapus perhitungan yang tersimpan di perangkat ini." />
      <HistoryView />
    </>
  );
}
