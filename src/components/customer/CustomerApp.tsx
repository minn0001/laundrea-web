import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';
import { CustomerHomePage } from './CustomerHomePage';
import { CustomerOrderPage } from './CustomerOrderPage';
import { CustomerTrackingPage } from './CustomerTrackingPage';
import { CustomerLoyaltyPage } from './CustomerLoyaltyPage';
import { CustomerProfilePage } from './CustomerProfilePage';
import { CustomerHistoryPage } from './CustomerHistoryPage';
import { CustomerLoginPortal } from '../auth/CustomerLoginPortal';
import { BrandWordmark } from '../common/BrandWordmark';
import { Home, Package, Award, User, LogOut, Clock } from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const {
    isCustomerVerified,
    logoutCustomer,
    customerName,
    setActiveCustomerOrderId,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'beranda' | 'order' | 'history' | 'loyalty' | 'profile' | 'create_order'>('beranda');
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<PlanType | undefined>(undefined);
  const [selectedVoucherForOrder, setSelectedVoucherForOrder] = useState<string | undefined>(undefined);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // Guest authentication modal & pending action return
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const userName = customerName || 'Pelanggan';

  /**
   * Action guard: if user is not logged in, opens the login modal and saves the intended action
   * so it executes immediately after successful login or registration.
   */
  const requireAuth = (callback: () => void) => {
    if (isCustomerVerified) {
      callback();
    } else {
      setPendingAction(() => callback);
      setIsLoginModalOpen(true);
    }
  };

  const handleStartCreateOrder = (planId?: PlanType, voucherCode?: string) => {
    requireAuth(() => {
      setSelectedPlanForOrder(planId);
      setSelectedVoucherForOrder(voucherCode);
      setActiveTab('create_order');
    });
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveCustomerOrderId(orderId);
    setSelectedVoucherForOrder(undefined);
    setActiveTab('order');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logoutCustomer();
    setActiveTab('beranda');
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    if (pendingAction) {
      const actionToRun = pendingAction;
      setPendingAction(null);
      actionToRun();
    }
  };

  const handleLoginClose = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
  };

  return (
    <div id="customer-app-container" className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Customer App Header */}
      <header className="bg-[#254117] text-white p-3.5 sm:p-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandWordmark size="header" showLogo variant="light" />
          </div>

          <div className="flex items-center gap-2">
            {/* The profile icon at the top right opens the login for guests and the Profil page for logged-in users */}
            <button
              id="btn-customer-header-profile"
              type="button"
              onClick={() => {
                if (!isCustomerVerified) {
                  requireAuth(() => setActiveTab('profile'));
                } else {
                  setActiveTab('profile');
                }
              }}
              title={isCustomerVerified ? 'Profil Saya' : 'Masuk ke Akun'}
              className="w-9 h-9 rounded-full border border-white/20 bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer shadow-xs text-white"
            >
              {isCustomerVerified ? (
                <span className="font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="w-4.5 h-4.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 overflow-y-auto">
        {activeTab === 'beranda' && (
          <CustomerHomePage
            onOrderClick={handleStartCreateOrder}
            onGoToOrders={() => requireAuth(() => setActiveTab('order'))}
            onGoToHistory={() => requireAuth(() => setActiveTab('history'))}
            onGoToLoyalty={() => requireAuth(() => setActiveTab('loyalty'))}
            onGoToProfile={() => requireAuth(() => setActiveTab('profile'))}
          />
        )}
        {activeTab === 'create_order' && (
          <CustomerOrderPage
            onOrderSuccess={handleOrderSuccess}
            onBackToLanding={() => setActiveTab('beranda')}
            initialPlanId={selectedPlanForOrder}
            initialVoucherCode={selectedVoucherForOrder}
          />
        )}
        {activeTab === 'order' && (
          <CustomerTrackingPage onNewOrderClick={() => handleStartCreateOrder()} />
        )}
        {activeTab === 'history' && (
          <CustomerHistoryPage
            onTrackOrder={(orderId) => {
              setActiveCustomerOrderId(orderId);
              setActiveTab('order');
            }}
            onNewOrderClick={(planId) => handleStartCreateOrder(planId)}
          />
        )}
        {activeTab === 'loyalty' && (
          <CustomerLoyaltyPage onOrderNowClick={(code) => handleStartCreateOrder(undefined, code)} />
        )}
        {activeTab === 'profile' && (
          <CustomerProfilePage
            onLogoutClick={() => setShowLogoutConfirm(true)}
            onNavigateTab={(tab) => {
              if (tab === 'tracking' || tab === 'order') {
                setActiveTab('order');
              } else if (tab === 'loyalty') {
                setActiveTab('loyalty');
              }
            }}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 px-3 sm:px-6 py-2 sticky bottom-0 z-30 shadow-xs">
        <div className="max-w-xl mx-auto grid grid-cols-5 gap-1.5 text-center">
          <button
            id="tab-customer-beranda"
            onClick={() => setActiveTab('beranda')}
            className={`py-2 px-0.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'beranda'
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="truncate">Beranda</span>
          </button>

          <button
            id="tab-customer-order"
            onClick={() => requireAuth(() => setActiveTab('order'))}
            className={`py-2 px-0.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'order' || activeTab === 'create_order'
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="truncate">Pesan</span>
          </button>

          <button
            id="tab-customer-history"
            onClick={() => requireAuth(() => setActiveTab('history'))}
            className={`py-2 px-0.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
            title="Riwayat Pesanan"
          >
            <Clock className="w-4 h-4" />
            <span className="truncate">Riwayat</span>
          </button>

          <button
            id="tab-customer-loyalty"
            onClick={() => requireAuth(() => setActiveTab('loyalty'))}
            className={`py-2 px-0.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'loyalty'
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span className="truncate">Poin & Cap</span>
          </button>

          <button
            id="tab-customer-profile"
            onClick={() => requireAuth(() => setActiveTab('profile'))}
            className={`py-2 px-0.5 rounded-2xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <User className="w-4 h-4" />
            <span className="truncate">Profil</span>
          </button>
        </div>
      </nav>

      {/* Login Screen Modal (New Centered Card Design) */}
      {isLoginModalOpen && (
        <CustomerLoginPortal
          onSuccess={handleLoginSuccess}
          onClose={handleLoginClose}
          onNavigateStaff={() => {
            setIsLoginModalOpen(false);
            if (typeof window !== 'undefined') {
              window.history.pushState({}, '', '/staff');
              window.dispatchEvent(new Event('popstate'));
            }
          }}
        />
      )}

      {/* In-App Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#254117]">Keluar dari Akun?</h3>
              <p className="text-xs text-[#254117]/70 mt-1.5 leading-relaxed">
                Anda akan kembali ke halaman utama dan dapat masuk kembali kapan saja dengan nomor WhatsApp Anda.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="btn-confirm-logout-yes"
                onClick={handleConfirmLogout}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#cd6184]/90 shadow-xs transition-all cursor-pointer"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
