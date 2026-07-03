import React, { useState, useEffect } from 'react';
import { getDashboardSummary, getDashboardFinanceChart } from '../services/api';
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

    useEffect(() => {
        loadData();
    }, []);

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

    const formatIDR = (num) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(num);
    };

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
                <h3 className="text-base font-bold text-slate-800 mb-6">Tren Pemasukan vs Pengeluaran (1 Tahun Terakhir)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month_name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip 
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                            />
                            <Legend verticalAlign="top" height={36} align="right" iconType="circle" />
                            <Bar dataKey="pemasukan" fill="#6366f1" name="Pemasukan" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="pengeluaran" fill="#f43f5e" name="Pengeluaran" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Unpaid Houses list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-2 text-red-600 mb-4">
                    <AlertCircle size={20} />
                    <h3 className="text-base font-bold text-slate-800">Tunggakan Iuran Bulan Ini</h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">Daftar rumah dengan status huni aktif yang belum melunasi salah satu atau kedua iuran bulanan berjalan.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500 border-collapse">
                        <thead className="bg-slate-50 text-xs text-slate-700 uppercase font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-4 py-3">No. Rumah</th>
                                <th className="px-4 py-3">Nama Penghuni</th>
                                <th className="px-4 py-3">Kebersihan (15k)</th>
                                <th className="px-4 py-3">Satpam (100k)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {summary?.unpaid_list?.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-4 py-6 text-center text-slate-400 text-xs">
                                        Hebat! Seluruh warga telah melunasi iuran bulan ini.
                                    </td>
                                </tr>
                            ) : (
                                summary?.unpaid_list?.map((row, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-bold text-slate-800">{row.house_code}</td>
                                        <td className="px-4 py-3">{row.resident_name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                row.kebersihan_lunas 
                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                    : 'bg-red-50 text-red-700'
                                            }`}>
                                                {row.kebersihan_lunas ? 'Lunas' : 'Belum Lunas'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                row.satpam_lunas 
                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                    : 'bg-red-50 text-red-700'
                                            }`}>
                                                {row.satpam_lunas ? 'Lunas' : 'Belum Lunas'}
                                            </span>
                                        </td>
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
