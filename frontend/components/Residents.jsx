import React, { useState, useEffect } from 'react';
import { 
    getResidents, 
    createResident, 
    updateResident, 
    deleteResident 
} from '../services/api';
import { toWhatsAppUrl } from '../utils/phone';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Search, 
    Eye, 
    User, 
    Phone, 
    FileText,
    Camera
} from 'lucide-react';

export default function Residents() {
    const [residents, setResidents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewPhotoUrl, setPreviewPhotoUrl] = useState('');
    
    // Form states
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'tetap',
        phone: '',
        is_married: '0',
    });
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadResidentsList();
    }, []);

    const loadResidentsList = async () => {
        try {
            const res = await getResidents();
            setResidents(res.data);
        } catch (error) {
            console.error("Error loading residents:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            name: '',
            status: 'tetap',
            phone: '',
            is_married: '0',
        });
        setSelectedFile(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (resident) => {
        setEditingId(resident.id);
        setFormData({
            name: resident.name,
            status: resident.status,
            phone: resident.phone,
            is_married: resident.is_married ? '1' : '0',
        });
        setSelectedFile(null);
        setIsFormModalOpen(true);
    };

    const openPreviewModal = (photoUrl) => {
        setPreviewPhotoUrl(photoUrl);
        setIsPreviewModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const uploadData = new FormData();
        uploadData.append('name', formData.name);
        uploadData.append('status', formData.status);
        uploadData.append('phone', formData.phone);
        uploadData.append('is_married', formData.is_married);
        if (selectedFile) {
            uploadData.append('id_card_photo', selectedFile);
        }

        try {
            if (editingId) {
                await updateResident(editingId, uploadData);
            } else {
                await createResident(uploadData);
            }
            setIsFormModalOpen(false);
            loadResidentsList();
        } catch (error) {
            console.error("Error saving resident:", error);
            alert(error.response?.data?.message || "Gagal menyimpan data warga.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus warga ini?")) return;
        
        try {
            await deleteResident(id);
            loadResidentsList();
        } catch (error) {
            console.error("Error deleting resident:", error);
            alert("Gagal menghapus data warga.");
        }
    };

    const filteredResidents = residents.filter(res => 
        res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.phone.includes(searchQuery)
    );

    const totalTetap = residents.filter(r => r.status === 'tetap').length;
    const totalKontrak = residents.filter(r => r.status === 'kontrak').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex flex-wrap items-center gap-2.5">
                        Daftar Warga/Penghuni
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> {totalTetap} Tetap
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> {totalKontrak} Kontrak
                        </span>
                    </h1>
                    <p className="text-slate-500">Kelola informasi pribadi warga perumahan, status, dan dokumen KTP.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                    <Plus size={16} /> Tambah Warga
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center w-full max-w-md">
                <Search className="text-slate-400 mr-2" size={18} />
                <input 
                    type="text" 
                    placeholder="Cari nama atau nomor telepon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm text-slate-800 focus:outline-none"
                />
            </div>

            {/* Residents Table */}
            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Nama ( Kepala Keluarga)</th>
                                    <th className="px-6 py-4">Status Warga</th>
                                    <th className="px-6 py-4">Nomor Telepon</th>
                                    <th className="px-6 py-4">Status Pernikahan</th>
                                    <th className="px-6 py-4">KTP</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredResidents.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                                            Tidak ada data warga ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredResidents.map(res => (
                                        <tr key={res.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-semibold text-slate-800">{res.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                    res.status === 'tetap' 
                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                        : 'bg-amber-50 text-amber-700'
                                                }`}>
                                                    {res.status === 'tetap' ? 'Tetap' : 'Kontrak'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-slate-700">{res.phone}</span>
                                                    {res.phone && (
                                                        <a
                                                            href={toWhatsAppUrl(res.phone)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title={`Chat WhatsApp ${res.name}`}
                                                            className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded-full transition shadow-sm"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                            </svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {res.is_married ? 'Menikah' : 'Belum Menikah'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {res.id_card_photo ? (
                                                    <button 
                                                        onClick={() => openPreviewModal(res.id_card_photo)}
                                                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold"
                                                    >
                                                        <Eye size={14} /> Lihat KTP
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 italic">Belum diunggah</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => openEditModal(res)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                                                        title="Edit Warga"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(res.id)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                                                        title="Hapus Warga"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Modal */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] shadow-xl border border-slate-100 overflow-hidden flex flex-col transform transition-all">
                        <div className="p-6 border-b border-slate-100 shrink-0">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingId ? 'Edit Data Warga' : 'Tambah Warga Baru'}
                            </h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                        placeholder="Contoh: Budi Santoso"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nomor Telepon</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <input 
                                        type="text" 
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                        placeholder="Contoh: 0812345678"
                                    />
                                </div>
                            </div>

                            {/* Status & Married Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status Penghuni</label>
                                    <select 
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                                    >
                                        <option value="tetap">Tetap</option>
                                        <option value="kontrak">Kontrak</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pernikahan</label>
                                    <select 
                                        name="is_married"
                                        value={formData.is_married}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                                    >
                                        <option value="0">Belum Menikah</option>
                                        <option value="1">Sudah Menikah</option>
                                    </select>
                                </div>
                            </div>

                            {/* Foto KTP Upload */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Foto KTP</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer relative">
                                    <Camera className="text-slate-400" size={24} />
                                    <span className="text-xs font-medium text-slate-500">
                                        {selectedFile ? selectedFile.name : 'Pilih / Unggah Foto KTP (Max 2MB)'}
                                    </span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button 
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* KTP Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                            <h3 className="text-sm font-bold text-slate-800">Foto KTP Warga</h3>
                            <button 
                                onClick={() => setIsPreviewModalOpen(false)}
                                className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg"
                            >
                                Tutup
                            </button>
                        </div>
                        <div className="p-6 bg-slate-900 flex items-center justify-center flex-1 overflow-auto">
                            <img 
                                src={previewPhotoUrl} 
                                alt="Foto KTP Warga" 
                                className="max-h-full max-w-full object-contain rounded-lg border border-slate-800"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
