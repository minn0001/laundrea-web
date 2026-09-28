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
} from 'lucide-react';

export const CourierApp: React.FC = () => {
  const {
    isCourierLoggedIn,
    loginCourier,
    logoutCourier,
    courierUsername,
    orders,
    couriers,
    updateOrderWeight,
    updateOrderStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'history' | 'profile'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pickup' | 'delivery'>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Detail view state
  const [weightInput, setWeightInput] = useState<string>('');
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(true);

  if (!isCourierLoggedIn) {
    return <CourierLogin onLogin={loginCourier} />;
  }

  // Current logged in courier data with resilient fallbacks
  const rawCourier =
    couriers.find(
      (c) =>
        (c.phone && c.phone.includes('812')) ||
        (c.name && c.name.toLowerCase().includes('dimas'))
    ) || couriers[0];

  const currentCourier = {
    id: rawCourier?.id || 'cr-1',
    name: rawCourier?.name || 'Dimas Pratama',
    phone: rawCourier?.phone || '0812-8877-1122',
    status: rawCourier?.status || 'active',
    activePickupsCount: rawCourier?.activePickupsCount ?? 2,
    completedTodayCount: rawCourier?.completedTodayCount ?? 5,
    completedThisWeekCount: rawCourier?.completedThisWeekCount ?? 18,
    vehicle: rawCourier?.vehicle || 'Motor Honda Vario (B 4829 SJA)',
  };

  // Filter orders for courier:
  const activeOrders = orders.filter((o) => o.status !== 'delivered');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

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
    setIsEditingWeight(!order.actualQuantity);
    setSuccessMessage(null);
  };

  const calculatedNewPrice =
    selectedOrder && parseFloat(weightInput) > 0
      ? Math.round(selectedOrder.unitPrice * parseFloat(weightInput))
      : selectedOrder?.estimatedPrice || 0;

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const num = parseFloat(weightInput);
    if (isNaN(num) || num <= 0) return;

    setIsUpdating(true);
    setTimeout(() => {
      updateOrderWeight(selectedOrder.id, num);
      setIsUpdating(false);
      setIsEditingWeight(false);
      setSuccessMessage('Berat berhasil disimpan, total harga diperbarui');
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 400);
  };

  // Courier Handover Actions: Courier only handles Pickup and Delivery
  const handleConfirmPickup = () => {
    if (!selectedOrder) return;
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-white/90 font-semibold">
              {currentCourier.name.split(' ')[0]}
            </span>
            <button
              onClick={logoutCourier}
              title="Keluar"
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                    Paket: <strong className="text-[#254117]">{selectedOrder.planName}</strong> (
                    Tarif: Rp {selectedOrder.unitPrice.toLocaleString('id-ID')}/{selectedOrder.unit})
                  </span>
                </div>

                {selectedOrder.notes && (
                  <div className="p-2.5 bg-white/80 rounded-xl text-[11px] text-[#254117]/85 border border-pink-100">
                    <strong>Catatan Pelanggan:</strong> {selectedOrder.notes}
                  </div>
                )}
              </div>
            </div>

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
                  Letakkan cucian di timbangan kurir saat tiba di lokasi pelanggan. Masukkan berat riil untuk mengupdate total tagihan.
                </p>

                <form onSubmit={handleWeightSubmit} className="space-y-3">
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
                      <button
                        type="button"
                        onClick={() => setIsEditingWeight(true)}
                        className="py-3.5 px-5 rounded-2xl bg-white border-2 border-[#cd6184] text-[#cd6184] hover:bg-[#ffecf2] font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                        title="Edit berat riil"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
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

                  {/* Real-time price calculation helper */}
                  {weightInput && parseFloat(weightInput) > 0 && (
                    <div className="p-3 bg-[#ffecf2] rounded-2xl flex items-center justify-between text-xs">
                      <span className="text-[#254117]/75 font-medium">
                        Perkiraan Total Akhir:
                      </span>
                      <span className="font-black text-[#97a273] text-sm">
                        Rp {calculatedNewPrice.toLocaleString('id-ID')}
                      </span>
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
                </form>
              </div>
            ) : selectedOrder.actualQuantity !== undefined ? (
              <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#cd6184]" />
                  <span className="font-bold text-[#254117]">Berat Riil Cucian:</span>
                </div>
                <span className="font-black text-sm text-[#254117]">
                  {selectedOrder.actualQuantity} {selectedOrder.unit} (Rp {(selectedOrder.actualPrice || selectedOrder.estimatedPrice).toLocaleString('id-ID')})
                </span>
              </div>
            ) : null}

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
              {selectedOrder.status === 'pickup' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <Truck className="w-4 h-4 text-amber-600" />
                      <span>Tugas Penjemputan Cucian</span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      1. Datang ke alamat pelanggan & timbang pakaian di atas.<br />
                      2. Tekan tombol konfirmasi serah terima penjemputan di bawah untuk membawa cucian menuju gerai.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPickup}
                    disabled={isUpdating}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isUpdating ? 'Memproses...' : 'Konfirmasi Cucian Telah Dijemput (Bawa ke Gerai)'}</span>
                  </button>
                  <p className="text-[10px] text-center text-gray-500 italic">
                    *Tahap pencucian berikutnya hanya dapat dimulai oleh Admin setelah cucian tiba di gerai.
                  </p>
                </div>
              )}

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
                            <span className="text-[10px] font-bold text-[#cd6184] uppercase">
                              {order.orderNumber}
                            </span>
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
                            <span className="text-[10px] font-bold text-[#cd6184]">
                              {order.orderNumber}
                            </span>
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
