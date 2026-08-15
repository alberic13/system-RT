import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Heart, 
  UserCheck, 
  X, 
  Upload, 
  Image as ImageIcon,
  Building,
  Eye
} from 'lucide-react';
import { StorageService } from '../services/storage';

export default function Penghuni() {
  const [penghuniList, setPenghuniList] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    nama_lengkap: '',
    foto_ktp: '',
    status_penghuni: 'Tetap',
    nomor_telepon: '',
    status_pernikahan: 'Sudah Menikah',
  });
  const [previewKtp, setPreviewKtp] = useState('');

  // KTP View Modal State
  const [viewKtpModal, setViewKtpModal] = useState(false);
  const [targetKtpData, setTargetKtpData] = useState(null);

  useEffect(() => {
    loadPenghuni();
  }, [filterStatus]);

  const loadPenghuni = () => {
    const list = StorageService.getPenghuni(filterStatus);
    setPenghuniList(list);
  };

  const generateKtpSvg = (nama, nik) => {
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180" fill="none"><rect width="300" height="180" rx="12" fill="%23f1f5f9"/><rect x="15" y="15" width="270" height="150" rx="8" fill="%23ffffff" stroke="%230284c7" stroke-width="2"/><text x="30" y="40" fill="%230284c7" font-family="sans-serif" font-size="14" font-weight="bold">PROVINSI DKI JAKARTA</text><text x="30" y="55" fill="%230284c7" font-family="sans-serif" font-size="11">KOTA JAKARTA SELATAN</text><rect x="30" y="70" width="70" height="80" rx="6" fill="%23e2e8f0"/><circle cx="65" cy="100" r="20" fill="%2394a3b8"/><path d="M40 140 C 40 120, 90 120, 90 140 Z" fill="%2394a3b8"/><text x="115" y="85" fill="%230f172a" font-family="sans-serif" font-size="11" font-weight="bold">NIK: ${nik}</text><text x="115" y="105" fill="%230284c7" font-family="sans-serif" font-size="11" font-weight="bold">${nama.substring(0, 18)}</text><text x="115" y="125" fill="%2364748b" font-family="sans-serif" font-size="9">Perumahan Elite RT 05 / RW 02</text><text x="115" y="140" fill="%23059669" font-family="sans-serif" font-size="9" font-weight="bold">FOTO KTP TERVERIFIKASI</text></svg>`;
  };

  const handleOpenCreate = () => {
    setIsEdit(false);
    const initialSvg = generateKtpSvg('WARGA BARU', '3174000000000000');
    setFormData({
      id: null,
      nama_lengkap: '',
      foto_ktp: initialSvg,
      status_penghuni: 'Tetap',
      nomor_telepon: '',
      status_pernikahan: 'Sudah Menikah',
    });
    setPreviewKtp(initialSvg);
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setIsEdit(true);
    const ktpSvg = p.foto_ktp || generateKtpSvg(p.nama_lengkap, '3174091205900001');
    setFormData({
      id: p.id,
      nama_lengkap: p.nama_lengkap,
      foto_ktp: ktpSvg,
      status_penghuni: p.status_penghuni,
      nomor_telepon: p.nomor_telepon,
      status_pernikahan: p.status_pernikahan,
    });
    setPreviewKtp(ktpSvg);
    setShowModal(true);
  };

  const handleOpenViewKtp = (p) => {
    setTargetKtpData(p);
    setViewKtpModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewKtp(reader.result);
        setFormData(prev => ({ ...prev, foto_ktp: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      StorageService.updatePenghuni(formData);
    } else {
      StorageService.addPenghuni(formData);
    }
    setShowModal(false);
    loadPenghuni();
  };

  const handleDelete = (id) => {
    if (confirm("Apakah Anda yakin ingin menghapus data penghuni ini?")) {
      StorageService.deletePenghuni(id);
      loadPenghuni();
    }
  };

  const filteredList = penghuniList.filter(p => 
    p.nama_lengkap.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_telepon.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <Users className="w-7 h-7 text-sky-600" />
            Daftar Penghuni RT 
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola identitas warga (Nama Lengkap, Foto KTP, Status Tetap/Kontrak, No HP, Status Pernikahan).
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <UserPlus className="w-4 h-4" /> Tambah Penghuni Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari nama atau no. telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Status:</span>
          {['All', 'Tetap', 'Kontrak'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === st
                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'All' ? `Semua Warga (${penghuniList.length})` : st}
            </button>
          ))}
        </div>
      </div>

      {/* FORMAT LIST TABEL PENGHUNI */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-sm">
            Tidak ada data penghuni ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 uppercase font-semibold text-[11px] text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Foto KTP</th>
                  <th className="px-5 py-3.5">Nama Lengkap</th>
                  <th className="px-5 py-3.5">Unit Rumah Ditempati</th>
                  <th className="px-5 py-3.5">Status Penghuni</th>
                  <th className="px-5 py-3.5">No. Telepon / WA</th>
                  <th className="px-5 py-3.5">Status Pernikahan</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((p) => {
                  const isTetap = p.status_penghuni === 'Tetap';
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      {/* Foto KTP Thumbnail */}
                      <td className="px-5 py-3.5">
                        {p.foto_ktp ? (
                          <div 
                            onClick={() => handleOpenViewKtp(p)}
                            className="relative cursor-pointer group/ktp"
                            title="Klik untuk memperbesar Foto KTP"
                          >
                            <img
                              src={p.foto_ktp}
                              alt={`KTP ${p.nama_lengkap}`}
                              className="w-16 h-10 object-contain rounded border border-slate-300 shadow-sm group-hover/ktp:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-900/30 rounded opacity-0 group-hover/ktp:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4 opacity-40" />
                          </div>
                        )}
                      </td>

                      {/* Nama Lengkap */}
                      <td className="px-5 py-3.5">
                        <span className="font-extrabold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                          {p.nama_lengkap}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">ID: #{p.id}</span>
                      </td>

                      {/* Unit Rumah */}
                      <td className="px-5 py-3.5">
                        {p.rumah && p.rumah.length > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 font-bold border border-sky-200 text-[11px]">
                            <Building className="w-3 h-3 text-sky-600" />
                            {p.rumah.map(r => r.nomor_rumah).join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Belum ada rumah</span>
                        )}
                      </td>

                      {/* Status Penghuni */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isTetap
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <UserCheck className="w-3 h-3" /> {p.status_penghuni}
                        </span>
                      </td>

                      {/* No. Telepon */}
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {p.nomor_telepon}
                        </span>
                      </td>

                      {/* Status Pernikahan */}
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {p.status_pernikahan}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenViewKtp(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-sky-600 border border-slate-200 hover:border-sky-200 transition-all shadow-sm"
                            title="Lihat KTP"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-sky-600 border border-slate-200 hover:border-sky-200 transition-all shadow-sm"
                            title="Edit Data Penghuni"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shadow-sm"
                            title="Hapus Penghuni"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal View Large KTP */}
      {viewKtpModal && targetKtpData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Foto KTP — {targetKtpData.nama_lengkap}
                </h2>
                <p className="text-xs text-slate-500">Status: {targetKtpData.status_penghuni}</p>
              </div>
              <button
                onClick={() => setViewKtpModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-center">
              <img
                src={targetKtpData.foto_ktp}
                alt={`KTP ${targetKtpData.nama_lengkap}`}
                className="w-full max-h-72 object-contain rounded-lg shadow-sm border border-slate-300"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setViewKtpModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Create / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                {isEdit ? 'Ubah Data Penghuni' : 'Tambah Penghuni Baru'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.nama_lengkap}
                  onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Penghuni *</label>
                  <select
                    value={formData.status_penghuni}
                    onChange={(e) => setFormData({ ...formData, status_penghuni: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak">Kontrak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Pernikahan *</label>
                  <select
                    value={formData.status_pernikahan}
                    onChange={(e) => setFormData({ ...formData, status_pernikahan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                  >
                    <option value="Sudah Menikah">Sudah Menikah</option>
                    <option value="Belum Menikah">Belum Menikah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor Telepon / WhatsApp *</label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={formData.nomor_telepon}
                  onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Foto KTP Penghuni</label>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center space-y-3">
                  {previewKtp && (
                    <img
                      src={previewKtp}
                      alt="KTP Preview"
                      className="max-h-36 rounded-lg object-contain border border-slate-300 shadow-sm"
                    />
                  )}

                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-sky-700 text-xs font-semibold border border-slate-300 cursor-pointer transition-all shadow-sm">
                    <Upload className="w-4 h-4 text-sky-600" /> Unggah Foto KTP Baru
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                  {isEdit ? 'Simpan Perubahan' : 'Tambah Penghuni'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
