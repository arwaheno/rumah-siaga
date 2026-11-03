import type { Metadata } from "next";
import { InfrastructureView } from "@/components/dashboard/infrastructure-view";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Pompa & Distribusi" };

export default function PumpPage() {
  return (
    <>
      <PageHeader title="Pompa & Distribusi" description="Penilaian ketergantungan pada pompa/listrik dan kondisi jalur distribusi air di rumah Anda." />
      <InfrastructureView />
    </>
  );
}
