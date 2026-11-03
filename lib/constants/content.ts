/** Konten metodologi/batasan/referensi — dipakai di halaman Asumsi & Referensi dan di laporan cetak. */

export const FORMULAS: { name: string; formula: string; note?: string }[] = [
  { name: "Volume terisi (per wadah)", formula: "kapasitas × persen terisi ÷ 100" },
  { name: "Volume efektif (per wadah)", formula: "maks(0, volume terisi − volume tak terpakai)", note: "Dikalikan jumlah wadah identik." },
  { name: "Kebutuhan harian", formula: "penghuni × liter/orang/hari", note: "Termasuk air minum dan memasak; tidak dijumlahkan lagi dengan kebutuhan air minum." },
  { name: "Kebutuhan air minum/masak harian", formula: "penghuni × liter air minum/orang/hari" },
  { name: "Kebutuhan selama target", formula: "kebutuhan harian × target hari" },
  { name: "Ketahanan umum (hari)", formula: "air efektif yang terkonfirmasi bisa diakses ÷ kebutuhan harian" },
  { name: "Ketahanan air minum (hari)", formula: "air minum/masak terverifikasi yang bisa diakses ÷ kebutuhan air minum harian" },
  { name: "Kekurangan", formula: "maks(0, kebutuhan selama target − air yang bisa diakses)" },
];

export const EDGE_RULES: string[] = [
  "Jumlah penghuni 0 atau kebutuhan harian 0: ketahanan tidak dapat dihitung (ditampilkan “—”), status “Data Belum Lengkap”.",
  "Tidak ada air tersimpan: ketahanan 0 hari dan kekurangan sama dengan seluruh kebutuhan target.",
  "Volume tak terpakai lebih besar dari volume terisi: volume efektif 0 (tidak pernah negatif).",
  "Wadah kosong atau terisi sebagian: dihitung sesuai persen terisi.",
  "Air yang tidak terkonfirmasi bisa diambil saat listrik padam (jawaban “Tidak” atau “Belum diketahui”) tidak dihitung sebagai air yang bisa diakses; tetap ditampilkan sebagai stok.",
  "Air serba guna tidak pernah dihitung sebagai air minum. Air minum hanya dari wadah berperuntukan minum/memasak yang kualitasnya Anda tandai terverifikasi.",
  "Kualitas “Belum diverifikasi” diperlakukan sebagai belum terverifikasi — bukan berarti tidak aman, tetapi belum dapat dihitung sebagai air minum.",
  "Sumber air (PDAM, sumur, air hujan) tidak menambah liter. Hanya wadah di Langkah 3 yang menambah stok, sehingga tidak terhitung dua kali.",
];

export const STATUS_METHOD: string[] = [
  "Aplikasi tidak memakai satu skor angka. Kesiapan dinilai dari tiga dimensi terpisah: kecukupan volume, keandalan akses, dan verifikasi air minum.",
  "Kecukupan volume: air yang bisa diakses ÷ kebutuhan selama target. ≥ 100% = baik, 50–99% = perlu perhatian, < 50% = kurang.",
  "Keandalan akses: tingkat risiko terburuk dari pompa/listrik, distribusi, dan sumber air. Risiko tinggi = kurang, sedang = perlu perhatian.",
  "Verifikasi air minum: ketahanan air minum terverifikasi ÷ target, dengan aturan yang sama (≥ 100%, 50–99%, < 50%); kebersihan wadah yang buruk menaikkan risiko satu tingkat.",
  "Status akhir: ada dimensi “kurang” → Belum Siap; ada data yang belum lengkap/diketahui → Data Belum Lengkap; ada dimensi “perlu perhatian” → Perlu Perhatian; selainnya → Siap.",
  "Volume yang cukup tidak otomatis membuat status “Siap”. Status bukan jaminan keselamatan atau kelayakan air.",
];

export const SCENARIO_NOTE =
  "Skenario kebutuhan air (Darurat 15, Transisi 20, Perkotaan 50 liter/orang/hari) adalah parameter simulasi yang dapat diubah, bukan standar keselamatan universal. Kebutuhan sebenarnya bergantung pada iklim, aktivitas, komposisi rumah tangga (anak, lansia, kondisi kesehatan), kebersihan, dan panduan kesehatan masyarakat yang berlaku.";

export const LIMITATIONS: string[] = [
  "Hasil adalah estimasi berdasarkan data dan asumsi yang Anda masukkan; kualitas hasil mengikuti kualitas data.",
  "Aplikasi tidak menguji atau menyatakan keamanan air. Status “terverifikasi” sepenuhnya berasal dari pernyataan pengguna.",
  "Aplikasi tidak memberi petunjuk modifikasi instalasi listrik, pompa, atau perpipaan. Pekerjaan teknis dilakukan oleh tenaga berkompeten.",
  "Aplikasi tidak menjamin ketersediaan air, keselamatan, atau kesehatan siapa pun, dan bukan pengganti saran otoritas kesehatan atau penyedia air setempat.",
  "Perkiraan anggaran berasal dari masukan pengguna; aplikasi tidak menyediakan harga pasar.",
];

export const REFERENCES_ACCESSED = "3 November 2026";

export const REFERENCES: { title: string; org: string; url: string; note: string }[] = [
  {
    title: "Domestic water quantity, service level and health",
    org: "World Health Organization (WHO)",
    url: "https://www.who.int/publications/i/item/9789240015241",
    note: "Bacaan latar tentang hubungan jumlah air rumah tangga dengan kesehatan.",
  },
  {
    title: "Sphere Handbook — Water Supply, Sanitation and Hygiene Promotion",
    org: "Sphere Association",
    url: "https://spherestandards.org",
    note: "Standar kemanusiaan untuk pasokan air dalam situasi darurat; bukan standar untuk rumah tangga umum.",
  },
  {
    title: "Peraturan Menteri Kesehatan No. 2 Tahun 2023 tentang Kesehatan Lingkungan",
    org: "Kementerian Kesehatan RI",
    url: "https://peraturan.bpk.go.id/details/245563/permenkes-no-2-tahun-2023",
    note: "Rujukan persyaratan kualitas air untuk keperluan higiene sanitasi dan air minum di Indonesia.",
  },
];

export const REFERENCES_NOTE =
  "Referensi disediakan sebagai bacaan lanjutan. Angka skenario di aplikasi ini bukan kutipan dari dokumen-dokumen tersebut; periksa versi terbaru dokumen sebelum dijadikan dasar keputusan.";
