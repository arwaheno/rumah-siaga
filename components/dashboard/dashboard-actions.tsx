"use client";

import Link from "next/link";
import { FileText, Pencil } from "lucide-react";

export function DashboardActions() {
  return (
    <>
      <Link href="/calculator?step=1" className="btn-secondary">
        <Pencil className="h-4 w-4" aria-hidden />
        Ubah Data
      </Link>
      <Link href="/report" className="btn-primary">
        <FileText className="h-4 w-4" aria-hidden />
        Cetak Laporan
      </Link>
    </>
  );
}
