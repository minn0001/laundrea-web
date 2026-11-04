import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTr } from '../../i18n/useTr';
import { useLang } from '../../i18n/LanguageContext';
import {
  Globe,
  ChevronRight,
  Check,
  User,
  Building2,
  Phone,
  FileText,
  LogOut,
  X,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { CascadingAddressSelector } from '../common/CascadingAddressSelector';
import { StructuredAddressData } from '../../services/wilayahService';

interface CustomerProfilePageProps {
  onLogoutClick: () => void;
  onNavigateTab?: (tab: 'order' | 'tracking' | 'loyalty') => void;
  autoOpenAddress?: boolean;
  onAddressModalHandled?: () => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  onLogoutClick,
  autoOpenAddress,
  onAddressModalHandled,
}) => {
  const { customerPhone, customerName, customerAddress, stampsCount, updateCustomerProfile } = useApp();
  const { lang, setLang } = useLang();
  const tr = useTr();

  const [userName, setUserName] = useState<string>(customerName || tr('Pelanggan', 'Customer'));
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(`laundrea_cust_email_${customerPhone}`) || 'pelanggan@laundrea.id';
  });
  const [userAddress, setUserAddress] = useState<string>(customerAddress || '');
  const [addressNotes, setAddressNotes] = useState<string>(() => {
    return (
      localStorage.getItem(`laundrea_cust_address_notes_${customerPhone}`) ||
      'Pagar hitam, sebelah mini market'
    );
  });

  const [activeModal, setActiveModal] = useState<
    'account' | 'address' | 'contact' | 'policy' | 'language' | null
  >(null);

  const [tempName, setTempName] = useState(userName);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempAddress, setTempAddress] = useState(userAddress);
  const [tempStructuredAddress, setTempStructuredAddress] = useState<StructuredAddressData | undefined>(undefined);
  const [tempNotes, setTempNotes] = useState(addressNotes);

  useEffect(() => {
    if (autoOpenAddress) {
      setTempAddress(userAddress);
      setTempNotes(addressNotes);
      setActiveModal('address');
      onAddressModalHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpenAddress]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(tempName);
    setUserEmail(tempEmail);
    localStorage.setItem(`laundrea_cust_email_${customerPhone}`, tempEmail);
    await updateCustomerProfile({ name: tempName });
    setActiveModal(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      setUserAddress(tempAddress.trim());
      setAddressNotes(tempNotes.trim());
      localStorage.setItem(`laundrea_cust_address_notes_${customerPhone}`, tempNotes.trim());
      await updateCustomerProfile({
        address: tempAddress.trim(),
        structuredAddress: tempStructuredAddress,
      });
      setActiveModal(null);
    }
  };

  const menuBtn =
    'w-full flex items-center gap-4 py-3.5 text-left hover:text-[#cd6184] transition-colors cursor-pointer group';
  const menuIcon =
    'w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-[#cd6184] transition-colors shrink-0';
  const menuText = 'text-sm font-bold text-[#254117] group-hover:text-[#cd6184] transition-colors';
  const modalOverlay =
    'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs';
  const closeBtn = 'text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-[#254117] animate-in fade-in duration-200">
      <h1 className="text-2xl font-black text-[#254117] tracking-tight">{tr('Profil', 'Profile')}</h1>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#ffecf2] border-2 border-[#cd6184]/40 flex items-center justify-center font-black text-[#cd6184] text-2xl shadow-xs shrink-0 select-none">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-[#254117] truncate">{userName}</h2>
          <p className="text-xs font-semibold text-[#254117]/60">Laundrea Laundry</p>
        </div>
      </div>

      {/* Akun Saya */}
      <div className="space-y-1 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cd6184] mb-2">
          {tr('Akun Saya', 'My Account')}
        </h3>

        <button
          type="button"
          id="btn-profile-account-info"
          onClick={() => {
            setTempName(userName);
            setTempEmail(userEmail);
            setActiveModal('account');
          }}
          className={menuBtn}
        >
          <User className={menuIcon} />
          <span className={menuText}>{tr('Informasi Akun', 'Account Information')}</span>
        </button>

        <button
          type="button"
          id="btn-profile-change-address"
          onClick={() => {
            setTempAddress(userAddress);
            setTempNotes(addressNotes);
            setActiveModal('address');
          }}
          className={menuBtn}
        >
          <Building2 className={menuIcon} />
          <span className={menuText}>{tr('Ubah Alamat', 'Change Address')}</span>
        </button>

        <button type="button" id="btn-language" onClick={() => setActiveModal('language')} className={menuBtn}>
          <Globe className={menuIcon} />
          <span className={`flex-1 ${menuText}`}>{tr('Bahasa', 'Language')}</span>
          <span className="text-xs font-semibold text-[#254117]/50">
            {lang === 'en' ? 'English' : 'Indonesia'}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
        </button>
      </div>

      <hr className="border-t border-gray-100" />

      {/* Hubungi Kami */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cd6184] mb-2">
          {tr('Hubungi Kami', 'Contact Us')}
        </h3>

        <button type="button" id="btn-profile-contact" onClick={() => setActiveModal('contact')} className={menuBtn}>
          <Phone className={menuIcon} />
          <span className={menuText}>{tr('Hubungi Toko', 'Contact Store')}</span>
        </button>

        <button type="button" id="btn-profile-policy" onClick={() => setActiveModal('policy')} className={menuBtn}>
          <FileText className={menuIcon} />
          <span className={menuText}>{tr('Kebijakan Aplikasi', 'App Policy')}</span>
        </button>

        <button
          type="button"
          id="btn-profile-logout"
          onClick={onLogoutClick}
          className="w-full flex items-center gap-4 py-3.5 text-left hover:text-red-600 transition-colors cursor-pointer group"
        >
          <LogOut className="w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-red-600 transition-colors shrink-0" />
          <span className="text-sm font-bold text-[#254117] group-hover:text-red-600 transition-colors">
            {tr('Keluar Akun', 'Log Out')}
          </span>
        </button>
      </div>

      <div className="text-center pt-6 pb-2">
        <p className="text-[11px] text-[#254117]/40 font-medium tracking-wide">
          {tr('Versi', 'Version')} - 2.20.18
        </p>
      </div>

      {/* MODAL: Informasi Akun */}
      {activeModal === 'account' && (
        <div className={modalOverlay}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-[#254117]">{tr('Informasi Akun', 'Account Information')}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className={closeBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#254117] mb-1">{tr('Nama Pelanggan', 'Customer Name')}</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">{tr('Nomor WhatsApp', 'WhatsApp Number')}</label>
                <input
                  type="text"
                  value={customerPhone}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[#254117]/60 text-xs font-semibold cursor-not-allowed"
                />
                <p className="text-[10px] text-[#254117]/50 mt-1">
                  {tr('Terverifikasi melalui OTP WhatsApp', 'Verified via WhatsApp OTP')}
                </p>
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">
                  {tr('Email Pemberitahuan', 'Notification Email')}
                </label>
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  placeholder="nama@email.com"
                />
              </div>

              <div className="p-3 bg-[#ffecf2]/60 rounded-2xl border border-[#cd6184]/25 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#254117] block">{tr('Status Keanggotaan', 'Membership Status')}</span>
                  <span className="text-[10px] text-[#254117]/70">{tr('Poin Loyalty Tersimpan', 'Saved Loyalty Points')}</span>
                </div>
                <span className="font-black text-xs text-[#cd6184] bg-white px-2.5 py-1 rounded-xl shadow-xs">
                  {stampsCount} {tr('Stempel', 'Stamps')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  {tr('Tutup', 'Close')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
                >
                  {tr('Simpan', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Alamat */}
      {activeModal === 'address' && (
        <div className={modalOverlay}>
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">{tr('Alamat Pengiriman', 'Delivery Address')}</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className={closeBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <CascadingAddressSelector
                initialCombinedAddress={tempAddress}
                onChange={({ combinedAddress, structured }) => {
                  setTempAddress(combinedAddress);
                  setTempStructuredAddress(structured);
                }}
                required
                idPrefix="profile-modal-addr"
              />

              <div>
                <label className="block font-bold text-[#254117] mb-1">
                  {tr('Catatan untuk Kurir Penjemput', 'Notes for Pickup Courier')}
                </label>
                <input
                  type="text"
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  placeholder={tr('Contoh: Pagar warna hitam, titip satpam', 'Example: Black gate, leave with the guard')}
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#97a273] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#254117]/70 leading-relaxed">
                  {tr(
                    'Alamat ini otomatis menjadi acuan penjemputan dan pengantaran cucian oleh kurir resmi Laundrea.',
                    'This address is automatically used for laundry pickup and delivery by official Laundrea couriers.'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  {tr('Batal', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
                >
                  {tr('Simpan Alamat', 'Save Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Hubungi Toko */}
      {activeModal === 'contact' && (
        <div className={modalOverlay}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">
                  {tr('Hubungi Toko Laundrea', 'Contact Laundrea Store')}
                </h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className={closeBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#254117]/70 leading-relaxed">
              {tr(
                'Tim Layanan Pelanggan kami siap membantu penjemputan cucian, status order, atau instruksi khusus pakaian Anda.',
                'Our Customer Service team is ready to help with laundry pickup, order status, or special garment instructions.'
              )}
            </p>

            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/6281288889999"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between hover:bg-emerald-100 transition-all font-bold"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>{tr('WhatsApp Layanan Pelanggan', 'Customer Service WhatsApp')}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href="tel:081288889999"
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#254117] flex items-center justify-between hover:bg-gray-100 transition-all font-bold"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#cd6184]" />
                  <span>{tr('Telepon Gerai Pusat', 'Call Main Store')}</span>
                </div>
                <span className="text-[11px] text-[#254117]/60">0812-8888-9999</span>
              </a>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] text-[#254117]/60 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#254117]">
                <Clock className="w-3.5 h-3.5 text-[#97a273]" />
                <span>{tr('Jam Operasional Layanan:', 'Service Hours:')}</span>
              </div>
              <p>{tr('Senin – Minggu: 07:00 – 20:00 WIB', 'Monday – Sunday: 07:00 – 20:00 WIB')}</p>
              <p>{tr('Alamat Gerai: Jl. Senopati No. 18, Jakarta Selatan', 'Store Address: Jl. Senopati No. 18, South Jakarta')}</p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer mt-1"
            >
              {tr('Tutup', 'Close')}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Kebijakan */}
      {activeModal === 'policy' && (
        <div className={modalOverlay}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">{tr('Kebijakan Layanan', 'Service Policy')}</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className={closeBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#254117]/80 leading-relaxed">
              <div className="p-3 bg-[#ffecf2]/50 rounded-2xl border border-[#cd6184]/20">
                <h4 className="font-bold text-[#254117] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#cd6184]" />
                  {tr('Jaminan & Garansi Pakaian', 'Garment Guarantee & Warranty')}
                </h4>
                <p className="text-[11px] text-[#254117]/70">
                  {tr(
                    'Jika pakaian mengalami kerusakan atau kelunturan akibat kelalaian operasional, Laundrea memberikan ganti rugi maksimal hingga 10x nilai biaya cuci pakaian terkait.',
                    'If garments are damaged or discolored due to operational negligence, Laundrea provides compensation of up to 10x the washing fee of the garment concerned.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">{tr('1. Penimbangan & Verifikasi', '1. Weighing & Verification')}</h4>
                <p className="text-[11px] text-[#254117]/70">
                  {tr(
                    'Berat atau jumlah pakaian final dihitung di gerai Laundrea dengan timbangan digital terkalibrasi. Pelanggan menerima foto bukti timbangan via WhatsApp.',
                    'The final weight or quantity is measured at the Laundrea store using a calibrated digital scale. Customers receive a photo of the weighing via WhatsApp.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">{tr('2. Barang Tertinggal di Saku', '2. Items Left in Pockets')}</h4>
                <p className="text-[11px] text-[#254117]/70">
                  {tr(
                    'Harap memeriksa saku pakaian sebelum diserahkan ke kurir. Uang tunai atau barang berharga yang ditemukan akan diamankan dan dikembalikan dalam amplop segel khusus.',
                    'Please check your pockets before handing clothes to the courier. Cash or valuables found will be kept safe and returned in a sealed envelope.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">{tr('3. Standar Higienis & Kebersihan', '3. Hygiene & Cleanliness Standards')}</h4>
                <p className="text-[11px] text-[#254117]/70">
                  {tr(
                    'Setiap pesanan diproses secara higienis dan terpisah menggunakan formula detergen ramah lingkungan dan anti-bakteri.',
                    'Every order is processed hygienically and separately using eco-friendly, anti-bacterial detergent formulas.'
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">{tr('4. Pengambilan & Batas Simpan', '4. Collection & Storage Limit')}</h4>
                <p className="text-[11px] text-[#254117]/70">
                  {tr(
                    'Pakaian yang telah selesai dicuci diantar sesuai jadwal yang dipilih. Pakaian yang tidak diambil setelah 30 hari tanpa konfirmasi akan disalurkan sebagai donasi.',
                    'Finished laundry is delivered on your chosen schedule. Clothes not collected after 30 days without confirmation will be donated.'
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer mt-2"
            >
              {tr('Saya Mengerti', 'I Understand')}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Bahasa */}
      {activeModal === 'language' && (
        <div className={modalOverlay}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">{tr('Bahasa', 'Language')}</h3>
              </div>
              <button type="button" onClick={() => setActiveModal(null)} className={closeBtn}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { code: 'id', label: 'Bahasa Indonesia' },
                { code: 'en', label: 'English' },
              ].map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLang(opt.code as 'id' | 'en');
                    setActiveModal(null);
                  }}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-sm font-bold cursor-pointer transition-all ${
                    lang === opt.code
                      ? 'border-[#cd6184] bg-[#ffecf2] text-[#cd6184]'
                      : 'border-gray-200 text-[#254117] hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {lang === opt.code && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
