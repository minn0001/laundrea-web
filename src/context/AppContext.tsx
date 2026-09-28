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
} from '../data/initialData';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  // Customer Auth
  isCustomerVerified: boolean;
  customerPhone: string;
  activeCustomerOrderId: string | null;
  verifyCustomer: (phone: string) => void;
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
    paymentMethod: PaymentMethod;
    voucherCode?: string;
    voucherDiscount?: number;
  }) => Order;
  updateOrderWeight: (orderId: string, actualWeight: number) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, paymentStatus: 'pending' | 'paid') => void;
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
    return localStorage.getItem('laundrea_cust_phone') || '081234567890';
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

  // Fresh initial load: ensure user sees the role selection screen on first arrival
  useEffect(() => {
    if (!localStorage.getItem('laundrea_role_auth_v2')) {
      localStorage.setItem('laundrea_role_auth_v2', 'true');
      setIsCustomerVerified(false);
      setIsCourierLoggedIn(false);
      setIsAdminLoggedIn(false);
      localStorage.setItem('laundrea_cust_verified', 'false');
      localStorage.setItem('laundrea_courier_logged_in', 'false');
      localStorage.setItem('laundrea_admin_logged_in', 'false');
      localStorage.removeItem('laundrea_current_role');
    }
  }, []);

  // Main datasets with local storage persistence
  const [plans, setPlans] = useState<Plan[]>(() => {
    const saved = localStorage.getItem('laundrea_plans');
    return saved ? JSON.parse(saved) : INITIAL_PLANS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('laundrea_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [couriers, setCouriers] = useState<Courier[]>(() => {
    const saved = localStorage.getItem('laundrea_couriers_v2');
    if (!saved) {
      localStorage.removeItem('laundrea_couriers');
      return INITIAL_COURIERS;
    }
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_COURIERS;
      return parsed;
    } catch {
      return INITIAL_COURIERS;
    }
  });

  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    const saved = localStorage.getItem('laundrea_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [promos, setPromos] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('laundrea_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });

  const [operationalCosts, setOperationalCosts] = useState<OperationalCostItem[]>(() => {
    const saved = localStorage.getItem('laundrea_costs');
    return saved ? JSON.parse(saved) : INITIAL_OPERATIONAL_COSTS;
  });

  // System Management State (Admin & Courier accounts only: 1 Super Admin, 2 Admin Kasir/Operasional, 2 Kurir)
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('laundrea_system_users_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback to INITIAL_SYSTEM_USERS
      }
    }
    localStorage.removeItem('laundrea_system_users');
    localStorage.removeItem('laundrea_system_users_v2');
    return INITIAL_SYSTEM_USERS;
  });

  const [systemRoles, setSystemRoles] = useState<SystemRole[]>(() => {
    const saved = localStorage.getItem('laundrea_system_roles_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 3) {
          return parsed;
        }
      } catch {
        // fallback to INITIAL_SYSTEM_ROLES
      }
    }
    localStorage.removeItem('laundrea_system_roles');
    return INITIAL_SYSTEM_ROLES;
  });

  const [systemPermissions] = useState<PermissionItem[]>(INITIAL_SYSTEM_PERMISSIONS);

  // Stamps Loyalty State
  const [stampsCount, setStampsCount] = useState<number>(() => {
    const saved = localStorage.getItem('laundrea_stamps_count');
    return saved !== null ? parseInt(saved, 10) : 10;
  });

  const [stampHistory, setStampHistory] = useState<StampHistoryItem[]>(() => {
    const saved = localStorage.getItem('laundrea_stamp_history');
    return saved ? JSON.parse(saved) : INITIAL_STAMP_HISTORY;
  });

  // Customer Vouchers State
  const [customerVouchers, setCustomerVouchers] = useState<CustomerVoucher[]>(() => {
    const saved = localStorage.getItem('laundrea_customer_vouchers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_VOUCHERS;
  });

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem('laundrea_cust_verified', String(isCustomerVerified));
    localStorage.setItem('laundrea_cust_phone', customerPhone);
    if (activeCustomerOrderId) {
      localStorage.setItem('laundrea_cust_order_id', activeCustomerOrderId);
    }
  }, [isCustomerVerified, customerPhone, activeCustomerOrderId]);

  useEffect(() => {
    localStorage.setItem('laundrea_courier_logged_in', String(isCourierLoggedIn));
    localStorage.setItem('laundrea_courier_user', courierUsername);
  }, [isCourierLoggedIn, courierUsername]);

  useEffect(() => {
    localStorage.setItem('laundrea_admin_logged_in', String(isAdminLoggedIn));
    localStorage.setItem('laundrea_admin_user', adminUsername);
  }, [isAdminLoggedIn, adminUsername]);

  useEffect(() => {
    localStorage.setItem('laundrea_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('laundrea_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('laundrea_couriers_v2', JSON.stringify(couriers));
  }, [couriers]);

  useEffect(() => {
    localStorage.setItem('laundrea_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('laundrea_promos', JSON.stringify(promos));
  }, [promos]);

  useEffect(() => {
    localStorage.setItem('laundrea_costs', JSON.stringify(operationalCosts));
  }, [operationalCosts]);

  useEffect(() => {
    localStorage.setItem('laundrea_stamps_count', stampsCount.toString());
  }, [stampsCount]);

  useEffect(() => {
    localStorage.setItem('laundrea_stamp_history', JSON.stringify(stampHistory));
  }, [stampHistory]);

  useEffect(() => {
    localStorage.setItem('laundrea_customer_vouchers', JSON.stringify(customerVouchers));
  }, [customerVouchers]);

  useEffect(() => {
    localStorage.setItem('laundrea_system_users_v3', JSON.stringify(systemUsers));
  }, [systemUsers]);

  useEffect(() => {
    localStorage.setItem('laundrea_system_roles_v2', JSON.stringify(systemRoles));
  }, [systemRoles]);

  // Actions
  const verifyCustomer = (phone: string) => {
    setRole('customer');
    setIsCustomerVerified(true);
    setCustomerPhone(phone);
    localStorage.setItem('laundrea_cust_verified', 'true');
    localStorage.setItem('laundrea_current_role', 'customer');
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  };

  const logoutCustomer = () => {
    setIsCustomerVerified(false);
    localStorage.removeItem('laundrea_cust_verified');
    localStorage.setItem('laundrea_cust_verified', 'false');
    localStorage.removeItem('laundrea_current_role');
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
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/staff')) {
      window.history.pushState({}, '', '/staff');
      window.dispatchEvent(new Event('popstate'));
    }
  };

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

    setStampsCount((prev) => Math.max(0, prev - 10));
    setCustomerVouchers((prev) => [newVoucher, ...prev]);

    const newItem: StampHistoryItem = {
      id: `stmp-${Date.now()}`,
      date: dateStr,
      type: 'redeemed',
      title: `Klaim Voucher Cuci Gratis (Kode: ${newVoucher.code})`,
      pointsChange: -10,
    };
    setStampHistory((prev) => [newItem, ...prev]);

    return newVoucher;
  };

  const addTestStamp = () => {
    setStampsCount((prev) => prev + 1);
    const now = new Date();
    const newItem: StampHistoryItem = {
      id: `stmp-${Date.now()}`,
      date: now.toISOString().slice(0, 10),
      type: 'earned',
      title: 'Bonus Stempel Loyalitas (+1 Stempel)',
      pointsChange: 1,
    };
    setStampHistory((prev) => [newItem, ...prev]);
  };

  const markVoucherAsUsed = (code: string, orderNumber: string) => {
    setCustomerVouchers((prev) =>
      prev.map((v) =>
        v.code.toUpperCase() === code.toUpperCase()
          ? { ...v, isUsed: true, usedAtOrderNumber: orderNumber }
          : v
      )
    );
  };

  const redeemFreeWash = (): boolean => {
    const claimed = claimLoyaltyVoucher();
    return claimed !== null;
  };

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
    paymentMethod: PaymentMethod;
    voucherCode?: string;
    voucherDiscount?: number;
  }): Order => {
    const selectedPlan = plans.find((p) => p.id === data.planId) || plans[0];
    const unitPrice = selectedPlan.price;
    const subtotalPrice = unitPrice * data.estimatedQuantity;
    const discount = data.voucherDiscount && data.voucherDiscount > 0 ? Math.min(data.voucherDiscount, subtotalPrice) : 0;
    const estimatedPrice = Math.max(0, subtotalPrice - discount);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const orderNumber = `LND-${dateStr}-${randomSuffix}`;
    const newId = `ord-${Date.now()}`;

    // Auto-assign first active courier
    const activeCourier = couriers.find((c) => c.status === 'active') || couriers[0];

    const newOrder: Order = {
      id: newId,
      orderNumber,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      planId: data.planId,
      planName: selectedPlan.name,
      unitPrice,
      estimatedQuantity: data.estimatedQuantity,
      subtotalPrice,
      voucherCode: data.voucherCode,
      voucherDiscount: discount,
      estimatedPrice,
      unit: selectedPlan.unit,
      pickupDate: data.pickupDate,
      pickupTime: data.pickupTime,
      handoverMethod: data.handoverMethod || 'pickup_by_courier',
      returnMethod: data.returnMethod || 'deliver_to_me',
      status: 'pickup', // Initial booking queued for pickup
      statusTimestamps: {
        booked: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        pickup: `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      },
      courierId: activeCourier?.id,
      courierName: activeCourier?.name,
      notes: data.notes,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'pending',
      lastUpdatedLabel: 'Baru saja',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveCustomerOrderId(newId);

    // If a voucher was used, mark it as consumed
    if (data.voucherCode) {
      markVoucherAsUsed(data.voucherCode, orderNumber);
    }

    // Award +1 stamp in loyalty
    setStampsCount((prev) => prev + 1);
    const newStamp: StampHistoryItem = {
      id: `stmp-${Date.now()}`,
      orderNumber,
      date: now.toISOString().slice(0, 10),
      type: 'earned',
      title: `Order ${selectedPlan.name} (${data.estimatedQuantity} ${selectedPlan.unit})`,
      pointsChange: 1,
    };
    setStampHistory((prev) => [newStamp, ...prev]);

    // Update or add customer profile
    setCustomers((prev) => {
      const existing = prev.find((c) => c.phone === data.customerPhone);
      if (existing) {
        const nextTotal = existing.totalOrders + 1;
        return prev.map((c) =>
          c.phone === data.customerPhone
            ? {
                ...c,
                totalOrders: nextTotal,
                lastOrderDate: now.toISOString().slice(0, 10),
                totalSpent: c.totalSpent + estimatedPrice,
                stampsCount: (c.stampsCount || 0) + 1,
                tier: nextTotal >= 10 ? 'Gold' : nextTotal >= 5 ? 'Silver' : 'Bronze',
              }
            : c
        );
      } else {
        const newCust: CustomerProfile = {
          id: `cust-${Date.now()}`,
          name: data.customerName,
          phone: data.customerPhone,
          address: data.customerAddress,
          totalOrders: 1,
          lastOrderDate: now.toISOString().slice(0, 10),
          totalSpent: estimatedPrice,
          stampsCount: 1,
          tier: 'Bronze',
        };
        return [newCust, ...prev];
      }
    });

    return newOrder;
  };

  const updateOrderWeight = (orderId: string, actualWeight: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const actualPrice = Math.round(ord.unitPrice * actualWeight);
          return {
            ...ord,
            actualQuantity: actualWeight,
            actualPrice,
            lastUpdatedLabel: 'Weight verified',
          };
        }
        return ord;
      })
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const now = new Date();
    const timeStr = `${now.toISOString().slice(0, 10)} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedTimestamps = {
            ...ord.statusTimestamps,
            [newStatus]: timeStr,
          };
          return {
            ...ord,
            status: newStatus,
            statusTimestamps: updatedTimestamps,
            lastUpdatedLabel: 'Updated just now',
          };
        }
        return ord;
      })
    );
  };

  const updateOrderPaymentStatus = (orderId: string, paymentStatus: 'pending' | 'paid') => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus } : ord))
    );
  };

  const assignCourier = (orderId: string, courierId: string) => {
    const selectedCourier = couriers.find((c) => c.id === courierId);
    if (!selectedCourier) return;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, courierId: selectedCourier.id, courierName: selectedCourier.name }
          : ord
      )
    );
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
    setCouriers((prev) => [...prev, newCourier]);
  };

  const toggleCourierStatus = (courierId: string) => {
    setCouriers((prev) =>
      prev.map((c) =>
        c.id === courierId
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
          : c
      )
    );
  };

  const scheduleDelivery = (orderId: string, deliveryTime: string) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, deliveryScheduledTime: deliveryTime }
          : ord
      )
    );
  };

  const updatePlan = (updatedPlan: Plan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  };

  const addPromo = (code: string, discount: number, minOrder: number = 0) => {
    const newPromo: PromoCode = {
      id: `prm-${Date.now()}`,
      code: code.toUpperCase().trim(),
      discountPercent: discount,
      isActive: true,
      minOrderValue: minOrder,
    };
    setPromos((prev) => [newPromo, ...prev]);
  };

  const togglePromo = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const addOperationalCost = (category: string, amount: number) => {
    const newCost: OperationalCostItem = {
      id: `cost-${Date.now()}`,
      category,
      amount,
      date: new Date().toISOString().slice(0, 10),
    };
    setOperationalCosts((prev) => [newCost, ...prev]);
  };

  // System Management Actions (Admin & Courier accounts only)
  const addSystemUser = (user: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const prefix = user.roleCategory === 'admin' ? 'usr-adm' : 'usr-cr';
    const newId = `${prefix}-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const avatarBg =
      user.roleCategory === 'admin'
        ? 'from-[#254117] to-[#cd6184]'
        : 'from-[#0284c7] to-[#254117]';

    const newUser: SystemUser = {
      ...user,
      id: newId,
      createdAt: today,
      lastLogin: 'Belum pernah login',
      avatarBg,
    };

    setSystemUsers((prev) => [newUser, ...prev]);

    // If it's a courier, also synchronize to couriers list if not already present
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
    setSystemUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...partial } : u))
    );
  };

  const toggleSystemUserStatus = (id: string) => {
    setSystemUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          // Also sync courier status if courier
          if (u.roleCategory === 'courier') {
            const matchedCourier = couriers.find((c) => c.phone === u.phone || c.name === u.name);
            if (matchedCourier) {
              toggleCourierStatus(matchedCourier.id);
            }
          }
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const deleteSystemUser = (id: string) => {
    setSystemUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const resetUserPasswordOrPin = (id: string, _tempSecret: string) => {
    setSystemUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              lastLogin: `Kredensial direset (${new Date().toLocaleDateString('id-ID')})`,
            }
          : u
      )
    );
  };

  const updateRolePermissions = (roleId: string, permissions: string[]) => {
    setSystemRoles((prev) =>
      prev.map((r) => (r.id === roleId ? { ...r, permissions } : r))
    );
  };

  const addSystemRole = (role: Omit<SystemRole, 'id'>) => {
    const newRole: SystemRole = {
      ...role,
      id: `role-${Date.now()}`,
    };
    setSystemRoles((prev) => [...prev, newRole]);
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
    setStampsCount(7);
    setStampHistory(INITIAL_STAMP_HISTORY);
    localStorage.removeItem('laundrea_plans');
    localStorage.removeItem('laundrea_orders');
    localStorage.removeItem('laundrea_couriers');
    localStorage.removeItem('laundrea_couriers_v2');
    localStorage.removeItem('laundrea_customers');
    localStorage.removeItem('laundrea_promos');
    localStorage.removeItem('laundrea_costs');
    localStorage.removeItem('laundrea_system_users');
    localStorage.removeItem('laundrea_system_users_v2');
    localStorage.removeItem('laundrea_system_users_v3');
    localStorage.removeItem('laundrea_system_roles');
    localStorage.removeItem('laundrea_system_roles_v2');
    localStorage.removeItem('laundrea_stamps_count');
    localStorage.removeItem('laundrea_stamp_history');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isCustomerVerified,
        customerPhone,
        activeCustomerOrderId,
        verifyCustomer,
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
        createOrder,
        updateOrderWeight,
        updateOrderStatus,
        updateOrderPaymentStatus,
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

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

