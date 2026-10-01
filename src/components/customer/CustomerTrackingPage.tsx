import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import {
  Check,
  Package,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CreditCard,
  Banknote,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCw,
  Scale,
  Store,
  ShoppingBag,
  CheckCircle2,
  RefreshCw,
  Send,
  Lock,
  Info,
} from 'lucide-react';

interface CustomerTrackingPageProps {
  orderId?: string;
  onNewOrderClick: () => void;
}

export const CustomerTrackingPage: React.FC<CustomerTrackingPageProps> = ({
  orderId,
  onNewOrderClick,
}) => {
  const {
    orders,
    activeCustomerOrderId,
    setActiveCustomerOrderId,
    scheduleDelivery,
    updateOrderPaymentStatus,
  } = useApp();

  // Active tracked order
  const currentOrderId = orderId || activeCustomerOrderId || orders[0]?.id;
  const currentOrder = orders.find((o) => o.id === currentOrderId) || orders[0];

  const [deliveryDate, setDeliveryDate] = useState('Hari ini, 17:00 - 19:00');
  const [isScheduling, setIsScheduling] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string | null>(null);
  const [isOnMyWayActive, setIsOnMyWayActive] = useState(false);

  // Auto-refresh simulation
  const [lastRefreshedSec, setLastRefreshedSec] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastRefreshedSec((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshedSec(0);
    }, 400);
  };

  if (!currentOrder) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <Package className="w-12 h-12 text-[#cd6184] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-[#254117]">Belum Ada Pesanan Aktif</h2>
        <p className="text-sm text-[#254117]/70 mt-1 mb-6">
          Jadwalkan penjemputan Laundrea pertama Anda hanya dalam beberapa ketukan.
        </p>
        <button
          onClick={onNewOrderClick}
          className="px-6 py-3 rounded-2xl bg-[#cd6184] text-white font-bold text-sm shadow-md cursor-pointer"
        >
          Pesan Laundrea Sekarang
        </button>
      </div>
    );
  }

  // 5 primary stages: Pickup -> Washing -> Drying -> Ironing -> Ready
  const fiveStages: { id: OrderStatus; label: string; estTime: string }[] = [
    { id: 'pickup', label: 'Penjemputan', estTime: 'Terjadwal & Menuju Lokasi' },
    { id: 'washing', label: 'Pencucian', estTime: 'Siklus ramah serat & higienis' },
    { id: 'drying', label: 'Pengeringan', estTime: 'Suhu stabil & terjaga' },
    { id: 'ironing', label: 'Penyetrikaan', estTime: 'Uap halus & lipat rapi' },
    { id: 'ready', label: 'Selesai', estTime: 'Pemeriksaan mutu & kemasan rapi' },
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
      setScheduleSuccessMessage(`Pengantaran dijadwalkan untuk ${deliveryDate}`);
      setTimeout(() => setScheduleSuccessMessage(null), 5000);
    }, 500);
  };

  const handleOnMyWay = () => {
    setIsOnMyWayActive(true);
    setScheduleSuccessMessage('Gerai telah diberitahu: Pelanggan sedang dalam perjalanan menuju gerai!');
    setTimeout(() => setScheduleSuccessMessage(null), 6000);
  };

  const isDelivery = currentOrder.returnMethod !== 'self_pickup';

  return (
    <div id="customer-tracking-page" className="w-full space-y-3 sm:space-y-4">
      {/* Top status bar */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-2 sm:space-y-3">
        {/* Top 2-column layout: Left column (Status label stacked above Order ID badge) + Right column (+ Pesanan Baru button matched in height) */}
        <div className="flex items-stretch justify-between gap-3">
          {/* Left Column: Stacked vertically */}
          <div className="flex flex-col justify-between py-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#cd6184]">
              Status Pesanan
            </span>
            <span className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-[#ffecf2] text-[#cd6184] font-black w-fit mt-1">
              {currentOrder.orderNumber}
            </span>
          </div>

          {/* Right Column: + Pesanan Baru button matching combined height */}
          <button
            id="btn-tracking-new-order"
            onClick={onNewOrderClick}
            className="self-stretch text-xs font-bold px-3.5 sm:px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs active:scale-[0.99] whitespace-nowrap shrink-0"
          >
            <span>+ Pesanan Baru</span>
          </button>
        </div>

        {/* Row 3: Laundrea {currentOrder.planName} title with order-switcher dropdown below it on its own line if needed on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 pt-0.5 sm:pt-0">
          <h1 className="text-base sm:text-xl font-black text-[#254117] leading-tight">
            Laundrea {currentOrder.planName}
          </h1>

          {orders.length > 1 && (
            <select
              value={currentOrder.id}
              onChange={(e) => setActiveCustomerOrderId(e.target.value)}
              className="w-full sm:w-auto text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#ffecf2] border border-[#cd6184]/30 text-[#254117] focus:outline-none cursor-pointer sm:max-w-[170px] truncate"
            >
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} ({o.status.toUpperCase()})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main 2-column responsive layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Left Column: Stepper & Stage Status */}
        <div className="space-y-3 sm:space-y-4">
          {/* 5-Step Progress Stepper */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#cd6184]" />
            <h2 className="text-sm font-bold text-[#254117]">
              Progres Pengerjaan
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#254117]/60">
            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1 text-[#cd6184] hover:underline cursor-pointer font-medium"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>

        {/* 5-Step horizontal stepper */}
        <div className="relative pt-1 pb-1">
          {/* Subtle connecting track line behind circles */}
          <div className="absolute top-[16px] sm:top-[18px] left-[10%] right-[10%] h-[2px] bg-gray-200 -z-0" />
          <div
            className="absolute top-[16px] sm:top-[18px] left-[10%] h-[2px] bg-[#97a273] transition-all duration-500 -z-0"
            style={{
              width:
                currentOrder.status === 'delivered'
                  ? '80%'
                  : `${(Math.min(currentStageIndex, 4) / 4) * 80}%`,
            }}
          />

          <div className="grid grid-cols-5 gap-1 sm:gap-2 relative z-10">
            {fiveStages.map((st, idx) => {
              const isCompleted =
                idx < currentStageIndex || currentOrder.status === 'delivered';
              const isActive =
                idx === currentStageIndex && currentOrder.status !== 'delivered';

              return (
                <div key={st.id} className="flex flex-col items-center text-center px-0 sm:px-0.5 min-w-0">
                  {/* Stepper Circle */}
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

                  {/* Stage Name: slightly reduced font on mobile so labels fit cleanly without awkward mid-word breaks */}
                  <span
                    className={`mt-1.5 sm:mt-2 text-[8px] sm:text-[9.5px] font-medium leading-snug block w-full text-center break-normal hyphens-none ${
                      isActive
                        ? 'text-[#cd6184] font-bold'
                        : isCompleted
                        ? 'text-[#254117]'
                        : 'text-gray-400'
                    }`}
                  >
                    {st.label}
                  </span>

                  {/* Stage badge */}
                  {currentOrder.statusTimestamps[st.id] ? (
                    <span className="text-[7.5px] sm:text-[8px] text-[#97a273] font-normal mt-1 bg-[#97a273]/10 px-1 py-0.5 rounded-md">
                      Selesai
                    </span>
                  ) : isActive ? (
                    <span className="text-[7.5px] sm:text-[8px] text-[#cd6184] font-normal mt-1 bg-[#ffecf2] px-1 py-0.5 rounded-md">
                      Proses
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Final delivery/self-pickup sub-status indicator */}
        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#ffecf2]/50 border border-[#cd6184]/20 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#cd6184]/15 text-[#cd6184] flex items-center justify-center shrink-0">
              {isDelivery ? <Truck className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#cd6184] uppercase tracking-wider block">
                Status Pemenuhan Layanan
              </span>
              <p className="text-xs font-bold text-[#254117]">
                {currentOrder.status === 'delivered'
                  ? isDelivery
                    ? 'Pakaian Telah Diterima Pelanggan'
                    : 'Pakaian Telah Diambil di Gerai'
                  : currentOrder.status === 'ready'
                  ? isDelivery
                    ? 'Siap Dikirim (Menunggu Keberangkatan Kurir)'
                    : 'Siap Diambil Sendiri di Gerai Laundrea'
                  : isDelivery
                  ? 'Pengantaran dilakukan setelah proses selesai'
                  : 'Pengambilan mandiri di konter gerai'}
              </p>
            </div>
          </div>

          {/* If ready: conditional action buttons */}
          {currentOrder.status === 'ready' && (
            <div className="pt-1">
              {isDelivery ? (
                currentOrder.deliveryScheduledTime ? (
                  <div className="w-full py-2 bg-[#97a273] text-white rounded-xl text-xs font-bold text-center">
                    ✓ Terjadwal: {currentOrder.deliveryScheduledTime}
                  </div>
                ) : (
                  <button
                    id="btn-schedule-delivery"
                    onClick={() => setShowScheduleModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-md cursor-pointer transition-all text-center"
                  >
                    Jadwalkan Pengantaran
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
                  <span>{isOnMyWayActive ? "Terkirim: Dalam Perjalanan" : "Saya sedang menuju gerai"}</span>
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

      {/* Official Verified Pricing & Weight - Locked and Read-only for Customer */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="border-b pb-2.5 sm:pb-3 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#cd6184] shrink-0" />
              <h3 className="text-sm font-bold text-[#254117] leading-snug">
                Verifikasi Timbangan & Harga Akhir
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Resmi & Tetap</span>
            </span>
          </div>
          <p className="text-[11px] text-[#254117]/60 leading-relaxed">
            Ditimbang dan diverifikasi langsung oleh petugas Laundrea. Nilai timbangan dan harga akhir terkunci otomatis dan tidak dapat diubah oleh pelanggan.
          </p>
        </div>

        {/* Clear price comparison: Initial Estimate -> Official Verified Final Price */}
        <div className="grid grid-cols-1 gap-2.5">
          {/* Initial Estimation Card */}
          <div className="p-3 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#254117]/60 font-semibold uppercase tracking-wider">
                Perkiraan Awal Pelanggan
              </span>
              <span className="text-[9px] text-[#254117]/50 font-medium bg-gray-200/70 px-1.5 py-0.5 rounded-md">
                Estimasi Awal
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-black text-[#254117]/75">
                Rp {currentOrder.estimatedPrice.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[10px] text-[#254117]/60 mt-0.5">
              Berdasarkan input awal: {currentOrder.estimatedQuantity} {currentOrder.unit} × Rp {currentOrder.unitPrice.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Official Final Price Card (Locked/Verified) */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#ffecf2] border border-[#cd6184]/40 relative overflow-hidden">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-[#cd6184] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#cd6184]" />
                <span>Harga Verifikasi Akhir</span>
              </span>

              {currentOrder.actualQuantity ? (
                <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold shadow-2xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Diverifikasi Petugas</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[9px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-bold">
                  <Clock className="w-3 h-3" />
                  <span>Menunggu Kurir</span>
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
                    <span className="font-semibold">Timbangan Riil Terverifikasi:</span>
                    <span className="font-black text-[#cd6184]">
                      {currentOrder.actualQuantity} {currentOrder.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#254117]/70">
                    <span>Tarif Resmi:</span>
                    <span>Rp {currentOrder.unitPrice.toLocaleString('id-ID')} / {currentOrder.unit}</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 bg-emerald-50/80 p-1.5 rounded-lg mt-1 font-medium flex items-center gap-1 border border-emerald-200/60">
                    <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Hasil timbangan telah dikunci dan tidak dapat diubah oleh pelanggan.</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-[11px] text-[#254117]/80 font-medium">
                    Kurir akan menimbang langsung pakaian di hadapan Anda saat penjemputan.
                  </p>
                  <p className="text-[10px] text-[#254117]/60 italic">
                    *Total tagihan resmi akan dikunci otomatis setelah penimbangan fisik oleh kurir.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Right Column: Order Details & Payment summary */}
      <div className="space-y-3 sm:space-y-4">
          {/* Summary Card */}
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 space-y-2.5 sm:space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#254117]">Informasi Pesanan</h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#254117]/60 bg-gray-100 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" />
                <span>Terkunci</span>
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#254117]/60">
              {currentOrder.statusTimestamps.booked}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#254117]/70">Pelanggan:</span>
              <span className="font-bold text-[#254117]">
                {currentOrder.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#254117]/70">No. WhatsApp:</span>
              <span className="font-semibold text-[#254117]">
                {currentOrder.customerPhone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#254117]/70">Paket Layanan:</span>
              <span className="font-bold text-[#254117]">{currentOrder.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#254117]/70">Penyerahan:</span>
              <span className="font-medium text-[#254117]">
                {currentOrder.handoverMethod === 'pickup_by_courier' ? 'Dijemput kurir ke alamat' : 'Antar sendiri ke gerai'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#254117]/70">Pengembalian:</span>
              <span className="font-medium text-[#254117]">
                {currentOrder.returnMethod === 'deliver_to_me' ? 'Diantar kurir ke alamat' : 'Ambil sendiri di gerai'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#254117]/70">Jadwal Penjemputan:</span>
              <span className="font-medium text-[#254117]">
                {currentOrder.pickupDate} ({currentOrder.pickupTime})
              </span>
            </div>
            {currentOrder.notes && (
              <div className="flex justify-between">
                <span className="text-[#254117]/70">Catatan Khusus:</span>
                <span className="font-medium text-[#254117] text-right max-w-[180px] truncate">
                  {currentOrder.notes}
                </span>
              </div>
            )}
          </div>

          <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-1.5 text-[10px] text-[#254117]/60">
            <Info className="w-3 h-3 text-[#254117]/50 shrink-0" />
            <span>Rincian pesanan telah dikonfirmasi dan tidak dapat diubah pelanggan.</span>
          </div>

          <div className="pt-2 border-t text-xs text-[#254117]/70 space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#cd6184] shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">{currentOrder.customerAddress}</span>
            </div>
            {currentOrder.courierName && (
              <div className="flex items-center gap-1.5 pt-1">
                <Truck className="w-3.5 h-3.5 text-[#97a273] shrink-0" />
                <span className="text-[11px]">Kurir: <strong className="text-[#254117]">{currentOrder.courierName}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Box */}
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm font-bold text-[#254117]">Status Pembayaran</h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                currentOrder.paymentStatus === 'paid'
                  ? 'bg-[#97a273]/20 text-[#97a273]'
                  : 'bg-[#ffbd59]/30 text-[#254117]'
              }`}
            >
              {currentOrder.paymentStatus === 'paid' ? 'Lunas' : 'Menunggu'}
            </span>
          </div>

          {currentOrder.paymentStatus === 'paid' ? (
            <div className="p-3 sm:p-4 bg-[#97a273]/10 border border-[#97a273]/30 rounded-xl sm:rounded-2xl space-y-2 sm:space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-[#254117]">
                <div className="w-8 h-8 rounded-full bg-[#97a273] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold block text-[#254117]">Pembayaran Lunas</span>
                  <span className="text-[10px] text-[#254117]/70">
                    {currentOrder.paymentMethod === 'qris'
                      ? 'Melalui QRIS E-Wallet'
                      : currentOrder.paymentMethod === 'bank_transfer'
                      ? 'Melalui Transfer Bank'
                      : 'Melalui Tunai (COD)'}{' '}
                    • Terverifikasi
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-[#254117]/80 bg-white/90 p-2.5 rounded-xl border border-[#97a273]/20 flex items-center justify-between">
                <span>Total Biaya Terbayar</span>
                <span className="font-black text-sm text-[#254117]">
                  Rp {(currentOrder.actualPrice || currentOrder.estimatedPrice).toLocaleString('id-ID')}
                </span>
              </div>

              {currentOrder.voucherCode && (
                <div className="text-[10px] text-[#cd6184] font-bold flex items-center justify-between px-1">
                  <span>Diskon Voucher ({currentOrder.voucherCode})</span>
                  <span>-Rp {(currentOrder.voucherDiscount || 0).toLocaleString('id-ID')}</span>
                </div>
              )}

              <p className="text-[10px] text-[#254117]/60 leading-relaxed pt-1">
                Terima kasih! Pembayaran Anda telah diverifikasi oleh sistem. Kode QRIS dan nomor Virtual Account telah ditutup untuk keamanan transaksi.
              </p>
            </div>
          ) : (
            <>
              {currentOrder.paymentMethod === 'qris' && (
                <div className="text-center space-y-2">
                  <div className="w-32 h-32 mx-auto bg-[#ffecf2] p-2.5 rounded-2xl border border-[#cd6184]/30 flex flex-col items-center justify-center">
                    <QrCode className="w-16 h-16 text-[#254117]" />
                    <span className="text-[8px] font-bold text-[#cd6184] mt-1">QRIS STANDAR BI</span>
                  </div>
                  <p className="text-[11px] text-[#254117]/70">
                    Pindai dengan GoPay, OVO, BCA, ShopeePay, atau mobile banking.
                  </p>
                </div>
              )}

              {currentOrder.paymentMethod === 'bank_transfer' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[#254117]/60 block text-[9px]">Virtual Account Mandiri</span>
                    <span className="font-mono text-xs font-bold text-[#254117] tracking-wider block mt-0.5">
                      8923 0812 3456 7890
                    </span>
                  </div>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-[#254117]/60 block text-[9px]">Virtual Account BCA</span>
                    <span className="font-mono text-xs font-bold text-[#254117] tracking-wider block mt-0.5">
                      1280 0812 3456 7890
                    </span>
                  </div>
                </div>
              )}

              {currentOrder.paymentMethod === 'cod' && (
                <div className="p-3 bg-[#ffecf2] rounded-2xl border border-[#cd6184]/30 text-center space-y-1">
                  <Banknote className="w-6 h-6 text-[#cd6184] mx-auto" />
                  <span className="text-xs font-bold text-[#254117] block">Bayar di Tempat (COD)</span>
                  <p className="text-[10px] text-[#254117]/80">
                    Silakan siapkan uang pas untuk diberikan kepada kurir saat pesanan tiba.
                  </p>
                </div>
              )}

              <button
                type="button"
                id="btn-mark-order-paid-sim"
                onClick={() => updateOrderPaymentStatus(currentOrder.id, 'paid')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#254117] hover:bg-[#1b3010] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#ffbd59]" />
                <span>Konfirmasi Saya Sudah Bayar</span>
              </button>
            </>
          )}

          <div className="pt-1 text-[10px] text-[#254117]/60 flex items-center justify-between border-t border-gray-100">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#97a273]" />
              Jaminan Higienis
            </span>
            <span className="text-[#cd6184] font-semibold">100% Bersih & Rapi</span>
          </div>
        </div>
      </div>
      </div>

      {/* Schedule Delivery Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#254117]">Jadwalkan Waktu Pengantaran</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#254117]/70">
              Pilih waktu yang paling nyaman untuk kurir mengantar pakaian Anda.
            </p>

            <div className="space-y-2">
              {[
                'Hari ini, 17:00 - 19:00',
                'Besok, 09:00 - 11:00',
                'Besok, 13:00 - 15:00',
                'Besok, 17:00 - 19:00',
              ].map((timeOption) => (
                <button
                  key={timeOption}
                  onClick={() => setDeliveryDate(timeOption)}
                  className={`w-full p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                    deliveryDate === timeOption
                      ? 'border-[#cd6184] bg-[#ffecf2] text-[#cd6184]'
                      : 'border-gray-200 hover:bg-gray-50 text-[#254117]'
                  }`}
                >
                  {timeOption}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSchedule}
                disabled={isScheduling}
                className="w-2/3 py-2.5 rounded-xl bg-[#cd6184] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                {isScheduling ? 'Menyimpan...' : 'Konfirmasi Pengantaran'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
