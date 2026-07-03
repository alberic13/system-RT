import React, { useState, useEffect } from 'react';
import { 
    getBillingStatus, 
    createPayment, 
    getHouses
} from '../services/api';
import { 
    Plus, 
    User,
    CheckCircle,
    XCircle,
    Info,
    Search,
    Trash2,
    ChevronDown
} from 'lucide-react';

export default function Payments() {
    const [billingData, setBillingData] = useState([]);
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Matrix filters
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Modal state
    const [isRecordOpen, setIsRecordOpen] = useState(false);
    const [detailRow, setDetailRow] = useState(null);

    // Search
    const [searchQuery, setSearchQuery] = useState('');

    // Jenis Iuran — loaded from localStorage, defaults to 2 built-in types
    const defaultIuranTypes = [
        { key: 'kebersihan', label: 'Kebersihan', amount: 15000 },
        { key: 'satpam',     label: 'Satpam',     amount: 100000 },
    ];
    const [iuranTypes, setIuranTypes] = useState(() => {
        try {
            const saved = localStorage.getItem('rt_iuran_types');
            return saved ? JSON.parse(saved) : defaultIuranTypes;
        } catch { return defaultIuranTypes; }
    });
    const [showAddType, setShowAddType]   = useState(false);
    const [newTypeLabel,  setNewTypeLabel]  = useState('');
    const [newTypeAmount, setNewTypeAmount] = useState('');

    const saveIuranTypes = (types) => {
        setIuranTypes(types);
        localStorage.setItem('rt_iuran_types', JSON.stringify(types));
    };

    const handleAddIuranType = () => {
        const label  = newTypeLabel.trim();
        const amount = parseInt(newTypeAmount);
        if (!label || !amount) return;
        const key = label.toLowerCase().replace(/\s+/g, '_');
        if (iuranTypes.find(t => t.key === key)) {
            alert('Jenis iuran dengan nama tersebut sudah ada.');
            return;
        }
        saveIuranTypes([...iuranTypes, { key, label, amount }]);
        setNewTypeLabel('');
        setNewTypeAmount('');
        setShowAddType(false);
    };

    const handleDeleteIuranType = (key) => {
        if (!confirm('Hapus jenis iuran ini?')) return;
        saveIuranTypes(iuranTypes.filter(t => t.key !== key));
    };

    // Form states
    const [recordForm, setRecordForm] = useState({
        house_id: '',
        resident_id: '',
        resident_name: '',
        type: 'kebersihan',
        year: new Date().getFullYear(),
        payment_date: new Date().toISOString().split('T')[0]
    });
    const [selectedMonths, setSelectedMonths] = useState([]);

    const monthsList = [
        { val: 1, name: 'Januari' }, { val: 2, name: 'Februari' }, { val: 3, name: 'Maret' },
        { val: 4, name: 'April' }, { val: 5, name: 'Mei' }, { val: 6, name: 'Juni' },
        { val: 7, name: 'Juli' }, { val: 8, name: 'Agustus' }, { val: 9, name: 'September' },
        { val: 10, name: 'Oktober' }, { val: 11, name: 'November' }, { val: 12, name: 'Desember' }
    ];

    useEffect(() => {
        loadBillingMatrix();
        loadHousesList();
    }, [selectedMonth, selectedYear]);

    const loadBillingMatrix = async () => {
        setLoading(true);
        try {
            const res = await getBillingStatus(selectedMonth, selectedYear);
            setBillingData(res.data);
        } catch (error) {
            console.error("Error loading matrix:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadHousesList = async () => {
        try {
            const res = await getHouses();
            // Filter only occupied houses for payment form
            setHouses(res.data.filter(h => h.status === 'dihuni'));
        } catch (error) {
            console.error("Error loading houses:", error);
        }
    };

    const handleHouseChange = (e) => {
        const houseId = e.target.value;
        const house = houses.find(h => h.id === parseInt(houseId));
        
        setRecordForm(prev => ({
            ...prev,
            house_id: houseId,
            resident_id: house?.active_resident?.id || '',
            resident_name: house?.active_resident?.name || 'Tidak ada penghuni aktif'
        }));
    };

    const handleMonthCheckboxChange = (monthVal) => {
        if (selectedMonths.includes(monthVal)) {
            setSelectedMonths(prev => prev.filter(m => m !== monthVal));
        } else {
            setSelectedMonths(prev => [...prev, monthVal]);
        }
    };

    const handleSelectAllMonths = () => {
        if (selectedMonths.length === 12) {
            setSelectedMonths([]); // deselect all
        } else {
            setSelectedMonths(range(1, 12)); // select all
        }
    };

    const range = (start, end) => {
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        
        if (!recordForm.house_id || !recordForm.resident_id) {
            alert("Harap pilih rumah dengan penghuni aktif.");
            return;
        }

        if (selectedMonths.length === 0) {
            alert("Harap pilih minimal satu bulan pembayaran.");
            return;
        }

        try {
            await createPayment({
                house_id: recordForm.house_id,
                resident_id: recordForm.resident_id,
                type: recordForm.type,
                months: selectedMonths,
                year: recordForm.year,
                payment_date: recordForm.payment_date
            });

            setIsRecordOpen(false);
            setSelectedMonths([]);
            
            // Refresh matrix and history
            loadBillingMatrix();
        } catch (error) {
            console.error("Error recording payment:", error);
            alert("Gagal mencatat pembayaran.");
        }
    };

    const formatIDR = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Manajemen Iuran Warga</h1>
                <p className="text-slate-500 text-sm mt-1">Kelola catatan iuran perumahan.</p>
            </div>

            {/* ==== FORM: Penerimaan Iuran — di atas tabel ==== */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Form header */}
                <div className="p-4 border-b border-slate-100 bg-indigo-600 flex items-center gap-2">
                    <Plus size={16} className="text-white" />
                    <h3 className="text-sm font-bold text-white">Penerimaan Iuran Warga</h3>
                </div>

                <form onSubmit={handleSubmitPayment} className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Rumah */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Rumah</label>
                            <select
                                required
                                value={recordForm.house_id}
                                onChange={handleHouseChange}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                            >
                                <option value="">-- Pilih --</option>
                                {houses.map(h => (
                                    <option key={h.id} value={h.id}>{h.house_code}</option>
                                ))}
                            </select>
                        </div>

                        {/* Jenis Iuran */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Jenis Iuran</label>
                            <select
                                value={recordForm.type}
                                onChange={(e) => setRecordForm(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 bg-white"
                            >
                                {iuranTypes.map(t => (
                                    <option key={t.key} value={t.key}>
                                        {t.label} ({new Intl.NumberFormat('id-ID', { notation:'compact' }).format(t.amount)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Penghuni */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Penghuni</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    readOnly
                                    value={recordForm.resident_name}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Tahun & Tanggal */}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tahun</label>
                                <input
                                    type="number"
                                    required
                                    value={recordForm.year}
                                    onChange={(e) => setRecordForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tgl Bayar</label>
                                <input
                                    type="date"
                                    required
                                    value={recordForm.payment_date}
                                    onChange={(e) => setRecordForm(prev => ({ ...prev, payment_date: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pilih Bulan */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase">Pilih Bulan</label>
                            <button type="button" onClick={handleSelectAllMonths} className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                                {selectedMonths.length === 12 ? 'Hapus Semua' : 'Pilih Semua'}
                            </button>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                            {monthsList.map(m => {
                                const checked = selectedMonths.includes(m.val);
                                return (
                                    <label key={m.val} className={`flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer text-[10px] font-semibold transition select-none ${
                                        checked
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                                    }`}>
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => handleMonthCheckboxChange(m.val)}
                                            className="hidden"
                                        />
                                        {m.name.substring(0,3)}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-2"
                        >
                            <Plus size={15} /> Simpan Transaksi
                        </button>
                    </div>
                </form>

                {/* ---- Manajemen Jenis Iuran ---- */}
                <div className="border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowAddType(p => !p)}
                        className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                    >
                        <span>⚙️ Kelola Jenis Iuran ({iuranTypes.length} kategori aktif)</span>
                        <ChevronDown size={14} className={`transition-transform ${showAddType ? 'rotate-180' : ''}`} />
                    </button>

                    {showAddType && (
                        <div className="px-5 pb-5 space-y-3">
                            {/* Daftar jenis aktif */}
                            <div className="space-y-1.5">
                                {iuranTypes.map(t => (
                                    <div key={t.key} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                                            <span className="ml-2 text-xs text-slate-400">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(t.amount)} / bulan
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteIuranType(t.key)}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Hapus jenis iuran"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Form tambah baru */}
                            <div className="flex items-end gap-2 pt-2 border-t border-slate-100">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Jenis Iuran</label>
                                    <input
                                        type="text"
                                        placeholder="cth: Keamanan"
                                        value={newTypeLabel}
                                        onChange={(e) => setNewTypeLabel(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 text-slate-800"
                                    />
                                </div>
                                <div className="w-36">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nominal (Rp)</label>
                                    <input
                                        type="number"
                                        placeholder="50000"
                                        value={newTypeAmount}
                                        onChange={(e) => setNewTypeAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 text-slate-800"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddIuranType}
                                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center gap-1 whitespace-nowrap"
                                >
                                    <Plus size={13} /> Tambah
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* ==== Informasi Pembayaran \u2014 full width, di bawah form ==== */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header dengan filter + search */}
                <div className="p-5 border-b border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-800">
                            Informasi Pembayaran
                            <span className="ml-2 text-indigo-600 font-semibold">
                                — {monthsList.find(m => m.val === selectedMonth)?.name} {selectedYear}
                            </span>
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Bulan */}
                            <div className="flex flex-col">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Bulan</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-400 text-slate-700"
                                >
                                    {monthsList.map(m => (
                                        <option key={m.val} value={m.val}>{m.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Tahun */}
                            <div className="flex flex-col">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Tahun</label>
                                <input
                                    type="number"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 text-slate-700 w-20"
                                />
                            </div>
                            {/* Search */}
                            <div className="flex flex-col">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Cari</label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                                    <input
                                        type="text"
                                        placeholder="Rumah / nama..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 text-slate-700 w-36"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-500 border-collapse">
                            <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3">Rumah</th>
                                    <th className="px-4 py-3">Nama Penghuni</th>
                                    <th className="px-4 py-3 text-center">Informasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {billingData
                                    .filter(row => {
                                        const q = searchQuery.toLowerCase();
                                        return (
                                            row.house_code?.toLowerCase().includes(q) ||
                                            row.resident_name?.toLowerCase().includes(q)
                                        );
                                    })
                                    .map(row => (
                                    <tr key={row.house_id} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.house_code}</td>
                                        <td className="px-4 py-3 text-xs">
                                            {row.resident_name ? (
                                                <span>{row.resident_name}</span>
                                            ) : (
                                                <span className="text-slate-400 italic">Kosong</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => setDetailRow(row)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                                            >
                                                <Info size={12} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


            {/* Detail Payment Status Modal */}
            {detailRow && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Detail Iuran — Rumah {detailRow.house_code}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {monthsList.find(m => m.val === selectedMonth)?.name} {selectedYear}
                                </p>
                            </div>
                            <button
                                onClick={() => setDetailRow(null)}
                                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        {/* Penghuni Info */}
                        <div className="px-5 pt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Penghuni</p>
                            <p className="text-sm font-semibold text-slate-800">
                                {detailRow.resident_name || <span className="italic text-slate-400">Tidak ada penghuni</span>}
                            </p>
                        </div>

                        {/* Status Cards */}
                        <div className="p-5 space-y-3">
                            {/* Kebersihan / Sampah */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${
                                !detailRow.should_pay
                                    ? 'bg-slate-50 border-slate-100'
                                    : detailRow.kebersihan_lunas
                                        ? 'bg-emerald-50 border-emerald-100'
                                        : 'bg-red-50 border-red-100'
                            }`}>
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">🧹 Iuran Sampah</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Rp 15.000 / bulan</p>
                                </div>
                                {!detailRow.should_pay ? (
                                    <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200">N/A</span>
                                ) : detailRow.kebersihan_lunas ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                                        <CheckCircle size={12} /> Lunas
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                                        <XCircle size={12} /> Belum
                                    </span>
                                )}
                            </div>

                            {/* Satpam */}
                            <div className={`flex items-center justify-between p-4 rounded-xl border ${
                                !detailRow.should_pay
                                    ? 'bg-slate-50 border-slate-100'
                                    : detailRow.satpam_lunas
                                        ? 'bg-emerald-50 border-emerald-100'
                                        : 'bg-red-50 border-red-100'
                            }`}>
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">🛡️ Iuran Satpam</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Rp 100.000 / bulan</p>
                                </div>
                                {!detailRow.should_pay ? (
                                    <span className="text-[10px] font-semibold text-slate-400 bg-white px-2 py-1 rounded-lg border border-slate-200">N/A</span>
                                ) : detailRow.satpam_lunas ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                                        <CheckCircle size={12} /> Lunas
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
                                        <XCircle size={12} /> Belum
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="px-5 pb-5">
                            <button
                                onClick={() => setDetailRow(null)}
                                className="w-full py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
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
