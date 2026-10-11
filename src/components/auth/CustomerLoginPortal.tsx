import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  User,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  getCustomerFromFirestore,
  saveCustomerToFirestore,
  normalizePhoneNumber,
  DEFAULT_DEMO_PHONE,
  DEFAULT_DEMO_NAME,
  DEFAULT_DEMO_ADDRESS,
  SEED_CUSTOMERS,
  CustomerFirestoreData,
} from '../../services/firebaseService';
import { CascadingAddressSelector } from '../common/CascadingAddressSelector';
import { StructuredAddressData } from '../../services/wilayahService';

// Laundrea WhatsApp Number in international format without plus sign
const LAUNDREA_WA_NUMBER = '6287790103092';

interface CustomerLoginPortalProps {
  onSuccess?: () => void;
  onClose?: () => void;
  onNavigateStaff?: () => void;
}

export const CustomerLoginPortal: React.FC<CustomerLoginPortalProps> = ({
  onSuccess,
  onClose,
  onNavigateStaff,
}) => {
  const { verifyCustomer } = useApp();

  // Step state: 'options' | 'phone_input' | 'otp' | 'register' | 'success'
  const [step, setStep] = useState<'options' | 'phone_input' | 'otp' | 'register' | 'success'>('options');
  const [waPhone, setWaPhone] = useState('081234567890');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('782910');
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // New registration form states for new phone numbers
  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regStructured, setRegStructured] = useState<StructuredAddressData | undefined>(undefined);
  const [isAddressValid, setIsAddressValid] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  // Modal for Syarat & Ketentuan or Kebijakan Privasi
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Action: "Lanjut dengan WhatsApp"
  const handleContinueWithWhatsApp = () => {
    setAuthError(null);
    const demoNum = DEFAULT_DEMO_PHONE;
    setWaPhone(demoNum);

    // 1. Open WhatsApp with prefilled text in a new tab
    const textMsg = encodeURIComponent('Halo Laundrea, saya ingin masuk/daftar akun.');
    const waUrl = `https://wa.me/${LAUNDREA_WA_NUMBER}?text=${textMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // 2. At the same time, move to existing OTP step using demo number 081234567890
    setIsWaLoading(true);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);

    setTimeout(() => {
      setIsWaLoading(false);
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
    }, 350);
  };

  // Action: "Kirim Kode OTP" from phone input
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!waPhone || waPhone.length < 8) {
      setAuthError('Nomor telepon minimal 8 digit.');
      return;
    }

    setIsWaLoading(true);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);

    setTimeout(() => {
      setIsWaLoading(false);
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
    }, 350);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setAuthError(null);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);
    setCountdown(30);
    setCanResend(false);
  };

  // Handle OTP verification and check customer existence in Firestore
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    setAuthError(null);
    setIsWaLoading(true);
    setIsCheckingAccount(true);

    const normPhone = normalizePhoneNumber(waPhone);
    const isDemoNumber = normPhone === normalizePhoneNumber(DEFAULT_DEMO_PHONE);

    try {
      // Check customer account in Firestore
      const customerRecord: CustomerFirestoreData | null = await getCustomerFromFirestore(waPhone);

      setIsWaLoading(false);
      setIsCheckingAccount(false);

      if (customerRecord) {
        // Account exists in Firestore: log in directly with saved name & address
        setStep('success');
        setTimeout(() => {
          verifyCustomer(waPhone, {
            name: customerRecord.name,
            address: customerRecord.address,
          });
          onSuccess?.();
        }, 700);
      } else {
        // Account does not exist in Firestore: show "Lengkapi Profil"
        setStep('register');
      }
    } catch (err) {
      console.error('Error connecting to Firestore during login:', err);
      setIsWaLoading(false);
      setIsCheckingAccount(false);

      // Offline / connection fallback rule:
      // The sample customers (Yaya, Rizky, Jessica, Fajar, Maya, Hendro) log in using their seed profile
      const seedMatch = SEED_CUSTOMERS.find(
        (sc) => normalizePhoneNumber(sc.phone) === normalizePhoneNumber(waPhone)
      );

      if (seedMatch) {
        setStep('success');
        setTimeout(() => {
          verifyCustomer(waPhone, {
            name: seedMatch.name,
            address: seedMatch.address,
          });
          onSuccess?.();
        }, 700);
      } else {
        // Friendly Indonesian message instead of crashing
        setAuthError('Gagal terhubung, coba lagi');
      }
    }
  };

  // Handle submission of "Lengkapi Profil" registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regAddress.trim()) {
      setAuthError('Mohon isi nama lengkap dan alamat penjemputan.');
      return;
    }

    setAuthError(null);
    setIsWaLoading(true);

    try {
      // Save customer to Firestore collection 'customers' with structured parts
      const savedDoc = await saveCustomerToFirestore(waPhone, regName, regAddress, regStructured);
      setIsWaLoading(false);
      setStep('success');

      setTimeout(() => {
        verifyCustomer(waPhone, {
          name: savedDoc.name,
          address: savedDoc.address,
        });
        onSuccess?.();
      }, 700);
    } catch (err) {
      console.error('Error saving customer to Firestore:', err);
      setIsWaLoading(false);
      setAuthError('Gagal terhubung, coba lagi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-100/90 backdrop-blur-xs overflow-y-auto">
      {/* Centered White Card (rounded corners, soft shadow, light gray background, no logo) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lg border border-gray-100 relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Small "×" at the card's top-right that closes the login and returns to Beranda */}
        {onClose && (
          <button
            type="button"
            id="btn-close-login"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ================= STEP 1: OPTIONS (Main Login Card) ================= */}
        {step === 'options' && (
          <div className="space-y-5 text-center">
            {/* Title & Subtitle */}
            <div className="space-y-1 pt-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#254117]">
                Masuk/Daftar
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Masuk untuk melakukan pemesanan
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Buttons Stack */}
            <div className="space-y-3 pt-2">
              {/* Full-width pill button: "Lanjut dengan WhatsApp" (sage green #97a273, white bold text, chat icon on the left) */}
              <button
                type="button"
                id="btn-login-wa"
                onClick={handleContinueWithWhatsApp}
                className="w-full py-3.5 px-5 rounded-full bg-[#97a273] hover:bg-[#889464] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Lanjut dengan WhatsApp</span>
              </button>

              {/* Full-width pill outline button: "Gunakan nomor HP" (dark border, light background, dark bold text) */}
              <button
                type="button"
                id="btn-login-phone-option"
                onClick={() => {
                  setAuthError(null);
                  setStep('phone_input');
                }}
                className="w-full py-3.5 px-5 rounded-full border-2 border-[#254117] bg-white hover:bg-gray-50 active:scale-[0.99] text-[#254117] font-bold text-sm flex items-center justify-center transition-all cursor-pointer"
              >
                <span>Gunakan nomor HP</span>
              </button>
            </div>

            {/* Small centered gray footer text with clickable terms and privacy links */}
            <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-2 px-2">
              Dengan melanjutkan, Anda menyetujui{' '}
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="underline text-gray-700 hover:text-black font-semibold cursor-pointer"
              >
                Syarat & Ketentuan
              </button>{' '}
              dan{' '}
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="underline text-gray-700 hover:text-black font-semibold cursor-pointer"
              >
                Kebijakan Privasi
              </button>
              .
            </p>

            {onNavigateStaff && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onNavigateStaff}
                  className="text-[11px] text-[#254117]/60 hover:text-[#254117] font-semibold cursor-pointer"
                >
                  Portal Khusus Kurir & Admin →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: PHONE INPUT ("Gunakan nomor HP") ================= */}
        {step === 'phone_input' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#254117]">
                Masuk/Daftar
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">
                Masuk untuk melakukan pemesanan
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSendPhoneOtp} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Nomor WhatsApp / HP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#254117]/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    id="input-customer-phone"
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                  />
                </div>
              </div>

              {/* Full-width pill "Kirim Kode OTP" button */}
              <button
                id="btn-customer-send-otp"
                type="submit"
                disabled={isWaLoading}
                className="w-full py-3.5 px-5 rounded-full bg-[#254117] hover:bg-[#1c3311] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isWaLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim OTP...</span>
                  </span>
                ) : (
                  <span>Kirim Kode OTP</span>
                )}
              </button>

              {/* Small "Kembali" link */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setStep('options');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-[#254117]/70 hover:text-[#254117] font-semibold cursor-pointer py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke pilihan masuk</span>
                </button>
              </div>
            </form>

            <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-2 px-2">
              Dengan melanjutkan, Anda menyetujui{' '}
              <button
                type="button"
                onClick={() => setLegalModal('terms')}
                className="underline text-gray-700 hover:text-black font-semibold cursor-pointer"
              >
                Syarat & Ketentuan
              </button>{' '}
              dan{' '}
              <button
                type="button"
                onClick={() => setLegalModal('privacy')}
                className="underline text-gray-700 hover:text-black font-semibold cursor-pointer"
              >
                Kebijakan Privasi
              </button>
              .
            </p>
          </div>
        )}

        {/* ================= STEP 3: OTP VERIFICATION ================= */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#254117]">
                Verifikasi OTP
              </h2>
              <p className="text-xs text-gray-500">
                Kode 6-digit dikirimkan ke WhatsApp <span className="font-bold text-[#254117]">{waPhone}</span>
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Simulated WhatsApp Notification Box (stays intact) */}
            <div className="bg-[#e7f7e9] border border-[#a2dfa7] rounded-2xl p-3.5 space-y-2 text-xs text-[#1e4620]">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#1e4620]/80">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#25d366]" />
                  <span>Simulasi WhatsApp Laundrea OTP</span>
                </div>
                <span className="text-[10px] text-gray-500 font-normal">Baru saja</span>
              </div>
              <p className="text-xs leading-relaxed">
                Kode OTP verifikasi Laundrea Anda adalah:{' '}
                <span className="font-mono font-bold text-sm text-[#1e4620] tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#a2dfa7]">
                  {simulatedCode}
                </span>
              </p>
              <button
                type="button"
                onClick={() => setOtpCode(simulatedCode)}
                className="text-[11px] font-bold text-[#1e4620] underline hover:text-black cursor-pointer block text-left"
              >
                Klik untuk isi otomatis
              </button>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Masukkan 6-Digit Kode OTP
                </label>
                <input
                  id="input-customer-otp"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6 digit angka"
                  required
                  className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-bold focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                />
              </div>

              <button
                id="btn-customer-verify-otp"
                type="submit"
                disabled={otpCode.length !== 6 || isWaLoading || isCheckingAccount}
                className="w-full py-3.5 px-5 rounded-full bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isWaLoading || isCheckingAccount ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memeriksa Akun...</span>
                  </span>
                ) : (
                  <span>Verifikasi & Lanjut</span>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthError(null);
                    setStep('options');
                  }}
                  className="text-gray-500 hover:text-gray-700 underline cursor-pointer text-[11px]"
                >
                  Ganti metode masuk
                </button>

                {countdown > 0 ? (
                  <span className="text-[11px] text-gray-400">
                    Kirim ulang dalam {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[#cd6184] font-bold hover:underline cursor-pointer text-[11px]"
                  >
                    Kirim Ulang OTP
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ================= STEP 4: LENGKAPI PROFIL (New Phone Number) ================= */}
        {step === 'register' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              {/* Back button with arrow-left and "Kembali" label at top-left of card */}
              <button
                type="button"
                id="btn-back-from-register"
                onClick={() => {
                  setStep('phone_input');
                  setOtpCode('');
                  setRegName('');
                  setRegAddress('');
                  setAuthError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#cd6184] hover:text-[#b85373] hover:bg-[#ffecf2] px-2.5 py-1 -ml-1 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>

              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Pendaftaran Baru
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#254117]">
                Halo! Silakan Lengkapi Data Anda
              </h2>
              <p className="text-xs text-[#254117]/70 mt-0.5">
                Nomor <span className="font-bold text-[#254117]">{waPhone}</span> belum terdaftar. Isi data penjemputan untuk mulai memesan.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#254117]/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-register-name"
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Yaya"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                  />
                </div>
              </div>

              {/* Cascading Address Selector for Lengkapi Profil */}
              <div>
                <CascadingAddressSelector
                  initialCombinedAddress=""
                  onChange={({ combinedAddress, structured, isValid }) => {
                    setRegAddress(combinedAddress);
                    setRegStructured(structured);
                    setIsAddressValid(isValid);
                  }}
                  required
                  idPrefix="register-addr"
                />
              </div>

              <button
                id="btn-customer-complete-register"
                type="submit"
                disabled={isWaLoading || !regName.trim() || !regAddress.trim()}
                className="w-full py-3.5 px-5 rounded-full bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isWaLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan Akun...</span>
                  </span>
                ) : (
                  <>
                    <span>Mulai</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 5: SUCCESS STATE ================= */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-3 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-[#97a273]/20 text-[#97a273] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-bold text-[#97a273]">Verifikasi Berhasil!</h3>
            <p className="text-xs text-[#254117]/70">
              Selamat datang di Laundrea. Melanjutkan pesanan Anda...
            </p>
          </div>
        )}
      </div>

      {/* Small Modal for Syarat & Ketentuan and Kebijakan Privasi */}
      {legalModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-3.5 text-[#254117] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-base font-bold text-[#254117]">
                {legalModal === 'terms' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs leading-relaxed text-[#254117]/80 space-y-2">
              {legalModal === 'terms' ? (
                <p>
                  Dengan menggunakan layanan Laundrea, Anda menyetujui ketentuan penjemputan pakaian, estimasi waktu pengerjaan, standar penimbangan basah/kering, serta perawatan serat kain sesuai jenis layanan yang Anda pilih. Pembayaran dilakukan secara nontunai (QRIS/Transfer) atau COD saat serah terima.
                </p>
              ) : (
                <p>
                  Laundrea menjaga kerahasiaan data pribadi Anda, termasuk nama lengkap, nomor kontak WhatsApp, dan alamat penjemputan. Informasi ini hanya digunakan untuk keperluan operasional penjemputan, pengantaran, dan pelacakan cucian Anda, serta tidak dibagikan kepada pihak ketiga.
                </p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#cd6184] hover:bg-[#b85373] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
