import React, { useState, useEffect } from 'react';
import { 
    getHouses, 
    createHouse, 
    updateHouse, 
    assignResidentToHouse, 
    getHouseResidentHistory,
    getResidents,
    deleteHouse
} from '../services/api';
import { toWhatsAppUrl, todayLocalISO } from '../utils/phone';
import { 
    Plus, 
    Home, 
    UserPlus, 
    UserMinus, 
    History, 
    Edit2, 
    Check, 
    X,
    Calendar,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

export default function Houses() {
    const [houses, setHouses] = useState([]);
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Modal states
    const [isAddHouseOpen, setIsAddHouseOpen] = useState(false);
    const [isAssignOpen, setIsAssignOpen] = useState(false);

    // Form states
    const [newHouseCode, setNewHouseCode] = useState('');
    const [assignData, setAssignData] = useState({
        resident_id: '',
        start_date: todayLocalISO()
    });

    useEffect(() => {
        loadHousesData();
        loadResidentsData();
    }, []);

    const loadHousesData = async () => {
        try {
            const res = await getHouses();
            setHouses(res.data);
            
            // Re-select currently selected house to refresh details
            if (selectedHouse) {
                const refreshed = res.data.find(h => h.id === selectedHouse.id);
                if (refreshed) {
                    setSelectedHouse(refreshed);
                }
            }
        } catch (error) {
            console.error("Error loading houses:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadResidentsData = async () => {
        try {
            const res = await getResidents();
            setResidents(res.data);
        } catch (error) {
            console.error("Error loading residents:", error);
        }
    };

    const handleSelectHouse = async (house) => {
        setSelectedHouse(house);
        setLoadingHistory(true);
        try {
            const res = await getHouseResidentHistory(house.id);
            setHistory(res.data);
        } catch (error) {
            console.error("Error loading history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleAddHouse = async (e) => {
        e.preventDefault();
        try {
            await createHouse({
                house_code: newHouseCode,
                status: 'tidak_dihuni'
            });
            setNewHouseCode('');
            setIsAddHouseOpen(false);
            loadHousesData();
        } catch (error) {
            console.error("Error adding house:", error);
            alert(error.response?.data?.message || "Gagal menambah rumah.");
        }
    };

    const handleOpenAssign = () => {
        setAssignData({
            resident_id: selectedHouse?.active_resident?.id || '',
            start_date: selectedHouse?.start_date || new Date().toISOString().split('T')[0]
        });
        setIsAssignOpen(true);
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await assignResidentToHouse(selectedHouse.id, {
                resident_id: assignData.resident_id || null, // null means vacant
                start_date: assignData.resident_id ? assignData.start_date : null
            });
            setIsAssignOpen(false);
            
            // Refresh house list
            await loadHousesData();
            
            // Refresh history
            if (selectedHouse) {
                const res = await getHouseResidentHistory(selectedHouse.id);
                setHistory(res.data);
            }
        } catch (error) {
            console.error("Error assigning resident:", error);
            alert("Gagal memperbarui penghuni rumah.");
        }
    };

    const handleDeleteHouse = async () => {
        if (!selectedHouse) return;
        if (!confirm(`Apakah Anda yakin ingin menghapus Unit Rumah ${selectedHouse.house_code}? Semua riwayat penghuni dan catatan iuran untuk rumah ini akan ikut terhapus permanen.`)) return;

        try {
            await deleteHouse(selectedHouse.id);
            setIsAssignOpen(false);
            setSelectedHouse(null);
            loadHousesData();
        } catch (error) {
            console.error("Error deleting house:", error);
            alert("Gagal menghapus unit rumah.");
        }
    };

    const totalTetap = houses.filter(h => h.status === 'dihuni' && h.active_resident?.status === 'tetap').length;
    const totalKontrak = houses.filter(h => h.status === 'dihuni' && h.active_resident?.status === 'kontrak').length;
    const totalKosong = houses.filter(h => h.status !== 'dihuni').length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Manajemen Rumah</h1>
                    <p className="text-slate-500">Kelola unit rumah di komplek RT, status hunian, dan riwayat penghuni.</p>
                </div>
                <button 
                    onClick={() => setIsAddHouseOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                    <Plus size={16} /> Tambah Rumah
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Houses Grid (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                                <h3 className="text-lg font-bold text-slate-800">Peta Hunian Rumah</h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> {totalTetap} Tetap
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> {totalKontrak} Kontrak
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
                                        <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span> {totalKosong} Kosong
                                    </span>
                                </div>
                            </div>

                            {/* Grid container */}
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {houses.map(house => {
                                    const isSelected = selectedHouse?.id === house.id;
                                    const isOccupied = house.status === 'dihuni';
                                    const resStatus = house.active_resident?.status;
                                    const isTetap = isOccupied && resStatus === 'tetap';
                                    const isKontrak = isOccupied && resStatus === 'kontrak';

                                    return (
                                        <button
                                            key={house.id}
                                            onClick={() => handleSelectHouse(house)}
                                            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-center ${
                                                isSelected 
                                                    ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 ring-2 ring-indigo-500/20' 
                                                    : isTetap
                                                        ? 'border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-300 text-emerald-800'
                                                        : isKontrak
                                                            ? 'border-amber-100 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-300 text-amber-800'
                                                            : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-slate-700'
                                            }`}
                                        >
                                            <Home 
                                                size={20} 
                                                className={
                                                    isTetap 
                                                        ? 'text-emerald-500' 
                                                        : isKontrak 
                                                            ? 'text-amber-500' 
                                                            : 'text-slate-400'
                                                } 
                                            />
                                            <span className="text-sm font-bold">{house.house_code}</span>
                                            <span className={`text-[10px] font-medium leading-none px-1.5 py-0.5 rounded-full bg-white border ${
                                                isTetap 
                                                    ? 'border-emerald-200 text-emerald-700' 
                                                    : isKontrak 
                                                        ? 'border-amber-200 text-amber-700' 
                                                        : 'border-slate-200 text-slate-500'
                                            }`}>
                                                {isTetap ? 'Tetap' : isKontrak ? 'Kontrak' : 'Kosong'}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* House Details Panel (1/3 width) */}
                    <div className="space-y-4">
                        {selectedHouse ? (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                                {/* House header */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Rumah {selectedHouse.house_code}</h3>
                                        <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold ${
                                            selectedHouse.status === 'dihuni' 
                                                ? selectedHouse.active_resident?.status === 'kontrak'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {selectedHouse.status === 'dihuni' 
                                                ? `Dihuni (${selectedHouse.active_resident?.status === 'kontrak' ? 'Kontrak' : 'Tetap'})` 
                                                : 'Kosong'}
                                        </span>
                                    </div>
                                    <button 
                                        onClick={handleOpenAssign}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition"
                                    >
                                        <Edit2 size={13} /> Edit Rumah
                                    </button>
                                </div>

                                {/* Active Resident Detail */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Penghuni Aktif</h4>
                                    {selectedHouse.active_resident ? (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                                            <h5 className="font-bold text-slate-800 text-sm">{selectedHouse.active_resident.name}</h5>
                                            <div className="flex items-center gap-2">
                                                 <p className="text-xs text-slate-500">Telp: {selectedHouse.active_resident.phone}</p>
                                                 {selectedHouse.active_resident.phone && (
                                                     <a
                                                         href={toWhatsAppUrl(selectedHouse.active_resident.phone)}
                                                         target="_blank"
                                                         rel="noopener noreferrer"
                                                         title="Chat WhatsApp"
                                                         className="inline-flex items-center justify-center w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full transition"
                                                     >
                                                         <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                             <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                         </svg>
                                                     </a>
                                                 )}
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Status: <span className="font-semibold uppercase text-[10px]">{selectedHouse.active_resident.status}</span>
                                            </p>
                                            <p className="text-xs text-slate-400 font-mono mt-1">
                                                Menetap sejak: {selectedHouse.start_date}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center text-slate-400 text-xs italic">
                                            Tidak ada penghuni aktif.
                                        </div>
                                    )}
                                </div>

                                {/* Residency History */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <History size={14} /> Riwayat Nama Penghuni Rumah
                                    </h4>
                                    {loadingHistory ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                        </div>
                                    ) : history.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic">Belum ada riwayat penghuni.</p>
                                    ) : (
                                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                                            {history.map(hr => (
                                                <div key={hr.id} className="p-3 bg-white border border-slate-100 rounded-xl text-xs flex justify-between items-center gap-2">
                                                    <div>
                                                        {/* resident_name sudah di-fallback oleh API ke snapshot atau "(Penghuni Dihapus)" */}
                                                        <p className={`font-bold ${hr.resident ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                                                            {hr.resident_name || hr.resident?.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {hr.start_date} s/d {hr.end_date || 'Sekarang'}
                                                        </p>
                                                    </div>
                                                    {hr.is_active && (
                                                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm flex flex-col items-center justify-center min-h-[300px]">
                                <Home size={36} className="text-slate-300 mb-2" />
                                Pilih salah satu rumah di sebelah kiri untuk melihat rincian dan riwayat.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add House Modal */}
            {isAddHouseOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Tambah Unit Rumah Baru</h3>
                        </div>
                        <form onSubmit={handleAddHouse} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Kode / Nomor Rumah</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newHouseCode}
                                    onChange={(e) => setNewHouseCode(e.target.value)}
                                    placeholder="Contoh: A-21, B-01"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 uppercase"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAddHouseOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                                >
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Resident Modal */}
            {isAssignOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">Hubungkan Penghuni - {selectedHouse?.house_code}</h3>
                        </div>
                        <form onSubmit={handleAssign} className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pilih Penghuni</label>
                                <select 
                                    value={assignData.resident_id}
                                    onChange={(e) => setAssignData(prev => ({ ...prev, resident_id: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                                >
                                    <option value="">-- KOSONGKAN / PINDAH --</option>
                                    {residents.map(res => (
                                        <option key={res.id} value={res.id}>{res.name} ({res.status})</option>
                                    ))}
                                </select>
                            </div>

                            {assignData.resident_id && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tanggal Mulai Menetap</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input 
                                            type="date" 
                                            required
                                            value={assignData.start_date}
                                            onChange={(e) => setAssignData(prev => ({ ...prev, start_date: e.target.value }))}
                                            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsAssignOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
