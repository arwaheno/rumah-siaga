import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, SectionCard } from "@/components/ui/misc";
import { WIZARD_STEPS } from "@/lib/constants";

export const metadata: Metadata = { title: "Panduan" };

const STEP_HELP: Record<number, string> = {
  1: "Isi nama rumah, jumlah penghuni, dan target berapa hari cadangan air harus mencukupi. Pilih skenario kebutuhan air atau isi angka sendiri.",
  2: "Catat sumber air Anda. Sumber tidak menambah liter; hanya membantu menilai risiko pasokan.",
  3: "Masukkan semua wadah: kapasitas, persen terisi, volume tak terpakai, peruntukan, kualitas, dan apakah airnya bisa diambil saat listrik padam.",
  4: "Nilai ketergantungan air pada pompa/listrik beserta jalur cadangannya.",
  5: "Nilai kondisi pipa, kebocoran, jumlah keran, dan kemampuan menyalurkan air tanpa listrik.",
  6: "Lengkapi kebersihan dan kondisi wadah air minum. Stok air minum otomatis dibaca dari Langkah 3.",
  7: "Jawab daftar periksa dan (opsional) masukkan perkiraan biaya perbaikan.",
  8: "Lihat status kesiapan, grafik, risiko, dan rekomendasi. Cetak laporan atau simpan sebagai PDF.",
};

const FAQ = [
  { q: "Apa bedanya air tersimpan, pasokan, dan sumber alternatif?", a: "Air tersimpan adalah air di wadah (dihitung sebagai stok). Pasokan berkelanjutan, seperti PDAM, bisa terhenti kapan saja. Sumber alternatif adalah peluang yang belum menjadi stok. Hanya air tersimpan yang menambah liter." },
  { q: "Mengapa air di toren tidak otomatis dihitung bisa diakses?", a: "Jika toren hanya mengalir lewat pompa listrik, air itu tidak dapat diambil saat listrik padam. Anda menentukan jawabannya per wadah." },
  { q: "Mengapa air minum saya dihitung 0 padahal ada air jernih?", a: "Air jernih belum tentu aman diminum. Aplikasi hanya menghitung air berperuntukan minum/memasak yang Anda tandai terverifikasi." },
  { q: "Bagaimana cara menyimpan laporan sebagai PDF?", a: "Buka Cetak Laporan, tekan tombol cetak, lalu pilih “Simpan sebagai PDF” sebagai printer di jendela cetak browser. Pilih ukuran A4 dan aktifkan opsi grafik latar bila ada." },
  { q: "Di mana data saya disimpan?", a: "Hanya di perangkat/browser Anda (LocalStorage) pada versi MVP ini. Tidak ada akun atau penyimpanan cloud. Membersihkan data browser akan menghapusnya, jadi ekspor JSON untuk cadangan." },
];

export default function GuidePage() {
  return (
    <>
      <PageHeader title="Panduan" description="Cara memakai Rumah Siaga, langkah demi langkah." />
      <div className="space-y-5">
        <SectionCard title="Langkah-langkah">
          <ol className="space-y-3">
            {WIZARD_STEPS.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{s.n}</span>
                <div>
                  <p className="text-sm font-bold text-navy">{s.title}</p>
                  <p className="text-sm text-ink-muted">{STEP_HELP[s.n]}</p>
                </div>
              </li>
            ))}
          </ol>
          <Link href="/calculator" className="btn-primary mt-5">Mulai Perhitungan</Link>
        </SectionCard>

        <SectionCard title="Pertanyaan umum">
          <dl className="divide-y divide-line">
            {FAQ.map((f) => (
              <div key={f.q} className="py-3">
                <dt className="text-sm font-bold text-navy">{f.q}</dt>
                <dd className="mt-1 text-sm text-ink-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <SectionCard title="Istilah">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-bold text-navy">Volume efektif</dt><dd className="text-ink-muted">Volume air yang benar-benar bisa dipakai, setelah dikurangi bagian yang tak terambil.</dd></div>
            <div><dt className="font-bold text-navy">Ketahanan</dt><dd className="text-ink-muted">Berapa hari air yang bisa diakses mencukupi kebutuhan harian.</dd></div>
            <div><dt className="font-bold text-navy">Terverifikasi</dt><dd className="text-ink-muted">Air yang Anda pastikan layak minum dengan cara yang dapat dipercaya, misalnya air kemasan bersegel.</dd></div>
            <div><dt className="font-bold text-navy">Gravitasi</dt><dd className="text-ink-muted">Air mengalir turun dari toren tinggi ke keran tanpa pompa.</dd></div>
          </dl>
        </SectionCard>
      </div>
    </>
  );
}
