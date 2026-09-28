import React from 'react';
import { BrandWordmark } from '../common/BrandWordmark';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Users,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

export type AdminView =
  | 'dashboard'
  | 'orders'
  | 'couriers'
  | 'customers'
  | 'pricing'
  | 'financials'
  | 'settings';

interface AdminSidebarProps {
  currentView: AdminView;
  onSelectView: (view: AdminView) => void;
  adminUsername: string;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentView,
  onSelectView,
  adminUsername,
  onLogout,
  onCloseMobile,
}) => {
  const navItems: { id: AdminView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dasbor Utama', icon: LayoutDashboard },
    { id: 'orders', label: 'Kelola Pesanan', icon: ShoppingBag },
    { id: 'couriers', label: 'Kelola Kurir', icon: Truck },
    { id: 'customers', label: 'Data Pelanggan', icon: Users },
    { id: 'pricing', label: 'Tarif & Promo', icon: Tag },
    { id: 'financials', label: 'Laporan Keuangan', icon: BarChart3 },
    { id: 'settings', label: 'Pengaturan Sistem', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#254117] text-white flex flex-col justify-between shrink-0 h-full border-r border-[#254117]/80 shadow-2xl md:shadow-none">
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Brand Wordmark & Optional Mobile Close */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <BrandWordmark size="md" variant="light" />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#cd6184] text-white shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-white/70'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout - Ditarik sampai ke dasar paling bawah */}
      <div className="p-4 border-t border-white/10 bg-black/25 shrink-0 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white leading-tight truncate">
              Pemilik Laundrea
            </span>
            <span className="text-[11px] text-white/60 truncate">@{adminUsername}</span>
          </div>
          <button
            onClick={onLogout}
            title="Keluar dari Admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-[#cd6184] hover:text-white text-white/90 transition-all text-xs font-bold cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
