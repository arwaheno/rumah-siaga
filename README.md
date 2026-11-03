# Rumah Siaga — Kenali. Hitung. Siapkan.

Kalkulator ketahanan air rumah tangga untuk keluarga Indonesia. Pengguna mengisi profil rumah, sumber air, penyimpanan, pompa/listrik, distribusi, dan air minum; aplikasi menghitung stok efektif, ketahanan (hari), risiko, rekomendasi prioritas, dan laporan A4 siap cetak/PDF.

- Next.js (App Router) · TypeScript · Tailwind CSS · Recharts · Zod · React Hook Form · Lucide
- Tanpa backend, tanpa database, tanpa variabel lingkungan. Data disimpan di LocalStorage browser.
- Bahasa Indonesia, Rupiah, satuan metrik.

## Menjalankan lokal

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 41 unit test (calculation engine, risiko, format, storage)
npm run typecheck
npm run build && npm start
```

Butuh Node.js 20+.

## Deploy ke GitHub + Vercel

```bash
git init && git add . && git commit -m "Rumah Siaga MVP"
git branch -M main
git remote add origin https://github.com/<akun>/rumah-siaga.git
git push -u origin main
```

Lalu di vercel.com: **Add New → Project → Import** repo tersebut. Framework terdeteksi otomatis (Next.js); tidak ada environment variable dan tidak ada pengaturan build khusus. Klik **Deploy**.

## Struktur

```
app/            halaman (beranda, calculator, dashboard, inventory, pump, audit, history, guide, assumptions, report)
components/     layout, forms (wizard), dashboard, charts, report (khusus cetak), ui
lib/calculations/   fungsi murni: volume, kebutuhan, ketahanan, risiko, audit, status, rekomendasi
lib/validations/    skema Zod
lib/storage/        antarmuka AssessmentRepository + implementasi LocalStorage
lib/formatting/     format angka/Rupiah/tanggal id-ID
lib/constants/      default, label, konten metodologi & referensi
tests/              Vitest (Skenario A–D, edge case, risiko, storage)
```

`lib/storage` mengekspos antarmuka `AssessmentRepository`; migrasi ke Supabase cukup dengan menambah implementasi lain tanpa mengubah UI.

## Rumus inti

```
volume terisi   = kapasitas × persen terisi / 100
volume efektif  = maks(0, volume terisi − volume tak terpakai)  (× jumlah wadah)
kebutuhan harian = penghuni × liter/orang/hari
ketahanan        = air efektif yang terkonfirmasi bisa diakses ÷ kebutuhan harian
ketahanan minum  = air minum/masak terverifikasi yang bisa diakses ÷ kebutuhan minum harian
kekurangan       = maks(0, kebutuhan harian × target hari − air yang bisa diakses)
```

Aturan penting: air serba guna tidak pernah dihitung sebagai air minum; kualitas "belum diverifikasi" tidak dihitung sebagai air minum; air yang akses saat listrik padamnya tidak terkonfirmasi tidak dihitung sebagai bisa diakses; sumber air (PDAM, sumur) tidak menambah liter. Status kesiapan memakai tiga dimensi terpisah (volume, akses, verifikasi air minum), bukan satu skor angka. Detail lengkap ada di halaman **Asumsi & Referensi** dan di halaman 4 laporan.

## Laporan cetak / PDF

`/report` adalah presentasi terpisah dari form: 4 halaman A4 (ringkasan, inventaris, audit infrastruktur, rekomendasi & metodologi). Klik **Cetak / Simpan PDF** lalu pilih "Simpan sebagai PDF". Sidebar, navigasi, dan tombol tidak ikut tercetak.

## Asumsi & batasan

- Skenario 15/20/50 liter/orang/hari adalah parameter simulasi yang dapat diubah, bukan standar keselamatan.
- Status "terverifikasi" untuk air minum adalah pernyataan pengguna; aplikasi tidak menguji atau menjamin keamanan air.
- Aplikasi tidak memberi instruksi modifikasi listrik/pompa/perpipaan.
- Perkiraan biaya hanya dari masukan pengguna; tidak ada harga pasar.
- Referensi (WHO, Sphere, Permenkes 2/2023) adalah bacaan lanjutan; periksa versi terbaru.
