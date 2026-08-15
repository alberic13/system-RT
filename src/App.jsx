import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Penghuni from './pages/Penghuni';
import Rumah from './pages/Rumah';
import Pembayaran from './pages/Pembayaran';
import Pengeluaran from './pages/Pengeluaran';
import Laporan from './pages/Laporan';
import Erd from './pages/Erd';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/penghuni" element={<Penghuni />} />
            <Route path="/rumah" element={<Rumah />} />
            <Route path="/pembayaran" element={<Pembayaran />} />
            <Route path="/pengeluaran" element={<Pengeluaran />} />
            <Route path="/laporan" element={<Laporan />} />
            <Route path="/erd" element={<Erd />} />
          </Routes>
        </main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} System-RT Perumahan Zalde</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sistem Pembayaran & Administrasi Terintegrasi
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
