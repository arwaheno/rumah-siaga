import type { Metadata } from "next";
import { InventoryView } from "@/components/dashboard/inventory-view";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Inventaris Air" };

export default function InventoryPage() {
  return (
    <>
      <PageHeader title="Inventaris Air" description="Rincian penyimpanan air dan sumber air rumah Anda. Volume efektif dihitung setelah dikurangi bagian yang tak terpakai." />
      <InventoryView />
    </>
  );
}
