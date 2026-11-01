import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeft,
  Leaf,
  Scale,
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Package,
  Layers,
  Users,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface CustomerRecyclePeduliPageProps {
  onBack: () => void;
  onOrderWithRecycle: () => void;
}

export const CustomerRecyclePeduliPage: React.FC<CustomerRecyclePeduliPageProps> = ({
  onBack,
  onOrderWithRecycle,
}) => {
  const { impactStats, artisans, recycleWorks, recycleSettings } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Check if impact stats should be shown (hide if missing or all values <= 0)
  const hasValidStats = Boolean(
    impactStats &&
      ((impactStats.totalKg || 0) > 0 ||
        (impactStats.participants || 0) > 0 ||
        (impactStats.handovers || 0) > 0)
  );

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: 'Bajuku jadi apa?',
      a: 'Pakaian tidak terpakai yang Anda serahkan disalurkan ke mitra pengrajin lokal untuk diolah (upcycled) menjadi aneka produk bernilai guna tinggi, seperti tas jinjing (tote bag), keset anyam serat tebal, sarung bantal sofa, hingga perca kreasi rumah tangga.',
    },
    {
      q: 'Apakah kena biaya?',
      a: 'Sama sekali tidak ada biaya tambahan! Program penyerahan pakaian daur ulang ini 100% gratis sebagai bagian dari komitmen keberlanjutan dan kepedulian lingkungan Laundrea.',
    },
    {
      q: 'Bolehkah baju rusak?',
      a: 'Boleh sekali! Pakaian yang sudah robek, kancing hilang, berlubang, atau warnanya sudah pudar tetap kami terima dengan senang hati. Syarat utamanya adalah pakaian dalam kondisi kering, bebas jamur, dan tidak berbau menyengat.',
    },
    {
      q: 'Bagaimana kalau bajunya kotor?',
      a: "Jika pakaian masih kotor, Anda cukup memilih opsi 'Baju masih kotor, cuci dulu' di formulir pemesanan. Pakaian akan dicuci bersih dan higienis terlebih dahulu sesuai tarif kiloan normal sebelum disalurkan ke pengrajin. Anda akan mendapatkan 1 stempel cuci + 1 stempel bonus daur ulang!",
    },
    {
      q: 'Kenapa bonusnya hanya 1x per bulan?',
      a: 'Apresiasi berupa +1 bonus stempel dibatasi maksimal 1 kali per bulan kalender per pelanggan agar manfaat stempel loyalti terdistribusi merata dan berkelanjutan bagi seluruh komunitas pelanggan. Jika Anda menyerahkan pakaian lebih dari sekali dalam bulan yang sama, pakaian tetap kami terima dengan senang hati.',
    },
  ];

  return (
    <div id="laundrea-peduli-page" className="w-full space-y-5 animate-in fade-in duration-200 text-[#254117]">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#254117] hover:text-[#cd6184] transition-colors cursor-pointer py-1 px-2 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black uppercase tracking-wider border border-emerald-200">
          <Leaf className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
          <span>Laundrea Peduli</span>
        </span>
      </div>

      {/* Hero Banner */}
      <div className="bg-[#254117] text-white p-5 sm:p-7 rounded-3xl shadow-sm relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center">
            <Leaf className="w-4 h-4 fill-emerald-400" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ffbd59]">
            Gerakan Daur Ulang Tekstil
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-tight">
          Baju Tak Terpakai Jadi Karya Pengrajin Lokal
        </h1>

        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
          Jangan biarkan pakaian lama menumpuk di lemari atau berakhir di tempat pembuangan sampah.
          Serahkan minimal 1 kg pakaian bekas saat memesan laundry, dan dapatkan bonus{' '}
          <strong className="text-[#ffbd59]">+1 stempel loyalitas</strong> (maks. 1x per bulan).
        </p>

        {!recycleSettings.programActive && (
          <div className="mt-3 p-3 bg-amber-500/20 border border-amber-300/40 rounded-2xl flex items-center gap-2 text-xs font-semibold text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
            <span>Program daur ulang sedang penuh, coba lagi nanti.</span>
          </div>
        )}
      </div>

      {/* Section a: 3 Stat Cards (from settings/impactStats) */}
      {hasValidStats && impactStats && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#cd6184] px-1">
            Dampak Kebaikan Bersama
          </h2>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {(impactStats.totalKg || 0) > 0 && (
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-0.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-xl font-black text-[#254117]">
                  {impactStats.totalKg} kg
                </div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight">
                  Baju Terkumpul
                </div>
              </div>
            )}

            {(impactStats.participants || 0) > 0 && (
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-0.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center mx-auto mb-1.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-xl font-black text-[#254117]">
                  {impactStats.participants}
                </div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight">
                  Pelanggan Peduli
                </div>
              </div>
            )}

            {(impactStats.handovers || 0) > 0 && (
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-0.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-xl font-black text-[#254117]">
                  {impactStats.handovers}x
                </div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight">
                  Penyerahan Baju
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section b: How It Works (3 Steps in Order) */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
            Alur Program
          </span>
          <h2 className="text-base font-black text-[#254117] mt-0.5">
            Cara Kerja Laundrea Peduli
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#254117] text-white flex items-center justify-center font-black text-xs shadow-xs">
              1
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
              Centang di form pesanan
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Pilih opsi daur ulang saat memesan laundry. Pisahkan pakaian daur ulang di kantong
              tersendiri agar kurir mudah menimbangnya.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#97a273] text-white flex items-center justify-center font-black text-xs shadow-xs">
              2
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
              Kurir menimbang & membawa
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Saat menjemput cucian, kurir akan menimbang pakaian daur ulang Anda (min. 1 kg ≈ 4-5
              potong baju) tanpa biaya penyerahan apa pun.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#cd6184] text-white flex items-center justify-center font-black text-xs shadow-xs">
              3
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
              Diolah pengrajin lokal
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Pakaian diverifikasi dan disalurkan ke mitra pengrajin binaan untuk diolah menjadi
              beragam produk daur ulang bernilai pakai baru.
            </p>
          </div>
        </div>
      </div>

      {/* Section c: Partner Artisans (Hide if empty) */}
      {artisans && artisans.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
              Kolaborasi Komunitas
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">
              Mitra Pengrajin Lokal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Setiap helai pakaian yang Anda berikan mendukung ekonomi para pengrajin lokal kami.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {artisan.photo ? (
                      <img
                        src={artisan.photo}
                        alt={artisan.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-gray-200 shrink-0"
                        onError={(e) => {
                          // Fallback to placeholder avatar
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0">
                        {artisan.name.slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
                        {artisan.name}
                      </h3>
                      {artisan.location && (
                        <span className="text-[10px] text-gray-500 block">{artisan.location}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed italic">
                    &ldquo;{artisan.story}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section d: Showcase Gallery (Hide if empty) */}
      {recycleWorks && recycleWorks.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
              Galeri Kreasi
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">
              Karya Daur Ulang Pilihan
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Inilah wujud baru pakaian yang Anda donasikan di tangan terampil mitra pengrajin.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {recycleWorks.map((work) => {
              const imageSrc = work.imageUrl || work.photo;
              return (
                <div
                  key={work.id}
                  className="rounded-2xl bg-gray-50 border border-gray-200/70 overflow-hidden shadow-2xs flex flex-col justify-between"
                >
                  {imageSrc && (
                    <div className="aspect-4/3 bg-gray-100 overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={work.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <h3 className="font-bold text-xs text-[#254117] leading-snug">{work.title}</h3>
                    {work.artisanName && (
                      <span className="text-[10px] font-semibold text-[#cd6184] block">
                        Oleh: {work.artisanName}
                      </span>
                    )}
                    {work.description && (
                      <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                        {work.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section e: Requirements & FAQ */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
            Panduan & FAQ
          </span>
          <h2 className="text-base font-black text-[#254117] mt-0.5">
            Syarat Pakaian & Pertanyaan Umum
          </h2>
        </div>

        {/* Requirements Box */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              Ketentuan Pakaian yang Diterima
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>(1) Kering, tidak basah atau lembap</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>(2) Bebas jamur atau bau menyengat</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>(3) Tanpa barang non-tekstil (sepatu, tas kulit, dll.)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Boleh:</strong> Robek, rusak, kancing lepas, atau pudar
              </span>
            </div>
          </div>
        </div>

        {/* Accordion FAQ */}
        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#254117] hover:text-[#cd6184] transition-colors gap-2 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed pl-5 sm:pl-6 animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section f: Bottom Action Button */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
        <div>
          <h3 className="font-black text-sm text-[#254117]">Siap Mendaur Ulang Baju?</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Kurir kami akan menimbang baju Anda bersamaan dengan jadwal penjemputan cucian.
          </p>
        </div>

        <button
          type="button"
          id="btn-peduli-order-now"
          onClick={onOrderWithRecycle}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#254117] hover:bg-[#1e3412] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Leaf className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <span>Pesan laundry + daur ulang baju</span>
        </button>
      </div>
    </div>
  );
};
