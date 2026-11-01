export type Role = 'customer' | 'courier' | 'admin';

export type PlanType = 'regular' | 'express' | 'per_item';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  unit: string;
  turnaroundTime: string;
  isPopular?: boolean;
  features: string[];
  minOrder?: number;
}

export type OrderStatus =
  | 'pickup'
  | 'washing'
  | 'drying'
  | 'ironing'
  | 'ready'
  | 'delivered'
  | 'picked_up'
  | 'processing';

export type HandoverMethod = 'pickup_by_courier' | 'store_dropoff';
export type ReturnMethod = 'deliver_to_me' | 'self_pickup';
export type PaymentMethod = 'bank_transfer' | 'qris' | 'cod';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  recipientName?: string;
  contactPhone?: string;
  planId: PlanType;
  planName: string;
  unitPrice: number;
  estimatedQuantity: number;
  actualQuantity?: number;
  estimatedPrice: number;
  actualPrice?: number;
  recycleWashKg?: number;
  recycleWashPrice?: number;
  unit: string;
  pickupDate: string;
  pickupTime: string;
  handoverMethod?: HandoverMethod;
  returnMethod?: ReturnMethod;
  status: OrderStatus;
  statusTimestamps: {
    booked: string;
    pickup?: string;
    picked_up?: string;
    washing?: string;
    processing?: string;
    drying?: string;
    ironing?: string;
    ready?: string;
    delivered?: string;
  };
  courierId?: string;
  courierName?: string;
  notes?: string;
  deliveryScheduledTime?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: 'not_due' | 'pending' | 'awaiting_payment' | 'awaiting_verification' | 'paid';
  paymentFlowV2?: boolean;
  paymentChosenAt?: string;
  paidTo?: string;
  paidAt?: string;
  lastUpdatedLabel?: string;
  voucherCode?: string;
  voucherTitle?: string;
  voucherDiscount?: number;
  subtotalPrice?: number;
  stampGiven?: boolean;
  recycle?: RecycleOrderData;
}

export type RecycleMode = 'clean' | 'wash_first';
export type RecycleStatus = 'pending_verification' | 'verified' | 'rejected';

export interface RecycleOrderData {
  enabled: boolean;
  mode: RecycleMode;
  estimatedKg: number;
  actualKg: number | null;
  status: RecycleStatus;
  bonusGranted: boolean;
  rejectReason?: string;
  finalKg?: number;
  verifiedAt?: string;
}

export interface ArtisanItem {
  id: string;
  name: string;
  photo?: string;
  story: string;
  location?: string;
}

export interface RecycleWorkItem {
  id: string;
  title: string;
  imageUrl?: string;
  photo?: string;
  description?: string;
  artisanName?: string;
}

export interface ImpactStats {
  totalKg?: number;
  participants?: number;
  handovers?: number;
}

export interface RecycleProgramSettings {
  programActive: boolean;
}

export interface AppNotification {
  id: string;
  customerPhone: string;
  orderId: string;
  orderNumber: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type?: 'payment_opened' | 'cash_received' | 'payment_verified' | 'status_changed' | 'stamp_earned';
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'active' | 'inactive';
  activePickupsCount: number;
  completedTodayCount?: number;
  completedThisWeekCount?: number;
  averageRating?: number;
  vehicle: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalOrders: number;
  lastOrderDate: string;
  totalSpent: number;
  stampsCount?: number;
  tier?: 'Bronze' | 'Silver' | 'Gold';
}

export interface StampHistoryItem {
  id: string;
  orderNumber?: string;
  date: string;
  type: 'earned' | 'redeemed';
  title: string;
  pointsChange: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  minOrderValue?: number;
}

export interface CustomerVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'free_wash' | 'percentage' | 'fixed';
  discountValue: number; // 100 for 100% free wash or nominal
  maxDiscount?: number;
  minOrderValue?: number;
  expiryDate: string;
  isUsed: boolean;
  usedAtOrderNumber?: string;
  createdAt: string;
}

export interface OperationalCostItem {
  id: string;
  category: string;
  amount: number;
  date: string;
}

export type SystemUserCategory = 'admin' | 'courier';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  roleCategory: SystemUserCategory;
  roleId: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  twoFactorEnabled: boolean;
  assignedBranch?: string;
  vehicleInfo?: string;
  createdAt: string;
  avatarBg?: string;
}

export type PermissionModule = 'operasional' | 'keuangan' | 'promosi' | 'sistem';

export interface PermissionItem {
  id: string;
  label: string;
  description: string;
  module: PermissionModule;
}

export interface SystemRole {
  id: string;
  name: string;
  category: SystemUserCategory;
  description: string;
  badgeColor: string;
  isSystemDefault?: boolean;
  permissions: string[];
}

