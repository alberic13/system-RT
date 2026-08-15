import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Printer,
  TrendingUp,
  Receipt
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { StorageService } from '../services/storage';

const namaBulanList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function Laporan() {
  const [laporanData, setLaporanData] = useState(null);
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(2026);

  useEffect(() => {
    loadLaporan();
  }, [selectedBulan, selectedTahun]);

  const loadLaporan = () => {
    const lap = StorageService.getLaporan(selectedTahun, selectedBulan);
    setLaporanData(lap);
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const detailBulan = laporanData?.detailBulan;

  return (
    <div className="space-y-8 print:p-0 print:bg-white print:text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm print:border-none print:shadow-none print:bg-transparent">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-sky-600 print:hidden" />
            Laporan Rekapitulasi Keuangan RT
          </h1>
          <p className="text-xs text-slate-500 print:text-gray-600 mt-1">
            Ringkasan Saldo, Pemasukan Iuran Bulanan, dan Detail Pengeluaran Perbulan.
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all shadow-sm active:scale-95"
          >
            <Printer className="w-4 h-4 text-sky-600" /> Cetak / Export Laporan PDF
          </button>
        </div>
      </div>

      {/* Filter Year & Month */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Pilih Bulan Detail:</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
            >
              {namaBulanList.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Tahun:</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none font-semibold"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan Laporan Tahunan & Detail Bulan <span className="font-bold text-sky-700">{namaBulanList[selectedBulan - 1]} {selectedTahun}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Pemasukan Tahunan</span>
          <div className="text-2xl font-extrabold text-sky-600 mt-2">
            {formatRupiah(laporanData?.totalPemasukanTahun)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Pengeluaran Tahunan</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-2">
            {formatRupiah(laporanData?.totalPengeluaranTahun)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Saldo Sisa Akhir Kas RT</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatRupiah(laporanData?.saldoAkhir)}
          </div>
        </div>
      </div>

      {/* 1-Year Financial Chart */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 print:hidden">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-600" />
          Grafik Tren Saldo & Pemasukan 1 Tahun ({selectedTahun})
        </h2>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={laporanData?.monthlySummary || []}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="namaBulan" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                tickFormatter={(v) => `Rp ${(v / 1000).toLocaleString('id-ID')}k`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontSize: '12px',
                }}
                formatter={(val) => [formatRupiah(val), '']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
              <Bar dataKey="pemasukan" name="Pemasukan" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pengeluaran" name="Pengeluaran" fill="#e11d48" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="saldoSisa" name="Saldo Sisa" stroke="#059669" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Table 12 Months */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 print:p-0 print:border-none print:shadow-none">
        <h2 className="text-lg font-bold text-slate-900 print:text-black">
          Tabel Ringkasan Saldo Bulanan (1 Tahun)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 print:text-black">
            <thead className="bg-slate-50 print:bg-gray-100 uppercase font-semibold text-[11px] text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Bulan</th>
                <th className="px-4 py-3 text-right">Pemasukan (Iuran)</th>
                <th className="px-4 py-3 text-right">Pengeluaran</th>
                <th className="px-4 py-3 text-right">Surplus / Defisit</th>
                <th className="px-4 py-3 text-right">Akumulasi Saldo Sisa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-gray-300">
              {(laporanData?.monthlySummary || []).map((m) => (
                <tr
                  key={m.bulanIndex}
                  className={`hover:bg-slate-50 transition-colors ${
                    m.bulanIndex === selectedBulan ? 'bg-sky-50/70 font-semibold' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-bold text-slate-900 print:text-black">
                    {m.namaBulan}
                  </td>
                  <td className="px-4 py-3 text-right text-sky-700 font-semibold">
                    {formatRupiah(m.pemasukan)}
                  </td>
                  <td className="px-4 py-3 text-right text-rose-700 font-semibold">
                    {formatRupiah(m.pengeluaran)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-extrabold ${
                      m.surplusDefisit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {formatRupiah(m.surplusDefisit)}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-slate-900 print:text-black">
                    {formatRupiah(m.saldoSisa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Monthly Report Section */}
      {detailBulan && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 print:text-black flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600 print:hidden" />
              Detail Rincian Pemasukan & Pengeluaran Bulan {detailBulan.namaBulan} {detailBulan.tahun}
            </h2>
            <p className="text-xs text-slate-500 print:text-gray-600 mt-1">
              Surplus/Defisit Bulan Ini: <span className="font-bold text-emerald-700">{formatRupiah(detailBulan.saldoBulan)}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* List Pemasukan Bulan Ini */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                1. Rincian Pemasukan ({detailBulan.listPemasukan.length} Transaksi)
              </h3>

              {detailBulan.listPemasukan.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-slate-400 text-xs border border-slate-200">
                  Tidak ada pemasukan tercatat di bulan ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {detailBulan.listPemasukan.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-900">
                          {p.rumah?.nomor_rumah} — {p.penghuni?.nama_lengkap}
                        </span>
                        <p className="text-[11px] text-slate-500">Iuran {p.jenis_iuran}</p>
                      </div>
                      <span className="font-extrabold text-sky-700">{formatRupiah(p.jumlah)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* List Pengeluaran Bulan Ini */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                2. Rincian Pengeluaran ({detailBulan.listPengeluaran.length} Transaksi)
              </h3>

              {detailBulan.listPengeluaran.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-slate-400 text-xs border border-slate-200">
                  Tidak ada pengeluaran tercatat di bulan ini.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {detailBulan.listPengeluaran.map((e) => (
                    <div
                      key={e.id}
                      className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{e.kategori}</span>
                        <p className="text-[11px] text-slate-500">{e.keterangan}</p>
                      </div>
                      <span className="font-extrabold text-rose-700">{formatRupiah(e.jumlah)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
