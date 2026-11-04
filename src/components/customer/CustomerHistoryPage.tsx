import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PlanType } from '../../types';
import { earnsRecycleStamp } from '../../utils/recycle';
import { useTr } from '../../i18n/useTr';
import { useLang } from '../../i18n/LanguageContext';
import { PLAN_LOCALIZATIONS } from '../../i18n/translations';
import {
  Clock,
  Package,
  CheckCircle2,
  Truck,
  RotateCw,
  Search,
  ReceiptText,
  MapPin,
  Calendar,
  X,
  Plus,
  Leaf,
} from 'lucide-react';

interface CustomerHistoryPageProps {
  onTrackOrder: (orderId: string) => void;
  onNewOrderClick: (planId?: PlanType) => void;
}

export const CustomerHistoryPage: React.FC<CustomerHistoryPageProps> = ({
  onTrackOrder,
  onNewOrderClick,
}) => {
  // earnsRecycleStamp diimpor dari utils (bukan dari useApp)
  const { orders, setActiveCustomerOrderId, customerPhone } = useApp();
  const tr = useTr();
  const { lang } = useLang();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Nama paket mengikuti bahasa
  const planLabel = (o: Order) =>
    lang === 'en' && PLAN_LOCALIZATIONS[o.planId as PlanType]
      ? PLAN_LOCALIZATIONS[o.planId as PlanType].nameEn
      : o.planName;

  // Teks status daur ulang (dipakai di kartu dan nota)
  const recycleStatusText = (o: Order) => {
    const r = o.recycle!;
    if (r.actualKg === null) {
      return tr('Kurir akan menimbang baju daur ulang Anda.', 'The courier will weigh your recycling clothes.');
    }
    const status =
      r.status === 'verified'
        ? earnsRecycleStamp(o)
          ? tr('Stempel bonus ditambahkan', 'Bonus stamp added')
          : tr(
              'Diterima, berat di bawah 1 kg sehingga belum dapat stempel',
              'Accepted, but under 1 kg so no stamp yet'
            )
        : r.status === 'pending_verification'
        ? tr('Menunggu verifikasi', 'Awaiting verification')
        : `${tr('Tidak memenuhi syarat', 'Not eligible')}: ${
            r.rejectReason || tr('Ketentuan belum terpenuhi', 'Requirements not met')
          }`;
    return `${tr('Baju daur ulang diterima', 'Recycling clothes received')} (${r.actualKg} kg) • ${status}`;
  };

  const displayOrders = orders
    .filter((o) => {
      if (!customerPhone) return false;
      const cleanCustomer = customerPhone.replace(/\D/g, '');
      let cleanOrderPhone = o.customerPhone.replace(/\D/g, '');
      if (cleanOrderPhone.startsWith('62')) cleanOrderPhone = '0' + cleanOrderPhone.slice(2);
      let normCust = cleanCustomer;
      if (normCust.startsWith('62')) normCust = '0' + normCust.slice(2);
      return cleanOrderPhone === normCust;
    })
    .sort((a, b) => {
      const timeA = a.id.replace(/\D/g, '') || (a.statusTimestamps?.booked || '');
      const timeB = b.id.replace(/\D/g, '') || (b.statusTimestamps?.booked || '');
      return timeB.localeCompare(timeA);
    });

  const filteredOrders = displayOrders.filter((order) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) ||
      order.planName.toLowerCase().includes(q) ||
      planLabel(order).toLowerCase().includes(q) ||
      order.customerAddress.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return order.status !== 'delivered';
    if (statusFilter === 'completed') return order.status === 'delivered';
    return true;
  });

  const activeCount = displayOrders.filter((o) => o.status !== 'delivered').length;
  const completedCount = displayOrders.filter((o) => o.status === 'delivered').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return {
          label: tr('Selesai', 'Completed'),
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'ready':
        return {
          label: tr('Siap Diantar', 'Ready for Delivery'),
          bg: 'bg-[#ffecf2] text-[#cd6184] border-[#cd6184]/30',
          icon: <Truck className="w-3.5 h-3.5 text-[#cd6184]" />,
        };
      case 'ironing':
        return {
          label: tr('Disetrika', 'Ironing'),
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <RotateCw className="w-3.5 h-3.5 text-purple-600" />,
        };
      case 'drying':
        return {
          label: tr('Dikeringkan', 'Drying'),
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          icon: <RotateCw className="w-3.5 h-3.5 text-cyan-600" />,
        };
      case 'washing':
        return {
          label: tr('Sedang Dicuci', 'Washing'),
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <RotateCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
        };
      case 'picked_up':
        return {
          label: tr('Telah Dijemput', 'Picked Up'),
          bg: 'bg-[#254117]/10 text-[#254117] border-[#254117]/25',
          icon: <Package className="w-3.5 h-3.5 text-[#254117]" />,
        };
      case 'pickup':
      default:
        return {
          label: tr('Menunggu Jemput', 'Awaiting Pickup'),
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        };
    }
  };

  const handleTrackClick = (order: Order) => {
    setActiveCustomerOrderId(order.id);
    onTrackOrder(order.id);
  };

  const filterBtn = (active: boolean, activeColor: string) =>
    `flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
      active ? `bg-white ${activeColor} shadow-xs` : 'text-[#254117]/60 hover:text-[#254117]'
    }`;

  return (
    <div className="w-full space-y-4 text-[#254117] animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#254117] tracking-tight">
            {tr('Riwayat Pesanan', 'Order History')}
          </h1>
          <p className="text-xs text-[#254117]/60 mt-0.5 font-medium">
            {tr('Catatan dan status seluruh cucian Anda', 'Records and status of all your laundry')}
          </p>
        </div>
        <button
          type="button"
          id="btn-history-new-order"
          onClick={() => onNewOrderClick()}
          className="px-3.5 py-2 rounded-xl bg-[#cd6184] text-white text-xs font-bold shadow-xs hover:bg-[#b85373] transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{tr('Pesan Baru', 'New Order')}</span>
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg">
        <div className="p-3 rounded-2xl bg-[#ffecf2]/50 border border-[#cd6184]/20 text-center">
          <span className="text-[10px] font-bold text-[#cd6184] uppercase block">Total</span>
          <span className="text-lg sm:text-xl font-black text-[#254117]">{displayOrders.length}</span>
          <span className="text-[9px] text-[#254117]/60 block">{tr('Pesanan', 'Orders')}</span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">{tr('Proses', 'Active')}</span>
          <span className="text-lg sm:text-xl font-black text-amber-900">{activeCount}</span>
          <span className="text-[9px] text-amber-800/70 block">{tr('Sedang jalan', 'In progress')}</span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">{tr('Selesai', 'Done')}</span>
          <span className="text-lg sm:text-xl font-black text-emerald-900">{completedCount}</span>
          <span className="text-[9px] text-emerald-800/70 block">{tr('Terkirim', 'Delivered')}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#254117]/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={tr('Cari nomor pesanan atau layanan...', 'Search order number or service...')}
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-[#254117] focus:outline-hidden focus:border-[#cd6184] placeholder:text-[#254117]/40 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl max-w-md">
        <button type="button" onClick={() => setStatusFilter('all')} className={filterBtn(statusFilter === 'all', 'text-[#254117]')}>
          {tr('Semua', 'All')} ({displayOrders.length})
        </button>
        <button type="button" onClick={() => setStatusFilter('active')} className={filterBtn(statusFilter === 'active', 'text-amber-800')}>
          {tr('Proses', 'Active')} ({activeCount})
        </button>
        <button type="button" onClick={() => setStatusFilter('completed')} className={filterBtn(statusFilter === 'completed', 'text-emerald-800')}>
          {tr('Selesai', 'Completed')} ({completedCount})
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#254117]">{tr('Tidak Ada Pesanan Ditemukan', 'No Orders Found')}</h3>
              <p className="text-xs text-[#254117]/60 mt-1">
                {searchQuery
                  ? tr('Coba ganti kata kunci pencarian Anda.', 'Try changing your search keyword.')
                  : tr('Anda belum memiliki pesanan pada kategori ini.', "You don't have any orders in this category yet.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNewOrderClick()}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
            >
              {tr('Mulai Pesan Sekarang', 'Start Ordering Now')}
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const badge = getStatusBadge(order.status);
            const finalQty = order.actualQuantity || order.estimatedQuantity;
            const finalPrice = order.actualPrice || order.estimatedPrice;

            return (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:border-[#cd6184]/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#254117] tracking-tight">#{order.orderNumber}</span>
                      <span className="text-[10px] text-[#254117]/50 font-medium">{order.pickupDate}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#254117] mt-0.5">{planLabel(order)}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badge.bg}`}>
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-[#254117]/60 block font-medium">{tr('Jumlah', 'Quantity')}</span>
                    <span className="font-black text-[#254117]">{finalQty} {order.unit}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#254117]/60 block font-medium">{tr('Total Biaya', 'Total Cost')}</span>
                    <span className="font-black text-[#cd6184]">Rp {finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {order.recycle?.enabled && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200 leading-snug">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {recycleStatusText(order)}
                      {order.recycle.actualKg !== null && order.recycle.mode === 'wash_first'
                        ? ` (${order.recycle.actualKg || order.recycle.estimatedKg} kg ${tr('diserahkan ke daur ulang', 'handed over for recycling')})`
                        : ''}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  {order.status !== 'delivered' ? (
                    <button
                      type="button"
                      onClick={() => handleTrackClick(order)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#254117] hover:bg-[#1e3412] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#ffbd59]" />
                      <span>{tr('Lacak Pesanan', 'Track Order')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNewOrderClick(order.planId)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#ffecf2] hover:bg-[#ffecf2]/80 text-[#cd6184] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{tr('Pesan Ulang', 'Reorder')}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#254117] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ReceiptText className="w-3.5 h-3.5 text-[#254117]/70" />
                    <span>{tr('Nota', 'Receipt')}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Nota */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-[#cd6184]" />
                <div>
                  <h3 className="text-base font-black text-[#254117]">{tr('Nota & Rincian Pesanan', 'Receipt & Order Details')}</h3>
                  <span className="text-[10px] text-[#254117]/60 font-semibold">#{selectedOrderForDetail.orderNumber}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-[#254117]/70 font-semibold">{tr('Status Pengerjaan', 'Processing Status')}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${getStatusBadge(selectedOrderForDetail.status).bg}`}>
                {getStatusBadge(selectedOrderForDetail.status).icon}
                <span>{getStatusBadge(selectedOrderForDetail.status).label}</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">{tr('Layanan Dipilih', 'Selected Service')}</span>
                <span className="text-[#254117] font-bold">{planLabel(selectedOrderForDetail)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">{tr('Jumlah / Berat', 'Quantity / Weight')}</span>
                <span className="text-[#254117] font-bold">
                  {selectedOrderForDetail.actualQuantity || selectedOrderForDetail.estimatedQuantity} {selectedOrderForDetail.unit}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">{tr('Tarif per', 'Rate per')} {selectedOrderForDetail.unit}</span>
                <span className="text-[#254117]">Rp {selectedOrderForDetail.unitPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">{tr('Ongkir Antar-Jemput', 'Pickup & Delivery Fee')}</span>
                <span className="text-emerald-600 font-bold">{tr('GRATIS', 'FREE')}</span>
              </div>

              {Boolean(selectedOrderForDetail.recycleWashPrice && selectedOrderForDetail.recycleWashPrice > 0) && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                    <span className="text-[#254117]/70">{tr('Biaya Cuci', 'Washing Fee')} {planLabel(selectedOrderForDetail)}</span>
                    <span className="text-[#254117]">
                      Rp{' '}
                      {Math.round(
                        selectedOrderForDetail.unitPrice *
                          (selectedOrderForDetail.actualQuantity || selectedOrderForDetail.estimatedQuantity)
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold text-emerald-800">
                    <span className="flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {tr('Cuci baju daur ulang (Laundrea Peduli)', 'Recycling clothes wash (Laundrea Peduli)')} · {selectedOrderForDetail.recycleWashKg} kg
                        {selectedOrderForDetail.actualQuantity === undefined ? ` (${tr('estimasi', 'estimate')})` : ''}
                      </span>
                    </span>
                    <span>Rp {selectedOrderForDetail.recycleWashPrice?.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}

              {Boolean(selectedOrderForDetail.voucherDiscount && selectedOrderForDetail.voucherDiscount > 0) && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold text-[#254117]/80">
                    <span className="text-[#254117]/70">Subtotal</span>
                    <span className="text-[#254117]">
                      Rp{' '}
                      {(
                        selectedOrderForDetail.subtotalPrice ||
                        (selectedOrderForDetail.actualPrice || selectedOrderForDetail.estimatedPrice) +
                          (selectedOrderForDetail.voucherDiscount || 0)
                      ).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100 font-bold text-[#cd6184]">
                    <span>
                      {tr('Diskon Voucher', 'Voucher Discount')} ({selectedOrderForDetail.voucherCode || selectedOrderForDetail.voucherTitle || 'VOUCHER'})
                    </span>
                    <span>- Rp {selectedOrderForDetail.voucherDiscount?.toLocaleString('id-ID')}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between py-2 border-b-2 border-gray-200 text-sm">
                <span className="font-bold text-[#254117]">{tr('Total Pembayaran', 'Total Payment')}</span>
                <span className="font-black text-[#cd6184]">
                  Rp {(selectedOrderForDetail.actualPrice || selectedOrderForDetail.estimatedPrice).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#97a273] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#254117] block">{tr('Alamat Pengantaran', 'Delivery Address')}</span>
                  <span className="text-[11px] text-[#254117]/70">{selectedOrderForDetail.customerAddress}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                <Calendar className="w-4 h-4 text-[#cd6184] shrink-0" />
                <div>
                  <span className="font-bold text-[#254117] block">{tr('Waktu Penjemputan', 'Pickup Time')}</span>
                  <span className="text-[11px] text-[#254117]/70">
                    {selectedOrderForDetail.pickupDate} ({selectedOrderForDetail.pickupTime})
                  </span>
                </div>
              </div>
            </div>

            {selectedOrderForDetail.courierName && (
              <div className="p-3 bg-[#254117]/5 rounded-2xl border border-[#254117]/15 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#254117] text-white flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#254117] block">{tr('Kurir Penjemput', 'Pickup Courier')}</span>
                    <span className="text-[11px] text-[#254117]/70">{selectedOrderForDetail.courierName}</span>
                  </div>
                </div>
              </div>
            )}

            {selectedOrderForDetail.recycle?.enabled && (
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{tr('Laundrea Peduli (Daur Ulang)', 'Laundrea Peduli (Recycling)')}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {selectedOrderForDetail.recycle.mode === 'clean'
                      ? tr('Baju Bersih & Kering', 'Clean & Dry Clothes')
                      : tr('Cuci Dulu Sesuai Tarif', 'Wash First at Standard Rate')}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-900 mt-0.5">{recycleStatusText(selectedOrderForDetail)}</p>
                {selectedOrderForDetail.recycle.mode === 'wash_first' && (
                  <p className="text-[10px] text-emerald-800 italic">
                    ({selectedOrderForDetail.recycle.actualKg || selectedOrderForDetail.recycle.estimatedKg} kg{' '}
                    {tr('diserahkan ke daur ulang', 'handed over for recycling')})
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2 pt-2">
              {selectedOrderForDetail.status !== 'delivered' && (
                <button
                  type="button"
                  onClick={() => {
                    handleTrackClick(selectedOrderForDetail);
                    setSelectedOrderForDetail(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#254117] hover:bg-[#1e3412] shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4 text-[#ffbd59]" />
                  <span>{tr('Buka Pelacakan Langsung', 'Open Live Tracking')}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              >
                {tr('Tutup Nota', 'Close Receipt')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
