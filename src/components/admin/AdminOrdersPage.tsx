import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  Filter,
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  Check,
} from 'lucide-react';

interface AdminOrdersPageProps {
  initialSelectedOrderId?: string | null;
}

export const AdminOrdersPage: React.FC<AdminOrdersPageProps> = ({ initialSelectedOrderId }) => {
  const { orders, couriers, assignCourier, updateOrderStatus, updateOrderPaymentStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(() => {
    return orders.find((o) => o.id === initialSelectedOrderId) || null;
  });

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      order.status === statusFilter ||
      (statusFilter === 'pickup' && order.status === 'picked_up');

    return matchesSearch && matchesStatus;
  });

  const handleAssignCourier = (orderId: string, courierId: string) => {
    assignCourier(orderId, courierId);
    if (selectedOrder && selectedOrder.id === orderId) {
      const cr = couriers.find((c) => c.id === courierId);
      setSelectedOrder({
        ...selectedOrder,
        courierId,
        courierName: cr?.name,
      });
    }
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status,
      });
    }
  };

  const handleTogglePayment = (orderId: string, currentStatus?: 'pending' | 'paid') => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    updateOrderPaymentStatus(orderId, nextStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        paymentStatus: nextStatus,
      });
    }
  };

  const allStatuses: { id: OrderStatus; label: string }[] = [
    { id: 'pickup', label: 'Penjemputan' },
    { id: 'washing', label: 'Pencucian' },
    { id: 'drying', label: 'Pengeringan' },
    { id: 'ironing', label: 'Penyetrikaan' },
    { id: 'ready', label: 'Siap Antar' },
    { id: 'delivered', label: 'Selesai' },
  ];

  const getStatusLabel = (status: OrderStatus | string) => {
    switch (status) {
      case 'pickup':
        return 'Penjemputan';
      case 'picked_up':
        return 'Sudah Dijemput';
      case 'washing':
        return 'Pencucian';
      case 'drying':
        return 'Pengeringan';
      case 'ironing':
        return 'Penyetrikaan';
      case 'ready':
        return 'Siap Antar';
      case 'delivered':
        return 'Selesai';
      default:
        return status;
    }
  };

  return (
    <div id="admin-orders-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#254117]">Kelola Pesanan</h1>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'bg-white border border-gray-200 text-[#254117] hover:bg-gray-50'
            }`}
          >
            Semua ({orders.length})
          </button>
          {allStatuses.map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-[#cd6184] text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-[#254117] hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan nama pelanggan, nomor WhatsApp, atau kode order..."
          className="w-full text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Table and Detail Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Orders Table */}
        <div
          className={`${
            selectedOrder ? 'lg:col-span-7' : 'lg:col-span-12'
          } bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden transition-all`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ffecf2]/50 text-[#254117] border-b border-gray-100 font-bold">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Paket</th>
                  <th className="py-3 px-4">Kurir</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      Tidak ada pesanan yang sesuai kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#ffecf2]/80 font-medium' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#254117] block">{order.orderNumber}</span>
                          <span className="text-[10px] text-[#254117]/60">
                            {order.pickupDate.slice(5)} ({order.pickupTime.split(' ')[0]})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#254117] block">{order.customerName}</span>
                          <span className="text-[11px] text-[#254117]/60">{order.customerPhone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#254117]">{order.planName}</span>
                          <span className="text-[11px] text-[#cd6184] block font-semibold">
                            {order.actualQuantity
                              ? `${order.actualQuantity} ${order.unit} (aktual)`
                              : `Est: ${order.estimatedQuantity} ${order.unit}`}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {order.courierName ? (
                            <span className="text-[11px] font-medium text-[#254117] flex items-center gap-1">
                              <Truck className="w-3 h-3 text-[#97a273]" />
                              {order.courierName.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-[11px] text-red-500 font-semibold">Pilih Kurir</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              order.status === 'delivered'
                                ? 'bg-[#97a273] text-white'
                                : order.status === 'ready'
                                ? 'bg-[#ffbd59] text-[#254117]'
                                : 'bg-[#ffecf2] text-[#cd6184]'
                            }`}
                          >
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-[#254117]">
                          Rp {(order.actualPrice || order.estimatedPrice).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedOrder && (
          <div className="lg:col-span-5 bg-white p-5 rounded-3xl border-2 border-[#cd6184]/30 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#cd6184] uppercase">Detail Pesanan</span>
                <h3 className="text-base font-bold text-[#254117]">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="space-y-1.5 text-xs text-[#254117]/80">
              <div className="flex justify-between">
                <span className="text-[#254117]/60">Nama:</span>
                <span className="font-bold text-[#254117]">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/60">WhatsApp:</span>
                <span className="font-semibold text-[#254117]">{selectedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/60">Metode Kirim:</span>
                <span className="font-medium text-[#254117]">
                  {selectedOrder.handoverMethod === 'pickup_by_courier' ? 'Pickup Kurir' : 'Drop-off Toko'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/60">Metode Ambil:</span>
                <span className="font-medium text-[#254117]">
                  {selectedOrder.returnMethod === 'deliver_to_me' ? 'Antar Alamat' : 'Ambil Sendiri'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#254117]/60">Alamat:</span>
                <span className="font-medium text-right text-[#254117] max-w-[220px]">
                  {selectedOrder.customerAddress}
                </span>
              </div>
              {selectedOrder.notes && (
                <div className="p-2 bg-[#ffecf2] rounded-xl text-[11px] text-[#254117]">
                  <strong>Catatan:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Pricing & Weight */}
            <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 text-xs border border-gray-200">
              <div className="flex justify-between">
                <span>Paket Layanan:</span>
                <span className="font-bold">{selectedOrder.planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimasi Awal:</span>
                <span>
                  {selectedOrder.estimatedQuantity} {selectedOrder.unit} (Rp{' '}
                  {selectedOrder.estimatedPrice.toLocaleString('id-ID')})
                </span>
              </div>
              <div className="flex justify-between font-bold text-[#cd6184]">
                <span>Timbangan Aktual:</span>
                <span>
                  {selectedOrder.actualQuantity !== undefined
                    ? `${selectedOrder.actualQuantity} ${selectedOrder.unit}`
                    : 'Belum ditimbang kurir'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#254117] pt-1 border-t">
                <span>Total Biaya:</span>
                <span className="text-[#97a273]">
                  Rp {(selectedOrder.actualPrice || selectedOrder.estimatedPrice).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Payment Status Toggle */}
            <div className="flex items-center justify-between p-3 bg-[#ffecf2]/50 rounded-2xl border border-[#cd6184]/20">
              <div>
                <span className="text-[11px] text-[#254117]/70 block font-medium">Status Pembayaran:</span>
                <span className="text-xs font-bold text-[#254117] uppercase">
                  {selectedOrder.paymentMethod} • {selectedOrder.paymentStatus === 'paid' ? 'LUNAS' : 'PENDING'}
                </span>
              </div>
              <button
                onClick={() => handleTogglePayment(selectedOrder.id, selectedOrder.paymentStatus)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedOrder.paymentStatus === 'paid'
                    ? 'bg-[#97a273] text-white'
                    : 'bg-[#ffbd59] text-[#254117]'
                }`}
              >
                {selectedOrder.paymentStatus === 'paid' ? '✓ Lunas' : 'Tandai Lunas'}
              </button>
            </div>

            {/* Courier Assignment Control */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#254117]">
                Tugaskan / Ganti Kurir:
              </label>
              <select
                value={selectedOrder.courierId || ''}
                onChange={(e) => handleAssignCourier(selectedOrder.id, e.target.value)}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:border-[#cd6184]"
              >
                <option value="">-- Pilih Kurir --</option>
                {couriers.map((cr) => (
                  <option key={cr.id} value={cr.id}>
                    {cr.name} ({cr.status === 'active' ? 'Aktif' : 'Nonaktif'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Update Control (Admin Exclusive) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#254117]">
                  Ubah Status Cucian (Wewenang Admin Gerai):
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffecf2] text-[#cd6184]">
                  Admin Gerai
                </span>
              </div>
              <p className="text-[11px] text-[#254117]/65">
                Proses pencucian, pengeringan, dan penyetrikaan dikelola oleh Admin. Kurir hanya bertugas untuk antar dan jemput.
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                {allStatuses.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleStatusChange(selectedOrder.id, st.id)}
                    className={`py-2 px-1.5 rounded-xl font-bold uppercase text-[10px] transition-all cursor-pointer text-center ${
                      selectedOrder.status === st.id
                        ? 'bg-[#cd6184] text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-gray-200 text-[#254117]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-2 border-t text-[11px] text-[#254117]/70 space-y-1">
              <p className="font-semibold text-[#254117]">Log Progres Pakaian:</p>
              <div>• Dipesan: {selectedOrder.statusTimestamps.booked}</div>
              {selectedOrder.statusTimestamps.pickup && (
                <div>• Jadwal Penjemputan: {selectedOrder.statusTimestamps.pickup}</div>
              )}
              {selectedOrder.statusTimestamps.picked_up && (
                <div>• Dijemput Kurir: {selectedOrder.statusTimestamps.picked_up}</div>
              )}
              {selectedOrder.statusTimestamps.washing && (
                <div>• Pencucian (Admin): {selectedOrder.statusTimestamps.washing}</div>
              )}
              {selectedOrder.statusTimestamps.drying && (
                <div>• Pengeringan (Admin): {selectedOrder.statusTimestamps.drying}</div>
              )}
              {selectedOrder.statusTimestamps.ironing && (
                <div>• Penyetrikaan (Admin): {selectedOrder.statusTimestamps.ironing}</div>
              )}
              {selectedOrder.statusTimestamps.ready && (
                <div>• Siap Antar (Admin): {selectedOrder.statusTimestamps.ready}</div>
              )}
              {selectedOrder.statusTimestamps.delivered && (
                <div>• Selesai Diantar Kurir: {selectedOrder.statusTimestamps.delivered}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
