import React, { useState, useEffect } from 'react';
import {
  Receipt,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { StorageService } from '../services/storage';

const kategoriList = [
  'Gaji Satpam',
  'Listrik Pos Satpam',
  'Perbaikan Jalan',
  'Perbaikan Selokan',
  'Kebersihan Taman & Fasum',
  'Lain-lain'
];

export default function Pengeluaran() {
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [selectedBulan, setSelectedBulan] = useState('All');
  const [selectedTahun, setSelectedTahun] = useState(2026);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    kategori: 'Gaji Satpam',
    keterangan: '',
    jumlah: '',
    tanggal: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, [selectedBulan, selectedTahun]);

  const loadData = () => {
    const list = StorageService.getPengeluaran(selectedBulan, selectedTahun);
    setPengeluaranList(list);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.jumlah || !formData.keterangan) {
      alert("Lengkapi keterangan dan nominal!");
      return;
    }

    StorageService.addPengeluaran(formData);
    setShowModal(false);
    setFormData({
      kategori: 'Gaji Satpam',
      keterangan: '',
      jumlah: '',
      tanggal: new Date().toISOString().split('T')[0],
    });
    loadData();
  };

  const handleDelete = (id) => {
    if (confirm("Hapus catatan pengeluaran ini?")) {
      StorageService.deletePengeluaran(id);
      loadData();
    }
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalPengeluaran = pengeluaranList.reduce((acc, p) => acc + p.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Receipt className="w-7 h-7 text-rose-600" />
            Mengelola Pengeluaran Kas RT
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pengeluaran rutin (gaji satpam, listrik pos) & insidental (perbaikan jalan, selokan, taman perumahan).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> Catat Pengeluaran Baru
        </button>
      </div>

      {/* Filter & Metric Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Bulan:</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none font-semibold"
            >
              <option value="All">Semua Bulan</option>
              {[
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ].map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Tahun:</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-rose-500 outline-none font-semibold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 w-full sm:w-auto justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Pengeluaran Dipilih:</span>
          <span className="text-base font-extrabold text-rose-700">{formatRupiah(totalPengeluaran)}</span>
        </div>
      </div>

      {/* Pengeluaran List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {pengeluaranList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Belum ada catatan pengeluaran terdaftar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Tanggal</th>
                  <th className="px-5 py-3.5">Kategori</th>
                  <th className="px-5 py-3.5">Keterangan / Deskripsi</th>
                  <th className="px-5 py-3.5">Nominal (Rp)</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pengeluaranList.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-slate-500 text-[11px]">
                      {p.tanggal}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                        {p.kategori}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-900 max-w-md">
                      {p.keterangan}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-rose-700 text-sm">
                      {formatRupiah(p.jumlah)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shadow-sm"
                        title="Hapus Pengeluaran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Catat Pengeluaran */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-rose-600" />
                Catat Pengeluaran RT Baru
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kategori Pengeluaran *</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                >
                  {kategoriList.map((kat, idx) => (
                    <option key={idx} value={kat}>{kat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 1500000"
                  value={formData.jumlah}
                  onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keterangan / Rincian Pengeluaran *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Honorarium 2 Petugas Satpam Bulan Ini"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Pengeluaran *</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
