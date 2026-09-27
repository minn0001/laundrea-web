import React, { useState, useEffect } from 'react';
import { BrandWordmark } from '../common/BrandWordmark';
import { Phone, ArrowRight, ShieldCheck, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';

interface CustomerVerificationProps {
  onVerified: (phone: string) => void;
  onBackToLanding?: () => void;
}

export const CustomerVerification: React.FC<CustomerVerificationProps> = ({
  onVerified,
  onBackToLanding,
}) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('081234567890');
  const [otp, setOtp] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('782910');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

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
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedCode(generated);
    setCountdown(30);
    setCanResend(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setStep('success');
        setTimeout(() => {
          onVerified(phone);
        }, 1200);
      }, 400);
    }
  };

  const fillAutoOtp = () => {
    setOtp(simulatedCode);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 max-w-lg mx-auto w-full">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <BrandWordmark size="xl" variant="pink" />
        <p className="text-[#254117]/80 text-sm mt-1.5 font-medium">
          Jemput & antar Laundrea, lebih praktis.
        </p>
      </div>

      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#ffecf2] relative overflow-hidden">
        {step === 'success' ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#97a273]/20 text-[#97a273] rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#97a273]">Terverifikasi!</h2>
            <p className="text-sm text-[#254117]/70">
              Selamat datang di Laundrea. Membuka pilihan paket...
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#cd6184] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi WhatsApp</span>
              </div>
              {onBackToLanding && step === 'phone' && (
                <button
                  type="button"
                  onClick={onBackToLanding}
                  className="text-xs text-[#254117]/60 hover:text-[#cd6184] flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Beranda</span>
                </button>
              )}
            </div>

            {step === 'phone' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#254117] mb-1">
                    Masukkan Nomor WhatsApp
                  </h2>
                  <p className="text-xs text-[#254117]/70">
                    Tanpa password. Kami akan mengirimkan 6 digit kode verifikasi ke WhatsApp Anda.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#254117]/40">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-[#254117]/60 mt-1">
                    Nomor Anda hanya digunakan untuk pembaruan pesanan dan koordinasi kurir.
                  </p>
                </div>

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={isLoading || !phone}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span>Mengirim Kode...</span>
                  ) : (
                    <>
                      <span>Kirim Kode OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#254117] mb-1">
                    Kode Verifikasi
                  </h2>
                  <p className="text-xs text-[#254117]/70">
                    Kami mengirimkan kode ke WhatsApp <span className="font-semibold text-[#254117]">{phone}</span>
                  </p>
                </div>

                {/* Simulated WhatsApp notification pill */}
                <div className="p-3.5 bg-[#ffecf2] border border-[#cd6184]/40 rounded-2xl flex items-start gap-3">
                  <div className="p-2 bg-[#97a273] text-white rounded-xl shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-[#254117]">Simulasi Notifikasi WhatsApp:</p>
                    <p className="text-[#254117]/80 mt-0.5">
                      Kode Laundrea Anda adalah <span className="font-bold text-[#cd6184] text-sm tracking-wider">{simulatedCode}</span>
                    </p>
                    <button
                      type="button"
                      onClick={fillAutoOtp}
                      className="mt-1 text-xs text-[#cd6184] font-semibold underline hover:text-[#254117] cursor-pointer"
                    >
                      Klik untuk isi otomatis kode ({simulatedCode})
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#254117] mb-1.5">
                    6 Digit Kode OTP
                  </label>
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
                    <span>Belum menerima kode?</span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-[#cd6184] font-semibold hover:underline cursor-pointer"
                      >
                        Kirim ulang kode
                      </button>
                    ) : (
                      <span className="text-[#254117]/50">
                        Kirim ulang dalam {countdown}dtk
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
                    Ganti Nomor
                  </button>
                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-2/3 py-3 px-4 rounded-xl bg-[#cd6184] hover:bg-[#b85373] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#cd6184]/25 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Memverifikasi...</span>
                    ) : (
                      <>
                        <span>Verifikasi</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#254117]/60">
              <span>Sesi peramban aman</span>
              <span className="font-semibold text-[#97a273]">Tanpa perlu password</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
