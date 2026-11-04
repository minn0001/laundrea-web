import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus, Order } from '../../types';
import { useTr } from '../../i18n/useTr';
import { useLang } from '../../i18n/LanguageContext';
import { PLAN_LOCALIZATIONS } from '../../i18n/translations';
import {
  Check,
  Package,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  Banknote,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCw,
  Scale,
  Store,
  CheckCircle2,
  RefreshCw,
  Send,
  Lock,
  Info,
  ChevronDown,
  Leaf,
} from 'lucide-react';

interface CustomerTrackingPageProps {
  orderId?: string;
  onNewOrderClick: () => void;
}

// Pilihan jadwal antar. "value" disimpan ke database (tetap Indonesia), "en" hanya untuk tampilan.
const DELIVERY_SLOTS: { value: string; en: string }[] = [
  { value: 'Hari ini, 17:00 - 19:00', en: 'Today, 17:00 - 19:00' },
  { value: 'Besok, 09:00 - 11:00', en: 'Tomorrow, 09:00 - 11:00' },
  { value: 'Besok, 13:00 - 15:00', en: 'Tomorrow, 13:00 - 15:00' },
  { value: 'Besok, 17:00 - 19:00', en: 'Tomorrow, 17:00 - 19:00' },
];

export const CustomerTrackingPage: React.FC<CustomerTrackingPageProps> = ({
  orderId,
  onNewOrderClick,
}) => {
  const {
    orders,
    customerPhone,
    activeCustomerOrderId,
    setActiveCustomerOrderId,
    scheduleDelivery,
    updateOrderPaymentStatus,
    choosePaymentMethod,
  } = useApp();
  const tr = useTr();
  const { lang } = useLang();

  const customerOrders = orders
    .filter((o) => {
      if (!customerPhone) return false;
      let cleanOrderPhone = o.customerPhone.replace(/\D/g, '');
      if (cleanOrderPhone.startsWith('62')) cleanOrderPhone = '0' + cleanOrderPhone.slice(2);
      let normCust = customerPhone.replace(/\D/g, '');
      if (normCust.startsWith('62')) normCust = '0' + normCust.slice(2);
      return cleanOrderPhone === normCust;
    })
    .sort((a, b) => {
      const timeA = a.id.replace(/\D/g, '') || (a.statusTimestamps?.booked || '');
      const timeB = b.id.replace(/\D/g, '') || (b.statusTimestamps?.booked || '');
      return timeB.localeCompare(timeA);
    });

  const targetId = orderId || activeCustomerOrderId;
  const currentOrder = (targetId ? customerOrders.find((o) => o.id === targetId) : null) || customerOrders[0];

  const [deliveryDate, setDeliveryDate] = useState('Hari ini, 17:00 - 19:00');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string | null>(null);
  const [isOnMyWayActive, setIsOnMyWayActive] = useState(false);
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);

  const [, setLastRefreshedSec] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setLastRefreshedSec((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedSec(0);
    }, 400);
  };

  // Nama paket mengikuti bahasa
  const planLabel = (o: Order) =>
    lang === 'en' && PLAN_LOCALIZATIONS[o.planId as string]
      ? PLAN_LOCALIZATIONS[o.planId as string].nameEn
      : o.planName;

  // Jadwal antar yang tersimpan (Indonesia) ditampilkan sesuai bahasa
  const slotLabel = (value?: string) => {
    if (!value) return '';
    if (lang !== 'en') return value;
    return DELIVERY_SLOTS.find((s) => s.value === value)?.en || value;
  };

  const shortStatus = (status: OrderStatus) => {
    switch (status) {
      case 'pickup':
        return tr('Jemput', 'Pickup');
      case 'picked_up':
        return tr('Dijemput', 'Picked up');
      case 'washing':
        return tr('Cuci', 'Washing');
      case 'drying':
        return tr('Kering', 'Drying');
      case 'ironing':
        return tr('Setrika', 'Ironing');
      case 'ready':
        return tr('Siap', 'Ready');
      default:
        return tr('Selesai', 'Done');
    }
  };

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <Package className="w-12 h-12 text-[#cd6184] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#254117]">{tr('Belum Ada Pesanan Aktif', 'No Active Orders')}</h2>
        <p className="text-sm text-[#254117]/70 mt-1 mb-6">
          {tr(
            'Jadwalkan penjemputan Laundrea pertama Anda hanya dalam beberapa ketukan.',
            'Schedule your first Laundrea pickup in just a few taps.'
          )}
        </p>
        <button onClick={onNewOrderClick} className="px-6 py-3 rounded-2xl bg-[#cd6184] text-white font-bold text-sm shadow-md cursor-pointer">
          {tr('Pesan Laundrea Sekarang', 'Order Laundrea Now')}
        </button>
      </div>
    );
  }

  const fiveStages: { id: OrderStatus; label: string; estTime: string }[] = [
    { id: 'pickup', label: tr('Penjemputan', 'Pickup'), estTime: tr('Terjadwal & Menuju Lokasi', 'Scheduled & On the Way') },
    { id: 'washing', label: tr('Pencucian', 'Washing'), estTime: tr('Siklus ramah serat & higienis', 'Fiber-friendly & hygienic cycle') },
    { id: 'drying', label: tr('Pengeringan', 'Drying'), estTime: tr('Suhu stabil & terjaga', 'Stable & controlled heat') },
    { id: 'ironing', label: tr('Penyetrikaan', 'Ironing'), estTime: tr('Uap halus & lipat rapi', 'Gentle steam & neat fold') },
    { id: 'ready', label: tr('Selesai', 'Completed'), estTime: tr('Pemeriksaan mutu & kemasan rapi', 'Quality checked & packaged') },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pickup':
        return 0;
      case 'washing':
        return 1;
      case 'drying':
        return 2;
      case 'ironing':
        return 3;
      case 'ready':
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(currentOrder.status);

  const handleConfirmSchedule = () => {
    setIsScheduling(true);
    setTimeout(() => {
      scheduleDelivery(currentOrder.id, deliveryDate);
      setIsScheduling(false);
      setShowScheduleModal(false);
      setScheduleSuccessMessage(
        tr(`Pengantaran dijadwalkan untuk ${deliveryDate}`, `Delivery scheduled for ${slotLabel(deliveryDate)}`)
      );
      setTimeout(() => setScheduleSuccessMessage(null), 5000);
    }, 500);
  };

  const handleOnMyWay = () => {
    setIsOnMyWayActive(true);
    setScheduleSuccessMessage(
      tr(
        'Gerai telah diberitahu: Pelanggan sedang dalam perjalanan menuju gerai!',
        'The store has been notified: the customer is on the way to the store!'
      )
    );
    setTimeout(() => setScheduleSuccessMessage(null), 6000);
  };

  const isDelivery = currentOrder.returnMethod !== 'self_pickup';

  // Teks status daur ulang
  const recycleStatusText = (() => {
    const r = currentOrder.recycle;
    if (!r) return '';
    return r.status === 'verified'
      ? tr('Stempel bonus ditambahkan', 'Bonus stamp added')
      : r.status === 'pending_verification'
      ? tr('Menunggu verifikasi', 'Awaiting verification')
      : `${tr('Tidak memenuhi syarat', 'Not eligible')}: ${r.rejectReason || tr('Ketentuan belum terpenuhi', 'Requirements not met')}`;
  })();

  const methodBtn =
    'p-3 rounded-2xl border-2 border-gray-200 hover:border-[#cd6184] bg-white hover:bg-[#ffecf2]/30 flex items-center justify-between text-left transition-all cursor-pointer group';

  return (
    <div id="customer-tracking-page" className="w-full space-y-3 sm:space-y-4">
      {/* Top status bar */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-2 sm:space-y-3">
        <div className="flex items-stretch justify-between gap-3">
          <div className="flex flex-col justify-between py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#cd6184]">
              {tr('Status Pesanan', 'Order Status')}
            </span>
            <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-[#ffecf2] text-[#cd6184] font-black w-fit mt-1">
              {currentOrder.orderNumber}
            </span>
          </div>

          <button
            id="btn-tracking-new-order"
            onClick={onNewOrderClick}
            className="self-stretch text-xs font-bold px-3.5 sm:px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-[0.99] whitespace-nowrap shrink-0"
          >
            <span>{tr('+ Pesanan Baru', '+ New Order')}</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5 sm:pt-0">
          <h1 className="text-base sm:text-xl font-black text-[#254117] leading-tight">
            Laundrea {planLabel(currentOrder)}
          </h1>

          {customerOrders.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOrderDropdownOpen(!isOrderDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-gray-200 text-[#254117] hover:bg-[#ffecf2] shadow-xs cursor-pointer transition-colors"
              >
                <span className="text-[10px] text-[#254117]/60 font-semibold">{tr('Pilih Pesanan:', 'Select Order:')}</span>
                <span>{currentOrder.orderNumber}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-[#ffecf2] text-[#cd6184]">
                  {shortStatus(currentOrder.status)}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOrderDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOrderDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setIsOrderDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in max-h-72 overflow-y-auto">
                    {customerOrders.map((o) => {
                      const isSelected = o.id === currentOrder.id;
                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => {
                            setActiveCustomerOrderId(o.id);
                            setIsOrderDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                            isSelected ? 'bg-[#ffecf2] text-[#cd6184]' : 'text-[#254117] hover:bg-gray-50'
                          }`}
                        >
                          <div>
                            <span className="block">{o.orderNumber}</span>
                            <span className="text-[10px] text-[#254117]/60 font-medium">
                              {tr('Paket', 'Plan')} {planLabel(o)}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isSelected ? 'bg-[#cd6184] text-white' : 'bg-gray-100 text-[#254117]'
                            }`}
                          >
                            {shortStatus(o.status)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Left column */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#cd6184]" />
                <h2 className="text-sm font-bold text-[#254117]">{tr('Progres Pengerjaan', 'Processing Progress')}</h2>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-[#254117]/60">
                <button onClick={handleManualRefresh} className="flex items-center gap-1 text-[#cd6184] hover:underline cursor-pointer font-medium">
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{tr('Segarkan', 'Refresh')}</span>
                </button>
              </div>
            </div>

            <div className="relative pt-1 pb-1">
              <div className="absolute top-[16px] sm:top-[18px] left-[10%] right-[10%] h-[2px] bg-gray-200 -z-0" />
              <div
                className="absolute top-[16px] sm:top-[18px] left-[10%] h-[2px] bg-[#97a273] transition-all duration-500 -z-0"
                style={{
                  width: currentOrder.status === 'delivered' ? '80%' : `${(Math.min(currentStageIndex, 4) / 4) * 80}%`,
                }}
              />

              <div className="grid grid-cols-5 gap-1 sm:gap-2 relative z-10">
                {fiveStages.map((st, idx) => {
                  const isCompleted = idx < currentStageIndex || currentOrder.status === 'delivered';
                  const isActive = idx === currentStageIndex && currentOrder.status !== 'delivered';

                  return (
                    <div key={st.id} className="flex flex-col items-center text-center px-0 sm:px-0.5 min-w-0">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 shadow-xs ${
                          isCompleted
                            ? 'bg-[#97a273] text-white ring-2 ring-white'
                            : isActive
                            ? 'bg-[#cd6184] text-white ring-4 ring-[#ffecf2] scale-105'
                            : 'bg-white text-gray-400 border border-gray-200 ring-2 ring-white'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : isActive ? (
                          <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="font-normal text-[10px] sm:text-[11px]">{idx + 1}</span>
                        )}
                      </div>

                      <span
                        className={`mt-1.5 sm:mt-2 text-[8px] sm:text-[9.5px] font-medium leading-snug block w-full text-center break-normal hyphens-none ${
                          isActive ? 'text-[#cd6184] font-bold' : isCompleted ? 'text-[#254117]' : 'text-gray-400'
                        }`}
                      >
                        {st.label}
                      </span>

                      {currentOrder.statusTimestamps[st.id] ? (
                        <span className="text-[7.5px] sm:text-[8px] text-[#97a273] font-normal mt-1 bg-[#97a273]/10 px-1 py-0.5 rounded-md">
                          {tr('Selesai', 'Done')}
                        </span>
                      ) : isActive ? (
                        <span className="text-[7.5px] sm:text-[8px] text-[#cd6184] font-normal mt-1 bg-[#ffecf2] px-1 py-0.5 rounded-md">
                          {tr('Proses', 'In progress')}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#ffecf2]/50 border border-[#cd6184]/20 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#cd6184]/15 text-[#cd6184] flex items-center justify-center shrink-0">
                  {isDelivery ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#cd6184] uppercase tracking-wider block">
                    {tr('Status Pemenuhan Layanan', 'Fulfillment Status')}
                  </span>
                  <p className="text-xs font-bold text-[#254117]">
                    {currentOrder.status === 'delivered'
                      ? isDelivery
                        ? tr('Pakaian Telah Diterima Pelanggan', 'Clothes Received by Customer')
                        : tr('Pakaian Telah Diambil di Gerai', 'Clothes Picked Up at Store')
                      : currentOrder.status === 'ready'
                      ? isDelivery
                        ? tr('Siap Dikirim (Menunggu Keberangkatan Kurir)', 'Ready for Delivery (Awaiting Courier Departure)')
                        : tr('Siap Diambil Sendiri di Gerai Laundrea', 'Ready for Self Pick-up at Laundrea Store')
                      : isDelivery
                      ? tr('Pengantaran dilakukan setelah proses selesai', 'Delivery will occur once processing is complete')
                      : tr('Pengambilan mandiri di konter gerai', 'Self pick-up at store counter')}
                  </p>
                </div>
              </div>

              {currentOrder.status === 'ready' && (
                <div className="pt-1">
                  {isDelivery ? (
                    currentOrder.deliveryScheduledTime ? (
                      <div className="w-full py-2 bg-[#97a273] text-white rounded-xl text-xs font-bold text-center">
                        ✓ {tr('Terjadwal:', 'Scheduled:')} {slotLabel(currentOrder.deliveryScheduledTime)}
                      </div>
                    ) : (
                      <button
                        id="btn-schedule-delivery"
                        onClick={() => setShowScheduleModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-md cursor-pointer transition-all text-center"
                      >
                        {tr('Jadwalkan Pengantaran', 'Schedule Delivery')}
                      </button>
                    )
                  ) : (
                    <button
                      id="btn-on-my-way"
                      onClick={handleOnMyWay}
                      disabled={isOnMyWayActive}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-md cursor-pointer transition-all disabled:opacity-70 flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>
                        {isOnMyWayActive
                          ? tr('Terkirim: Dalam Perjalanan', 'Sent: On the Way')
                          : tr('Saya sedang menuju gerai', "I'm on my way to the store")}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {scheduleSuccessMessage && (
              <div className="p-3 bg-[#97a273]/15 border border-[#97a273] text-[#254117] rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#97a273]" />
                <span>{scheduleSuccessMessage}</span>
              </div>
            )}
          </div>

          {/* Verified weight & price */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
            <div className="border-b pb-2.5 sm:pb-3 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-1.5 sm:gap-2">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#cd6184] shrink-0" />
                  <h3 className="text-sm font-bold text-[#254117] leading-snug">
                    {tr('Verifikasi Timbangan & Harga Akhir', 'Weighing Verification & Final Price')}
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>{tr('Resmi & Tetap', 'Official & Locked')}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#254117]/60 leading-relaxed">
                {tr(
                  'Ditimbang dan diverifikasi langsung oleh petugas Laundrea. Nilai timbangan dan harga akhir terkunci otomatis dan tidak dapat diubah oleh pelanggan.',
                  'Weighed and verified directly by Laundrea staff. The verified weight and final price are locked automatically and cannot be changed by the customer.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#254117]/60 font-semibold uppercase tracking-wider">
                    {tr('Perkiraan Awal Pelanggan', 'Initial Customer Estimate')}
                  </span>
                  <span className="text-[9px] text-[#254117]/50 font-medium bg-gray-200/70 px-1.5 py-0.5 rounded-md">
                    {tr('Estimasi Awal', 'Initial Estimate')}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-black text-[#254117]/75">
                    Rp {currentOrder.estimatedPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[10px] text-[#254117]/60 mt-0.5">
                  {tr('Berdasarkan input awal:', 'Based on initial input:')} {currentOrder.estimatedQuantity} {currentOrder.unit} × Rp{' '}
                  {currentOrder.unitPrice.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#ffecf2] border border-[#cd6184]/40 relative overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-[#cd6184] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#cd6184]" />
                    <span>{tr('Harga Verifikasi Akhir', 'Final Verified Price')}</span>
                  </span>

                  {currentOrder.actualQuantity ? (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{tr('Diverifikasi Petugas', 'Verified by Staff')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                      <Clock className="w-3 h-3" />
                      <span>{tr('Menunggu Kurir', 'Awaiting Courier')}</span>
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#254117]">
                    Rp {(currentOrder.actualPrice || currentOrder.estimatedPrice).toLocaleString('id-ID')}
                  </span>
                </div>

                {currentOrder.voucherCode && (
                  <div className="mt-1.5 flex items-center justify-between text-xs bg-white/90 px-2.5 py-1.5 rounded-xl border border-[#cd6184]/30">
                    <span className="text-[#cd6184] font-bold text-[11px]">Voucher ({currentOrder.voucherCode}):</span>
                    <span className="font-black text-[#cd6184] text-[11px]">-Rp {(currentOrder.voucherDiscount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="mt-1.5 pt-2 border-t border-[#cd6184]/20 text-xs">
                  {currentOrder.actualQuantity ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#254117]">
                        <span className="font-semibold">{tr('Timbangan Riil Terverifikasi:', 'Actual Verified Weight:')}</span>
                        <span className="font-black text-[#cd6184]">
                          {currentOrder.actualQuantity} {currentOrder.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#254117]/70">
                        <span>{tr('Tarif Resmi:', 'Official Rate:')}</span>
                        <span>
                          Rp {currentOrder.unitPrice.toLocaleString('id-ID')} / {currentOrder.unit}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded-lg mt-1 font-medium flex items-center gap-1 border border-emerald-200/60">
                        <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>
                          {tr(
                            'Hasil timbangan telah dikunci dan tidak dapat diubah oleh pelanggan.',
                            'The weighing result is locked and cannot be changed by the customer.'
                          )}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[11px] text-[#254117]/80 font-medium">
                        {tr(
                          'Kurir akan menimbang langsung pakaian di hadapan Anda saat penjemputan.',
                          'The courier will weigh your clothes in front of you during pickup.'
                        )}
                      </p>
                      <p className="text-[10px] text-[#254117]/60 italic">
                        {tr(
                          '*Total tagihan resmi akan dikunci otomatis setelah penimbangan fisik oleh kurir.',
                          '*The official total bill is locked automatically after the courier physically weighs the laundry.'
                        )}
                      </p>
                    </div>
                  )}

                  {currentOrder.recycle?.enabled && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Laundrea Peduli</span>
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {currentOrder.recycle.mode === 'clean'
                            ? tr('Baju Bersih & Kering', 'Clean & Dry Clothes')
                            : tr('Cuci Dulu Sesuai Tarif', 'Wash First at Standard Rate')}
                        </span>
                      </div>
                      {currentOrder.recycle.actualKg === null ? (
                        <p className="text-[11px] text-emerald-800 flex items-center gap-1 mt-1">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{tr('Kurir akan menimbang baju daur ulang Anda.', 'The courier will weigh your recycling clothes.')}</span>
                        </p>
                      ) : (
                        <div className="space-y-0.5 text-[11px] text-emerald-950 mt-1">
                          <p className="flex items-center gap-1">
                            <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              {tr('Baju daur ulang diterima', 'Recycling clothes received')} ({currentOrder.recycle.actualKg} kg) •{' '}
                              <strong>{recycleStatusText}</strong>
                            </span>
                          </p>
                          {currentOrder.recycle.mode === 'wash_first' && (
                            <p className="text-[10px] text-emerald-700 italic">
                              ({currentOrder.recycle.actualKg || currentOrder.recycle.estimatedKg} kg{' '}
                              {tr('diserahkan ke daur ulang', 'handed over for recycling')})
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 space-y-2.5 sm:space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#254117]">{tr('Informasi Pesanan', 'Order Information')}</h3>
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#254117]/60 bg-gray-100 px-2 py-0.5 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{tr('Terkunci', 'Locked')}</span>
                </span>
              </div>
              <span className="text-[10px] font-medium text-[#254117]/60">{currentOrder.statusTimestamps.booked}</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#254117]/70">{tr('Pelanggan:', 'Customer:')}</span>
                <span className="font-bold text-[#254117]">{currentOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/70">{tr('No. WhatsApp:', 'WhatsApp Number:')}</span>
                <span className="font-semibold text-[#254117]">{currentOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/70">{tr('Paket Layanan:', 'Service Plan:')}</span>
                <span className="font-bold text-[#254117]">{planLabel(currentOrder)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/70">{tr('Penyerahan:', 'Handover:')}</span>
                <span className="font-medium text-[#254117]">
                  {currentOrder.handoverMethod === 'pickup_by_courier'
                    ? tr('Dijemput kurir ke alamat', 'Picked up by courier at address')
                    : tr('Antar sendiri ke gerai', 'Self drop-off at store')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/70">{tr('Pengembalian:', 'Return:')}</span>
                <span className="font-medium text-[#254117]">
                  {currentOrder.returnMethod === 'deliver_to_me'
                    ? tr('Diantar kurir ke alamat', 'Delivered by courier to address')
                    : tr('Ambil sendiri di gerai', 'Self pick-up at store')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/70">{tr('Jadwal Penjemputan:', 'Pickup Schedule:')}</span>
                <span className="font-medium text-[#254117]">
                  {currentOrder.pickupDate === 'Langsung ke gerai'
                    ? tr('Langsung ke gerai', 'Directly to the store')
                    : currentOrder.pickupDate}{' '}
                  ({currentOrder.pickupTime})
                </span>
              </div>
              {currentOrder.notes && (
                <div className="flex justify-between">
                  <span className="text-[#254117]/70">{tr('Catatan Khusus:', 'Special Notes:')}</span>
                  <span className="font-medium text-[#254117] text-right max-w-[180px] truncate">{currentOrder.notes}</span>
                </div>
              )}
            </div>

            <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1.5 text-[10px] text-[#254117]/60">
              <Info className="w-3 h-3 text-[#254117]/50 shrink-0" />
              <span>
                {tr(
                  'Rincian pesanan telah dikonfirmasi dan tidak dapat diubah pelanggan.',
                  'Order details have been confirmed and cannot be changed by the customer.'
                )}
              </span>
            </div>

            <div className="pt-2 border-t text-xs text-[#254117]/70 space-y-1">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#cd6184] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{currentOrder.customerAddress}</span>
              </div>
              {currentOrder.courierName && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Truck className="w-3.5 h-3.5 text-[#97a273] shrink-0" />
                  <span className="text-[11px]">
                    {tr('Kurir:', 'Courier:')} <strong className="text-[#254117]">{currentOrder.courierName}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment box */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-[#254117]">{tr('Status Pembayaran', 'Payment Status')}</h3>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                  currentOrder.paymentStatus === 'paid'
                    ? 'bg-[#97a273]/20 text-[#97a273]'
                    : currentOrder.paymentStatus === 'awaiting_verification'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : currentOrder.paymentStatus === 'awaiting_payment'
                    ? 'bg-rose-100 text-[#cd6184] border border-rose-200 animate-pulse'
                    : !currentOrder.actualQuantity || currentOrder.actualQuantity <= 0
                    ? 'bg-gray-100 text-gray-700 border border-gray-200'
                    : 'bg-[#ffbd59]/30 text-[#254117]'
                }`}
              >
                {currentOrder.paymentStatus === 'paid'
                  ? tr('Lunas', 'Paid')
                  : currentOrder.paymentStatus === 'awaiting_verification'
                  ? tr('Menunggu Verifikasi', 'Awaiting Verification')
                  : currentOrder.paymentStatus === 'awaiting_payment'
                  ? tr('Menunggu Pembayaran', 'Awaiting Payment')
                  : !currentOrder.actualQuantity || currentOrder.actualQuantity <= 0
                  ? tr('Menunggu Verifikasi Berat', 'Awaiting Weight Verification')
                  : tr('Menunggu', 'Waiting')}
              </span>
            </div>

            {(!currentOrder.actualQuantity || currentOrder.actualQuantity <= 0) &&
            currentOrder.paymentStatus !== 'paid' &&
            currentOrder.paymentStatus !== 'awaiting_verification' ? (
              <div className="p-3.5 sm:p-4 bg-amber-50/70 border border-amber-200 rounded-xl sm:rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{tr('Menunggu Verifikasi Berat', 'Awaiting Weight Verification')}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  {tr(
                    'Kurir akan menjemput dan menimbang cucian Anda. Tagihan final muncul setelah itu.',
                    'The courier will pick up and weigh your laundry. The final bill appears after that.'
                  )}
                </p>
                <div className="text-[10px] text-[#254117]/60 pt-1 border-t border-amber-200/50 flex items-center justify-between">
                  <span>{tr('Estimasi biaya awal:', 'Initial estimated cost:')}</span>
                  <span className="font-bold text-[#254117]">Rp {currentOrder.estimatedPrice.toLocaleString('id-ID')}</span>
                </div>
              </div>
            ) : currentOrder.paymentStatus === 'paid' ? (
              <div className="p-3 sm:p-4 bg-[#97a273]/10 border border-[#97a273]/30 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-[#254117]">
                  <div className="w-8 h-8 rounded-full bg-[#97a273] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-[#254117]">{tr('Pembayaran Lunas', 'Payment Completed')}</span>
                    <span className="text-[10px] text-[#254117]/70">
                      {currentOrder.paymentMethod === 'qris'
                        ? tr('Melalui QRIS E-Wallet', 'Via QRIS E-Wallet')
                        : currentOrder.paymentMethod === 'bank_transfer'
                        ? tr('Melalui Transfer Bank', 'Via Bank Transfer')
                        : tr('Melalui Tunai (COD)', 'Via Cash (COD)')}{' '}
                      • {tr('Terverifikasi', 'Verified')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#254117]/80 bg-white/90 p-2.5 rounded-xl border border-[#97a273]/20 flex items-center justify-between">
                  <span>{tr('Total Biaya Terbayar', 'Total Amount Paid')}</span>
                  <span className="font-black text-sm text-[#254117]">
                    Rp {(currentOrder.actualPrice || currentOrder.estimatedPrice).toLocaleString('id-ID')}
                  </span>
                </div>

                {currentOrder.voucherCode && (
                  <div className="text-[10px] text-[#cd6184] font-bold flex items-center justify-between px-1">
                    <span>{tr('Diskon Voucher', 'Voucher Discount')} ({currentOrder.voucherCode})</span>
                    <span>-Rp {(currentOrder.voucherDiscount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}

                <p className="text-[10px] text-[#254117]/60 leading-relaxed pt-1">
                  {tr(
                    'Terima kasih! Pembayaran Anda telah diverifikasi oleh sistem. Kode QRIS dan nomor Virtual Account telah ditutup untuk keamanan transaksi.',
                    'Thank you! Your payment has been verified by the system. The QRIS code and Virtual Account number have been closed for transaction security.'
                  )}
                </p>
              </div>
            ) : currentOrder.paymentStatus === 'awaiting_verification' ? (
              <div className="p-3.5 sm:p-4 bg-amber-50/90 border border-amber-300 rounded-xl sm:rounded-2xl space-y-2.5 animate-in fade-in">
                <div className="flex items-center gap-2.5 text-amber-900">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Clock className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-amber-900">{tr('Menunggu Verifikasi', 'Awaiting Verification')}</span>
                    <span className="text-[10px] text-amber-800/80">
                      {tr('Pembayaran sedang diverifikasi oleh Admin', 'Payment is being verified by Admin')}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#254117]/85 bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <span>{tr('Total Biaya Ditagih', 'Total Amount Billed')}</span>
                  <span className="font-black text-sm text-[#254117]">
                    Rp {(currentOrder.actualPrice || currentOrder.estimatedPrice).toLocaleString('id-ID')}
                  </span>
                </div>

                {currentOrder.voucherCode && (
                  <div className="text-[10px] text-[#cd6184] font-bold flex items-center justify-between px-1">
                    <span>{tr('Diskon Voucher', 'Voucher Discount')} ({currentOrder.voucherCode})</span>
                    <span>-Rp {(currentOrder.voucherDiscount || 0).toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="p-2.5 bg-amber-100/70 rounded-xl text-[10px] text-amber-900 leading-relaxed border border-amber-200/60">
                  {tr(
                    'Terima kasih! Konfirmasi pembayaran Anda telah kami terima. Admin sedang memeriksa mutasi rekening / e-wallet. Status pembayaran akan otomatis berubah menjadi ',
                    'Thank you! We have received your payment confirmation. Admin is checking the bank / e-wallet statements. The payment status will automatically change to '
                  )}
                  <strong>{tr('LUNAS', 'PAID')}</strong>
                  {tr(' setelah diverifikasi oleh Admin.', ' once verified by Admin.')}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {!currentOrder.paymentMethod ? (
                  <div className="space-y-2.5 animate-in fade-in">
                    <div className="p-3 bg-[#ffecf2] rounded-2xl border border-[#cd6184]/30 text-xs">
                      <span className="font-bold text-[#cd6184] block">{tr('Hasil Timbang Telah Siap!', 'Weighing Complete!')}</span>
                      <span className="text-[#254117]/80 block mt-0.5">
                        {tr('Total tagihan final:', 'Final bill total:')}{' '}
                        <strong>Rp {(currentOrder.actualPrice || currentOrder.estimatedPrice).toLocaleString('id-ID')}</strong>.{' '}
                        {tr(
                          'Silakan pilih salah satu metode pembayaran di bawah ini:',
                          'Please choose one of the payment methods below:'
                        )}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button type="button" onClick={() => choosePaymentMethod(currentOrder.id, 'qris')} className={methodBtn}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-xs">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#254117] block group-hover:text-[#cd6184]">
                              {tr('QRIS (Instan)', 'QRIS (Instant)')}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {tr('BCA, GoPay, OVO, ShopeePay, Dana, dll.', 'BCA, GoPay, OVO, ShopeePay, Dana, etc.')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#cd6184]" />
                      </button>

                      <button type="button" onClick={() => choosePaymentMethod(currentOrder.id, 'bank_transfer')} className={methodBtn}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-xs">
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#254117] block group-hover:text-[#cd6184]">
                              {tr('Transfer Bank / Virtual Account', 'Bank Transfer / Virtual Account')}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {tr('VA Mandiri & VA BCA', 'Mandiri VA & BCA VA')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#cd6184]" />
                      </button>

                      <button type="button" onClick={() => choosePaymentMethod(currentOrder.id, 'cod')} className={methodBtn}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs">
                            <Banknote className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#254117] block group-hover:text-[#cd6184]">
                              {tr('Bayar Tunai di Tempat (COD)', 'Cash on Delivery (COD)')}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {tr('Bayar langsung ke kurir saat jemput/antar', 'Pay directly to the courier at pickup/delivery')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#cd6184]" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {currentOrder.paymentMethod === 'qris' && (
                      <div className="text-center space-y-2.5">
                        <div className="mx-auto max-w-[240px] bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex flex-col items-center justify-center">
                          <img src="/qris.png" alt="QRIS Laundrea" className="w-full h-auto object-contain rounded-xl" />
                        </div>
                        <p className="text-[11px] text-[#254117]/70">
                          {tr(
                            'Pindai dengan GoPay, OVO, Dana, BCA, ShopeePay, atau mobile banking.',
                            'Scan with GoPay, OVO, Dana, BCA, ShopeePay, or mobile banking.'
                          )}
                        </p>
                      </div>
                    )}

                    {currentOrder.paymentMethod === 'bank_transfer' && (
                      <div className="space-y-2 text-xs">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-[#254117]/60 block text-[9px]">{tr('Virtual Account Mandiri', 'Mandiri Virtual Account')}</span>
                          <span className="font-mono text-xs font-bold text-[#254117] tracking-wider block mt-0.5">8923 0812 3456 7890</span>
                        </div>
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                          <span className="text-[#254117]/60 block text-[9px]">{tr('Virtual Account BCA', 'BCA Virtual Account')}</span>
                          <span className="font-mono text-xs font-bold text-[#254117] tracking-wider block mt-0.5">1280 0812 3456 7890</span>
                        </div>
                      </div>
                    )}

                    {currentOrder.paymentMethod === 'cod' && (
                      <div className="p-3 bg-[#ffecf2] rounded-2xl border border-[#cd6184]/30 text-center space-y-1">
                        <Banknote className="w-6 h-6 text-[#cd6184] mx-auto" />
                        <span className="text-xs font-bold text-[#254117] block">{tr('Bayar di Tempat (COD)', 'Cash on Delivery (COD)')}</span>
                        <p className="text-[10px] text-[#254117]/80">
                          {tr(
                            'Silakan siapkan uang pas untuk diberikan kepada kurir saat pesanan tiba.',
                            'Please prepare exact change to hand to the courier when your order arrives.'
                          )}
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      id="btn-mark-order-paid-sim"
                      onClick={() => updateOrderPaymentStatus(currentOrder.id, 'awaiting_verification')}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#254117] hover:bg-[#1b3010] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#ffbd59]" />
                      <span>{tr('Konfirmasi Saya Sudah Bayar', "I've Completed Payment")}</span>
                    </button>
                  </>
                )}
              </div>
            )}

            <div className="pt-1 text-[10px] text-[#254117]/60 flex items-center justify-between border-t border-gray-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#97a273]" />
                {tr('Jaminan Higienis', 'Hygiene Guarantee')}
              </span>
              <span className="text-[#cd6184] font-semibold">{tr('100% Bersih & Rapi', '100% Clean & Neat')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Delivery Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#254117]">{tr('Jadwalkan Waktu Pengantaran', 'Schedule Delivery Time')}</h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#254117]/70">
              {tr(
                'Pilih waktu yang paling nyaman untuk kurir mengantar pakaian Anda.',
                'Choose the most convenient time for the courier to deliver your clothes.'
              )}
            </p>

            <div className="space-y-2">
              {DELIVERY_SLOTS.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => setDeliveryDate(slot.value)}
                  className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    deliveryDate === slot.value
                      ? 'border-[#cd6184] bg-[#ffecf2] text-[#cd6184]'
                      : 'border-gray-200 hover:bg-gray-50 text-[#254117]'
                  }`}
                >
                  {slotLabel(slot.value)}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowScheduleModal(false)} className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium cursor-pointer">
                {tr('Batal', 'Cancel')}
              </button>
              <button
                onClick={handleConfirmSchedule}
                disabled={isScheduling}
                className="w-2/3 py-2.5 rounded-xl bg-[#cd6184] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isScheduling ? tr('Menyimpan...', 'Saving...') : tr('Konfirmasi Pengantaran', 'Confirm Delivery')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
