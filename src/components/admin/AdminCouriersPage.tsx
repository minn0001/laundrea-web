import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Truck,
  Phone,
  CheckCircle2,
  XCircle,
  Plus,
  Shield,
  MapPin,
  Search,
  MessageSquare,
  Package,
  Clock,
  UserCheck,
  UserX,
} from 'lucide-react';

export const AdminCouriersPage: React.FC = () => {
  const { couriers, orders, addCourier, toggleCourierStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Performance metrics
  const activeCouriers = couriers.filter((c) => c.status === 'active');
  const inactiveCouriers = couriers.filter((c) => c.status === 'inactive');

  const totalAssignedTasks = orders.filter(
    (o) => o.courierId && o.status !== 'delivered'
  ).length;

  const filteredCouriers = couriers.filter((courier) => {
    const matchesSearch =
      courier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      courier.phone.includes(searchQuery) ||
      (courier.vehicle && courier.vehicle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || courier.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addCourier({
      name: newName.trim(),
      phone: newPhone.trim(),
      vehicle: newVehicle.trim() || 'Motor Honda Vario (B 1234 XYZ)',
      email: newEmail.trim() || undefined,
    });

    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewVehicle('');
    setNewEmail('');
  };

  return (
    <div id="admin-couriers-page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#254117]">Kelola Armada Kurir</h1>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kurir Baru</span>
        </button>
      </div>

      {/* Summary metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-[#97a273]/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#97a273] uppercase tracking-wider">
              Kurir Aktif Bertugas
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#97a273]/20 text-[#97a273] flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#254117]">
            {activeCouriers.length} <span className="text-xs font-normal text-gray-500">petugas</span>
          </div>
          <p className="text-[11px] text-[#254117]/60 mt-1">Siap menerima pesanan jemput & antar</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#cd6184]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#cd6184] uppercase tracking-wider">
              Tugas Berlangsung
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#cd6184]">
            {totalAssignedTasks} <span className="text-xs font-normal text-gray-500">pesanan</span>
          </div>
          <p className="text-[11px] text-[#254117]/60 mt-1">Sedang dalam proses jemput atau antar</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-[#97a273]/30 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#254117] uppercase tracking-wider">
              Pesanan Selesai Diantar
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#97a273]/20 text-[#97a273] flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#97a273]" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#254117] flex items-center gap-1.5">
            <span>{orders.filter((o) => o.status === 'delivered').length}</span>
            <span className="text-xs font-normal text-gray-500">pesanan sukses</span>
          </div>
          <p className="text-[11px] text-[#97a273] font-semibold mt-1">Armada operasional tepat waktu</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-white p-2.5 rounded-2xl border border-gray-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kurir berdasarkan nama, nomor telepon, atau kendaraan..."
            className="w-full text-xs font-medium text-[#254117] placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#ffecf2] p-1 rounded-2xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'text-[#254117]/70'
            }`}
          >
            Semua ({couriers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'text-[#254117]/70'
            }`}
          >
            Aktif ({activeCouriers.length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'inactive'
                ? 'bg-[#cd6184] text-white shadow-xs'
                : 'text-[#254117]/70'
            }`}
          >
            Nonaktif ({inactiveCouriers.length})
          </button>
        </div>
      </div>

      {/* Courier Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCouriers.map((courier) => {
          // Live assigned orders carried/handled by this courier
          const carriedOrders = orders.filter(
            (o) => o.courierId === courier.id && o.status !== 'delivered'
          );

          const completedCount = orders.filter(
            (o) => o.courierId === courier.id && o.status === 'delivered'
          ).length;

          return (
            <div
              key={courier.id}
              className="bg-white p-5 rounded-3xl border-2 border-gray-200 hover:border-[#cd6184]/40 shadow-xs space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3.5">
                {/* Top status & avatar */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#ffecf2] text-[#cd6184] flex items-center justify-center font-black text-sm border border-[#cd6184]/20">
                      {courier.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#254117] leading-tight">{courier.name}</h3>
                      <span className="text-[11px] text-[#254117]/60 block mt-0.5">
                        {courier.vehicle || 'Sepeda Motor Pribadi'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      courier.status === 'active'
                        ? 'bg-[#97a273]/20 text-[#97a273]'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {courier.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Details & Contacts */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-[#254117]/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-semibold text-[#254117]">{courier.phone}</span>
                    </div>
                    <a
                      href={`https://wa.me/${courier.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-[#97a273] text-white font-bold text-[11px] flex items-center gap-1 shadow-xs hover:bg-[#859062]"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-[#ffecf2]/50 rounded-xl border border-[#cd6184]/15">
                      <span className="text-[10px] text-[#254117]/70 block">Tugas Berjalan:</span>
                      <span className="font-extrabold text-[#cd6184] text-sm">
                        {carriedOrders.length} order
                      </span>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-[#254117]/70 block">Selesai:</span>
                      <span className="font-extrabold text-[#254117] text-sm">
                        {completedCount} order
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pesanan yang Sedang Dibawa Kurir */}
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#254117] flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#cd6184]" />
                      <span>Pesanan yang Sedang Dibawa:</span>
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        carriedOrders.length > 0
                          ? 'bg-[#ffecf2] text-[#cd6184]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {carriedOrders.length} Pesanan
                    </span>
                  </div>

                  {carriedOrders.length === 0 ? (
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500 text-center italic">
                      Saat ini tidak ada pesanan yang sedang dibawa (Kurir Standby di Gerai).
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                      {carriedOrders.map((ord) => {
                        const isPickup = ord.status === 'pickup';
                        const isReady = ord.status === 'ready';

                        return (
                          <div
                            key={ord.id}
                            className="p-3 rounded-2xl bg-[#fafafa] border border-gray-200/90 hover:border-[#cd6184]/50 transition-all text-xs space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div>
                                <span className="font-black text-[#254117] block text-xs leading-tight">
                                  {ord.customerName}
                                </span>
                                <span className="text-[10px] text-gray-500 font-mono font-medium">
                                  {ord.orderNumber}
                                </span>
                              </div>
                              <span
                                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                                  isPickup
                                    ? 'bg-amber-100 text-amber-800'
                                    : isReady
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {isPickup
                                  ? 'Jemput Cucian'
                                  : isReady
                                  ? 'Antar Pakaian'
                                  : ord.status === 'washing'
                                  ? 'Pencucian'
                                  : ord.status === 'drying'
                                  ? 'Pengeringan'
                                  : ord.status === 'ironing'
                                  ? 'Penyetrikaan'
                                  : ord.status}
                              </span>
                            </div>

                            {/* Alamat Pelanggan */}
                            <div className="flex items-start gap-1.5 text-[11px] text-gray-600">
                              <MapPin className="w-3 h-3 text-[#cd6184] shrink-0 mt-0.5" />
                              <span className="line-clamp-2 leading-tight">
                                {ord.customerAddress || 'Alamat penjemputan / pengantaran'}
                              </span>
                            </div>

                            {/* Paket & Berat + Link WhatsApp Pelanggan */}
                            <div className="flex items-center justify-between pt-1 border-t border-gray-200/70 text-[10px] text-gray-500">
                              <span>
                                {ord.planName} •{' '}
                                <strong className="text-[#254117]">
                                  {ord.actualQuantity || ord.estimatedQuantity} {ord.unit}
                                </strong>
                              </span>
                              <a
                                href={`https://wa.me/${ord.customerPhone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#97a273] hover:underline font-bold flex items-center gap-1"
                                title="WhatsApp Pelanggan"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>Hubungi Pelanggan</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => toggleCourierStatus(courier.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    courier.status === 'active'
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-[#97a273] bg-[#97a273]/10 text-[#97a273] hover:bg-[#97a273]/20'
                  }`}
                >
                  {courier.status === 'active' ? 'Nonaktifkan Kurir' : 'Aktifkan Kurir'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Courier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#254117]">Tambah Anggota Kurir Baru</h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffecf2] text-[#cd6184]">
                Armada Laundrea
              </span>
            </div>

            <form onSubmit={handleAddCourier} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Nama Lengkap Petugas Kurir
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Permana"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#cd6184]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Nomor WhatsApp Aktif
                </label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="Contoh: 0812-3344-5566"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#cd6184]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Kendaraan & Nomor Polisi
                </label>
                <input
                  type="text"
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  placeholder="Contoh: Yamaha NMAX (B 6543 TGB)"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#cd6184]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#254117] mb-1">
                  Email Internal (Opsional)
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rian.permana@laundrea.id"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#cd6184]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-[#cd6184] hover:bg-[#b85373] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Simpan Kurir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
