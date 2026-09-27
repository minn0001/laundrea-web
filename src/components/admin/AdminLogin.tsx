import React, { useState } from 'react';
import { BrandWordmark } from '../common/BrandWordmark';
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('owner_laundrea');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(username);
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-gray-50/60">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-6">
          <BrandWordmark size="lg" variant="pink" />
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#254117] rounded-full text-[#ffbd59] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dashboard Pemilik / Admin</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ID Akun Admin"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                required
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata sandi admin"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-[#254117]/60">
          Akses khusus pemilik bisnis & operasional pusat Laundrea.
        </div>
      </div>
    </div>
  );
};
