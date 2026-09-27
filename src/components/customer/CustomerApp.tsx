import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';
import { CustomerVerification } from './CustomerVerification';
import { CustomerHomePage } from './CustomerHomePage';
import { CustomerOrderPage } from './CustomerOrderPage';
import { CustomerTrackingPage } from './CustomerTrackingPage';
import { CustomerLandingPage } from './CustomerLandingPage';
import { CustomerLoyaltyPage } from './CustomerLoyaltyPage';
import { CustomerProfilePage } from './CustomerProfilePage';
import { CustomerHistoryPage } from './CustomerHistoryPage';
import { BrandWordmark } from '../common/BrandWordmark';
import { Home, Package, Award, User, Phone, LogOut, Clock } from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const {
    isCustomerVerified,
    verifyCustomer,
    logoutCustomer,
    customerPhone,
    activeCustomerOrderId,
    setActiveCustomerOrderId,
    orders,
  } = useApp();

  const [unverifiedScreen, setUnverifiedScreen] = useState<'landing' | 'verify'>('landing');
  const [activeTab, setActiveTab] = useState<'beranda' | 'order' | 'history' | 'loyalty' | 'profile' | 'create_order'>('beranda');
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<PlanType | undefined>(undefined);
  const [selectedVoucherForOrder, setSelectedVoucherForOrder] = useState<string | undefined>(undefined);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);

  // If not verified yet, display either the landing page or the WhatsApp verification flow
  if (!isCustomerVerified) {
    return (
      <div id="customer-auth-container" className="min-h-screen bg-gray-50 flex justify-center">
        <div className="w-full max-w-md bg-white min-h-screen shadow-md border-x border-gray-100 flex flex-col justify-between">
          {unverifiedScreen === 'landing' ? (
            <CustomerLandingPage
              onGetStarted={() => setUnverifiedScreen('verify')}
              onTrackExisting={() => setUnverifiedScreen('verify')}
              onViewRewards={() => setUnverifiedScreen('verify')}
            />
          ) : (
            <CustomerVerification
              onVerified={(phone) => {
                verifyCustomer(phone);
                setActiveTab('beranda');
              }}
              onBackToLanding={() => setUnverifiedScreen('landing')}
            />
          )}
        </div>
      </div>
    );
  }

  const handleStartCreateOrder = (planId?: PlanType, voucherCode?: string) => {
    setSelectedPlanForOrder(planId);
    setSelectedVoucherForOrder(voucherCode);
    setActiveTab('create_order');
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveCustomerOrderId(orderId);
    setSelectedVoucherForOrder(undefined);
    setActiveTab('order');
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    setUnverifiedScreen('landing');
    logoutCustomer();
  };

  return (
    <div id="customer-app-container" className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Customer App Header */}
      <header className="bg-[#254117] text-white p-3.5 sm:p-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandWordmark size="sm" variant="light" />
            <div className="h-4 w-[1px] bg-white/30" />
            <span className="text-[11px] font-bold text-[#ffbd59] uppercase tracking-wider">
              Portal Pelanggan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 text-white text-xs font-semibold">
              <Phone className="w-3.5 h-3.5 text-[#ffbd59]" />
              <span className="text-[11px] truncate max-w-[120px]">{customerPhone}</span>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              title="Keluar"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 overflow-y-auto">
        {activeTab === 'beranda' && (
          <CustomerHomePage
            onOrderClick={handleStartCreateOrder}
            onGoToOrders={() => setActiveTab('order')}
            onGoToHistory={() => setActiveTab('history')}
            onGoToLoyalty={() => setActiveTab('loyalty')}
            onGoToProfile={() => setActiveTab('profile')}
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
              onClick={() => setActiveTab('order')}
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
              onClick={() => setActiveTab('history')}
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
              onClick={() => setActiveTab('loyalty')}
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
              onClick={() => setActiveTab('profile')}
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

      {/* In-App Logout Confirmation Modal (immune to iframe alert/confirm blocking) */}
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
