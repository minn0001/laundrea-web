import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { CourierLogin } from './CourierLogin';
import { BrandWordmark } from '../common/BrandWordmark';
import {
  Truck,
  MapPin,
  Clock,
  Package,
  Scale,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Calendar,
  Phone,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  MessageSquare,
  Check,
  User,
  History,
  ShieldCheck,
  Info,
  Lock,
  Pencil,
  Banknote,
  Leaf,
} from 'lucide-react';

export const CourierApp: React.FC = () => {
  const {
    isCourierLoggedIn,
    loginCourier,
    logoutCourier,
    courierUsername,
    currentStaffUser,
    orders,
    couriers,
    plans,
    updateOrderWeight,
    rejectOrderRecycle,
    updateOrderStatus,
    confirmCodCashReceived,
    hasPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'profile'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Detail view state
  const [weightInput, setWeightInput] = useState<string>('');
  const [recycleWeightInput, setRecycleWeightInput] = useState<string>('');
  const [showRejectRecycleModal, setShowRejectRecycleModal] = useState<boolean>(false);
  const [rejectReasonChoice, setRejectReasonChoice] = useState<string>('Basah / lembap');
  const [rejectReasonCustom, setRejectReasonCustom] = useState<string>('');
  const [recycleValidationError, setRecycleValidationError] = useState<string | null>(null);
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  if (!isCourierLoggedIn) {
    return <CourierLogin onLogin={loginCourier} />;
  }

  if (!hasPermission('courier_task_access')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-[#254117]">Akses Ditolak</h2>
        <p className="text-xs text-gray-600 mt-1 max-w-sm">
          Akun Anda tidak memiliki wewenang Akses Portal & Tugas Kurir (courier_task_access).
        </p>
        <button
          onClick={logoutCourier}
          className="mt-4 px-4 py-2 bg-[#254117] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Keluar
        </button>
      </div>
    );
  }

      // Cocokkan kurir: 1) lewat akun sistem, 2) lewat username, 3) tidak ada
  const usernameKey = (courierUsername || '').toLowerCase().replace('@', '');
  const rawCourier =
    couriers.find(
      (c) =>
        currentStaffUser &&
        (c.name.toLowerCase() === currentStaffUser.name.toLowerCase() ||
          c.phone === currentStaffUser.phone)
    ) ||
    couriers.find((c) => {
      const firstName = (c.name || '').toLowerCase().split(' ')[0];
      return firstName && usernameKey.includes(firstName);
    }) ||
    undefined;

  const currentCourier = {
    id: rawCourier?.id || 'cr-unknown',
    name: rawCourier?.name || courierUsername,
    phone: rawCourier?.phone || '0812-8877-1122',
    status: rawCourier?.status || 'active',
    activePickupsCount: rawCourier?.activePickupsCount ?? 2,
    completedTodayCount: rawCourier?.completedTodayCount ?? 5,
    completedThisWeekCount: rawCourier?.completedThisWeekCount ?? 18,
    vehicle: rawCourier?.vehicle || 'Motor Honda Vario (B 4829 SJA)',
  };

  // Filter orders: hanya tugas milik kurir yang sedang login
  const myOrders = orders.filter((o) => o.courierId === currentCourier.id);
  const activeOrders = myOrders.filter((o) => o.status !== 'delivered');
  const completedOrders = myOrders.filter((o) => o.status === 'delivered');

  const pickupTasksCount = activeOrders.filter(
    (o) => (o.status === 'pickup' || o.status === 'picked_up') && o.handoverMethod !== 'store_dropoff'
  ).length;

  const deliveryTasksCount = activeOrders.filter(
    (o) => o.status === 'ready' && o.returnMethod !== 'self_pickup'
  ).length;

  const filteredTasks = activeOrders.filter((o) => {
    if (taskFilter === 'pickup') {
      return (o.status === 'pickup' || o.status === 'picked_up') && o.handoverMethod !== 'store_dropoff';
    }
    if (taskFilter === 'delivery') {
      return o.status === 'ready' && o.returnMethod !== 'self_pickup';
    }
    return true;
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const getStatusLabel = (status: OrderStatus | string) => {
    switch (status) {
      case 'pickup':
        return 'Penjemputan';
      case 'picked_up':
        return 'Sudah Dijemput (Bawa ke Gerai)';
      case 'washing':
        return 'Pencucian (Gerai)';
      case 'drying':
        return 'Pengeringan (Gerai)';
      case 'ironing':
        return 'Penyetrikaan (Gerai)';
      case 'ready':
        return 'Siap Antar';
      case 'delivered':
        return 'Selesai';
      default:
        return status;
    }
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrderId(order.id);
    setWeightInput(order.actualQuantity ? order.actualQuantity.toString() : '');
    // If a payment method is chosen by customer, the weight is locked (no more Edit)
    const isLockedByCustomerMethod = Boolean(order.paymentMethod);
    setIsEditingWeight(!order.actualQuantity && !isLockedByCustomerMethod);
    setSuccessMessage(null);
    setRecycleValidationError(null);
    setShowRejectRecycleModal(false);
    setRejectReasonChoice('Basah / lembap');
    setRejectReasonCustom('');

    if (order.recycle?.enabled) {
      setRecycleWeightInput(
        order.recycle.actualKg !== null && order.recycle.actualKg !== undefined
          ? order.recycle.actualKg.toString()
          : ''
      );
    } else {
      setRecycleWeightInput('');
    }
  };

    const recycleWashKgPreview = (() => {
    const rc = selectedOrder?.recycle;
    if (!rc?.enabled || rc.mode !== 'wash_first' || rc.status === 'rejected') return 0;
    return Math.max(0, parseFloat(recycleWeightInput) || 0);
  })();

    const recycleWashRatePreview = selectedOrder
      ? selectedOrder.unit === 'kg'
        ? selectedOrder.unitPrice
        : plans.find((p) => p.unit === 'kg')?.price ?? selectedOrder.unitPrice
      : 0;
  
    const recycleWashPricePreview = Math.round(recycleWashRatePreview * recycleWashKgPreview);

  const calculatedNewPrice = (() => {
    if (!selectedOrder) return 0;
    const qty = parseFloat(weightInput) > 0 ? parseFloat(weightInput) : (selectedOrder.actualQuantity || selectedOrder.estimatedQuantity);
    const gross = Math.round(selectedOrder.unitPrice * qty) + recycleWashPricePreview;
    const disc = selectedOrder.voucherCode && selectedOrder.voucherDiscount ? Math.min(selectedOrder.voucherDiscount, gross) : 0;
    return Math.max(0, gross - disc);
  })();
  
    const num = parseFloat(weightInput);
    if (isNaN(num) || num <= 0) return;

    setRecycleValidationError(null);

    let recNum: number | undefined = undefined;
    if (selectedOrder.recycle?.enabled && selectedOrder.recycle.status !== 'rejected') {
      const parsedRec = parseFloat(recycleWeightInput);
      recNum = isNaN(parsedRec) || parsedRec <= 0 ? 0 : parsedRec;

      // Validation for wash_first: recycling clothes must be <= main weight
      if (selectedOrder.recycle.mode === 'wash_first' && recNum > num) {
        setRecycleValidationError(
          'Berat baju daur ulang tidak boleh melebihi total berat cucian (karena baju daur ulang dicuci bersama cucian ini).'
        );
        return;
      }

      // Confirmation if 0 or empty
      if (recNum === 0) {
        const confirmed = window.confirm('Tidak ada baju daur ulang yang diambil?');
        if (!confirmed) return;
      }
    }

    setIsUpdating(true);
    setTimeout(() => {
      updateOrderWeight(selectedOrder.id, num, recNum);
      setIsUpdating(false);
      setIsEditingWeight(false);
      setSuccessMessage('Berat berhasil disimpan & total tagihan dibuka untuk pembayaran pelanggan');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 300);
  };

  const handleConfirmRejectRecycle = () => {
    if (!selectedOrder) return;
    const reason = rejectReasonChoice === 'Lainnya' ? rejectReasonCustom.trim() : rejectReasonChoice;
    if (!reason) {
      alert('Pilih atau tuliskan alasan penolakan.');
      return;
    }

    setIsUpdating(true);
    setTimeout(() => {
      rejectOrderRecycle(selectedOrder.id, reason);
      setIsUpdating(false);
      setShowRejectRecycleModal(false);
      setRecycleWeightInput('0');
      setSuccessMessage('Baju daur ulang berhasil ditolak. Pesanan cucian berlanjut.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 300);
  };

  // Courier Handover Actions: Courier only handles Pickup and Delivery
  const handleConfirmPickup = () => {
    if (!selectedOrder) return;
    if (!hasPermission('courier_handover_update')) {
      alert('Akses ditolak: Anda tidak memiliki wewenang konfirmasi jemput kurir.');
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      updateOrderStatus(selectedOrder.id, 'picked_up');
      setIsUpdating(false);
      setSuccessMessage('Cucian berhasil dijemput! Silakan bawa ke gerai. Tahap Pencucian dimulai oleh Admin.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 400);
  };

  const handleConfirmDelivery = () => {
    if (!selectedOrder) return;
    if (!hasPermission('courier_handover_update')) {
      alert('Akses ditolak: Anda tidak memiliki wewenang serah terima antar kurir.');
      return;
    }
    setIsUpdating(true);
    setTimeout(() => {
      updateOrderStatus(selectedOrder.id, 'delivered');
      setIsUpdating(false);
      setSuccessMessage('Pengantaran berhasil! Pakaian telah diserahterimakan kepada pelanggan.');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 400);
  };

  return (
    <div id="courier-app-container" className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Header */}
      <header className="bg-[#254117] text-white p-3.5 sm:p-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandWordmark size="header" showLogo variant="light" />
          </div>

          {/* Round Profile Icon matching Pelanggan (Customer) portal header style */}
          <div className="relative">
            <button
              type="button"
              id="btn-courier-profile-menu"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              title="Profil Kurir"
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-xs ${
                isProfileMenuOpen
                  ? 'bg-white text-[#cd6184] border-white ring-2 ring-white/30'
                  : 'bg-white/15 hover:bg-white/25 border-white/20 text-white'
              }`}
            >
              <User className="w-4.5 h-4.5" />
            </button>

            {/* Courier Profile / Account Dropdown Menu */}
            {isProfileMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-[#ffecf2] p-3 text-[#254117] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Courier Info Card */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#ffecf2]/60 border border-[#ffecf2] mb-2">
                    <div className="w-10 h-10 rounded-full bg-[#cd6184] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {currentCourier.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-gray-900 truncate">
                          {currentCourier.name}
                        </p>
                        <span className="text-[9px] font-bold bg-[#97a273]/20 text-[#254117] px-1.5 py-0.2 rounded-md">
                          Kurir
                        </span>
                      </div>
                      {currentCourier.vehicle && (
                        <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">
                          {currentCourier.vehicle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="my-1.5 border-t border-gray-100" />

                  {/* Logout Option */}
                  <button
                    type="button"
                    id="btn-courier-menu-logout"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logoutCourier();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 text-xs font-bold transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3.5 sm:p-6 lg:p-8 overflow-y-auto">
        {selectedOrder ? (
          /* ORDER DETAIL / ACTION SCREEN */
          <div className="space-y-4">
            {/* Back button */}
            <button
              onClick={() => setSelectedOrderId(null)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#254117] hover:text-[#cd6184] transition-colors py-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Tugas</span>
            </button>

            {/* Success toast */}
            {successMessage && (
              <div className="p-3 bg-[#97a273] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Customer & Location Card */}
            <div className="bg-[#ffecf2] p-4 sm:p-5 rounded-3xl border border-[#cd6184]/20 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#cd6184] uppercase tracking-wider block">
                    {selectedOrder.orderNumber}
                  </span>
                  <h2 className="text-lg font-black text-[#254117]">{selectedOrder.customerName}</h2>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    selectedOrder.status === 'delivered'
                      ? 'bg-[#97a273] text-white'
                      : selectedOrder.status === 'ready'
                      ? 'bg-emerald-600 text-white'
                      : selectedOrder.status === 'pickup'
                      ? 'bg-amber-500 text-white'
                      : selectedOrder.status === 'picked_up'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-white'
                  }`}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#254117]/80 pt-2 border-t border-[#cd6184]/20">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#cd6184] shrink-0 mt-0.5" />
                  <span className="font-semibold text-[#254117]">{selectedOrder.customerAddress}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#254117]/60 shrink-0" />
                    <span className="font-medium">{selectedOrder.customerPhone}</span>
                  </div>
                  <a
                    href={`https://wa.me/${selectedOrder.customerPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#97a273] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs hover:bg-[#859062]"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#254117]/60 shrink-0" />
                  <span>
                    Jadwal: {selectedOrder.pickupDate} ({selectedOrder.pickupTime})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-[#254117]/60 shrink-0" />
                  <span>
                    Paket: <strong className="text-[#254117]">{selectedOrder.planName}</strong> (Tarif: Rp {selectedOrder.unitPrice.toLocaleString('id-ID')}/{selectedOrder.unit})
                  </span>
                </div>

                {selectedOrder.notes && (
                  <div className="p-2.5 bg-white/80 rounded-xl text-[11px] text-[#254117]/85 border border-pink-100">
                    <strong>Catatan Pelanggan:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Laundrea Peduli (Recycling) Highlighted Block */}
            {selectedOrder.recycle?.enabled && (
              <div className="bg-emerald-50/90 p-4 sm:p-5 rounded-3xl border-2 border-emerald-300 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                        Program Laundrea Peduli
                      </span>
                      <h3 className="text-sm font-bold text-[#254117]">
                        {selectedOrder.recycle.mode === 'clean'
                          ? 'Baju sudah bersih & kering'
                          : 'Baju kotor, dicuci dulu'}
                      </h3>
                    </div>
                  </div>

                  {selectedOrder.recycle.status === 'rejected' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 shrink-0">
                      Daur Ulang Ditolak
                    </span>
                  ) : selectedOrder.recycle.actualKg !== null ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Diterima: {selectedOrder.recycle.actualKg} kg
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                      Perlu Ditimbang
                    </span>
                  )}
                </div>

                <div className="text-xs text-emerald-950 space-y-1">
                  <p className="font-semibold">
                    Perkiraan: {selectedOrder.recycle.estimatedKg} kg
                  </p>
                  <p className="text-[11px] text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                    💡 <strong>Tips:</strong> Bawa kantong terpisah untuk baju daur ulang.
                  </p>
                </div>

                {selectedOrder.recycle.status === 'rejected' ? (
                  <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-900 space-y-1">
                    <p className="font-bold">
                      Penolakan: {selectedOrder.recycle.rejectReason || 'Tidak memenuhi syarat'}
                    </p>
                    <p className="text-[11px] font-semibold text-red-700">
                      {selectedOrder.recycle.mode === 'clean'
                        ? '👉 Kembalikan ke pelanggan (baju tidak diambil).'
                        : '👉 Baju kotor tetap dicuci dan dikenakan tarif normal. Pesanan laundry berlanjut seperti biasa.'}
                    </p>
                  </div>
                ) : (
                  /* Courier rejection button (if weight not locked by chosen payment method) */
                  !Boolean(selectedOrder.paymentMethod) && (
                    <div className="pt-1 border-t border-emerald-200/70">
                      {!showRejectRecycleModal ? (
                        <button
                          type="button"
                          onClick={() => setShowRejectRecycleModal(true)}
                          className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Tolak baju daur ulang</span>
                        </button>
                      ) : (
                        <div className="p-3.5 bg-white rounded-2xl border border-red-200 space-y-3 mt-1.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-red-700">
                              Pilih Alasan Penolakan Baju Daur Ulang:
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowRejectRecycleModal(false)}
                              className="text-gray-400 hover:text-gray-600 text-xs font-semibold cursor-pointer"
                            >
                              Tutup
                            </button>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            {['Basah / lembap', 'Berjamur / berbau menyengat', 'Ada benda non-tekstil', 'Lainnya'].map((opt) => (
                              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="rejectReasonChoice"
                                  value={opt}
                                  checked={rejectReasonChoice === opt}
                                  onChange={(e) => setRejectReasonChoice(e.target.value)}
                                  className="accent-red-600"
                                />
                                <span className="font-medium text-[#254117]">{opt}</span>
                              </label>
                            ))}

                            {rejectReasonChoice === 'Lainnya' && (
                              <input
                                type="text"
                                value={rejectReasonCustom}
                                onChange={(e) => setRejectReasonCustom(e.target.value)}
                                placeholder="Tulis alasan penolakan spesifik..."
                                className="w-full mt-1 px-3 py-2 border border-red-200 rounded-xl text-xs font-medium focus:outline-none focus:border-red-500"
                                required
                              />
                            )}
                          </div>

                          <p className="text-[11px] text-gray-600">
                            {selectedOrder.recycle.mode === 'clean'
                              ? 'Kembalikan ke pelanggan. Pakaian daur ulang tidak dibawa ke gerai.'
                              : 'Pakaian tetap dicuci dan dikenai tarif normal. Pesanan laundry tetap berjalan.'}
                          </p>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleConfirmRejectRecycle}
                              disabled={isUpdating || (rejectReasonChoice === 'Lainnya' && !rejectReasonCustom.trim())}
                              className="py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating ? 'Memproses...' : 'Simpan Penolakan'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowRejectRecycleModal(false)}
                              className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Scale & Actual Weight Input (Only for Pickup tasks or verified display) */}
            {selectedOrder.status === 'pickup' ? (
              <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#254117]">
                    <Scale className="w-4 h-4 text-[#cd6184]" />
                    <span>Timbang & Masukkan Berat Riil</span>
                    <span className="text-red-500 font-bold text-xs ml-0.5 align-super select-none">*</span>
                  </div>
                  <span className="text-xs font-semibold text-[#cd6184]">
                    Satuan: {selectedOrder.unit}
                  </span>
                </div>
                <p className="text-[11px] text-[#254117]/70">
                  {selectedOrder.recycle?.enabled && selectedOrder.recycle.mode === 'wash_first'
                    ? 'Mode cuci dulu: timbang cucian pelanggan dan baju daur ulang secara terpisah. Keduanya dikenai tarif cuci.'
                    : 'Letakkan cucian di timbangan kurir saat tiba di lokasi pelanggan. Masukkan berat riil untuk mengupdate total tagihan.'}
                </p>

                <form onSubmit={handleWeightSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#254117] mb-1">
                      {selectedOrder.recycle?.enabled && selectedOrder.recycle.mode === 'clean'
                        ? 'Berat Cucian Pelanggan (kg):'
                        : selectedOrder.recycle?.enabled && selectedOrder.recycle.mode === 'wash_first'
                        ? 'Berat Cucian Pelanggan (kg, tidak termasuk baju daur ulang):'
                        : 'Berat Riil Cucian (kg):'}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          max="30"
                          value={weightInput}
                          onChange={(e) => setWeightInput(e.target.value)}
                          placeholder="Contoh: 4.8"
                          disabled={!isEditingWeight || isUpdating}
                          readOnly={!isEditingWeight}
                          className={`w-full pl-4 pr-12 py-3 rounded-2xl border text-lg font-black transition-colors ${
                            !isEditingWeight
                              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed select-none'
                              : 'bg-white text-[#254117] border-gray-200 focus:outline-none focus:border-[#cd6184]'
                          }`}
                          required
                        />
                        <span className={`absolute right-4 top-3.5 text-sm font-bold ${!isEditingWeight ? 'text-gray-400' : 'text-[#254117]/60'}`}>
                          {selectedOrder.unit}
                        </span>
                      </div>

                      {!isEditingWeight ? (
                        selectedOrder.paymentMethod ? (
                          <div className="py-2 px-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-400 font-bold text-[11px] flex items-center gap-1 select-none" title="Berat terkunci karena metode pembayaran telah dipilih pelanggan">
                            <Lock className="w-3.5 h-3.5" />
                            <span>Terkunci</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditingWeight(true)}
                            className="py-3.5 px-5 rounded-2xl bg-white border-2 border-[#cd6184] text-[#cd6184] hover:bg-[#ffecf2] font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                            title="Edit berat riil"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                        )
                      ) : (
                        <button
                          type="submit"
                          disabled={isUpdating || !weightInput.trim() || parseFloat(weightInput) <= 0}
                          className="py-3.5 px-5 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          {isUpdating ? 'Menyimpan...' : 'Simpan Berat'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Extra Input: Berat Baju Daur Ulang (kg) when recycle.enabled */}
                  {selectedOrder.recycle?.enabled && selectedOrder.recycle.status !== 'rejected' && (
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Berat baju daur ulang (kg)</span>
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-800">
                          {selectedOrder.recycle.mode === 'clean'
                            ? 'Terpisah (Gratis)'
                            : 'Terpisah (dikenai tarif cuci)'}
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="30"
                          value={recycleWeightInput}
                          onChange={(e) => {
                            setRecycleWeightInput(e.target.value);
                            setRecycleValidationError(null);
                          }}
                          placeholder="0"
                          disabled={!isEditingWeight || isUpdating}
                          readOnly={!isEditingWeight}
                          className={`w-full pl-4 pr-12 py-2.5 rounded-xl border text-base font-bold transition-colors ${
                            !isEditingWeight
                              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed select-none'
                              : 'bg-white text-emerald-950 border-emerald-300 focus:outline-none focus:border-emerald-600'
                          }`}
                        />
                        <span className={`absolute right-4 top-2.5 text-xs font-bold ${!isEditingWeight ? 'text-gray-400' : 'text-emerald-700'}`}>
                          kg
                        </span>
                      </div>

                      {recycleValidationError && (
                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{recycleValidationError}</span>
                        </p>
                      )}

                      <p className="text-[10.5px] text-emerald-800/80">
                        {selectedOrder.recycle.mode === 'clean'
                          ? '*Berat baju daur ulang tidak dikenai biaya cuci.'
                          : '*Baju dicuci dan dikenai tarif per kg, ditambahkan ke tagihan sebagai "Cuci baju daur ulang".'}
                      </p>
                    </div>
                  )}

                  {/* Real-time price calculation helper */}
                  {weightInput && parseFloat(weightInput) > 0 && (
                    <div className="p-3 bg-[#ffecf2] rounded-2xl space-y-1 text-xs">
                      {recycleWashPricePreview > 0 && (
                        <div className="flex items-center justify-between text-emerald-800 font-semibold">
                          <span>Cuci baju daur ulang ({recycleWashKgPreview} kg)</span>
                          <span>Rp {recycleWashPricePreview.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-[#254117]/75 font-medium">Perkiraan Total Akhir:</span>
                        <span className="font-black text-[#97a273] text-sm">
                          Rp {calculatedNewPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedOrder.actualQuantity !== undefined && (
                    <div className="p-2.5 bg-[#97a273]/15 rounded-xl flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#254117]">Berat Riil Tersimpan:</span>
                      <span className="font-black text-[#254117]">
                        {selectedOrder.actualQuantity} {selectedOrder.unit}
                      </span>
                    </div>
                  )}

                  {selectedOrder.recycle?.enabled && selectedOrder.recycle.actualKg !== null && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl flex items-center justify-between text-xs font-semibold border border-emerald-200">
                      <span className="text-emerald-900 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Baju Daur Ulang Riil:</span>
                      </span>
                      <span className="font-black text-emerald-900">
                        {selectedOrder.recycle.status === 'rejected'
                          ? 'Ditolak'
                          : `${selectedOrder.recycle.actualKg} kg`}
                      </span>
                    </div>
                  )}
                </form>
              </div>
            ) : selectedOrder.actualQuantity !== undefined ? (
              <div className="space-y-2">
                <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[#cd6184]" />
                    <span className="font-bold text-[#254117]">Berat Riil Cucian:</span>
                  </div>
                  <span className="font-black text-sm text-[#254117]">
                    {selectedOrder.actualQuantity} {selectedOrder.unit} (Rp {(selectedOrder.actualPrice || selectedOrder.estimatedPrice).toLocaleString('id-ID')})
                  </span>
                </div>

                {selectedOrder.recycle?.enabled && (
                  <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-xs flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-950">Baju Daur Ulang:</span>
                    </div>
                    <span className="font-black text-sm text-emerald-900">
                      {selectedOrder.recycle.status === 'rejected'
                        ? 'Ditolak'
                        : `${selectedOrder.recycle.actualKg ?? 0} kg`}
                    </span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Requirement 4: COD Highlight Box for Courier */}
            {selectedOrder.paymentMethod === 'cod' && selectedOrder.paymentStatus !== 'paid' && (
              <div className="p-4 bg-emerald-50 rounded-3xl border-2 border-emerald-400 text-emerald-950 space-y-3 shadow-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span>Pelanggan membayar tunai: Rp {(selectedOrder.actualPrice || selectedOrder.estimatedPrice).toLocaleString('id-ID')}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                    COD
                  </span>
                </div>
                <p className="text-xs text-emerald-800">
                  Terima uang tunai pas dari pelanggan di lokasi, lalu tekan tombol di bawah untuk menandai lunas dan membuka konfirmasi penjemputan.
                </p>
                <button
                  type="button"
                  onClick={() => confirmCodCashReceived(selectedOrder.id)}
                  disabled={isUpdating}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terima Tunai & Tandai Lunas</span>
                </button>
              </div>
            )}

            {/* If paid via COD, show confirmation */}
            {selectedOrder.paidTo && selectedOrder.paymentStatus === 'paid' && (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Dibayar tunai ke kurir <strong>{selectedOrder.paidTo}</strong></span>
                </div>
                <span className="font-bold text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Lunas
                </span>
              </div>
            )}

            {/* Courier Specific Action Card (Strictly Antar & Jemput Only) */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#cd6184]" />
                  <span className="text-xs font-bold text-[#254117]">
                    Tindakan Kurir (Antar & Jemput Saja)
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Akses Kurir
                </span>
              </div>

              {/* Action 1: Pickup Task */}
              {selectedOrder.status === 'pickup' && (() => {
                const isWeightSaved = selectedOrder.actualQuantity !== undefined && selectedOrder.actualQuantity > 0;
                const isCodPending = selectedOrder.paymentMethod === 'cod' && selectedOrder.paymentStatus !== 'paid';
                const isPickupDisabled = isUpdating || !isWeightSaved || isCodPending;

                let disabledHelperText = '';
                if (!isWeightSaved) {
                  disabledHelperText = 'Simpan berat dulu';
                } else if (isCodPending) {
                  disabledHelperText = 'Terima tunai dulu';
                }

                return (
                  <div className="space-y-3">
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>Tugas Penjemputan Cucian</span>
                      </div>
                      <p className="text-[9.5px] sm:text-[11px] text-amber-800/90 leading-relaxed">
                        1. Datang ke alamat pelanggan & timbang pakaian di atas.<br />
                        2. Tekan tombol konfirmasi serah terima penjemputan di bawah untuk membawa cucian menuju gerai.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleConfirmPickup}
                      disabled={isPickupDisabled}
                      className="w-full py-3.5 px-3 sm:px-4 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-[10.5px] sm:text-xs shadow-md flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        {isUpdating ? (
                          'Memproses...'
                        ) : (
                          <>
                            <span className="sm:hidden">Konfirmasi Cucian Dijemput (Bawa ke Gerai)</span>
                            <span className="hidden sm:inline">Konfirmasi Cucian Telah Dijemput (Bawa ke Gerai)</span>
                          </>
                        )}
                      </span>
                    </button>

                    {disabledHelperText && (
                      <p className="text-[11px] text-center font-bold text-amber-700 flex items-center justify-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{disabledHelperText}</span>
                      </p>
                    )}

                    <p className="text-[10px] text-center text-gray-500 italic">
                      *Tahap pencucian berikutnya hanya dapat dimulai oleh Admin setelah cucian tiba di gerai.
                    </p>
                  </div>
                );
              })()}

              {/* Action 1b: Picked up, in transit to store */}
              {selectedOrder.status === 'picked_up' && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-blue-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Cucian Berhasil Dijemput</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Cucian telah diambil dari pelanggan ({selectedOrder.statusTimestamps.picked_up || 'Hari ini'}).
                    Segera serahkan pakaian ke staf gerai. <strong>Admin Gerai yang berwenang mengubah status ke tahap Pencucian</strong>.
                  </p>
                </div>
              )}

              {/* Action 2: Store Operational Process (Admin Only) */}
              {(selectedOrder.status === 'washing' ||
                selectedOrder.status === 'drying' ||
                selectedOrder.status === 'ironing') && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#254117]">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span>Proses Operasional Gerai (Wewenang Admin)</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Pakaian saat ini sedang dalam proses <strong className="text-[#cd6184]">{getStatusLabel(selectedOrder.status)}</strong> di dalam gerai oleh Admin & staf workshop.
                  </p>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#cd6184] shrink-0 mt-0.5" />
                    <span>
                      Peran kurir hanya untuk Antar & Jemput. Perubahan status pencucian, pengeringan, dan penyetrikaan hanya dilakukan oleh Admin. Tugas pengantaran akan otomatis muncul setelah pakaian siap antar.
                    </span>
                  </div>
                </div>
              )}

              {/* Action 3: Delivery Task */}
              {selectedOrder.status === 'ready' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <span>Tugas Pengantaran Pakaian Bersih</span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                      Pakaian telah selesai dicuci, disetrika, dan dikemas rapi oleh gerai. Antarkan ke alamat pelanggan dan konfirmasi serah terima pengantaran di bawah ini.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmDelivery}
                    disabled={isUpdating}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#97a273] hover:bg-[#859062] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUpdating ? 'Menyimpan...' : 'Konfirmasi Pakaian Selesai Diantar ke Pelanggan'}</span>
                  </button>
                </div>
              )}

              {/* Action 4: Delivered */}
              {selectedOrder.status === 'delivered' && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[11px]">
                    Pesanan telah selesai diantar dan diserahterimakan kepada pelanggan pada {selectedOrder.statusTimestamps.delivered || 'Hari ini'}.
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* MAIN LIST & DASHBOARD */
          <div className="space-y-4">
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {/* Courier Daily Stats Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-[#254117]/60 block uppercase">
                      Tugas Aktif
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#cd6184]">
                      {activeOrders.length}
                    </span>
                  </div>
                  <div className="border-l border-gray-100">
                    <span className="text-[10px] font-bold text-[#254117]/60 block uppercase">
                      Pesanan Selesai
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#97a273]">
                      {completedOrders.length}
                    </span>
                  </div>
                  <div className="sm:border-l border-gray-100 col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-[#254117]/60 block uppercase">
                      Perlu Dijemput
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-600">
                      {pickupTasksCount}
                    </span>
                  </div>
                  <div className="border-l border-gray-100 col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <span className="text-[10px] font-bold text-[#254117]/60 block uppercase">
                      Siap Diantar
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600">
                      {deliveryTasksCount}
                    </span>
                  </div>
                </div>

                {/* Sub filter tabs */}
                <div className="flex items-center gap-1.5 bg-[#ffecf2] p-1 rounded-2xl max-w-md">
                  <button
                    onClick={() => setTaskFilter('all')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      taskFilter === 'all'
                        ? 'bg-[#cd6184] text-white shadow-xs'
                        : 'text-[#254117]/75'
                    }`}
                  >
                    Semua ({activeOrders.length})
                  </button>
                  <button
                    onClick={() => setTaskFilter('pickup')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      taskFilter === 'pickup'
                        ? 'bg-[#cd6184] text-white shadow-xs'
                        : 'text-[#254117]/75'
                    }`}
                  >
                    Jemput ({pickupTasksCount})
                  </button>
                  <button
                    onClick={() => setTaskFilter('delivery')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      taskFilter === 'delivery'
                        ? 'bg-[#cd6184] text-white shadow-xs'
                        : 'text-[#254117]/75'
                    }`}
                  >
                    Antar ({deliveryTasksCount})
                  </button>
                </div>

                {/* Task Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredTasks.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-xs text-gray-400 bg-white rounded-3xl p-6 border border-gray-100">
                      <Truck className="w-10 h-10 mx-auto mb-2 text-[#cd6184]/40" />
                      <p className="font-semibold text-[#254117]">Tidak ada tugas aktif dalam antrean ini</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Semua penjemputan dan pengantaran telah selesai.</p>
                    </div>
                  ) : (
                    filteredTasks.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => handleOpenDetail(order)}
                        className="bg-white p-4 rounded-3xl border border-gray-200/90 hover:border-[#cd6184] shadow-xs active:bg-[#ffecf2]/30 cursor-pointer transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#cd6184] uppercase">
                                {order.orderNumber}
                              </span>
                              {order.recycle?.enabled && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Leaf className="w-3 h-3 text-emerald-600" />
                                  <span>Daur ulang</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-sm font-bold text-[#254117]">{order.customerName}</h3>
                          </div>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase ${
                              order.status === 'ready'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'pickup'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'picked_up'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </div>

                        <div className="text-xs text-[#254117]/80 space-y-1">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#cd6184] shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{order.customerAddress}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#254117]/70">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{order.pickupTime}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#254117]">{order.planName}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                          <span className="text-[#cd6184] font-semibold">
                            {order.actualQuantity
                              ? `Riil: ${order.actualQuantity} ${order.unit}`
                              : `Perkiraan: ${order.estimatedQuantity} ${order.unit}`}
                          </span>
                          <span className="flex items-center text-[#cd6184] font-bold gap-0.5">
                            {order.status === 'pickup'
                              ? 'Timbang & Jemput'
                              : order.status === 'picked_up'
                              ? 'Bawa ke Gerai'
                              : order.status === 'ready'
                              ? 'Antar ke Pelanggan'
                              : 'Proses Gerai (Admin)'}{' '}
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-bold text-[#254117]">
                    Riwayat Pengantaran Selesai ({completedOrders.length})
                  </h2>
                  <span className="text-xs text-[#97a273] font-bold">
                    Tersinkronisasi
                  </span>
                </div>

                {completedOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-gray-400 bg-white rounded-3xl p-6 border">
                    <span>Belum ada riwayat pesanan selesai hari ini.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {completedOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 space-y-2 text-xs shadow-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#cd6184]">
                                {order.orderNumber}
                              </span>
                              {order.recycle?.enabled && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Leaf className="w-3 h-3 text-emerald-600" />
                                  <span>Daur ulang</span>
                                </span>
                              )}
                            </div>
                            <h3 className="font-bold text-[#254117]">{order.customerName}</h3>
                          </div>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#97a273] text-white font-bold uppercase">
                            Terkirim
                          </span>
                        </div>

                        <p className="text-[#254117]/70 text-[11px] line-clamp-1">
                          {order.customerAddress}
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px]">
                          <span>
                            {order.planName} • {order.actualQuantity || order.estimatedQuantity}{' '}
                            {order.unit}
                          </span>
                          <span className="text-[#97a273] font-black">
                            Rp {(order.actualPrice || order.estimatedPrice).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="max-w-2xl mx-auto w-full space-y-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 text-center">
                  <div className="w-16 h-16 bg-[#ffecf2] text-[#cd6184] rounded-full mx-auto flex items-center justify-center font-black text-xl border-2 border-[#cd6184]/30">
                    {(currentCourier.name || 'D').charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#254117]">{currentCourier.name}</h2>
                    <p className="text-xs text-[#254117]/70">{currentCourier.phone}</p>
                    <span className="inline-block mt-1 text-[11px] font-bold bg-[#97a273]/15 text-[#97a273] px-3 py-0.5 rounded-full">
                      Kurir Khusus Laundrea
                    </span>
                  </div>

                  {/* Shift toggle */}
                  <div className="p-3 bg-[#ffecf2]/50 rounded-2xl border border-[#cd6184]/20 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#254117]">Status Shift:</span>
                    <button
                      onClick={() => setIsShiftActive(!isShiftActive)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                        isShiftActive
                          ? 'bg-[#97a273] text-white shadow-xs'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isShiftActive ? '● Aktif Bertugas' : 'Sedang Istirahat'}
                    </button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-xs space-y-3 text-xs">
                  <h3 className="font-bold text-[#254117]">Informasi Kendaraan & Wilayah</h3>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#254117]/70">Kendaraan:</span>
                    <span className="font-semibold text-[#254117]">
                      {currentCourier.vehicle || 'Motor Honda Vario (B 4829 SJA)'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-[#254117]/70">Wilayah Operasional:</span>
                    <span className="font-semibold text-[#254117]">Gerai Jakarta Selatan</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#254117]/70">Selesai Minggu Ini:</span>
                    <span className="font-semibold text-[#97a273]">
                      {currentCourier.completedThisWeekCount ?? 18} pesanan
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2 sticky bottom-0 z-30 shadow-xs">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2 text-center">
          <button
            onClick={() => {
              setSelectedOrderId(null);
              setActiveTab('tasks');
            }}
            className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'tasks' && !selectedOrder
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Tugas ({activeOrders.length})</span>
          </button>

          <button
            onClick={() => {
              setSelectedOrderId(null);
              setActiveTab('history');
            }}
            className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'text-[#97a273] bg-[#97a273]/15'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat</span>
          </button>

          <button
            onClick={() => {
              setSelectedOrderId(null);
              setActiveTab('profile');
            }}
            className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#cd6184] bg-[#ffecf2]'
                : 'text-[#254117]/70 hover:text-[#254117]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
