import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandWordmark } from '../common/BrandWordmark';
import {
  Truck,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface StaffLoginPortalProps {
  onNavigateCustomer?: () => void;
}

export const StaffLoginPortal: React.FC<StaffLoginPortalProps> = ({
  onNavigateCustomer,
}) => {
  const { loginCourier, loginAdmin, resetAllData } = useApp();

  // Simple role toggle between Kurir and Admin ONLY (No Pelanggan here)
  const [activeStaffRole, setActiveStaffRole] = useState<'courier' | 'admin'>('courier');

  // Courier state
  const [courierUsername, setCourierUsername] = useState('kurir_dimas');
  const [courierPassword, setCourierPassword] = useState('••••••••');
  const [isCourierLoading, setIsCourierLoading] = useState(false);

  // Admin state
  const [adminUsername, setAdminUsername] = useState('owner_laundrea');
  const [adminPassword, setAdminPassword] = useState('••••••••');
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // Handle Courier Login
  const handleCourierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courierUsername.trim()) return;

    setIsCourierLoading(true);
    setTimeout(() => {
      setIsCourierLoading(false);
      loginCourier(courierUsername);
    }, 400);
  };

  // Handle Admin Login
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-50 flex flex-col justify-between p-3.5 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full pt-3 sm:pt-6 text-center space-y-2">
        <div className="flex justify-center">
          <BrandWordmark size="xl" variant="pink" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#254117] text-[#ffbd59] rounded-full text-xs font-bold tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PORTAL STAF & OPERASIONAL (/staff)</span>
        </div>
        <p className="text-xs text-[#254117]/70">
          Khusus staf Kurir & Administrator Laundrea
        </p>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full my-auto py-3 space-y-4">
        {/* Simple Role Toggle: Kurir vs Admin ONLY */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1.5 border border-gray-200 shadow-2xs">
          <button
            id="tab-toggle-courier"
            type="button"
            onClick={() => setActiveStaffRole('courier')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeStaffRole === 'courier'
                ? 'bg-[#254117] text-[#ffbd59] shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Kurir Lapangan</span>
          </button>

          <button
            id="tab-toggle-admin"
            type="button"
            onClick={() => setActiveStaffRole('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeStaffRole === 'admin'
                ? 'bg-[#254117] text-[#ffbd59] shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Administrator</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-200 relative overflow-hidden">
          {/* ================= KURIR LOGIN FORM ================= */}
          {activeStaffRole === 'courier' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#254117] text-[#ffbd59] flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#254117] uppercase tracking-wider block">
                      Login Petugas Kurir
                    </span>
                    <span className="text-[10px] text-[#254117]/60 font-medium">
                      Penjemputan & Pengantaran
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#254117] bg-[#ffbd59]/25 px-2 py-0.5 rounded-full border border-[#ffbd59]/40">
                  ID Lapangan
                </span>
              </div>

              <form onSubmit={handleCourierLogin} className="space-y-3.5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#254117]">
                    Masuk Akun Kurir
                  </h2>
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
                      id="input-courier-username"
                      type="text"
                      value={courierUsername}
                      onChange={(e) => setCourierUsername(e.target.value)}
                      placeholder="ID Petugas Kurir"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#254117] focus:ring-2 focus:ring-[#254117]/20 transition-all"
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
                      id="input-courier-password"
                      type="password"
                      value={courierPassword}
                      onChange={(e) => setCourierPassword(e.target.value)}
                      placeholder="Kata sandi akun"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#254117] focus:ring-2 focus:ring-[#254117]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-[#254117]/10 rounded-xl border border-[#254117]/20 text-[11px] text-[#254117]">
                  <span className="font-semibold">Info Demo:</span> Username: <code className="font-bold">kurir_dimas</code>, password terisi otomatis.
                </div>

                <button
                  id="btn-courier-login"
                  type="submit"
                  disabled={isCourierLoading}
                  className="w-full py-3 px-5 rounded-xl bg-[#254117] hover:bg-[#1a2f10] active:scale-[0.99] text-[#ffbd59] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

          {/* ================= ADMIN LOGIN FORM ================= */}
          {activeStaffRole === 'admin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#254117] text-[#ffbd59] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#254117] uppercase tracking-wider block">
                      Login Administrator
                    </span>
                    <span className="text-[10px] text-[#254117]/60 font-medium">
                      Manajemen Gerai & Laporan
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#254117] bg-[#ffbd59]/25 px-2 py-0.5 rounded-full border border-[#ffbd59]/40">
                  Akses Gerai
                </span>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#254117]">
                    Masuk Dashboard Admin
                  </h2>
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
                      id="input-admin-username"
                      type="text"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="ID Akun Admin"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#254117] focus:ring-2 focus:ring-[#254117]/20 transition-all"
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
                      id="input-admin-password"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Kata sandi admin"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#254117] focus:ring-2 focus:ring-[#254117]/20 transition-all"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-[#254117]/10 rounded-xl border border-[#254117]/20 text-[11px] text-[#254117]">
                  <span className="font-semibold">Info Demo:</span> Username: <code className="font-bold">owner_laundrea</code>, password terisi otomatis.
                </div>

                <button
                  id="btn-admin-login"
                  type="submit"
                  disabled={isAdminLoading}
                  className="w-full py-3 px-5 rounded-xl bg-[#254117] hover:bg-[#1a2f10] active:scale-[0.99] text-[#ffbd59] font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
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

      {/* Footer */}
          <div className="max-w-md mx-auto w-full pb-2 text-center">
        <span className="text-[11px] text-[#254117]/60">Laundrea v2.4</span>
      </div>
    </div>
  );
};
