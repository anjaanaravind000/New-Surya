
export type DashboardId = 'admin' | 'kitchen' | 'branch' | 'branch-incharge' | 'stock-audit';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'print' | 'export' | 'refund' | 'void' | 'override' | 'sync' | 'close';
export type ModuleStatus = 'implemented' | 'credential-required' | 'device-required' | 'schema-ready' | 'planned';
export type Tone = 'orange' | 'green' | 'red' | 'blue' | 'purple' | 'amber' | 'slate' | 'cyan' | 'pink' | 'emerald';

export type ModuleKey =
  | 'owner-command' | 'users-permissions' | 'items-menu' | 'branch-pricebook' | 'recipes-bom' | 'purchase-grn' | 'inventory-ledger'
  | 'stock-audit' | 'production-approval' | 'packing-dispatch' | 'crm-loyalty' | 'finance-gst' | 'attendance-payroll'
  | 'reports-bi' | 'integrations' | 'debug-centre' | 'kitchen-planner' | 'kitchen-kds' | 'qc-waste' | 'label-print'
  | 'goods-receipt' | 'counter-session' | 'fast-billing' | 'online-orders' | 'advance-orders' | 'credit-ledger'
  | 'returns-refunds' | 'daily-closure' | 'offline-sync' | 'hardware-devices';

export type Role = {
  id: string;
  name: string;
  description: string;
  dashboards: DashboardId[];
  permissions: Record<ModuleKey, PermissionAction[]>;
  branchIds: string[];
};

export type AppUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  roleId: string;
  branchIds: string[];
  active: boolean;
  pinRequired: boolean;
  lastLogin?: string;
};

export type Branch = {
  id: string;
  name: string;
  type: 'central-kitchen' | 'retail' | 'cloud-kitchen' | 'warehouse' | 'admin';
  address: string;
  phone: string;
  gstin?: string;
  openingHours: string;
  channels: ('walk-in' | 'swiggy' | 'zomato' | 'website' | 'qr' | 'wholesale' | 'phone')[];
  active: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  category: string;
  paymentTermsDays: number;
  gstin?: string;
  rating: number;
};

export type Ingredient = {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderQty: number;
  unitCost: number;
  batchNo: string;
  mfgDate?: string;
  expiryDate?: string;
  allergen?: string;
  supplierId?: string;
  storage: 'ambient' | 'chilled' | 'frozen';
  purchaseUnit?: string;
  conversionQty?: number;
  consumptionUnit?: string;
  purchasePrice?: number;
  transferPrice?: number;
  taxType?: string;
  taxRate?: number;
  hsn?: string;
  atParStock?: number;
  subCategory?: string;
  normalLossPct?: number;
  expiryTracked?: boolean;
  bestBeforeDays?: number;
  reconciliationPrice?: number;
  barcode?: string;
  allowDecimal?: boolean;
  stockKeepingMethod?: string;
  batchWise?: boolean;
  active?: boolean;
  sourceSheet?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  unit: 'pcs' | 'kg' | 'box' | 'plate' | 'tray' | 'portion';
  price: number;
  taxRate: number;
  hsn: string;
  barcode: string;
  active: boolean;
  sellByWeight: boolean;
  kotStation: 'sweets' | 'savouries' | 'cakes' | 'chaat' | 'packing' | 'no-kot';
  shelfLifeHours: number;
  allowOnline: boolean;
  allowInStore?: boolean;
  packSize?: string;
  sourceSheet?: string;
  containsAllergen?: string;
  image?: string;
  externalItemCode?: string;
  externalShortName?: string;
  externalCategory?: string;
  externalGst?: string;
  externalHsn?: string;
};

export type BranchPrice = {
  id: string;
  branchId: string;
  productId: string;
  dineInPrice: number;
  takeawayPrice: number;
  deliveryPrice: number;
  swiggyPrice: number;
  zomatoPrice: number;
  wholesalePrice: number;
};

export type RecipeLine = { ingredientId: string; qty: number; wastagePct: number; stage: 'prep' | 'mixing' | 'baking' | 'finishing' | 'packing' };
export type Recipe = {
  id: string;
  productId: string;
  outputQty: number;
  outputUnit: Product['unit'];
  version: number;
  laborCost: number;
  overheadCost: number;
  packagingCost: number;
  lines: RecipeLine[];
  instructions: string[];
  active: boolean;
};

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  expectedDate: string;
  status: 'draft' | 'sent' | 'partial-received' | 'received' | 'cancelled';
  lines: { ingredientId: string; qty: number; rate: number; receivedQty?: number }[];
  createdBy: string;
};

export type GoodsReceipt = {
  id: string;
  poId: string;
  supplierInvoiceNo: string;
  receivedAt: string;
  receivedBy: string;
  lines: { ingredientId: string; qty: number; rate: number; batchNo: string; expiryDate?: string }[];
};

export type InventoryLedgerEntry = {
  id: string;
  at: string;
  branchId: string;
  itemType: 'ingredient' | 'finished-good';
  itemId: string;
  qtyChange: number;
  unit: string;
  reason: string;
  sourceType: 'purchase' | 'production' | 'billing' | 'dispatch' | 'audit' | 'return' | 'waste' | 'manual';
  sourceId: string;
  userName: string;
};

export type ProductionStatus = 'draft' | 'pending-admin-approval' | 'approved' | 'raw-issued' | 'prep' | 'mixing' | 'proofing' | 'baking' | 'cooling' | 'qc' | 'packing' | 'completed' | 'rejected' | 'cancelled';
export type ProductionPlan = {
  id: string;
  productId: string;
  requestedQty: number;
  plannedDate: string;
  branchDemand: Record<string, number>;
  status: ProductionStatus;
  requestedBy: string;
  approvedBy?: string;
  notes: string;
  startedAt?: string;
  completedAt?: string;
  actualYield?: number;
  wastageQty?: number;
  qcNotes?: string;
  qualityStatus?: 'pending' | 'passed' | 'hold' | 'failed';
};

export type FinishedStock = {
  id: string;
  productId: string;
  branchId: string;
  qty: number;
  batchNo: string;
  producedAt: string;
  expiryAt: string;
  costPerUnit: number;
  sourceProductionId?: string;
};

export type StockAudit = {
  id: string;
  branchId: string;
  itemType: 'ingredient' | 'finished-good';
  itemId: string;
  systemQty: number;
  physicalQty: number;
  varianceReason: string;
  status: 'draft' | 'pending-approval' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
};

export type Dispatch = {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  status: 'draft' | 'packed' | 'dispatched' | 'received' | 'shortage-reported' | 'cancelled';
  crateIds: string[];
  route: string;
  driver: string;
  vehicleNo: string;
  lines: { productId: string; qty: number; batchNo: string }[];
  createdAt: string;
  receivedAt?: string;
  notes?: string;
};

export type CounterSession = {
  id: string;
  branchId: string;
  terminal: string;
  cashier: string;
  openingCash: number;
  openedAt: string;
  closingCash?: number;
  closedAt?: string;
  status: 'open' | 'closed';
};

export type CartLine = { productId: string; qty: number; price: number; discountPct: number; notes?: string };
export type PaymentMode = 'cash' | 'card' | 'upi' | 'paytm' | 'split' | 'credit' | 'online' | 'wallet';
export type Bill = {
  id: string;
  branchId: string;
  counterSessionId: string;
  billNo: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  orderChannel: 'walk-in' | 'swiggy' | 'zomato' | 'website' | 'qr' | 'phone' | 'wholesale';
  lines: CartLine[];
  subTotal: number;
  taxTotal: number;
  discountTotal: number;
  roundOff: number;
  grandTotal: number;
  paymentMode: PaymentMode;
  paidAmount: number;
  creditDueDate?: string;
  status: 'paid' | 'credit' | 'voided' | 'refunded' | 'partial-refund';
  printCount: number;
  createdAt: string;
};

export type Refund = { id: string; billId: string; amount: number; reason: string; restock: boolean; approvedBy: string; createdAt: string };

export type OnlineOrder = {
  id: string;
  platform: 'Swiggy' | 'Zomato' | 'Website' | 'QR' | 'Phone';
  branchId: string;
  externalRef: string;
  customerName: string;
  customerPhone?: string;
  items: CartLine[];
  amount: number;
  status: 'new' | 'accepted' | 'rejected' | 'preparing' | 'ready' | 'picked-up' | 'cancelled' | 'reconciled';
  commissionPct: number;
  payoutExpected: number;
  payoutReceived?: number;
  receivedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  type: 'retail' | 'wholesale' | 'corporate' | 'event';
  creditLimit: number;
  loyaltyPoints: number;
  favoriteProducts: string[];
  birthday?: string;
  anniversary?: string;
};

export type CreditEntry = { id: string; customerId: string; billId?: string; debit: number; credit: number; dueDate?: string; note: string; at: string };

export type AdvanceOrder = {
  id: string;
  branchId: string;
  customerId: string;
  productId: string;
  qty: number;
  deliveryAt: string;
  designNotes: string;
  imageRequired: boolean;
  advancePaid: number;
  balance: number;
  status: 'booked' | 'confirmed' | 'production-alerted' | 'ready' | 'delivered' | 'cancelled';
};

export type AttendanceRecord = {
  id: string;
  userId: string;
  date: string;
  shift: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'late' | 'half-day' | 'absent' | 'leave';
  advanceTaken?: number;
  advanceDate?: string;
  advanceReason?: string;
  overtimeHours?: number;
};

export type Integration = {
  id: string;
  name: string;
  category: 'aggregator' | 'payment' | 'communication' | 'hardware' | 'accounting' | 'maps' | 'ecommerce' | 'support';
  status: 'connected' | 'sandbox' | 'missing-credentials' | 'needs-device-test' | 'disabled';
  health: 'ok' | 'warning' | 'error';
  lastSync?: string;
  notes: string;
};

export type PrintJob = { id: string; type: 'bill' | 'kot' | 'label' | 'dispatch' | 'closure' | 'report'; target: string; payload: string; status: 'queued' | 'printed' | 'failed'; createdAt: string };
export type DebugEvent = { id: string; at: string; level: 'info' | 'success' | 'warning' | 'error'; module: string; message: string; detail?: string };

export type ReportDefinition = {
  id: string;
  name: string;
  dashboard: DashboardId | 'all';
  group: string;
  description: string;
  exportFormats: ('csv' | 'pdf' | 'excel' | 'tally')[];
};

export type Feature = {
  id: string;
  name: string;
  dashboard: DashboardId | 'all';
  group: string;
  status: ModuleStatus;
  summary: string;
  source: string;
};
