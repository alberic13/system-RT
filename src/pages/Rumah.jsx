import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Home,
  UserCheck,
  UserX,
  History,
  Edit3,
  X,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  Trash2,
  Calendar,
  FileText
} from 'lucide-react';
import { StorageService } from '../services/storage';

export default function Rumah() {
  const [searchParams] = useSearchParams();
  const selectedHouseId = searchParams.get('id');

  const [rumahList, setRumahList] = useState([]);
  const [penghuniList, setPenghuniList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterHuni, setFilterHuni] = useState('All');

  // Assign Penghuni Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [targetRumah, setTargetRumah] = useState(null);
  const [selectedPenghuniId, setSelectedPenghuniId] = useState('');
  const [statusHuniForm, setStatusHuniForm] = useState('Dihuni');
  const [catatanRiwayatForm, setCatatanRiwayatForm] = useState('');

  // History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyHouse, setHistoryHouse] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    loadData();
  }, [filterHuni]);

  const loadData = () => {
    const listR = StorageService.getRumah();
    const listP = StorageService.getPenghuni();
    setRumahList(listR);
    setPenghuniList(listP);

    if (selectedHouseId) {
      const target = listR.find(r => r.id === Number(selectedHouseId));
      if (target) handleOpenHistory(target);
    }
  };

  const handleOpenAssign = (r) => {
    setTargetRumah(r);
    setSelectedPenghuniId(r.penghuni_id ? String(r.penghuni_id) : '');
    setStatusHuniForm(r.status_huni);
    setCatatanRiwayatForm('');
    setShowAssignModal(true);
  };

  const handleSaveAssign = (e) => {
    e.preventDefault();
    if (!targetRumah) return;

    const newPenghuniId = statusHuniForm === 'Tidak Dihuni' ? null : (selectedPenghuniId ? Number(selectedPenghuniId) : null);

    StorageService.updateRumah({
      id: targetRumah.id,
      status_huni: statusHuniForm,
      penghuni_id: newPenghuniId,
      catatan_riwayat: catatanRiwayatForm,
    });

    setShowAssignModal(false);
    loadData();
  };

  const handleOpenHistory = (r) => {
    setHistoryHouse(r);
    const hist = StorageService.getRiwayatByRumahId(r.id);
    setHistoryList(hist);
    setShowHistoryModal(true);
  };

  const refreshHistory = (houseId) => {
    const hist = StorageService.getRiwayatByRumahId(houseId);
    setHistoryList(hist);
  };

  const handleDeleteHistory = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus catatan riwayat ini?")) {
      StorageService.deleteRiwayat(id);
      if (historyHouse) refreshHistory(historyHouse.id);
      loadData();
    }
  };

  const filtered = rumahList.filter(r => {
    const matchesSearch = r.nomor_rumah.toLowerCase().includes(search.toLowerCase()) ||
      (r.penghuni?.nama_lengkap || '').toLowerCase().includes(search.toLowerCase());
    const matchesHuni = filterHuni === 'All' || r.status_huni === filterHuni;
    return matchesSearch && matchesHuni;
  });

  const totalDihuni = rumahList.filter(r => r.status_huni === 'Dihuni').length;
  const totalKosong = rumahList.filter(r => r.status_huni === 'Tidak Dihuni').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <Building2 className="w-7 h-7 text-slate-800" />
            Manajemen Unit Rumah & Histori Penghuni
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-normal">
            Daftar 20 unit rumah Perumahan Zalde (Blok A1–A10 & Blok B1–B10), status okupansi, serta rekam jejak penghuni.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-200/80">
          <div className="px-3 py-1 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-800 text-xs font-bold">
            {totalDihuni} Dihuni
          </div>
          <div className="px-3 py-1 bg-amber-50 border border-amber-200/60 rounded-xl text-amber-800 text-xs font-bold">
            {totalKosong} Kosong
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari blok/no rumah atau penghuni..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300/80 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Filter:</span>
          {[
            { id: 'All', label: 'Semua (20 Unit)' },
            { id: 'Dihuni', label: `Dihuni (${totalDihuni})` },
            { id: 'Tidak Dihuni', label: `Kosong (${totalKosong})` },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterHuni(st.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterHuni === st.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* List Rumah Format Tabel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 min-w-[650px]">
            <thead className="bg-slate-50 uppercase font-bold text-[11px] text-slate-400 tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Unit Rumah</th>
                <th className="px-5 py-3.5">Status Hunian</th>
                <th className="px-5 py-3.5">Penghuni Terdaftar saat ini</th>
                <th className="px-5 py-3.5">Status Warga</th>
                <th className="px-5 py-3.5">No. Telepon / WA</th>
                <th className="px-5 py-3.5 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-xs ${
                        r.status_huni === 'Dihuni' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}>
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                          {r.nomor_rumah}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">Unit #{r.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        r.status_huni === 'Dihuni'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}
                    >
                      {r.status_huni}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-extrabold text-slate-900">
                    {r.penghuni ? r.penghuni.nama_lengkap : <span className="text-slate-400 italic font-normal">Tidak Ada Penghuni</span>}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {r.penghuni ? r.penghuni.status_penghuni : '-'}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {r.penghuni ? r.penghuni.nomor_telepon : '-'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenAssign(r)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition-all shadow-xs active:scale-95"
                      >
                        Atur Penghuni
                      </button>
                      <button
                        onClick={() => handleOpenHistory(r)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition-all shadow-xs active:scale-95 flex items-center gap-1"
                      >
                        <History className="w-3.5 h-3.5" /> Riwayat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Assign Penghuni */}
      {showAssignModal && targetRumah && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-slate-900" />
                Atur Penghuni Unit {targetRumah.nomor_rumah}
              </h2>
              <button onClick={() => setShowAssignModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Okupansi Rumah</label>
                <select
                  value={statusHuniForm}
                  onChange={(e) => setStatusHuniForm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300/80 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
                >
                  <option value="Dihuni">Dihuni</option>
                  <option value="Tidak Dihuni">Tidak Dihuni (Kosong)</option>
                </select>
              </div>

              {statusHuniForm === 'Dihuni' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pilih Penghuni Terdaftar</label>
                  <select
                    value={selectedPenghuniId}
                    onChange={(e) => setSelectedPenghuniId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300/80 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
                  >
                    <option value="">-- Pilih Penghuni --</option>
                    {penghuniList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nama_lengkap} ({p.status_penghuni})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Riwayat / Keterangan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Perpanjangan masa sewa, Kontrak 1 tahun..."
                  value={catatanRiwayatForm}
                  onChange={(e) => setCatatanRiwayatForm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300/80 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-slate-900 outline-none font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histori Penghuni */}
      {showHistoryModal && historyHouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/80 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-900" />
                  Histori Penghuni Unit {historyHouse.nomor_rumah}
                </h2>
                <p className="text-xs text-slate-500">Rekam jejak penghuni tetap & kontrak terdahulu</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 rounded-xl text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Header / Info Count Riwayat */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Daftar Rekam Jejak ({historyList.length})
              </span>
            </div>

            {/* List Riwayat */}
            {historyList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs italic space-y-1">
                <History className="w-8 h-8 mx-auto text-slate-300" />
                <p>Belum ada catatan riwayat penghuni untuk unit rumah ini.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((item) => {
                  const isCurrentActive = !item.tanggal_keluar;
                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border text-xs space-y-2 relative transition-all ${
                        isCurrentActive
                          ? 'bg-emerald-50/60 border-emerald-200/80'
                          : 'bg-slate-50 border-slate-200/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCurrentActive ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white'
                          }`}>
                            {item.penghuni ? item.penghuni.nama_lengkap.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{item.penghuni ? item.penghuni.nama_lengkap : 'Penghuni Terhapus'}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                isCurrentActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-slate-200 text-slate-600 border-slate-300'
                              }`}>
                                {isCurrentActive ? 'Aktif' : 'Terdahulu'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Status Warga: {item.status_penghuni || item.penghuni?.status_penghuni || '-'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus Catatan Riwayat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-200/50 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            Huni: <strong className="text-slate-800">{item.tanggal_masuk}</strong> s/d <strong className="text-slate-800">{item.tanggal_keluar || 'Sekarang'}</strong>
                          </span>
                        </div>
                        {item.catatan && (
                          <div className="flex items-center gap-1 col-span-1 sm:col-span-2">
                            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="italic text-slate-700">{item.catatan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-right pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

