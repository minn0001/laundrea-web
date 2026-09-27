import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { role, setRole, resetAllData } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-[#254117] text-white border-b border-[#254117]/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
          <button
            onClick={() => setRole('customer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Pelanggan</span>
          </button>

          <button
            onClick={() => setRole('courier')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              role === 'courier'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Kurir</span>
          </button>

          <button
            onClick={() => setRole('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Kembalikan seluruh data ke kondisi awal?')) {
                resetAllData();
              }
            }}
            title="Reset data"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
