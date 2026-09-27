import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminView } from './AdminSidebar';
import {
  ShoppingBag,
  TrendingUp,
  Sparkles,
  RotateCw,
  ArrowUpRight,
  Truck,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronRight,
  ArrowRight,
  Activity,
  Award,
} from 'lucide-react';

interface AdminDashboardHomeProps {
  onNavigate: (view: AdminView) => void;
  onSelectOrder: (orderId: string) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  onNavigate,
  onSelectOrder,
}) => {
  const { orders, couriers, customers } = useApp();
  const [activeChartTab, setActiveChartTab] = useState<'volume' | 'status'>('volume');

  // Metrics calculation
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter((o) => o.status !== 'delivered').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  const totalRevenue = orders.reduce((sum, ord) => {
    return sum + (ord.actualPrice || ord.estimatedPrice);
  }, 0);

  // Best-selling plan count
  const planCounts: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (!planCounts[o.planName]) {
      planCounts[o.planName] = { count: 0, revenue: 0 };
    }
    planCounts[o.planName].count += 1;
    planCounts[o.planName].revenue += (o.actualPrice || o.estimatedPrice);
  });

  let bestSellingPlan = 'Express';
  let maxCount = 0;
  Object.entries(planCounts).forEach(([plan, data]) => {
    if (data.count > maxCount) {
      maxCount = data.count;
      bestSellingPlan = plan;
    }
  });

  // Active Couriers
  const activeCouriersCount = couriers.filter((c) => c.status === 'active').length;

  // 7-day trend dataset
  const weeklyTrends = [
    { day: 'Sen', orders: 6, revenue: 360000 },
    { day: 'Sel', orders: 9, revenue: 540000 },
    { day: 'Rab', orders: 8, revenue: 480000 },
    { day: 'Kam', orders: 12, revenue: 720000 },
    { day: 'Jum', orders: 15, revenue: 950000 },
    { day: 'Sab', orders: 19, revenue: 1240000 },
    { day: 'Min', orders: 14, revenue: 890000 },
  ];
  const maxWeeklyOrders = Math.max(...weeklyTrends.map((t) => t.orders));

  // Status breakdown counts
  const statusBreakdown = [
    { key: 'pickup', label: 'Jemput', count: orders.filter((o) => o.status === 'pickup').length, color: '#cd6184' },
    { key: 'washing', label: 'Cuci', count: orders.filter((o) => o.status === 'washing').length, color: '#97a273' },
    { key: 'drying', label: 'Kering', count: orders.filter((o) => o.status === 'drying').length, color: '#ffbd59' },
    { key: 'ironing', label: 'Setrika', count: orders.filter((o) => o.status === 'ironing').length, color: '#cd6184' },
    { key: 'ready', label: 'Siap Antar', count: orders.filter((o) => o.status === 'ready').length, color: '#ffbd59' },
    { key: 'delivered', label: 'Terkirim', count: completedOrders, color: '#97a273' },
  ];

  return (
    <div className="space-y-6">
      {/* Header with greeting & quick actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#254117] tracking-tight">
            Dasbor Utama Laundrea
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('orders')}
            className="px-4 py-2 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Semua Pesanan</span>
          </button>
          <button
            onClick={() => onNavigate('couriers')}
            className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 hover:border-[#97a273] text-[#254117] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4 text-[#97a273]" />
            <span>Armada Kurir</span>
          </button>
        </div>
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Orders (#cd6184) */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#cd6184]/30 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#cd6184] uppercase tracking-wider">
                Total Pesanan
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#cd6184] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#254117]">{totalOrders}</span>
              <span className="text-xs text-[#254117]/60 ml-2">pesanan tercatat</span>
            </div>
          </div>
          <p className="text-[11px] text-[#cd6184] font-semibold mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18% dari periode lalu
          </p>
        </div>

        {/* Card 2: Total Revenue (#97a273) */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#97a273]/40 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#97a273] uppercase tracking-wider">
                Total Pendapatan
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#97a273] text-white flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#254117]">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#97a273] font-semibold mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Nilai riil & estimasi terverifikasi
          </p>
        </div>

        {/* Card 3: Best-Selling Plan (#ffbd59) */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#ffbd59]/50 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#254117] uppercase tracking-wider">
                Paket Terlaris
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#ffbd59] text-[#254117] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#254117]">
                {bestSellingPlan}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#254117]/70 font-semibold mt-3">
            {maxCount} pesanan memilih paket ini
          </p>
        </div>

        {/* Card 4: Orders in Progress (#ffecf2) */}
        <div className="bg-[#ffecf2] p-5 rounded-3xl border-2 border-[#cd6184]/20 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#254117] uppercase tracking-wider">
                Pesanan Diproses
              </span>
              <div className="w-9 h-9 rounded-2xl bg-[#254117] text-white flex items-center justify-center">
                <RotateCw className="w-4 h-4 animate-spin" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-[#254117]">{inProgressOrders}</span>
              <span className="text-xs text-[#254117]/70 ml-2">sedang ditangani</span>
            </div>
          </div>
          <p className="text-[11px] text-[#254117]/80 font-semibold mt-3">
            {completedOrders} pesanan telah berhasil terkirim
          </p>
        </div>
      </div>

      {/* Visual Analytics & Operational Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (7-day Order Volume) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#cd6184]" />
                <span>Tren Aktivitas Pesanan & Operasional</span>
              </h2>
              <p className="text-xs text-[#254117]/60">
                Grafik fluktuasi pesanan masuk dan penyelesaian selama 7 hari terakhir
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#ffecf2] p-1 rounded-xl self-start sm:self-auto text-xs">
              <button
                onClick={() => setActiveChartTab('volume')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeChartTab === 'volume'
                    ? 'bg-[#cd6184] text-white shadow-xs'
                    : 'text-[#254117]/70'
                }`}
              >
                Volume Order
              </button>
              <button
                onClick={() => setActiveChartTab('status')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  activeChartTab === 'status'
                    ? 'bg-[#cd6184] text-white shadow-xs'
                    : 'text-[#254117]/70'
                }`}
              >
                Distribusi Status
              </button>
            </div>
          </div>

          {activeChartTab === 'volume' ? (
            /* 7-Day Bar Chart */
            <div className="pt-2">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-5 px-2">
                {weeklyTrends.map((item, idx) => {
                  const heightPercent = Math.round((item.orders / maxWeeklyOrders) * 100);
                  const isPeak = item.orders === maxWeeklyOrders;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[36px] rounded-t-xl transition-all relative cursor-pointer ${
                            isPeak
                              ? 'bg-[#cd6184] hover:bg-[#b85373]'
                              : 'bg-[#97a273] hover:bg-[#859062]'
                          }`}
                        >
                          {/* Tooltip */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-1/2 -translate-x-1/2 bg-[#254117] text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap z-20 pointer-events-none shadow-md">
                            <span className="font-bold">{item.orders} pesanan</span>
                            <span className="block text-white/70">Rp {item.revenue.toLocaleString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[11px] font-bold text-[#254117] block">{item.day}</span>
                        <span className="text-[10px] text-[#254117]/60 font-semibold">{item.orders}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-[#254117]/70">
                <span>Rata-rata 11.8 pesanan/hari</span>
                <span className="text-[#cd6184] font-bold">Hari tersibuk: Sabtu (19 pesanan)</span>
              </div>
            </div>
          ) : (
            /* Status Distribution View */
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {statusBreakdown.map((st) => (
                  <div key={st.key} className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#254117]">{st.label}</span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }} />
                    </div>
                    <span className="text-2xl font-black text-[#254117]">{st.count}</span>
                    <span className="text-[10px] text-[#254117]/60 block mt-0.5">
                      {totalOrders > 0 ? Math.round((st.count / totalOrders) * 100) : 0}% dari total
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Courier & Operational Status Mini Panel */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#97a273]" />
                <span>Armada & Pengantaran</span>
              </h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#97a273]/20 text-[#97a273]">
                {activeCouriersCount} Siap Antar
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {couriers.slice(0, 3).map((cr) => {
                const courierOrdersCount = orders.filter(
                  (o) => o.courierId === cr.id && o.status !== 'delivered'
                ).length;

                return (
                  <div
                    key={cr.id}
                    className="p-3 rounded-2xl bg-gray-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center font-bold">
                        {cr.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-[#254117] block">{cr.name}</span>
                        <span className="text-[10px] text-[#254117]/60">{cr.vehicle}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-[#cd6184] text-xs">
                        {courierOrdersCount} tugas aktif
                      </span>
                      <span className="text-[10px] text-[#97a273] block font-semibold">
                        {cr.status === 'active' ? '● Siap Antar' : '○ Standby'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => onNavigate('couriers')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#254117] text-white hover:bg-[#1e3412] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Kelola Armada Kurir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#254117]">Pesanan Terbaru</h2>
            <p className="text-xs text-[#254117]/60">Daftar transaksi dan aktivitas penjemputan terkini</p>
          </div>
          <button
            onClick={() => onNavigate('orders')}
            className="text-xs font-bold text-[#cd6184] hover:text-[#b85373] transition-colors flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua ({orders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ffecf2]/50 text-[#254117] border-b border-gray-100 font-bold">
              <tr>
                <th className="py-3.5 px-4">No. Order</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Paket</th>
                <th className="py-3.5 px-4">Kurir</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#254117]">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-[#254117] block">{order.customerName}</span>
                    <span className="text-[11px] text-[#254117]/60">{order.customerPhone}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-[#254117]">{order.planName}</span>
                    <span className="text-[11px] text-[#254117]/60 block">
                      {order.actualQuantity || order.estimatedQuantity} {order.unit}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {order.courierName ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#254117]">
                        <Truck className="w-3 h-3 text-[#97a273]" />
                        {order.courierName.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="text-[11px] text-red-500 font-semibold italic">Belum ditugaskan</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                        order.status === 'delivered'
                          ? 'bg-[#97a273] text-white'
                          : order.status === 'ready'
                          ? 'bg-[#ffbd59] text-[#254117]'
                          : 'bg-[#ffecf2] text-[#cd6184]'
                      }`}
                    >
                      {order.status === 'pickup'
                        ? 'Penjemputan'
                        : order.status === 'picked_up'
                        ? 'Sudah Dijemput'
                        : order.status === 'washing'
                        ? 'Pencucian'
                        : order.status === 'drying'
                        ? 'Pengeringan'
                        : order.status === 'ironing'
                        ? 'Penyetrikaan'
                        : order.status === 'ready'
                        ? 'Siap Antar'
                        : order.status === 'delivered'
                        ? 'Selesai'
                        : order.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#254117]">
                    Rp {(order.actualPrice || order.estimatedPrice).toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => {
                        onSelectOrder(order.id);
                        onNavigate('orders');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#cd6184] hover:text-white text-[#254117] font-semibold text-[11px] transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
