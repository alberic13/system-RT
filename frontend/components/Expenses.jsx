import React, { useState, useEffect } from 'react';
import { 
    getExpenses, 
    createExpense, 
    updateExpense, 
    deleteExpense,
    getMonthlyReport
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
    ArrowDownRight
} from 'lucide-react';

export default function Expenses() {
    const [expenses, setExpenses] = useState([]);
    const [loadingExpenses, setLoadingExpenses] = useState(true);
    
    // View tab toggler: 'expenses' or 'reports'
    const [subTab, setSubTab] = useState('expenses');

    // Report states
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

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
        if (subTab === 'expenses') {
            loadExpensesList();
        } else {
            loadMonthlyReportData();
        }
    }, [subTab, selectedMonth, selectedYear]);

    const loadExpensesList = async () => {
        setLoadingExpenses(true);
        try {
            const res = await getExpenses();
            setExpenses(res.data);
        } catch (error) {
            console.error("Error loading expenses:", error);
        } finally {
            setLoadingExpenses(false);
        }
    };

    const loadMonthlyReportData = async () => {
        setLoadingReport(true);
        try {
            const res = await getMonthlyReport(selectedMonth, selectedYear);
            setReportData(res.data);
        } catch (error) {
            console.error("Error loading report:", error);
        } finally {
            setLoadingReport(false);
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
            loadExpensesList();
        } catch (error) {
            console.error("Error saving expense:", error);
            alert("Gagal menyimpan pengeluaran.");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Apakah Anda yakin ingin menghapus catatan pengeluaran ini?")) return;
        try {
            await deleteExpense(id);
            loadExpensesList();
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Gagal menghapus pengeluaran.");
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Keuangan & Pengeluaran RT</h1>
                    <p className="text-slate-500">Kelola pengeluaran bulanan dan pantau laporan kas pemasukan vs pengeluaran.</p>
                </div>
                {subTab === 'expenses' && (
                    <button 
                        onClick={openAddModal}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition self-start sm:self-auto"
                    >
                        <Plus size={16} /> Catat Pengeluaran
                    </button>
                )}
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setSubTab('expenses')}
                    className={`pb-3 text-sm font-semibold border-b-2 px-4 transition ${
                        subTab === 'expenses' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Pengeluaran RT (CRUD)
                </button>
                <button
                    onClick={() => setSubTab('reports')}
                    className={`pb-3 text-sm font-semibold border-b-2 px-4 transition ${
                        subTab === 'reports' 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    Laporan Bulanan & Buku Kas
                </button>
            </div>

            {/* View Render */}
            {subTab === 'expenses' ? (
                /* Expenses CRUD List */
                loadingExpenses ? (
                    <div className="flex items-center justify-center min-h-[300px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm text-slate-500">
                                <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Keterangan Pengeluaran</th>
                                        <th className="px-6 py-4">Nominal</th>
                                        <th className="px-6 py-4">Tanggal Pengeluaran</th>
                                        <th className="px-6 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {expenses.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-10 text-center text-slate-400">
                                                Belum ada catatan pengeluaran.
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map(exp => (
                                            <tr key={exp.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-semibold text-slate-800">{exp.description}</td>
                                                <td className="px-6 py-4 font-mono font-bold text-red-600">{formatIDR(exp.amount)}</td>
                                                <td className="px-6 py-4">
                                                    {new Date(exp.date).toLocaleDateString('id-ID', {
                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => openEditModal(exp)}
                                                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                                                            title="Edit Pengeluaran"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(exp.id)}
                                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                                                            title="Hapus Pengeluaran"
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
                )
            ) : (
                /* Financial Monthly Report */
                <div className="space-y-6">
                    {/* Selectors */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Bulan</label>
                            <select 
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-indigo-500 text-slate-800"
                            >
                                {monthsList.map(m => (
                                    <option key={m.val} value={m.val}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Tahun</label>
                            <input 
                                type="number" 
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 text-slate-800 w-24"
                            />
                        </div>
                    </div>

                    {loadingReport ? (
                        <div className="flex items-center justify-center min-h-[300px]">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6">
                            {/* Summary cards for this month */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* Month Income */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Total Pemasukan</p>
                                        <h3 className="text-lg font-extrabold text-slate-800">{formatIDR(reportData.total_income)}</h3>
                                    </div>
                                </div>

                                {/* Month Expense */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                        <TrendingDown size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Total Pengeluaran</p>
                                        <h3 className="text-lg font-extrabold text-slate-800">{formatIDR(reportData.total_expense)}</h3>
                                    </div>
                                </div>

                                {/* Net Balance */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
                                    <div className={`p-3 rounded-xl ${
                                        reportData.balance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                        <DollarSign size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400">Selisih Kas Netto</p>
                                        <h3 className={`text-lg font-extrabold ${
                                            reportData.balance >= 0 ? 'text-indigo-600' : 'text-red-600'
                                        }`}>
                                            {formatIDR(reportData.balance)}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Ledger List */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <h3 className="text-base font-bold text-slate-800 mb-4">Laporan Buku Kas Detail</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-500 border-collapse">
                                        <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-3">Tanggal</th>
                                                <th className="px-4 py-3">Tipe</th>
                                                <th className="px-4 py-3">Rumah</th>
                                                <th className="px-4 py-3">Warga</th>
                                                <th className="px-4 py-3">Keterangan</th>
                                                <th className="px-4 py-3 text-right">Nominal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {reportData.ledger.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-4 py-8 text-center text-slate-400">
                                                        Tidak ada aktivitas keuangan di bulan ini.
                                                    </td>
                                                </tr>
                                            ) : (
                                                reportData.ledger.map((item, idx) => {
                                                    const isIncome = item.type.startsWith('Pemasukan');
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/50">
                                                            <td className="px-4 py-3 font-mono font-medium">{new Date(item.date).toLocaleDateString('id-ID')}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                    isIncome 
                                                                        ? 'bg-emerald-50 text-emerald-700' 
                                                                        : 'bg-red-50 text-red-700'
                                                                }`}>
                                                                    {isIncome ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                                    {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 font-semibold">{item.house_code}</td>
                                                            <td className="px-4 py-3 text-xs">{item.resident_name}</td>
                                                            <td className="px-4 py-3 font-medium text-slate-700">{item.description}</td>
                                                            <td className={`px-4 py-3 text-right font-bold font-mono ${
                                                                isIncome ? 'text-emerald-600' : 'text-red-600'
                                                            }`}>
                                                                {isIncome ? '+' : '-'}{formatIDR(item.amount)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : null}
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
