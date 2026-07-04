import React, { useState, useEffect } from 'react';
import { 
    getDashboardSummary, 
    getDashboardFinanceChart,
    getBillingStatus 
} from '../services/api';
import { 
    Users, 
    Home, 
    TrendingUp, 
    DollarSign, 
    AlertCircle 
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Unpaid list states
    const [unpaidMonth, setUnpaidMonth] = useState(new Date().getMonth() + 1);
    const [unpaidYear, setUnpaidYear] = useState(new Date().getFullYear());
    const [unpaidList, setUnpaidList] = useState([]);
    const [loadingUnpaid, setLoadingUnpaid] = useState(true);

    const monthsList = [
        { val: 1, name: 'Januari' }, { val: 2, name: 'Februari' }, { val: 3, name: 'Maret' },
        { val: 4, name: 'April' }, { val: 5, name: 'Mei' }, { val: 6, name: 'Juni' },
        { val: 7, name: 'Juli' }, { val: 8, name: 'Agustus' }, { val: 9, name: 'September' },
        { val: 10, name: 'Oktober' }, { val: 11, name: 'November' }, { val: 12, name: 'Desember' }
    ];

    // Load active iuran categories from localStorage
    const defaultIuranTypes = [
        { key: 'kebersihan', label: 'Kebersihan', amount: 15000 },
        { key: 'satpam',     label: 'Satpam',     amount: 100000 },
    ];
    const iuranTypes = (() => {
        try {
            const saved = localStorage.getItem('rt_iuran_types');
            return saved ? JSON.parse(saved) : defaultIuranTypes;
        } catch { return defaultIuranTypes; }
    })();

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadUnpaidList();
    }, [unpaidMonth, unpaidYear]);

    const loadData = async () => {
        try {
            const [summaryRes, chartRes] = await Promise.all([
                getDashboardSummary(),
                getDashboardFinanceChart()
            ]);
            setSummary(summaryRes.data);
            setChartData(chartRes.data);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUnpaidList = async () => {
        setLoadingUnpaid(true);
        try {
            const res = await getBillingStatus(unpaidMonth, unpaidYear);
            const list = res.data.filter(row => {
                if (!row.should_pay) return false;
                // Unpaid if any category is not lunas
                return iuranTypes.some(type => !row.payments?.some(p => p.type === type.key));
            }).map(row => {
                const status = {};
                iuranTypes.forEach(type => {
                    status[type.key + '_lunas'] = !!row.payments?.some(p => p.type === type.key);
                });
                return {
                    house_code: row.house_code,
                    resident_name: row.resident_name || 'Tidak ada penghuni',
                    ...status
                };
            });
            setUnpaidList(list);
        } catch (error) {
            console.error("Error loading unpaid list:", error);
        } finally {
            setLoadingUnpaid(false);
        }
    };

    const formatIDR = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

    const unpaidMonthName = monthsList.find(m => m.val === unpaidMonth)?.name || '';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Utama RT</h1>
                <p className="text-slate-500">Informasi ringkasan data kependudukan dan arus keuangan kas warga.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Residents */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Warga</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">{summary?.total_residents}</h3>
                        <p className="text-[10px] text-slate-400">Terdaftar di database</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Users size={24} />
                    </div>
                </div>

                {/* House Occupancy */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Okupansi Rumah</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">
                            {summary?.occupied_houses} <span className="text-sm font-normal text-slate-400">/ {summary?.total_houses}</span>
                        </h3>
                        <p className="text-[10px] text-emerald-500 font-semibold">{summary?.occupancy_rate}% Terisi</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <Home size={24} />
                    </div>
                </div>

                {/* Total Monthly Income */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Iuran Masuk (Bulan Ini)</p>
                        <h3 className="text-2xl font-extrabold text-slate-800">
                            {formatIDR(summary?.monthly_income || 0)}
                        </h3>
                        <p className="text-[10px] text-slate-400">Total iuran terkumpul</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <TrendingUp size={24} />
                    </div>
                </div>

                {/* Total Cash Balance */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sisa Saldo Kas RT</p>
                        <h3 className={`text-2xl font-extrabold ${summary?.net_balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                            {formatIDR(summary?.net_balance || 0)}
                        </h3>
                        <p className="text-[10px] text-slate-400">Akumulasi saldo kas aktif</p>
                    </div>
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <DollarSign size={24} />
                    </div>
                </div>
            </div>

            {/* Financial Trend Bar Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-6">Laporan Grafik Iuran Masuk & Sisa Saldo (1 Tahun Terakhir)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                            />
                            <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                            <Bar dataKey="pemasukan" fill="#6366f1" name="Iuran Masuk" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="saldo" fill="#10b981" name="Sisa Saldo" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Unpaid Houses list with month/year filter */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle size={20} />
                        <h3 className="text-base font-bold text-slate-800 flex flex-wrap items-center gap-2">
                            Tunggakan Iuran
                            <span className="text-indigo-600 font-semibold">— {unpaidMonthName} {unpaidYear}</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                {unpaidList.length} Rumah Belum Lunas
                            </span>
                        </h3>
                    </div>
                    
                    {/* Period filters */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Bulan</label>
                            <select
                                value={unpaidMonth}
                                onChange={(e) => setUnpaidMonth(parseInt(e.target.value))}
                                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-indigo-400 text-slate-700 font-medium"
                            >
                                {monthsList.map(m => (
                                    <option key={m.val} value={m.val}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tahun</label>
                            <input
                                type="number"
                                value={unpaidYear}
                                onChange={(e) => setUnpaidYear(parseInt(e.target.value))}
                                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-400 text-slate-700 w-20 font-medium"
                            />
                        </div>
                    </div>
                </div>

                <p className="text-xs text-slate-500">
                    Daftar rumah dengan status huni aktif yang belum melunasi salah satu atau seluruh iuran bulanan pada periode yang dipilih.
                </p>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500 border-collapse">
                        <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3">No. Rumah</th>
                                <th className="px-4 py-3">Nama Penghuni</th>
                                {iuranTypes.map(t => (
                                    <th key={t.key} className="px-4 py-3 text-center">
                                        {t.label} ({new Intl.NumberFormat('id-ID', { notation:'compact' }).format(t.amount)})
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loadingUnpaid ? (
                                <tr>
                                    <td colSpan={2 + iuranTypes.length} className="px-4 py-10 text-center text-slate-400 text-xs">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : unpaidList.length === 0 ? (
                                <tr>
                                    <td colSpan={2 + iuranTypes.length} className="px-4 py-8 text-center text-slate-400 text-xs italic">
                                        Hebat! Seluruh warga telah melunasi iuran pada periode ini.
                                    </td>
                                </tr>
                            ) : (
                                unpaidList.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.house_code}</td>
                                        <td className="px-4 py-3 text-xs">{row.resident_name}</td>
                                        {iuranTypes.map(t => {
                                            const isLunas = row[t.key + '_lunas'];
                                            return (
                                                <td key={t.key} className="px-4 py-3 text-center">
                                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                                        isLunas 
                                                            ? 'bg-emerald-50 text-emerald-700' 
                                                            : 'bg-red-50 text-red-700'
                                                    }`}>
                                                        {isLunas ? 'Lunas' : 'Belum Lunas'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
