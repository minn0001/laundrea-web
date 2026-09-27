import React, { useState } from 'react';
import { BrandWordmark } from '../common/BrandWordmark';
import { Truck, Lock, User, ArrowRight } from 'lucide-react';

interface CourierLoginProps {
  onLogin: (username: string) => void;
}

export const CourierLogin: React.FC<CourierLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('kurir_dimas');
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
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 bg-gray-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6">
          <BrandWordmark size="lg" variant="pink" />
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-[#ffecf2] rounded-full text-[#cd6184] text-xs font-bold">
            <Truck className="w-3.5 h-3.5" />
            <span>Portal Operasional Kurir</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ID Petugas Kurir"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]"
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
                placeholder="Kata sandi akun"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#254117] text-sm font-medium focus:outline-none focus:border-[#cd6184] focus:ring-1 focus:ring-[#cd6184]"
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
              <span>Memproses...</span>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[11px] text-[#254117]/60">
          Akun kurir dikonfigurasi secara internal oleh manajemen Laundrea.
        </div>
      </div>
    </div>
  );
};
