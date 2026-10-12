import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  PeriodFilter,
  getOrderDate,
  isDateInPeriod,
  getPeriodDailyPoints,
  getTodayDateStr,
} from '../../utils/orderAnalytics';
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  Plus,
  ArrowUpRight,
  PieChart,
  Calendar,
  Layers,
  Download,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Filter,
} from 'lucide-react';

export const AdminFinancialReportsPage: React.FC = () => {
  const { orders, operationalCosts, addOperationalCost, hasPermission } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-10');
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');
  const [newCostCategory, setNewCostCategory] = useState('');
  const [newCostAmount, setNewCostAmount] = useState<number>(350000);
  const [downloadToast, setDownloadToast] = useState(false);

  const todayReal = getTodayDateStr();

  const getPeriodLabel = () => {
    if (dateFilter === 'today') return `Hari Ini (${todayReal})`;
    if (dateFilter === '7days') return `7 Hari Terakhir (sampai ${todayReal})`;
    if (dateFilter === 'month') {
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthIdx = parseInt(todayReal.slice(5, 7), 10) - 1;
      return `Bulan ${monthNames[monthIdx] || ''} ${todayReal.slice(0, 4)}`;
    }
    if (dateFilter === 'custom') return `${customStartDate || 'Awal'} sampai ${customEndDate || 'Akhir'}`;
    return 'Semua Periode';
  };

  // Dynamically filtered orders and operational costs based strictly on real creation/booking date
  const filteredOrders = orders.filter((ord) =>
    isDateInPeriod(getOrderDate(ord), dateFilter, customStartDate, customEndDate)
  );
  const filteredCosts = operationalCosts.filter((item) =>
    isDateInPeriod((item.date || '').slice(0, 10), dateFilter, customStartDate, customEndDate)
  );

  // Recalculated Gross Revenue directly from filtered real orders
  const grossRevenue = filteredOrders.reduce((sum, ord) => {
    return sum + (ord.actualPrice || ord.estimatedPrice || 0);
  }, 0);

  // Recalculated Total Operational Cost from filtered costs
  const totalCost = filteredCosts.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Recalculated Net Profit & Margin
  const netProfit = grossRevenue - totalCost;
  const netMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
  const averageOrderValue = filteredOrders.length > 0 ? Math.round(grossRevenue / filteredOrders.length) : 0;

  // Breakdown by plan for filtered orders
  const planRevenue: Record<string, { revenue: number; count: number }> = {};
  filteredOrders.forEach((ord) => {
    const val = ord.actualPrice || ord.estimatedPrice || 0;
    if (!planRevenue[ord.planName]) {
      planRevenue[ord.planName] = { revenue: 0, count: 0 };
    }
    planRevenue[ord.planName].revenue += val;
    planRevenue[ord.planName].count += 1;
  });

  // Dynamically generate real chart data based on filtered real orders & costs
  const generateRealChartData = () => {
    if (timeframe === 'monthly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonthIdx = now.getMonth();

      // Show 6 months ending at current calendar month
      const monthsList: {
        key: string;
        topLabel: string;
        bottomLabel: string;
        label: string;
        revenue: number;
        cost: number;
        orders: number;
      }[] = [];

      for (let i = 5; i >= 0; i--) {
        const mIdx = (currentMonthIdx - i + 12) % 12;
        const y = currentMonthIdx - i < 0 ? currentYear - 1 : currentYear;
        const monthKey = `${y}-${String(mIdx + 1).padStart(2, '0')}`;

        const monthOrders = orders.filter((ord) => getOrderDate(ord).startsWith(monthKey));
        const rev = monthOrders.reduce((sum, ord) => sum + (ord.actualPrice || ord.estimatedPrice || 0), 0);
        const cst = operationalCosts
          .filter((c) => (c.date || '').slice(0, 10).startsWith(monthKey))
          .reduce((sum, c) => sum + (c.amount || 0), 0);

        monthsList.push({
          key: monthKey,
          topLabel: monthNames[mIdx],
          bottomLabel: `'${String(y).slice(2)}`,
          label: `${monthNames[mIdx]} '${String(y).slice(2)}`,
          revenue: rev,
          cost: cst,
          orders: monthOrders.length,
        });
      }
      return monthsList;
    }

    // Daily breakdown: two-line short labels under each group (weekday on top, date like "04/10" below, no parentheses)
    return getPeriodDailyPoints(dateFilter, filteredOrders, filteredCosts, customStartDate, customEndDate).map((p) => {
      const parts = p.dateStr.split('-');
      const dObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const INDO_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const dayName = INDO_DAYS[dObj.getDay()] || '';
      const dayNum = parts[2];
      const monthNum = parts[1];

      return {
        key: p.dateStr,
        topLabel: dayName,
        bottomLabel: `${dayNum}/${monthNum}`,
        label: `${dayName} ${dayNum}/${monthNum}`,
        revenue: p.revenue,
        cost: p.cost,
        orders: p.orders,
      };
    });
  };

  const chartData = generateRealChartData();
  const maxBarValue = Math.max(...chartData.map((d) => Math.max(d.revenue, d.cost)), 10000) * 1.15;

  const [activeTooltipIdx, setActiveTooltipIdx] = useState<number | null>(null);

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('expense_manage')) return;
    if (!newCostCategory.trim()) return;

    addOperationalCost(newCostCategory, newCostAmount);
    setNewCostCategory('');
  };

  const handleExportReport = () => {
    if (!hasPermission('financial_export')) return;
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3500);

    // Generate CSV file content and trigger browser download
    const csvContent = [
      'Laporan Keuangan Laundrea',
      `Periode Laporan: ${getPeriodLabel()}`,
      `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      `Total Pendapatan Kotor,Rp ${grossRevenue}`,
      `Total Beban Operasional,Rp ${totalCost}`,
      `Estimasi Laba Bersih,Rp ${netProfit}`,
      `Margin Keuntungan,${netMargin}%`,
      `Rata-rata Nilai Order,Rp ${averageOrderValue}`,
      `Jumlah Pesanan,${filteredOrders.length}`,
      '',
      'Daftar Pengeluaran Operasional Periode Ini:',
      'Kategori,Nominal,Tanggal',
      ...filteredCosts.map((c) => `"${c.category}",${c.amount},"${c.date}"`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `laporan-keuangan-laundrea-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="admin-financials-page" className="space-y-8">
      {/* Header & Export button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#254117]">Laporan Keuangan & Analisis</h1>
        </div>

        {hasPermission('financial_export') && (
          <button
            onClick={handleExportReport}
            className="px-4 py-2 rounded-xl bg-[#254117] hover:bg-[#1d3312] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ffbd59]" />
            <span>Unduh Rekap Laporan (.CSV)</span>
          </button>
        )}
      </div>

      {downloadToast && (
        <div className="p-3 bg-[#97a273] text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Laporan keuangan berhasil diunduh dan tersimpan ke perangkat Anda!</span>
        </div>
      )}

      {/* Date Range Selectors Bar */}
      <div className="bg-white p-4 rounded-3xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#254117]">
            <Calendar className="w-4 h-4 text-[#cd6184]" />
            <span>Pilih Rentang Periode Laporan:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-[#ffecf2] p-1 rounded-2xl text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-[#cd6184] text-white shadow-xs'
                  : 'text-[#254117]/70'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                dateFilter === '7days'
                  ? 'bg-[#cd6184] text-white shadow-xs'
                  : 'text-[#254117]/70'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-[#cd6184] text-white shadow-xs'
                  : 'text-[#254117]/70'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                dateFilter === 'custom'
                  ? 'bg-[#cd6184] text-white shadow-xs'
                  : 'text-[#254117]/70'
              }`}
            >
              Kustom Tanggal
            </button>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
            <span className="text-[#254117] font-bold">Pilih Rentang Tanggal:</span>
            <div className="flex items-center gap-2">
              <span className="text-[#254117]/70 font-medium">Dari:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184] bg-white cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#254117]/70 font-medium">Sampai:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="p-2 border border-gray-300 rounded-xl text-xs font-semibold text-[#254117] focus:outline-none focus:border-[#cd6184] bg-white cursor-pointer"
              />
            </div>
            {customStartDate > customEndDate && (
              <span className="text-red-500 font-semibold text-[11px]">
                *Tanggal awal tidak boleh melebihi tanggal akhir
              </span>
            )}
          </div>
        )}
      </div>

      {/* Top 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#97a273]/40 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#97a273] uppercase tracking-wider block">
              Pendapatan Kotor
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#254117]">
              Rp {grossRevenue.toLocaleString('id-ID')}
            </div>
          </div>
          <p className="text-[11px] text-[#254117]/60 mt-2">
            Dari {filteredOrders.length} pesanan tercatat ({getPeriodLabel()})
          </p>
        </div>

        {/* Operational Expense */}
        <div className="bg-white p-5 rounded-3xl border-2 border-[#cd6184]/40 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#cd6184] uppercase tracking-wider block">
              Beban Operasional
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#254117]">
              Rp {totalCost.toLocaleString('id-ID')}
            </div>
          </div>
          <p className="text-[11px] text-[#254117]/60 mt-2">
            {filteredCosts.length} pengeluaran operasional ({getPeriodLabel()})
          </p>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-[#ffecf2] p-5 rounded-3xl border-2 border-[#ffbd59]/60 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#254117] uppercase tracking-wider block">
              Estimasi Laba Bersih
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#cd6184]">
              Rp {netProfit.toLocaleString('id-ID')}
            </div>
          </div>
          <p className="text-[11px] text-[#254117]/80 mt-2 font-semibold">
            Margin Bersih Operasional: <strong className="text-[#254117]">{netMargin}%</strong>
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-[#254117]/70 uppercase tracking-wider block">
              Rata-rata Order (AOV)
            </span>
            <div className="mt-2 text-2xl sm:text-3xl font-black text-[#254117]">
              Rp {averageOrderValue.toLocaleString('id-ID')}
            </div>
          </div>
          <p className="text-[11px] text-[#97a273] font-semibold mt-2">
            {filteredOrders.length > 0 ? `Berdasarkan ${filteredOrders.length} transaksi` : 'Belum ada transaksi di periode ini'}
          </p>
        </div>
      </div>

      {/* Revenue & Expense Bar Chart Section */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-base font-bold text-[#254117] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#cd6184]" />
              <span>Grafik Perbandingan Pendapatan vs Beban Operasional</span>
            </h3>
            <p className="text-xs text-[#254117]/60">
              Visualisasi rasio omzet kotor dan pengeluaran berkala
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#97a273]" />
              <span className="text-[#254117]">Pendapatan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-[#cd6184]" />
              <span className="text-[#254117]">Beban Operasional</span>
            </div>

            <div className="flex bg-[#ffecf2] p-1 rounded-xl">
              <button
                onClick={() => setTimeframe('daily')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeframe === 'daily' ? 'bg-[#cd6184] text-white shadow-xs' : 'text-[#254117]'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setTimeframe('monthly')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  timeframe === 'monthly' ? 'bg-[#cd6184] text-white shadow-xs' : 'text-[#254117]'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="h-52 sm:h-64 flex flex-col items-center justify-center p-6 text-center bg-gray-50/70 rounded-2xl border border-dashed border-gray-200">
            <BarChart3 className="w-8 h-8 text-[#254117]/30 mb-2" />
            <p className="text-sm font-bold text-[#254117]/80">Belum ada pesanan pada periode ini</p>
            <p className="text-xs text-[#254117]/50 mt-1 max-w-xs">
              Pendapatan dan beban operasional pada rentang tanggal terpilih akan otomatis tampil di sini secara real-time.
            </p>
          </div>
        ) : (
          /* Custom Responsive Bar Visualization (Requirement 8) */
          <div className="w-full overflow-hidden">
            <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
              <div className="h-[200px] sm:h-[220px] min-w-full flex items-end justify-start sm:justify-between gap-2 sm:gap-3 pt-6 px-1 border-b border-gray-200">
                {chartData.map((bar, idx) => {
                  const revenueHeight = bar.revenue > 0 ? Math.max(4, Math.round((bar.revenue / maxBarValue) * 100)) : 0;
                  const costHeight = bar.cost > 0 ? Math.max(4, Math.round((bar.cost / maxBarValue) * 100)) : 0;
                  const isHoveredOrTapped = activeTooltipIdx === idx;

                  // Format short amount for mobile (e.g. "Rp 100rb")
                  const formatShortRupiah = (val: number) => {
                    if (val === 0) return 'Rp 0';
                    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1).replace('.0', '')}jt`;
                    if (val >= 1000) return `Rp ${Math.round(val / 1000)}rb`;
                    return `Rp ${val}`;
                  };

                  return (
                    <div
                      key={bar.key || idx}
                      onClick={() => setActiveTooltipIdx(isHoveredOrTapped ? null : idx)}
                      className="flex-1 min-w-[44px] sm:min-w-[48px] flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {/* Amounts above bars or on tap */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full relative">
                        {/* Interactive tooltip */}
                        <div
                          className={`transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#254117] text-white text-[9.5px] py-1 px-1.5 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md ${
                            isHoveredOrTapped ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          Rev: {formatShortRupiah(bar.revenue)} | Cost: {formatShortRupiah(bar.cost)}
                        </div>

                        {/* Revenue Bar (#97a273) - Zero renders no bar */}
                        {revenueHeight > 0 ? (
                          <div
                            style={{ height: `${revenueHeight}%` }}
                            className="w-full max-w-[18px] sm:max-w-[24px] bg-[#97a273] hover:bg-[#859062] rounded-t-md transition-all relative flex flex-col justify-start items-center"
                          >
                            <span className="text-[8px] font-bold text-gray-500 absolute -top-4 whitespace-nowrap hidden sm:group-hover:inline">
                              {formatShortRupiah(bar.revenue)}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full max-w-[18px] sm:max-w-[24px] h-0" />
                        )}

                        {/* Cost Bar (#cd6184) - Zero renders no bar */}
                        {costHeight > 0 ? (
                          <div
                            style={{ height: `${costHeight}%` }}
                            className="w-full max-w-[18px] sm:max-w-[24px] bg-[#cd6184] hover:bg-[#b85373] rounded-t-md transition-all relative flex flex-col justify-start items-center"
                          >
                            <span className="text-[8px] font-bold text-gray-500 absolute -top-4 whitespace-nowrap hidden sm:group-hover:inline">
                              {formatShortRupiah(bar.cost)}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full max-w-[18px] sm:max-w-[24px] h-0" />
                        )}
                      </div>

                      {/* Two-line short labels under each group without parens */}
                      <div className="text-center pt-1.5 pb-1 flex flex-col items-center justify-center leading-none select-none">
                        <span className="text-[10px] font-bold text-[#254117] block">
                          {bar.topLabel}
                        </span>
                        <span className="text-[9px] font-medium text-gray-500 block mt-0.5">
                          {bar.bottomLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Chart summary caption bar: wrap onto separate lines without ellipsis (Requirement 8) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-100 text-xs text-[#254117]/80 gap-1.5 sm:gap-2">
          <span className="font-medium text-gray-700 break-words leading-relaxed">
            Periode: {getPeriodLabel()}
          </span>
          <span className="text-[#cd6184] font-bold shrink-0 text-left sm:text-right">
            {filteredOrders.length} transaksi ({timeframe === 'daily' ? 'Harian' : 'Bulanan'})
          </span>
        </div>
      </div>

      {/* Plan Contribution & Expense Record Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Breakdown by Plan */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#254117] flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#cd6184]" />
            <span>Kontribusi Pendapatan per Paket Layanan</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(planRevenue).length === 0 ? (
              <div className="p-6 text-center text-xs text-[#254117]/60 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                Tidak ada pesanan masuk pada periode {getPeriodLabel()}.
              </div>
            ) : (
              Object.entries(planRevenue).map(([planName, stats]) => {
                const share = grossRevenue > 0 ? Math.round((stats.revenue / grossRevenue) * 100) : 0;

                return (
                  <div key={planName} className="p-3.5 bg-gray-50 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#254117] text-sm">{planName}</span>
                      <span className="font-extrabold text-[#cd6184]">
                        Rp {stats.revenue.toLocaleString('id-ID')} ({share}%)
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${share}%` }}
                        className="h-full bg-[#cd6184] rounded-full"
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-[#254117]/60">
                      <span>{stats.count} pesanan diproses</span>
                      <span>Rata-rata: Rp {Math.round(stats.revenue / stats.count).toLocaleString('id-ID')}/order</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Operational Cost Input / Summary */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#254117] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#cd6184]" />
            <span>Catat Pengeluaran Operasional</span>
          </h3>

          {hasPermission('expense_manage') ? (
            <form onSubmit={handleAddCost} className="space-y-3 p-3.5 bg-[#ffecf2]/50 rounded-2xl border border-[#cd6184]/20">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Kategori Pengeluaran
                </label>
                <input
                  type="text"
                  value={newCostCategory}
                  onChange={(e) => setNewCostCategory(e.target.value)}
                  placeholder="Contoh: Pembelian Plastik Eco Cover & Hanger"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#cd6184]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Nominal Biaya (Rp)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={newCostAmount}
                  onChange={(e) => setNewCostAmount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 font-bold focus:outline-none focus:border-[#cd6184]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                + Catat Biaya Operasional
              </button>
            </form>
          ) : (
            <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-2xl text-xs text-gray-400 text-center italic">
              Pencatatan pengeluaran operasional dikunci (Wewenang Super Admin).
            </div>
          )}

          {/* Cost items list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-[#254117]/60 block">
              Riwayat Pengeluaran ({filteredCosts.length} item pada periode terpilih):
            </span>
            {filteredCosts.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#254117]/60 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                Tidak ada pengeluaran operasional pada periode {getPeriodLabel()}.
              </div>
            ) : (
              filteredCosts.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-[#254117] block">{item.category}</span>
                    <span className="text-[10px] text-gray-400">{item.date}</span>
                  </div>
                  <span className="font-bold text-[#cd6184]">
                    Rp {item.amount.toLocaleString('id-ID')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
