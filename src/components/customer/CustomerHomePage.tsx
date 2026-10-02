import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType } from '../../types';
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
} from 'lucide-react';

interface CustomerHomePageProps {
  onOrderClick: (planId?: PlanType) => void;
  onGoToOrders: () => void;
  onGoToHistory?: () => void;
  onGoToLoyalty: () => void;
  onGoToProfile: () => void;
}

export const CustomerHomePage: React.FC<CustomerHomePageProps> = ({
  onOrderClick,
  onGoToOrders,
  onGoToHistory,
  onGoToLoyalty,
  onGoToProfile,
}) => {
  const { customerPhone, stampsCount, orders, activeCustomerOrderId } = useApp();

  const stampsInCycle = stampsCount === 0 ? 0 : ((stampsCount - 1) % 10) + 1;

  const userName = localStorage.getItem('laundrea_cust_name') || 'Yaya';
  const userAddress =
    localStorage.getItem('laundrea_cust_address') ||
    'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan';

  // Check if there is an active order
  const activeOrder =
    orders.find((o) => o.id === activeCustomerOrderId) ||
    orders.find((o) => o.status !== 'delivered') ||
    orders[0];

  const hasActiveOrder = activeOrder && activeOrder.status !== 'delivered';

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
      title: 'Cuci Kilat Express',
      duration: 'Selesai 1 Hari (24 Jam)',
      price: 'Rp 15.000 / kg',
      description: 'Prioritas pengerjaan kilat untuk pakaian harian dan kebutuhan mendesak.',
      badge: 'Paling Populer',
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      color: 'bg-amber-50 text-amber-900',
      border: 'border-amber-200',
    },
    {
      id: 'regular',
      title: 'Cuci Kiloan Reguler',
      duration: 'Selesai 2 Hari',
      price: 'Rp 10.000 / kg',
      description: 'Pilihan hemat untuk pakaian santai keluarga, bersih, higienis & wangi segar.',
      badge: 'Hemat',
      icon: <Shirt className="w-5 h-5 text-[#cd6184]" />,
      color: 'bg-[#ffecf2] text-[#cd6184]',
      border: 'border-[#ffecf2]',
    },
    {
      id: 'per_item',
      title: 'Cuci Satuan Premium',
      duration: 'Selesai 3 Hari',
      price: 'Mulai Rp 25.000 / pcs',
      description: 'Perawatan khusus bedcover tebal, jas, blazer, gaun pesta, sepatu & boneka.',
      badge: 'Perawatan Khusus',
      icon: <Sparkle className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-900',
      border: 'border-emerald-200',
    },
  ];

  return (
    <div id="customer-home-page" className="w-full space-y-4">
      {/* Top Greeting & Location Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#ffecf2] shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 overflow-hidden">
        <div className="flex items-center justify-between md:justify-start gap-3 w-full md:w-auto min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={onGoToProfile}
              className="w-11 h-11 rounded-full bg-[#ffecf2] border-2 border-[#cd6184]/40 flex items-center justify-center font-black text-[#cd6184] text-sm shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
              title="Buka Profil"
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-gray-900 leading-tight truncate">
                Halo, {userName}! 👋
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">
                Mau cuci pakaian apa hari ini?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToProfile}
            className="md:hidden p-2 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 cursor-pointer transition-colors text-gray-500 hover:text-[#cd6184] shrink-0"
            title="Pengaturan Profil"
          >
            <User className="w-4 h-4" />
          </button>
        </div>

        {/* Address Chip */}
        <div className="w-full min-w-0 max-w-full md:w-auto">
          <div
            id="card-customer-address-chip"
            onClick={onGoToProfile}
            className="w-full min-w-0 max-w-full md:w-80 flex items-start sm:items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200/80 cursor-pointer transition-colors text-left text-xs box-border overflow-hidden"
            title="Ubah Alamat di Profil"
          >
            <div className="w-7 h-7 rounded-xl bg-[#ffecf2] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <MapPin className="w-3.5 h-3.5 text-[#cd6184] shrink-0" />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="text-[10px] text-gray-400 block font-semibold leading-tight mb-0.5">
                Alamat Penjemputan:
              </span>
              <p className="text-xs font-medium text-gray-800 break-words [overflow-wrap:anywhere] [word-break:break-word] line-clamp-2 leading-snug">
                {userAddress}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-1 sm:mt-0" />
          </div>
        </div>
      </div>

      {/* Active Order Card (If any order exists and is active) */}
      {hasActiveOrder && (
        <div className="bg-gradient-to-r from-[#254117] to-[#1c3311] rounded-3xl p-4 text-white shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                Pesanan Sedang Diproses
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
              Status: <span className="font-bold text-amber-300 uppercase">{activeOrder.status}</span> • Jadwal: {activeOrder.pickupDate} ({activeOrder.pickupTime})
            </p>
          </div>

          <button
            type="button"
            id="btn-home-track-order"
            onClick={onGoToOrders}
            className="w-full py-2 px-3 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Lacak di Menu Pesan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hero Banner with CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ffecf2] via-white to-[#ffecf2]/60 rounded-3xl p-5 border border-[#ffecf2] shadow-xs space-y-3">
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#cd6184] text-white text-[10px] font-bold shadow-xs">
            <Sparkles className="w-3 h-3" />
            <span>Layanan Laundry Antar Jemput Resmi</span>
          </div>

          <h2 className="text-lg font-black text-gray-900 tracking-tight leading-snug">
            Pakaian Bersih, Rapi & Wangi Tanpa Ribet
          </h2>

          <p className="text-xs text-gray-600 leading-relaxed">
            Kurir Laundrea menjemput cucian ke depan pintu Anda dan mengantarkannya kembali rapi sempurna.
          </p>

          <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              id="btn-home-order-cta"
              onClick={() => onOrderClick()}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-[#cd6184]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>+ Buat Pesanan Baru</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onGoToHistory || onGoToOrders}
              className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-gray-50 text-[#254117] font-bold text-xs border border-gray-200 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-[#cd6184]" />
              <span>Riwayat Pesanan ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#ffecf2]/80 pointer-events-none blur-xl" />
      </div>

      {/* Services Selection Section */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-black text-gray-900">Pilihan Layanan Kami</h3>
          <p className="text-[11px] text-gray-500">Pilih paket laundry sesuai kebutuhan Anda</p>
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
                  <span className="text-[10px] text-gray-400 block font-semibold leading-none">Mulai dari</span>
                  <span className="text-xs font-black text-gray-900 mt-0.5 block">{svc.price}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onOrderClick(svc.id)}
                  className="py-1.5 px-3 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Pesan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loyalty Stamp Teaser & 3-Step Simple How It Works in 2-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loyalty Stamp Teaser */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ffecf2] shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-gray-900">Kartu Cap & Loyalty</h4>
                <span className="text-[11px] font-black text-[#cd6184] bg-[#ffecf2] px-2 py-0.5 rounded-md">
                  {stampsInCycle} / 10 Cap
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                Kumpulkan 10 cap untuk 1x cuci gratis 3 kg!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToLoyalty}
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-[#cd6184] bg-[#ffecf2] hover:bg-[#ffecf2]/80 transition-colors cursor-pointer text-center"
          >
            Lihat Hadiah Cap →
          </button>
        </div>

        {/* 3-Step Simple How It Works */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <h3 className="text-xs font-black text-gray-900 text-center uppercase tracking-wider text-[#cd6184]">
            Cara Kerja Penjemputan
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-gray-50 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#cd6184] text-white flex items-center justify-center font-black text-xs mx-auto shadow-xs">
                1
              </div>
              <h4 className="font-bold text-[11px] text-gray-900">Pesan</h4>
              <p className="text-[9px] text-gray-500 leading-tight">Tentukan jadwal jemput</p>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#97a273] text-white flex items-center justify-center font-black text-xs mx-auto shadow-xs">
                2
              </div>
              <h4 className="font-bold text-[11px] text-gray-900">Dijemput</h4>
              <p className="text-[9px] text-gray-500 leading-tight">Kurir timbang di tempat</p>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-[#254117] text-[#ffbd59] flex items-center justify-center font-black text-xs mx-auto shadow-xs">
                3
              </div>
              <h4 className="font-bold text-[11px] text-gray-900">Diantar</h4>
              <p className="text-[9px] text-gray-500 leading-tight">Pakaian bersih & rapi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Guarantees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2.5">
          <Truck className="w-4 h-4 text-[#97a273] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#254117] block">Jemput & Antar Tepat Waktu</span>
            <span className="text-[#254117]/60 text-[10px]">Kurir ramah & terpercaya</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-gray-200/80 flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#ffbd59] shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#254117] block">Garansi Harum & Rapi</span>
            <span className="text-[#254117]/60 text-[10px]">Detergen wangi ramah serat</span>
          </div>
        </div>
      </div>
    </div>
  );
};
