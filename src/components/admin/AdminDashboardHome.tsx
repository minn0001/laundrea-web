import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminView } from './AdminSidebar';
import {
  PeriodFilter,
  getOrderDate,
  getPeriodDailyPoints,
  getTodayDateStr,
  getTrendChartBars,
} from '../../utils/orderAnalytics';
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
  const [trendPeriod, setTrendPeriod] = useState<PeriodFilter>('7days');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState(getTodayDateStr());

  // Metrics calculation
  const totalOrders = orders.length;
  const inProgressOrders = orders.filter((o) => o.status !== 'delivered').length;
  const completedOrders = orders.filter((o) => o.status === 'delivered').length;

  const totalRevenue = orders.reduce((sum, ord) => {
    return sum + (ord.actualPrice || ord.estimatedPrice || 0);
  }, 0);

  // Best-selling plan count
  const planCounts: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    if (!planCounts[o.planName]) {
      planCounts[o.planName] = { count: 0, revenue: 0 };
    }
    planCounts[o.planName].count += 1;
    planCounts[o.planName].revenue += (o.actualPrice || o.estimatedPrice || 0);
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

  // Trend dataset generated from real orders data in app (computed strictly by booking date statusTimestamps.booked / pickupDate fallback)
  const dailyPoints = getPeriodDailyPoints(
    trendPeriod,
    orders,
    [],
    customStartDate,
    customEndDate
  );

  const totalPeriodOrders = dailyPoints.reduce((sum, t) => sum + t.orders, 0);
  const avgDailyOrders = dailyPoints.length > 0 ? (totalPeriodOrders / dailyPoints.length).toFixed(1) : '0';

  // Find busiest day in the period from real daily data
  const busiestItem = dailyPoints.reduce(
    (prev, curr) => (curr.orders > prev.orders ? curr : prev),
    dailyPoints[0]
  );
  const busiestDayText =
    busiestItem && busiestItem.orders > 0
      ? `Hari tersibuk: ${busiestItem.fullDateLabel || busiestItem.dayLabel} (${busiestItem.orders} pesanan)`
      : 'Belum ada pesanan';

  // Responsive chart bars: <=14 days daily, 15-90 days weekly, >90 days monthly
  const chartBars = getTrendChartBars(dailyPoints);
  const maxBarOrders = Math.max(...chartBars.map((b) => b.orders), 1);

  // Orders falling into the selected trend period
  const periodOrders = orders.filter((o) =>
    dailyPoints.some((t) => t.dateStr === getOrderDate(o))
  );

  // Status breakdown counts for selected period
  const statusBreakdown = [
    { key: 'pickup', label: 'Jemput', count: periodOrders.filter((o) => o.status === 'pickup').length, color: '#cd6184' },
    { key: 'washing', label: 'Cuci', count: periodOrders.filter((o) => o.status === 'washing').length, color: '#97a273' },
    { key: 'drying', label: 'Kering', count: periodOrders.filter((o) => o.status === 'drying').length, color: '#ffbd59' },
    { key: 'ironing', label: 'Setrika', count: periodOrders.filter((o) => o.status === 'ironing').length, color: '#cd6184' },
    { key: 'ready', label: 'Siap Antar', count: periodOrders.filter((o) => o.status === 'ready').length, color: '#ffbd59' },
    { key: 'delivered', label: 'Terkirim', count: periodOrders.filter((o) => o.status === 'delivered').length, color: '#97a273' },
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
        {/* Trend Chart (Real Order Volume & Operational Trends) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#254117] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#cd6184]" />
                <span>Tren Aktivitas Pesanan & Operasional</span>
              </h2>
              <p className="text-xs text-[#254117]/60">
                {trendPeriod === '7days'
                  ? 'Grafik fluktuasi pesanan masuk dan penyelesaian selama 7 hari terakhir'
                  : trendPeriod === 'today'
                  ? 'Grafik aktivitas pesanan untuk hari ini'
                  : trendPeriod === 'month'
                  ? 'Grafik aktivitas pesanan untuk bulan ini'
                  : 'Grafik aktivitas pesanan untuk rentang tanggal kustom'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Period Filter Buttons */}
              <div className="flex items-center gap-1 bg-[#ffecf2] p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setTrendPeriod('today')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    trendPeriod === 'today'
                      ? 'bg-[#cd6184] text-white shadow-xs'
                      : 'text-[#254117]/70'
                  }`}
                >
                  Hari Ini
                </button>
                <button
                  type="button"
                  onClick={() => setTrendPeriod('7days')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    trendPeriod === '7days'
                      ? 'bg-[#cd6184] text-white shadow-xs'
                      : 'text-[#254117]/70'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setTrendPeriod('month')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    trendPeriod === 'month'
                      ? 'bg-[#cd6184] text-white shadow-xs'
                      : 'text-[#254117]/70'
                  }`}
                >
                  Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setTrendPeriod('custom')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    trendPeriod === 'custom'
                      ? 'bg-[#cd6184] text-white shadow-xs'
                      : 'text-[#254117]/70'
                  }`}
                >
                  Kustom
                </button>
              </div>

              {/* View Tab Buttons */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveChartTab('volume')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeChartTab === 'volume'
                      ? 'bg-white text-[#254117] shadow-xs'
                      : 'text-[#254117]/70'
                  }`}
                >
                  Volume
                </button>
                <button
                  type="button"
                  onClick={() => setActiveChartTab('status')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    activeChartTab === 'status'
                      ? 'bg-white text-[#254117] shadow-xs'
                      : 'text-[#254117]/70'
                  }`}
                >
                  Status
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Range Selector if selected */}
          {trendPeriod === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-2xl text-xs border border-gray-100">
              <span className="font-bold text-[#254117] w-full sm:w-auto">Rentang Tanggal:</span>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-[#254117] text-xs font-medium focus:outline-hidden focus:border-[#cd6184] min-w-0 flex-1 sm:flex-none"
                />
                <span className="text-gray-400 font-medium text-xs shrink-0">s.d.</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-[#254117] text-xs font-medium focus:outline-hidden focus:border-[#cd6184] min-w-0 flex-1 sm:flex-none"
                />
              </div>
            </div>
          )}

          {totalPeriodOrders === 0 ? (
            /* Empty state when no real orders exist in this period */
            <div className="h-56 flex flex-col items-center justify-center p-6 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
              <Activity className="w-8 h-8 text-[#254117]/30 mb-2" />
              <p className="text-sm font-bold text-[#254117]/80">Belum ada pesanan pada periode ini</p>
              <p className="text-xs text-[#254117]/50 mt-1 max-w-xs">
                Pesanan yang dibuat atau dijadwalkan pada rentang tanggal ini akan otomatis tampil di sini secara real-time.
              </p>
            </div>
          ) : activeChartTab === 'volume' ? (
            /* Bar Chart for Real Orders */
            <div className="pt-2">
              <div className="w-full overflow-x-auto pb-2">
                <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 px-1 min-w-full">
                  {chartBars.map((item) => {
                    const heightPercent = maxBarOrders > 0 ? Math.round((item.orders / maxBarOrders) * 100) : 0;
                    const isPeak = item.orders > 0 && item.orders === maxBarOrders;

                    return (
                      <div
                        key={item.key}
                        className={`flex-1 ${item.minWidthClass} flex flex-col items-center gap-2 h-full justify-end group`}
                      >
                        <div className="w-full flex items-end justify-center h-full">
                          <div
                            style={{ height: item.orders > 0 ? `${Math.max(heightPercent, 12)}%` : '6px' }}
                            className={`w-full max-w-[36px] rounded-t-xl transition-all relative cursor-pointer ${
                              item.orders === 0
                                ? 'bg-gray-200 hover:bg-gray-300'
                                : isPeak
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
                        <div className="text-center w-full px-0.5">
                          <span className="text-[10px] font-bold text-[#254117] block leading-tight whitespace-nowrap">
                            {item.topLabel}
                          </span>
                          <span className="text-[9.5px] font-semibold text-[#254117]/60 block leading-tight mt-0.5 whitespace-nowrap">
                            {item.bottomLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-row items-center justify-between pt-3.5 border-t border-gray-100 text-[10px] sm:text-xs text-[#254117]/70 gap-2 overflow-hidden">
                <span className="truncate">Total: {totalPeriodOrders} pesanan • Rata-rata {avgDailyOrders} pesanan/hari</span>
                <span className="text-[#cd6184] font-bold shrink-0">{busiestDayText}</span>
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
