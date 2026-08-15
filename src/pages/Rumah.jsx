import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Home,
  Plus,
  UserCheck,
  UserX,
  History,
  Receipt,
  Edit3,
  X,
  CheckCircle2,
  XCircle,
  Users,
  Search
} from 'lucide-react';
import { StorageService } from '../services/storage';

export default function Rumah() {
  const [searchParams] = useSearchParams();
  const selectedHouseId = searchParams.get('id');

  const [rumahList, setRumahList] = useState([]);
  const [penghuniList, setPenghuniList] = useState([]);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Detail & Historical Modal State
  const [detailModal, setDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('riwayat');

  // Edit / Assign Resident Modal State
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    id: null,
    nomor_rumah: '',
    status_huni: 'Dihuni',
    penghuni_id: '',
    catatan_riwayat: '',
  });

  // Create House Modal
  const [createModal, setCreateModal] = useState(false);
  const [createNomor, setCreateNomor] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHouseId && rumahList.length > 0) {
      handleOpenDetail(Number(selectedHouseId));
    }
  }, [selectedHouseId, rumahList]);

  const loadData = () => {
    const listR = StorageService.getRumah();
    const listP = StorageService.getPenghuni();
    setRumahList(listR);
    setPenghuniList(listP);
  };

  const handleOpenDetail = (id) => {
    const detail = StorageService.getRumahById(id);
    if (detail) {
      setSelectedDetail(detail);
      setDetailModal(true);
    }
  };

  const handleOpenEdit = (rmh) => {
    setEditFormData({
      id: rmh.id,
      nomor_rumah: rmh.nomor_rumah,
      status_huni: rmh.status_huni,
      penghuni_id: rmh.penghuni_id || '',
      catatan_riwayat: '',
    });
    setEditModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    StorageService.updateRumah(
      editFormData.id,
      editFormData.status_huni,
      editFormData.penghuni_id,
      editFormData.catatan_riwayat
    );
    setEditModal(false);
    loadData();
    if (selectedDetail && selectedDetail.id === editFormData.id) {
      handleOpenDetail(editFormData.id);
    }
  };

  const handleCreateHouse = (e) => {
    e.preventDefault();
    if (!createNomor) return;
    StorageService.addRumah(createNomor);
    setCreateModal(false);
    setCreateNomor('');
    loadData();
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const totalRumah = rumahList.length;
  const dihuniCount = rumahList.filter(r => r.status_huni === 'Dihuni').length;
  const kosongCount = totalRumah - dihuniCount;

  const filteredRumah = rumahList.filter((r) => {
    const matchSearch = r.nomor_rumah.toLowerCase().includes(search.toLowerCase()) ||
      (r.penghuni && r.penghuni.nama_lengkap.toLowerCase().includes(search.toLowerCase()));
    
    if (filterStatus === 'Dihuni') return matchSearch && r.status_huni === 'Dihuni';
    if (filterStatus === 'Kosong') return matchSearch && r.status_huni === 'Tidak Dihuni';
    return matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Building2 className="w-7 h-7 text-indigo-600" />
            Mengelola Data Rumah & Riwayat
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Status Hunian 20 Unit Rumah Perumahan Elite. Terdapat catatan historis penghuni & histori pembayaran lunas/belum lunas per rumah.
          </p>
        </div>

        <button
          onClick={() => setCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" /> Tambah Unit Rumah Baru
        </button>
      </div>

      {/* Info Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total Unit Rumah</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalRumah} Unit</p>
          </div>
          <Home className="w-8 h-8 text-sky-600 opacity-60" />
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-emerald-700 font-semibold">Status: Dihuni</span>
            <p className="text-xl font-extrabold text-emerald-800 mt-0.5">{dihuniCount} Unit Rumah</p>
          </div>
          <UserCheck className="w-8 h-8 text-emerald-600 opacity-60" />
        </div>

        <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs text-amber-700 font-semibold">Status: Tidak Dihuni (Kosong)</span>
            <p className="text-xl font-extrabold text-amber-800 mt-0.5">{kosongCount} Unit Rumah</p>
          </div>
          <UserX className="w-8 h-8 text-amber-600 opacity-60" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nomor blok atau nama penghuni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Status:</span>
          {[
            { id: 'All', label: `Semua Unit (${totalRumah})` },
            { id: 'Dihuni', label: `Dihuni (${dihuniCount})` },
            { id: 'Kosong', label: `Kosong (${kosongCount})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st.id
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABEL FORMAT LIST RUMAH */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredRumah.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Tidak ada unit rumah ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Unit Rumah</th>
                  <th className="px-5 py-3.5">Status Hunian</th>
                  <th className="px-5 py-3.5">Penghuni Saat Ini</th>
                  <th className="px-5 py-3.5">Status Warga</th>
                  <th className="px-5 py-3.5">No. Telepon / WA</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRumah.map((rmh) => {
                  const isDihuni = rmh.status_huni === 'Dihuni';
                  return (
                    <tr key={rmh.id} className="hover:bg-slate-50 transition-colors group">
                      {/* Unit / Blok Rumah */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isDihuni
                                ? 'bg-sky-50 text-sky-600 border-sky-200'
                                : 'bg-amber-50 text-amber-600 border-amber-200'
                            }`}
                          >
                            <Home className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-slate-900 group-hover:text-sky-600 transition-colors">
                              {rmh.nomor_rumah}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">ID Unit: #{rmh.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Hunian */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isDihuni
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isDihuni ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          {rmh.status_huni}
                        </span>
                      </td>

                      {/* Penghuni Saat Ini */}
                      <td className="px-5 py-4">
                        {isDihuni && rmh.penghuni ? (
                          <span className="font-extrabold text-slate-900 text-sm">
                            {rmh.penghuni.nama_lengkap}
                          </span>
                        ) : (
                          <span className="text-amber-700 italic text-[11px] font-medium">
                            Kosong (Tidak Dihuni)
                          </span>
                        )}
                      </td>

                      {/* Status Warga */}
                      <td className="px-5 py-4">
                        {isDihuni && rmh.penghuni ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rmh.penghuni.status_penghuni === 'Tetap'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {rmh.penghuni.status_penghuni}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* No. Telepon */}
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {isDihuni && rmh.penghuni ? (
                          rmh.penghuni.nomor_telepon
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetail(rmh.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-sky-700 text-xs font-semibold border border-slate-200 hover:border-sky-200 transition-all shadow-sm"
                          >
                            <History className="w-3.5 h-3.5" /> Detail & Riwayat
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rmh)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all shadow-sm"
                            title="Atur Penghuni"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail & Historical Log */}
      {detailModal && selectedDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-sky-600" />
                  Detail Unit {selectedDetail.nomor_rumah}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Status: <span className={selectedDetail.status_huni === 'Dihuni' ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{selectedDetail.status_huni}</span>
                  {selectedDetail.penghuni && ` — Penghuni: ${selectedDetail.penghuni.nama_lengkap} (${selectedDetail.penghuni.status_penghuni})`}
                </p>
              </div>

              <button
                onClick={() => setDetailModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex border-b border-slate-100 gap-4">
              <button
                onClick={() => setDetailTab('riwayat')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  detailTab === 'riwayat'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <History className="w-4 h-4" /> Catatan Historis Penghuni
              </button>

              <button
                onClick={() => setDetailTab('pembayaran')}
                className={`pb-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                  detailTab === 'pembayaran'
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-400 hover:text-slate-700'
                }`}
              >
                <Receipt className="w-4 h-4" /> Histori Pembayaran Iuran
              </button>
            </div>

            {/* Tab 1: Riwayat */}
            {detailTab === 'riwayat' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Riwayat Penghuni yang Pernah Menempati Unit Ini:
                </h3>

                {selectedDetail.riwayat && selectedDetail.riwayat.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDetail.riwayat.map((rw) => (
                      <div
                        key={rw.id}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-sky-600 shrink-0 border border-slate-200 shadow-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {rw.penghuni?.nama_lengkap || 'Penghuni Terhapus'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              Status: {rw.penghuni?.status_penghuni || '-'} | HP: {rw.penghuni?.nomor_telepon || '-'}
                            </p>
                            {rw.catatan && (
                              <p className="text-[11px] text-sky-700 italic mt-1">"{rw.catatan}"</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right sm:text-right border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0">
                          <div className="text-[11px] text-slate-500 font-medium">
                            Masuk: {rw.tanggal_masuk}
                          </div>
                          <div className="text-[11px] font-semibold">
                            {rw.tanggal_keluar ? (
                              <span className="text-amber-700">Keluar: {rw.tanggal_keluar}</span>
                            ) : (
                              <span className="text-emerald-700 font-bold">Penghuni Aktif Saat Ini</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat penghuni tercatat untuk rumah ini.
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Pembayaran */}
            {detailTab === 'pembayaran' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Riwayat Pembayaran Iuran Warga (Satpam & Kebersihan):
                </h3>

                {selectedDetail.pembayaran && selectedDetail.pembayaran.length > 0 ? (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {selectedDetail.pembayaran.map((p) => {
                      const isLunas = p.status === 'Lunas';
                      return (
                        <div
                          key={p.id}
                          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-sm"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900">
                              Iuran {p.jenis_iuran} — Bulan {p.bulan} / {p.tahun}
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Oleh: {p.penghuni?.nama_lengkap} | Nominal: <span className="text-sky-700 font-semibold">{formatRupiah(p.jumlah)}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                                isLunas
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isLunas ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {p.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada riwayat pembayaran untuk rumah ini.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Edit / Assign Penghuni */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                Atur Penghuni Unit {editFormData.nomor_rumah}
              </h2>
              <button
                onClick={() => setEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status Hunian *
                </label>
                <select
                  value={editFormData.status_huni}
                  onChange={(e) => setEditFormData({ ...editFormData, status_huni: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="Dihuni">Dihuni</option>
                  <option value="Tidak Dihuni">Tidak Dihuni (Kosong)</option>
                </select>
              </div>

              {editFormData.status_huni === 'Dihuni' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Penghuni *
                  </label>
                  <select
                    required
                    value={editFormData.penghuni_id}
                    onChange={(e) => setEditFormData({ ...editFormData, penghuni_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="">-- Pilih Penghuni dari Daftar --</option>
                    {penghuniList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_lengkap} ({p.status_penghuni}) - Telp: {p.nomor_telepon}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Catatan Riwayat / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Mulai sewa kontrak 6 bulan"
                  value={editFormData.catatan_riwayat}
                  onChange={(e) => setEditFormData({ ...editFormData, catatan_riwayat: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Unit Rumah */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900">Tambah Unit Rumah Baru</h2>
            <form onSubmit={handleCreateHouse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor / Blok Rumah *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Blok C1"
                  value={createNomor}
                  onChange={(e) => setCreateNomor(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Tambah Rumah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
