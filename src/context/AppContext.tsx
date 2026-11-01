import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Plan,
  Order,
  OrderStatus,
  Courier,
  CustomerProfile,
  PromoCode,
  CustomerVoucher,
  OperationalCostItem,
  StampHistoryItem,
  HandoverMethod,
  ReturnMethod,
  PaymentMethod,
  SystemUser,
  SystemRole,
  PermissionItem,
  AppNotification,
  RecycleOrderData,
  ArtisanItem,
  RecycleWorkItem,
  ImpactStats,
  RecycleProgramSettings,
} from '../types';
import {
  INITIAL_PLANS,
  INITIAL_ORDERS,
  INITIAL_COURIERS,
  INITIAL_CUSTOMERS,
  INITIAL_PROMOS,
  INITIAL_CUSTOMER_VOUCHERS,
  INITIAL_OPERATIONAL_COSTS,
  INITIAL_STAMP_HISTORY,
  INITIAL_SYSTEM_USERS,
  INITIAL_SYSTEM_ROLES,
  INITIAL_SYSTEM_PERMISSIONS,
  INITIAL_RECYCLE_PROGRAM_SETTINGS,
  INITIAL_IMPACT_STATS,
  INITIAL_ARTISANS,
  INITIAL_RECYCLE_WORKS,
} from '../data/initialData';
import { SERVICE_SLOTS } from '../data/serviceSlots';
import {
  getCustomerFromFirestore,
  updateCustomerInFirestore,
  normalizePhoneNumber,
  DEFAULT_DEMO_PHONE,
  DEFAULT_DEMO_NAME,
  DEFAULT_DEMO_ADDRESS,
  seedSampleCustomersIfMissing,
} from '../services/firebaseService';
import {
  seedFirestoreCollectionsIfEmpty,
  subscribeToOrders,
  saveOrderToFirestore,
  updateOrderInFirestore,
  subscribeToCouriers,
  saveCourierToFirestore,
  updateCourierInFirestore,
  subscribeToPlans,
  updatePlanInFirestore,
  subscribeToPromos,
  savePromoToFirestore,
  updatePromoInFirestore,
  subscribeToOperationalCosts,
  saveOperationalCostToFirestore,
  subscribeToSystemUsers,
  saveSystemUserToFirestore,
  updateSystemUserInFirestore,
  deleteSystemUserFromFirestore,
  subscribeToSystemRoles,
  saveSystemRoleToFirestore,
  updateSystemRoleInFirestore,
  subscribeToStampHistory,
  saveStampHistoryItem,
  subscribeToCustomerVouchers,
  saveCustomerVoucher,
  updateCustomerVoucherInFirestore,
  subscribeToNotifications,
  sendOrUpdateNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToRecycleProgramSettings,
  subscribeToImpactStats,
  subscribeToArtisans,
  subscribeToRecycleWorks,
  applyRecycleVerificationStats,
} from '../services/firebaseRealtimeService';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  // Customer Auth & Profile
  isCustomerVerified: boolean;
  customerPhone: string;
  customerName: string;
  customerAddress: string;
  activeCustomerOrderId: string | null;
  verifyCustomer: (phone: string, profileData?: { name?: string; address?: string }) => void;
  updateCustomerProfile: (data: {
    name?: string;
    address?: string;
    structuredAddress?: any;
  }) => Promise<void>;
  logoutCustomer: () => void;
  setActiveCustomerOrderId: (id: string | null) => void;
  // Courier Auth
  isCourierLoggedIn: boolean;
  courierUsername: string;
  loginCourier: (username: string) => void;
  logoutCourier: () => void;
  // Admin Auth
  isAdminLoggedIn: boolean;
  adminUsername: string;
  loginAdmin: (username: string) => void;
  logoutAdmin: () => void;
  // Data
  plans: Plan[];
  orders: Order[];
  couriers: Courier[];
  customers: CustomerProfile[];
  promos: PromoCode[];
  operationalCosts: OperationalCostItem[];
  // System Management (Admin & Courier only)
  systemUsers: SystemUser[];
  systemRoles: SystemRole[];
  systemPermissions: PermissionItem[];
  hasPermission: (permissionId: string) => boolean;
  staffRoleLabel: string;
  currentStaffRole: SystemRole | null;
  currentStaffUser: SystemUser | null;
  addSystemUser: (user: Omit<SystemUser, 'id' | 'createdAt'>) => void;
  updateSystemUser: (id: string, user: Partial<SystemUser>) => void;
  toggleSystemUserStatus: (id: string) => void;
  deleteSystemUser: (id: string) => void;
  resetUserPasswordOrPin: (id: string, tempSecret: string) => void;
  updateRolePermissions: (roleId: string, permissions: string[]) => void;
  addSystemRole: (role: Omit<SystemRole, 'id'>) => void;
  // Loyalty & Vouchers
  stampsCount: number;
  stampHistory: StampHistoryItem[];
  customerVouchers: CustomerVoucher[];
  claimLoyaltyVoucher: () => CustomerVoucher | null;
  addTestStamp: () => void;
  markVoucherAsUsed: (code: string, orderNumber: string) => void;
  redeemFreeWash: () => boolean;
  // Notifications
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  newNotificationToast: AppNotification | null;
  dismissToast: () => void;
  // Laundrea Peduli / Recycle Program
  recycleSettings: RecycleProgramSettings;
  impactStats: ImpactStats | null;
  artisans: ArtisanItem[];
  recycleWorks: RecycleWorkItem[];
  // Connection state
  isFirestoreLoading: boolean;
  firestoreError: string | null;
  // Actions
  createOrder: (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    planId: Plan['id'];
    estimatedQuantity: number;
    pickupDate: string;
    pickupTime: string;
    handoverMethod?: HandoverMethod;
    returnMethod?: ReturnMethod;
    notes?: string;
    voucherCode?: string;
    voucherDiscount?: number;
    recipientName?: string;
    contactPhone?: string;
    recycle?: RecycleOrderData;
  }) => Order;
  updateOrderWeight: (orderId: string, actualWeight: number, recycleWeight?: number) => void;
  rejectOrderRecycle: (orderId: string, reason: string) => void;
    verifyOrderRecycle: (
    orderId: string,
    finalKg: number
  ) => { ok: boolean; bonusGranted: boolean; message: string; recycle?: RecycleOrderData };
  rejectOrderRecycleByAdmin: (
    orderId: string,
    reason: string
  ) => { ok: boolean; message: string; recycle?: RecycleOrderData };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateOrderPaymentStatus: (
    orderId: string,
    paymentStatus: 'not_due' | 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid'
  ) => void;
  choosePaymentMethod: (orderId: string, method: PaymentMethod) => void;
  confirmCodCashReceived: (orderId: string) => void;
  assignCourier: (orderId: string, courierId: string) => void;
  addCourier: (data: { name: string; phone: string; email?: string; vehicle?: string }) => void;
  toggleCourierStatus: (courierId: string) => void;
  scheduleDelivery: (orderId: string, deliveryTime: string) => void;
  updatePlan: (updatedPlan: Plan) => void;
  addPromo: (code: string, discount: number, minOrder?: number) => void;
  togglePromo: (id: string) => void;
  addOperationalCost: (category: string, amount: number) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => {
    return (localStorage.getItem('laundrea_current_role') as Role) || 'customer';
  });

  // Customer state
  const [isCustomerVerified, setIsCustomerVerified] = useState<boolean>(() => {
    return localStorage.getItem('laundrea_cust_verified') === 'true';
  });
  const [customerPhone, setCustomerPhone] = useState<string>(() => {
    return localStorage.getItem('laundrea_cust_phone') || DEFAULT_DEMO_PHONE;
  });
  const [customerName, setCustomerName] = useState<string>(() => {
    return localStorage.getItem('laundrea_cust_name_v5') || DEFAULT_DEMO_NAME;
  });
  const [customerAddress, setCustomerAddress] = useState<string>(() => {
    return localStorage.getItem('laundrea_cust_address_v5') || DEFAULT_DEMO_ADDRESS;
  });
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState<string | null>(() => {
    return localStorage.getItem('laundrea_cust_order_id') || 'ord-101';
  });

  // Courier state
  const [isCourierLoggedIn, setIsCourierLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('laundrea_courier_logged_in') === 'true';
  });
  const [courierUsername, setCourierUsername] = useState<string>(() => {
    return localStorage.getItem('laundrea_courier_user') || 'kurir_dimas';
  });

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('laundrea_admin_logged_in') === 'true';
  });
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    return localStorage.getItem('laundrea_admin_user') || 'owner_laundrea';
  });

  // Real-time Firestore driven states (No localStorage persistence for shared data)
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [customers, setCustomers] = useState<CustomerProfile[]>(INITIAL_CUSTOMERS);
  const [promos, setPromos] = useState<PromoCode[]>(INITIAL_PROMOS);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCostItem[]>(INITIAL_OPERATIONAL_COSTS);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(INITIAL_SYSTEM_USERS);
  const [systemRoles, setSystemRoles] = useState<SystemRole[]>(INITIAL_SYSTEM_ROLES);
  const [systemPermissions] = useState<PermissionItem[]>(INITIAL_SYSTEM_PERMISSIONS);
  const [stampHistory, setStampHistory] = useState<StampHistoryItem[]>(INITIAL_STAMP_HISTORY);
  const [customerVouchers, setCustomerVouchers] = useState<CustomerVoucher[]>(INITIAL_CUSTOMER_VOUCHERS);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Laundrea Peduli / Recycle Program State
  const [recycleSettings, setRecycleSettings] = useState<RecycleProgramSettings>(INITIAL_RECYCLE_PROGRAM_SETTINGS);
  const [impactStats, setImpactStats] = useState<ImpactStats | null>(INITIAL_IMPACT_STATS);
  const [artisans, setArtisans] = useState<ArtisanItem[]>(INITIAL_ARTISANS);
  const [recycleWorks, setRecycleWorks] = useState<RecycleWorkItem[]>(INITIAL_RECYCLE_WORKS);

  const [isFirestoreLoading, setIsFirestoreLoading] = useState<boolean>(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [newNotificationToast, setNewNotificationToast] = useState<AppNotification | null>(null);

  // Clean old localStorage keys on load as instructed
  useEffect(() => {
    const keysToRemove = [
      'laundrea_plans',
      'laundrea_orders',
      'laundrea_orders_v2',
      'laundrea_orders_v3',
      'laundrea_orders_v4',
      'laundrea_orders_v5',
      'laundrea_couriers',
      'laundrea_couriers_v2',
      'laundrea_customers',
      'laundrea_customers_v2',
      'laundrea_customers_v3',
      'laundrea_customers_v4',
      'laundrea_customers_v5',
      'laundrea_promos',
      'laundrea_costs',
      'laundrea_system_users',
      'laundrea_system_users_v2',
      'laundrea_system_users_v3',
      'laundrea_system_roles',
      'laundrea_system_roles_v2',
      'laundrea_stamps_count',
      'laundrea_stamps_count_v2',
      'laundrea_stamps_count_v3',
      'laundrea_stamp_history',
      'laundrea_stamp_history_v2',
      'laundrea_stamp_history_v3',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Clear legacy stamp & voucher keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('laundrea_stamp_history_v4_') || key.startsWith('laundrea_customer_vouchers_v4_'))) {
        localStorage.removeItem(key);
      }
    }
  }, []);

  // Initialize and Seed Firestore collections
  useEffect(() => {
    seedFirestoreCollectionsIfEmpty().catch((err) => {
      console.warn('Seeding firestore error:', err);
    });
    seedSampleCustomersIfMissing().catch(() => {});
  }, []);

  // Listeners for all shared datasets
  useEffect(() => {
    setIsFirestoreLoading(true);
    setFirestoreError(null);

    const unsubs: (() => void)[] = [];

    // 1. Orders
    unsubs.push(
      subscribeToOrders(
        (data) => {
          if (data && data.length > 0) setOrders(data);
          setIsFirestoreLoading(false);
        },
        (err) => {
          console.error('Firestore orders listener error:', err);
          setFirestoreError('Tidak dapat terhubung ke server database Firestore. Silakan periksa koneksi internet Anda.');
          setIsFirestoreLoading(false);
        }
      )
    );

    // 2. Couriers
    unsubs.push(
      subscribeToCouriers((data) => {
        if (data && data.length > 0) setCouriers(data);
      })
    );

    // 3. Plans
    unsubs.push(
      subscribeToPlans((data) => {
        if (data && data.length > 0) setPlans(data);
      })
    );

    // 4. Promos
    unsubs.push(
      subscribeToPromos((data) => {
        if (data) setPromos(data);
      })
    );

    // 5. Operational Costs
    unsubs.push(
      subscribeToOperationalCosts((data) => {
        if (data) setOperationalCosts(data);
      })
    );

    // 6. System Users
    unsubs.push(
      subscribeToSystemUsers((data) => {
        if (data && data.length > 0) setSystemUsers(data);
      })
    );

    // 7. System Roles
    unsubs.push(
      subscribeToSystemRoles((data) => {
        if (data && data.length > 0) setSystemRoles(data);
      })
    );

    // 8. Recycle program settings
    unsubs.push(
      subscribeToRecycleProgramSettings((data) => {
        if (data) setRecycleSettings(data);
      })
    );

    // 9. Impact stats
    unsubs.push(
      subscribeToImpactStats((data) => {
        setImpactStats(data);
      })
    );

    // 10. Artisans
    unsubs.push(
      subscribeToArtisans((data) => {
        if (data) setArtisans(data);
      })
    );

    // 11. Recycle works
    unsubs.push(
      subscribeToRecycleWorks((data) => {
        if (data) setRecycleWorks(data);
      })
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  // Real-time listeners for Customer-isolated data (stampHistory, customerVouchers, notifications)
  useEffect(() => {
    if (!customerPhone) return;
    const unsubs: (() => void)[] = [];

    unsubs.push(
      subscribeToStampHistory(customerPhone, (data) => {
        setStampHistory(data);
      })
    );

    unsubs.push(
      subscribeToCustomerVouchers(customerPhone, (data) => {
        setCustomerVouchers(data);
      })
    );

    let initialNotifsLoaded = false;
    unsubs.push(
      subscribeToNotifications(customerPhone, (data) => {
        if (initialNotifsLoaded) {
          // Detect newly arrived notification
          const latest = data[0];
          if (latest && !latest.read) {
            setNewNotificationToast(latest);
            setTimeout(() => setNewNotificationToast(null), 5000);
          }
        } else {
          initialNotifsLoaded = true;
        }
        setNotifications(data);
      })
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [customerPhone]);

  // Derived stamp balance including verified recycling bonus stamps (milestone counts wash + recycle bonus)
  const verifiedRecycleBonusesCount = orders.filter((o) => {
    if (customerPhone && o.customerPhone !== customerPhone) return false;
    if (o.recycle?.status !== 'verified' || !o.recycle?.bonusGranted) return false;
    const alreadyInHistory = stampHistory.some(
      (sh) => sh.orderNumber === o.orderNumber && sh.type === 'earned' && sh.title.includes('Daur Ulang')
    );
    return !alreadyInHistory;
  }).length;

  const stampsCount = stampHistory.reduce((sum, item) => sum + (item.pointsChange || 0), 0) + verifiedRecycleBonusesCount;

  // Staff User & Live Permission Resolution
  const activeUsername = role === 'admin' ? adminUsername : courierUsername;
  const currentStaffUser = systemUsers.find((u) => u.username === activeUsername) || null;
  const currentStaffRole =
    (currentStaffUser && systemRoles.find((r) => r.id === currentStaffUser.roleId)) || null;

  // Derive staff role label for the UI (Super Admin -> "Admin", Admin Kasir & Operasional -> "Admin Kasir dan Operasional", Kurir -> "Kurir")
  const staffRoleLabel = (() => {
    if (role === 'courier' || currentStaffRole?.id === 'courier' || currentStaffUser?.roleCategory === 'courier') {
      return 'Kurir';
    }
    if (currentStaffRole) {
      if (currentStaffRole.id === 'super_admin' || currentStaffRole.name === 'Super Admin') {
        return 'Admin';
      }
      if (
        currentStaffRole.id === 'admin_operasional' ||
        currentStaffRole.name.toLowerCase().includes('operasional') ||
        currentStaffRole.name.toLowerCase().includes('kasir')
      ) {
        return 'Admin Kasir dan Operasional';
      }
      return currentStaffRole.name;
    }
    // Fallback based on logged-in username if role document is still resolving
    if (adminUsername === 'owner_laundrea') return 'Admin';
    if (adminUsername.startsWith('admin_')) return 'Admin Kasir dan Operasional';
    if (adminUsername.startsWith('kurir_')) return 'Kurir';
    return 'Admin';
  })();

  const hasPermission = (permissionId: string): boolean => {
    // 1) Weighing: ONLY the courier can weigh and enter the actual weight
    if (permissionId === 'orders_weigh') {
      return (
        role === 'courier' ||
        currentStaffRole?.id === 'courier' ||
        currentStaffUser?.roleCategory === 'courier'
      );
    }

    // Courier-only permissions: Konfirmasi Antar & Jemput Kurir, Akses Portal & Tugas Kurir
    if (['courier_handover_update', 'courier_task_access'].includes(permissionId)) {
      return (
        role === 'courier' ||
        currentStaffRole?.id === 'courier' ||
        currentStaffUser?.roleCategory === 'courier'
      );
    }

    // If active user is Courier, they have NOTHING ELSE except 'orders_view'
    if (role === 'courier' || currentStaffRole?.id === 'courier' || currentStaffUser?.roleCategory === 'courier') {
      return permissionId === 'orders_view';
    }

    // For Admin users:
    if (!currentStaffRole) {
      // Fallback for default super admin owner
      if (role === 'admin' && adminUsername === 'owner_laundrea') {
        return true; // Already ruled out courier-only permissions above
      }
      // Fallback for default admin kasir
      if (role === 'admin' && adminUsername.startsWith('admin_')) {
        return [
          'orders_view',
          'orders_create',
          'orders_status_update',
          'orders_dispatch',
          'payment_confirm',
          'financial_summary_view',
          'promo_manage',
        ].includes(permissionId);
      }
      return false;
    }

    if (currentStaffRole.id === 'super_admin') {
      // Super admin has all admin permissions (courier-only already filtered out above)
      return currentStaffRole.permissions.includes(permissionId);
    }

    return currentStaffRole.permissions.includes(permissionId);
  };

  // Automated 10-second payment detection loop across any active client (idempotent)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      orders.forEach((ord) => {
        if (
          ord.paymentChosenAt &&
          (ord.paymentMethod === 'bank_transfer' || ord.paymentMethod === 'qris') &&
          ord.paymentStatus !== 'awaiting_verification' &&
          ord.paymentStatus !== 'paid'
        ) {
          const chosenTime = new Date(ord.paymentChosenAt).getTime();
          if (now - chosenTime >= 10000) {
            // Transition idempotently to awaiting_verification
            updateOrderInFirestore(ord.id, {
              paymentStatus: 'awaiting_verification',
              lastUpdatedLabel: 'Pembayaran terdeteksi otomatis',
            }).catch(() => {});
          }
        }
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [orders]);

  // Per-device local storage persistence (Only login sessions and phone identity)
  useEffect(() => {
    localStorage.setItem('laundrea_cust_verified', String(isCustomerVerified));
    localStorage.setItem('laundrea_cust_phone', customerPhone);
    localStorage.setItem('laundrea_cust_name_v5', customerName);
    localStorage.setItem('laundrea_cust_address_v5', customerAddress);
    if (activeCustomerOrderId) {
      localStorage.setItem('laundrea_cust_order_id', activeCustomerOrderId);
    }
  }, [isCustomerVerified, customerPhone, customerName, customerAddress, activeCustomerOrderId]);

  useEffect(() => {
    localStorage.setItem('laundrea_courier_logged_in', String(isCourierLoggedIn));
    localStorage.setItem('laundrea_courier_user', courierUsername);
  }, [isCourierLoggedIn, courierUsername]);

  useEffect(() => {
    localStorage.setItem('laundrea_admin_logged_in', String(isAdminLoggedIn));
    localStorage.setItem('laundrea_admin_user', adminUsername);
  }, [isAdminLoggedIn, adminUsername]);

  // Auth Functions
  const verifyCustomer = (
    phone: string,
    profileData?: { name?: string; address?: string }
  ) => {
    setRole('customer');
    setIsCustomerVerified(true);
    setCustomerPhone(phone);

    const norm = normalizePhoneNumber(phone);
    const finalName =
      profileData?.name?.trim() ||
      (norm === normalizePhoneNumber(DEFAULT_DEMO_PHONE) ? DEFAULT_DEMO_NAME : 'Pelanggan Laundrea');
    const finalAddress =
      profileData?.address?.trim() ||
      (norm === normalizePhoneNumber(DEFAULT_DEMO_PHONE) ? DEFAULT_DEMO_ADDRESS : '');

    setCustomerName(finalName);
    setCustomerAddress(finalAddress);

    localStorage.setItem('laundrea_cust_verified', 'true');
    localStorage.setItem('laundrea_cust_phone', phone);
    localStorage.setItem('laundrea_cust_name_v5', finalName);
    localStorage.setItem('laundrea_cust_address_v5', finalAddress);
    localStorage.setItem('laundrea_current_role', 'customer');

    if (typeof document !== 'undefined') {
      document.title = 'Laundrea';
    }
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const updateCustomerProfile = async (data: {
    name?: string;
    address?: string;
    structuredAddress?: any;
  }) => {
    if (data.name) setCustomerName(data.name.trim());
    if (data.address) setCustomerAddress(data.address.trim());
    if (data.name) localStorage.setItem('laundrea_cust_name_v5', data.name.trim());
    if (data.address) localStorage.setItem('laundrea_cust_address_v5', data.address.trim());

    try {
      await updateCustomerInFirestore(customerPhone, data);
    } catch (err) {
      console.warn('Sync updated profile to Firestore error:', err);
    }
  };

  const logoutCustomer = () => {
    setIsCustomerVerified(false);
    localStorage.removeItem('laundrea_cust_verified');
    localStorage.setItem('laundrea_cust_verified', 'false');
    localStorage.removeItem('laundrea_current_role');
    if (typeof document !== 'undefined') {
      document.title = 'Laundrea';
    }
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const loginCourier = (username: string) => {
    setRole('courier');
    setIsCourierLoggedIn(true);
    setCourierUsername(username || 'kurir_dimas');
    localStorage.setItem('laundrea_courier_logged_in', 'true');
    localStorage.setItem('laundrea_current_role', 'courier');
    if (typeof document !== 'undefined') {
      document.title = 'Laundrea Staff';
    }
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/staff');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const logoutCourier = () => {
    setIsCourierLoggedIn(false);
    localStorage.removeItem('laundrea_courier_logged_in');
    localStorage.setItem('laundrea_courier_logged_in', 'false');
    localStorage.removeItem('laundrea_current_role');
    if (typeof document !== 'undefined') {
      document.title = 'Laundrea Staff';
    }
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/staff');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const loginAdmin = (username: string) => {
    setRole('admin');
    setIsAdminLoggedIn(true);
    setAdminUsername(username || 'owner_laundrea');
    localStorage.setItem('laundrea_admin_logged_in', 'true');
    localStorage.setItem('laundrea_current_role', 'admin');
    if (typeof document !== 'undefined') {
      document.title = 'Laundrea Staff';
    }
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/staff');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('laundrea_admin_logged_in');
    localStorage.setItem('laundrea_admin_logged_in', 'false');
    localStorage.removeItem('laundrea_current_role');
    if (typeof document !== 'undefined') {
      document.title = 'Laundrea Staff';
    }
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/staff');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  // Loyalty Mutations
  const claimLoyaltyVoucher = (): CustomerVoucher | null => {
    if (stampsCount < 10) return null;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newVoucher: CustomerVoucher = {
      id: `vch-${Date.now()}`,
      code: `STEMPEL10-FREE-${randomCode}`,
      title: 'Voucher Cuci Gratis 10 Stempel (Maks 5kg)',
      description: 'Hadiah klaim 10 stempel komplit! Gratis cuci bersih higienis s.d. 5 kg (potongan hingga Rp 35.000).',
      discountType: 'free_wash',
      discountValue: 100,
      maxDiscount: 35000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      isUsed: false,
      createdAt: dateStr,
    };

    saveCustomerVoucher(customerPhone, newVoucher).catch(() => {});

    const newItem: StampHistoryItem = {
      id: `stmp-${Date.now()}`,
      date: dateStr,
      type: 'redeemed',
      title: `Klaim Voucher Cuci Gratis (Kode: ${newVoucher.code})`,
      pointsChange: -10,
    };
    saveStampHistoryItem(customerPhone, newItem).catch(() => {});

    return newVoucher;
  };

  const addTestStamp = () => {
    const now = new Date();
    const newItem: StampHistoryItem = {
      id: `stmp-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      type: 'earned',
      title: 'Bonus Stempel Loyalitas (+1 Stempel)',
      pointsChange: 1,
    };
    saveStampHistoryItem(customerPhone, newItem).catch(() => {});
  };

  const markVoucherAsUsed = (code: string, orderNumber: string) => {
    const found = customerVouchers.find((v) => v.code.toUpperCase() === code.toUpperCase());
    if (found) {
      updateCustomerVoucherInFirestore(found.id, {
        isUsed: true,
        usedAtOrderNumber: orderNumber,
      }).catch(() => {});
    }
  };

  const redeemFreeWash = (): boolean => {
    const claimed = claimLoyaltyVoucher();
    return claimed !== null;
  };

  // Notification actions
  const markNotificationRead = (id: string) => {
    markNotificationAsRead(id).catch(() => {});
  };

  const markAllNotificationsRead = () => {
    markAllNotificationsAsRead(customerPhone).catch(() => {});
  };

  const dismissToast = () => {
    setNewNotificationToast(null);
  };

  // Orders Mutations (Requirement 1, 2, 3, 4, 5, 6, 7)
  const createOrder = (data: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    planId: Plan['id'];
    estimatedQuantity: number;
    pickupDate: string;
    pickupTime: string;
    handoverMethod?: HandoverMethod;
    returnMethod?: ReturnMethod;
    notes?: string;
    voucherCode?: string;
    voucherDiscount?: number;
    recipientName?: string;
    contactPhone?: string;
    recycle?: RecycleOrderData;
  }): Order => {
    const selectedPlan = plans.find((p) => p.id === data.planId) || plans[0];
    const unitPrice = selectedPlan.price;
    // Baju daur ulang jalur "cuci dulu" dihitung sebagai biaya cuci terpisah (selalu tarif per kg)
    const recycleWashKg =
      data.recycle?.enabled && data.recycle.mode === 'wash_first'
        ? Math.max(0, Number(data.recycle.estimatedKg) || 0)
        : 0;
    const washRate =
      selectedPlan.unit === 'kg'
        ? unitPrice
        : plans.find((p) => p.unit === 'kg')?.price ?? unitPrice;
    const recycleWashPrice = Math.round(washRate * recycleWashKg);
    const subtotalPrice = unitPrice * data.estimatedQuantity + recycleWashPrice;
    const discount =
      data.voucherDiscount && data.voucherDiscount > 0
        ? Math.min(data.voucherDiscount, subtotalPrice)
        : 0;
    const estimatedPrice = Math.max(0, subtotalPrice - discount);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const orderNumber = `LND-${dateStr}-${randomSuffix}`;
    const newId = `ord-${Date.now()}`;

    // Penugasan otomatis berdasarkan slot jam (Dimas = pagi, Budi = sore).
    // Pesanan "antar ke gerai" tidak ditugaskan ke kurir mana pun.
    const isStoreDropoff = data.handoverMethod === 'store_dropoff';
    const chosenSlot = SERVICE_SLOTS.find((s) => s.label === data.pickupTime);
    const slotCourier = chosenSlot
      ? couriers.find((c) => c.name.toLowerCase().includes(chosenSlot.courierKey))
      : undefined;
    const activeCourier = isStoreDropoff
      ? undefined
      : slotCourier || couriers.find((c) => c.status === 'active') || couriers[0];

    const newOrder: Order = {
      id: newId,
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      recipientName: data.recipientName || data.customerName,
      contactPhone: data.contactPhone || data.customerPhone,
      planId: data.planId,
      planName: selectedPlan.name,
      unitPrice,
      estimatedQuantity: data.estimatedQuantity,
      subtotalPrice,
      estimatedPrice,
      unit: selectedPlan.unit,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      handoverMethod: data.handoverMethod || 'pickup_by_courier',
      returnMethod: data.returnMethod || 'deliver_to_me',
      status: 'pickup',
      statusTimestamps: {
        booked: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        pickup: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
      },
      paymentStatus: 'not_due',
      paymentFlowV2: true,
      lastUpdatedLabel: 'Pesanan dibuat',
      ...(data.voucherCode ? { voucherCode: data.voucherCode } : {}),
      ...(discount > 0 ? { voucherDiscount: discount } : {}),
      ...(activeCourier?.id ? { courierId: activeCourier.id } : {}),
      ...(activeCourier?.name ? { courierName: activeCourier.name } : {}),
      ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
      ...(recycleWashPrice > 0 ? { recycleWashKg, recycleWashPrice } : {}),
      ...(data.recycle ? { recycle: data.recycle } : {}),
    };

    // Immediate optimistic local update so order is visible instantly
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newId)]);
    setActiveCustomerOrderId(newId);

    saveOrderToFirestore(newOrder).catch((err) => {
      console.error('saveOrderToFirestore error:', err);
    });

    if (data.voucherCode) {
      markVoucherAsUsed(data.voucherCode, orderNumber);
    }

    // Note: Stamps are earned when the order is DELIVERED, not at creation (Requirement 3).
    return newOrder;
  };

  /**
   * Courier weighs order:
   * Opens payment if status was not_due or legacy pending.
   * Recalculates final amount (actual price minus voucher discount, min 0).
   * Creates or updates notification idempotently.
   */
  const updateOrderWeight = (orderId: string, actualWeight: number, recycleWeight?: number) => {
    // 1) Weighing: ONLY the courier can weigh and enter the actual weight
    if (!hasPermission('orders_weigh')) {
      console.warn('Unauthorized: Wewenang timbang & verifikasi berat hanya dimiliki oleh Kurir.');
      return;
    }

    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    // Biaya cuci baju daur ulang (jalur "cuci dulu") dihitung dari berat timbangan kurir
    const effectiveRecycleKg =
      ord.recycle?.enabled && ord.recycle.mode === 'wash_first'
        ? Math.max(
            0,
            Number(
              recycleWeight !== undefined
                ? recycleWeight
                : ord.recycle.actualKg ?? ord.recycle.estimatedKg
            ) || 0
          )
        : 0;
    const recycleWashRate =
      ord.unit === 'kg'
        ? ord.unitPrice
        : plans.find((p) => p.unit === 'kg')?.price ?? ord.unitPrice;
    const recycleWashPrice = Math.round(recycleWashRate * effectiveRecycleKg);
    const grossPrice = Math.round(ord.unitPrice * actualWeight) + recycleWashPrice;
    let recalculatedDiscount = 0;
    if (ord.voucherCode) {
      if (ord.voucherDiscount && ord.voucherDiscount > 0) {
        recalculatedDiscount = Math.min(ord.voucherDiscount, grossPrice);
      }
    }
    const finalAmount = Math.max(0, grossPrice - recalculatedDiscount);

    // Apply payment opening only if payment status is not_due or legacy pending; never if paid or awaiting_verification
    const shouldOpenPayment =
      !ord.paymentStatus || ord.paymentStatus === 'not_due' || ord.paymentStatus === 'pending';

    const nextPaymentStatus = shouldOpenPayment ? 'awaiting_payment' : ord.paymentStatus;

    const partialUpdate: Partial<Order> = {
      actualQuantity: actualWeight,
      actualPrice: finalAmount,
      subtotalPrice: grossPrice,
      voucherDiscount: recalculatedDiscount,
      paymentStatus: nextPaymentStatus,
      lastUpdatedLabel: 'Ditimbang kurir',
      recycleWashKg: effectiveRecycleKg,
      recycleWashPrice,
    };

    if (ord.recycle?.enabled && recycleWeight !== undefined) {
      partialUpdate.recycle = {
        ...ord.recycle,
        actualKg: Math.max(0, Number(recycleWeight) || 0),
      };
    }

    updateOrderInFirestore(orderId, partialUpdate).catch(() => {});

    // Notification rule: create payment opened notification once, or update amount if weight edited before method chosen
    if (shouldOpenPayment) {
      sendOrUpdateNotification({
        customerPhone: ord.customerPhone,
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        title: 'Pembayaran Menunggu',
        body: `Pembayaran Menunggu — berat aktual ${actualWeight} ${ord.unit}, total Rp${finalAmount.toLocaleString('id-ID')}. Silakan pilih metode pembayaran.`,
        isPaymentOpening: true,
      }).catch(() => {});
    }
  };

  const rejectOrderRecycle = (orderId: string, reason: string) => {
    if (!hasPermission('orders_weigh')) {
      alert('Akses ditolak: Hanya kurir yang memiliki wewenang menolak baju daur ulang.');
      return;
    }
    const ord = orders.find((o) => o.id === orderId);
    if (!ord || !ord.recycle) return;

    const updatedRecycle: RecycleOrderData = {
      ...ord.recycle,
      status: 'rejected',
      rejectReason: reason,
      actualKg: 0,
    };

    updateOrderInFirestore(orderId, {
      recycle: updatedRecycle,
      lastUpdatedLabel: 'Baju daur ulang ditolak kurir',
    }).catch(() => {});
  };

    const verifyOrderRecycle = (
    orderId: string,
    finalKg: number
  ): { ok: boolean; bonusGranted: boolean; message: string; recycle?: RecycleOrderData } => {
    if (!hasPermission('orders_status_update')) {
      alert('Akses ditolak: Anda tidak memiliki izin memverifikasi baju daur ulang.');
      return { ok: false, bonusGranted: false, message: 'Akses ditolak.' };
    }
    const ord = orders.find((o) => o.id === orderId);
    if (!ord || !ord.recycle?.enabled) {
      return { ok: false, bonusGranted: false, message: 'Order ini tidak memiliki daur ulang.' };
    }
    // Penjaga anti-ganda: hanya boleh diproses sekali
    if (ord.recycle.status !== 'pending_verification') {
      return { ok: false, bonusGranted: false, message: 'Daur ulang order ini sudah diproses.' };
    }
    const kg = Number(finalKg);
    if (!Number.isFinite(kg) || kg <= 0) {
      return { ok: false, bonusGranted: false, message: 'Isi berat final lebih dari 0 kg.' };
    }

    // Batas bonus: 1x per bulan kalender per pelanggan
    const now = new Date();
    const sameMonth = (iso?: string) => {
      if (!iso) return false;
      const d = new Date(iso);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    };
    const phoneKey = normalizePhoneNumber(ord.customerPhone);
    const bonusUsedThisMonth = orders.some(
      (o) =>
        o.id !== ord.id &&
        normalizePhoneNumber(o.customerPhone) === phoneKey &&
        o.recycle?.bonusGranted === true &&
        sameMonth(o.recycle?.verifiedAt)
    );

    const grantBonus = kg >= 1 && !bonusUsedThisMonth;
    const bonusNote = grantBonus
      ? 'Stempel bonus ditambahkan.'
      : kg < 1
      ? 'Stempel bonus tidak diberikan karena berat di bawah 1 kg.'
      : 'Stempel bonus bulan ini sudah terpakai.';

    const updatedRecycle: RecycleOrderData = {
      ...ord.recycle,
      status: 'verified',
      finalKg: kg,
      verifiedAt: now.toISOString(),
      bonusGranted: grantBonus,
      rejectReason: '',
    };

    // Update lokal dulu supaya klik ganda tidak lolos, lalu simpan ke Firestore
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, recycle: updatedRecycle } : o)));
    updateOrderInFirestore(orderId, {
      recycle: updatedRecycle,
      lastUpdatedLabel: 'Baju daur ulang diverifikasi',
    }).catch(() => {});

    // Update stok & angka dampak. Peserta baru = pelanggan ini belum pernah punya daur ulang terverifikasi.
    const hadVerifiedBefore = orders.some(
      (o) =>
        o.id !== ord.id &&
        normalizePhoneNumber(o.customerPhone) === phoneKey &&
        o.recycle?.status === 'verified'
    );
    applyRecycleVerificationStats({
      finalKg: kg,
      isNewParticipant: !hadVerifiedBefore,
    }).catch(() => {});

    sendOrUpdateNotification({
      customerPhone: ord.customerPhone,
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      title: 'Daur Ulang Baju Diverifikasi',
      body: `Terima kasih! Baju daur ulang ${kg} kg dari pesanan ${ord.orderNumber} sudah diterima. ${bonusNote}`,
      type: 'recycle_verified' as any,
    }).catch(() => {});

    return {
      ok: true,
      bonusGranted: grantBonus,
      message: `Terverifikasi. ${bonusNote}`,
      recycle: updatedRecycle,
    };
  };

  const rejectOrderRecycleByAdmin = (
    orderId: string,
    reason: string
  ): { ok: boolean; message: string; recycle?: RecycleOrderData } => {
    if (!hasPermission('orders_status_update')) {
      alert('Akses ditolak: Anda tidak memiliki izin memverifikasi baju daur ulang.');
      return { ok: false, message: 'Akses ditolak.' };
    }
    const ord = orders.find((o) => o.id === orderId);
    if (!ord || !ord.recycle?.enabled) {
      return { ok: false, message: 'Order ini tidak memiliki daur ulang.' };
    }
    if (ord.recycle.status !== 'pending_verification') {
      return { ok: false, message: 'Daur ulang order ini sudah diproses.' };
    }
    if (!reason.trim()) {
      return { ok: false, message: 'Alasan penolakan wajib diisi.' };
    }

    const updatedRecycle: RecycleOrderData = {
      ...ord.recycle,
      status: 'rejected',
      rejectReason: reason.trim(),
      bonusGranted: false,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, recycle: updatedRecycle } : o)));
    updateOrderInFirestore(orderId, {
      recycle: updatedRecycle,
      lastUpdatedLabel: 'Baju daur ulang ditolak admin',
    }).catch(() => {});

    sendOrUpdateNotification({
      customerPhone: ord.customerPhone,
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      title: 'Baju Daur Ulang Tidak Memenuhi Syarat',
      body: `Pesanan ${ord.orderNumber}: ${reason.trim()}.`,
      type: 'recycle_rejected' as any,
    }).catch(() => {});

    return { ok: true, message: 'Baju daur ulang ditolak.', recycle: updatedRecycle };
  };

  const choosePaymentMethod = (orderId: string, method: PaymentMethod) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const nowIso = new Date().toISOString();
    const partial: Partial<Order> = {
      paymentMethod: method,
      paymentChosenAt: nowIso,
      lastUpdatedLabel: `Metode ${method} dipilih`,
    };

    updateOrderInFirestore(orderId, partial).catch(() => {});
  };

  const confirmCodCashReceived = (orderId: string) => {
    if (!hasPermission('courier_handover_update')) {
      alert('Akses ditolak: Anda tidak memiliki hak akses courier_handover_update.');
      return;
    }
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    const courierName = currentStaffUser?.name || courierUsername || 'Kurir Laundrea';
    const nowIso = new Date().toISOString();

    updateOrderInFirestore(orderId, {
      paymentStatus: 'paid',
      paidTo: courierName,
      paidAt: nowIso,
      lastUpdatedLabel: `Dibayar tunai ke kurir ${courierName}`,
    }).catch(() => {});

    sendOrUpdateNotification({
      customerPhone: ord.customerPhone,
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      title: `Pembayaran Tunai Diterima`,
      body: `Pembayaran Tunai Diterima — Pesanan ${ord.orderNumber}.`,
      type: 'cash_received',
    }).catch(() => {});
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    // Requirement 5: For paymentFlowV2 orders, cannot move to washing or later until payment status is 'paid'
    if (ord.paymentFlowV2) {
      const processingStatuses: OrderStatus[] = ['washing', 'drying', 'ironing', 'ready', 'delivered'];
      if (processingStatuses.includes(newStatus) && ord.paymentStatus !== 'paid') {
        alert('Menunggu pembayaran terverifikasi sebelum memulai pencucian.');
        return;
      }
    }

    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const updatedTimestamps = {
      ...ord.statusTimestamps,
      [newStatus]: timeStr,
    };

        // Cap hanya diberikan sekali, saat admin mengubah status menjadi Selesai (delivered).
    // Dicek lewat penanda stampGiven di pesanan (bukan stampHistory milik akun yang login),
    // dan hanya untuk user yang punya izin ubah status (kurir tidak punya).
    const shouldAwardStamp =
      newStatus === 'delivered' &&
      hasPermission('orders_status_update') &&
      !ord.stampGiven &&
      !stampHistory.some((sh) => sh.orderNumber === ord.orderNumber && sh.type === 'earned');

    updateOrderInFirestore(orderId, {
      status: newStatus,
      statusTimestamps: updatedTimestamps,
      lastUpdatedLabel: `Status ${newStatus}`,
      ...(shouldAwardStamp ? { stampGiven: true } : {}),
    }).catch(() => {});

    // Cegah klik ganda sebelum Firestore sempat sinkron
    if (shouldAwardStamp) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, stampGiven: true } : o)));
    }

    const statusLabels: Record<string, string> = {
      pickup: 'Penjemputan',
      picked_up: 'Dijemput Kurir',
      washing: 'Pencucian',
      drying: 'Pengeringan',
      ironing: 'Penyetrikaan',
      ready: 'Siap Antar',
      delivered: 'Selesai',
    };

    // 1) Notifikasi status DULU
    sendOrUpdateNotification({
      customerPhone: ord.customerPhone,
      orderId: ord.id,
      orderNumber: ord.orderNumber,
      title: `Status Pesanan Diperbarui`,
      body: `Pesanan ${ord.orderNumber} sekarang: ${statusLabels[newStatus] || newStatus}`,
      type: 'status_changed',
    }).catch(() => {});

    // 2) Cap + notifikasi cap SESUDAH, supaya jadi notifikasi terbaru (yang muncul di toast)
    if (shouldAwardStamp) {
      const finalQty = ord.actualQuantity || ord.estimatedQuantity;
      const newStamp: StampHistoryItem = {
        id: `stmp-${Date.now()}`,
        orderNumber: ord.orderNumber,
        date: now.toISOString().slice(0, 10),
        type: 'earned',
        title: `Pesanan ${ord.planName} (${finalQty} ${ord.unit})`,
        pointsChange: 1,
      };
      // Pakai ord.customerPhone = akun pemilik pesanan, bukan nama di form pemesanan
      saveStampHistoryItem(ord.customerPhone, newStamp).catch(() => {});

      
      sendOrUpdateNotification({
        customerPhone: ord.customerPhone,
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        title: `Stempel Bertambah 🎉`,
        body: `Selamat! Kamu berhasil mendapatkan 1 stempel dari pesanan ${ord.orderNumber}.`,
        type: 'stamp_earned',
      }).catch(() => {});
    }
  };

  const updateOrderPaymentStatus = (
    orderId: string,
    paymentStatus: 'not_due' | 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid'
  ) => {
    const ord = orders.find((o) => o.id === orderId);
    if (!ord) return;

    if (paymentStatus === 'paid') {
      if (!hasPermission('payment_confirm')) {
        alert('Akses ditolak: Anda tidak memiliki hak akses payment_confirm.');
        return;
      }
      sendOrUpdateNotification({
        customerPhone: ord.customerPhone,
        orderId: ord.id,
        orderNumber: ord.orderNumber,
        title: `Pembayaran Terverifikasi`,
        body: `Pembayaran Terverifikasi — Pesanan ${ord.orderNumber} masuk antrean pencucian.`,
        type: 'payment_verified',
      }).catch(() => {});
    }

    updateOrderInFirestore(orderId, {
      paymentStatus,
      lastUpdatedLabel: `Pembayaran: ${paymentStatus}`,
    }).catch(() => {});
  };

  const assignCourier = (orderId: string, courierId: string) => {
    if (!hasPermission('orders_dispatch')) {
      alert('Akses ditolak: Anda tidak memiliki hak akses orders_dispatch.');
      return;
    }
    const selectedCourier = couriers.find((c) => c.id === courierId);
    if (!selectedCourier) return;

    updateOrderInFirestore(orderId, {
      courierId: selectedCourier.id,
      courierName: selectedCourier.name,
    }).catch(() => {});
  };

  const addCourier = (data: { name: string; phone: string; email?: string; vehicle?: string }) => {
    const newCourier: Courier = {
      id: `cr-${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@laundrea.id`,
      status: 'active',
      activePickupsCount: 0,
      completedTodayCount: 0,
      completedThisWeekCount: 0,
      averageRating: 5.0,
      vehicle: data.vehicle || 'Motor Operasional Laundrea',
    };
    saveCourierToFirestore(newCourier).catch(() => {});
  };

  const toggleCourierStatus = (courierId: string) => {
    const cr = couriers.find((c) => c.id === courierId);
    if (!cr) return;
    updateCourierInFirestore(courierId, {
      status: cr.status === 'active' ? 'inactive' : 'active',
    }).catch(() => {});
  };

  const scheduleDelivery = (orderId: string, deliveryTime: string) => {
    updateOrderInFirestore(orderId, { deliveryScheduledTime: deliveryTime }).catch(() => {});
  };

  const updatePlan = (updatedPlan: Plan) => {
    updatePlanInFirestore(updatedPlan.id, updatedPlan).catch(() => {});
  };

  const addPromo = (code: string, discount: number, minOrder: number = 0) => {
    const newPromo: PromoCode = {
      id: `prm-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountPercent: discount,
      isActive: true,
      minOrderValue: minOrder,
    };
    savePromoToFirestore(newPromo).catch(() => {});
  };

  const togglePromo = (id: string) => {
    const pr = promos.find((p) => p.id === id);
    if (!pr) return;
    updatePromoInFirestore(id, { isActive: !pr.isActive }).catch(() => {});
  };

  const addOperationalCost = (category: string, amount: number) => {
    const newCost: OperationalCostItem = {
      id: `cost-${Date.now()}`,
      category,
      amount,
      date: new Date().toISOString().slice(0, 10),
    };
    saveOperationalCostToFirestore(newCost).catch(() => {});
  };

  const addSystemUser = (user: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const newUser: SystemUser = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    saveSystemUserToFirestore(newUser).catch(() => {});
    if (user.roleCategory === 'courier') {
      const existingCourier = couriers.find(
        (c) => c.phone === user.phone || c.name.toLowerCase() === user.name.toLowerCase()
      );
      if (!existingCourier) {
        addCourier({
          name: user.name,
          phone: user.phone,
          email: user.email,
          vehicle: user.vehicleInfo || 'Motor Operasional Laundrea',
        });
      }
    }
  };

  const updateSystemUser = (id: string, partial: Partial<SystemUser>) => {
    updateSystemUserInFirestore(id, partial).catch(() => {});
  };

  const toggleSystemUserStatus = (id: string) => {
    const u = systemUsers.find((user) => user.id === id);
    if (!u) return;
    const nextStatus = u.status === 'active' ? 'inactive' : 'active';
    updateSystemUserInFirestore(id, { status: nextStatus }).catch(() => {});
    if (u.roleCategory === 'courier') {
      const matchedCourier = couriers.find((c) => c.phone === u.phone || c.name === u.name);
      if (matchedCourier) {
        toggleCourierStatus(matchedCourier.id);
      }
    }
  };

  const deleteSystemUser = (id: string) => {
    deleteSystemUserFromFirestore(id).catch(() => {});
  };

  const resetUserPasswordOrPin = (id: string, _tempSecret: string) => {
    updateSystemUserInFirestore(id, {
      lastLogin: `Kredensial direset (${new Date().toLocaleDateString('id-ID')})`,
    }).catch(() => {});
  };

  const updateRolePermissions = (roleId: string, permissions: string[]) => {
    updateSystemRoleInFirestore(roleId, { permissions }).catch(() => {});
  };

  const addSystemRole = (role: Omit<SystemRole, 'id'>) => {
    const newRole: SystemRole = {
      ...role,
      id: `role-${Date.now()}`,
    };
    saveSystemRoleToFirestore(newRole).catch(() => {});
  };

  const resetAllData = () => {
    setPlans(INITIAL_PLANS);
    setOrders(INITIAL_ORDERS);
    setCouriers(INITIAL_COURIERS);
    setCustomers(INITIAL_CUSTOMERS);
    setPromos(INITIAL_PROMOS);
    setOperationalCosts(INITIAL_OPERATIONAL_COSTS);
    setSystemUsers(INITIAL_SYSTEM_USERS);
    setSystemRoles(INITIAL_SYSTEM_ROLES);
    setStampHistory(INITIAL_STAMP_HISTORY);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isCustomerVerified,
        customerPhone,
        customerName,
        customerAddress,
        activeCustomerOrderId,
        verifyCustomer,
        updateCustomerProfile,
        logoutCustomer,
        setActiveCustomerOrderId,
        isCourierLoggedIn,
        courierUsername,
        loginCourier,
        logoutCourier,
        isAdminLoggedIn,
        adminUsername,
        loginAdmin,
        logoutAdmin,
        plans,
        orders,
        couriers,
        customers,
        promos,
        operationalCosts,
        systemUsers,
        systemRoles,
        systemPermissions,
        hasPermission,
        staffRoleLabel,
        currentStaffRole,
        currentStaffUser,
        addSystemUser,
        updateSystemUser,
        toggleSystemUserStatus,
        deleteSystemUser,
        resetUserPasswordOrPin,
        updateRolePermissions,
        addSystemRole,
        stampsCount,
        stampHistory,
        customerVouchers,
        claimLoyaltyVoucher,
        addTestStamp,
        markVoucherAsUsed,
        redeemFreeWash,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        newNotificationToast,
        dismissToast,
        recycleSettings,
        impactStats,
        artisans,
        recycleWorks,
        isFirestoreLoading,
        firestoreError,
        createOrder,
        updateOrderWeight,
        rejectOrderRecycle,
        verifyOrderRecycle,
        rejectOrderRecycleByAdmin,
        updateOrderStatus,
        updateOrderPaymentStatus,
        choosePaymentMethod,
        confirmCodCashReceived,
        assignCourier,
        addCourier,
        toggleCourierStatus,
        scheduleDelivery,
        updatePlan,
        addPromo,
        togglePromo,
        addOperationalCost,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
