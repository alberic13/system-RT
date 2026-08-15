import React from 'react';
import { Database, Table, Key, Link as LinkIcon } from 'lucide-react';

export default function Erd() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Entity Relationship Diagram (ERD) & Skema Database
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumentasi Lengkap Struktur Relasi Data Aplikasi Sistem Administrasi Perumahan RT (System-RT).
            </p>
          </div>
        </div>
      </div>

      {/* Visual ERD Architecture Container */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-sky-600" /> Visual Diagram Relasi Antar Entitas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Entitas Penghuni */}
          <div className="bg-slate-50 rounded-2xl border border-sky-200 p-5 space-y-4 shadow-sm hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-sky-700 flex items-center gap-2">
                <Table className="w-4 h-4 text-sky-600" /> Penghuni
              </span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono font-semibold">
                Entitas Utama
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-amber-600" /> id</span>
                <span className="text-[10px] text-slate-500">Int (PK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>nama_lengkap</span>
                <span className="text-[10px] text-slate-500">String</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>foto_ktp</span>
                <span className="text-[10px] text-slate-500">String (Nullable)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>status_penghuni</span>
                <span className="text-[10px] text-sky-700 font-bold">Tetap | Kontrak</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>nomor_telepon</span>
                <span className="text-[10px] text-slate-500">String</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>status_pernikahan</span>
                <span className="text-[10px] text-rose-700 font-bold">Menikah | Belum</span>
              </div>
            </div>
          </div>

          {/* Entitas Rumah */}
          <div className="bg-slate-50 rounded-2xl border border-indigo-200 p-5 space-y-4 shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-indigo-700 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" /> Rumah
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono font-semibold">
                20 Unit Perumahan
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-amber-600" /> id</span>
                <span className="text-[10px] text-slate-500">Int (PK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>nomor_rumah</span>
                <span className="text-[10px] text-slate-500">String (Unique)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>status_huni</span>
                <span className="text-[10px] text-emerald-700 font-bold">Dihuni | Kosong</span>
              </div>
              <div className="flex items-center justify-between text-sky-800 bg-sky-50 p-2 rounded border border-sky-200">
                <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5 text-sky-600" /> penghuni_id</span>
                <span className="text-[10px] text-slate-500">Int (FK Nullable)</span>
              </div>
            </div>
          </div>

          {/* Entitas RiwayatPenghuni */}
          <div className="bg-slate-50 rounded-2xl border border-purple-200 p-5 space-y-4 shadow-sm hover:border-purple-300 transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-purple-700 flex items-center gap-2">
                <Table className="w-4 h-4 text-purple-600" /> RiwayatPenghuni
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-semibold">
                Log Histori Hunian
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-amber-600" /> id</span>
                <span className="text-[10px] text-slate-500">Int (PK)</span>
              </div>
              <div className="flex items-center justify-between text-indigo-800 bg-indigo-50 p-2 rounded border border-indigo-200">
                <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5 text-indigo-600" /> rumah_id</span>
                <span className="text-[10px] text-slate-500">Int (FK)</span>
              </div>
              <div className="flex items-center justify-between text-sky-800 bg-sky-50 p-2 rounded border border-sky-200">
                <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5 text-sky-600" /> penghuni_id</span>
                <span className="text-[10px] text-slate-500">Int (FK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>tanggal_masuk</span>
                <span className="text-[10px] text-slate-500">Date</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>tanggal_keluar</span>
                <span className="text-[10px] text-slate-500">Date (Nullable)</span>
              </div>
            </div>
          </div>

          {/* Entitas Pembayaran */}
          <div className="bg-slate-50 rounded-2xl border border-emerald-200 p-5 space-y-4 shadow-sm hover:border-emerald-300 transition-all md:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-emerald-700 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" /> Pembayaran
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-semibold">
                Log Pembayaran Iuran Satpam (100k) & Kebersihan (15k)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-amber-600" /> id</span>
                <span className="text-[10px] text-slate-500">Int (PK)</span>
              </div>
              <div className="flex items-center justify-between text-indigo-800 bg-indigo-50 p-2 rounded border border-indigo-200">
                <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5 text-indigo-600" /> rumah_id</span>
                <span className="text-[10px] text-slate-500">Int (FK)</span>
              </div>
              <div className="flex items-center justify-between text-sky-800 bg-sky-50 p-2 rounded border border-sky-200">
                <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5 text-sky-600" /> penghuni_id</span>
                <span className="text-[10px] text-slate-500">Int (FK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>jenis_iuran</span>
                <span className="text-[10px] text-sky-700 font-bold">Satpam | Kebersihan</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>bulan / tahun</span>
                <span className="text-[10px] text-slate-500">Int (1-12) / Int</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>jumlah</span>
                <span className="text-[10px] text-slate-500">Float</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>status</span>
                <span className="text-[10px] text-emerald-700 font-bold">Lunas | Belum Lunas</span>
              </div>
            </div>
          </div>

          {/* Entitas Pengeluaran */}
          <div className="bg-slate-50 rounded-2xl border border-rose-200 p-5 space-y-4 shadow-sm hover:border-rose-300 transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-rose-700 flex items-center gap-2">
                <Table className="w-4 h-4 text-rose-600" /> Pengeluaran
              </span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-semibold">
                Pencatatan Biaya RT
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-amber-800 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5 text-amber-600" /> id</span>
                <span className="text-[10px] text-slate-500">Int (PK)</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>kategori</span>
                <span className="text-[10px] text-slate-500">String</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>keterangan</span>
                <span className="text-[10px] text-slate-500">String</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>jumlah</span>
                <span className="text-[10px] text-slate-500">Float</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 p-1.5">
                <span>tanggal</span>
                <span className="text-[10px] text-slate-500">Date</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
