import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ClipboardCheck,
  Container,
  Droplet,
  FileText,
  Settings2,
  Waves,
  Workflow,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { PRIVACY_NOTICE } from "@/lib/constants";

const CAPABILITIES = [
  { icon: Waves, title: "Inventaris multi-sumber air", text: "Catat PDAM, sumur, air hujan, dan air kemasan — dibedakan antara pasokan, alternatif, dan stok." },
  { icon: Container, title: "Kalkulator kapasitas penyimpanan", text: "Hitung volume efektif toren, galon, dan jeriken tanpa menghitung dua kali." },
  { icon: Settings2, title: "Penilaian pompa & listrik", text: "Ketahui seberapa bergantung air Anda pada listrik dan apa cadangannya." },
  { icon: Workflow, title: "Penilaian distribusi air", text: "Periksa pipa, keran, kebocoran, dan akses air tanpa listrik." },
  { icon: Droplet, title: "Ketersediaan air minum", text: "Air minum dihitung terpisah dan hanya yang terverifikasi yang dianggap layak minum." },
  { icon: FileText, title: "Laporan kesiapan rumah tangga", text: "Laporan A4 siap cetak atau simpan sebagai PDF, berisi temuan dan prioritas tindakan." },
];

const HOW = [
  { n: "1", title: "Kenali", text: "Catat profil rumah, sumber air, wadah, pompa, dan jalur distribusi Anda." },
  { n: "2", title: "Hitung", text: "Aplikasi menghitung kebutuhan, volume efektif, dan lama ketahanan dengan rumus yang transparan." },
  { n: "3", title: "Siapkan", text: "Terima rekomendasi prioritas sesuai kondisi rumah — tanpa saran belanja yang tidak perlu." },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Link href="/" aria-label="Rumah Siaga — Beranda">
            <Logo />
          </Link>
          <nav aria-label="Navigasi utama" className="flex items-center gap-1 text-sm font-semibold text-navy sm:gap-3">
            <Link href="/guide" className="hidden rounded-lg px-3 py-2 hover:bg-surface sm:block">Panduan</Link>
            <Link href="/assumptions" className="hidden rounded-lg px-3 py-2 hover:bg-surface sm:block">Asumsi</Link>
            <Link href="/history" className="hidden rounded-lg px-3 py-2 hover:bg-surface sm:block">Riwayat</Link>
            <Link href="/calculator" className="btn-primary px-4 py-2">Mulai Perhitungan</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-white to-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-teal-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal-dark">
                Kalkulator Ketahanan Air Rumah
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl lg:text-[2.75rem]">
                Ketahui Seberapa Siap Rumah Anda Menghadapi Gangguan Air.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
                Hitung kebutuhan air keluarga, evaluasi kapasitas cadangan, dan temukan apa yang perlu diperbaiki sebelum terjadi gangguan pasokan.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/calculator" className="btn-primary px-6 py-3 text-base">
                  Mulai Perhitungan
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <a href="#cara-kerja" className="btn-secondary px-6 py-3 text-base">
                  Pelajari Cara Kerja
                </a>
              </div>
              <p className="mt-4 text-xs text-ink-muted">Gratis, tanpa akun. Bahasa Indonesia. {PRIVACY_NOTICE}</p>
            </div>

            {/* Ilustrasi dekoratif (tanpa angka) */}
            <div className="relative mx-auto w-full max-w-md" aria-hidden>
              <div className="rounded-3xl bg-gradient-to-br from-teal-soft to-white p-6 shadow-card ring-1 ring-line">
                <svg viewBox="0 0 320 240" className="h-auto w-full">
                  <rect x="0" y="196" width="320" height="44" rx="10" fill="#DDEBEA" />
                  <rect x="78" y="46" width="76" height="52" rx="8" fill="#17324D" />
                  <rect x="72" y="40" width="88" height="12" rx="6" fill="#102A43" />
                  <rect x="86" y="62" width="60" height="30" rx="4" fill="#168C8C" opacity=".9" />
                  <path d="M116 98v28" stroke="#17324D" strokeWidth="5" strokeLinecap="round" />
                  <path d="M46 196V126l92-58 92 58v70H46Z" fill="#fff" stroke="#17324D" strokeWidth="5" strokeLinejoin="round" />
                  <rect x="120" y="150" width="36" height="46" rx="4" fill="#17324D" />
                  <rect x="170" y="146" width="40" height="30" rx="4" fill="#E3F3F2" stroke="#17324D" strokeWidth="3" />
                  <path d="M250 130c-12 14-19 22-19 32a19 19 0 0 0 38 0c0-10-7-18-19-32Z" fill="#168C8C" />
                  <path d="M250 146c-6 7-9 11-9 16 0 5 4 9 9 9v-25Z" fill="#fff" opacity=".5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Kemampuan */}
        <section className="mx-auto max-w-6xl px-4 py-14 lg:px-8" aria-labelledby="kemampuan">
          <h2 id="kemampuan" className="text-2xl font-bold text-navy">Yang bisa Anda lakukan</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-muted">Satu alat untuk mengukur, memahami, dan memperbaiki ketahanan air rumah tangga.</p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-soft text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-3 text-base font-bold text-navy">{title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Cara kerja */}
        <section id="cara-kerja" className="border-y border-line bg-white" aria-labelledby="cara-kerja-title">
          <div className="mx-auto max-w-6xl px-4 py-14 lg:px-8">
            <h2 id="cara-kerja-title" className="text-2xl font-bold text-navy">Cara kerja: Kenali. Hitung. Siapkan.</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {HOW.map((h) => (
                <li key={h.n} className="rounded-xl2 border border-line bg-surface/60 p-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{h.n}</span>
                  <h3 className="mt-3 text-lg font-bold text-navy">{h.title}</h3>
                  <p className="mt-1 text-sm text-ink-muted">{h.text}</p>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl2 border border-teal/20 bg-teal-soft p-5 text-sm text-navy">
                <h3 className="flex items-center gap-2 font-bold"><Calculator className="h-4 w-4" aria-hidden /> Transparan</h3>
                <p className="mt-1">Rumus dan asumsi ditampilkan di halaman Asumsi & Referensi. Anda bisa mengubah angka kebutuhan air sesuai kondisi keluarga.</p>
              </div>
              <div className="rounded-xl2 border border-warn/40 bg-warn-soft p-5 text-sm text-warn-text">
                <h3 className="flex items-center gap-2 font-bold"><ClipboardCheck className="h-4 w-4" aria-hidden /> Batasan penting</h3>
                <p className="mt-1">Hasil adalah estimasi dari data yang Anda masukkan. Aplikasi ini tidak menyatakan air aman diminum dan bukan jaminan keselamatan.</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/calculator" className="btn-primary px-6 py-3">
                Mulai Perhitungan
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-ink-muted lg:px-8">
        <p className="font-semibold text-navy">Rumah Siaga — Kenali. Hitung. Siapkan.</p>
        <p className="mt-1">{PRIVACY_NOTICE}</p>
      </footer>
    </div>
  );
}
