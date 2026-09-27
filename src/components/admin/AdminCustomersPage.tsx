import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Crown, Phone, MapPin, Calendar, Award } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { customers } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#254117]">Data Pelanggan</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#ffecf2] text-[#cd6184] font-bold">
            Total {customers.length} Pelanggan
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pelanggan berdasarkan nama, nomor telepon, atau alamat..."
          className="w-full text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {/* Customer Cards & Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#ffecf2]/50 text-[#254117] border-b border-gray-100 font-bold">
              <tr>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Kontak & Alamat</th>
                <th className="py-3.5 px-4 text-center">Total Pesanan</th>
                <th className="py-3.5 px-4">Terakhir Pesan</th>
                <th className="py-3.5 px-4 text-right">Total Akumulasi</th>
                <th className="py-3.5 px-4 text-center">Tingkat Loyalitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map((customer) => {
                const isLoyal = customer.totalOrders >= 4;
                const isVIP = customer.totalOrders >= 7;

                return (
                  <tr key={customer.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#254117]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#ffecf2] text-[#cd6184] flex items-center justify-center font-bold text-xs shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <span className="block font-bold">{customer.name}</span>
                          <span className="text-[10px] text-gray-400 font-normal">ID: {customer.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-[#254117]/80">
                      <div className="flex items-center gap-1 font-semibold text-[#254117]">
                        <Phone className="w-3 h-3 text-[#97a273]" />
                        <span>{customer.phone}</span>
                      </div>
                      <span className="text-[11px] text-[#254117]/60 block line-clamp-1 max-w-[240px]">
                        {customer.address}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-gray-100 font-extrabold text-[#254117] text-xs">
                        {customer.totalOrders}×
                      </span>
                    </td>

                    <td className="py-4 px-4 text-[11px] text-[#254117]/70 font-medium">
                      {customer.lastOrderDate}
                    </td>

                    <td className="py-4 px-4 text-right font-extrabold text-[#cd6184]">
                      Rp {customer.totalSpent.toLocaleString('id-ID')}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {isVIP ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffbd59]/30 text-[#254117] text-[10px] font-extrabold uppercase tracking-wide">
                          <Crown className="w-3 h-3 text-[#ffbd59] fill-[#ffbd59]" />
                          VIP Loyal
                        </span>
                      ) : isLoyal ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#97a273]/20 text-[#97a273] text-[10px] font-bold uppercase">
                          <Award className="w-3 h-3" />
                          Repeat
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">Pelanggan Baru</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
