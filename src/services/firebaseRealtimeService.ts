import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  db,
  ensureSilentAuth,
  normalizePhoneNumber,
  DEFAULT_DEMO_PHONE,
  sanitizeFirestoreData,
} from './firebaseService';
import {
  Order,
  Courier,
  Plan,
  PromoCode,
  OperationalCostItem,
  SystemUser,
  SystemRole,
  StampHistoryItem,
  CustomerVoucher,
  AppNotification,
  ArtisanItem,
  RecycleWorkItem,
  ImpactStats,
  RecycleProgramSettings,
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_COURIERS,
  INITIAL_PLANS,
  INITIAL_PROMOS,
  INITIAL_OPERATIONAL_COSTS,
  INITIAL_SYSTEM_USERS,
  INITIAL_SYSTEM_ROLES,
  INITIAL_STAMP_HISTORY,
  INITIAL_CUSTOMER_VOUCHERS,
  INITIAL_RECYCLE_PROGRAM_SETTINGS,
  INITIAL_IMPACT_STATS,
  INITIAL_ARTISANS,
  INITIAL_RECYCLE_WORKS,
} from '../data/initialData';

// Track seeding status to avoid duplicate writes
let isSeeded = false;

/**
 * Seed initial data if collections are empty.
 * Uses existing document IDs as keys to prevent duplicates across multiple opening devices.
 */
export async function seedFirestoreCollectionsIfEmpty(): Promise<void> {
  if (isSeeded) return;
  try {
    await ensureSilentAuth();

    // 1. Orders
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (ordersSnap.empty) {
      for (const ord of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
    }

    // 2. Couriers
    const couriersSnap = await getDocs(collection(db, 'couriers'));
    if (couriersSnap.empty) {
      for (const cr of INITIAL_COURIERS) {
        await setDoc(doc(db, 'couriers', cr.id), cr);
      }
    }

    // 3. Plans
    const plansSnap = await getDocs(collection(db, 'plans'));
    if (plansSnap.empty) {
      for (const pl of INITIAL_PLANS) {
        await setDoc(doc(db, 'plans', pl.id), pl);
      }
    }

    // 4. Promos
    const promosSnap = await getDocs(collection(db, 'promos'));
    if (promosSnap.empty) {
      for (const pr of INITIAL_PROMOS) {
        await setDoc(doc(db, 'promos', pr.id), pr);
      }
    }

    // 5. Operational Costs
    const costsSnap = await getDocs(collection(db, 'operationalCosts'));
    if (costsSnap.empty) {
      for (const c of INITIAL_OPERATIONAL_COSTS) {
        await setDoc(doc(db, 'operationalCosts', c.id), c);
      }
    }

    // 6. System Users
    const usersSnap = await getDocs(collection(db, 'systemUsers'));
    if (usersSnap.empty) {
      for (const u of INITIAL_SYSTEM_USERS) {
        await setDoc(doc(db, 'systemUsers', u.id), u);
      }
    }

    // 7. System Roles
    const rolesSnap = await getDocs(collection(db, 'systemRoles'));
    if (rolesSnap.empty) {
      for (const r of INITIAL_SYSTEM_ROLES) {
        await setDoc(doc(db, 'systemRoles', r.id), sanitizeFirestoreData(r));
      }
    } else {
      // Ensure default system roles have the strictly enforced permissions
      for (const r of INITIAL_SYSTEM_ROLES) {
        const existingDoc = rolesSnap.docs.find((d) => d.id === r.id);
        if (existingDoc) {
          await setDoc(doc(db, 'systemRoles', r.id), sanitizeFirestoreData(r), { merge: true });
        } else {
          await setDoc(doc(db, 'systemRoles', r.id), sanitizeFirestoreData(r));
        }
      }
    }

    // 8. Seed stamp history only for demo number 081234567890
    const demoPhoneNorm = normalizePhoneNumber(DEFAULT_DEMO_PHONE);
    const stampSnap = await getDocs(
      query(collection(db, 'stampHistory'), where('customerPhone', '==', demoPhoneNorm))
    );
    if (stampSnap.empty) {
      for (const st of INITIAL_STAMP_HISTORY) {
        await setDoc(doc(db, 'stampHistory', st.id), {
          ...st,
          customerPhone: demoPhoneNorm,
        });
      }
    }

    // 9. Seed customer vouchers only for demo number 081234567890
    const vchSnap = await getDocs(
      query(collection(db, 'customerVouchers'), where('customerPhone', '==', demoPhoneNorm))
    );
    if (vchSnap.empty) {
      for (const v of INITIAL_CUSTOMER_VOUCHERS) {
        await setDoc(doc(db, 'customerVouchers', v.id), {
          ...v,
          customerPhone: demoPhoneNorm,
        });
      }
    }

    // 10. Seed recycleProgram settings if not present
    const recycleSettingsRef = doc(db, 'settings', 'recycleProgram');
    const recycleSettingsSnap = await getDoc(recycleSettingsRef);
    if (!recycleSettingsSnap.exists()) {
      await setDoc(recycleSettingsRef, sanitizeFirestoreData(INITIAL_RECYCLE_PROGRAM_SETTINGS));
    }

    // 11. Seed impactStats if not present
    const impactStatsRef = doc(db, 'settings', 'impactStats');
    const impactStatsSnap = await getDoc(impactStatsRef);
    if (!impactStatsSnap.exists()) {
      await setDoc(impactStatsRef, sanitizeFirestoreData(INITIAL_IMPACT_STATS));
    }

    // 12. Seed artisans if collection empty
    const artisansSnap = await getDocs(collection(db, 'artisans'));
    if (artisansSnap.empty) {
      for (const a of INITIAL_ARTISANS) {
        await setDoc(doc(db, 'artisans', a.id), sanitizeFirestoreData(a));
      }
    }

    // 13. Seed recycleWorks if collection empty
    const worksSnap = await getDocs(collection(db, 'recycleWorks'));
    if (worksSnap.empty) {
      for (const w of INITIAL_RECYCLE_WORKS) {
        await setDoc(doc(db, 'recycleWorks', w.id), sanitizeFirestoreData(w));
      }
    }

    isSeeded = true;
  } catch (err) {
    console.warn('Seed firestore collections notice:', err);
  }
}

// ================= ORDERS MUTATIONS & LISTENERS =================

export function subscribeToOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'orders'),
    (snap) => {
      const list: Order[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      // Sort orders descending by booked timestamp / creation
      list.sort((a, b) => {
        const timeA = a.statusTimestamps?.booked || a.id;
        const timeB = b.statusTimestamps?.booked || b.id;
        return timeB.localeCompare(timeA);
      });
      onSuccess(list);
    },
    (err) => {
      console.error('subscribeToOrders error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  await ensureSilentAuth();
  await setDoc(doc(db, 'orders', order.id), sanitizeFirestoreData(order));
}

export async function updateOrderInFirestore(orderId: string, partial: Partial<Order>): Promise<void> {
  await ensureSilentAuth();
  await updateDoc(doc(db, 'orders', orderId), sanitizeFirestoreData(partial));
}

// ================= NOTIFICATIONS =================

export function subscribeToNotifications(
  customerPhone: string,
  onSuccess: (notifications: AppNotification[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  const norm = normalizePhoneNumber(customerPhone);
  if (!norm) {
    onSuccess([]);
    return () => {};
  }

  const q = query(collection(db, 'notifications'), where('customerPhone', '==', norm));
  return onSnapshot(
    q,
    (snap) => {
      const list: AppNotification[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      // Newest first
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onSuccess(list);
    },
    (err) => {
      console.error('subscribeToNotifications error:', err);
      if (onError) onError(err);
    }
  );
}

export async function sendOrUpdateNotification(params: {
  customerPhone: string;
  orderId: string;
  orderNumber: string;
  title: string;
  body: string;
  type?: AppNotification['type'];
  isPaymentOpening?: boolean;
}): Promise<void> {
  try {
    await ensureSilentAuth();
    const norm = normalizePhoneNumber(params.customerPhone);
    if (!norm) return;

    if (params.isPaymentOpening) {
      // Deterministic document ID payment-due-{orderId}
      const notifId = `payment-due-${params.orderId}`;
      await setDoc(
        doc(db, 'notifications', notifId),
        sanitizeFirestoreData({
          id: notifId,
          customerPhone: norm,
          orderId: params.orderId,
          orderNumber: params.orderNumber,
          title: params.title,
          body: params.body,
          type: 'payment_opened',
          createdAt: new Date().toISOString(),
          read: false,
        }),
        { merge: true }
      );
      return;
    }

    const newId = `notif-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    await setDoc(
      doc(db, 'notifications', newId),
      sanitizeFirestoreData({
        id: newId,
        customerPhone: norm,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        title: params.title,
        body: params.body,
        type: params.type || 'status_changed',
        createdAt: new Date().toISOString(),
        read: false,
      })
    );
  } catch (err) {
    console.warn('sendOrUpdateNotification notice:', err);
  }
}

export async function markNotificationAsRead(notifId: string): Promise<void> {
  try {
    await ensureSilentAuth();
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (err) {
    console.warn('markNotificationAsRead error:', err);
  }
}

export async function markAllNotificationsAsRead(customerPhone: string): Promise<void> {
  try {
    await ensureSilentAuth();
    const norm = normalizePhoneNumber(customerPhone);
    const q = query(
      collection(db, 'notifications'),
      where('customerPhone', '==', norm),
      where('read', '==', false)
    );
    const snap = await getDocs(q);
    for (const d of snap.docs) {
      await updateDoc(d.ref, { read: true });
    }
  } catch (err) {
    console.warn('markAllNotificationsAsRead error:', err);
  }
}

// ================= COURIERS =================

export function subscribeToCouriers(
  onSuccess: (couriers: Courier[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'couriers'),
    (snap) => {
      const list: Courier[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveCourierToFirestore(courier: Courier): Promise<void> {
  await ensureSilentAuth();
  await setDoc(doc(db, 'couriers', courier.id), sanitizeFirestoreData(courier));
}

export async function updateCourierInFirestore(courierId: string, partial: Partial<Courier>): Promise<void> {
  await ensureSilentAuth();
  await updateDoc(doc(db, 'couriers', courierId), sanitizeFirestoreData(partial));
}

// ================= PLANS =================

export function subscribeToPlans(
  onSuccess: (plans: Plan[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'plans'),
    (snap) => {
      const list: Plan[] = [];
      snap.forEach((d) => list.push({ id: d.id as any, ...(d.data() as any) }));
      if (list.length > 0) onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function updatePlanInFirestore(planId: string, partial: Partial<Plan>): Promise<void> {
  await ensureSilentAuth();
  await updateDoc(doc(db, 'plans', planId), sanitizeFirestoreData(partial));
}

// ================= PROMOS =================

export function subscribeToPromos(
  onSuccess: (promos: PromoCode[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'promos'),
    (snap) => {
      const list: PromoCode[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function savePromoToFirestore(promo: PromoCode): Promise<void> {
  await ensureSilentAuth();
  await setDoc(doc(db, 'promos', promo.id), sanitizeFirestoreData(promo));
}

export async function updatePromoInFirestore(promoId: string, partial: Partial<PromoCode>): Promise<void> {
  await ensureSilentAuth();
  await updateDoc(doc(db, 'promos', promoId), sanitizeFirestoreData(partial));
}

// ================= OPERATIONAL COSTS =================

export function subscribeToOperationalCosts(
  onSuccess: (costs: OperationalCostItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'operationalCosts'),
    (snap) => {
      const list: OperationalCostItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveOperationalCostToFirestore(cost: OperationalCostItem): Promise<void> {
  await ensureSilentAuth();
  await setDoc(doc(db, 'operationalCosts', cost.id), sanitizeFirestoreData(cost));
}

// ================= SYSTEM USERS & ROLES =================

export function subscribeToSystemUsers(
  onSuccess: (users: SystemUser[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'systemUsers'),
    (snap) => {
      const list: SystemUser[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveSystemUserToFirestore(user: SystemUser): Promise<void> {
  await ensureSilentAuth();
  await setDoc(doc(db, 'systemUsers', user.id), sanitizeFirestoreData(user));
}

export async function updateSystemUserInFirestore(userId: string, partial: Partial<SystemUser>): Promise<void> {
  await ensureSilentAuth();
  await updateDoc(doc(db, 'systemUsers', userId), sanitizeFirestoreData(partial));
}

export async function deleteSystemUserFromFirestore(userId: string): Promise<void> {
  await ensureSilentAuth();
  await deleteDoc(doc(db, 'systemUsers', userId));
}

export function subscribeToSystemRoles(
  onSuccess: (roles: SystemRole[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'systemRoles'),
    (snap) => {
      const list: SystemRole[] = [];
      snap.forEach((d) => {
        const item = { id: d.id, ...(d.data() as any) } as SystemRole;
        // Strictly ensure default role permissions adhere to system boundaries
        if (item.id === 'super_admin') {
          item.permissions = (item.permissions || []).filter(
            (p) => !['orders_weigh', 'courier_handover_update', 'courier_task_access'].includes(p)
          );
        } else if (item.id === 'admin_operasional') {
          item.permissions = (item.permissions || []).filter(
            (p) => !['orders_weigh', 'courier_handover_update', 'courier_task_access'].includes(p)
          );
        } else if (item.id === 'courier') {
          item.permissions = [
            'orders_view',
            'orders_weigh',
            'courier_handover_update',
            'courier_task_access',
          ];
        }
        list.push(item);
      });
      if (list.length > 0) onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveSystemRoleToFirestore(role: SystemRole): Promise<void> {
  await ensureSilentAuth();
  let sanitizedRole = { ...role };
  if (sanitizedRole.id === 'super_admin' || sanitizedRole.id === 'admin_operasional') {
    sanitizedRole.permissions = (sanitizedRole.permissions || []).filter(
      (p) => !['orders_weigh', 'courier_handover_update', 'courier_task_access'].includes(p)
    );
  }
  await setDoc(doc(db, 'systemRoles', sanitizedRole.id), sanitizeFirestoreData(sanitizedRole));
}

export async function updateSystemRoleInFirestore(roleId: string, partial: Partial<SystemRole>): Promise<void> {
  await ensureSilentAuth();
  let sanitizedPartial = { ...partial };
  if (roleId === 'super_admin' || roleId === 'admin_operasional') {
    if (sanitizedPartial.permissions) {
      sanitizedPartial.permissions = sanitizedPartial.permissions.filter(
        (p) => !['orders_weigh', 'courier_handover_update', 'courier_task_access'].includes(p)
      );
    }
  } else if (roleId === 'courier' && sanitizedPartial.permissions) {
    sanitizedPartial.permissions = [
      'orders_view',
      'orders_weigh',
      'courier_handover_update',
      'courier_task_access',
    ];
  }
  await updateDoc(doc(db, 'systemRoles', roleId), sanitizeFirestoreData(sanitizedPartial));
}

// ================= STAMPS & VOUCHERS PER CUSTOMER =================

export function subscribeToStampHistory(
  customerPhone: string,
  onSuccess: (items: StampHistoryItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  const norm = normalizePhoneNumber(customerPhone);
  if (!norm) {
    onSuccess([]);
    return () => {};
  }

  const q = query(collection(db, 'stampHistory'), where('customerPhone', '==', norm));
  return onSnapshot(
    q,
    (snap) => {
      const list: StampHistoryItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveStampHistoryItem(phone: string, item: StampHistoryItem): Promise<void> {
  await ensureSilentAuth();
  const norm = normalizePhoneNumber(phone);
  await setDoc(
    doc(db, 'stampHistory', item.id),
    sanitizeFirestoreData({
      ...item,
      customerPhone: norm,
    })
  );
}

export function subscribeToCustomerVouchers(
  customerPhone: string,
  onSuccess: (vouchers: CustomerVoucher[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  const norm = normalizePhoneNumber(customerPhone);
  if (!norm) {
    onSuccess([]);
    return () => {};
  }

  const q = query(collection(db, 'customerVouchers'), where('customerPhone', '==', norm));
  return onSnapshot(
    q,
    (snap) => {
      const list: CustomerVoucher[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onSuccess(list);
    },
    (err) => {
      if (onError) onError(err);
    }
  );
}

export async function saveCustomerVoucher(phone: string, voucher: CustomerVoucher): Promise<void> {
  await ensureSilentAuth();
  const norm = normalizePhoneNumber(phone);
  await setDoc(
    doc(db, 'customerVouchers', voucher.id),
    sanitizeFirestoreData({
      ...voucher,
      customerPhone: norm,
    })
  );
}

export async function updateCustomerVoucherInFirestore(
  voucherId: string,
  partial: Partial<CustomerVoucher>
): Promise<void> {
  await ensureSilentAuth();
  await updateDoc(doc(db, 'customerVouchers', voucherId), sanitizeFirestoreData(partial));
}

// ================= LAUNDREA PEDULI / RECYCLE PROGRAM =================

export function subscribeToRecycleProgramSettings(
  onSuccess: (settings: RecycleProgramSettings) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    doc(db, 'settings', 'recycleProgram'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        onSuccess({
          programActive: data.programActive !== false,
        });
      } else {
        // Safe default: true if missing
        onSuccess({ programActive: true });
      }
    },
    (err) => {
      onSuccess({ programActive: true });
      if (onError) onError(err);
    }
  );
}

export function subscribeToImpactStats(
  onSuccess: (stats: ImpactStats | null) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    doc(db, 'settings', 'impactStats'),
    (snap) => {
      if (snap.exists()) {
        onSuccess(snap.data() as ImpactStats);
      } else {
        onSuccess(null);
      }
    },
    (err) => {
      onSuccess(null);
      if (onError) onError(err);
    }
  );
}

export function subscribeToArtisans(
  onSuccess: (artisans: ArtisanItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'artisans'),
    (snap) => {
      const list: ArtisanItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      onSuccess(list);
    },
    (err) => {
      onSuccess([]);
      if (onError) onError(err);
    }
  );
}

export function subscribeToRecycleWorks(
  onSuccess: (works: RecycleWorkItem[]) => void,
  onError?: (err: Error) => void
): () => void {
  ensureSilentAuth().catch(() => {});
  return onSnapshot(
    collection(db, 'recycleWorks'),
    (snap) => {
      const list: RecycleWorkItem[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
      onSuccess(list);
    },
    (err) => {
      onSuccess([]);
      if (onError) onError(err);
    }
  );
}

