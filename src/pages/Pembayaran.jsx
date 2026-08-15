import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../services/storage';

const namaBulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function Pembayaran() {
  const [pembayaranList, setPembayaranList] = useState([]);
  const [rumahList, setRumahList] = useState([]);

  // Filters
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(2026);
  const [filterJenis, setFilterJenis] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    rumah_id: '',
    penghuni_id: '',
    jenis_iuran: 'Keduanya',
    bulan_mulai: new Date().getMonth() + 1,
    tahun: 2026,
    durasi_bulan: 1,
    catatan: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedBulan, selectedTahun]);

  const loadData = () => {
    const pList = StorageService.getPembayaran(selectedBulan, selectedTahun);
    const rList = StorageService.getRumah();
    setPembayaranList(pList);
    setRumahList(rList);
  };

  const handleSelectRumah = (rumahId) => {
    const rmh = rumahList.find(r => r.id === Number(rumahId));
    if (rmh && rmh.penghuni_id) {
      setFormData(prev => ({
        ...prev,
        rumah_id: rumahId,
        penghuni_id: rmh.penghuni_id,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        rumah_id: rumahId,
        penghuni_id: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.rumah_id || !formData.penghuni_id) {
      alert("Pilih rumah yang sudah memiliki penghuni!");
      return;
    }

    StorageService.addPembayaranBulk(formData);
    setShowModal(false);
    loadData();
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredPembayaran = pembayaranList.filter((p) => {
    if (filterJenis !== 'All' && p.jenis_iuran !== filterJenis) return false;
    return true;
  });

  const totalTerkumpul = filteredPembayaran
    .filter(p => p.status === 'Lunas')
    .reduce((acc, p) => acc + p.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-sky-600" />
            Mengelola Pembayaran Iuran Bulanan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Satpam: <span className="font-bold text-sky-700">Rp 100.000</span> | Kebersihan: <span className="font-bold text-emerald-700">Rp 15.000</span>. Mendukung opsi bayar 1 bulan & **1 Tahun Sekaligus**.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> Catat Pembayaran Iuran
        </button>
      </div>

      {/* Filter & Metric Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Bulan:</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
            >
              {namaBulanList.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Tahun:</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Jenis Iuran:</label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
            >
              <option value="All">Semua Jenis</option>
              <option value="Satpam">Iuran Satpam (100k)</option>
              <option value="Kebersihan">Iuran Kebersihan (15k)</option>
            </select>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3 w-full lg:w-auto justify-between shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Iuran Terkumpul Bulan Ini:</span>
          <span className="text-base font-extrabold text-emerald-700">{formatRupiah(totalTerkumpul)}</span>
        </div>
      </div>

      {/* Pembayaran List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredPembayaran.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Belum ada catatan pembayaran untuk bulan {namaBulanList[selectedBulan - 1]} {selectedTahun}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Unit Rumah</th>
                  <th className="px-5 py-3.5">Nama Penghuni</th>
                  <th className="px-5 py-3.5">Status Penghuni</th>
                  <th className="px-5 py-3.5">Jenis Iuran</th>
                  <th className="px-5 py-3.5">Nominal</th>
                  <th className="px-5 py-3.5">Status Bayar</th>
                  <th className="px-5 py-3.5">Tanggal Bayar</th>
                  <th className="px-5 py-3.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPembayaran.map((p) => {
                  const isLunas = p.status === 'Lunas';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4 font-extrabold text-slate-900">
                        {p.rumah?.nomor_rumah}
                      </td>
                      <td className="px-5 py-4 font-bold text-sky-700">
                        {p.penghuni?.nama_lengkap}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.penghuni?.status_penghuni === 'Tetap'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.penghuni?.status_penghuni}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {p.jenis_iuran === 'Satpam' ? (
                          <span className="text-sky-700">🛡️ Satpam (100k)</span>
                        ) : (
                          <span className="text-emerald-700">🧹 Kebersihan (15k)</span>
                        )}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-slate-900">
                        {formatRupiah(p.jumlah)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isLunas
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isLunas ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {p.tanggal_bayar || '-'}
                      </td>
                      <td className="px-5 py-4 text-slate-500 italic text-[11px]">
                        {p.catatan || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Catat Pembayaran */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-sky-600" />
                Input Pembayaran Iuran
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
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Unit Rumah (Yang Dihuni) *
                </label>
                <select
                  required
                  value={formData.rumah_id}
                  onChange={(e) => handleSelectRumah(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                >
                  <option value="">-- Pilih Unit Rumah --</option>
                  {rumahList
                    .filter((r) => r.status_huni === 'Dihuni' && r.penghuni)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nomor_rumah} — Penghuni: {r.penghuni.nama_lengkap} ({r.penghuni.status_penghuni})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Jenis Iuran *
                </label>
                <select
                  value={formData.jenis_iuran}
                  onChange={(e) => setFormData({ ...formData, jenis_iuran: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
                >
                  <option value="Keduanya">Paket Lengkap (Satpam 100k + Kebersihan 15k = Rp 115k)</option>
                  <option value="Satpam">Iuran Satpam Saja (Rp 100.000)</option>
                  <option value="Kebersihan">Iuran Kebersihan Saja (Rp 15.000)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-sky-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" /> Skema Periode Pembayaran *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, durasi_bulan: 1 })}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      formData.durasi_bulan === 1
                        ? 'bg-sky-50 border-sky-300 text-sky-800'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>1 Bulan</div>
                    <span className="text-[10px] font-normal text-slate-500 block mt-0.5">Bayar per bulan rutin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, durasi_bulan: 12 })}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      formData.durasi_bulan === 12
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>1 Tahun Sekaligus</div>
                    <span className="text-[10px] font-normal text-slate-500 block mt-0.5">Lunas 12 bulan sekaligus</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bulan Mulai *</label>
                  <select
                    value={formData.bulan_mulai}
                    onChange={(e) => setFormData({ ...formData, bulan_mulai: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    {namaBulanList.map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tahun *</label>
                  <select
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value={2026}>2026</option>
                    <option value={2025}>2025</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Catatan / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer via Bank BCA / Tunai di Pos Satpam"
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
