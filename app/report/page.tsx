import type { Metadata } from "next";
import { ReportView } from "@/components/report/report-view";

export const metadata: Metadata = {
  title: "Laporan",
  description: "Pratinjau dan cetak laporan ketahanan air rumah tangga (A4) atau simpan sebagai PDF.",
  robots: { index: false },
};

export default function ReportPage() {
  return <ReportView />;
}
