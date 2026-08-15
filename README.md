# System-RT — Aplikasi Manajemen Administrasi & Keuangan RT (Vite + React SPA)

Aplikasi web modern Single Page Application (SPA) berbasis **Vite**, **React 19 (JSX)**, **Tailwind CSS v4**, **React Router DOM**, dan **LocalStorage Data Engine**.

---

## 📌 Studi Kasus & Tarif Iuran

Perumahan Elite terdiri dari **total 20 unit rumah** (15 rumah dihuni tetap & 5 rumah kontrak / sementara / kosong):
1. **Tarif Iuran Bulanan**:
   - **Iuran Satpam**: Rp 100.000 / bulan
   - **Iuran Kebersihan**: Rp 15.000 / bulan
2. **Aturan Penagihan**:
   - Penghuni Tetap: Ditagih rutin setiap bulan.
   - Rumah Kontrak / Sementara: Ditagih *hanya* jika terdapat penghuninya (Status Rumah **Dihuni**).
   - Opsi Pembayaran: Mendukung pembayaran rutin 1 bulan maupun **1 Tahun Sekaligus**.
3. **Pengeluaran RT**:
   - Rutin: Gaji 2 satpam (Rp 1.500.000/bln), Listrik pos satpam (Rp 150.000/bln).
   - Insidental: Perbaikan jalan, perbaikan selokan, perawatan taman, dll.

---

## ✨ Fitur Utama Aplikasi (React SPA)

1. **Mengelola Penghuni (`/penghuni`)**:
   - Tambah & Ubah data penghuni (`.jsx`).
   - Atribut: Nama Lengkap, Foto KTP (dengan preview & uploader), Status (Tetap/Kontrak), Nomor Telepon, Status Pernikahan (Sudah Menikah/Belum Menikah).
2. **Mengelola Rumah & Riwayat (`/rumah`)**:
   - Tampilan Grid 20 Unit Rumah (Status: **Dihuni** / **Tidak Dihuni**).
   - Menghubungkan & mengubah penghuni rumah (otomatis menyimpan log histori `RiwayatPenghuni`).
   - Catatan historis penghuni per rumah (siapa saja yang pernah & sedang menempati beserta tanggal masuk/keluar).
   - Histori pembayaran iuran per rumah beserta status **Lunas** / **Belum Lunas**.
3. **Mengelola Pembayaran (`/pembayaran`)**:
   - Input pembayaran iuran Satpam (100k) & Kebersihan (15k).
   - Opsi pembayaran 1 Bulan atau Paket Lunas **1 Tahun Sekaligus**.
   - Matriks filter pembayaran per bulan, tahun, & jenis iuran.
4. **Mengelola Pengeluaran (`/pengeluaran`)**:
   - Catat pengeluaran kas RT rutin & insidental berdasarkan kategori, nominal, tanggal, & rincian deskripsi.
5. **Laporan Keuangan & Grafik (`/laporan` & `/`)**:
   - **Grafik Tren Keuangan 1 Tahun** (Recharts): Menampilkan Pemasukan, Pengeluaran, & Akumulasi Saldo Sisa Kas RT.
   - Laporan Rekapitulasi Keuangan & detail rincian pemasukan/pengeluaran per bulan.
   - Fitur Cetak / Ekspor PDF Laporan Keuangan.
6. **Entity Relationship Diagram (`/erd`)**:
   - Visualisasi Diagram ERD interaktif & penjelasan relasi database.

---

## 🛠️ Cara Menjalankan (Vite Dev Server)

```bash
cd c:/xampp/htdocs/system-rt
npm install
npm run dev
```

Buka browser di: `http://localhost:5173` atau port aktif yang ditampilkan.

---

## 🧪 Verifikasi Build Production

```bash
npm run build
```
