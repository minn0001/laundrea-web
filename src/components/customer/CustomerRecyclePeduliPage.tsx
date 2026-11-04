import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTr } from '../../i18n/useTr';
import { useLang } from '../../i18n/LanguageContext';
import {
  ArrowLeft,
  Leaf,
  Scale,
  HeartHandshake,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Users,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface CustomerRecyclePeduliPageProps {
  onBack: () => void;
  onOrderWithRecycle: () => void;
}

const WorkCardImage: React.FC<{ src?: string; title: string }> = ({ src, title }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || src.trim() === '' || hasError) {
    return (
      <div className="aspect-4/3 bg-gradient-to-br from-[#f0fdf4] to-[#d1fae5] flex items-center justify-center">
        <Leaf className="w-8 h-8 text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="aspect-4/3 bg-gray-100 overflow-hidden">
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        onError={() => setHasError(true)}
      />
    </div>
  );
};

export const CustomerRecyclePeduliPage: React.FC<CustomerRecyclePeduliPageProps> = ({
  onBack,
  onOrderWithRecycle,
}) => {
  const { impactStats, artisans, recycleWorks, recycleSettings } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const tr = useTr();
  const { lang } = useLang();

  // Pakai teks Inggris dari database kalau ada, kalau tidak pakai teks Indonesia
  const pick = (idText?: string, enText?: string) =>
    lang === 'en' && enText && enText.trim() !== '' ? enText : idText;

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
      q: tr('Bajuku jadi apa?', 'What will happen to my clothes?'),
      a: tr(
        'Pakaian tidak terpakai yang Anda serahkan disalurkan ke mitra pengrajin lokal untuk diolah (upcycled) menjadi aneka produk bernilai guna, seperti tote bag patchwork, pouch serut, sarung bantal, dan keset dari kain perca.',
        'Clothes you hand in are passed on to local artisan partners who upcycle them into useful products such as patchwork tote bags, drawstring pouches, pillow covers, and doormats made from fabric scraps.'
      ),
    },
    {
      q: tr('Apakah kena biaya?', 'Is there a fee?'),
      a: tr(
        'Menyerahkan baju yang sudah bersih dan kering tidak dikenakan biaya apa pun. Jika bajunya masih kotor dan perlu dicuci dulu, hanya biaya cucinya yang dikenakan sesuai tarif per kg.',
        'Handing in clothes that are already clean and dry is free of charge. If the clothes are still dirty and need washing first, only the washing fee applies, based on the per-kg rate.'
      ),
    },
    {
      q: tr('Bolehkah baju rusak?', 'Can the clothes be damaged?'),
      a: tr(
        'Boleh sekali! Pakaian yang sudah robek, kancing hilang, berlubang, atau warnanya sudah pudar tetap kami terima dengan senang hati. Syarat utamanya adalah pakaian dalam kondisi kering, bebas jamur, dan tidak berbau menyengat.',
        'Absolutely! Clothes that are torn, missing buttons, have holes, or are faded are still welcome. The main requirement is that they are dry, mold-free, and free of strong odors.'
      ),
    },
    {
      q: tr('Bagaimana kalau bajunya kotor?', 'What if my clothes are dirty?'),
      a: tr(
        "Jika pakaian masih kotor, Anda cukup memilih opsi 'Baju masih kotor, cuci dulu' di formulir pemesanan. Pakaian akan dicuci bersih dan higienis terlebih dahulu sesuai tarif kiloan normal sebelum disalurkan ke pengrajin. Anda akan mendapatkan 1 stempel cuci + 1 stempel bonus daur ulang!",
        "If your clothes are still dirty, just choose 'Clothes are still dirty, wash first' in the order form. They will be washed cleanly and hygienically at the normal per-kg rate before being passed to the artisans. You'll get 1 wash stamp + 1 recycling bonus stamp!"
      ),
    },
    {
      q: tr('Berapa kali boleh menyerahkan baju?', 'How many times can I hand in clothes?'),
      a: tr(
        'Boleh berkali-kali. Setiap penyerahan minimal 1 kg mendapat +1 stempel.',
        'As many times as you like. Every handover of at least 1 kg earns +1 stamp.'
      ),
    },
  ];

  return (
    <div id="laundrea-peduli-page" className="w-full space-y-5 animate-in fade-in duration-200 text-[#254117]">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#254117] hover:text-[#cd6184] transition-colors cursor-pointer py-1 px-2 rounded-xl hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tr('Kembali ke Beranda', 'Back to Home')}</span>
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
            {tr('Gerakan Daur Ulang Tekstil', 'Textile Recycling Movement')}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black leading-tight text-white tracking-tight">
          {tr('Baju Tak Terpakai Jadi Karya Pengrajin Lokal', 'Unused Clothes Become Local Artisan Creations')}
        </h1>

        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
          {tr(
            'Jangan biarkan pakaian lama menumpuk di lemari atau berakhir di tempat pembuangan sampah. Serahkan minimal 1 kg pakaian bekas saat memesan laundry, dan dapatkan bonus',
            "Don't let old clothes pile up in your closet or end up in the landfill. Hand in at least 1 kg of pre-loved clothes when you order laundry and get a bonus"
          )}{' '}
          <strong className="text-[#ffbd59]">{tr('+1 stempel loyalitas', '+1 loyalty stamp')}</strong>{' '}
          {tr('(min. 1 kg).', '(min. 1 kg).')}
        </p>

        {!recycleSettings.programActive && (
          <div className="mt-3 p-3 bg-amber-500/20 border border-amber-300/40 rounded-2xl flex items-center gap-2 text-xs font-semibold text-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-300" />
            <span>
              {tr(
                'Program daur ulang sedang penuh, coba lagi nanti.',
                'The recycling program is currently full, please try again later.'
              )}
            </span>
          </div>
        )}
      </div>

      {/* Impact stats */}
      {hasValidStats && impactStats && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#cd6184] px-1">
            {tr('Dampak Kebaikan Bersama', 'Our Impact Together')}
          </h2>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {(impactStats.totalKg || 0) > 0 && (
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-0.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-xl font-black text-[#254117]">{impactStats.totalKg} kg</div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight">
                  {tr('Baju Terkumpul', 'Clothes Collected')}
                </div>
              </div>
            )}

            {(impactStats.participants || 0) > 0 && (
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-0.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center mx-auto mb-1.5">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-xl font-black text-[#254117]">{impactStats.participants}</div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight">
                  {tr('Pelanggan Peduli', 'Caring Customers')}
                </div>
              </div>
            )}

            {(impactStats.handovers || 0) > 0 && (
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-0.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-1.5">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-xl font-black text-[#254117]">{impactStats.handovers}x</div>
                <div className="text-[10px] text-gray-500 font-medium leading-tight">
                  {tr('Penyerahan Baju', 'Handovers')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
            {tr('Alur Program', 'How It Works')}
          </span>
          <h2 className="text-base font-black text-[#254117] mt-0.5">
            {tr('Cara Kerja Laundrea Peduli', 'How Laundrea Peduli Works')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#254117] text-white flex items-center justify-center font-black text-xs shadow-xs">
              1
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
              {tr('Centang di form pesanan', 'Tick it in the order form')}
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {tr(
                'Pilih opsi daur ulang saat memesan laundry. Pisahkan pakaian daur ulang di kantong tersendiri agar kurir mudah menimbangnya.',
                'Choose the recycling option when ordering laundry. Put the clothes in a separate bag so the courier can weigh them easily.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#97a273] text-white flex items-center justify-center font-black text-xs shadow-xs">
              2
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
              {tr('Kurir menimbang & membawa', 'Courier weighs & collects')}
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {tr(
                'Saat menjemput cucian, kurir akan menimbang pakaian daur ulang Anda (min. 1 kg ≈ 4-5 potong baju) tanpa biaya penyerahan apa pun.',
                'When picking up your laundry, the courier weighs your recycling clothes (min. 1 kg ≈ 4-5 pieces) with no handover fee.'
              )}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-[#cd6184] text-white flex items-center justify-center font-black text-xs shadow-xs">
              3
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-[#254117]">
              {tr('Diolah pengrajin lokal', 'Made into new items by local artisans')}
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              {tr(
                'Pakaian diverifikasi dan disalurkan ke mitra pengrajin binaan untuk diolah menjadi beragam produk daur ulang bernilai pakai baru.',
                'Clothes are verified and passed on to our partner artisans to be turned into a variety of recycled products with new uses.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Partner artisans */}
      {artisans && artisans.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
              {tr('Kolaborasi Komunitas', 'Community Collaboration')}
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">
              {tr('Mitra Pengrajin Lokal', 'Local Artisan Partners')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tr(
                'Setiap helai pakaian yang Anda berikan mendukung ekonomi para pengrajin lokal kami.',
                'Every piece of clothing you give supports the livelihoods of our local artisans.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {artisans.map((artisan, index) => {
              const a = artisan as any;
              const locationText = pick(a.location, a.locationEn);
              const storyText = pick(a.story, a.storyEn);
              return (
                <div
                  key={artisan.id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                          index % 2 === 0 ? 'bg-[#254117]' : 'bg-[#cd6184]'
                        }`}
                      >
                        <Leaf className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#254117]">{artisan.name}</h3>
                        {locationText && (
                          <span className="text-[10px] text-gray-500 block">{locationText}</span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-600 leading-relaxed italic">
                      &ldquo;{storyText}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Showcase gallery */}
      {recycleWorks && recycleWorks.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
              {tr('Galeri Kreasi', 'Creations Gallery')}
            </span>
            <h2 className="text-base font-black text-[#254117] mt-0.5">
              {tr('Karya Daur Ulang Pilihan', 'Featured Recycled Creations')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {tr(
                'Inilah wujud baru pakaian yang Anda donasikan di tangan terampil mitra pengrajin.',
                'See the new life of the clothes you donated in the skilled hands of our artisan partners.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            {recycleWorks.map((work) => {
              const w = work as any;
              const imageSrc = work.imageUrl || work.photo;
              const titleText = pick(work.title, w.titleEn);
              const descText = pick(work.description, w.descriptionEn);
              return (
                <div
                  key={work.id}
                  className="rounded-2xl bg-gray-50 border border-gray-200/70 overflow-hidden shadow-2xs flex flex-col h-full"
                >
                  <WorkCardImage src={imageSrc} title={titleText || ''} />
                  <div className="p-3 space-y-1 flex-1">
                    <h3 className="font-bold text-xs text-[#254117] leading-snug">{titleText}</h3>
                    {work.artisanName && (
                      <span className="text-[10px] font-semibold text-[#cd6184] block">
                        {tr('Oleh:', 'By:')} {work.artisanName}
                      </span>
                    )}
                    {descText && (
                      <p className="text-[11px] text-gray-500 leading-relaxed">{descText}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Requirements & FAQ */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="border-b border-gray-100 pb-3">
          <span className="text-[11px] font-bold text-[#cd6184] uppercase tracking-wider block">
            {tr('Panduan & FAQ', 'Guide & FAQ')}
          </span>
          <h2 className="text-base font-black text-[#254117] mt-0.5">
            {tr('Syarat Pakaian & Pertanyaan Umum', 'Clothing Requirements & Common Questions')}
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
              {tr('Ketentuan Pakaian yang Diterima', 'Accepted Clothing Requirements')}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{tr('(1) Kering, tidak basah atau lembap', '(1) Dry, not wet or damp')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{tr('(2) Bebas jamur atau bau menyengat', '(2) Free of mold and strong odors')}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {tr(
                  '(3) Tanpa barang non-tekstil (sepatu, tas kulit, dll.)',
                  '(3) No non-textile items (shoes, leather bags, etc.)'
                )}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>{tr('Boleh:', 'Allowed:')}</strong>{' '}
                {tr('Robek, rusak, kancing lepas, atau pudar', 'Torn, damaged, missing buttons, or faded')}
              </span>
            </div>
          </div>
        </div>

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

      {/* Bottom action */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 z-20">
        <div>
          <h3 className="font-black text-sm text-[#254117]">
            {tr('Siap Mendaur Ulang Baju?', 'Ready to Recycle Your Clothes?')}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {tr(
              'Kurir kami akan menimbang baju Anda bersamaan dengan jadwal penjemputan cucian.',
              'Our courier will weigh your clothes during your laundry pickup.'
            )}
          </p>
        </div>

        <button
          type="button"
          id="btn-peduli-order-now"
          onClick={onOrderWithRecycle}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#254117] hover:bg-[#1e3412] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <Leaf className="w-4 h-4 text-emerald-400 fill-emerald-400" />
          <span>{tr('Pesan laundry + daur ulang baju', 'Order laundry + recycle clothes')}</span>
        </button>
      </div>
    </div>
  );
};
