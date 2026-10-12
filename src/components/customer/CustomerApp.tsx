import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType, AppNotification } from '../../types';
import { CustomerHomePage } from './CustomerHomePage';
import { CustomerOrderPage } from './CustomerOrderPage';
import { CustomerTrackingPage } from './CustomerTrackingPage';
import { CustomerLoyaltyPage } from './CustomerLoyaltyPage';
import { CustomerProfilePage } from './CustomerProfilePage';
import { CustomerHistoryPage } from './CustomerHistoryPage';
import { CustomerLoginPortal } from '../auth/CustomerLoginPortal';
import { NotificationBell } from '../common/NotificationBell';
import { BrandWordmark } from '../common/BrandWordmark';
import {
  Home,
  Package,
  Award,
  User,
  LogOut,
  Clock,
  Sparkles,
  ChevronRight,
  CreditCard,
  X,
  Bell,
  AlertCircle,
} from 'lucide-react';

export const CustomerApp: React.FC = () => {
  const {
    isCustomerVerified,
    logoutCustomer,
    customerName,
    customerPhone,
    setActiveCustomerOrderId,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    newNotificationToast,
    dismissToast,
    orders,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'beranda' | 'order' | 'history' | 'loyalty' | 'profile' | 'create_order'>('beranda');
  const [selectedPlanForOrder, setSelectedPlanForOrder] = useState<PlanType | undefined>(undefined);
  const [selectedVoucherForOrder, setSelectedVoucherForOrder] = useState<string | undefined>(undefined);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [openAddressModal, setOpenAddressModal] = useState<boolean>(false);

  // Guest authentication modal & pending action return
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const userName = customerName || 'Pelanggan';

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

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
    setIsProfileDropdownOpen(false);
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

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationRead(notif.id);
    if (notif.orderId) {
      setActiveCustomerOrderId(notif.orderId);
    }
    setActiveTab('order');
  };

  // Find if customer has an order awaiting payment
  const awaitingPaymentOrder = isCustomerVerified
    ? orders.find((o) => {
        if (!customerPhone) return false;
        let cleanOrderPhone = o.customerPhone.replace(/\D/g, '');
        if (cleanOrderPhone.startsWith('62')) cleanOrderPhone = '0' + cleanOrderPhone.slice(2);
        let normCust = customerPhone.replace(/\D/g, '');
        if (normCust.startsWith('62')) normCust = '0' + normCust.slice(2);
        return cleanOrderPhone === normCust && o.paymentStatus === 'awaiting_payment';
      })
    : null;

  return (
    <div id="customer-app-container" className="min-h-screen bg-gray-50 flex flex-col w-full relative">
      {/* Toast when new notification arrives while app is open */}
      {newNotificationToast && (
        <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 bg-[#254117] text-white p-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-start gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="w-8 h-8 rounded-xl bg-[#cd6184] flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => {
              handleNotificationClick(newNotificationToast);
              dismissToast();
            }}
          >
            <p className="text-xs font-bold leading-tight">{newNotificationToast.title}</p>
            <p className="text-[11px] text-white/80 line-clamp-2 mt-0.5">
              {newNotificationToast.body}
            </p>
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="p-1 text-white/60 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Customer App Header */}
      <header className="bg-[#254117] text-white p-3.5 sm:p-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandWordmark size="header" showLogo variant="light" />
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Notification Bell: directly to the left of profile icon, logged-in only */}
            {isCustomerVerified && (
              <NotificationBell
                notifications={notifications}
                onNotificationClick={handleNotificationClick}
                onMarkAllRead={markAllNotificationsRead}
              />
            )}

            {/* Profile Icon button */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                id="btn-customer-header-profile"
                type="button"
                onClick={() => {
                  if (!isCustomerVerified) {
                    requireAuth(() => setActiveTab('profile'));
                  } else {
                    setIsProfileDropdownOpen((prev) => !prev);
                  }
                }}
                title={isCustomerVerified ? 'Menu Akun' : 'Masuk ke Akun'}
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

              {/* Profile Dropdown Card (Anchored under the icon, closes when tapping outside) */}
              {isCustomerVerified && isProfileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 z-50 text-[#254117] animate-in fade-in zoom-in-95 duration-150">
                  {/* Top user header */}
                  <div className="p-2.5 rounded-2xl bg-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#ffecf2] border border-[#cd6184]/30 flex items-center justify-center font-black text-sm text-[#cd6184] shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate block max-w-[120px]">
                          {userName}
                        </span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-[#97a273]/20 text-[#254117] shrink-0">
                          Pelanggan
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 font-medium block truncate">
                        {customerPhone}
                      </span>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ffecf2]/50 text-xs font-semibold text-[#254117] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#cd6184]" />
                        <span>Profil & Alamat Saya</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('history');
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ffecf2]/50 text-xs font-semibold text-[#254117] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-[#cd6184]" />
                        <span>Riwayat Pesanan</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveTab('loyalty');
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-[#ffecf2]/50 text-xs font-semibold text-[#254117] flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-[#cd6184]" />
                        <span>Voucher & Poin Loyalitas</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2.5 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Persistent Banner on Beranda and Pesan while order has awaiting_payment */}
      {awaitingPaymentOrder && (activeTab === 'beranda' || activeTab === 'order') && (
        <div className="bg-[#cd6184] text-white px-4 py-2.5 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <CreditCard className="w-4 h-4 shrink-0 text-white animate-pulse" />
              <span className="font-medium">
                Pembayaran menunggu: <strong>Rp {(awaitingPaymentOrder.actualPrice || awaitingPaymentOrder.estimatedPrice).toLocaleString('id-ID')}</strong>, pilih metode pembayaran sekarang.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveCustomerOrderId(awaitingPaymentOrder.id);
                setActiveTab('order');
              }}
              className="py-1 px-3 rounded-lg bg-white text-[#cd6184] hover:bg-rose-50 text-xs font-black self-end sm:self-auto cursor-pointer shadow-xs transition-colors"
            >
              Bayar Sekarang →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 overflow-y-auto">
        {activeTab === 'beranda' && (
          <CustomerHomePage
            onOrderClick={handleStartCreateOrder}
            onGoToOrders={() => requireAuth(() => setActiveTab('order'))}
            onGoToHistory={() => requireAuth(() => setActiveTab('history'))}
            onGoToLoyalty={() => requireAuth(() => setActiveTab('loyalty'))}
            onGoToProfile={() => requireAuth(() => setActiveTab('profile'))}
            onGoToAddress={() =>
            requireAuth(() => {
              setOpenAddressModal(true);
              setActiveTab('profile');
            })
          }
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
            autoOpenAddress={openAddressModal}
            onAddressModalHandled={() => setOpenAddressModal(false)}
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
