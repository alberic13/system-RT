import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Building2, 
  CreditCard, 
  Receipt, 
  BarChart3, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { StorageService } from '../services/storage';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Penghuni', href: '/penghuni', icon: Users },
  { name: 'Rumah & Riwayat', href: '/rumah', icon: Building2 },
  { name: 'Pembayaran', href: '/pembayaran', icon: CreditCard },
  { name: 'Pengeluaran', href: '/pengeluaran', icon: Receipt },
  { name: 'Laporan', href: '/laporan', icon: BarChart3 },
];

export default function Navbar() {
  const handleResetData = () => {
    if (confirm("Reset ulang seluruh data ke kondisi simulasi awal (20 Rumah, 17 Penghuni, Transaksi Awal)?")) {
      StorageService.resetDatabase();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight block leading-tight">
                  System-RT
                </span>
                <span className="block text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-0.5">
                  Perumahan Zalde
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center justify-center gap-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.name}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Reset Data Button */}
          <div className="flex items-center shrink-0 gap-2">
            <button
              onClick={handleResetData}
              title="Reset Data ke Kondisi Awal"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-all shadow-xs active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Data</span>
            </button>
          </div>
        </div>

        {/* Mobile Scrollbar Navigation */}
        <div className="lg:hidden flex items-center gap-1.5 py-2 overflow-x-auto scroll-smooth border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}
