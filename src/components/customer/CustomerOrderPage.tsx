import React, { useState, useId } from 'react';
import { useApp } from '../../context/AppContext';
import { PlanType, HandoverMethod, ReturnMethod, PaymentMethod, CustomerVoucher } from '../../types';
import {
  Check,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  QrCode,
  Banknote,
  Sparkles,
  Info,
  ChevronRight,
  Truck,
  Store,
  ShoppingBag,
  ArrowLeft,
  User,
  Ticket,
  Tag,
  X,
  CheckCircle2,
} from 'lucide-react';

interface CustomerOrderPageProps {
  onOrderSuccess: (orderId: string) => void;
  onBackToLanding?: () => void;
  initialPlanId?: PlanType;
  initialVoucherCode?: string;
}

export const CustomerOrderPage: React.FC<CustomerOrderPageProps> = ({
  onOrderSuccess,
  onBackToLanding,
  initialPlanId,
  initialVoucherCode,
}) => {
  const { plans, createOrder, customerPhone, customerVouchers } = useApp();

  // Step in checkout flow: 'select' (plan, quantity, handover, return, schedule) or 'confirm' (summary & payment)
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'confirm'>('select');

  // Form states
  const [selectedPlanId, setSelectedPlanId] = useState<PlanType>(initialPlanId || 'express');
  const [estimatedQuantity, setEstimatedQuantity] = useState<number>(4);
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>('pickup_by_courier');
  const [returnMethod, setReturnMethod] = useState<ReturnMethod>('deliver_to_me');

  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('laundrea_cust_name') || 'Yaya';
  });
  const [customerAddress, setCustomerAddress] = useState(() => {
    return (
      localStorage.getItem('laundrea_cust_address') ||
      'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan'
    );
  });
  const [notes, setNotes] = useState('Pakaian katun & kemeja kerja');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  // Today + 1 day as default pickup date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];
  const [scheduleDate, setScheduleDate] = useState(defaultDate);
  const [scheduleTime, setScheduleTime] = useState('10:00 - 12:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];
  const isKg = selectedPlan.unit === 'kg';
  const minQty = selectedPlan.minOrder || 1;
  const currentPrice = selectedPlan.price * estimatedQuantity;

  // Voucher states & logic
  const activeCustomerVouchers = customerVouchers.filter((v) => !v.isUsed);
  const [voucherInputCode, setVoucherInputCode] = useState(initialVoucherCode || '');
  const [appliedVoucher, setAppliedVoucher] = useState<CustomerVoucher | null>(() => {
    if (initialVoucherCode) {
      return customerVouchers.find((v) => v.code.toLowerCase() === initialVoucherCode.toLowerCase() && !v.isUsed) || null;
    }
    return null;
  });
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(() => {
    if (initialVoucherCode) {
      const v = customerVouchers.find((v) => v.code.toLowerCase() === initialVoucherCode.toLowerCase() && !v.isUsed);
      return v ? `Voucher ${v.title} aktif!` : null;
    }
    return null;
  });

  const calculateDiscount = (voucher: CustomerVoucher | null, subtotal: number): number => {
    if (!voucher) return 0;
    if (voucher.discountType === 'free_wash') {
      return Math.min(subtotal, voucher.maxDiscount || 35000);
    }
    if (voucher.discountType === 'percentage') {
      const pctDiscount = (subtotal * voucher.discountValue) / 100;
      return Math.min(pctDiscount, voucher.maxDiscount || Infinity);
    }
    if (voucher.discountType === 'fixed') {
      return Math.min(subtotal, voucher.discountValue);
    }
    return 0;
  };

  const discountAmount = calculateDiscount(appliedVoucher, currentPrice);
  const finalEstimatedPrice = Math.max(0, currentPrice - discountAmount);

  const handleApplyVoucherCode = (codeToApply: string) => {
    setVoucherError(null);
    setVoucherSuccess(null);
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) {
      setVoucherError('Silakan masukkan kode voucher terlebih dahulu.');
      return;
    }
    const found = customerVouchers.find((v) => v.code.toUpperCase() === cleanCode);
    if (!found) {
      setVoucherError('Kode voucher tidak ditemukan atau tidak valid.');
      return;
    }
    if (found.isUsed) {
      setVoucherError('Voucher ini sudah pernah digunakan pada pesanan lain.');
      return;
    }
    if (found.minOrderValue && currentPrice < found.minOrderValue) {
      setVoucherError(`Minimal nilai pesanan untuk voucher ini adalah Rp ${found.minOrderValue.toLocaleString('id-ID')}.`);
      return;
    }

    setAppliedVoucher(found);
    setVoucherInputCode(found.code);
    const disc = calculateDiscount(found, currentPrice);
    setVoucherSuccess(`Voucher ${found.title} berhasil diterapkan! Hemat Rp ${disc.toLocaleString('id-ID')}`);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherInputCode('');
    setVoucherError(null);
    setVoucherSuccess(null);
  };

  const handlePlanSelect = (id: PlanType) => {
    setSelectedPlanId(id);
    const targetPlan = plans.find((p) => p.id === id);
    if (targetPlan && estimatedQuantity < (targetPlan.minOrder || 1)) {
      setEstimatedQuantity(targetPlan.minOrder || 1);
    }
  };

  const handleContinueToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    if (
      (handoverMethod === 'pickup_by_courier' || returnMethod === 'deliver_to_me') &&
      !customerAddress.trim()
    ) {
      return;
    }
    setCheckoutStep('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalConfirmOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newOrder = createOrder({
        customerName,
        customerPhone,
        customerAddress:
          handoverMethod === 'store_dropoff' && returnMethod === 'self_pickup'
            ? 'Laundrea Central Hub (Drop-off & Ambil Sendiri)'
            : customerAddress,
        planId: selectedPlanId,
        estimatedQuantity,
        pickupDate: scheduleDate,
        pickupTime: scheduleTime,
        handoverMethod,
        returnMethod,
        notes,
        paymentMethod,
        voucherCode: appliedVoucher?.code,
        voucherDiscount: discountAmount,
      });

      setIsSubmitting(false);
      onOrderSuccess(newOrder.id);
    }, 600);
  };

  const nameInputId = useId();
  const addressInputId = useId();
  const quantityInputId = useId();
  const dateInputId = useId();
  const notesInputId = useId();

  const scheduleLabel =
    handoverMethod === 'pickup_by_courier'
      ? 'Jadwal Penjemputan'
      : 'Jadwal Antar ke Gerai';

  return (
    <div id="customer-order-flow" className="w-full">
      {/* Top back button */}
      <div className="flex items-center justify-between mb-6">
        {checkoutStep === 'confirm' ? (
          <button
            type="button"
            onClick={() => setCheckoutStep('select')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#cd6184] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Pilihan Paket</span>
          </button>
        ) : onBackToLanding ? (
          <button
            type="button"
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#254117]/70 hover:text-[#cd6184] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        ) : null}

        <div className="text-right">
          <span className="text-xs font-semibold text-[#cd6184] bg-[#ffecf2] px-3 py-1 rounded-full">
            {checkoutStep === 'select' ? 'Langkah 1 dari 2: Konfigurasi Pesanan' : 'Langkah 2 dari 2: Konfirmasi Pesanan'}
          </span>
        </div>
      </div>

      {checkoutStep === 'select' ? (
        <form onSubmit={handleContinueToConfirmation} className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#254117] tracking-tight">
              Pilih Paket Layanan
            </h1>
            <p className="text-[#254117]/75 text-sm mt-1">
              Tentukan jenis layanan, perkiraan berat/jumlah, dan jadwalkan waktu penjemputan atau pengantaran Anda.
            </p>
          </div>

          {/* Section 1: Choose your plan (3 cards) */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cd6184] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Pilihan Paket Layanan</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const isExpress = plan.id === 'express';

                return (
                  <div
                    key={plan.id}
                    id={`plan-card-${plan.id}`}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative cursor-pointer rounded-2xl p-5 transition-all duration-200 border-2 flex flex-col justify-between ${
                      isSelected
                        ? isExpress
                          ? 'border-[#254117] bg-[#ffecf2] shadow-md ring-2 ring-[#cd6184]/30 scale-[1.02]'
                          : 'border-[#cd6184] bg-[#ffecf2] shadow-md scale-[1.01]'
                        : isExpress
                        ? 'border-[#ffbd59] bg-[#ffecf2]/30 hover:bg-[#ffecf2]/60'
                        : 'border-gray-200 bg-white hover:border-[#cd6184]/40 hover:bg-[#ffecf2]/20'
                    }`}
                  >
                    {/* Express Most Popular badge */}
                    {isExpress && (
                      <div className="absolute -top-3 right-4 bg-[#ffbd59] text-[#254117] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#254117]" />
                        <span>PALING POPULER</span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#254117]">{plan.name}</h3>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#cd6184] border-[#cd6184] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-[#254117]">
                          Rp {plan.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-[#254117]/60 font-medium">/{plan.unit}</span>
                      </div>

                      <p className="text-xs font-semibold text-[#97a273] mt-1.5 bg-[#97a273]/15 inline-block px-2 py-0.5 rounded-md">
                        {plan.turnaroundTime}
                      </p>

                      <div className="mt-4 pt-3.5 border-t border-[#254117]/10 space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#254117]/85">
                            <Check className="w-3.5 h-3.5 text-[#97a273] shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 text-[11px] text-[#254117]/60 font-medium border-t border-[#254117]/5">
                      {plan.minOrder ? `Min. pemesanan ${plan.minOrder} ${plan.unit}` : 'Mulai dari 1 pakaian'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Estimated weight/quantity */}
          <div className="bg-[#ffecf2]/60 rounded-3xl p-5 sm:p-6 border border-[#cd6184]/25 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#cd6184] text-white text-xs flex items-center justify-center font-bold">
                  2
                </span>
                <span>Perkiraan Berat / Jumlah</span>
              </h2>
              <span className="text-xs font-bold text-[#cd6184]">
                {selectedPlan.name}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#254117]/80">
                <label htmlFor={quantityInputId} className="font-semibold">
                  Atur perkiraan {isKg ? 'berat (kg)' : 'jumlah satuan (pcs)'}:
                </label>
                <span className="text-[11px] font-medium text-[#254117]/60">
                  Minimal: {minQty} {selectedPlan.unit}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <input
                  id={quantityInputId}
                  type="range"
                  min={minQty}
                  max={isKg ? 25 : 15}
                  step={isKg ? 0.5 : 1}
                  value={estimatedQuantity}
                  onChange={(e) => setEstimatedQuantity(parseFloat(e.target.value))}
                  className="flex-1 accent-[#cd6184] cursor-pointer h-2.5 bg-white rounded-lg"
                />
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#cd6184]/40 shadow-xs">
                  <input
                    type="number"
                    min={minQty}
                    step={isKg ? 0.5 : 1}
                    value={estimatedQuantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || minQty;
                      setEstimatedQuantity(Math.max(minQty, val));
                    }}
                    className="w-14 text-center font-extrabold text-[#254117] text-base focus:outline-none"
                  />
                  <span className="text-xs text-[#254117]/70 font-bold">{selectedPlan.unit}</span>
                </div>
              </div>

              {/* Quick pills */}
              <div className="flex gap-2 pt-1">
                {[minQty, minQty + 2, minQty + 4, minQty + 6].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setEstimatedQuantity(qty)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      estimatedQuantity === qty
                        ? 'bg-[#cd6184] text-white shadow-xs'
                        : 'bg-white text-[#254117]/80 border border-gray-200 hover:bg-white/80'
                    }`}
                  >
                    {qty} {selectedPlan.unit}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time calculated price estimate */}
            <div className="bg-white rounded-2xl p-4 border border-[#cd6184]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-xs text-[#254117]/70 font-semibold uppercase tracking-wider block">
                  Perkiraan Total Biaya
                </span>
                <div className="text-3xl font-black text-[#97a273] mt-0.5">
                  Rp {currentPrice.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-xs text-[#254117]/70 space-y-0.5 text-left sm:text-right">
                <p>
                  {estimatedQuantity} {selectedPlan.unit} × Rp {selectedPlan.price.toLocaleString('id-ID')}
                </p>
                <p className="text-[#97a273] font-bold">Sudah Termasuk Antar-Jemput Gratis</p>
              </div>
            </div>
          </div>

          {/* Section 3: How will you send your items? */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cd6184] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Metode Penyerahan Pakaian</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                id="opt-handover-pickup"
                onClick={() => setHandoverMethod('pickup_by_courier')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  handoverMethod === 'pickup_by_courier'
                    ? 'border-[#cd6184] bg-[#ffecf2] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#cd6184]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    handoverMethod === 'pickup_by_courier'
                      ? 'bg-[#cd6184] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#254117]">Dijemput oleh kurir</span>
                    {handoverMethod === 'pickup_by_courier' && (
                      <Check className="w-4 h-4 text-[#cd6184] stroke-[3]" />
                    )}
                  </div>
                  <p className="text-xs text-[#254117]/70 mt-1">
                    Kurir kami akan datang langsung ke alamat Anda dengan kantong bersih ramah lingkungan.
                  </p>
                </div>
              </div>

              <div
                id="opt-handover-dropoff"
                onClick={() => setHandoverMethod('store_dropoff')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  handoverMethod === 'store_dropoff'
                    ? 'border-[#cd6184] bg-[#ffecf2] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#cd6184]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    handoverMethod === 'store_dropoff'
                      ? 'bg-[#cd6184] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#254117]">Antar ke gerai</span>
                    {handoverMethod === 'store_dropoff' && (
                      <Check className="w-4 h-4 text-[#cd6184] stroke-[3]" />
                    )}
                  </div>
                  <p className="text-xs text-[#254117]/70 mt-1">
                    Serahkan pakaian Anda secara mandiri di gerai pusat Laundrea terdekat kapan saja.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: How do you want it back? */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cd6184] text-white text-xs flex items-center justify-center font-bold">
                4
              </span>
              <span>Metode Pengembalian Pakaian</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                id="opt-return-deliver"
                onClick={() => setReturnMethod('deliver_to_me')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  returnMethod === 'deliver_to_me'
                    ? 'border-[#cd6184] bg-[#ffecf2] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#cd6184]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    returnMethod === 'deliver_to_me'
                      ? 'bg-[#cd6184] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#254117]">Diantar ke alamat saya</span>
                    {returnMethod === 'deliver_to_me' && (
                      <Check className="w-4 h-4 text-[#cd6184] stroke-[3]" />
                    )}
                  </div>
                  <p className="text-xs text-[#254117]/70 mt-1">
                    Pakaian bersih, wangi, dan rapi dilipat akan diantar kembali ke pintu rumah Anda.
                  </p>
                </div>
              </div>

              <div
                id="opt-return-self"
                onClick={() => setReturnMethod('self_pickup')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                  returnMethod === 'self_pickup'
                    ? 'border-[#cd6184] bg-[#ffecf2] shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#cd6184]/30'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    returnMethod === 'self_pickup'
                      ? 'bg-[#cd6184] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#254117]">Ambil sendiri di gerai</span>
                    {returnMethod === 'self_pickup' && (
                      <Check className="w-4 h-4 text-[#cd6184] stroke-[3]" />
                    )}
                  </div>
                  <p className="text-xs text-[#254117]/70 mt-1">
                    Ambil langsung di konter kasir gerai kami saat Anda sedang senggang.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Pickup/Schedule & Contact Details */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#cd6184] text-white text-xs flex items-center justify-center font-bold">
                5
              </span>
              <span>{scheduleLabel} & Data Pemesan</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
                <div>
                  <label htmlFor={dateInputId} className="block text-xs font-semibold text-[#254117] mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#cd6184]" />
                    <span>Pilihan Tanggal</span>
                  </label>
                  <input
                    id={dateInputId}
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#cd6184]" />
                    <span>Pilihan Jam Layanan</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['09:00 - 11:00', '11:00 - 13:00', '13:00 - 15:00', '15:00 - 17:00'].map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setScheduleTime(slot)}
                        className={`py-2 px-2 text-xs rounded-lg font-medium border text-center transition-all cursor-pointer ${
                          scheduleTime === slot
                            ? 'border-[#cd6184] bg-[#ffecf2] text-[#cd6184] font-bold'
                            : 'border-gray-200 hover:bg-gray-50 text-[#254117]/80'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3">
                <div>
                  <label htmlFor={nameInputId} className="block text-xs font-semibold text-[#254117] mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-[#cd6184]" />
                    <span>Nama Lengkap</span>
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                    required
                  />
                </div>

                {(handoverMethod === 'pickup_by_courier' || returnMethod === 'deliver_to_me') && (
                  <div>
                    <label htmlFor={addressInputId} className="block text-xs font-semibold text-[#254117] mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#cd6184]" />
                      <span>Alamat Lengkap (untuk Kurir)</span>
                    </label>
                    <textarea
                      id={addressInputId}
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Nama jalan, nomor rumah/unit, patokan..."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor={notesInputId} className="block text-xs font-semibold text-[#254117] mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#254117]/60" />
                    <span>Catatan Tambahan (opsional)</span>
                  </label>
                  <input
                    id={notesInputId}
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tolong pisahkan kemeja putih"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#cd6184]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Voucher / Kupon Diskon */}
          <div className="bg-[#ffecf2]/60 rounded-3xl p-5 sm:p-6 border border-[#cd6184]/25 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#cd6184] text-white text-xs flex items-center justify-center font-bold">
                  5
                </span>
                <span>Gunakan Voucher / Kupon Diskon</span>
              </h2>
              {appliedVoucher && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[3]" />
                  Voucher Diterapkan
                </span>
              )}
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 space-y-3.5 shadow-xs">
              {/* Voucher input form */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#254117]">
                  Punya Kode Voucher?
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Tag className="w-4 h-4 text-[#cd6184]" />
                    </div>
                    <input
                      id="input-voucher-code"
                      type="text"
                      value={voucherInputCode}
                      onChange={(e) => {
                        setVoucherInputCode(e.target.value.toUpperCase());
                        setVoucherError(null);
                      }}
                      placeholder="Masukkan kode voucher (cth: STEMPEL10-FREE)"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#254117] focus:outline-none focus:border-[#cd6184]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      id="btn-apply-voucher"
                      onClick={() => handleApplyVoucherCode(voucherInputCode)}
                      className="px-5 py-2.5 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      Terapkan
                    </button>

                    {appliedVoucher && (
                      <button
                        type="button"
                        id="btn-remove-voucher"
                        onClick={handleRemoveVoucher}
                        className="px-3 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Batalkan Voucher"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Error or Success feedback */}
              {voucherError && (
                <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>{voucherError}</span>
                </p>
              )}

              {voucherSuccess && appliedVoucher && (
                <div className="p-3 bg-[#97a273]/15 border border-[#97a273]/40 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#97a273] shrink-0" />
                    <div>
                      <span className="font-bold text-[#254117] block">
                        {appliedVoucher.title} ({appliedVoucher.code})
                      </span>
                      <span className="text-[11px] text-[#254117]/70">
                        {appliedVoucher.description}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-[#97a273] text-sm shrink-0">
                    -Rp {discountAmount.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              {/* Quick-select Customer Vouchers List */}
              {activeCustomerVouchers.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <span className="text-[11px] font-bold text-[#254117]/70 block">
                    Voucher Aktif Anda ({activeCustomerVouchers.length} tersedia, klik untuk pakai):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCustomerVouchers.map((v) => {
                      const isSelected = appliedVoucher?.code === v.code;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              handleRemoveVoucher();
                            } else {
                              handleApplyVoucherCode(v.code);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#cd6184] text-white border-[#cd6184] shadow-xs'
                              : 'bg-gray-50 hover:bg-[#ffecf2] border-gray-200 text-[#254117]'
                          }`}
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>{v.code}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/25 text-white' : 'bg-[#ffecf2] text-[#cd6184]'}`}>
                            {v.discountType === 'free_wash' ? 'Cuci Gratis' : 'Diskon'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Price calculation with discount summary */}
              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#254117]/60 block text-[11px]">Subtotal Pesanan</span>
                  <span className="font-bold text-[#254117]">
                    {estimatedQuantity} {selectedPlan.unit} × Rp {selectedPlan.price.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  {appliedVoucher ? (
                    <div>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-[11px] text-[#254117]/60 line-through">
                          Rp {currentPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-base font-black text-[#97a273]">
                          Rp {finalEstimatedPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#cd6184] font-bold block">
                        Hemat Rp {discountAmount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-black text-[#97a273]">
                      Rp {currentPrice.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mandated note */}
          <div className="bg-[#ffecf2] border border-[#cd6184]/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#254117]">
            <Info className="w-4 h-4 text-[#cd6184] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Berat sebenarnya dan total biaya akhir akan dikonfirmasi melalui WhatsApp sebelum proses pencucian dimulai.
            </p>
          </div>

          {/* Continue button */}
          <div className="pt-2">
            <button
              id="btn-continue-confirmation"
              type="submit"
              className="w-full py-4 px-6 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-[#cd6184]/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
            >
              <span>Lanjut ke Konfirmasi Pesanan</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        /* Pre-confirmation View: Order Summary & Payment */
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#254117] tracking-tight">
              Konfirmasi Pesanan
            </h1>
            <p className="text-[#254117]/75 text-sm mt-1">
              Silakan periksa ringkasan pesanan Laundrea Anda dan tentukan metode pembayaran.
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#ffecf2] shadow-md space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-[#cd6184] uppercase tracking-wider">
                  Paket Terpilih
                </span>
                <h3 className="text-xl font-bold text-[#254117] mt-0.5">{selectedPlan.name}</h3>
                <span className="text-xs text-[#97a273] font-semibold">{selectedPlan.turnaroundTime}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#254117]/60 block font-medium">
                  {appliedVoucher ? 'Total Setelah Diskon' : 'Perkiraan Total'}
                </span>
                <span className="text-2xl font-black text-[#97a273]">
                  Rp {finalEstimatedPrice.toLocaleString('id-ID')}
                </span>
                {appliedVoucher && (
                  <span className="text-[11px] text-[#cd6184] line-through block font-medium">
                    Rp {currentPrice.toLocaleString('id-ID')}
                  </span>
                )}
              </div>
            </div>

            {appliedVoucher && (
              <div className="bg-[#97a273]/10 border border-[#97a273]/30 p-3 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#97a273]" />
                  <div>
                    <span className="font-bold text-[#254117] block">
                      Voucher Digunakan ({appliedVoucher.code})
                    </span>
                    <span className="text-[11px] text-[#254117]/70">
                      {appliedVoucher.title}
                    </span>
                  </div>
                </div>
                <span className="font-black text-[#97a273] text-sm">
                  - Rp {discountAmount.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-[#ffecf2]/40 p-3.5 rounded-2xl">
                <p className="font-semibold text-[#254117] text-sm">Rincian Layanan</p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Perkiraan Jumlah:</span> {estimatedQuantity} {selectedPlan.unit}
                </p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Tarif Satuan:</span> Rp {selectedPlan.price.toLocaleString('id-ID')}/{selectedPlan.unit}
                </p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Penyerahan:</span>{' '}
                  {handoverMethod === 'pickup_by_courier' ? 'Dijemput oleh kurir' : 'Antar ke gerai'}
                </p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Pengembalian:</span>{' '}
                  {returnMethod === 'deliver_to_me' ? 'Diantar ke alamat saya' : 'Ambil sendiri di gerai'}
                </p>
              </div>

              <div className="space-y-2 bg-[#ffecf2]/40 p-3.5 rounded-2xl">
                <p className="font-semibold text-[#254117] text-sm">Jadwal & Data Pemesan</p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Tanggal:</span> {scheduleDate}
                </p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Waktu:</span> {scheduleTime}
                </p>
                <p className="text-[#254117]/80">
                  <span className="font-medium">Pemesan:</span> {customerName} ({customerPhone})
                </p>
                <p className="text-[#254117]/80 line-clamp-2">
                  <span className="font-medium">Alamat:</span> {customerAddress}
                </p>
              </div>
            </div>

            {notes && (
              <div className="text-xs text-[#254117]/80 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="font-semibold text-[#254117]">Catatan:</span> {notes}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#254117]">Pilih Metode Pembayaran</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('qris')}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'qris'
                    ? 'border-[#cd6184] bg-[#ffecf2]'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-[#cd6184] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-[#254117] block">QRIS E-Wallet</span>
                  <span className="text-xs text-[#254117]/70">BCA, GoPay, OVO, ShopeePay</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-[#cd6184] bg-[#ffecf2]'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[#cd6184] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-[#254117] block">Transfer Bank</span>
                  <span className="text-xs text-[#254117]/70">Virtual Account BCA & Mandiri</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-[#cd6184] bg-[#ffecf2]'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-[#cd6184] shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-bold text-[#254117] block">Bayar di Tempat (COD)</span>
                  <span className="text-xs text-[#254117]/70">Bayar tunai saat pesanan sampai</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mandated note */}
          <div className="bg-[#ffecf2] border border-[#cd6184]/30 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#254117]">
            <Info className="w-4 h-4 text-[#cd6184] shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Berat sebenarnya dan total biaya akhir akan dikonfirmasi melalui WhatsApp sebelum proses pencucian dimulai.
            </p>
          </div>

          {/* Confirm Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setCheckoutStep('select')}
              className="py-3.5 px-5 rounded-2xl border border-gray-300 text-[#254117] font-bold text-sm hover:bg-gray-50 transition-all cursor-pointer"
            >
              Ubah Rincian
            </button>
            <button
              id="btn-confirm-order"
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalConfirmOrder}
              className="flex-1 py-4 px-6 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-[#cd6184]/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <span>Konfirmasi Pesanan</span>
                  <Check className="w-5 h-5 stroke-[3]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
