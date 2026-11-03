import type { Metadata } from "next";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { ResultsDashboard } from "@/components/dashboard/results-dashboard";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Hasil & Rekomendasi" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Hasil & Rekomendasi"
        description="Ringkasan ketahanan air rumah Anda berdasarkan data yang dimasukkan."
        actions={<DashboardActions />}
      />
      <ResultsDashboard />
    </>
  );
}
