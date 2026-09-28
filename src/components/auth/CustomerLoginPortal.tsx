import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandWordmark } from '../common/BrandWordmark';
import {
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CustomerLoginPortalProps {
  onNavigateStaff?: () => void;
}

export const CustomerLoginPortal: React.FC<CustomerLoginPortalProps> = ({
  onNavigateStaff,
}) => {
  const { verifyCustomer, resetAllData } = useApp();

  // Customer WhatsApp OTP state
  const [waPhone, setWaPhone] = useState('081234567890');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('782910');
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep === 'otp' && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [otpStep, countdown]);

  // Handle WhatsApp OTP send
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waPhone || waPhone.length < 8) return;

    setIsWaLoading(true);
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);

    setTimeout(() => {
      setIsWaLoading(false);
      setOtpStep('otp');
      setCountdown(30);
      setCanResend(false);
    }, 400);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);
    setCountdown(30);
    setCanResend(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      setIsWaLoading(true);
      setTimeout(() => {
        setIsWaLoading(false);
        setOtpStep('success');
        setTimeout(() => {
          verifyCustomer(waPhone);
        }, 700);
      }, 350);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffecf2]/30 via-white to-gray-50 flex flex-col justify-between p-3.5 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full pt-3 sm:pt-6 text-center space-y-2">
        <div className="flex justify-center">
          <BrandWordmark size="xl" variant="pink" />
        </div>
        <p className="text-xs sm:text-sm text-[#254117]/75 font-medium">
          Layanan Laundry Premium Antar Jemput Higienis
        </p>
      </div>

      {/* Main Form Box: Direct WhatsApp OTP Flow */}
      <div className="max-w-md mx-auto w-full my-auto py-3 space-y-3">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-[#ffecf2] relative overflow-hidden">
          {otpStep === 'success' ? (
            <div className="py-8 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-[#97a273]/20 text-[#97a273] rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-[#97a273]">Verifikasi Berhasil!</h3>
              <p className="text-xs text-[#254117]/70">
                Selamat datang di Portal Pelanggan Laundrea. Mengalihkan ke dashboard...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#cd6184] uppercase tracking-wider block">
                      Login Pelanggan
                    </span>
                    <span className="text-[10px] text-[#254117]/60 font-medium">
                      Verifikasi Cepat via WhatsApp
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Tanpa Sandi
                </span>
              </div>

              {otpStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#254117]">
                      Nomor WhatsApp Anda
                    </h2>
                    <p className="text-xs text-[#254117]/70 mt-0.5">
                      Kode 6-digit OTP verifikasi akan dikirimkan otomatis ke WhatsApp Anda.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#254117] mb-1">
                      Nomor WhatsApp Aktif
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
                        className="w-full pl-10 pr-4 py-2.5 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-[#254117]/60 mt-1.5">
                      Nomor terdaftar langsung terhubung ke status pesanan, kupon promo, & saldo stempel loyalty Anda.
                    </p>
                  </div>

                  <button
                    id="btn-customer-send-otp"
                    type="submit"
                    disabled={isWaLoading || !waPhone}
                    className="w-full py-3 px-5 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isWaLoading ? (
                      <span>Mengirim Kode OTP...</span>
                    ) : (
                      <>
                        <span>Kirim Kode OTP WhatsApp</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#254117]">
                      Masukkan Kode Verifikasi
                    </h2>
                    <p className="text-xs text-[#254117]/70 mt-0.5">
                      Kode terkirim ke WhatsApp <span className="font-bold text-[#254117]">{waPhone}</span>
                    </p>
                  </div>

                  {/* Simulated WhatsApp Notification Box */}
                  <div className="p-3 bg-[#ffecf2] border border-[#cd6184]/40 rounded-2xl flex items-start gap-2.5">
                    <div className="p-1.5 bg-[#97a273] text-white rounded-lg shrink-0 mt-0.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-semibold text-[#254117]">Simulasi Pesan WhatsApp:</p>
                      <p className="text-[#254117]/80 mt-0.5">
                        Kode login: <span className="font-black text-[#cd6184] tracking-wider">{simulatedCode}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtpCode(simulatedCode)}
                        className="mt-1 text-xs text-[#cd6184] font-bold underline hover:text-[#254117] cursor-pointer inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Klik untuk isi otomatis ({simulatedCode})</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#254117] mb-1">
                      6 Digit Kode OTP
                    </label>
                    <input
                      id="input-login-otp"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="w-full py-2.5 px-4 text-center tracking-[0.5em] text-xl font-black bg-[#ffecf2]/30 border border-[#cd6184]/40 rounded-xl text-[#254117] focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                      autoFocus
                    />
                    <div className="flex items-center justify-between text-xs mt-1.5 text-[#254117]/70">
                      <span>Belum menerima?</span>
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-[#cd6184] font-semibold hover:underline cursor-pointer"
                        >
                          Kirim ulang
                        </button>
                      ) : (
                        <span className="text-[#254117]/50">
                          Kirim ulang ({countdown}s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => setOtpStep('phone')}
                      className="w-1/3 py-2.5 px-2 rounded-xl border border-gray-200 text-[#254117] text-xs font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Ganti Nomor
                    </button>
                    <button
                      id="btn-customer-verify-otp"
                      type="submit"
                      disabled={isWaLoading || otpCode.length !== 6}
                      className="w-2/3 py-2.5 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isWaLoading ? (
                        <span>Memverifikasi...</span>
                      ) : (
                        <>
                          <span>Verifikasi & Masuk</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full pb-2 text-center space-y-2">
        {onNavigateStaff && (
          <div className="text-center">
            <button
              type="button"
              onClick={onNavigateStaff}
              className="text-xs text-[#254117]/60 hover:text-[#cd6184] font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Petugas Kurir atau Admin? Masuk via <strong>/staff</strong></span>
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 text-[11px] text-[#254117]/60">
          <span>Laundrea v2.4</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan seluruh data demo ke kondisi awal?')) {
                resetAllData();
                window.location.reload();
              }
            }}
            className="inline-flex items-center gap-1 hover:text-[#cd6184] cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
