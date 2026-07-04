import React, { useState, useEffect } from 'react';
import { 
    getExpenses, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    getPayments,
    deletePayment,
    getBillingStatus
} from '../services/api';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    TrendingDown, 
    TrendingUp, 
    DollarSign, 
    Calendar,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Home
} from 'lucide-react';

export default function Expenses() {
    const [transactions, setTransactions] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [billingData, setBillingData] = useState([]);

    // Filter states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Expense Form Modal states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });

    const monthsList = [
        { val: 1, name: 'Januari' }, { val: 2, name: 'Februari' }, { val: 3, name: 'Maret' },
        { val: 4, name: 'April' }, { val: 5, name: 'Mei' }, { val: 6, name: 'Juni' },
        { val: 7, name: 'Juli' }, { val: 8, name: 'Agustus' }, { val: 9, name: 'September' },
        { val: 10, name: 'Oktober' }, { val: 11, name: 'November' }, { val: 12, name: 'Desember' }
    ];

    useEffect(() => {
        loadTransactionsList();
        loadBillingData();
    }, [selectedMonth, selectedYear]);

    const loadTransactionsList = async () => {
        setLoadingTransactions(true);
        try {
            const [paymentsRes, expensesRes] = await Promise.all([
                getPayments(),
                getExpenses()
            ]);
            
            const monthsIndo = [
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
            ];
            
            const paymentItems = paymentsRes.data.map(p => ({
                id: `payment_${p.id}`,
                originalId: p.id,
                isIncome: true,
                description: `Pemasukan - Iuran ${p.type.toUpperCase()} (Rumah ${p.house?.house_code || '-'}, Periode ${monthsIndo[p.month - 1]} ${p.year})`,
                amount: p.amount,
                date: p.payment_date,
                month: p.month,
                year: p.year,
                house_code: p.house?.house_code || '-'
            }));
            
            const expenseItems = expensesRes.data.map(e => ({
                id: `expense_${e.id}`,
                originalId: e.id,
                isIncome: false,
                description: `Pengeluaran - ${e.description}`,
                amount: e.amount,
                date: e.date,
                month: e.date ? parseInt(e.date.split('-')[1]) : new Date().getMonth() + 1,
                year: e.date ? parseInt(e.date.split('-')[0]) : new Date().getFullYear()
            }));
            
            const combined = [...paymentItems, ...expenseItems].sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            setTransactions(combined);
        } catch (error) {
            console.error("Error loading transactions:", error);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const loadBillingData = async () => {
        try {
            const res = await getBillingStatus(selectedMonth, selectedYear);
            setBillingData(res.data);
        } catch (error) {
            console.error("Error loading billing status:", error);
        }
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
        });
        setIsFormOpen(true);
    };

    const openEditModal = (expense) => {
        setEditingId(expense.id);
        setFormData({
            description: expense.description,
            amount: expense.amount,
            date: new Date(expense.date).toISOString().split('T')[0]
        });
        setIsFormOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateExpense(editingId, formData);
            } else {
                await createExpense(formData);
            }
            setIsFormOpen(false);
            loadTransactionsList();
            loadBillingData();
        } catch (error) {
            console.error("Error saving expense:", error);
            alert("Gagal menyimpan pengeluaran.");
        }
    };

    const handleDelete = async (item) => {
        const isIncome = item.isIncome;
        const msg = isIncome 
            ? "Apakah Anda yakin ingin menghapus catatan pemasukan iuran ini?" 
            : "Apakah Anda yakin ingin menghapus catatan pengeluaran ini?";
        if (!confirm(msg)) return;
        
        try {
            const targetId = item.originalId || item.id;
            if (isIncome) {
                await deletePayment(targetId);
            } else {
                await deleteExpense(targetId);
            }
            loadTransactionsList();
            loadBillingData();
        } catch (error) {
            console.error("Error deleting transaction:", error);
            alert("Gagal menghapus catatan.");
        }
    };

    const formatIDR = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    // Client-side filtering logic based on selectedMonth and selectedYear
    const filteredTransactions = transactions.filter(t => {
        return t.month === selectedMonth && t.year === selectedYear;
    });

    // Client-side summaries computed on the fly
    const totalIncome = filteredTransactions
        .filter(t => t.isIncome)
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const totalExpense = filteredTransactions
        .filter(t => !t.isIncome)
        .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

    const netBalance = totalIncome - totalExpense;

    // Load active iuran categories from localStorage
    const iuranTypes = (() => {
        try {
            const saved = localStorage.getItem('rt_iuran_types');
            return saved ? JSON.parse(saved) : [
                { key: 'kebersihan', label: 'Kebersihan', amount: 15000 },
                { key: 'satpam',     label: 'Satpam',     amount: 100000 },
            ];
        } catch {
            return [
                { key: 'kebersihan', label: 'Kebersihan', amount: 15000 },
                { key: 'satpam',     label: 'Satpam',     amount: 100000 },
            ];
        }
    })();

    // A house is fully paid if:
    // 1. row.should_pay is true (occupied house)
    // 2. They have paid all categories in iuranTypes
    const uniquePaidHouses = billingData
        .filter(row => {
            if (!row.should_pay) return false;
            return iuranTypes.every(type => 
                row.payments?.some(p => p.type === type.key)
            );
        })
        .map(row => row.house_code)
        .sort();

    const totalPaidHouses = uniquePaidHouses.length;

    const selectedMonthName = monthsList.find(m => m.val === selectedMonth)?.name || '';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">
                        Report Pemasukan & Pengeluaran RT <span className="text-indigo-600 font-semibold">— {selectedMonthName} {selectedYear}</span>
                    </h1>
                    <p className="text-xs text-slate-500">Kelola pengeluaran bulanan dan pantau laporan kas masuk & keluar warga.</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition self-start sm:self-auto shadow-lg shadow-indigo-600/10"
                >
                    <Plus size={14} /> Catat Pengeluaran
                </button>
            </div>

            {/* Selectors and Monthly Label in one box, matching reference image */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide flex flex-wrap items-center gap-2">
                        Filter Riwayat Transaksi
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-800">
                            {totalPaidHouses} Rumah Lunas Semua Iuran
                        </span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                        Menampilkan data untuk periode <span className="font-semibold text-slate-600">{selectedMonthName} {selectedYear}</span>
                        {totalPaidHouses > 0 && (
                            <span className="ml-2 text-slate-500 font-normal">
                                (Daftar Lunas: {uniquePaidHouses.join(', ')})
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bulan</label>
                        <select 
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 text-slate-800 font-medium"
                        >
                            {monthsList.map(m => (
                                <option key={m.val} value={m.val}>{m.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tahun</label>
                        <input 
                            type="number" 
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 w-24 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Metrics cards for the filtered month */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Month Income */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Total Pemasukan</p>
                        <h3 className="text-lg font-extrabold text-slate-800">{formatIDR(totalIncome)}</h3>
                    </div>
                </div>

                {/* Month Expense */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Total Pengeluaran</p>
                        <h3 className="text-lg font-extrabold text-slate-800">{formatIDR(totalExpense)}</h3>
                    </div>
                </div>

                {/* Net Balance */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                        netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                    }`}>
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-400">Selisih Kas Netto</p>
                        <h3 className={`text-lg font-extrabold ${
                            netBalance >= 0 ? 'text-indigo-600' : 'text-red-600'
                        }`}>
                            {formatIDR(netBalance)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Unified Transaction CRUD List (Filtered log) */}
            {loadingTransactions ? (
                <div className="flex items-center justify-center min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-500">
                            <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Keterangan Transaksi</th>
                                    <th className="px-6 py-4 text-center">Tipe</th>
                                    <th className="px-6 py-4">Nominal</th>
                                    <th className="px-6 py-4">Tanggal Transaksi</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                                            Belum ada catatan transaksi masuk atau keluar untuk periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredTransactions.map(item => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-semibold text-slate-800">{item.description}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg ${
                                                    item.isIncome 
                                                        ? 'bg-emerald-100 text-emerald-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {item.isIncome ? 'Pemasukan' : 'Pengeluaran'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 font-mono font-bold ${
                                                item.isIncome ? 'text-emerald-600' : 'text-red-600'
                                            }`}>
                                                {item.isIncome ? '+' : '-'}{formatIDR(item.amount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                {new Date(item.date).toLocaleDateString('id-ID', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {!item.isIncome && (
                                                        <button 
                                                            onClick={() => openEditModal({
                                                                id: item.originalId,
                                                                description: item.description.replace('Pengeluaran - ', ''),
                                                                amount: item.amount,
                                                                date: item.date
                                                            })}
                                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                                                            title="Edit Pengeluaran"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(item)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                                                        title={item.isIncome ? 'Hapus Pemasukan' : 'Hapus Pengeluaran'}
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

            {/* Expense Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-800">
                                {editingId ? 'Edit Catatan Pengeluaran' : 'Catat Pengeluaran Baru'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Keterangan</label>
                                <input 
                                    type="text" 
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: Perbaikan Pipa Got"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nominal (Rupiah)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-xs font-bold font-mono">Rp</span>
                                    <input 
                                        type="number" 
                                        required
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        placeholder="Contoh: 150000"
                                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800 font-mono font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tanggal Pengeluaran</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                    <input 
                                        type="date" 
                                        required
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
