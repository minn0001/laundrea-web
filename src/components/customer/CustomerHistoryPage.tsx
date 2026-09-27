import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PlanType } from '../../types';
import {
  Clock,
  Package,
  CheckCircle2,
  Truck,
  RotateCw,
  Search,
  ChevronRight,
  ReceiptText,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Banknote,
  Sparkles,
  Phone,
  ArrowUpRight,
  ShoppingBag,
} from 'lucide-react';

interface CustomerHistoryPageProps {
  onTrackOrder: (orderId: string) => void;
  onNewOrderClick: (planId?: PlanType) => void;
}

export const CustomerHistoryPage: React.FC<CustomerHistoryPageProps> = ({
  onTrackOrder,
  onNewOrderClick,
}) => {
  const { orders, setActiveCustomerOrderId, customerPhone } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  // Filter orders related to customer or fallback to all orders for complete experience
  const customerOrders = orders.filter((o) => {
    if (!customerPhone) return true;
    const cleanCustomer = customerPhone.replace(/\D/g, '');
    const cleanOrderPhone = o.customerPhone.replace(/\D/g, '');
    return cleanOrderPhone === cleanCustomer || cleanOrderPhone.endsWith(cleanCustomer.slice(-7));
  });

  // If filtered list is empty (e.g. phone has no orders yet in mock), show available orders so user can explore
  const displayOrders = customerOrders.length > 0 ? customerOrders : orders;

  // Filter by status and search
  const filteredOrders = displayOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerAddress.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'active') {
      return order.status !== 'delivered';
    }
    if (statusFilter === 'completed') {
      return order.status === 'delivered';
    }
    return true;
  });

  const activeCount = displayOrders.filter((o) => o.status !== 'delivered').length;
  const completedCount = displayOrders.filter((o) => o.status === 'delivered').length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return {
          label: 'Selesai',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'ready':
        return {
          label: 'Siap Diantar',
          bg: 'bg-[#ffecf2] text-[#cd6184] border-[#cd6184]/30',
          icon: <Truck className="w-3.5 h-3.5 text-[#cd6184]" />,
        };
      case 'ironing':
        return {
          label: 'Disetrika',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <RotateCw className="w-3.5 h-3.5 text-purple-600" />,
        };
      case 'drying':
        return {
          label: 'Dikeringkan',
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          icon: <RotateCw className="w-3.5 h-3.5 text-cyan-600" />,
        };
      case 'washing':
        return {
          label: 'Sedang Dicuci',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <RotateCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />,
        };
      case 'picked_up':
        return {
          label: 'Telah Dijemput',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <Package className="w-3.5 h-3.5 text-indigo-600" />,
        };
      case 'pickup':
      default:
        return {
          label: 'Menunggu Jemput',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        };
    }
  };

  const handleTrackClick = (order: Order) => {
    setActiveCustomerOrderId(order.id);
    onTrackOrder(order.id);
  };

  return (
    <div className="w-full space-y-4 text-[#254117] animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#254117] tracking-tight">Riwayat Pesanan</h1>
          <p className="text-xs text-[#254117]/60 mt-0.5 font-medium">
            Catatan dan status seluruh cucian Anda
          </p>
        </div>
        <button
          type="button"
          id="btn-history-new-order"
          onClick={() => onNewOrderClick()}
          className="px-3 py-2 rounded-xl bg-[#cd6184] text-white text-xs font-bold shadow-xs hover:bg-[#b85373] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Pesan Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg">
        <div className="p-3 rounded-2xl bg-[#ffecf2]/50 border border-[#cd6184]/20 text-center">
          <span className="text-[10px] font-bold text-[#cd6184] uppercase block">Total</span>
          <span className="text-lg sm:text-xl font-black text-[#254117]">{displayOrders.length}</span>
          <span className="text-[9px] text-[#254117]/60 block">Pesanan</span>
        </div>
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center">
          <span className="text-[10px] font-bold text-amber-700 uppercase block">Proses</span>
          <span className="text-lg sm:text-xl font-black text-amber-900">{activeCount}</span>
          <span className="text-[9px] text-amber-800/70 block">Sedang jalan</span>
        </div>
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Selesai</span>
          <span className="text-lg sm:text-xl font-black text-emerald-900">{completedCount}</span>
          <span className="text-[9px] text-emerald-800/70 block">Terkirim</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-[#254117]/40 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nomor pesanan atau layanan..."
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

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl max-w-md">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white text-[#254117] shadow-xs'
              : 'text-[#254117]/60 hover:text-[#254117]'
          }`}
        >
          Semua ({displayOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('active')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'active'
              ? 'bg-white text-amber-800 shadow-xs'
              : 'text-[#254117]/60 hover:text-[#254117]'
          }`}
        >
          Proses ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('completed')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-[#254117]/60 hover:text-[#254117]'
          }`}
        >
          Selesai ({completedCount})
        </button>
      </div>

      {/* Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#254117]">Tidak Ada Pesanan Ditemukan</h3>
              <p className="text-xs text-[#254117]/60 mt-1">
                {searchQuery
                  ? 'Coba ganti kata kunci pencarian Anda.'
                  : 'Anda belum memiliki pesanan pada kategori ini.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNewOrderClick()}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
            >
              Mulai Pesan Sekarang
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
                {/* Order Top Bar: Number, Date, Status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#254117] tracking-tight">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[10px] text-[#254117]/50 font-medium">
                        {order.pickupDate}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-[#254117] mt-0.5">{order.planName}</h3>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${badge.bg}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Details snippet */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-[#254117]/60 block font-medium">Jumlah</span>
                    <span className="font-black text-[#254117]">
                      {finalQty} {order.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#254117]/60 block font-medium">Total Biaya</span>
                    <span className="font-black text-[#cd6184]">
                      Rp {finalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  {order.status !== 'delivered' ? (
                    <button
                      type="button"
                      onClick={() => handleTrackClick(order)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#254117] hover:bg-[#1e3412] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#ffbd59]" />
                      <span>Lacak Pesanan</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNewOrderClick(order.planId)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#ffecf2] hover:bg-[#ffecf2]/80 text-[#cd6184] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Pesan Ulang</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#254117] text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ReceiptText className="w-3.5 h-3.5 text-[#254117]/70" />
                    <span>Nota</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Detail Nota Pesanan */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-[#cd6184]" />
                <div>
                  <h3 className="text-base font-black text-[#254117]">Nota & Rincian Pesanan</h3>
                  <span className="text-[10px] text-[#254117]/60 font-semibold">
                    #{selectedOrderForDetail.orderNumber}
                  </span>
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

            {/* Status Pill */}
            <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
              <span className="text-xs text-[#254117]/70 font-semibold">Status Pengerjaan</span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${
                  getStatusBadge(selectedOrderForDetail.status).bg
                }`}
              >
                {getStatusBadge(selectedOrderForDetail.status).icon}
                <span>{getStatusBadge(selectedOrderForDetail.status).label}</span>
              </span>
            </div>

            {/* Service & Items */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">Layanan Dipilih</span>
                <span className="text-[#254117] font-bold">{selectedOrderForDetail.planName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">Jumlah / Berat</span>
                <span className="text-[#254117] font-bold">
                  {selectedOrderForDetail.actualQuantity || selectedOrderForDetail.estimatedQuantity}{' '}
                  {selectedOrderForDetail.unit}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">Tarif per {selectedOrderForDetail.unit}</span>
                <span className="text-[#254117]">
                  Rp {selectedOrderForDetail.unitPrice.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100 font-semibold">
                <span className="text-[#254117]/70">Ongkir Antar-Jemput</span>
                <span className="text-emerald-600 font-bold">GRATIS</span>
              </div>
              <div className="flex justify-between py-2 border-b-2 border-gray-200 text-sm">
                <span className="font-bold text-[#254117]">Total Pembayaran</span>
                <span className="font-black text-[#cd6184]">
                  Rp{' '}
                  {(
                    selectedOrderForDetail.actualPrice || selectedOrderForDetail.estimatedPrice
                  ).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="p-3 bg-gray-50 rounded-2xl space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#97a273] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#254117] block">Alamat Pengantaran</span>
                  <span className="text-[11px] text-[#254117]/70">
                    {selectedOrderForDetail.customerAddress}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60">
                <Calendar className="w-4 h-4 text-[#cd6184] shrink-0" />
                <div>
                  <span className="font-bold text-[#254117] block">Waktu Penjemputan</span>
                  <span className="text-[11px] text-[#254117]/70">
                    {selectedOrderForDetail.pickupDate} ({selectedOrderForDetail.pickupTime})
                  </span>
                </div>
              </div>
            </div>

            {/* Courier Info if assigned */}
            {selectedOrderForDetail.courierName && (
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-[#254117] block">Kurir Penjemput</span>
                    <span className="text-[11px] text-[#254117]/70">
                      {selectedOrderForDetail.courierName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
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
                  <span>Buka Pelacakan Langsung</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedOrderForDetail(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              >
                Tutup Nota
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
