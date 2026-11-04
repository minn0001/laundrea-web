import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';
import { CascadingAddressSelector } from '../common/CascadingAddressSelector';
import { StructuredAddressData } from '../../services/wilayahService';
import { useLang } from '../../i18n/LanguageContext';
import {
  Sparkles,
  Truck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  Package,
  ChevronRight,
  Shirt,
  Zap,
  Sparkle,
  User,
  X,
  Building2,
  Leaf,
} from 'lucide-react';

interface CustomerHomePageProps {
  onOrderClick: (planId?: PlanType) => void;
  onGoToOrders: () => void;
  onGoToHistory?: () => void;
  onGoToLoyalty: () => void;
  onGoToProfile: () => void;
  onGoToAddress?: () => void;
  onGoToPeduli?: () => void;
}

export const CustomerHomePage: React.FC<CustomerHomePageProps> = ({
  onOrderClick,
  onGoToOrders,
  onGoToHistory,
  onGoToLoyalty,
  onGoToProfile,
  onGoToAddress,
  onGoToPeduli,
}) => {
  const { lang, t } = useLang();
  const {
    isCustomerVerified,
    customerPhone,
    customerName,
    customerAddress,
    stampsCount,
    orders,
    activeCustomerOrderId,
    updateCustomerProfile,
    recycleSettings,
    impactStats,
  } = useApp();

  const filledStamps = Math.min(Math.max(0, stampsCount), 10);

  const userName = customerName || 'Pelanggan';
  const userAddress = customerAddress || t('home.no_address');
  // Popup ubah alamat (langsung di Beranda)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [tempStructuredAddress, setTempStructuredAddress] = useState<StructuredAddressData | undefined>(undefined);
  const [tempNotes, setTempNotes] = useState('');

  const openAddressModal = () => {
    setTempAddress(customerAddress || '');
    setTempNotes(
      localStorage.getItem(`laundrea_cust_address_notes_${customerPhone}`) ||
        'Pagar hitam, sebelah mini market'
    );
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAddress.trim()) return;
    localStorage.setItem(`laundrea_cust_address_notes_${customerPhone}`, tempNotes.trim());
    await updateCustomerProfile({
      address: tempAddress.trim(),
      structuredAddress: tempStructuredAddress,
    });
    setIsAddressModalOpen(false);
  };

  // Filter customer-specific orders
  const myOrders = orders.filter((o) => {
    if (!customerPhone || !isCustomerVerified) return false;
    let cleanOrderPhone = o.customerPhone.replace(/\D/g, '');
    if (cleanOrderPhone.startsWith('62')) cleanOrderPhone = '0' + cleanOrderPhone.slice(2);
    let normCust = customerPhone.replace(/\D/g, '');
    if (normCust.startsWith('62')) normCust = '0' + normCust.slice(2);
    return cleanOrderPhone === normCust;
  });

  // Check if there is an active order for this customer
  const activeOrder =
    myOrders.find((o) => o.id === activeCustomerOrderId) ||
    myOrders.find((o) => o.status !== 'delivered') ||
    myOrders[0];

  const hasActiveOrder = isCustomerVerified && activeOrder && activeOrder.status !== 'delivered';

  const services: {
    id: PlanType;
    title: string;
    duration: string;
    price: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
    color: string;
    border: string;
  }[] = [
    {
      id: 'express',
      title: t('service.express.title'),
      duration: t('service.express.duration'),
      price: t('service.express.price'),
      description: t('service.express.desc'),
      badge: t('service.express.badge'),
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50 text-amber-900',
      border: 'border-amber-200',
    },
    {
      id: 'regular',
      title: t('service.regular.title'),
      duration: t('service.regular.duration'),
      price: t('service.regular.price'),
      description: t('service.regular.desc'),
      badge: t('service.regular.badge'),
      icon: <Shirt className="w-5 h-5 text-[#cd6184]" />,
      color: 'bg-[#ffecf2] text-[#cd6184]',
      border: 'border-[#ffecf2]',
    },
    {
      id: 'per_item',
      title: t('service.per_item.title'),
      duration: t('service.per_item.duration'),
      price: t('service.per_item.price'),
      description: t('service.per_item.desc'),
      badge: t('service.per_item.badge'),
      icon: <Sparkle className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-900',
      border: 'border-emerald-200',
    },
  ];

  return (
    <div id="customer-home-page" className="w-full space-y-4">
      {/* Top Greeting & Location Header */}
      <div className={`bg-white p-4 sm:p-5 rounded-3xl border border-[#ffecf2] shadow-xs flex flex-col ${isCustomerVerified ? 'md:flex-row md:items-center md:justify-between' : ''} gap-3 overflow-hidden`}>
        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={onGoToProfile}
              className="w-11 h-11 rounded-full bg-[#ffecf2] border-2 border-[#cd6184]/40 flex items-center justify-center font-black text-[#cd6184] text-sm shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              title={t('header.menu_profile')}
            >
              {isCustomerVerified ? userName.charAt(0).toUpperCase() : 'L'}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-gray-900 leading-tight truncate">
                {isCustomerVerified ? t('home.greeting_user', { name: userName }) : t('home.greeting_guest')}
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                {t('home.subgreeting')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToProfile}
            className="md:hidden p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 cursor-pointer transition-colors text-gray-500 hover:text-[#cd6184] shrink-0"
            title={t('header.menu_profile')}
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Address Chip (Hidden for guests) */}
        {isCustomerVerified && (
          <div className="w-full min-w-0 max-w-full md:w-auto">
            <div
              id="card-customer-address-chip"
              onClick={openAddressModal}
              className="w-full min-w-0 max-w-full md:w-80 flex items-start sm:items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 cursor-pointer transition-colors text-left text-xs box-border overflow-hidden"
              title={t('home.edit_address_title')}
            >
              <div className="w-7 h-7 rounded-xl bg-[#ffecf2] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <MapPin className="w-3.5 h-3.5 text-[#cd6184] shrink-0" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-[10px] text-gray-400 block font-semibold leading-tight mb-0.5">
                  {t('home.pickup_address_label')}
                </span>
                <p className="text-xs font-medium text-gray-800 break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-2 leading-snug">
                  {userAddress}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1 sm:mt-0" />
            </div>
          </div>
        )}
      </div>

      {/* Active Order Card (Hidden for guests) */}
      {isCustomerVerified && hasActiveOrder && (
        <div className="bg-gradient-to-r from-[#254117] to-[#1c3311] rounded-3xl p-4 text-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                {t('home.active_order_badge')}
              </span>
            </div>
            <span className="text-[11px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
              {activeOrder.orderNumber}
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-extrabold text-white">
              Laundrea {activeOrder.planName}
            </p>
            <p className="text-[11px] text-white/80">
              {t('home.active_order_status')} <span className="font-bold text-amber-300 uppercase">{activeOrder.status}</span> • {t('home.active_order_schedule')} {activeOrder.pickupDate} ({activeOrder.pickupTime})
            </p>
          </div>

          <button
            type="button"
            id="btn-home-track-order"
            onClick={onGoToOrders}
            className="w-full py-2 px-3 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>{t('home.active_order_track')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Banner with CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ffecf2] via-white to-[#ffecf2]/60 rounded-3xl p-5 border border-[#ffecf2] shadow-xs space-y-3">
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cd6184] text-white text-[10px] font-bold shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>{t('home.hero_badge')}</span>
          </div>

          <h2 className="text-lg font-black text-gray-900 tracking-tight leading-snug">
            {t('home.hero_title')}
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed">
            {t('home.hero_desc')}
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              id="btn-home-order-cta"
              onClick={() => onOrderClick()}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-[#cd6184]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{t('home.hero_cta_order')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onGoToHistory || onGoToOrders}
              className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 text-[#254117] font-bold text-xs border border-gray-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#cd6184]" />
              <span>{isCustomerVerified ? t('home.hero_cta_history_count', { count: myOrders.length }) : t('home.hero_cta_history')}</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#ffecf2]/80 pointer-events-none blur-xl" />
      </div>

      {/* Services Selection Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-black text-gray-900">{t('home.services_title')}</h3>
          <p className="text-[11px] text-gray-500">{t('home.services_desc')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl p-3.5 border border-gray-200/80 hover:border-[#cd6184]/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-2.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${svc.color}`}>
                      {svc.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-[#cd6184] transition-colors">
                        {svc.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500">
                        <Clock className="w-3 h-3 text-[#97a273]" />
                        <span>{svc.duration}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${svc.border} ${svc.color}`}>
                    {svc.badge}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {svc.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold leading-none">{t('home.starting_from')}</span>
                  <span className="text-xs font-black text-gray-900 mt-0.5 block">{svc.price}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onOrderClick(svc.id)}
                  className="py-1.5 px-3 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {t('home.order_btn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty Stamp Teaser (Hidden for guests) & 3-Step Simple How It Works in 2-column grid */}
      <div className={`grid grid-cols-1 ${isCustomerVerified ? 'md:grid-cols-2' : ''} gap-4`}>
        {/* Loyalty Stamp Teaser */}
        {isCustomerVerified && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ffecf2] shadow-xs space-y-3 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900">{t('home.stamps_card_title')}</h4>
                  <span className="text-[11px] font-black text-[#cd6184] bg-[#ffecf2] px-2 py-0.5 rounded-md">
                    {t('home.stamps_card_count', { count: filledStamps })}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                  {t('home.stamps_card_desc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onGoToLoyalty}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-[#cd6184] bg-[#ffecf2] hover:bg-[#ffecf2]/80 transition-colors cursor-pointer text-center"
            >
              {t('home.stamps_card_cta')}
            </button>
          </div>
        )}

        {/* 3-Step Simple How It Works */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <h3 className="text-xs font-black text-gray-900 text-center uppercase tracking-wider text-[#cd6184]">
            {t('home.how_title')}
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-gray-50 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#cd6184] text-white flex items-center justify-center font-black text-xs mx-auto shadow-xs">
                1
              </div>
              <h4 className="font-bold text-[11px] text-gray-900">{t('home.how_step1_title')}</h4>
              <p className="text-[9px] text-gray-500 leading-tight">{t('home.how_step1_desc')}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#97a273] text-white flex items-center justify-center font-black text-xs mx-auto shadow-xs">
                2
              </div>
              <h4 className="font-bold text-[11px] text-gray-900">{t('home.how_step2_title')}</h4>
              <p className="text-[9px] text-gray-500 leading-tight">{t('home.how_step2_desc')}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#254117] text-[#ffbd59] flex items-center justify-center font-black text-xs mx-auto shadow-xs">
                3
              </div>
              <h4 className="font-bold text-[11px] text-gray-900">{t('home.how_step3_title')}</h4>
              <p className="text-[9px] text-gray-500 leading-tight">{t('home.how_step3_desc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Laundrea Peduli Full-Width Card */}
      {(() => {
        const customerContributedKg = myOrders
          .filter((o) => o.recycle?.status === 'verified')
          .reduce(
            (sum, o) => sum + (o.recycle?.actualKg || o.recycle?.estimatedKg || 0),
            0
          );

        const recycleKeyNumber =
          customerContributedKg > 0
            ? t('home.peduli_user_contrib', { kg: customerContributedKg })
            : impactStats &&
              typeof impactStats.totalKg === 'number' &&
              impactStats.totalKg > 0
            ? t('home.peduli_impact_collected', { kg: impactStats.totalKg })
            : null;

        const isProgramActive = recycleSettings?.programActive !== false;

        return (
          <div className="bg-[#254117] text-white rounded-2xl p-4 sm:p-5 border border-[#254117] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Leaf className="w-5 h-5 fill-emerald-400" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white tracking-tight">{t('home.peduli_title')}</h4>
                  {!isProgramActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300">
                      {t('home.peduli_paused_badge')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/80 leading-snug">
                  {isProgramActive
                    ? t('home.peduli_desc_active')
                    : t('home.peduli_desc_paused')}
                </p>
                {recycleKeyNumber && (
                  <p className="text-[11px] font-bold text-[#ffbd59] pt-0.5">
                    {recycleKeyNumber}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onGoToPeduli}
              className="self-start sm:self-center py-2 px-4 rounded-xl text-xs font-bold text-[#254117] bg-[#ffbd59] hover:bg-[#e6a84d] transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5 active:scale-98"
            >
              <span>{t('home.peduli_cta')}</span>
              <span>→</span>
            </button>
          </div>
        );
      })()}

      {/* Quality Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#97a273] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#254117] block">{t('home.guarantee1_title')}</span>
            <span className="text-[#254117]/60 text-[10px]">{t('home.guarantee1_desc')}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#ffbd59] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#254117] block">{t('home.guarantee2_title')}</span>
            <span className="text-[#254117]/60 text-[10px]">{t('home.guarantee2_desc')}</span>
          </div>
        </div>
      </div>

      {/* MODAL: Ubah Alamat */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">{t('home.addr_modal_title')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <CascadingAddressSelector
                initialCombinedAddress={tempAddress}
                onChange={({ combinedAddress, structured }) => {
                  setTempAddress(combinedAddress);
                  setTempStructuredAddress(structured);
                }}
                required
                idPrefix="home-modal-addr"
              />

              <div>
                <label className="block font-bold text-[#254117] mb-1">
                  {t('home.addr_notes_label')}
                </label>
                <input
                  type="text"
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  placeholder={t('home.addr_notes_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
                >
                  {t('home.addr_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
