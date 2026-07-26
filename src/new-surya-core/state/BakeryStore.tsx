
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { AdvanceOrder, AppUser, AttendanceRecord, Bill, Branch, BranchPrice, CartLine, CounterSession, CreditEntry, Customer, DebugEvent, Dispatch, FinishedStock, GoodsReceipt, Ingredient, Integration, InventoryLedgerEntry, OnlineOrder, PaymentMode, PrintJob, Product, ProductionPlan, ProductionStatus, Promotion, PurchaseOrder, Quotation, Recipe, Refund, Role, StockAudit, Supplier } from '../lib/types';
import * as seed from '../data/seed';
import { allocateFinishedStock, billTotals, byId, canFulfillCart, nowIso, productionShortages, recipeCost, recipeRequirement, round2, today } from '../lib/calculations';

type State = {
  branches: Branch[];
  suppliers: Supplier[];
  ingredients: Ingredient[];
  products: Product[];
  branchPrices: BranchPrice[];
  recipes: Recipe[];
  roles: Role[];
  users: AppUser[];
  purchaseOrders: PurchaseOrder[];
  grns: GoodsReceipt[];
  productionPlans: ProductionPlan[];
  finishedStocks: FinishedStock[];
  stockAudits: StockAudit[];
  dispatches: Dispatch[];
  counterSessions: CounterSession[];
  bills: Bill[];
  refunds: Refund[];
  onlineOrders: OnlineOrder[];
  customers: Customer[];
  quotations: Quotation[];
  promotions: Promotion[];
  creditEntries: CreditEntry[];
  advanceOrders: AdvanceOrder[];
  attendance: AttendanceRecord[];
  integrations: Integration[];
  debugEvents: DebugEvent[];
  printJobs: PrintJob[];
  ledger: InventoryLedgerEntry[];
  selectedBranchId: string;
  cart: CartLine[];
  heldCarts: { id: string; name: string; lines: CartLine[]; at: string }[];
  selectedPaymentMode: PaymentMode;
  orderChannel: Bill['orderChannel'];
  cashReceived: number;
  syncQueue: { id: string; at: string; table: string; action: string; payload: unknown; status: 'queued' | 'synced' | 'failed' }[];
};

type Action =
  | { type:'log'; event: Omit<DebugEvent, 'id' | 'at'> }
  | { type:'reset-demo' }
  | { type:'select-branch'; branchId: string }
  | { type:'add-user'; user: Omit<AppUser, 'id' | 'lastLogin'> }
  | { type:'toggle-user'; userId: string }
  | { type:'set-role-permission'; roleId: string; moduleKey: string; actions: string[] }
  | { type:'add-product'; product: Omit<Product, 'id' | 'barcode'> }
  | { type:'update-product'; productId: string; changes: Partial<Pick<Product, 'name' | 'category' | 'price' | 'unit' | 'taxRate'>> }
  | { type:'toggle-product'; productId: string }
  | { type:'upsert-branch-price'; branchPrice: BranchPrice }
  | { type:'create-production'; productId: string; requestedQty: number; branchDemand: Record<string, number>; notes: string; requestedBy: string }
  | { type:'approve-production'; planId: string; adminName: string }
  | { type:'move-production'; planId: string; status: ProductionStatus; actualYield?: number; wastageQty?: number; qcNotes?: string; qualityStatus?: ProductionPlan['qualityStatus'] }
  | { type:'complete-production'; planId: string; actualYield?: number; wastageQty?: number; qcNotes?: string }
  | { type:'create-dispatch'; toBranchId: string; lines: { productId: string; qty: number; batchNo: string }[]; route: string; driver: string; vehicleNo: string; crates: string[] }
  | { type:'pack-dispatch'; dispatchId: string }
  | { type:'receive-dispatch'; dispatchId: string; shortageNote?: string }
  | { type:'create-stock-audit'; audit: Omit<StockAudit, 'id' | 'createdAt' | 'status'> }
  | { type:'approve-stock-audit'; auditId: string; approvedBy: string }
  | { type:'create-purchase-order'; po: Omit<PurchaseOrder, 'id'> }
  | { type:'receive-purchase-order'; poId: string; invoiceNo: string; receivedBy: string }
  | { type:'manual-stock-adjust'; ingredientId: string; qtyChange: number; reason: string; userName: string }
  | { type:'add-ingredient'; ingredient: Omit<Ingredient, 'id' | 'batchNo'> }
  | { type:'update-customer-credit-limit'; customerId: string; creditLimit: number; approvedBy: string }
  | { type:'add-supplier'; supplier: Omit<Supplier, 'id'> }
  | { type:'add-customer'; customer: Omit<Customer, 'id'> }
  | { type:'add-promotion'; name: string; trigger: string; reward: string }
  | { type:'toggle-promotion'; promotionId: string }
  | { type:'mark-print-job'; printJobId: string; status: PrintJob['status'] }
  | { type:'reprint-label'; stockId: string }
  | { type:'open-counter'; branchId: string; cashier: string; terminal: string; openingCash: number }
  | { type:'close-counter'; sessionId: string; closingCash: number }
  | { type:'add-to-cart'; productId: string; qty: number; price?: number; discountPct?: number }
  | { type:'set-cart-line'; productId: string; qty: number }
  | { type:'remove-cart-line'; productId: string }
  | { type:'clear-cart' }
  | { type:'hold-cart'; name: string }
  | { type:'recall-cart'; heldCartId: string }
  | { type:'set-payment-mode'; mode: PaymentMode }
  | { type:'set-order-channel'; channel: Bill['orderChannel'] }
  | { type:'set-cash-received'; cash: number }
  | { type:'checkout'; customerId?: string; customerName?: string; customerPhone?: string; paidAmount?: number; creditDueDate?: string }
  | { type:'duplicate-print'; billId: string }
  | { type:'refund-bill'; billId: string; amount: number; reason: string; restock: boolean; approvedBy: string }
  | { type:'accept-online-order'; orderId: string }
  | { type:'reject-online-order'; orderId: string; reason: string }
  | { type:'reconcile-online-order'; orderId: string; payoutReceived: number }
  | { type:'create-advance-order'; order: Omit<AdvanceOrder, 'id' | 'status'> }
  | { type:'book-delivery-order'; branchId: string; customerName: string; customerPhone: string; productId: string; qty: number; deliveryAt: string; designNotes: string; imageRequired: boolean; advancePaid: number; balance: number }
  | { type:'advance-status'; orderId: string; status: AdvanceOrder['status'] }
  | { type:'create-quotation'; customerName: string; customerPhone?: string; companyName?: string; gstNumber?: string }
  | { type:'quotation-status'; quotationId: string; status: Quotation['status'] }
  | { type:'convert-quotation'; quotationId: string }
  | { type:'add-credit-collection'; customerId: string; amount: number; note: string }
  | { type:'record-attendance'; record: Omit<AttendanceRecord, 'id'> }
  | { type:'record-staff-advance'; attendanceId: string; amount: number; reason: string }
  | { type:'queue-sync'; table: string; action: string; payload: unknown }
  | { type:'mark-sync'; syncId: string; status: 'synced' | 'failed' };

const STORAGE_KEY = 'new-surya-operations-v9-menu-2025';

function initialState(): State {
  return {
    branches: seed.branches,
    suppliers: seed.suppliers,
    ingredients: seed.ingredients,
    products: seed.products,
    branchPrices: seed.branchPrices,
    recipes: seed.recipes,
    roles: seed.roles,
    users: seed.users,
    purchaseOrders: seed.purchaseOrders,
    grns: [],
    productionPlans: seed.productionPlans,
    finishedStocks: seed.finishedStocks,
    stockAudits: seed.stockAudits,
    dispatches: seed.dispatches,
    counterSessions: [],
    bills: [],
    refunds: [],
    onlineOrders: seed.onlineOrders,
    customers: seed.customers,
    quotations: [],
    promotions: [],
    creditEntries: seed.creditEntries as CreditEntry[],
    advanceOrders: seed.advanceOrders,
    attendance: seed.attendance,
    integrations: seed.integrations,
    debugEvents: seed.debugEvents,
    printJobs: [],
    ledger: [],
    selectedBranchId: 'marathahalli',
    cart: [],
    heldCarts: [],
    selectedPaymentMode: 'cash',
    orderChannel: 'walk-in',
    cashReceived: 0,
    syncQueue: []
  };
}

function mergeSeedRecords<T extends { id: string }>(stored: T[] | undefined, seeded: T[]): T[] {
  const storedRecords = stored ?? [];
  const seededById = new Map(seeded.map(record => [record.id, record]));
  return [
    ...storedRecords.map(record => ({ ...seededById.get(record.id), ...record } as T)),
    ...seeded.filter(record => !storedRecords.some(storedRecord => storedRecord.id === record.id))
  ];
}

function loadInitialState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as State;
    const base = initialState();
    const storedRoles = parsed.roles ?? [];
    const storedUsers = parsed.users ?? [];
    return {
      ...base,
      ...parsed,
      roles: [...storedRoles, ...base.roles.filter(role => !storedRoles.some(stored => stored.id === role.id))],
      users: [...storedUsers, ...base.users.filter(user => !storedUsers.some(stored => stored.id === user.id))],
      products: mergeSeedRecords(parsed.products, base.products),
      ingredients: mergeSeedRecords(parsed.ingredients, base.ingredients),
      branchPrices: mergeSeedRecords(parsed.branchPrices, base.branchPrices)
    };
  } catch {
    return initialState();
  }
}

function addLog(state: State, event: Omit<DebugEvent, 'id' | 'at'>): State {
  return { ...state, debugEvents: [{ id: crypto.randomUUID(), at: nowIso(), ...event }, ...state.debugEvents].slice(0, 300) };
}

function queueSync(state: State, table: string, action: string, payload: unknown): State {
  return { ...state, syncQueue: [{ id: crypto.randomUUID(), at: nowIso(), table, action, payload, status: 'queued' }, ...state.syncQueue].slice(0, 200) };
}

function createLedger(entry: Omit<InventoryLedgerEntry, 'id' | 'at'>): InventoryLedgerEntry {
  return { id: crypto.randomUUID(), at: nowIso(), ...entry };
}

function activeCounter(state: State, branchId = state.selectedBranchId) {
  return state.counterSessions.find(s => s.branchId === branchId && s.status === 'open');
}

function sellingPrice(state: State, productId: string, channel: Bill['orderChannel']) {
  const product = state.products.find(item => item.id === productId);
  const price = state.branchPrices.find(item => item.branchId === state.selectedBranchId && item.productId === productId);
  if (!price) return product?.price ?? 0;
  if (channel === 'swiggy') return price.swiggyPrice;
  if (channel === 'zomato') return price.zomatoPrice;
  if (channel === 'website') return price.deliveryPrice;
  if (channel === 'wholesale') return price.wholesalePrice;
  return channel === 'walk-in' ? price.dineInPrice : price.takeawayPrice;
}

function reducer(state: State, action: Action): State {
  try {
    switch (action.type) {
      case 'reset-demo': return initialState();
      case 'log': return addLog(state, action.event);
      case 'select-branch': return { ...state, selectedBranchId: action.branchId };
      case 'add-user': {
        const user: AppUser = { id: crypto.randomUUID(), lastLogin: undefined, ...action.user };
        return addLog(queueSync({ ...state, users: [user, ...state.users] }, 'users', 'insert', user), { level:'success', module:'Users & Permissions', message:`User ${user.name} created`, detail:'Role, dashboard and branch access are attached.' });
      }
      case 'toggle-user': {
        const users = state.users.map(u => u.id === action.userId ? { ...u, active: !u.active } : u);
        return addLog({ ...state, users }, { level:'success', module:'Users & Permissions', message:'User active status changed' });
      }
      case 'set-role-permission': {
        const roles = state.roles.map(r => r.id === action.roleId ? { ...r, permissions: { ...r.permissions, [action.moduleKey]: action.actions as any } } : r);
        return addLog(queueSync({ ...state, roles }, 'roles', 'update-permission', action), { level:'success', module:'Permissions', message:'Role permission updated', detail:`${action.moduleKey}: ${action.actions.join(', ')}` });
      }
      case 'add-product': {
        const product: Product = { id: crypto.randomUUID(), barcode: `89${Date.now()}`, ...action.product };
        return addLog(queueSync({ ...state, products: [product, ...state.products] }, 'products', 'insert', product), { level:'success', module:'Item Master', message:`Product ${product.name} added` });
      }
      case 'toggle-product': {
        const products = state.products.map(p => p.id === action.productId ? { ...p, active: !p.active } : p);
        return addLog({ ...state, products }, { level:'success', module:'Item Master', message:'Product active status changed' });
      }
      case 'update-product': {
        const products = state.products.map(p => p.id === action.productId ? { ...p, ...action.changes } : p);
        const product = products.find(p => p.id === action.productId);
        return addLog({ ...state, products }, { level:'success', module:'Item Master', message:`${product?.name ?? 'Product'} updated` });
      }
      case 'upsert-branch-price': {
        const exists = state.branchPrices.some(bp => bp.id === action.branchPrice.id);
        const branchPrices = exists ? state.branchPrices.map(bp => bp.id === action.branchPrice.id ? action.branchPrice : bp) : [action.branchPrice, ...state.branchPrices];
        return addLog(queueSync({ ...state, branchPrices }, 'branch_prices', 'upsert', action.branchPrice), { level:'success', module:'Branch Price Book', message:'Branch price updated' });
      }
      case 'create-production': {
        const plan: ProductionPlan = { id: crypto.randomUUID(), productId: action.productId, requestedQty: action.requestedQty, plannedDate: today(), branchDemand: action.branchDemand, status:'pending-admin-approval', requestedBy: action.requestedBy, notes: action.notes, qualityStatus:'pending' };
        return addLog(queueSync({ ...state, productionPlans: [plan, ...state.productionPlans] }, 'production_plans', 'insert', plan), { level:'success', module:'Kitchen Planner', message:'Production request sent to admin approval', detail:'Raw materials are not deducted until approval.' });
      }
      case 'approve-production': {
        const plan = state.productionPlans.find(p => p.id === action.planId);
        if (!plan) return addLog(state, { level:'error', module:'Production Approval', message:'Plan not found' });
        const recipe = state.recipes.find(r => r.productId === plan.productId && r.active);
        const shortages = productionShortages(recipe, state.ingredients, plan.requestedQty);
        if (shortages.length) return addLog(state, { level:'error', module:'Production Approval', message:'Cannot approve: raw material shortage', detail: shortages.join('; ') });
        const req = recipeRequirement(recipe!, plan.requestedQty);
        const ingredients = state.ingredients.map(ing => {
          const line = req.find(r => r.ingredientId === ing.id);
          return line ? { ...ing, currentStock: round2(ing.currentStock - line.requiredQty) } : ing;
        });
        const ledger = [
          ...req.map(line => createLedger({ branchId:'central-kitchen', itemType:'ingredient' as const, itemId:line.ingredientId, qtyChange:-line.requiredQty, unit:state.ingredients.find(i => i.id === line.ingredientId)?.unit ?? '', reason:'Admin-approved production raw issue', sourceType:'production' as const, sourceId:plan.id, userName:action.adminName })),
          ...state.ledger
        ];
        const productionPlans = state.productionPlans.map(p => p.id === plan.id ? { ...p, status:'raw-issued' as const, approvedBy: action.adminName, startedAt: nowIso() } : p);
        return addLog(queueSync({ ...state, ingredients, ledger, productionPlans }, 'production_plans', 'approve-and-deduct', { planId: plan.id, req }), { level:'success', module:'Production Approval', message:'Approved: raw materials deducted and ledger posted' });
      }
      case 'move-production': {
        const productionPlans = state.productionPlans.map(p => p.id === action.planId ? { ...p, status: action.status, actualYield: action.actualYield ?? p.actualYield, wastageQty: action.wastageQty ?? p.wastageQty, qcNotes: action.qcNotes ?? p.qcNotes, qualityStatus: action.qualityStatus ?? p.qualityStatus } : p);
        return addLog({ ...state, productionPlans }, { level:'success', module:'KDS Stage', message:`Production moved to ${action.status}` });
      }
      case 'complete-production': {
        const plan = state.productionPlans.find(p => p.id === action.planId);
        if (!plan) return state;
        const product = state.products.find(p => p.id === plan.productId);
        const recipe = state.recipes.find(r => r.productId === plan.productId && r.active);
        const actual = action.actualYield ?? plan.actualYield ?? plan.requestedQty;
        const cost = recipe ? recipeCost(recipe, state.ingredients, plan.requestedQty).perUnit : 0;
        const expiryAt = new Date(Date.now() + (product?.shelfLifeHours ?? 48) * 3600_000).toISOString();
        const batchNo = `${(product?.name ?? 'BATCH').slice(0,2).toUpperCase()}-${new Date().toISOString().slice(5,10).replace('-','')}-${state.finishedStocks.length + 1}`;
        const centralStock: FinishedStock = { id: crypto.randomUUID(), branchId:'central-kitchen', productId:plan.productId, qty: actual, batchNo, producedAt: nowIso(), expiryAt, costPerUnit: cost, sourceProductionId:plan.id };
        const ledger = [createLedger({ branchId:'central-kitchen', itemType:'finished-good', itemId:plan.productId, qtyChange:actual, unit:product?.unit ?? '', reason:'Production completed', sourceType:'production', sourceId:plan.id, userName:'Kitchen' }), ...state.ledger];
        const productionPlans = state.productionPlans.map(p => p.id === plan.id ? { ...p, status:'completed' as const, actualYield: actual, wastageQty: action.wastageQty ?? p.wastageQty ?? Math.max(0, plan.requestedQty - actual), qcNotes: action.qcNotes ?? p.qcNotes, completedAt: nowIso(), qualityStatus:'passed' as const } : p);
        const printJobs: PrintJob[] = [{ id: crypto.randomUUID(), type:'label', target:'label-printer', payload:`${product?.name} | Batch ${batchNo} | Exp ${expiryAt.slice(0,10)}`, status:'queued', createdAt: nowIso() }, ...state.printJobs];
        return addLog(queueSync({ ...state, productionPlans, finishedStocks: [centralStock, ...state.finishedStocks], ledger, printJobs }, 'finished_stocks', 'insert', centralStock), { level:'success', module:'Production', message:'Production completed: finished stock and label job created' });
      }
      case 'create-dispatch': {
        const dispatch: Dispatch = { id: crypto.randomUUID(), fromBranchId:'central-kitchen', toBranchId: action.toBranchId, status:'draft', crateIds: action.crates, route: action.route, driver: action.driver, vehicleNo: action.vehicleNo, lines: action.lines, createdAt: nowIso() };
        return addLog(queueSync({ ...state, dispatches: [dispatch, ...state.dispatches] }, 'dispatches', 'insert', dispatch), { level:'success', module:'Dispatch', message:'Dispatch draft created' });
      }
      case 'pack-dispatch': {
        const dispatches = state.dispatches.map(d => d.id === action.dispatchId ? { ...d, status:'dispatched' as const } : d);
        const printJobs: PrintJob[] = [{ id: crypto.randomUUID(), type:'dispatch', target:'dispatch-printer', payload:`Dispatch ${action.dispatchId}`, status:'queued', createdAt: nowIso() }, ...state.printJobs];
        return addLog({ ...state, dispatches, printJobs }, { level:'success', module:'Dispatch', message:'Dispatch packed, challan queued and marked dispatched' });
      }
      case 'receive-dispatch': {
        const dispatch = state.dispatches.find(d => d.id === action.dispatchId);
        if (!dispatch) return state;
        let finishedStocks = state.finishedStocks;
        const added = dispatch.lines.map(line => ({ id: crypto.randomUUID(), branchId:dispatch.toBranchId, productId:line.productId, qty:line.qty, batchNo:line.batchNo, producedAt: nowIso(), expiryAt: new Date(Date.now() + 48*3600_000).toISOString(), costPerUnit: state.finishedStocks.find(s => s.batchNo === line.batchNo)?.costPerUnit ?? 0 }));
        for (const line of dispatch.lines) finishedStocks = allocateFinishedStock(finishedStocks, 'central-kitchen', line.productId, line.qty);
        const status = action.shortageNote ? 'shortage-reported' : 'received';
        const dispatches = state.dispatches.map(d => d.id === action.dispatchId ? { ...d, status, receivedAt:nowIso(), notes: action.shortageNote } as Dispatch : d);
        return addLog({ ...state, dispatches, finishedStocks: [...added, ...finishedStocks] }, { level: action.shortageNote ? 'warning' : 'success', module:'Goods Receipt', message:`Dispatch ${status}`, detail: action.shortageNote });
      }
      case 'create-stock-audit': {
        const audit: StockAudit = { id: crypto.randomUUID(), createdAt: nowIso(), status:'pending-approval', ...action.audit };
        return addLog({ ...state, stockAudits:[audit, ...state.stockAudits] }, { level:'success', module:'Stock Audit', message:'Stock audit created and sent for approval' });
      }
      case 'approve-stock-audit': {
        const audit = state.stockAudits.find(a => a.id === action.auditId);
        if (!audit) return state;
        const stockAudits = state.stockAudits.map(a => a.id === audit.id ? { ...a, status:'approved' as const, approvedBy: action.approvedBy } : a);
        if (audit.itemType === 'ingredient') {
          const diff = round2(audit.physicalQty - audit.systemQty);
          const ingredients = state.ingredients.map(i => i.id === audit.itemId ? { ...i, currentStock: audit.physicalQty } : i);
          const ledger = [createLedger({ branchId:audit.branchId, itemType:'ingredient', itemId:audit.itemId, qtyChange:diff, unit:state.ingredients.find(i => i.id === audit.itemId)?.unit ?? '', reason:`Stock audit: ${audit.varianceReason}`, sourceType:'audit', sourceId:audit.id, userName:action.approvedBy }), ...state.ledger];
          return addLog({ ...state, stockAudits, ingredients, ledger }, { level:'success', module:'Stock Audit', message:'Ingredient audit approved and inventory adjusted' });
        }
        return addLog({ ...state, stockAudits }, { level:'success', module:'Stock Audit', message:'Finished goods audit approved' });
      }
      case 'create-purchase-order': {
        const po: PurchaseOrder = { id: crypto.randomUUID(), ...action.po };
        return addLog(queueSync({ ...state, purchaseOrders: [po, ...state.purchaseOrders] }, 'purchase_orders', 'insert', po), { level:'success', module:'Purchase', message:'Purchase order created' });
      }
      case 'receive-purchase-order': {
        const po = state.purchaseOrders.find(p => p.id === action.poId);
        if (!po) return state;
        const grn: GoodsReceipt = { id: crypto.randomUUID(), poId: po.id, supplierInvoiceNo: action.invoiceNo, receivedAt: nowIso(), receivedBy: action.receivedBy, lines: po.lines.map(line => ({ ingredientId: line.ingredientId, qty: line.qty, rate: line.rate, batchNo: `GRN-${Date.now().toString().slice(-6)}` })) };
        const ingredients = state.ingredients.map(ing => {
          const line = po.lines.find(l => l.ingredientId === ing.id);
          return line ? { ...ing, currentStock: round2(ing.currentStock + line.qty), unitCost: line.rate, batchNo: `GRN-${Date.now().toString().slice(-6)}` } : ing;
        });
        const ledger = [...po.lines.map(line => createLedger({ branchId:'central-kitchen', itemType:'ingredient' as const, itemId:line.ingredientId, qtyChange:line.qty, unit:state.ingredients.find(i => i.id === line.ingredientId)?.unit ?? '', reason:'GRN received', sourceType:'purchase' as const, sourceId:grn.id, userName:action.receivedBy })), ...state.ledger];
        const purchaseOrders = state.purchaseOrders.map(p => p.id === po.id ? { ...p, status:'received' as const, lines:p.lines.map(l => ({ ...l, receivedQty:l.qty })) } : p);
        return addLog({ ...state, purchaseOrders, grns:[grn, ...state.grns], ingredients, ledger }, { level:'success', module:'GRN', message:'Purchase received and raw stock increased' });
      }
      case 'manual-stock-adjust': {
        const ingredients = state.ingredients.map(i => i.id === action.ingredientId ? { ...i, currentStock: round2(i.currentStock + action.qtyChange) } : i);
        const ledger = [createLedger({ branchId:'central-kitchen', itemType:'ingredient', itemId:action.ingredientId, qtyChange:action.qtyChange, unit:state.ingredients.find(i => i.id === action.ingredientId)?.unit ?? '', reason:action.reason, sourceType:'manual', sourceId:'manual', userName:action.userName }), ...state.ledger];
        return addLog({ ...state, ingredients, ledger }, { level:'success', module:'Inventory', message:'Manual stock adjustment recorded' });
      }
      case 'add-ingredient': {
        const ingredient: Ingredient = { id: crypto.randomUUID(), batchNo: `BATCH-${Date.now()}`, ...action.ingredient };
        return addLog({ ...state, ingredients: [ingredient, ...state.ingredients] }, { level:'success', module:'Inventory', message:`${ingredient.name} added to raw material register` });
      }
      case 'update-customer-credit-limit': {
        const customers = state.customers.map(c => c.id === action.customerId ? { ...c, creditLimit: action.creditLimit } : c);
        const customer = customers.find(c => c.id === action.customerId);
        return addLog({ ...state, customers }, { level:'success', module:'Credit Control', message:`${customer?.name ?? 'Customer'} credit limit set to ${action.creditLimit} by ${action.approvedBy}` });
      }
      case 'add-supplier': {
        const supplier: Supplier = { id: crypto.randomUUID(), ...action.supplier };
        return addLog({ ...state, suppliers: [supplier, ...state.suppliers] }, { level:'success', module:'Suppliers', message:`${supplier.name} added to supplier master` });
      }
      case 'add-customer': {
        const customer: Customer = { id: crypto.randomUUID(), ...action.customer };
        return addLog({ ...state, customers: [customer, ...state.customers] }, { level:'success', module:'CRM', message:`${customer.name} added to customer master` });
      }
      case 'add-promotion': {
        const promotion: Promotion = { id: crypto.randomUUID(), name:action.name, trigger:action.trigger, reward:action.reward, active:true, createdAt:nowIso() };
        return addLog({ ...state, promotions: [promotion, ...state.promotions] }, { level:'success', module:'Promotions', message:`${promotion.name} saved` });
      }
      case 'toggle-promotion': {
        const promotions = state.promotions.map(p => p.id === action.promotionId ? { ...p, active: !p.active } : p);
        return { ...state, promotions };
      }
      case 'mark-print-job': {
        const printJobs = state.printJobs.map(j => j.id === action.printJobId ? { ...j, status:action.status } : j);
        return { ...state, printJobs };
      }
      case 'reprint-label': {
        const stock = state.finishedStocks.find(s => s.id === action.stockId);
        if (!stock) return state;
        const product = state.products.find(p => p.id === stock.productId);
        const printJobs: PrintJob[] = [{ id: crypto.randomUUID(), type:'label', target:'label-printer', payload:`${product?.name} | Batch ${stock.batchNo} | Exp ${stock.expiryAt.slice(0,10)}`, status:'queued', createdAt: nowIso() }, ...state.printJobs];
        return addLog({ ...state, printJobs }, { level:'success', module:'Packing', message:`Label reprint queued for ${product?.name} batch ${stock.batchNo}` });
      }
      case 'open-counter': {
        const already = activeCounter(state, action.branchId);
        if (already) return addLog(state, { level:'warning', module:'Counter', message:'Counter already open for this branch', detail:`Session ${already.id}` });
        const session: CounterSession = { id: crypto.randomUUID(), branchId:action.branchId, terminal: action.terminal, cashier: action.cashier, openingCash: action.openingCash, openedAt: nowIso(), status:'open' };
        return addLog(queueSync({ ...state, counterSessions:[session, ...state.counterSessions], selectedBranchId: action.branchId }, 'counter_sessions', 'insert', session), { level:'success', module:'Counter', message:'Counter opened. Billing is now enabled.' });
      }
      case 'close-counter': {
        const counterSessions = state.counterSessions.map(s => s.id === action.sessionId ? { ...s, closingCash:action.closingCash, closedAt:nowIso(), status:'closed' as const } : s);
        const printJobs: PrintJob[] = [{ id: crypto.randomUUID(), type:'closure', target:'thermal-printer', payload:`Closure ${action.sessionId}`, status:'queued', createdAt: nowIso() }, ...state.printJobs];
        return addLog({ ...state, counterSessions, printJobs }, { level:'success', module:'Daily Closure', message:'Counter closed and closure print queued' });
      }
      case 'add-to-cart': {
        const product = state.products.find(p => p.id === action.productId && p.active);
        if (!product) return addLog(state, { level:'error', module:'Billing', message:'Product is unavailable or inactive' });
        const lines = [...state.cart];
        const idx = lines.findIndex(l => l.productId === action.productId && l.price === (action.price ?? product.price));
        if (idx >= 0) lines[idx] = { ...lines[idx], qty: round2(lines[idx].qty + action.qty) };
        else lines.push({ productId: action.productId, qty: action.qty, price: action.price ?? product.price, discountPct: action.discountPct ?? 0 });
        return { ...state, cart: lines };
      }
      case 'set-cart-line': return { ...state, cart: state.cart.map(l => l.productId === action.productId ? { ...l, qty: action.qty } : l).filter(l => l.qty > 0) };
      case 'remove-cart-line': return { ...state, cart: state.cart.filter(l => l.productId !== action.productId) };
      case 'clear-cart': return addLog({ ...state, cart: [] }, { level:'info', module:'Billing', message:'Cart cleared' });
      case 'hold-cart': return addLog({ ...state, heldCarts:[{ id:crypto.randomUUID(), name:action.name, lines:state.cart, at:nowIso() }, ...state.heldCarts], cart:[] }, { level:'success', module:'Billing', message:'Cart held for recall' });
      case 'recall-cart': {
        const held = state.heldCarts.find(h => h.id === action.heldCartId);
        if (!held) return state;
        return addLog({ ...state, cart: held.lines, heldCarts: state.heldCarts.filter(h => h.id !== held.id) }, { level:'success', module:'Billing', message:'Held cart recalled' });
      }
      case 'set-payment-mode': return { ...state, selectedPaymentMode: action.mode };
      case 'set-order-channel': return {
        ...state,
        orderChannel: action.channel,
        cart: state.cart.map(line => ({ ...line, price: sellingPrice(state, line.productId, action.channel) }))
      };
      case 'set-cash-received': return { ...state, cashReceived: action.cash };
      case 'checkout': {
        const session = activeCounter(state);
        if (!session) return addLog(state, { level:'error', module:'Billing', message:'Cannot bill: counter is not open', detail:'Open counter using F6 or the Counter panel.' });
        if (!state.cart.length) return addLog(state, { level:'warning', module:'Billing', message:'Cannot bill: cart is empty' });
        const fulfill = canFulfillCart(state.cart, state.finishedStocks, state.selectedBranchId);
        if (!fulfill.ok) return addLog(state, { level:'error', module:'Billing', message:'Cannot bill: stock not available', detail: fulfill.issues.join('; ') });
        let finishedStocks = state.finishedStocks;
        for (const line of state.cart) finishedStocks = allocateFinishedStock(finishedStocks, state.selectedBranchId, line.productId, line.qty);
        const totals = billTotals(state.cart, state.products);
        const billNo = `BOS-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${String(state.bills.length + 1).padStart(5,'0')}`;
        const bill: Bill = { id: crypto.randomUUID(), branchId:state.selectedBranchId, counterSessionId:session.id, billNo, customerId:action.customerId, customerName:action.customerName, customerPhone:action.customerPhone, orderChannel:state.orderChannel, lines:state.cart, ...totals, paymentMode:state.selectedPaymentMode, paidAmount:action.paidAmount ?? totals.grandTotal, creditDueDate: action.creditDueDate, status: state.selectedPaymentMode === 'credit' ? 'credit' : 'paid', printCount:1, createdAt: nowIso() };
        const creditEntries = bill.status === 'credit' && action.customerId ? [{ id: crypto.randomUUID(), customerId:action.customerId, billId:bill.id, debit:totals.grandTotal, credit:action.paidAmount ?? 0, dueDate:action.creditDueDate, note:`Credit bill ${bill.billNo}`, at:nowIso() }, ...state.creditEntries] : state.creditEntries;
        const printJobs: PrintJob[] = [{ id: crypto.randomUUID(), type:'bill', target:'thermal-printer', payload:`Original ${bill.billNo}`, status:'queued', createdAt: nowIso() }, ...state.printJobs];
        const ledger = [...state.cart.map(line => createLedger({ branchId:state.selectedBranchId, itemType:'finished-good' as const, itemId:line.productId, qtyChange:-line.qty, unit:state.products.find(p => p.id === line.productId)?.unit ?? '', reason:`Billing ${bill.billNo}`, sourceType:'billing' as const, sourceId:bill.id, userName:session.cashier })), ...state.ledger];
        const customers = action.customerId ? state.customers.map(c => c.id === action.customerId ? { ...c, loyaltyPoints: c.loyaltyPoints + Math.floor(totals.grandTotal / 100), favoriteProducts: Array.from(new Set([...c.favoriteProducts, ...state.cart.map(l => l.productId)])).slice(0, 8) } : c) : state.customers;
        return addLog(queueSync({ ...state, finishedStocks, bills:[bill, ...state.bills], printJobs, ledger, creditEntries, customers, cart:[], cashReceived:0 }, 'bills', 'insert', bill), { level:'success', module:'Billing', message:`Original bill ${bill.billNo} created, stock deducted and print queued` });
      }
      case 'duplicate-print': {
        const bills = state.bills.map(b => b.id === action.billId ? { ...b, printCount:b.printCount + 1 } : b);
        const bill = state.bills.find(b => b.id === action.billId);
        const printJobs: PrintJob[] = bill ? [{ id:crypto.randomUUID(), type:'bill', target:'thermal-printer', payload:`Duplicate ${bill.billNo}`, status:'queued', createdAt:nowIso() }, ...state.printJobs] : state.printJobs;
        return addLog({ ...state, bills, printJobs }, { level:'success', module:'Billing', message:'Duplicate bill queued' });
      }
      case 'refund-bill': {
        const bill = state.bills.find(b => b.id === action.billId);
        if (!bill) return state;
        const refund: Refund = { id: crypto.randomUUID(), billId: bill.id, amount:action.amount, reason:action.reason, restock:action.restock, approvedBy:action.approvedBy, createdAt:nowIso() };
        const bills = state.bills.map(b => b.id === bill.id ? { ...b, status: action.amount >= b.grandTotal ? 'refunded' as const : 'partial-refund' as const } : b);
        let finishedStocks = state.finishedStocks;
        if (action.restock) {
          const returns = bill.lines.map(line => ({ id:crypto.randomUUID(), branchId:bill.branchId, productId:line.productId, qty:line.qty, batchNo:`RET-${bill.billNo}`, producedAt:nowIso(), expiryAt:new Date(Date.now()+12*3600_000).toISOString(), costPerUnit:0 }));
          finishedStocks = [...returns, ...finishedStocks];
        }
        return addLog({ ...state, bills, refunds:[refund, ...state.refunds], finishedStocks }, { level:'warning', module:'Refund', message:'Refund recorded with approval' });
      }
      case 'accept-online-order': {
        const order = state.onlineOrders.find(o => o.id === action.orderId);
        const onlineOrders = state.onlineOrders.map(o => o.id === action.orderId ? { ...o, status:'accepted' as const } : o);
        const printJobs: PrintJob[] = order ? [{ id:crypto.randomUUID(), type:'kot', target:'kot-printer', payload:`${order.platform} ${order.externalRef}`, status:'queued', createdAt:nowIso() }, ...state.printJobs] : state.printJobs;
        return addLog({ ...state, onlineOrders, printJobs }, { level:'success', module:'Online Orders', message:'Online order accepted and KOT/bill print queued' });
      }
      case 'reject-online-order': {
        const onlineOrders = state.onlineOrders.map(o => o.id === action.orderId ? { ...o, status:'rejected' as const } : o);
        return addLog({ ...state, onlineOrders }, { level:'warning', module:'Online Orders', message:'Online order rejected', detail:action.reason });
      }
      case 'reconcile-online-order': {
        const onlineOrders = state.onlineOrders.map(o => o.id === action.orderId ? { ...o, status:'reconciled' as const, payoutReceived: action.payoutReceived } : o);
        const order = state.onlineOrders.find(o => o.id === action.orderId);
        const level = order && Math.abs(action.payoutReceived - order.payoutExpected) > 1 ? 'warning' : 'success';
        return addLog({ ...state, onlineOrders }, { level, module:'Online Reconciliation', message:'Online payout reconciled', detail:order ? `Expected ${order.payoutExpected}, received ${action.payoutReceived}` : undefined });
      }
      case 'create-quotation': {
        if (!state.cart.length) return state;
        const totals = billTotals(state.cart, state.products);
        const quoteNo = `QT-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${String(state.quotations.length + 1).padStart(4,'0')}`;
        const quotation: Quotation = {
          id:crypto.randomUUID(), branchId:state.selectedBranchId, quoteNo,
          customerName:action.customerName.trim() || 'Customer', customerPhone:action.customerPhone,
          companyName:action.companyName, gstNumber:action.gstNumber,
          lines:state.cart, subTotal:totals.subTotal, total:totals.grandTotal, status:'open', createdAt:nowIso()
        };
        return addLog({ ...state, quotations:[quotation, ...state.quotations] }, { level:'success', module:'Quotation', message:`Quotation ${quoteNo} saved for ${quotation.customerName}` });
      }
      case 'quotation-status': {
        const quotations = state.quotations.map(q => q.id === action.quotationId ? { ...q, status:action.status } : q);
        return { ...state, quotations };
      }
      case 'convert-quotation': {
        const quotation = state.quotations.find(q => q.id === action.quotationId);
        if (!quotation || quotation.status !== 'open') return state;
        const quotations = state.quotations.map(q => q.id === quotation.id ? { ...q, status:'converted' as const } : q);
        return addLog({ ...state, quotations, cart:quotation.lines, selectedBranchId:quotation.branchId }, { level:'success', module:'Quotation', message:`Quotation ${quotation.quoteNo} loaded into the current bill` });
      }
      case 'book-delivery-order': {
        const phone = action.customerPhone.trim();
        let customers = state.customers;
        let customerId = phone ? customers.find(c => c.phone && c.phone === phone)?.id : undefined;
        if (!customerId) {
          const newCustomer: Customer = { id:crypto.randomUUID(), name: action.customerName.trim() || 'Customer', phone, type:'retail', creditLimit:0, loyaltyPoints:0, favoriteProducts:[] };
          customers = [newCustomer, ...customers];
          customerId = newCustomer.id;
        }
        const order: AdvanceOrder = {
          id:crypto.randomUUID(), status:'booked', branchId:action.branchId, customerId, productId:action.productId,
          qty:action.qty, deliveryAt:action.deliveryAt, designNotes:action.designNotes, imageRequired:action.imageRequired,
          advancePaid:action.advancePaid, balance:action.balance
        };
        return addLog({ ...state, customers, advanceOrders:[order, ...state.advanceOrders] }, { level:'success', module:'Advance Orders', message:'Delivery order booked and balance tracked' });
      }
      case 'create-advance-order': {
        const order: AdvanceOrder = { id:crypto.randomUUID(), status:'booked', ...action.order };
        return addLog({ ...state, advanceOrders:[order, ...state.advanceOrders] }, { level:'success', module:'Advance Orders', message:'Advance order booked and balance tracked' });
      }
      case 'advance-status': {
        const advanceOrders = state.advanceOrders.map(o => o.id === action.orderId ? { ...o, status:action.status } : o);
        return addLog({ ...state, advanceOrders }, { level:'success', module:'Advance Orders', message:`Advance order moved to ${action.status}` });
      }
      case 'add-credit-collection': {
        const entry: CreditEntry = { id:crypto.randomUUID(), customerId:action.customerId, debit:0, credit:action.amount, note:action.note, at:nowIso() };
        return addLog({ ...state, creditEntries:[entry, ...state.creditEntries] }, { level:'success', module:'Credit', message:'Credit collection recorded' });
      }
      case 'record-attendance': {
        const record: AttendanceRecord = { id:crypto.randomUUID(), ...action.record };
        return addLog({ ...state, attendance:[record, ...state.attendance] }, { level:'success', module:'Attendance', message:'Attendance recorded' });
      }
      case 'record-staff-advance': {
        const attendance = state.attendance.map(a => a.id === action.attendanceId ? { ...a, advanceTaken:(a.advanceTaken ?? 0) + action.amount, advanceDate:today(), advanceReason:action.reason } : a);
        return addLog({ ...state, attendance }, { level:'success', module:'Staff Advance', message:'Advance amount, date and reason saved' });
      }
      case 'queue-sync': return addLog(queueSync(state, action.table, action.action, action.payload), { level:'info', module:'Offline Sync', message:'Action queued for sync' });
      case 'mark-sync': return { ...state, syncQueue: state.syncQueue.map(q => q.id === action.syncId ? { ...q, status:action.status } : q) };
      default: return state;
    }
  } catch (err) {
    return addLog(state, { level:'error', module:'Runtime', message: err instanceof Error ? err.message : 'Unknown error', detail: err instanceof Error ? err.stack : undefined });
  }
}

function computeMetrics(state: State) {
  const productMap = byId(state.products);
  const lowIngredients = state.ingredients.filter(i => i.minStock > 0 && i.currentStock <= i.minStock);
  const expiringIngredients = state.ingredients.filter(i => i.expiryDate && new Date(i.expiryDate).getTime() - Date.now() < 48 * 3600_000);
  const pendingProduction = state.productionPlans.filter(p => p.status === 'pending-admin-approval');
  const runningProduction = state.productionPlans.filter(p => !['draft','pending-admin-approval','completed','cancelled','rejected'].includes(p.status));
  const openSession = activeCounter(state);
  const salesToday = state.bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const creditDue = state.creditEntries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0);
  const onlineNew = state.onlineOrders.filter(o => o.status === 'new').length;
  const refundsToday = state.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const expiringFinished = state.finishedStocks.filter(s => new Date(s.expiryAt).getTime() - Date.now() < 24 * 3600_000);
  const branchHealth = state.branches.filter(b => b.type === 'retail' || b.type === 'cloud-kitchen').map(branch => ({
    branch,
    open: Boolean(activeCounter(state, branch.id)),
    stockValue: state.finishedStocks.filter(s => s.branchId === branch.id).reduce((sum, s) => sum + s.qty * (productMap[s.productId]?.price ?? 0), 0),
    onlineNew: state.onlineOrders.filter(o => o.branchId === branch.id && o.status === 'new').length,
    expiryRisk: state.finishedStocks.filter(s => s.branchId === branch.id && new Date(s.expiryAt).getTime() - Date.now() < 24 * 3600_000).length
  }));
  const cartTotals = billTotals(state.cart, state.products);
  const itemSales = state.products.map(product => ({ product, qty: state.bills.flatMap(b => b.lines).filter(l => l.productId === product.id).reduce((sum, l) => sum + l.qty, 0) })).sort((a, b) => b.qty - a.qty);
  return { lowIngredients, expiringIngredients, pendingProduction, runningProduction, openSession, salesToday, creditDue, onlineNew, refundsToday, expiringFinished, branchHealth, cartTotals, itemSales };
}

type StoreContext = { state: State; dispatch: React.Dispatch<Action>; metrics: ReturnType<typeof computeMetrics> };
const BakeryStoreContext = createContext<StoreContext | null>(null);

export function BakeryStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('[BakeryStore] failed to persist state:', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    const onError = (event: ErrorEvent) => dispatch({ type:'log', event:{ level:'error', module:'Window Error', message:event.message, detail:event.filename } });
    const onUnhandled = (event: PromiseRejectionEvent) => dispatch({ type:'log', event:{ level:'error', module:'Promise Rejection', message:String(event.reason) } });
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => { window.removeEventListener('error', onError); window.removeEventListener('unhandledrejection', onUnhandled); };
  }, []);
  const metrics = useMemo(() => computeMetrics(state), [state]);
  return <BakeryStoreContext.Provider value={{ state, dispatch, metrics }}>{children}</BakeryStoreContext.Provider>;
}

export function useBakeryStore() {
  const ctx = useContext(BakeryStoreContext);
  if (!ctx) throw new Error('useBakeryStore must be used inside BakeryStoreProvider');
  return ctx;
}
