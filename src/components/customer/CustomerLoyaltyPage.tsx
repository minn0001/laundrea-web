import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerVoucher } from '../../types';
import { earnsRecycleStamp } from '../../utils/recycle';
import { useTr } from '../../i18n/useTr';
import {
  Sparkles,
  Check,
  Gift,
  ArrowRight,
  History,
  CheckCircle2,
  Ticket,
  Copy,
  CheckCheck,
  Tag,
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
    orders,
  } = useApp();
  const tr = useTr();

  const [claimedModalVoucher, setClaimedModalVoucher] = useState<CustomerVoucher | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const lifetimeEarnedStamps = stampHistory.filter((s) => s.type === 'earned').length;
  const tier: 'Bronze' | 'Silver' | 'Gold' =
    lifetimeEarnedStamps >= 10 ? 'Gold' : lifetimeEarnedStamps >= 5 ? 'Silver' : 'Bronze';
  const tierLabel =
    tier === 'Gold' ? tr('Emas', 'Gold') : tier === 'Silver' ? tr('Perak', 'Silver') : tr('Perunggu', 'Bronze');

  const balance = Math.max(0, stampsCount);
  const filledStamps = Math.min(balance, 10);
  const isCycleComplete = balance >= 10;
  const stampsRemaining = Math.max(0, 10 - balance);
  const progressPercent = Math.min(100, Math.round((filledStamps / 10) * 100));

  const handleRedeemVoucher = () => {
    const newVoucher = claimLoyaltyVoucher();
    if (newVoucher) setClaimedModalVoucher(newVoucher);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeVouchers = customerVouchers.filter((v) => !v.isUsed);

  const customerOrders = orders.filter((o) => !customerPhone || o.customerPhone === customerPhone);
  const recycleOrders = customerOrders.filter((o) => o.recycle?.enabled);
  const verifiedRecycleOrders = recycleOrders.filter(earnsRecycleStamp);

  const stampTime = (item: { id: string; date?: string }) => {
    const n = Number(String(item.id).replace(/\D/g, ''));
    if (n > 1e12) return n;
    const t = Date.parse(item.date || '');
    return Number.isFinite(t) ? t : 0;
  };
  const filteredStampHistory = stampHistory.filter(
    (s) => !(s.title && s.title.toLowerCase().includes('daur ulang'))
  );
  const stampEvents: { type: 'wash' | 'recycle'; time: number }[] = [
    ...filteredStampHistory
      .filter((s) => s.type === 'earned')
      .map((s) => ({ type: 'wash' as const, time: stampTime(s) })),
    ...verifiedRecycleOrders.map((o) => ({
      type: 'recycle' as const,
      time: Date.parse(o.recycle?.verifiedAt || '') || stampTime({ id: o.id, date: o.pickupDate }),
    })),
  ].sort((a, b) => a.time - b.time);
  const startIdx = Math.max(0, stampEvents.length - balance);
  const cardStampTypes = stampEvents.slice(startIdx, startIdx + 10).map((e) => e.type);

  const voucherTypeLabel = (v: CustomerVoucher) =>
    v.discountType === 'free_wash' ? tr('Cuci Gratis', 'Free Wash') : tr('Diskon Spesial', 'Special Discount');

  return (
    <div id="customer-loyalty-page" className="w-full space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs space-y-2.5 sm:space-y-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#cd6184]">Laundrea Rewards</span>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-2xs ${
              tier === 'Gold'
                ? 'bg-[#ffbd59] text-[#254117]'
                : tier === 'Silver'
                ? 'bg-gray-200 text-[#254117]'
                : 'bg-[#ffecf2] text-[#cd6184]'
            }`}
          >
            {tr('Member', 'Member')} {tierLabel}
          </span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-[#254117]">{tr('Poin & Stempel', 'Points & Stamps')}</h1>
      </div>

      {/* Stamp Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3">
          <div>
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider">
              {tr('Kartu Stempel Loyalitas', 'Loyalty Stamp Card')}
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">{tr('Progres Cuci Gratis', 'Free Wash Progress')}</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#254117]/60 block font-medium">{tr('Total Stempel', 'Total Stamps')}</span>
            <span className="text-lg sm:text-xl font-black text-[#cd6184]">
              {filledStamps} / 10 {tr('Stempel', 'Stamps')}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-bold text-[#254117] gap-1 sm:gap-2">
            <span className="leading-snug">
              {isCycleComplete
                ? tr('✓ 10 Stempel telah terkumpul! Voucher siap diklaim.', '✓ 10 stamps collected! Your voucher is ready to claim.')
                : tr(`${filledStamps} dari 10 stempel terkumpul`, `${filledStamps} of 10 stamps collected`)}
            </span>
            <span className="text-[#97a273] text-left">
              {isCycleComplete
                ? tr('Voucher Hadiah Tersedia', 'Reward Voucher Available')
                : tr(`${stampsRemaining} stempel lagi untuk klaim voucher`, `${stampsRemaining} more stamps to claim a voucher`)}
            </span>
          </div>

          <div className="w-full bg-[#ffecf2] h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-[#cd6184]/20">
            <div className="bg-[#cd6184] h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-3 pt-1.5 sm:pt-2">
            {Array.from({ length: 10 }).map((_, index) => {
              const stampNumber = index + 1;
              const isCollected = filledStamps >= stampNumber;
              const isRecycleStamp = isCollected && cardStampTypes[index] === 'recycle';

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
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs" title={tr('Stempel Bonus Daur Ulang', 'Recycling Bonus Stamp')}>
                        <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#97a273] text-white flex items-center justify-center shadow-xs" title={tr('Stempel Cuci', 'Wash Stamp')}>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      </div>
                    )
                  ) : (
                    <span className="text-xs font-bold text-gray-400">{stampNumber}</span>
                  )}
                  <span className="text-[8.5px] sm:text-[9px] font-semibold text-[#254117]/60 mt-0.5 sm:mt-1">
                    {stampNumber === 10 ? tr('GRATIS', 'FREE') : `#${stampNumber}`}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-[#254117]/80 gap-1.5 border-t border-gray-100">
            <span className="font-semibold flex items-center gap-2">
              <span className="flex items-center gap-1 text-[#97a273]">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> {tr('Cuci', 'Wash')}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-700">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> {tr('Daur ulang', 'Recycling')}
              </span>
            </span>
            {onGoToPeduli && (
              <button type="button" onClick={onGoToPeduli} className="text-xs font-bold text-[#254117] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                <span>{tr('Stempel bonus dari daur ulang', 'Bonus stamps from recycling')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Claim CTA */}
        <div className="bg-gradient-to-r from-[#ffecf2] to-[#fff5f8] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border-2 border-[#cd6184]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#ffbd59] text-[#254117] flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#cd6184] text-white tracking-wider">
                  {tr('VOUCHER 10 STEMPEL', '10-STAMP VOUCHER')}
                </span>
                <span className="text-xs font-bold text-[#97a273]">{tr('Nilai s.d. Rp 35.000', 'Worth up to Rp 35,000')}</span>
              </div>
              <h3 className="text-sm font-bold text-[#254117] mt-1">
                {isCycleComplete
                  ? tr('Voucher Cuci Gratis Siap Diklaim!', 'Free Wash Voucher Ready to Claim!')
                  : tr('Kumpulkan 10 Stempel untuk Klaim Voucher', 'Collect 10 Stamps to Claim a Voucher')}
              </h3>
              <p className="text-[10.5px] sm:text-xs text-[#254117]/75 mt-0.5 max-w-md leading-relaxed">
                {tr(
                  'Tukarkan 10 stempel Anda dengan 1 voucher cuci gratis (diskon hingga Rp 35.000). Voucher yang diklaim langsung dapat digunakan di menu pemesanan!',
                  'Exchange your 10 stamps for 1 free wash voucher (discount up to Rp 35,000). Claimed vouchers can be used right away in the order menu!'
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
            <button
              id="btn-claim-voucher-10-stamps"
              disabled={!isCycleComplete}
              onClick={handleRedeemVoucher}
              className={`w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                isCycleComplete ? 'bg-[#cd6184] hover:bg-[#b85373] text-white shadow-md active:scale-98' : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-75'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isCycleComplete
                  ? tr('Klaim Voucher Cuci Gratis', 'Claim Free Wash Voucher')
                  : tr(`Kurang ${stampsRemaining} Stempel`, `${stampsRemaining} Stamps Short`)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Vouchers */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b pb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="w-5 h-5 text-[#cd6184] shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#254117]">{tr('Koleksi Voucher Saya', 'My Voucher Collection')}</h3>
              <p className="text-[10.5px] sm:text-xs text-[#254117]/65 leading-tight">
                {tr('Gunakan voucher aktif saat mengisi formulir di Menu Pesan', 'Use active vouchers when filling out the form in the Order menu')}
              </p>
            </div>
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-[#cd6184] bg-[#ffecf2] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
            {activeVouchers.length} {tr('Voucher Aktif', 'Active Vouchers')}
          </span>
        </div>

        {customerVouchers.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <Ticket className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-[#254117]">{tr('Belum Ada Voucher', 'No Vouchers Yet')}</p>
            <p className="text-xs text-[#254117]/60 max-w-sm mx-auto">
              {tr(
                'Kumpulkan 10 stempel dari pesanan Anda lalu klik tombol Klaim Voucher di atas untuk mendapatkan voucher cuci gratis pertama Anda.',
                'Collect 10 stamps from your orders, then tap the Claim Voucher button above to get your first free wash voucher.'
              )}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {customerVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className={`relative rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 transition-all flex flex-col justify-between ${
                  voucher.isUsed ? 'bg-gray-50 border-gray-200 opacity-65' : 'bg-[#fff9fa] border-[#cd6184]/40 hover:border-[#cd6184] shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#ffecf2] text-[#cd6184]">
                      {voucherTypeLabel(voucher)}
                    </span>
                    {voucher.isUsed ? (
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-md">{tr('Sudah Digunakan', 'Already Used')}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {tr('Aktif Siap Pakai', 'Active & Ready')}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[#254117] mt-2">{voucher.title}</h4>
                  <p className="text-xs text-[#254117]/70 mt-0.5">{voucher.description}</p>

                  <div className="mt-2.5 sm:mt-3 flex items-center justify-between bg-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#254117] tracking-wider">
                      <Tag className="w-3.5 h-3.5 text-[#cd6184]" />
                      <span>{voucher.code}</span>
                    </div>
                    <button type="button" onClick={() => handleCopyCode(voucher.code)} className="text-[11px] font-bold text-[#cd6184] hover:text-[#b85373] flex items-center gap-1 cursor-pointer">
                      {copiedCode === voucher.code ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-[#97a273]" />
                          <span className="text-[#97a273]">{tr('Tersalin!', 'Copied!')}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{tr('Salin', 'Copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#254117]/60">
                    {tr('Berlaku s.d:', 'Valid until:')} <strong className="text-[#254117]">{voucher.expiryDate}</strong>
                  </span>
                  {!voucher.isUsed && (
                    <button
                      type="button"
                      onClick={() => onOrderNowClick(voucher.code)}
                      className="px-3 py-1.5 rounded-xl bg-[#254117] hover:bg-[#1c3211] text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-[0.99]"
                    >
                      <span>{tr('Pakai di Pesanan', 'Use in Order')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claimed modal */}
      {claimedModalVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-[#ffecf2] border border-[#cd6184]/30 text-[#cd6184] flex items-center justify-center mx-auto shadow-xs">
              <Gift className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <span className="text-[11px] font-black uppercase text-[#97a273] tracking-wider">{tr('Berhasil Diklaim', 'Successfully Claimed')}</span>
              <h3 className="text-lg font-black text-[#254117]">{tr('Selamat! Voucher Siap Digunakan', 'Congratulations! Your Voucher is Ready')}</h3>
              <p className="text-xs text-[#254117]/70 max-w-xs mx-auto leading-relaxed">
                {tr(
                  '10 stempel Anda telah ditukar dengan voucher cuci gratis. Kode voucher telah disimpan di koleksi Anda.',
                  'Your 10 stamps have been exchanged for a free wash voucher. The voucher code is saved in your collection.'
                )}
              </p>
            </div>

            <div className="bg-[#ffecf2]/50 p-4 rounded-2xl border border-[#cd6184]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#cd6184]">{tr('KODE VOUCHER', 'VOUCHER CODE')}</span>
                <button type="button" onClick={() => handleCopyCode(claimedModalVoucher.code)} className="text-xs font-bold text-[#cd6184] flex items-center gap-1 cursor-pointer">
                  <Copy className="w-3.5 h-3.5" />
                  <span>{tr('Salin Kode', 'Copy Code')}</span>
                </button>
              </div>
              <div className="text-center py-2 bg-white rounded-xl border border-[#cd6184]/40">
                <span className="font-mono text-base font-black text-[#254117] tracking-wider">{claimedModalVoucher.code}</span>
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
                <span>{tr('Gunakan Sekarang di Menu Pesan', 'Use Now in the Order Menu')}</span>
              </button>
              <button type="button" onClick={() => setClaimedModalVoucher(null)} className="w-full py-2.5 text-xs text-gray-500 font-bold hover:text-[#254117] cursor-pointer">
                {tr('Tutup & Lihat Koleksi', 'Close & View Collection')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            key: 'Bronze',
            title: tr('Level Perunggu', 'Bronze Level'),
            range: tr('1 - 4 Pesanan', '1 - 4 Orders'),
            titleColor: 'text-[#cd6184]',
            perks: [
              tr('Akumulasi stempel standar tiap pesanan', 'Standard stamp accumulation per order'),
              tr('Notifikasi status via WhatsApp', 'Status notifications via WhatsApp'),
              tr('Layanan jemput & antar gratis', 'Free pickup & delivery'),
            ],
          },
          {
            key: 'Silver',
            title: tr('Level Perak', 'Silver Level'),
            range: tr('5 - 9 Pesanan', '5 - 9 Orders'),
            titleColor: 'text-gray-600',
            perks: [
              tr('Semua keuntungan Level Perunggu', 'All Bronze Level benefits'),
              tr('Akses prioritas jam penjemputan', 'Priority access to pickup times'),
              tr('Voucher bonus promo berkala', 'Periodic bonus promo vouchers'),
            ],
          },
          {
            key: 'Gold',
            title: tr('Level Emas', 'Gold Level'),
            range: tr('10+ Pesanan', '10+ Orders'),
            titleColor: 'text-[#ffbd59]',
            perks: [
              tr('Semua keuntungan Level Perak', 'All Silver Level benefits'),
              tr('Gratis upgrade pengerjaan Express', 'Free Express processing upgrade'),
              tr('Prioritas kurir pilihan khusus', 'Priority access to selected couriers'),
            ],
          },
        ].map((lvl) => (
          <div
            key={lvl.key}
            className={`p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border-2 transition-all ${
              tier === lvl.key
                ? `border-[#cd6184] bg-white shadow-xs ${lvl.key === 'Gold' ? 'ring-2 ring-[#ffbd59]/40' : ''}`
                : 'border-gray-200 bg-white opacity-85'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${lvl.titleColor}`}>{lvl.title}</span>
              {tier === lvl.key && (
                <span className="text-[10px] bg-[#97a273] text-white font-bold px-2 py-0.5 rounded-full">{tr('Aktif', 'Active')}</span>
              )}
            </div>
            <h4 className="text-base sm:text-lg font-bold text-[#254117] mt-1">{lvl.range}</h4>
            <ul className="mt-2.5 sm:mt-3 space-y-1.5 text-xs text-[#254117]/80">
              {lvl.perks.map((p, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#97a273]" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 border border-gray-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#cd6184]" />
            <h3 className="text-sm sm:text-base font-bold text-[#254117]">{tr('Riwayat Stempel & Hadiah', 'Stamp & Reward History')}</h3>
          </div>
          <span className="text-xs text-[#254117]/60 font-medium">
            {filteredStampHistory.length + recycleOrders.length} {tr('Aktivitas', 'Activities')}
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
                      {tr('Daur Ulang Baju', 'Clothes Recycling')} ({weightStr})
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
                    earnsRecycleStamp(ro) ? (
                      <span className="text-[11px] sm:text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 inline-block">
                        +1 {tr('Stempel', 'Stamp')}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 inline-block">
                        {tr('Diterima · di bawah 1 kg, belum dapat stempel', 'Accepted · under 1 kg, no stamp yet')}
                      </span>
                    )
                  ) : rData.status === 'pending_verification' ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 inline-block">
                      {tr('Menunggu verifikasi', 'Awaiting verification')}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-red-50 text-red-700 inline-block">
                      {tr('Tidak memenuhi syarat', 'Not eligible')}: {rData.rejectReason || tr('Ketentuan belum terpenuhi', 'Requirements not met')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredStampHistory.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'earned' ? 'bg-[#ffecf2] text-[#cd6184]' : 'bg-[#97a273]/15 text-[#97a273]'}`}>
                  {item.type === 'earned' ? <Check className="w-4 h-4 stroke-[3]" /> : <Gift className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#254117] leading-snug">{item.title}</p>
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

              <div className={`text-[11px] sm:text-sm font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl whitespace-nowrap shrink-0 ${item.pointsChange > 0 ? 'bg-[#97a273]/15 text-[#97a273]' : 'bg-[#cd6184]/15 text-[#cd6184]'}`}>
                {item.pointsChange > 0 ? `+${item.pointsChange}` : item.pointsChange} {tr('Stempel', 'Stamps')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
