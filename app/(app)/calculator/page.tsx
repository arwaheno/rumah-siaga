import type { Metadata } from "next";
import { Wizard } from "@/components/forms/wizard";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Mulai Perhitungan" };

export default function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="Mulai Perhitungan Ketahanan Air"
        description="Isi data rumah Anda langkah demi langkah. Data tersimpan otomatis di perangkat ini, jadi Anda bisa kembali kapan saja."
      />
      <Wizard />
    </>
  );
}
