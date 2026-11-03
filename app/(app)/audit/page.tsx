import type { Metadata } from "next";
import { AuditPageView } from "@/components/dashboard/audit-page-view";
import { PageHeader } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Audit Kesiapan" };

export default function AuditPage() {
  return (
    <>
      <PageHeader title="Audit Kesiapan" description="Daftar periksa penyimpanan, pompa, distribusi, dan air minum. Perubahan tersimpan otomatis." />
      <AuditPageView />
    </>
  );
}
