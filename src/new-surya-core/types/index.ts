// src/types/index.ts
// ── CHANGE: Replaced 'order_receiver' with 3 branch-specific receiver roles ──
export type UserRole =
  | 'order_taker'
  | 'billing'
  | 'admin'
  | 'kitchen'
  | 'store'
  | 'baker'
  | 'sweet_master'
  | 'savouries_master'
  | 'cookies_master'
  | 'puffs_master'
  | 'bakery_master'
  | 'cake_master'
  | 'packing'
  | 'stock_audit_secondary'   // Secondary Ordering & Receiving Receiver (orders SECONDARY_OUTLET items only)
  | 'stock_audit_primary'     // Ordering & Receiving Receiver   (orders PRIMARY_OUTLET items only)
  | 'branch_secondary'
  | 'branch_primary'
  | 'branch_wholesale'
  | 'branch_incharge_secondary'   // Secondary Outlet Management Dashboard
  | 'branch_incharge_primary'     // Outlet Management Dashboard
  | 'executive';        // Executive Dashboard

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  timing: string;
  enabled: boolean;
  imageUrl?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'dine_in' | 'takeaway';
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type PaymentType = 'cash' | 'upi' | 'card' | 'part_payment' | 'unpaid' | 'advance' | 'credit';
export type OrderSource = 'staff' | 'qr' | 'balance';

export interface PaymentBreakdown {
  cash: number;
  upi: number;
  card: number;
}

export interface Order {
  id: string;
  orderNumber: number;
  tableNumber?: number;
  orderType: OrderType;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  total: number;
  status: OrderStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  customerName?: string;
  paymentType: PaymentType;
  paymentBreakdown?: PaymentBreakdown;
  billedBy?: string;
  cancelReason?: string;
  orderSource?: OrderSource;
  advanceAmount?: number;
  advancePaidBy?: string;
  balanceDue?: number;
  fullAmount?: number;       // original full bill total for advance orders
  fullyPaidAt?: string;
  balancePaymentType?: string;
  balancePaidBy?: string;
  balanceOrderId?: string;   // id of the balance-collection order row
  parcelCharges?: number;
  deliveryDate?: string;     // ISO date string — mandatory for advance orders
}

export interface MenuCategory {
  id: string;
  name: string;
  timing: string;
  itemCount: number;
}
