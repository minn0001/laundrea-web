import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerVoucher } from '../../types';
import {
  Award,
  Sparkles,
  Check,
  Gift,
  ArrowRight,
  Clock,
  History,
  ShieldCheck,
  CheckCircle2,
  Ticket,
  Copy,
  CheckCheck,
  Tag,
  Plus,
  Leaf,
} from 'lucide-react';

interface CustomerLoyaltyPageProps {
  onOrderNowClick: (voucherCode?: string) => void;
  onGoToPeduli?: () => void;
}

export const CustomerLoyaltyPage: React.FC<CustomerLoyaltyPageProps> = ({ onOrderNowClick, onGoToPeduli }) => {
  const {
    stampsCount,
    stampHistory,
    customerVouchers,
    claimLoyaltyVoucher,
    customerPhone,
    customers,
    orders,
  } = useApp();

  const [claimedModalVoucher, setClaimedModalVoucher] = useState<CustomerVoucher | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Member tier based on lifetime earned stamps (number of history entries with type 'earned')
  const lifetimeEarnedStamps = stampHistory.filter((s) => s.type === 'earned').length;
  const tier: 'Bronze' | 'Silver' | 'Gold' =
    lifetimeEarnedStamps >= 10 ? 'Gold' : lifetimeEarnedStamps >= 5 ? 'Silver' : 'Bronze';

  // Find customer profile if available
  const currentProfile = customers.find((c) => c.phone === customerPhone) || {
    name: 'Pelanggan Setia',
    tier,
    totalOrders: lifetimeEarnedStamps,
  };

  const balance = Math.max(0, stampsCount);
  const filledStamps = Math.min(balance, 10);
  const isCycleComplete = balance >= 10;
  const stampsRemaining = Math.max(0, 10 - balance);
  const progressPercent = Math.min(100, Math.round((filledStamps / 10) * 100));

  const handleRedeemVoucher = () => {
    const newVoucher = claimLoyaltyVoucher();
    if (newVoucher) {
      setClaimedModalVoucher(newVoucher);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeVouchers = customerVouchers.filter((v) => !v.isUsed);
  const usedVouchers = customerVouchers.filter((v) => v.isUsed);

  const customerOrders = orders.filter((o) => !customerPhone || o.customerPhone === customerPhone);
  const recycleOrders = customerOrders.filter((o) => o.recycle?.enabled);
  const verifiedRecycleOrders = recycleOrders.filter(
    (o) => o.recycle?.bonusGranted && o.recycle.status === 'verified'
  );
  const recycleStampCount = verifiedRecycleOrders.length;

  return (
    <div id="customer-loyalty-page" className="w-full space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5 sm:space-y-3">
        {/* LAUNDREA REWARDS and Member Tier badge with breathing room and wrap support on mobile */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#cd6184]">
            Laundrea Rewards
          </span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-2xs ${
              tier === 'Gold'
                ? 'bg-[#ffbd59] text-[#254117]'
                : tier === 'Silver'
                ? 'bg-gray-200 text-[#254117]'
                : 'bg-[#ffecf2] text-[#cd6184]'
            }`}
          >
            Member {tier === 'Gold' ? 'Emas' : tier === 'Silver' ? 'Perak' : 'Perunggu'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5 sm:pt-0">
          <h1 className="text-lg sm:text-xl font-black text-[#254117]">
            Poin & Stempel
          </h1>
        </div>
      </div>

      {/* Visual Stamp Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
          <div>
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider">
              Kartu Stempel Loyalitas
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">
              Progres Cuci Gratis
            </h2>
          </div>
           <div className="flex items-center justify-end gap-2">
            <div className="text-right">
              <span className="text-[10px] text-[#254117]/60 block font-medium">Total Stempel</span>
              <span className="text-lg sm:text-xl font-black text-[#cd6184]">
                {filledStamps} / 10 Stempel
              </span>
            </div>
          </div>
        </div>

        {/* 10-Stamp Visual Grid */}
        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-bold text-[#254117] gap-1 sm:gap-2">
            <span className="leading-snug">
              {isCycleComplete
                ? '✓ 10 Stempel telah terkumpul! Voucher siap diklaim.'
                : `${filledStamps} dari 10 stempel terkumpul`}
            </span>
            <span className="text-[#97a273] text-left">
              {isCycleComplete
                ? 'Voucher Hadiah Tersedia'
                : `${stampsRemaining} stempel lagi untuk klaim voucher`}
            </span>
          </div>

          {/* Linear progress bar */}
          <div className="w-full bg-[#ffecf2] h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-[#cd6184]/20">
            <div
              className="bg-[#cd6184] h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>

          {/* 10 stamp circles */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-3 pt-1.5 sm:pt-2">
            {Array.from({ length: 10 }).map((_, index) => {
              const stampNumber = index + 1;
              const isCollected = filledStamps >= stampNumber;
              const numRecycleStampsInCard = Math.min(filledStamps, recycleStampCount);
              const isRecycleStamp = isCollected && stampNumber > (filledStamps - numRecycleStampsInCard);

              return (
                <div
                  key={stampNumber}
                  className={`aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center border-2 transition-all p-1 ${
                    isCollected
                      ? isRecycleStamp
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-[#ffecf2] border-[#cd6184] shadow-xs'
                      : 'bg-gray-50 border-dashed border-gray-300'
                  }`}
                >
                  {isCollected ? (
                    isRecycleStamp ? (
                      <div
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                        title="Stempel Bonus Daur Ulang"
                      >
                        <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#97a273] text-white flex items-center justify-center font-bold text-xs shadow-xs"
                        title="Stempel Cuci"
                      >
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      {stampNumber}
                    </span>
                  )}
                  <span className="text-[8.5px] sm:text-[9px] font-semibold text-[#254117]/60 mt-0.5 sm:mt-1">
                    {stampNumber === 10 ? 'GRATIS' : `#${stampNumber}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend and Laundrea Peduli link */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-[#254117]/80 gap-1.5 border-t border-gray-100">
            <span className="font-semibold flex items-center gap-2">
              <span className="flex items-center gap-1 text-[#97a273]">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Cuci
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Daur ulang
              </span>
            </span>
            {onGoToPeduli && (
              <button
                type="button"
                onClick={onGoToPeduli}
                className="text-xs font-bold text-[#254117] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>Stempel bonus dari daur ulang</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-[#254117]/60 italic">
            *Bonus daur ulang maks. 1x per bulan.
          </p>
        </div>

        {/* Voucher Claim CTA Card */}
        <div className="bg-gradient-to-r from-[#ffecf2] to-[#fff5f8] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border-2 border-[#cd6184]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#ffbd59] text-[#254117] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#cd6184] text-white tracking-wider">
                  VOUCHER 10 STEMPEL
                </span>
                <span className="text-xs font-bold text-[#97a273]">
                  Nilai s.d. Rp 35.000
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#254117] mt-1">
                {isCycleComplete
                  ? 'Voucher Cuci Gratis Siap Diklaim!'
                  : 'Kumpulkan 10 Stempel untuk Klaim Voucher'}
              </h3>
              <p className="text-[10.5px] sm:text-xs text-[#254117]/75 mt-0.5 max-w-md leading-relaxed">
                Tukarkan 10 stempel Anda dengan 1 voucher cuci gratis (diskon hingga Rp 35.000). Voucher yang diklaim langsung dapat digunakan di menu pemesanan!
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
            <button
              id="btn-claim-voucher-10-stamps"
              disabled={!isCycleComplete}
              onClick={handleRedeemVoucher}
              className={`w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                isCycleComplete
                  ? 'bg-[#cd6184] hover:bg-[#b85373] text-white shadow-md active:scale-98'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isCycleComplete
                  ? 'Klaim Voucher Cuci Gratis'
                  : `Kurang ${stampsRemaining} Stempel`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* User's Claimed Vouchers Section */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b pb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="w-5 h-5 text-[#cd6184] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#254117]">
                Koleksi Voucher Saya
              </h3>
              <p className="text-[10.5px] sm:text-xs text-[#254117]/65 leading-tight">
                Gunakan voucher aktif saat mengisi formulir di Menu Pesan
              </p>
            </div>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-[#cd6184] bg-[#ffecf2] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
            {activeVouchers.length} Voucher Aktif
          </span>
        </div>

        {customerVouchers.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-[#254117]">Belum Ada Voucher</p>
            <p className="text-xs text-[#254117]/60 max-w-sm mx-auto">
              Kumpulkan 10 stempel dari pesanan Anda lalu klik tombol Klaim Voucher di atas untuk mendapatkan voucher cuci gratis pertama Anda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {customerVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 transition-all flex flex-col justify-between ${
                  voucher.isUsed
                    ? 'bg-gray-50 border-gray-200 opacity-65'
                    : 'bg-[#fff9fa] border-[#cd6184]/40 hover:border-[#cd6184] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#ffecf2] text-[#cd6184]">
                      {voucher.discountType === 'free_wash' ? 'Cuci Gratis' : 'Diskon Spesial'}
                    </span>
                    {voucher.isUsed ? (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-md">
                        Sudah Digunakan
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Aktif Siap Pakai
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#254117] mt-2">
                    {voucher.title}
                  </h4>
                  <p className="text-xs text-[#254117]/70 mt-0.5">
                    {voucher.description}
                  </p>

                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#254117] tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-[#cd6184]" />
                      <span>{voucher.code}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyCode(voucher.code)}
                      className="text-[11px] font-bold text-[#cd6184] hover:text-[#b85373] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-[#97a273]" />
                          <span className="text-[#97a273]">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#254117]/60">
                    Berlaku s.d: <strong className="text-[#254117]">{voucher.expiryDate}</strong>
                  </span>

                  {!voucher.isUsed && (
                    <button
                      type="button"
                      onClick={() => onOrderNowClick(voucher.code)}
                      className="px-3 py-1.5 rounded-xl bg-[#254117] hover:bg-[#1c3211] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <span>Pakai di Pesanan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claimed Modal Success */}
      {claimedModalVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-[#ffecf2] border border-[#cd6184]/30 text-[#cd6184] flex items-center justify-center mx-auto shadow-xs">
              <Gift className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase text-[#97a273] tracking-wider">
                Berhasil Diklaim
              </span>
              <h3 className="text-lg font-black text-[#254117]">
                Selamat! Voucher Siap Digunakan
              </h3>
              <p className="text-xs text-[#254117]/70 max-w-xs mx-auto leading-relaxed">
                10 stempel Anda telah ditukar dengan voucher cuci gratis. Kode voucher telah disimpan di koleksi Anda.
              </p>
            </div>

            <div className="bg-[#ffecf2]/50 p-4 rounded-2xl border border-[#cd6184]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#cd6184]">KODE VOUCHER</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(claimedModalVoucher.code)}
                  className="text-xs font-bold text-[#cd6184] flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </button>
              </div>
              <div className="text-center py-2 bg-white rounded-xl border border-[#cd6184]/40">
                <span className="font-mono text-base font-black text-[#254117] tracking-wider">
                  {claimedModalVoucher.code}
                </span>
              </div>
              <p className="text-[11px] text-[#254117]/80 text-center font-medium">
                {claimedModalVoucher.title} • {claimedModalVoucher.description}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                id="btn-use-claimed-voucher-now"
                onClick={() => {
                  const code = claimedModalVoucher.code;
                  setClaimedModalVoucher(null);
                  onOrderNowClick(code);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Gunakan Sekarang di Menu Pesan</span>
              </button>
              <button
                type="button"
                onClick={() => setClaimedModalVoucher(null)}
                className="w-full py-2.5 text-xs text-gray-500 font-bold hover:text-[#254117] cursor-pointer"
              >
                Tutup & Lihat Koleksi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Benefits & Tier Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div
          className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all ${
            tier === 'Bronze'
              ? 'border-[#cd6184] bg-white shadow-xs'
              : 'border-gray-200 bg-white opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#cd6184]">
              Level Perunggu
            </span>
            {tier === 'Bronze' && (
              <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <h4 className="text-base sm:text-lg font-bold text-[#254117] mt-1">1 - 4 Pesanan</h4>
          <ul className="mt-2.5 sm:mt-3 space-y-1.5 text-xs text-[#254117]/80">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Akumulasi stempel standar tiap pesanan</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Notifikasi status via WhatsApp</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Layanan jemput & antar gratis</span>
            </li>
          </ul>
        </div>

        <div
          className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all ${
            tier === 'Silver'
              ? 'border-[#cd6184] bg-white shadow-xs'
              : 'border-gray-200 bg-white opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Level Perak
            </span>
            {tier === 'Silver' && (
              <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <h4 className="text-base sm:text-lg font-bold text-[#254117] mt-1">5 - 9 Pesanan</h4>
          <ul className="mt-2.5 sm:mt-3 space-y-1.5 text-xs text-[#254117]/80">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Semua keuntungan Level Perunggu</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Akses prioritas jam penjemputan</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Voucher bonus promo berkala</span>
            </li>
          </ul>
        </div>

        <div
          className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all ${
            tier === 'Gold'
              ? 'border-[#cd6184] bg-white shadow-xs ring-2 ring-[#ffbd59]/40'
              : 'border-gray-200 bg-white opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ffbd59]">
              Level Emas
            </span>
            {tier === 'Gold' && (
              <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <h4 className="text-base sm:text-lg font-bold text-[#254117] mt-1">10+ Pesanan</h4>
          <ul className="mt-2.5 sm:mt-3 space-y-1.5 text-xs text-[#254117]/80">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Semua keuntungan Level Perak</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Gratis upgrade pengerjaan Express</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Prioritas kurir pilihan khusus</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Rewards Earned & History Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#cd6184]" />
            <h3 className="text-sm sm:text-base font-bold text-[#254117]">
              Riwayat Stempel & Hadiah
            </h3>
          </div>
          <span className="text-xs text-[#254117]/60 font-medium">
            {stampHistory.length + recycleOrders.length} Aktivitas
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {recycleOrders.map((ro) => {
            const rData = ro.recycle!;
            const dateStr = ro.statusTimestamps?.delivered || ro.statusTimestamps?.booked || ro.pickupDate || '-';
            const weightStr = `${rData.actualKg || rData.estimatedKg} kg`;

            return (
              <div key={`recycle-${ro.id}`} className="py-3 flex items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-[#254117] leading-snug">
                      Daur Ulang Baju ({weightStr})
                    </p>
                    <p className="text-[10.5px] sm:text-[11px] text-[#254117]/60 flex items-center gap-1.5 sm:gap-2 mt-0.5">
                      <span>{dateStr}</span>
                      {ro.orderNumber && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{ro.orderNumber}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {rData.status === 'verified' ? (
                    <span className="text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 inline-block">
                      +1 Stempel
                    </span>
                  ) : rData.status === 'pending_verification' ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 inline-block">
                      Menunggu verifikasi
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-red-50 text-red-700 inline-block">
                      Tidak memenuhi syarat: {rData.rejectReason || 'Ketentuan belum terpenuhi'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {stampHistory.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'earned'
                      ? 'bg-[#ffecf2] text-[#cd6184]'
                      : 'bg-[#97a273]/15 text-[#97a273]'
                  }`}
                >
                  {item.type === 'earned' ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Gift className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#254117] leading-snug">
                    {item.title}
                  </p>
                  <p className="text-[10.5px] sm:text-[11px] text-[#254117]/60 flex items-center gap-1.5 sm:gap-2 mt-0.5">
                    <span>{item.date}</span>
                    {item.orderNumber && (
                      <>
                        <span>•</span>
                        <span className="font-semibold text-[#cd6184]">{item.orderNumber}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div
                className={`text-[11px] sm:text-sm font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl whitespace-nowrap shrink-0 ${
                  item.pointsChange > 0
                    ? 'bg-[#97a273]/15 text-[#97a273]'
                    : 'bg-[#cd6184]/15 text-[#cd6184]'
                }`}
              >
                {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange} Stempel
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
