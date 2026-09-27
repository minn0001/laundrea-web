import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
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

interface CustomerProfilePageProps {
  onLogoutClick: () => void;
  onNavigateTab?: (tab: 'order' | 'tracking' | 'loyalty') => void;
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  onLogoutClick,
}) => {
  const { customerPhone, stampsCount } = useApp();

  // State profil pengguna (disimpan ke localStorage)
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('laundrea_cust_name') || 'Yaya';
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('laundrea_cust_email') || 'yaya.laundrea@gmail.com';
  });
  const [userAddress, setUserAddress] = useState<string>(() => {
    return (
      localStorage.getItem('laundrea_cust_address') ||
      'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan'
    );
  });
  const [addressNotes, setAddressNotes] = useState<string>(() => {
    return (
      localStorage.getItem('laundrea_cust_address_notes') ||
      'Pagar hitam, sebelah mini market'
    );
  });

  // State modal interaktif
  const [activeModal, setActiveModal] = useState<
    'account' | 'address' | 'contact' | 'policy' | null
  >(null);

  // Form edit states
  const [tempName, setTempName] = useState(userName);
  const [tempEmail, setTempEmail] = useState(userEmail);
  const [tempAddress, setTempAddress] = useState(userAddress);
  const [tempNotes, setTempNotes] = useState(addressNotes);

  // Simpan Informasi Akun
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(tempName);
    setUserEmail(tempEmail);
    localStorage.setItem('laundrea_cust_name', tempName);
    localStorage.setItem('laundrea_cust_email', tempEmail);
    setActiveModal(null);
  };

  // Simpan Alamat
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setUserAddress(tempAddress);
    setAddressNotes(tempNotes);
    localStorage.setItem('laundrea_cust_address', tempAddress);
    localStorage.setItem('laundrea_cust_address_notes', tempNotes);
    setActiveModal(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 text-[#254117] animate-in fade-in duration-200">
      {/* Judul Halaman */}
      <h1 className="text-2xl font-black text-[#254117] tracking-tight">
        Profil
      </h1>

      {/* Profil Header Pengguna */}
      <div className="flex items-center gap-4">
        {/* Avatar / Lencana bulat mascot */}
        <div className="relative w-16 h-16 rounded-full bg-[#ffecf2] border-2 border-[#cd6184]/40 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#cd6184] text-white flex flex-col items-center justify-center text-center font-black">
            <span className="text-xs font-bold leading-none uppercase">Laundrea</span>
            <span className="text-[9px] font-medium opacity-90">Laundry</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-[#254117] truncate">{userName}</h2>
          </div>
          <p className="text-xs font-semibold text-[#254117]/60">Laundrea Laundry</p>
        </div>
      </div>

      {/* Bagian 1: Akun Saya */}
      <div className="space-y-1 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cd6184] mb-2">Akun Saya</h3>

        {/* Informasi Akun */}
        <button
          type="button"
          id="btn-profile-account-info"
          onClick={() => {
            setTempName(userName);
            setUserEmail(userEmail);
            setActiveModal('account');
          }}
          className="w-full flex items-center gap-4 py-3.5 text-left hover:text-[#cd6184] transition-colors cursor-pointer group"
        >
          <User className="w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-[#cd6184] transition-colors shrink-0" />
          <span className="text-sm font-bold text-[#254117] group-hover:text-[#cd6184] transition-colors">
            Informasi Akun
          </span>
        </button>

        {/* Ubah Alamat */}
        <button
          type="button"
          id="btn-profile-change-address"
          onClick={() => {
            setTempAddress(userAddress);
            setTempNotes(addressNotes);
            setActiveModal('address');
          }}
          className="w-full flex items-center gap-4 py-3.5 text-left hover:text-[#cd6184] transition-colors cursor-pointer group"
        >
          <Building2 className="w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-[#cd6184] transition-colors shrink-0" />
          <span className="text-sm font-bold text-[#254117] group-hover:text-[#cd6184] transition-colors">
            Ubah Alamat
          </span>
        </button>
      </div>

      {/* Pembatas Garis Halus */}
      <hr className="border-t border-gray-100" />

      {/* Bagian 2: Hubungi Kami */}
      <div className="space-y-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#cd6184] mb-2">Hubungi Kami</h3>

        {/* Hubungi Toko */}
        <button
          type="button"
          id="btn-profile-contact"
          onClick={() => setActiveModal('contact')}
          className="w-full flex items-center gap-4 py-3.5 text-left hover:text-[#cd6184] transition-colors cursor-pointer group"
        >
          <Phone className="w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-[#cd6184] transition-colors shrink-0" />
          <span className="text-sm font-bold text-[#254117] group-hover:text-[#cd6184] transition-colors">
            Hubungi Toko
          </span>
        </button>

        {/* Kebijakan Aplikasi */}
        <button
          type="button"
          id="btn-profile-policy"
          onClick={() => setActiveModal('policy')}
          className="w-full flex items-center gap-4 py-3.5 text-left hover:text-[#cd6184] transition-colors cursor-pointer group"
        >
          <FileText className="w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-[#cd6184] transition-colors shrink-0" />
          <span className="text-sm font-bold text-[#254117] group-hover:text-[#cd6184] transition-colors">
            Kebijakan Aplikasi
          </span>
        </button>

        {/* Keluar Akun */}
        <button
          type="button"
          id="btn-profile-logout"
          onClick={onLogoutClick}
          className="w-full flex items-center gap-4 py-3.5 text-left hover:text-red-600 transition-colors cursor-pointer group"
        >
          <LogOut className="w-5 h-5 text-[#254117]/80 stroke-[2] group-hover:text-red-600 transition-colors shrink-0" />
          <span className="text-sm font-bold text-[#254117] group-hover:text-red-600 transition-colors">
            Keluar Akun
          </span>
        </button>
      </div>

      {/* Footer Versi Aplikasi */}
      <div className="text-center pt-6 pb-2">
        <p className="text-[11px] text-[#254117]/40 font-medium tracking-wide">
          Versi - 2.20.18
        </p>
      </div>

      {/* MODAL: Informasi Akun */}
      {activeModal === 'account' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-black text-[#254117]">Informasi Akun</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#254117] mb-1">Nama Pelanggan</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={customerPhone}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 text-[#254117]/60 text-xs font-semibold cursor-not-allowed"
                />
                <p className="text-[10px] text-[#254117]/50 mt-1">Terverifikasi melalui OTP WhatsApp</p>
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">Email Pemberitahuan</label>
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
                  <span className="font-bold text-[#254117] block">Status Keanggotaan</span>
                  <span className="text-[10px] text-[#254117]/70">Poin Loyalty Tersimpan</span>
                </div>
                <span className="font-black text-xs text-[#cd6184] bg-white px-2.5 py-1 rounded-xl shadow-xs">
                  {stampsCount} Cap
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Ubah Alamat */}
      {activeModal === 'address' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">Alamat Pengiriman</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#254117] mb-1">
                  Alamat Lengkap
                </label>
                <textarea
                  rows={3}
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">
                  Catatan untuk Kurir Penjemput
                </label>
                <input
                  type="text"
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#cd6184] text-xs font-semibold text-[#254117]"
                  placeholder="Contoh: Pagar warna hitam, titip satpam"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#97a273] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#254117]/70 leading-relaxed">
                  Alamat ini otomatis menjadi acuan penjemputan dan pengantaran cucian oleh kurir resmi Laundrea.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Hubungi Toko */}
      {activeModal === 'contact' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">Hubungi Toko Laundrea</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#254117]/70 leading-relaxed">
              Tim Layanan Pelanggan kami siap membantu penjemputan cucian, status order, atau instruksi khusus pakaian Anda.
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
                  <span>WhatsApp Layanan Pelanggan</span>
                </div>
                <ExternalLink className="w-4 h-4 text-emerald-600" />
              </a>

              <a
                href="tel:081288889999"
                className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[#254117] flex items-center justify-between hover:bg-gray-100 transition-all font-bold"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#cd6184]" />
                  <span>Telepon Gerai Pusat</span>
                </div>
                <span className="text-[11px] text-[#254117]/60">0812-8888-9999</span>
              </a>
            </div>

            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] text-[#254117]/60 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#254117]">
                <Clock className="w-3.5 h-3.5 text-[#97a273]" />
                <span>Jam Operasional Layanan:</span>
              </div>
              <p>Senin – Minggu: 07:00 – 21:00 WIB</p>
              <p>Alamat Gerai: Jl. Senopati No. 18, Jakarta Selatan</p>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#254117] bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer mt-1"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Kebijakan Aplikasi */}
      {activeModal === 'policy' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#cd6184]" />
                <h3 className="text-base font-black text-[#254117]">Kebijakan Layanan</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#254117]/80 leading-relaxed">
              <div className="p-3 bg-[#ffecf2]/50 rounded-2xl border border-[#cd6184]/20">
                <h4 className="font-bold text-[#254117] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#cd6184]" />
                  Jaminan & Garansi Pakaian
                </h4>
                <p className="text-[11px] text-[#254117]/70">
                  Jika pakaian mengalami kerusakan atau kelunturan akibat kelalaian operasional, Laundrea memberikan ganti rugi maksimal hingga 10x nilai biaya cuci pakaian terkait.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">1. Penimbangan & Verifikasi</h4>
                <p className="text-[11px] text-[#254117]/70">
                  Berat atau jumlah pakaian final dihitung di gerai Laundrea dengan timbangan digital terkalibrasi. Pelanggan menerima foto bukti timbangan via WhatsApp.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">2. Barang Tertinggal di Saku</h4>
                <p className="text-[11px] text-[#254117]/70">
                  Harap memeriksa saku pakaian sebelum diserahkan ke kurir. Uang tunai atau barang berharga yang ditemukan akan diamankan dan dikembalikan dalam amplop segel khusus.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">3. Standar Higienis & Kebersihan</h4>
                <p className="text-[11px] text-[#254117]/70">
                  Setiap pesanan diproses secara higienis dan terpisah menggunakan formula detergen ramah lingkungan dan anti-bakteri.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-[#254117] mb-1">4. Pengambilan & Batas Simpan</h4>
                <p className="text-[11px] text-[#254117]/70">
                  Pakaian yang telah selesai dicuci diantar sesuai jadwal yang dipilih. Pakaian yang tidak diambil setelah 30 hari tanpa konfirmasi akan disalurkan sebagai donasi.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] shadow-xs transition-all cursor-pointer mt-2"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
