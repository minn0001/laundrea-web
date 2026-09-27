import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandWordmark } from '../common/BrandWordmark';
import { Role } from '../../types';
import {
  User,
  Truck,
  ShieldCheck,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';

export const RoleLoginPortal: React.FC = () => {
  const {
    verifyCustomer,
    loginCourier,
    loginAdmin,
    resetAllData,
  } = useApp();

  // Navigation steps: 'role' (Step 1) -> 'form' (Step 2)
  const [authStep, setAuthStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');

  // Customer WhatsApp OTP state
  const [waPhone, setWaPhone] = useState('081234567890');
  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('782910');
  const [isWaLoading, setIsWaLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Courier state
  const [courierUsername, setCourierUsername] = useState('kurir_dimas');
  const [courierPassword, setCourierPassword] = useState('••••••••');
  const [isCourierLoading, setIsCourierLoading] = useState(false);

  // Admin state
  const [adminUsername, setAdminUsername] = useState('owner_laundrea');
  const [adminPassword, setAdminPassword] = useState('••••••••');
  const [isAdminLoading, setIsAdminLoading] = useState(false);

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

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    setAuthStep('form');
  };

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
        }, 800);
      }, 350);
    }
  };

  // Courier Login
  const handleCourierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierUsername.trim()) return;

    setIsCourierLoading(true);
    setTimeout(() => {
      setIsCourierLoading(false);
      loginCourier(courierUsername);
    }, 400);
  };

  // Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) return;

    setIsAdminLoading(true);
    setTimeout(() => {
      setIsAdminLoading(false);
      loginAdmin(adminUsername);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffecf2]/30 via-white to-gray-50 flex flex-col justify-between p-3.5 sm:p-6 lg:p-8">
      {/* Top Header & Step Indicator */}
      <div className="max-w-xl mx-auto w-full pt-2 sm:pt-4 text-center space-y-2.5">
        <div className="flex justify-center">
          <BrandWordmark size="xl" variant="pink" />
        </div>

        {/* 2-Step Flow Indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#ffecf2] rounded-full shadow-2xs text-[11px] font-semibold text-[#254117]">
          <span
            className={`flex items-center gap-1.5 ${
              authStep === 'role'
                ? 'text-[#cd6184] font-bold'
                : 'text-[#254117]/60'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                authStep === 'role'
                  ? 'bg-[#cd6184] text-white'
                  : 'bg-[#97a273] text-white'
              }`}
            >
              1
            </span>
            Pilih Peran
          </span>
          <ChevronRight className="w-3 h-3 text-[#254117]/30" />
          <span
            className={`flex items-center gap-1.5 ${
              authStep === 'form'
                ? 'text-[#cd6184] font-bold'
                : 'text-[#254117]/50'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                authStep === 'form'
                  ? 'bg-[#cd6184] text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </span>
            Masuk Akun
          </span>
        </div>
      </div>

      {/* STEP 1: ROLE SELECTION SCREEN (Standalone, Compact, Fits without scroll on mobile) */}
      {authStep === 'role' && (
        <div className="max-w-md mx-auto w-full my-auto py-3 space-y-4">
          <div className="text-center space-y-1">
            <h1 className="text-lg sm:text-2xl font-black text-[#254117]">
              Pilih Peran Anda
            </h1>
            <p className="text-xs text-[#254117]/70">
              Pilih akun yang sesuai untuk melanjutkan ke sistem:
            </p>
          </div>

          {/* 3 Compact Role Cards */}
          <div className="space-y-2.5">
            {/* Pelanggan */}
            <button
              id="role-select-customer"
              type="button"
              onClick={() => handleSelectRole('customer')}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-gray-200/90 hover:border-[#cd6184] active:scale-[0.99] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center shrink-0 group-hover:bg-[#cd6184] group-hover:text-white transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-[#254117] leading-tight">
                    Pelanggan
                  </h2>
                  <span className="text-[11px] font-semibold text-[#cd6184]">
                    Login via WhatsApp OTP
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#cd6184] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Kurir */}
            <button
              id="role-select-courier"
              type="button"
              onClick={() => handleSelectRole('courier')}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-gray-200/90 hover:border-sky-500 active:scale-[0.99] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-[#0284c7] group-hover:text-white transition-colors">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-[#254117] leading-tight">
                    Kurir
                  </h2>
                  <span className="text-[11px] font-semibold text-sky-700">
                    Username & Password
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>

            {/* Admin */}
            <button
              id="role-select-admin"
              type="button"
              onClick={() => handleSelectRole('admin')}
              className="w-full p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-gray-200/90 hover:border-[#254117] active:scale-[0.99] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#254117]/10 text-[#254117] flex items-center justify-center shrink-0 group-hover:bg-[#254117] group-hover:text-[#ffbd59] transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-[#254117] leading-tight">
                    Admin
                  </h2>
                  <span className="text-[11px] font-semibold text-[#254117]">
                    Username & Password
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#254117] group-hover:translate-x-0.5 transition-all shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: LOGIN FORM SCREEN (Standalone, Shown after Role Selection, with Back Button) */}
      {authStep === 'form' && (
        <div className="max-w-md mx-auto w-full my-auto py-2 space-y-3">
          {/* Back to Step 1 Button */}
          <div className="flex items-center justify-between">
            <button
              id="btn-back-to-roles"
              type="button"
              onClick={() => {
                setAuthStep('role');
                setOtpStep('phone');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#cd6184] hover:text-[#b85373] p-1 -ml-1 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ganti Peran</span>
            </button>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-[#254117]">
              {selectedRole === 'customer' && 'Peran: Pelanggan'}
              {selectedRole === 'courier' && 'Peran: Kurir'}
              {selectedRole === 'admin' && 'Peran: Admin'}
            </span>
          </div>

          {/* Form Box */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg border border-[#ffecf2] relative overflow-hidden">
            {/* ================= PELANGGAN (WhatsApp OTP) ================= */}
            {selectedRole === 'customer' && (
              <div className="space-y-4">
                {otpStep === 'success' ? (
                  <div className="py-6 text-center space-y-3">
                    <div className="w-14 h-14 bg-[#97a273]/20 text-[#97a273] rounded-full flex items-center justify-center mx-auto animate-bounce">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#97a273]">Verifikasi Berhasil!</h3>
                    <p className="text-xs text-[#254117]/70">
                      Selamat datang di Portal Pelanggan Laundrea. Mengalihkan ke dashboard...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#ffecf2] text-[#cd6184] flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#cd6184] uppercase tracking-wider">
                          Login Pelanggan via WhatsApp
                        </span>
                      </div>
                      <span className="text-[10px] text-[#254117]/60 font-medium">
                        Tanpa sandi
                      </span>
                    </div>

                    {otpStep === 'phone' ? (
                      <form onSubmit={handleSendOtp} className="space-y-3.5">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#254117]">
                            Nomor WhatsApp Anda
                          </h3>
                          <p className="text-xs text-[#254117]/70 mt-0.5">
                            Kode 6-digit OTP verifikasi akan dikirimkan otomatis ke WhatsApp Anda.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#254117] mb-1">
                            Nomor WhatsApp
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#254117]/40">
                              <Phone className="w-4 h-4" />
                            </div>
                            <input
                              type="tel"
                              value={waPhone}
                              onChange={(e) => setWaPhone(e.target.value)}
                              placeholder="Contoh: 081234567890"
                              required
                              className="w-full pl-10 pr-4 py-2.5 bg-[#ffecf2]/30 border border-[#cd6184]/30 rounded-xl text-[#254117] font-medium text-sm focus:outline-none focus:border-[#cd6184] focus:ring-2 focus:ring-[#cd6184]/20 transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-[#254117]/60 mt-1">
                            Nomor terdaftar akan langsung terhubung ke riwayat cucian & voucher Anda.
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
                      <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#254117]">
                            Masukkan Kode Verifikasi
                          </h3>
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
                            <p className="font-semibold text-[#254117]">Simulasi Notifikasi WA:</p>
                            <p className="text-[#254117]/80 mt-0.5">
                              Kode login: <span className="font-black text-[#cd6184] tracking-wider">{simulatedCode}</span>
                            </p>
                            <button
                              type="button"
                              onClick={() => setOtpCode(simulatedCode)}
                              className="mt-0.5 text-xs text-[#cd6184] font-semibold underline hover:text-[#254117] cursor-pointer"
                            >
                              Klik untuk isi otomatis ({simulatedCode})
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
                  </>
                )}
              </div>
            )}

            {/* ================= KURIR (Username & Password) ================= */}
            {selectedRole === 'courier' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">
                      Login Petugas Kurir
                    </span>
                  </div>
                  <span className="text-[10px] text-[#254117]/60 font-medium">
                    ID Lapangan
                  </span>
                </div>

                <form onSubmit={handleCourierLogin} className="space-y-3.5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#254117]">
                      Masuk Akun Kurir
                    </h3>
                    <p className="text-xs text-[#254117]/70 mt-0.5">
                      Gunakan kredensial akun kurir resmi Laundrea.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#254117] mb-1">
                      Username Kurir
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={courierUsername}
                        onChange={(e) => setCourierUsername(e.target.value)}
                        placeholder="ID Petugas Kurir"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#254117] mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={courierPassword}
                        onChange={(e) => setCourierPassword(e.target.value)}
                        placeholder="Kata sandi akun"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-100 text-[11px] text-sky-800">
                    <span className="font-semibold">Info Demo:</span> Username: <code className="font-bold">kurir_dimas</code>, password terisi otomatis.
                  </div>

                  <button
                    id="btn-courier-login"
                    type="submit"
                    disabled={isCourierLoading}
                    className="w-full py-3 px-5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isCourierLoading ? (
                      <span>Memproses Masuk...</span>
                    ) : (
                      <>
                        <span>Masuk Portal Kurir</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ================= ADMIN (Username & Password) ================= */}
            {selectedRole === 'admin' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#254117] text-[#ffbd59] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#254117] uppercase tracking-wider">
                      Login Administrator
                    </span>
                  </div>
                  <span className="text-[10px] text-[#254117]/60 font-medium">
                    Akses Gerai
                  </span>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3.5">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#254117]">
                      Masuk Dashboard Admin
                    </h3>
                    <p className="text-xs text-[#254117]/70 mt-0.5">
                      Akses kontrol operasional cucian & laporan finansial.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#254117] mb-1">
                      Username Admin
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        placeholder="ID Akun Admin"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#254117] mb-1">
                      Password Admin
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Kata sandi admin"
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#ffecf2]/60 rounded-xl border border-[#cd6184]/20 text-[11px] text-[#cd6184]">
                    <span className="font-semibold">Info Demo:</span> Username: <code className="font-bold">owner_laundrea</code>, password terisi otomatis.
                  </div>

                  <button
                    id="btn-admin-login"
                    type="submit"
                    disabled={isAdminLoading}
                    className="w-full py-3 px-5 rounded-xl bg-[#254117] hover:bg-[#1a2f10] text-[#ffbd59] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isAdminLoading ? (
                      <span>Memverifikasi Akses...</span>
                    ) : (
                      <>
                        <span>Masuk Dashboard Admin</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-md mx-auto w-full pb-2 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-3 text-[11px] text-[#254117]/60">
          <span>Laundrea v2.4</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kembalikan seluruh data demo ke kondisi awal?')) {
                resetAllData();
                setAuthStep('role');
              }
            }}
            className="hover:text-[#cd6184] transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
        </div>
        <p className="text-[10px] text-[#254117]/40">
          © Laundrea — Layanan Laundry & Dry Cleaning Modern.
        </p>
      </div>
    </div>
  );
};
