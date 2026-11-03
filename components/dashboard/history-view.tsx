"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, FileText, FolderOpen, History as HistoryIcon, Save, ShieldCheck, Trash2, Upload } from "lucide-react";
import type { Assessment } from "@/types/assessment";
import { useAssessment } from "@/lib/state/assessment-context";
import { exportAssessmentJson, localRepository, parseImportedJson } from "@/lib/storage";
import { computeResults, STATUS_LABEL } from "@/lib/calculations";
import { formatDateTime, formatDays, formatLiters } from "@/lib/formatting";
import { HOUSING_LABEL, PRIVACY_NOTICE } from "@/lib/constants";
import { StatusPill } from "@/components/ui/badges";
import { ConfirmButton, EmptyState, SectionCard } from "@/components/ui/misc";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Jangan dicabut sinkron: beberapa browser masih membaca Blob saat unduhan dimulai.
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function HistoryView() {
  const router = useRouter();
  const { ready, draft, open, saveToHistory, clearAll, historyVersion, bumpHistory } = useAssessment();
  const [items, setItems] = useState<Assessment[]>([]);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ready) setItems(localRepository.list());
  }, [ready, historyVersion]);

  const flash = (tone: "ok" | "err", text: string) => {
    setMsg({ tone, text });
    window.setTimeout(() => setMsg(null), 4000);
  };

  const hasDraftContent = draft.profile.houseName.trim() !== "" || draft.storage.length > 0;

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 2_000_000) return flash("err", "Berkas terlalu besar (maksimal 2 MB).");
    const parsed = parseImportedJson(await file.text());
    if (!parsed) return flash("err", "Berkas tidak valid. Gunakan berkas JSON hasil ekspor Rumah Siaga.");
    localRepository.save(parsed);
    bumpHistory();
    flash("ok", `“${parsed.profile.houseName || "Tanpa nama"}” berhasil diimpor.`);
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!ready) return <div className="card h-48 animate-pulse bg-white" aria-busy="true" />;

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-lg border border-teal/20 bg-teal-soft p-3 text-sm text-navy">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        {PRIVACY_NOTICE}
      </p>

      {msg && (
        <p role="status" className={msg.tone === "ok" ? "rounded-lg bg-brand-greensoft px-3 py-2 text-sm font-semibold text-brand-green" : "rounded-lg bg-danger-soft px-3 py-2 text-sm font-semibold text-danger"}>
          {msg.text}
        </p>
      )}

      <SectionCard
        title="Perhitungan yang sedang dikerjakan"
        action={
          hasDraftContent ? (
            <button
              type="button"
              className="btn-secondary px-3 py-1.5 text-xs"
              onClick={() => {
                saveToHistory(draft.completed);
                flash("ok", "Perhitungan disimpan ke riwayat.");
              }}
            >
              <Save className="h-3.5 w-3.5" aria-hidden />
              Simpan ke riwayat
            </button>
          ) : undefined
        }
      >
        {hasDraftContent ? (
          <p className="text-sm text-ink-muted">
            <b className="text-navy">{draft.profile.houseName || "Tanpa nama"}</b> — tersimpan otomatis di perangkat ini. Terakhir diubah {formatDateTime(draft.updatedAt)}.
          </p>
        ) : (
          <p className="text-sm text-ink-muted">Belum ada perhitungan yang sedang dikerjakan.</p>
        )}
      </SectionCard>

      <SectionCard
        title="Riwayat perhitungan"
        icon={<HistoryIcon className="h-5 w-5 text-teal" aria-hidden />}
        action={
          <>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" id="import-json" onChange={(e) => onImport(e.target.files?.[0])} />
            <label htmlFor="import-json" className="btn-secondary cursor-pointer px-3 py-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" aria-hidden />
              Impor JSON
            </label>
          </>
        }
      >
        {items.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon className="h-8 w-8" />}
            title="Belum ada perhitungan tersimpan"
            description="Perhitungan yang Anda selesaikan atau simpan akan muncul di sini, dan bisa dibuka kembali, diduplikasi, atau diekspor."
            href="/calculator"
            cta="Mulai Perhitungan"
          />
        ) : (
          <ul className="divide-y divide-line">
            {items.map((a) => {
              const r = computeResults(a);
              return (
                <li key={a.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-navy">{a.profile.houseName || "Tanpa nama"}</p>
                      <StatusPill status={r.status} />
                      {!a.completed && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-ink-muted">Belum selesai</span>}
                    </div>
                    <p className="mt-1 text-xs text-ink-muted">
                      {HOUSING_LABEL[a.profile.housingType]} · {a.profile.occupants} penghuni · Stok {formatLiters(r.effectiveTotal)} · Ketahanan {formatDays(r.totalEndurance)} · Target {a.profile.targetDays} hari
                    </p>
                    <p className="text-xs text-ink-muted">Diperbarui {formatDateTime(a.updatedAt)} · Status: {STATUS_LABEL[r.status]}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button type="button" className="btn-secondary px-3 py-1.5 text-xs" onClick={() => { open(a); router.push("/dashboard"); }}>
                      <FolderOpen className="h-3.5 w-3.5" aria-hidden />
                      Buka
                    </button>
                    <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => { open(a); router.push("/report"); }}>
                      <FileText className="h-3.5 w-3.5" aria-hidden />
                      Laporan
                    </button>
                    <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => { localRepository.duplicate(a.id); bumpHistory(); flash("ok", "Perhitungan diduplikasi."); }}>
                      <Copy className="h-3.5 w-3.5" aria-hidden />
                      Duplikat
                    </button>
                    <button type="button" className="btn-ghost px-3 py-1.5 text-xs" onClick={() => download(`rumah-siaga-${(a.profile.houseName || "perhitungan").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`, exportAssessmentJson(a))}>
                      <Download className="h-3.5 w-3.5" aria-hidden />
                      Ekspor JSON
                    </button>
                    <ConfirmButton label="Hapus" icon={<Trash2 className="h-3.5 w-3.5" />} ariaLabel={`Hapus perhitungan ${a.profile.houseName}`} onConfirm={() => { localRepository.remove(a.id); bumpHistory(); flash("ok", "Perhitungan dihapus."); }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Data lokal">
        <p className="mb-3 text-sm text-ink-muted">
          Menghapus akan membersihkan draft dan seluruh riwayat dari browser ini. Tindakan ini tidak dapat dibatalkan — ekspor JSON terlebih dahulu bila perlu.
        </p>
        <ConfirmButton label="Hapus semua data lokal" confirmLabel="Ya, hapus semuanya" icon={<Trash2 className="h-3.5 w-3.5" />} onConfirm={() => { clearAll(); flash("ok", "Semua data lokal telah dihapus."); }} className="border border-danger/30" />
      </SectionCard>
    </div>
  );
}
