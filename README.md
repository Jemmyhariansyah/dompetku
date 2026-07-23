# DompetKu — Sistem Pencatatan Keuangan Pribadi

DompetKu adalah aplikasi web untuk mencatat pemasukan, pengeluaran, anggaran,
dan laporan keuangan pribadi. Proyek ini siap dipublikasikan secara gratis
melalui GitHub Pages.

## Fitur utama

- Dashboard saldo, pemasukan, pengeluaran, dan rasio tabungan
- Grafik arus kas enam bulan dan komposisi kategori
- Anggaran bulanan dengan indikator pemakaian
- Tambah, edit, hapus, cari, dan filter transaksi
- Ekspor CSV serta backup/pemulihan JSON
- Penyimpanan lokal di browser
- Responsif untuk komputer dan ponsel

## Privasi

GitHub hanya menyimpan kode aplikasi. Catatan transaksi tersimpan di browser
pengguna dan tidak dikirim ke repositori atau server.

## Jalankan di Windows

1. Instal Node.js 22.13 atau lebih baru.
2. Klik dua kali `start-local.bat`.
3. Tunggu instalasi pertama selesai.
4. Aplikasi terbuka di `http://localhost:5173`.

## Publikasi ke GitHub Pages

Folder `docs` sudah berisi aplikasi siap tayang:

1. Buat repositori baru di GitHub.
2. Masukkan seluruh isi folder proyek ke branch `main`.
3. Buka **Settings → Pages**.
4. Pilih **Deploy from a branch**.
5. Pilih branch **main** dan folder **/docs**.
6. Klik **Save** dan tunggu alamat aplikasi muncul.

Petunjuk lengkap tersedia pada `PANDUAN_GITHUB_PAGES.txt`.

## Pengembangan

```bash
npm install --include=optional
npm run dev
```

Setelah source code diubah, buat ulang folder `docs`:

```bash
npm run build
```
