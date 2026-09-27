import React from 'react';
import { BrandWordmark } from '../common/BrandWordmark';
import { Sparkles, Truck, CheckCircle2, ArrowRight } from 'lucide-react';

interface CustomerLandingPageProps {
  onGetStarted: () => void;
  onTrackExisting?: () => void;
  onViewRewards?: () => void;
}

export const CustomerLandingPage: React.FC<CustomerLandingPageProps> = ({
  onGetStarted,
  onTrackExisting,
  onViewRewards,
}) => {
  return (
    <div id="customer-landing-page" className="min-h-[85vh] flex flex-col justify-between py-6 px-4 max-w-2xl mx-auto w-full">
      {/* Header section */}
      <div className="pt-6 text-center space-y-3">
        <div className="flex justify-center">
          <BrandWordmark size="2xl" variant="pink" />
        </div>
        <p className="text-base text-[#254117]/80 font-medium">
          Jemput & antar Laundrea, lebih praktis.
        </p>
      </div>

      {/* 3-Step Visual Summary */}
      <div className="my-8 bg-white/90 rounded-3xl p-6 shadow-sm border border-[#ffecf2] space-y-5">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#cd6184] bg-[#ffecf2] px-3 py-1 rounded-full">
            Cara Kerja
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#ffecf2]/50">
            <div className="w-11 h-11 rounded-xl bg-[#cd6184] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#cd6184]">Langkah 1</p>
              <p className="text-sm font-bold text-[#254117]">Pilih paket layanan</p>
              <p className="text-xs text-[#254117]/70">Reguler, Kilat, atau Satuan</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#ffecf2]/50">
            <div className="w-11 h-11 rounded-xl bg-[#97a273] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#97a273]">Langkah 2</p>
              <p className="text-sm font-bold text-[#254117]">Kami jemput pakaian</p>
              <p className="text-xs text-[#254117]/70">Kurir tiba langsung di depan pintu Anda</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#ffecf2]/50">
            <div className="w-11 h-11 rounded-xl bg-[#254117] text-[#ffbd59] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-[#ffbd59]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#254117]">Langkah 3</p>
              <p className="text-sm font-bold text-[#254117]">Pantau & terima pakaian bersih</p>
              <p className="text-xs text-[#254117]/70">Progres langsung hingga rapi & harum</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Links */}
      <div className="space-y-3 text-center pb-4">
        <button
          id="btn-landing-get-started"
          type="button"
          onClick={onGetStarted}
          className="w-full py-4 px-6 rounded-2xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-[#cd6184]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Mulai Sekarang</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-4 pt-1">
          {onTrackExisting && (
            <button
              type="button"
              onClick={onTrackExisting}
              className="text-xs font-semibold text-[#cd6184] hover:underline cursor-pointer py-1"
            >
              Lacak Pesanan Aktif
            </button>
          )}
          {onTrackExisting && onViewRewards && <span className="text-xs text-gray-300">•</span>}
          {onViewRewards && (
            <button
              type="button"
              onClick={onViewRewards}
              className="text-xs font-semibold text-[#254117] hover:underline cursor-pointer py-1"
            >
              Poin & Level Saya
            </button>
          )}
        </div>

        {/* Small footer note */}
        <p className="text-[12px] text-[#254117]/60 pt-2">
          Tanpa perlu unduh aplikasi — semua langsung di browser Anda.
        </p>
      </div>
    </div>
  );
};
