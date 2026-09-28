import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar, AdminView } from './AdminSidebar';
import { AdminDashboardHome } from './AdminDashboardHome';
import { AdminOrdersPage } from './AdminOrdersPage';
import { AdminCouriersPage } from './AdminCouriersPage';
import { AdminCustomersPage } from './AdminCustomersPage';
import { AdminPricingPromoPage } from './AdminPricingPromoPage';
import { AdminFinancialReportsPage } from './AdminFinancialReportsPage';
import { AdminSystemSettingsPage } from './AdminSystemSettingsPage';
import { Menu, X } from 'lucide-react';
import { BrandWordmark } from '../common/BrandWordmark';

export const AdminApp: React.FC = () => {
  const { isAdminLoggedIn, adminUsername, loginAdmin, logoutAdmin } = useApp();

  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [selectedOrderIdForDetail, setSelectedOrderIdForDetail] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!isAdminLoggedIn) {
    return <AdminLogin onLogin={loginAdmin} />;
  }

  const handleSelectOrderAndGo = (orderId: string) => {
    setSelectedOrderIdForDetail(orderId);
    setCurrentView('orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Top Header for Admin */}
      <div className="md:hidden bg-[#254117] text-white p-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <BrandWordmark size="header" showLogo variant="light" />
        </div>
        <span className="text-xs font-semibold text-[#ffbd59]">Admin Panel</span>
      </div>

      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Full height to the very bottom edge on both mobile and desktop */}
      <div
        className={`${
          mobileSidebarOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'
        } md:flex md:sticky md:top-0 md:h-screen md:self-stretch md:shrink-0 z-40`}
      >
        <AdminSidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            setMobileSidebarOpen(false);
          }}
          adminUsername={adminUsername}
          onLogout={logoutAdmin}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'dashboard' && (
          <AdminDashboardHome
            onNavigate={setCurrentView}
            onSelectOrder={handleSelectOrderAndGo}
          />
        )}

        {currentView === 'orders' && (
          <AdminOrdersPage initialSelectedOrderId={selectedOrderIdForDetail} />
        )}

        {currentView === 'couriers' && <AdminCouriersPage />}

        {currentView === 'customers' && <AdminCustomersPage />}

        {currentView === 'pricing' && <AdminPricingPromoPage />}

        {currentView === 'financials' && <AdminFinancialReportsPage />}

        {currentView === 'settings' && <AdminSystemSettingsPage />}
      </main>
    </div>
  );
};
