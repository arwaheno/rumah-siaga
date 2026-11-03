"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Printer } from "lucide-react";
import { useAssessment } from "@/lib/state/assessment-context";
import { EmptyState } from "@/components/ui/misc";
import { ReportDocument } from "./report-document";

export function ReportView() {
  const { ready, draft, results, recommendations } = useAssessment();
  const date = useMemo(() => new Date(), []);

  // Nama berkas PDF mengikuti judul dokumen.
  useEffect(() => {
    const previous = document.title;
    const name = draft.profile.houseName.trim();
    document.title = `Laporan Rumah Siaga${name ? ` - ${name}` : ""}`;
    return () => {
      document.title = previous;
    };
  }, [draft.profile.houseName]);

  if (!ready) {
    return <div className="mx-auto mt-10 h-64 max-w-3xl animate-pulse rounded-xl bg-white" aria-busy="true" aria-label="Memuat laporan" />;
  }

  const empty = draft.profile.occupants < 1 && draft.storage.length === 0;
  if (empty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <EmptyState
          icon={<FileText className="h-9 w-9" />}
          title="Belum ada data untuk dilaporkan"
          description="Laporan hanya berisi data yang sudah Anda isi. Selesaikan perhitungan terlebih dahulu."
          href="/calculator"
          cta="Mulai Perhitungan"
        />
      </div>
    );
  }

  return (
    <>
      <div className="no-print sticky top-0 z-20 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/dashboard" className="btn-secondary px-3 py-2 text-xs">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali ke hasil
          </Link>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm font-bold text-navy">Pratinjau Laporan (A4, 4 halaman)</p>
            <p className="text-xs text-ink-muted">Klik Cetak, lalu pilih “Simpan sebagai PDF” dan ukuran kertas A4.</p>
          </div>
          <button type="button" className="btn-primary px-4 py-2 text-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden />
            Cetak / Simpan PDF
          </button>
        </div>
      </div>
      <div className="report-stage">
        <ReportDocument draft={draft} results={results} recommendations={recommendations} date={date} />
      </div>
    </>
  );
}
