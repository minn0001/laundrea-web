import React, { useState, useEffect } from 'react';
import { BrandWordmark } from '../common/BrandWordmark';
import { useTr } from '../../i18n/useTr';
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  ArrowLeft,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getCustomerFromFirestore,
  saveCustomerToFirestore,
  normalizePhoneNumber,
  DEFAULT_DEMO_PHONE,
  DEFAULT_DEMO_NAME,
  DEFAULT_DEMO_ADDRESS,
  CustomerFirestoreData,
} from '../../services/firebaseService';
import { CascadingAddressSelector } from '../common/CascadingAddressSelector';
import { StructuredAddressData } from '../../services/wilayahService';

interface CustomerVerificationProps {
  onVerified: (phone: string, profileData?: { name?: string; address?: string }) => void;
  onBackToLanding?: () => void;
}

export const CustomerVerification: React.FC<CustomerVerificationProps> = ({
  onVerified,
  onBackToLanding,
}) => {
  const tr = useTr();
  const [step, setStep] = useState<'phone' | 'otp' | 'register' | 'success'>('phone');
  const [phone, setPhone] = useState('081234567890');
  const [otp, setOtp] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('782910');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [regName, setRegName] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regStructured, setRegStructured] = useState<StructuredAddressData | undefined>(undefined);
  // Simpan "kode" error, bukan teks, supaya ikut berganti bahasa
  const [authError, setAuthError] = useState<'connect' | 'fill_required' | null>(null);
  const [isCheckingAccount, setIsCheckingAccount] = useState(false);

  const errorText =
    authError === 'connect'
      ? tr('Gagal terhubung, coba lagi', 'Connection failed, please try again')
      : authError === 'fill_required'
      ? tr('Mohon isi nama lengkap dan alamat penjemputan.', 'Please fill in your full name and pickup address.')
      : '';

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!phone || phone.length < 8) return;

    setIsLoading(true);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
    }, 500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setAuthError(null);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);
    setCountdown(30);
    setCanResend(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setAuthError(null);
    setIsLoading(true);
    setIsCheckingAccount(true);

    const normPhone = normalizePhoneNumber(phone);
    const isDemoNumber = normPhone === normalizePhoneNumber(DEFAULT_DEMO_PHONE);

    try {
      const customerRecord: CustomerFirestoreData | null = await getCustomerFromFirestore(phone);

      setIsLoading(false);
      setIsCheckingAccount(false);

      if (customerRecord) {
        setStep('success');
        setTimeout(() => {
          onVerified(phone, { name: customerRecord.name, address: customerRecord.address });
        }, 1000);
      } else {
        setStep('register');
      }
    } catch (err) {
      console.error('Error connecting to Firestore during customer verification:', err);
      setIsLoading(false);
      setIsCheckingAccount(false);

      if (isDemoNumber) {
        setStep('success');
        setTimeout(() => {
          onVerified(phone, { name: DEFAULT_DEMO_NAME, address: DEFAULT_DEMO_ADDRESS });
        }, 1000);
      } else {
        setAuthError('connect');
      }
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regAddress.trim()) {
      setAuthError('fill_required');
      return;
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      const savedDoc = await saveCustomerToFirestore(phone, regName, regAddress, regStructured);
      setIsLoading(false);
      setStep('success');
      setTimeout(() => {
        onVerified(phone, { name: savedDoc.name, address: savedDoc.address });
      }, 1000);
    } catch (err) {
      console.error('Error saving customer to Firestore:', err);
      setIsLoading(false);
      setAuthError('connect');
    }
  };

  const fillAutoOtp = () => setOtp(simulatedCode);

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
      <div className="text-center mb-6">
        <BrandWordmark size="xl" variant="pink" />
        <p className="text-[#254117]/80 text-sm mt-1.5 font-medium">
          {tr('Jemput & antar Laundrea, lebih praktis.', 'Laundrea pickup & delivery, made easy.')}
        </p>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#ffecf2] relative overflow-hidden">
        {step === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#97a273]/20 text-[#97a273] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#97a273]">{tr('Terverifikasi!', 'Verified!')}</h2>
            <p className="text-sm text-[#254117]/70">
              {tr('Selamat datang di Laundrea. Membuka beranda pelanggan...', 'Welcome to Laundrea. Opening your customer home...')}
            </p>
          </div>
        ) : step === 'register' ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setRegName('');
                  setRegAddress('');
                  setAuthError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#cd6184] hover:text-[#b85373] hover:bg-[#ffecf2] px-2.5 py-1 -ml-1 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{tr('Kembali', 'Back')}</span>
              </button>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {tr('Pendaftaran Baru', 'New Registration')}
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#254117] mb-1">{tr('Lengkapi Data Diri', 'Complete Your Details')}</h2>
              <p className="text-xs text-[#254117]/70">
                {tr('Nomor', 'The number')} <span className="font-semibold text-[#254117]">{phone}</span>{' '}
                {tr(
                  'belum terdaftar. Silakan isi nama dan alamat penjemputan untuk mulai memesan.',
                  'is not registered yet. Please enter your name and pickup address to start ordering.'
                )}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1.5">
                  {tr('Nama Lengkap', 'Full Name')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#254117]/40">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={tr('Contoh: Budi Santoso', 'Example: Budi Santoso')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <CascadingAddressSelector
                  initialCombinedAddress=""
                  onChange={({ combinedAddress, structured }) => {
                    setRegAddress(combinedAddress);
                    setRegStructured(structured);
                  }}
                  required
                  idPrefix="verification-register-addr"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !regName.trim() || !regAddress.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tr('Menyimpan Akun...', 'Saving Account...')}</span>
                  </span>
                ) : (
                  <>
                    <span>{tr('Mulai', 'Start')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#cd6184] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{tr('Verifikasi WhatsApp', 'WhatsApp Verification')}</span>
              </div>
              {onBackToLanding && step === 'phone' && (
                <button type="button" onClick={onBackToLanding} className="text-xs text-[#254117]/60 hover:text-[#cd6184] flex items-center gap-1 cursor-pointer">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{tr('Beranda', 'Home')}</span>
                </button>
              )}
            </div>

            {authError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#254117] mb-1">{tr('Masukkan Nomor WhatsApp', 'Enter Your WhatsApp Number')}</h2>
                  <p className="text-xs text-[#254117]/70">
                    {tr(
                      'Tanpa password. Kami akan mengirimkan 6 digit kode verifikasi ke WhatsApp Anda.',
                      'No password needed. We will send a 6-digit verification code to your WhatsApp.'
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1.5">{tr('Nomor WhatsApp', 'WhatsApp Number')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#254117]/40">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={tr('Contoh: 081234567890', 'Example: 081234567890')}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#254117]/60 mt-1">
                    {tr(
                      'Nomor Anda hanya digunakan untuk pembaruan pesanan dan koordinasi kurir.',
                      'Your number is only used for order updates and courier coordination.'
                    )}
                  </p>
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>{tr('Mengirim Kode...', 'Sending Code...')}</span>
                  ) : (
                    <>
                      <span>{tr('Kirim Kode OTP', 'Send OTP Code')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#254117] mb-1">{tr('Kode Verifikasi', 'Verification Code')}</h2>
                  <p className="text-xs text-[#254117]/70">
                    {tr('Kami mengirimkan kode ke WhatsApp', 'We sent a code to WhatsApp')}{' '}
                    <span className="font-semibold text-[#254117]">{phone}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-[#ffecf2] border border-[#cd6184]/40 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-[#97a273] text-white rounded-xl shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-[#254117]">{tr('Simulasi Notifikasi WhatsApp:', 'WhatsApp Notification Simulation:')}</p>
                    <p className="text-[#254117]/80 mt-0.5">
                      {tr('Kode Laundrea Anda adalah', 'Your Laundrea code is')}{' '}
                      <span className="font-bold text-[#cd6184] text-sm tracking-wider">{simulatedCode}</span>
                    </p>
                    <button type="button" onClick={fillAutoOtp} className="mt-1 text-xs text-[#cd6184] font-semibold underline hover:text-[#254117] cursor-pointer">
                      {tr('Klik untuk isi otomatis kode', 'Tap to auto-fill code')} ({simulatedCode})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1.5">{tr('6 Digit Kode OTP', '6-Digit OTP Code')}</label>
                  <input
                    id="input-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3 px-4 text-center tracking-[0.5em] text-2xl font-bold bg-[#ffecf2]/30 border border-[#cd6184]/40 rounded-xl text-[#254117] focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                    autoFocus
                  />
                  <div className="flex items-center justify-between text-xs mt-2 text-[#254117]/70">
                    <span>{tr('Belum menerima kode?', "Didn't receive the code?")}</span>
                    {canResend ? (
                      <button type="button" onClick={handleResend} className="text-[#cd6184] font-semibold hover:underline cursor-pointer">
                        {tr('Kirim ulang kode', 'Resend code')}
                      </button>
                    ) : (
                      <span className="text-[#254117]/50">
                        {tr(`Kirim ulang dalam ${countdown}dtk`, `Resend in ${countdown}s`)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="w-1/3 py-3 px-3 rounded-xl border border-gray-200 text-[#254117] text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {tr('Ganti Nomor', 'Change Number')}
                  </button>
                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-2/3 py-3 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isCheckingAccount ? tr('Memeriksa...', 'Checking...') : tr('Memverifikasi...', 'Verifying...')}</span>
                      </span>
                    ) : (
                      <>
                        <span>{tr('Verifikasi', 'Verify')}</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#254117]/60">
              <span>{tr('Sesi peramban aman', 'Secure browser session')}</span>
              <span className="font-semibold text-[#97a273]">{tr('Tanpa perlu password', 'No password needed')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
