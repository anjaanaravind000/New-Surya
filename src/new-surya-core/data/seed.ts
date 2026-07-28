
import type { AdvanceOrder, AppUser, AttendanceRecord, Branch, Customer, DashboardId, DebugEvent, Dispatch, FinishedStock, Ingredient, Integration, OnlineOrder, ProductionPlan, PurchaseOrder, Recipe, Role, StockAudit, Supplier } from '../lib/types';
import { enrichProductsFromItemMaster } from './importedMasters';

const allActions = ['view','create','edit','delete','approve','print','export','refund','void','override','sync','close'] as const;
const viewCreateEdit = ['view','create','edit','export'] as const;

export const branches: Branch[] = [];

export const suppliers: Supplier[] = [];

const coreIngredients: Ingredient[] = [];

export const ingredients: Ingredient[] = [];
export const products = enrichProductsFromItemMaster([]);

export const recipes: Recipe[] = [];

export const branchPrices = [];

export const roles: Role[] = [
  { id:'executive', name:'Executive / Super Admin', description:'Full access to every dashboard, tab and action', dashboards:['admin','kitchen','branch','branch-incharge','stock-audit'] as DashboardId[], permissions:{} as any, branchIds:branches.map(b => b.id) },
  { id:'admin-manager', name:'Admin Manager', description:'Masters, approvals, stock, reports and staff', dashboards:['admin'] as DashboardId[], permissions:{} as any, branchIds:branches.map(b => b.id) },
  { id:'kitchen-manager', name:'Kitchen Manager', description:'Production planning, QC, packing and dispatch', dashboards:['kitchen'] as DashboardId[], permissions:{} as any, branchIds:['central-kitchen'] },
  { id:'branch-incharge', name:'Branch Incharge', description:'Runs one outlet: people, counters, orders, stock, approvals, cash and closure', dashboards:['branch-incharge'] as DashboardId[], permissions:{} as any, branchIds:branches.map(b => b.id) },
  { id:'branch-cashier', name:'Branch Cashier', description:'Counter open, billing, online orders and daily closure', dashboards:['branch'] as DashboardId[], permissions:{} as any, branchIds:branches.map(b => b.id) },
  { id:'auditor', name:'Stock Auditor', description:'Physical counts, inward verification, variance evidence and audit history', dashboards:['stock-audit'] as DashboardId[], permissions:{} as any, branchIds:branches.map(b => b.id) }
].map(role => role.id === 'executive' ? { ...role, permissions: Object.fromEntries(['executive-command','users-permissions','items-menu','branch-pricebook','recipes-bom','purchase-grn','inventory-ledger','stock-audit','production-approval','packing-dispatch','crm-loyalty','finance-gst','attendance-payroll','reports-bi','integrations','debug-centre','kitchen-planner','kitchen-kds','qc-waste','label-print','goods-receipt','counter-session','fast-billing','online-orders','advance-orders','credit-ledger','returns-refunds','daily-closure','offline-sync','hardware-devices'].map(key => [key, allActions])) as any } : role.id === 'branch-incharge' ? { ...role, permissions: { 'counter-session':['view','create','edit','close'], 'fast-billing':['view','create','print','refund','void','override'], 'online-orders':['view','create','edit','print','override'], 'advance-orders':['view','create','edit','print','override'], 'credit-ledger':['view','create','edit','export'], 'goods-receipt':['view','create','edit','approve'], 'inventory-ledger':['view','export'], 'stock-audit':['view','create','edit','approve'], 'returns-refunds':['view','create','approve','refund','void'], 'daily-closure':['view','create','approve','export','close'], 'attendance-payroll':['view','create','edit'], 'reports-bi':['view','export'], 'offline-sync':['view','sync'], 'hardware-devices':['view','edit'], 'debug-centre':['view'] } as any } : role.id === 'branch-cashier' ? { ...role, permissions: { 'counter-session':['view','create','close'], 'fast-billing':['view','create','print'], 'online-orders':['view','create','print'], 'advance-orders':['view','create','edit','print'], 'credit-ledger':['view','create'], 'daily-closure':['view','create','close'], 'debug-centre':['view'] } as any } : role.id === 'kitchen-manager' ? { ...role, permissions: { 'kitchen-planner':['view','create','edit'], 'kitchen-kds':['view','edit'], 'qc-waste':['view','create','edit'], 'label-print':['view','print'], 'packing-dispatch':['view','create','edit','print'], 'inventory-ledger':['view'], 'debug-centre':['view'] } as any } : { ...role, permissions: Object.fromEntries(['executive-command','users-permissions','items-menu','branch-pricebook','recipes-bom','purchase-grn','inventory-ledger','stock-audit','production-approval','packing-dispatch','crm-loyalty','finance-gst','attendance-payroll','reports-bi','integrations','debug-centre'].map(key => [key, viewCreateEdit])) as any });

export const users: AppUser[] = [];

export const productionPlans: ProductionPlan[] = [];

export const finishedStocks: FinishedStock[] = [];

export const dispatches: Dispatch[] = [];

export const counterSessions = [];
export const bills = [];
export const refunds = [];

export const customers: Customer[] = [];

export const creditEntries: never[] = [];

export const onlineOrders: OnlineOrder[] = [];

export const advanceOrders: AdvanceOrder[] = [];

export const attendance: AttendanceRecord[] = [];

export const integrations: Integration[] = [
  { id:'swiggy', name:'Swiggy Order Webhook', category:'aggregator', status:'missing-credentials', health:'warning', notes:'Adapter, queue, accept/reject and reconciliation model included. Needs official partner credentials.' },
  { id:'zomato', name:'Zomato Order Webhook', category:'aggregator', status:'missing-credentials', health:'warning', notes:'Adapter, queue, accept/reject and payout mismatch model included. Needs merchant credentials.' },
  { id:'paytm', name:'Paytm / UPI Merchant', category:'payment', status:'missing-credentials', health:'warning', notes:'Payment mode, UPI reference capture and settlement reconciliation screens included. Needs MID/key/webhook.' },
  { id:'whatsapp', name:'WhatsApp Business Bills', category:'communication', status:'sandbox', health:'warning', notes:'Bill, due reminder and order-ready templates modelled. Needs WABA template approval.' },
  { id:'tally', name:'Tally / Accounting Export', category:'accounting', status:'sandbox', health:'ok', notes:'Sales, GST, purchase, credit and payment export models included.' },
  { id:'thermal-printer', name:'Thermal Bill/KOT Printer', category:'hardware', status:'needs-device-test', health:'warning', notes:'Print queue and preview included. Needs local ESC/POS bridge testing.' },
  { id:'label-printer', name:'Batch Label Printer', category:'hardware', status:'needs-device-test', health:'warning', notes:'Label queue, batch/expiry/allergen payload included.' },
  { id:'weigh-scale', name:'Weighing Scale', category:'hardware', status:'needs-device-test', health:'warning', notes:'Weight item mode and barcode-ready billing included. Needs branch USB/serial integration.' },
  { id:'google-maps', name:'Google Maps / Branch Locator', category:'maps', status:'sandbox', health:'ok', notes:'Branch cards and customer delivery route fields included. Final Google Business Profile verification required.' },
  { id:'website', name:'Website / QR Ordering', category:'ecommerce', status:'sandbox', health:'ok', notes:'Order queue model included for website and table/QR orders.' }
];

export const debugEvents: DebugEvent[] = [];

export const stockAudits: StockAudit[] = [];

export const purchaseOrders: PurchaseOrder[] = [];
