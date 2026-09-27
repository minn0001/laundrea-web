import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SystemUser, SystemRole, SystemUserCategory, PermissionModule } from '../../types';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  KeyRound,
  Lock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Edit3,
  Trash2,
  Power,
  Copy,
  Check,
  Truck,
  UserCheck,
  AlertCircle,
  Layers,
  Phone,
  Mail,
  Building2,
  BadgeCheck,
  Save,
  RotateCcw,
  Plus,
  X,
  Smartphone,
} from 'lucide-react';

export const AdminSystemSettingsPage: React.FC = () => {
  const {
    systemUsers,
    systemRoles,
    systemPermissions,
    addSystemUser,
    updateSystemUser,
    toggleSystemUserStatus,
    deleteSystemUser,
    resetUserPasswordOrPin,
    updateRolePermissions,
    addSystemRole,
  } = useApp();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'matrix'>('users');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // TAB 1: USER MANAGEMENT STATE
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SystemUserCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Modals for User Management
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [resetModalUserId, setResetModalUserId] = useState<string | null>(null);
  const [deleteConfirmUserId, setDeleteConfirmUserId] = useState<string | null>(null);

  // Form state for add/edit user
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    roleCategory: 'admin' as SystemUserCategory,
    roleId: 'admin_operasional',
    status: 'active' as 'active' | 'inactive',
    assignedBranch: 'Cabang Senopati (Pusat)',
    vehicleInfo: '',
    twoFactorEnabled: true,
    initialPassword: '',
  });

  // Reset modal state
  const [tempPassword, setTempPassword] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  // -------------------------------------------------------------
  // TAB 2: ROLES & PERMISSIONS STATE
  // -------------------------------------------------------------
  const [selectedRoleId, setSelectedRoleId] = useState<string>('super_admin');
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    category: 'admin' as SystemUserCategory,
    description: '',
    badgeColor: 'emerald',
  });

  // Active role data
  const selectedRole = systemRoles.find((r) => r.id === selectedRoleId) || systemRoles[0];
  const [draftPermissions, setDraftPermissions] = useState<string[]>(
    selectedRole ? selectedRole.permissions : []
  );

  // Sync draft permissions when role changes
  React.useEffect(() => {
    if (selectedRole) {
      setDraftPermissions(selectedRole.permissions);
    }
  }, [selectedRoleId, systemRoles]);

  // Handle toggle of single permission
  const handleTogglePermission = (permId: string) => {
    if (selectedRole?.id === 'super_admin') {
      showToast('Peran Super Admin memiliki hak akses penuh permanen.');
      return;
    }

    setDraftPermissions((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveRolePermissions = () => {
    if (!selectedRole) return;
    updateRolePermissions(selectedRole.id, draftPermissions);
    showToast(`Hak akses peran "${selectedRole.name}" berhasil diperbarui!`);
  };

  // -------------------------------------------------------------
  // USER MODAL ACTIONS
  // -------------------------------------------------------------
  const handleOpenAddUser = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      phone: '',
      roleCategory: 'admin',
      roleId: 'admin_operasional',
      status: 'active',
      assignedBranch: 'Cabang Senopati (Pusat)',
      vehicleInfo: '',
      twoFactorEnabled: true,
      initialPassword: 'Laundrea' + Math.floor(100 + Math.random() * 900) + '!',
    });
    setEditingUserId(null);
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      roleCategory: user.roleCategory,
      roleId: user.roleId,
      status: user.status,
      assignedBranch: user.assignedBranch || 'Cabang Senopati (Pusat)',
      vehicleInfo: user.vehicleInfo || '',
      twoFactorEnabled: user.twoFactorEnabled,
      initialPassword: '',
    });
    setEditingUserId(user.id);
    setIsAddUserModalOpen(true);
  };

  const handleSubmitUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.phone.trim()) {
      alert('Nama lengkap, username, dan nomor telepon wajib diisi.');
      return;
    }

    if (editingUserId) {
      updateSystemUser(editingUserId, {
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roleCategory: formData.roleCategory,
        roleId: formData.roleId,
        status: formData.status,
        assignedBranch: formData.assignedBranch,
        vehicleInfo: formData.vehicleInfo,
        twoFactorEnabled: formData.twoFactorEnabled,
      });
      showToast('Data pengguna berhasil diperbarui.');
    } else {
      addSystemUser({
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim() || `${formData.username.toLowerCase()}@laundrea.id`,
        phone: formData.phone.trim(),
        roleCategory: formData.roleCategory,
        roleId: formData.roleId,
        status: formData.status,
        assignedBranch: formData.assignedBranch,
        vehicleInfo: formData.vehicleInfo,
        twoFactorEnabled: formData.twoFactorEnabled,
        lastLogin: 'Belum pernah login',
      });
      showToast(`Pengguna baru "${formData.name}" berhasil didaftarkan.`);
    }

    setIsAddUserModalOpen(false);
  };

  const handleOpenResetModal = (user: SystemUser) => {
    setResetModalUserId(user.id);
    setTempPassword('Lnd' + Math.floor(1000 + Math.random() * 9000) + '!');
    setCopiedSecret(false);
  };

  const handleConfirmReset = () => {
    if (!resetModalUserId) return;
    resetUserPasswordOrPin(resetModalUserId, tempPassword);
    showToast('Kredensial login berhasil diperbarui dan dikonfirmasi.');
    setResetModalUserId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmUserId) return;
    const userToDelete = systemUsers.find((u) => u.id === deleteConfirmUserId);
    if (userToDelete?.username === 'owner_laundrea') {
      alert('Akun Utama Owner tidak dapat dihapus demi keamanan sistem.');
      setDeleteConfirmUserId(null);
      return;
    }
    deleteSystemUser(deleteConfirmUserId);
    showToast('Akun staf pengguna berhasil dihapus dari sistem.');
    setDeleteConfirmUserId(null);
  };

  // Filtered users
  const filteredUsers = systemUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);

    const matchesCategory = categoryFilter === 'all' || user.roleCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesRole;
  });

  // Calculate high-level stats based on role configuration
  const superAdminCount = systemUsers.filter((u) => u.roleId === 'super_admin').length;
  const adminOperasionalCount = systemUsers.filter((u) => u.roleId === 'admin_operasional').length;
  const courierUsersCount = systemUsers.filter((u) => u.roleCategory === 'courier').length;
  const totalUsersCount = systemUsers.length;
  const activeUsersCount = systemUsers.filter((u) => u.status === 'active').length;
  const twoFaUsersCount = systemUsers.filter((u) => u.twoFactorEnabled).length;

  // Group permissions by module
  const moduleTitles: Record<PermissionModule, { title: string; desc: string }> = {
    operasional: {
      title: 'Modul Operasional & Alur Cucian',
      desc: 'Pengelolaan pesanan, timbang kiloan, workflow cuci/setrika & kurir',
    },
    keuangan: {
      title: 'Modul Kasir & Finansial',
      desc: 'Konfirmasi pembayaran QRIS/Tunai, laporan laba rugi, dan biaya operasional',
    },
    promosi: {
      title: 'Modul Tarif & Promosi',
      desc: 'Konfigurasi harga per kg, voucher diskon promo, dan stamp reward',
    },
    sistem: {
      title: 'Modul Administrasi Sistem & Keamanan',
      desc: 'Manajemen akun staf Admin & Kurir, matriks hak akses, serta audit log',
    },
  };

  const permissionsByModule = {
    operasional: systemPermissions.filter((p) => p.module === 'operasional'),
    keuangan: systemPermissions.filter((p) => p.module === 'keuangan'),
    promosi: systemPermissions.filter((p) => p.module === 'promosi'),
    sistem: systemPermissions.filter((p) => p.module === 'sistem'),
  };

  return (
    <div id="admin-system-settings-page" className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#254117] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold border border-[#97a273]/40 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-[#ffbd59] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#254117] tracking-tight">
            Pengaturan Sistem & Hak Akses
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handleOpenAddUser}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#254117] hover:bg-[#3b6624] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#ffbd59]" />
            <span>Tambah Pengguna</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards: 1 Super Admin, 2 Admin Kasir & Operasional, 2 Kurir, Total */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Super Admin Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Super Admin</span>
            <div className="p-2 rounded-xl bg-[#ffecf2] text-[#cd6184]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#cd6184]">
              {superAdminCount} <span className="text-xs font-bold text-gray-500">Orang</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Owner / Kepala Toko Utama
            </div>
          </div>
        </div>

        {/* Admin Kasir & Operasional Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Admin Kasir & Operasional</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#254117]">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#254117]">
              {adminOperasionalCount} <span className="text-xs font-bold text-gray-500">Orang</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Shift Pagi (Senopati) & Sore (Menteng)
            </div>
          </div>
        </div>

        {/* Courier Staff Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Kurir</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-700">
              {courierUsersCount} <span className="text-xs font-bold text-gray-500">Orang</span>
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Pickup & Delivery (Jaksel & Jakpus)
            </div>
          </div>
        </div>

        {/* Total Internal Staff */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">Total Staf Pengguna</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-[#254117]">
              {totalUsersCount} <span className="text-xs font-bold text-gray-500">Orang</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {activeUsersCount} Aktif &bull; {twoFaUsersCount} Ber-PIN Keamanan
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 gap-2 sm:gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-[#254117] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#254117] hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Manajemen Pengguna (Admin & Kurir)</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {systemUsers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roles'
              ? 'bg-[#254117] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#254117] hover:bg-gray-100'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Peran dan Hak Akses</span>
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/20">
            {systemRoles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'matrix'
              ? 'bg-[#254117] text-white shadow-xs'
              : 'text-gray-600 hover:text-[#254117] hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriks hak akses</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MANAJEMEN PENGGUNA */}
      {/* ========================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama staf, @username, email, atau nomor HP..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] bg-gray-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#254117] cursor-pointer focus:outline-hidden focus:border-[#254117]"
              >
                <option value="all">Semua Kategori</option>
                <option value="admin">Khusus Staf Admin</option>
                <option value="courier">Khusus Staf Kurir</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#254117] cursor-pointer focus:outline-hidden focus:border-[#254117]"
              >
                <option value="all">Semua Status</option>
                <option value="active">Status Aktif</option>
                <option value="inactive">Status Nonaktif</option>
              </select>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-[#254117] cursor-pointer focus:outline-hidden focus:border-[#254117]"
              >
                <option value="all">Semua Peran</option>
                {systemRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User List Table / Cards */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Pengguna & Akun</th>
                    <th className="py-3.5 px-4">Kontak & Cabang</th>
                    <th className="py-3.5 px-4">Peran & Kategori</th>
                    <th className="py-3.5 px-4">Status & 2FA</th>
                    <th className="py-3.5 px-4">Terakhir Login</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="font-semibold text-gray-600">Tidak ada pengguna ditemukan</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Coba ubah kata kunci pencarian atau filter yang dipilih
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleObj = systemRoles.find((r) => r.id === user.roleId);
                      const isOwner = user.username === 'owner_laundrea';

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-gray-50/70 transition-colors group"
                        >
                          {/* User identity */}
                          <td className="py-4 px-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-2xl bg-linear-to-br ${
                                  user.avatarBg || 'from-[#254117] to-[#cd6184]'
                                } text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0`}
                              >
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-[#254117] flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {isOwner && (
                                    <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-[#ffbd59] text-[#254117] rounded-md tracking-wider uppercase">
                                      Owner
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-gray-500 font-mono">
                                  @{user.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Contact & Branch */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <div className="text-xs font-semibold text-[#254117] flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{user.phone}</span>
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 truncate max-w-[200px]">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <span>{user.email}</span>
                              </div>
                              <div className="text-[11px] text-[#254117]/80 font-medium">
                                {user.assignedBranch || 'Pusat'}
                                {user.vehicleInfo && (
                                  <span className="text-gray-500 block text-[10px]">
                                    {user.vehicleInfo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Role & Category */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
                                  user.roleCategory === 'admin'
                                    ? 'bg-[#ffecf2] text-[#cd6184] border border-[#cd6184]/20'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                {user.roleCategory === 'admin' ? (
                                  <Building2 className="w-3 h-3" />
                                ) : (
                                  <Truck className="w-3 h-3" />
                                )}
                                <span>{roleObj?.name || user.roleId}</span>
                              </span>
                              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                                {user.roleCategory === 'admin' ? 'Staf Admin' : 'Staf Kurir'}
                              </div>
                            </div>
                          </td>

                          {/* Status & 2FA */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <button
                                onClick={() => toggleSystemUserStatus(user.id)}
                                title="Klik untuk mengubah status aktif/nonaktif"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  user.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    user.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
                                  }`}
                                />
                                <span>{user.status === 'active' ? 'Aktif' : 'Nonaktif'}</span>
                              </button>

                              <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                <ShieldCheck
                                  className={`w-3 h-3 ${
                                    user.twoFactorEnabled ? 'text-emerald-600' : 'text-gray-300'
                                  }`}
                                />
                                <span>{user.twoFactorEnabled ? 'PIN Aktif' : 'Tanpa PIN'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Last Login */}
                          <td className="py-4 px-4">
                            <div className="text-xs text-[#254117] font-medium">
                              {user.lastLogin}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Dibuat: {user.createdAt}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Reset password/PIN */}
                              <button
                                onClick={() => handleOpenResetModal(user)}
                                title="Reset Kata Sandi / PIN"
                                className="p-2 rounded-xl text-gray-500 hover:text-[#254117] hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Edit User */}
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                title="Edit Data Pengguna"
                                className="p-2 rounded-xl text-gray-500 hover:text-[#254117] hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete User */}
                              {!isOwner && (
                                <button
                                  onClick={() => setDeleteConfirmUserId(user.id)}
                                  title="Hapus Akun Pengguna"
                                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
              <div>
                Menampilkan <span className="font-bold text-[#254117]">{filteredUsers.length}</span> dari{' '}
                <span className="font-bold text-[#254117]">{systemUsers.length}</span> pengguna sistem
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Akun berstatus aktif dapat langsung login ke portal Admin atau Kurir.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PERAN & HAK AKSES */}
      {/* ========================================================= */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Role Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-[#254117]">
                  Peran dan Hak Akses
                </h3>
                <span className="text-xs font-bold text-[#254117] bg-gray-100 px-2.5 py-0.5 rounded-lg">
                  {systemRoles.length} Peran
                </span>
              </div>

              <div className="space-y-2.5">
                {systemRoles.map((role) => {
                  const isSelected = role.id === selectedRoleId;
                  const roleUsersCount = systemUsers.filter((u) => u.roleId === role.id).length;

                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#254117] text-white border-[#254117] shadow-sm'
                          : 'bg-white hover:bg-gray-50 border-gray-100 text-[#254117]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm leading-snug">{role.name}</div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 uppercase ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : role.category === 'admin'
                              ? 'bg-[#ffecf2] text-[#cd6184]'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {role.category}
                        </span>
                      </div>

                      <p
                        className={`text-xs mt-1 line-clamp-2 ${
                          isSelected ? 'text-white/80' : 'text-gray-500'
                        }`}
                      >
                        {role.description}
                      </p>

                      <div
                        className={`text-[11px] font-semibold mt-3 pt-2 border-t flex items-center justify-between ${
                          isSelected ? 'border-white/10 text-white/90' : 'border-gray-100 text-gray-400'
                        }`}
                      >
                        <span className="font-bold">{roleUsersCount} Orang</span>
                        <span>{role.permissions.length} Izin Aktif</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Permission Matrix for Selected Role (8 cols) */}
          <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            {/* Header of selected role */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedRole.category === 'admin'
                        ? 'bg-[#ffecf2] text-[#cd6184]'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    Kategori: {selectedRole.category === 'admin' ? 'Staf Admin' : 'Staf Kurir'}
                  </span>
                  {selectedRole.isSystemDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 uppercase">
                      Default Sistem
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-[#254117]">{selectedRole.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedRole.description}</p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <button
                  onClick={handleSaveRolePermissions}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#254117] hover:bg-[#3b6624] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-[#ffbd59]" />
                  <span>Simpan Perubahan Izin</span>
                </button>
              </div>
            </div>

            {/* Notice if Super Admin */}
            {selectedRole.id === 'super_admin' && (
              <div className="p-3.5 rounded-2xl bg-[#ffecf2] border border-[#cd6184]/30 text-[#cd6184] text-xs font-medium flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Peran Super Admin adalah wewenang tingkat tertinggi di Laundrea. Seluruh hak akses
                  aktif secara otomatis demi kelancaran operasional penuh.
                </span>
              </div>
            )}

            {/* Permissions list grouped by Module */}
            <div className="space-y-6">
              {(Object.keys(permissionsByModule) as PermissionModule[]).map((modKey) => {
                const modInfo = moduleTitles[modKey];
                const perms = permissionsByModule[modKey];

                return (
                  <div key={modKey} className="space-y-3">
                    <div className="pb-1 border-b border-gray-100">
                      <h4 className="text-xs font-bold text-[#254117] uppercase tracking-wider">
                        {modInfo.title}
                      </h4>
                      <p className="text-[11px] text-gray-400">{modInfo.desc}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {perms.map((p) => {
                        const isChecked = draftPermissions.includes(p.id);

                        return (
                          <div
                            key={p.id}
                            onClick={() => handleTogglePermission(p.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                              isChecked
                                ? 'bg-emerald-50/50 border-emerald-300 text-[#254117]'
                                : 'bg-gray-50/40 border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            <div className="pt-0.5 shrink-0">
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors ${
                                  isChecked
                                    ? 'bg-[#254117] text-white'
                                    : 'border border-gray-300 bg-white'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5" />}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`text-xs font-bold leading-snug ${
                                  isChecked ? 'text-[#254117]' : 'text-gray-600'
                                }`}
                              >
                                {p.label}
                              </div>
                              <div className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                                {p.description}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MATRIKS HAK AKSES */}
      {/* ========================================================= */}
      {activeTab === 'matrix' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#254117]">
              Matriks hak akses
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold">
                  <th className="py-3 px-4 min-w-[240px]">Fitur / Hak Akses Modul</th>
                  {systemRoles.map((r) => {
                    const roleUserCount = systemUsers.filter((u) => u.roleId === r.id).length;
                    return (
                      <th key={r.id} className="py-3 px-3 text-center min-w-[130px]">
                        <div className="font-bold text-[#254117]">{r.name}</div>
                        <span className="text-[11px] font-semibold text-gray-500 block mt-0.5">
                          {roleUserCount} Orang
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(Object.keys(permissionsByModule) as PermissionModule[]).map((modKey) => (
                  <React.Fragment key={modKey}>
                    <tr className="bg-gray-50/80 font-bold text-[#254117] text-[11px] uppercase tracking-wider">
                      <td colSpan={systemRoles.length + 1} className="py-2.5 px-4">
                        {moduleTitles[modKey].title}
                      </td>
                    </tr>

                    {permissionsByModule[modKey].map((perm) => (
                      <tr key={perm.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#254117]">{perm.label}</div>
                          <div className="text-[11px] text-gray-400">{perm.description}</div>
                        </td>

                        {systemRoles.map((role) => {
                          const hasAccess = role.permissions.includes(perm.id);

                          return (
                            <td key={role.id} className="py-3 px-3 text-center">
                              {hasAccess ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-400">
                                  &ndash;
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH / EDIT PENGGUNA */}
      {/* ========================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#254117]" />
                <h3 className="text-lg font-black text-[#254117]">
                  {editingUserId ? 'Edit Data Pengguna Staf' : 'Tambah Pengguna Sistem Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitUserForm} className="space-y-4 text-xs sm:text-sm">
              {/* Category Selector (Admin vs Courier only) */}
              <div>
                <label className="block font-bold text-[#254117] mb-1.5">
                  Kategori Staf Internal <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        roleCategory: 'admin',
                        roleId: 'admin_operasional',
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.roleCategory === 'admin'
                        ? 'bg-[#254117] text-white border-[#254117] shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Staf Admin & Kasir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        roleCategory: 'courier',
                        roleId: 'courier',
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      formData.roleCategory === 'courier'
                        ? 'bg-[#254117] text-white border-[#254117] shadow-xs'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>Staf Kurir</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-[#254117] mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Dimas Pratama / Siska Amelia"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm"
                />
              </div>

              {/* Username & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#254117] mb-1">
                    Username Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value.replace(/\s+/g, '').toLowerCase(),
                      })
                    }
                    placeholder="Contoh: dimas_kurir"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#254117] mb-1">
                    Peran & Wewenang <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm bg-white"
                  >
                    {systemRoles
                      .filter((r) => r.category === formData.roleCategory)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#254117] mb-1">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#254117] mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@laundrea.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Branch / Vehicle Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#254117] mb-1">Penugasan Cabang / Area</label>
                  <input
                    type="text"
                    value={formData.assignedBranch}
                    onChange={(e) => setFormData({ ...formData, assignedBranch: e.target.value })}
                    placeholder="Cabang Senopati / Area Jaksel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm"
                  />
                </div>

                {formData.roleCategory === 'courier' ? (
                  <div>
                    <label className="block font-bold text-[#254117] mb-1">Armada / Kendaraan</label>
                    <input
                      type="text"
                      value={formData.vehicleInfo}
                      onChange={(e) => setFormData({ ...formData, vehicleInfo: e.target.value })}
                      placeholder="Motor Vario B 4921 SPB"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-[#254117] mb-1">Status Akun</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm bg-white"
                    >
                      <option value="active">Aktif (Dapat Login)</option>
                      <option value="inactive">Nonaktif (Akses Ditutup)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Initial Password (if new user) */}
              {!editingUserId && (
                <div>
                  <label className="block font-bold text-[#254117] mb-1">
                    Kata Sandi Sementara <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.initialPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, initialPassword: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs sm:text-sm font-mono bg-gray-50"
                    />
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Staf dapat mengganti sandi atau PIN saat pertama kali login.
                  </span>
                </div>
              )}

              {/* 2FA Toggle */}
              <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-[#254117]">Proteksi Verifikasi PIN (2FA)</div>
                    <div className="text-[11px] text-gray-500">
                      Wajibkan input PIN 6 digit untuk aksi penting operasional & keuangan.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.twoFactorEnabled}
                  onChange={(e) =>
                    setFormData({ ...formData, twoFactorEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#254117] cursor-pointer"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#254117] hover:bg-[#3b6624] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  {editingUserId ? 'Simpan Perubahan' : 'Daftarkan Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RESET KATA SANDI / PIN */}
      {/* ========================================================= */}
      {resetModalUserId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-[#254117]">
              <div className="p-2 rounded-xl bg-[#ffecf2] text-[#cd6184]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#254117]">Reset Kredensial Pengguna</h3>
                <p className="text-xs text-gray-500">
                  Buat kata sandi sementara baru untuk akun staf ini.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl space-y-2 border border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Kata Sandi Sementara Baru:
              </span>
              <div className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-gray-200">
                <span className="font-mono font-bold text-sm text-[#254117]">{tempPassword}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tempPassword);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2500);
                  }}
                  className="text-xs font-bold text-[#cd6184] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedSecret ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Kirimkan kredensial sementara ini kepada staf melalui WhatsApp terdaftar.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setResetModalUserId(null)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-[#254117] text-white font-bold text-xs hover:bg-[#3b6624] shadow-xs cursor-pointer"
              >
                Terapkan Kata Sandi Baru
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: KONFIRMASI HAPUS PENGGUNA */}
      {/* ========================================================= */}
      {deleteConfirmUserId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 rounded-xl bg-red-50">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-gray-900">Konfirmasi Hapus Akun</h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun staf ini secara permanen dari basis data sistem?
              Akses login staf akan langsung ditutup.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUserId(null)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-xs cursor-pointer"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH PERAN KUSTOM */}
      {/* ========================================================= */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#254117]" />
                <h3 className="text-base font-black text-[#254117]">Tambah Peran Kustom Baru</h3>
              </div>
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-[#254117] mb-1">Kategori Jabatan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRoleForm({ ...newRoleForm, category: 'admin' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                      newRoleForm.category === 'admin'
                        ? 'bg-[#254117] text-white border-[#254117]'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    Staf Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRoleForm({ ...newRoleForm, category: 'courier' })}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs ${
                      newRoleForm.category === 'courier'
                        ? 'bg-[#254117] text-white border-[#254117]'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    Staf Kurir
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">Nama Peran / Jabatan</label>
                <input
                  type="text"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  placeholder="Contoh: Supervisor QC Cuci / Kurir Prioritas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#254117] mb-1">Deskripsi Wewenang</label>
                <textarea
                  value={newRoleForm.description}
                  onChange={(e) =>
                    setNewRoleForm({ ...newRoleForm, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Jelaskan cakupan wewenang dan tanggung jawab posisi ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#254117] text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setIsAddRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!newRoleForm.name.trim()) return;
                  addSystemRole({
                    name: newRoleForm.name.trim(),
                    category: newRoleForm.category,
                    description: newRoleForm.description.trim() || 'Peran operasional khusus Laundrea.',
                    badgeColor: newRoleForm.category === 'admin' ? 'rose' : 'blue',
                    permissions:
                      newRoleForm.category === 'admin'
                        ? ['orders_view', 'orders_status_update']
                        : ['courier_task_access', 'courier_handover_update'],
                  });
                  showToast(`Peran baru "${newRoleForm.name}" berhasil dibuat!`);
                  setIsAddRoleModalOpen(false);
                  setNewRoleForm({
                    name: '',
                    category: 'admin',
                    description: '',
                    badgeColor: 'emerald',
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#254117] text-white font-bold text-xs hover:bg-[#3b6624] shadow-xs cursor-pointer"
              >
                Simpan Peran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
