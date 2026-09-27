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
  PlusCircle,
  Tag,
} from 'lucide-react';

interface CustomerLoyaltyPageProps {
  onOrderNowClick: (voucherCode?: string) => void;
}

export const CustomerLoyaltyPage: React.FC<CustomerLoyaltyPageProps> = ({ onOrderNowClick }) => {
  const {
    stampsCount,
    stampHistory,
    customerVouchers,
    claimLoyaltyVoucher,
    addTestStamp,
    customerPhone,
    customers,
  } = useApp();

  const [claimedModalVoucher, setClaimedModalVoucher] = useState<CustomerVoucher | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Find customer profile if available
  const currentProfile = customers.find((c) => c.phone === customerPhone) || {
    name: 'Pelanggan Setia',
    tier: stampsCount >= 10 ? 'Gold' : stampsCount >= 5 ? 'Silver' : 'Bronze',
    totalOrders: stampHistory.filter((s) => s.type === 'earned').length || 7,
  };

  const tier = stampsCount >= 10 ? 'Gold' : stampsCount >= 5 ? 'Silver' : 'Bronze';
  const targetStamps = 10;
  const stampsRemaining = Math.max(0, targetStamps - (stampsCount % targetStamps));
  const progressPercent = Math.min(100, Math.round(((stampsCount % targetStamps) / targetStamps) * 100));

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

  return (
    <div id="customer-loyalty-page" className="w-full space-y-4">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#cd6184]">
              Laundrea Rewards
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                tier === 'Gold'
                  ? 'bg-[#ffbd59] text-[#254117]'
                  : tier === 'Silver'
                  ? 'bg-gray-200 text-[#254117]'
                  : 'bg-[#ffecf2] text-[#cd6184]'
              }`}
            >
              Member {tier}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-black text-[#254117]">
            Poin & Stempel
          </h1>

          <button
            onClick={onOrderNowClick}
            className="px-3.5 py-2 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Pesan Baru</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Stamp Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b pb-3">
          <div>
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider">
              Kartu Stempel Loyalitas
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">
              Progres Cuci Gratis
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-add-test-stamp"
              onClick={addTestStamp}
              title="Klik untuk menambah 1 stempel uji coba"
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#254117] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-gray-200"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#cd6184]" />
              <span>+1 Stempel (Simulasi)</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] text-[#254117]/60 block font-medium">Total Stempel</span>
              <span className="text-xl font-black text-[#cd6184]">
                {stampsCount} Stempel
              </span>
            </div>
          </div>
        </div>

        {/* 10-Stamp Visual Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#254117]">
            <span>
              {stampsCount >= targetStamps
                ? '✓ 10 Stempel telah terkumpul! Voucher siap diklaim.'
                : `${stampsCount % targetStamps} dari 10 stempel terkumpul`}
            </span>
            <span className="text-[#97a273]">
              {stampsCount >= targetStamps
                ? 'Voucher Hadiah Tersedia'
                : `${stampsRemaining} stempel lagi untuk klaim voucher`}
            </span>
          </div>

          {/* Linear progress bar */}
          <div className="w-full bg-[#ffecf2] h-3 rounded-full overflow-hidden p-0.5 border border-[#cd6184]/20">
            <div
              className="bg-[#cd6184] h-full rounded-full transition-all duration-500"
              style={{
                width: `${stampsCount >= targetStamps ? 100 : progressPercent}%`,
              }}
            />
          </div>

          {/* 10 stamp circles */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 pt-2">
            {Array.from({ length: 10 }).map((_, index) => {
              const stampNumber = index + 1;
              const isCollected = (stampsCount % targetStamps >= stampNumber) || (stampsCount >= targetStamps && index < 10);

              return (
                <div
                  key={stampNumber}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-2 transition-all ${
                    isCollected
                      ? 'bg-[#ffecf2] border-[#cd6184] shadow-xs'
                      : 'bg-gray-50 border-dashed border-gray-300'
                  }`}
                >
                  {isCollected ? (
                    <div className="w-7 h-7 rounded-full bg-[#97a273] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-gray-400">
                      {stampNumber}
                    </span>
                  )}
                  <span className="text-[9px] font-semibold text-[#254117]/60 mt-1">
                    {stampNumber === 10 ? 'GRATIS' : `#${stampNumber}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voucher Claim CTA Card */}
        <div className="bg-gradient-to-r from-[#ffecf2] to-[#fff5f8] rounded-2xl p-4 sm:p-5 border-2 border-[#cd6184]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#ffbd59] text-[#254117] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Gift className="w-6 h-6" />
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
                {stampsCount >= 10
                  ? 'Voucher Cuci Gratis Siap Diklaim!'
                  : 'Kumpulkan 10 Stempel untuk Klaim Voucher'}
              </h3>
              <p className="text-xs text-[#254117]/75 mt-0.5 max-w-md leading-relaxed">
                Tukarkan 10 stempel Anda dengan 1 voucher cuci gratis (diskon hingga Rp 35.000). Voucher yang diklaim langsung dapat digunakan di menu pemesanan!
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
            <button
              id="btn-claim-voucher-10-stamps"
              disabled={stampsCount < 10}
              onClick={handleRedeemVoucher}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                stampsCount >= 10
                  ? 'bg-[#cd6184] hover:bg-[#b85373] text-white shadow-md active:scale-98'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {stampsCount >= 10
                  ? 'Klaim Voucher Cuci Gratis'
                  : `Kurang ${stampsRemaining} Stempel`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* User's Claimed Vouchers Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#cd6184]" />
            <div>
              <h3 className="text-base font-bold text-[#254117]">
                Koleksi Voucher Saya
              </h3>
              <p className="text-xs text-[#254117]/60">
                Gunakan voucher aktif saat mengisi formulir di Menu Pesan
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#cd6184] bg-[#ffecf2] px-2.5 py-1 rounded-full">
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
                className={`relative rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
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

                  <div className="mt-3 flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200">
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

                <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#254117]/60">
                    Berlaku s.d: <strong className="text-[#254117]">{voucher.expiryDate}</strong>
                  </span>

                  {!voucher.isUsed && (
                    <button
                      type="button"
                      onClick={() => onOrderNowClick(voucher.code)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#254117] hover:bg-[#1c3211] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`p-5 rounded-3xl border-2 transition-all ${
            tier === 'Bronze'
              ? 'border-[#cd6184] bg-white shadow-xs'
              : 'border-gray-200 bg-white opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#cd6184]">
              Level Bronze
            </span>
            {tier === 'Bronze' && (
              <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-[#254117] mt-1">1 - 4 Pesanan</h4>
          <ul className="mt-3 space-y-1.5 text-xs text-[#254117]/80">
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
          className={`p-5 rounded-3xl border-2 transition-all ${
            tier === 'Silver'
              ? 'border-[#cd6184] bg-white shadow-xs'
              : 'border-gray-200 bg-white opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Level Silver
            </span>
            {tier === 'Silver' && (
              <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-[#254117] mt-1">5 - 9 Pesanan</h4>
          <ul className="mt-3 space-y-1.5 text-xs text-[#254117]/80">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Semua keuntungan Level Bronze</span>
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
          className={`p-5 rounded-3xl border-2 transition-all ${
            tier === 'Gold'
              ? 'border-[#cd6184] bg-white shadow-xs ring-2 ring-[#ffbd59]/40'
              : 'border-gray-200 bg-white opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ffbd59]">
              Level Gold
            </span>
            {tier === 'Gold' && (
              <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">
                Aktif
              </span>
            )}
          </div>
          <h4 className="text-lg font-bold text-[#254117] mt-1">10+ Pesanan</h4>
          <ul className="mt-3 space-y-1.5 text-xs text-[#254117]/80">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#97a273]" />
              <span>Semua keuntungan Level Silver</span>
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
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#cd6184]" />
            <h3 className="text-base font-bold text-[#254117]">
              Riwayat Stempel & Hadiah
            </h3>
          </div>
          <span className="text-xs text-[#254117]/60 font-medium">
            {stampHistory.length} Aktivitas
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {stampHistory.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
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
                <div>
                  <p className="text-xs sm:text-sm font-bold text-[#254117]">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#254117]/60 flex items-center gap-2 mt-0.5">
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
                className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-xl ${
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
