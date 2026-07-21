import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard';
import Residents from './components/Residents';
import Houses from './components/Houses';
import Payments from './components/Payments';
import Expenses from './components/Expenses';
import { 
    LayoutDashboard, 
    Users, 
    Home, 
    CreditCard, 
    FileSpreadsheet,
    Building,
    Menu,
    X
} from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigationItems = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'residents', name: 'Warga / Penghuni', icon: Users },
        { id: 'houses', name: 'Unit Rumah', icon: Home },
        { id: 'payments', name: 'Iuran Bulanan', icon: CreditCard },
        { id: 'expenses', name: 'Report Pemasukan & Pengeluaran', icon: FileSpreadsheet },
    ];

    const renderActiveComponent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'residents':
                return <Residents />;
            case 'houses':
                return <Houses />;
            case 'payments':
                return <Payments />;
            case 'expenses':
                return <Expenses />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar backdrop overlay (mobile only) */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden transition-opacity duration-300"
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
                isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                {/* Branding header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-600 rounded-xl text-white">
                            <Building size={20} />
                        </div>
                        <div>
                            <h1 className="font-extrabold text-white text-base tracking-wide">Aplikasi Admin RT</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Perumahan zalde</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg lg:hidden"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {navigationItems.map(item => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                                        : 'hover:bg-slate-800/50 hover:text-white'
                                }`}
                            >
                                <Icon size={18} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-slate-800 text-center text-xs text-slate-600">
                    <p className="font-semibold text-slate-500">RT-Admin Panel</p>
                    <p className="mt-0.5 text-[10px]">zalde</p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 shrink-0">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
                        >
                            <Menu size={20} />
                        </button>
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-semibold text-slate-400">Database MySQL Connected</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                            Admin RT
                        </span>
                    </div>
                </header>

                {/* Scrollable page body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {renderActiveComponent()}
                </div>
            </main>
        </div>
    );
}

// Mount the App component
const rootElement = document.getElementById('root');
if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
}

export default App;
