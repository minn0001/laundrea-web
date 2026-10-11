import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Phone, MapPin, Calendar, AlertCircle, Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import {
  subscribeToCustomers,
  normalizePhoneNumber,
  seedSampleCustomersIfMissing,
  CustomerFirestoreData,
} from '../../services/firebaseService';

export const AdminCustomersPage: React.FC = () => {
  const { orders } = useApp();
  const [firestoreCustomers, setFirestoreCustomers] = useState<CustomerFirestoreData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Subscribe to live Firestore customers collection
  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);

    // Ensure seed customers exist in Firestore on boot
    seedSampleCustomersIfMissing().catch(() => {});

    const unsubscribe = subscribeToCustomers(
      (data) => {
        setFirestoreCustomers(data);
        setIsLoading(false);
        setErrorMessage(null);
      },
      (err) => {
        console.error('Firestore live subscription error:', err);
        setIsLoading(false);
        setErrorMessage('Gagal terhubung ke Firestore, silakan coba lagi.');
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter by search box (name or phone)
  const filteredCustomers = firestoreCustomers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = c.name.toLowerCase().includes(q);
    const rawPhoneMatch = c.phone.toLowerCase().includes(q);
    const normPhoneMatch = normalizePhoneNumber(c.phone).includes(normalizePhoneNumber(q));
    return nameMatch || rawPhoneMatch || normPhoneMatch;
  });

  // Compute order statistics per customer from existing orders data matched by normalized phone
  const getCustomerOrderStats = (phone: string) => {
    const normPhone = normalizePhoneNumber(phone);
    const matchedOrders = orders.filter(
      (o) => normalizePhoneNumber(o.customerPhone) === normPhone
    );

    const totalOrders = matchedOrders.length;

    let lastOrderDate = '-';
    if (matchedOrders.length > 0) {
      // Find latest pickupDate or timestamp
      const sorted = [...matchedOrders].sort((a, b) => {
        const da = a.pickupDate || a.statusTimestamps?.booked || '';
        const db = b.pickupDate || b.statusTimestamps?.booked || '';
        return db.localeCompare(da);
      });
      lastOrderDate = sorted[0].pickupDate || sorted[0].statusTimestamps?.booked?.split(' ')[0] || '-';
    }

    return { totalOrders, lastOrderDate };
  };

  // Helper to format registration date
  const formatRegistrationDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr;
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#254117]">Data Pelanggan</h1>
          <p className="text-xs text-[#254117]/65 mt-0.5">
            Daftar akun pelanggan terdaftar tersinkronisasi langsung dari Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-[#ffecf2] text-[#cd6184] font-bold">
            Total {filteredCustomers.length} Pelanggan
          </span>
        </div>
      </div>

      {/* Friendly Indonesian error notification if Firestore cannot be reached */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between gap-3 text-red-700 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span className="font-bold block">Gagal terhubung ke data pelanggan</span>
              <span className="text-red-600/80">{errorMessage}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsLoading(true);
              setErrorMessage(null);
              seedSampleCustomersIfMissing().catch(() => {});
            }}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* Search Box (name or phone) */}
      <div className="bg-white p-3 rounded-2xl border border-gray-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari pelanggan berdasarkan nama atau nomor telepon..."
          className="w-full text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#cd6184] animate-spin mx-auto" />
            <p className="text-xs text-[#254117]/70 font-medium">
              Memuat data akun pelanggan dari Firestore...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-14 text-center space-y-2">
            <p className="text-xs text-[#254117]/60 font-medium">
              {searchQuery
                ? `Tidak ada pelanggan yang cocok dengan pencarian "${searchQuery}".`
                : 'Belum ada akun pelanggan terdaftar di Firestore.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#ffecf2]/50 text-[#254117] border-b border-gray-100 font-bold">
                <tr>
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Nomor Telepon</th>
                  <th className="py-3.5 px-4">Alamat Penjemputan</th>
                  <th className="py-3.5 px-4">Tanggal Daftar</th>
                  <th className="py-3.5 px-4 text-center">Total Pesanan</th>
                  <th className="py-3.5 px-4">Terakhir Pesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => {
                  const { totalOrders, lastOrderDate } = getCustomerOrderStats(customer.phone);

                  return (
                    <tr
                      key={normalizePhoneNumber(customer.phone) || customer.phone}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-4 font-bold text-[#254117]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#ffecf2] text-[#cd6184] flex items-center justify-center font-bold text-xs shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold">{customer.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 text-[#254117]">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-[#97a273] shrink-0" />
                          <span>{customer.phone}</span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-4 text-[#254117]/80">
                        <div className="flex items-start gap-1.5 max-w-[260px]">
                          <MapPin className="w-3.5 h-3.5 text-[#cd6184]/70 shrink-0 mt-0.5" />
                          <span className="text-[11px] line-clamp-2">{customer.address}</span>
                        </div>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4 text-[#254117]/70 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{formatRegistrationDate(customer.createdAt)}</span>
                        </div>
                      </td>

                      {/* Total Orders (computed from orders) */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 font-extrabold text-[#254117] text-xs">
                          {totalOrders}×
                        </span>
                      </td>

                      {/* Last Order Date (computed from orders) */}
                      <td className="py-4 px-4 text-[11px] text-[#254117]/70 font-medium">
                        {lastOrderDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
