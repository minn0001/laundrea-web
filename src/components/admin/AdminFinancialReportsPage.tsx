import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  const { orders, operationalCosts, addOperationalCost } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'custom'>('7days');
  const [customStartDate, setCustomStartDate] = useState('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState('2026-09-10');
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');
  const [newCostCategory, setNewCostCategory] = useState('');
  const [newCostAmount, setNewCostAmount] = useState<number>(350000);
  const [downloadToast, setDownloadToast] = useState(false);

  // Total gross revenue from orders
  const grossRevenue = orders.reduce((sum, ord) => {
    return sum + (ord.actualPrice || ord.estimatedPrice);
  }, 0);

  // Total operational cost
  const totalCost = operationalCosts.reduce((sum, item) => sum + item.amount, 0);

  // Net Profit & Margin
  const netProfit = grossRevenue - totalCost;
  const netMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
  const averageOrderValue = orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;

  // Breakdown by plan
  const planRevenue: Record<string, { revenue: number; count: number }> = {};
  orders.forEach((ord) => {
    const val = ord.actualPrice || ord.estimatedPrice;
    if (!planRevenue[ord.planName]) {
      planRevenue[ord.planName] = { revenue: 0, count: 0 };
    }
    planRevenue[ord.planName].revenue += val;
    planRevenue[ord.planName].count += 1;
  });

  // Daily dummy bar dataset (7 days)
  const dailyData = [
    { label: 'Sen', revenue: 280000, cost: 95000 },
    { label: 'Sel', revenue: 420000, cost: 120000 },
    { label: 'Rab', revenue: 350000, cost: 110000 },
    { label: 'Kam', revenue: 510000, cost: 140000 },
    { label: 'Jum', revenue: 620000, cost: 160000 },
    { label: 'Sab', revenue: 840000, cost: 210000 },
    { label: 'Min', revenue: 690000, cost: 180000 },
  ];

  // Monthly dummy bar dataset (6 months)
  const monthlyData = [
    { label: 'Apr', revenue: 8400000, cost: 2900000 },
    { label: 'Mei', revenue: 9800000, cost: 3100000 },
    { label: 'Jun', revenue: 11200000, cost: 3600000 },
    { label: 'Jul', revenue: 12500000, cost: 3900000 },
    { label: 'Agu', revenue: 14100000, cost: 4200000 },
    { label: 'Sep', revenue: 15800000, cost: 4500000 },
  ];

  const chartData = timeframe === 'daily' ? dailyData : monthlyData;
  const maxBarValue = Math.max(...chartData.map((d) => d.revenue)) * 1.15;

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCostCategory.trim()) return;

    addOperationalCost(newCostCategory, newCostAmount);
    setNewCostCategory('');
  };

  const handleExportReport = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 3500);

    // Generate CSV file content and trigger browser download
    const csvContent = [
      'Laporan Keuangan Laundrea',
      `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      `Total Pendapatan Kotor,Rp ${grossRevenue}`,
      `Total Beban Operasional,Rp ${totalCost}`,
      `Estimasi Laba Bersih,Rp ${netProfit}`,
      `Margin Keuntungan,${netMargin}%`,
      `Rata-rata Nilai Order,Rp ${averageOrderValue}`,
      '',
      'Daftar Pengeluaran Operasional:',
      'Kategori,Nominal,Tanggal',
      ...operationalCosts.map((c) => `"${c.category}",${c.amount},"${c.date}"`),
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

        <button
          onClick={handleExportReport}
          className="px-4 py-2 rounded-xl bg-[#254117] hover:bg-[#1d3312] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#ffbd59]" />
          <span>Unduh Rekap Laporan (.CSV)</span>
        </button>
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
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-[#254117]/70 font-medium">Dari:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="p-2 border border-gray-200 rounded-xl text-xs font-semibold text-[#254117]"
            />
            <span className="text-[#254117]/70 font-medium">Sampai:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="p-2 border border-gray-200 rounded-xl text-xs font-semibold text-[#254117]"
            />
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
          <p className="text-[11px] text-[#254117]/60 mt-2">Dari {orders.length} pesanan tercatat</p>
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
          <p className="text-[11px] text-[#254117]/60 mt-2">Deterjen, bensin, listrik & kemasan</p>
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
          <p className="text-[11px] text-[#97a273] font-semibold mt-2">Tingkat transaksi per pelanggan</p>
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

        {/* Custom Responsive SVG / Bar Visualization */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 px-2">
          {chartData.map((bar, idx) => {
            const revenueHeight = Math.round((bar.revenue / maxBarValue) * 100);
            const costHeight = Math.round((bar.cost / maxBarValue) * 100);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                  {/* Revenue Bar (#97a273) */}
                  <div
                    style={{ height: `${revenueHeight}%` }}
                    className="w-full max-w-[28px] bg-[#97a273] hover:bg-[#859062] rounded-t-lg transition-all relative cursor-pointer"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#254117] text-white text-[10px] py-1 px-1.5 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md">
                      Rp {bar.revenue.toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Cost Bar (#cd6184) */}
                  <div
                    style={{ height: `${costHeight}%` }}
                    className="w-full max-w-[28px] bg-[#cd6184] hover:bg-[#b85373] rounded-t-lg transition-all relative cursor-pointer"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#254117] text-white text-[10px] py-1 px-1.5 rounded-md whitespace-nowrap z-20 pointer-events-none shadow-md">
                      Rp {bar.cost.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-[#254117] mt-1">{bar.label}</span>
              </div>
            );
          })}
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
            {Object.entries(planRevenue).map(([planName, stats]) => {
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
            })}
          </div>
        </div>

        {/* Operational Cost Input / Summary */}
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#254117] flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#cd6184]" />
            <span>Catat Pengeluaran Operasional</span>
          </h3>

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

          {/* Cost items list */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold text-[#254117]/60 block">
              Riwayat Pengeluaran Terakhir:
            </span>
            {operationalCosts.map((item) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
