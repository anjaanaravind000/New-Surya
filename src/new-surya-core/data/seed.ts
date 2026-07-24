
import type { AdvanceOrder, AppUser, AttendanceRecord, Branch, Customer, DebugEvent, Dispatch, FinishedStock, Ingredient, Integration, OnlineOrder, ProductionPlan, PurchaseOrder, Recipe, Role, StockAudit, Supplier } from '../lib/types';
import { addHours, nowIso, today } from '../lib/calculations';
import { posMenuBranchPrices, posMenuFinishedStocks, posMenuProducts } from './posMenu';
import { enrichProductsFromItemMaster, mergeImportedRawMaterials } from './importedMasters';

const allActions = ['view','create','edit','delete','approve','print','export','refund','void','override','sync','close'] as const;
const viewCreateEdit = ['view','create','edit','export'] as const;

export const branches: Branch[] = [
  { id:'central-kitchen', name:'Central Kitchen & Warehouse', type:'central-kitchen', address:'Client central kitchen - verify exact address', phone:'+91 90000 00001', openingHours:'24x7 production window', channels:['wholesale','website'], active:true },
  { id:'marathahalli', name:'Marathahalli', type:'retail', address:'Junction Main Road, next to Innovative Multiplex, Bengaluru - 560037', phone:'+91 98450 12345', openingHours:'8:00 AM - 11:00 PM', channels:['walk-in','swiggy','zomato','website','qr','phone'], active:true },
  { id:'sarjapur-road', name:'Sarjapur Flagship', type:'retail', address:'Opp. Wipro Corporate Office, Sarjapur Main Road, Bengaluru - 560035', phone:'+91 99402 22040', openingHours:'8:00 AM - 10:30 PM', channels:['walk-in','swiggy','zomato','website','qr','phone'], active:true },
  { id:'kadubeesanahalli', name:'Kadubeesanahalli', type:'retail', address:'Near Panathur Railway Bridge, Outer Ring Road, Bengaluru - 560103', phone:'+91 99500 19972', openingHours:'8:00 AM - 10:15 PM', channels:['walk-in','swiggy','zomato','website','qr','phone'], active:true },
  { id:'koramangala', name:'Koramangala', type:'cloud-kitchen', address:'No. 205-C, opposite Empire Hotel, Koramangala, Bengaluru - 560095', phone:'+91 95001 04422', openingHours:'8:00 AM - 11:00 PM', channels:['walk-in','swiggy','zomato','website','qr','phone'], active:true }
];

export const suppliers: Supplier[] = [
  { id:'sup-dryfruit', name:'Premium Dry Fruits Co.', phone:'+91 90000 10001', category:'Dry fruits', paymentTermsDays:14, gstin:'29ABCDE1234F1Z5', rating:4.7 },
  { id:'sup-dairy', name:'Fresh Dairy & Milk Supply', phone:'+91 90000 10002', category:'Milk and dairy', paymentTermsDays:7, gstin:'29ABCDE2234F1Z5', rating:4.5 },
  { id:'sup-packaging', name:'Packaging Mart', phone:'+91 90000 10003', category:'Boxes, labels and bags', paymentTermsDays:21, rating:4.1 },
  { id:'sup-grocery', name:'Bakery Essentials Depot', phone:'+91 90000 10004', category:'Sugar, flour, ghee, oil', paymentTermsDays:10, rating:4.3 }
];

const coreIngredients: Ingredient[] = [
  { id:'ing-ghee', name:'Pure Ghee', category:'Dairy/Fat', unit:'kg', currentStock:82, minStock:60, maxStock:220, reorderQty:100, unitCost:585, batchNo:'GHEE-0706', expiryDate:addHours(24*60), supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-sugar', name:'Sugar', category:'Sweetener', unit:'kg', currentStock:360, minStock:180, maxStock:900, reorderQty:300, unitCost:44, batchNo:'SUG-0706', supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-jaggery', name:'Palm Jaggery', category:'Sweetener', unit:'kg', currentStock:64, minStock:80, maxStock:260, reorderQty:120, unitCost:118, batchNo:'JAG-0706', supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-besan', name:'Besan Flour', category:'Flour', unit:'kg', currentStock:150, minStock:90, maxStock:450, reorderQty:180, unitCost:76, batchNo:'BES-0706', supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-maida', name:'Maida', category:'Flour', unit:'kg', currentStock:240, minStock:140, maxStock:650, reorderQty:250, unitCost:48, batchNo:'MAI-0706', supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-cashew', name:'Cashew', category:'Dry Fruit', unit:'kg', currentStock:21, minStock:35, maxStock:160, reorderQty:70, unitCost:760, batchNo:'CAS-0706', expiryDate:addHours(24*90), supplierId:'sup-dryfruit', storage:'ambient', allergen:'Tree nuts' },
  { id:'ing-milk', name:'Milk', category:'Dairy', unit:'ltr', currentStock:94, minStock:140, maxStock:380, reorderQty:180, unitCost:56, batchNo:'MILK-0706', expiryDate:addHours(36), supplierId:'sup-dairy', storage:'chilled', allergen:'Milk' },
  { id:'ing-cocoa', name:'Cocoa Powder', category:'Flavour', unit:'kg', currentStock:28, minStock:18, maxStock:80, reorderQty:45, unitCost:420, batchNo:'COC-0706', expiryDate:addHours(24*180), supplierId:'sup-dryfruit', storage:'ambient' },
  { id:'ing-oil', name:'Refined Oil', category:'Frying', unit:'ltr', currentStock:74, minStock:80, maxStock:220, reorderQty:120, unitCost:132, batchNo:'OIL-0706', supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-box', name:'Sweet Box / Label', category:'Packaging', unit:'pcs', currentStock:1850, minStock:2500, maxStock:9000, reorderQty:4000, unitCost:7.5, batchNo:'BOX-0706', supplierId:'sup-packaging', storage:'ambient' },
  { id:'ing-spices', name:'Spice Mix', category:'Savoury', unit:'kg', currentStock:32, minStock:25, maxStock:90, reorderQty:50, unitCost:210, batchNo:'SPC-0706', supplierId:'sup-grocery', storage:'ambient' },
  { id:'ing-paneer', name:'Paneer/Chenna', category:'Dairy', unit:'kg', currentStock:34, minStock:45, maxStock:120, reorderQty:70, unitCost:310, batchNo:'PAN-0706', expiryDate:addHours(28), supplierId:'sup-dairy', storage:'chilled', allergen:'Milk' }
];

export const ingredients = mergeImportedRawMaterials(coreIngredients);
export const products = enrichProductsFromItemMaster(posMenuProducts);

export const recipes: Recipe[] = [
  { id:'rec-mysore', productId:'prod-mysore-pak', outputQty:10, outputUnit:'kg', version:2, laborCost:260, overheadCost:120, packagingCost:180, active:true, instructions:['Roast besan in ghee','Prepare sugar syrup','Cook to correct consistency','Set, cool, cut and pack'], lines:[{ingredientId:'ing-ghee', qty:3.2, wastagePct:1.5, stage:'mixing'},{ingredientId:'ing-sugar', qty:4.6, wastagePct:1, stage:'mixing'},{ingredientId:'ing-besan', qty:3.4, wastagePct:1.2, stage:'mixing'},{ingredientId:'ing-box', qty:20, wastagePct:0.5, stage:'packing'}] },
  { id:'rec-palm', productId:'prod-palm-mysore', outputQty:10, outputUnit:'kg', version:1, laborCost:280, overheadCost:130, packagingCost:185, active:true, instructions:['Prepare palm jaggery syrup','Blend roasted besan','Set in tray','Cut and label palm jaggery variant'], lines:[{ingredientId:'ing-ghee', qty:3.0, wastagePct:1.5, stage:'mixing'},{ingredientId:'ing-jaggery', qty:5.0, wastagePct:1.2, stage:'mixing'},{ingredientId:'ing-besan', qty:3.4, wastagePct:1.2, stage:'mixing'},{ingredientId:'ing-box', qty:20, wastagePct:0.5, stage:'packing'}] },
  { id:'rec-rose-kaju', productId:'prod-rose-kaju', outputQty:10, outputUnit:'kg', version:1, laborCost:340, overheadCost:125, packagingCost:230, active:true, instructions:['Grind cashew paste','Cook sugar syrup','Add rose essence/petals','Sheet, cut and pack'], lines:[{ingredientId:'ing-cashew', qty:7.2, wastagePct:1.8, stage:'prep'},{ingredientId:'ing-sugar', qty:3.0, wastagePct:1, stage:'mixing'},{ingredientId:'ing-ghee', qty:0.8, wastagePct:1, stage:'mixing'},{ingredientId:'ing-box', qty:20, wastagePct:0.5, stage:'packing'}] },
  { id:'rec-milk-cake', productId:'prod-milk-cake', outputQty:10, outputUnit:'kg', version:1, laborCost:300, overheadCost:190, packagingCost:180, active:true, instructions:['Boil milk','Reduce to grainy texture','Add sugar and ghee','Set and cut'], lines:[{ingredientId:'ing-milk', qty:46, wastagePct:4, stage:'prep'},{ingredientId:'ing-sugar', qty:2.8, wastagePct:1, stage:'mixing'},{ingredientId:'ing-ghee', qty:0.6, wastagePct:1, stage:'mixing'},{ingredientId:'ing-box', qty:20, wastagePct:0.5, stage:'packing'}] },
  { id:'rec-nipattu', productId:'prod-garlic-nipattu', outputQty:100, outputUnit:'pcs', version:1, laborCost:180, overheadCost:80, packagingCost:140, active:true, instructions:['Mix dough','Roll and cut','Fry batch-wise','Cool and pack'], lines:[{ingredientId:'ing-maida', qty:6.5, wastagePct:1.2, stage:'mixing'},{ingredientId:'ing-oil', qty:2.8, wastagePct:1.5, stage:'baking'},{ingredientId:'ing-spices', qty:0.7, wastagePct:1, stage:'mixing'},{ingredientId:'ing-box', qty:35, wastagePct:0.5, stage:'packing'}] },
  { id:'rec-cake', productId:'prod-chocolate-cake', outputQty:10, outputUnit:'kg', version:2, laborCost:460, overheadCost:180, packagingCost:380, active:true, instructions:['Mix cake batter','Bake at controlled temperature','Cool','Decorate and label'], lines:[{ingredientId:'ing-maida', qty:3.1, wastagePct:1.5, stage:'mixing'},{ingredientId:'ing-cocoa', qty:0.8, wastagePct:2, stage:'mixing'},{ingredientId:'ing-sugar', qty:2.5, wastagePct:1, stage:'mixing'},{ingredientId:'ing-milk', qty:6, wastagePct:2, stage:'mixing'},{ingredientId:'ing-box', qty:10, wastagePct:0.5, stage:'packing'}] }
];

export const branchPrices = posMenuBranchPrices;

export const roles: Role[] = [
  { id:'executive', name:'Executive / Super Admin', description:'Full access to every dashboard, tab and action', dashboards:['admin','kitchen','branch','branch-incharge','stock-audit'], permissions:{} as any, branchIds:branches.map(b => b.id) },
  { id:'admin-manager', name:'Admin Manager', description:'Masters, approvals, stock, reports and staff', dashboards:['admin'], permissions:{} as any, branchIds:branches.map(b => b.id) },
  { id:'kitchen-manager', name:'Kitchen Manager', description:'Production planning, QC, packing and dispatch', dashboards:['kitchen'], permissions:{} as any, branchIds:['central-kitchen'] },
  { id:'branch-incharge', name:'Branch Incharge', description:'Runs one outlet: people, counters, orders, stock, approvals, cash and closure', dashboards:['branch-incharge'], permissions:{} as any, branchIds:['marathahalli','sarjapur-road','kadubeesanahalli','koramangala'] },
  { id:'branch-cashier', name:'Branch Cashier', description:'Counter open, billing, online orders and daily closure', dashboards:['branch'], permissions:{} as any, branchIds:['marathahalli','sarjapur-road','kadubeesanahalli','koramangala'] },
  { id:'auditor', name:'Stock Auditor', description:'Physical counts, inward verification, variance evidence and audit history', dashboards:['stock-audit'], permissions:{} as any, branchIds:branches.map(b => b.id) }
].map(role => role.id === 'executive' ? { ...role, permissions: Object.fromEntries(['executive-command','users-permissions','items-menu','branch-pricebook','recipes-bom','purchase-grn','inventory-ledger','stock-audit','production-approval','packing-dispatch','crm-loyalty','finance-gst','attendance-payroll','reports-bi','integrations','debug-centre','kitchen-planner','kitchen-kds','qc-waste','label-print','goods-receipt','counter-session','fast-billing','online-orders','advance-orders','credit-ledger','returns-refunds','daily-closure','offline-sync','hardware-devices'].map(key => [key, allActions])) as any } : role.id === 'branch-incharge' ? { ...role, permissions: { 'counter-session':['view','create','edit','close'], 'fast-billing':['view','create','print','refund','void','override'], 'online-orders':['view','create','edit','print','override'], 'advance-orders':['view','create','edit','print','override'], 'credit-ledger':['view','create','edit','export'], 'goods-receipt':['view','create','edit','approve'], 'inventory-ledger':['view','export'], 'stock-audit':['view','create','edit','approve'], 'returns-refunds':['view','create','approve','refund','void'], 'daily-closure':['view','create','approve','export','close'], 'attendance-payroll':['view','create','edit'], 'reports-bi':['view','export'], 'offline-sync':['view','sync'], 'hardware-devices':['view','edit'], 'debug-centre':['view'] } as any } : role.id === 'branch-cashier' ? { ...role, permissions: { 'counter-session':['view','create','close'], 'fast-billing':['view','create','print'], 'online-orders':['view','create','print'], 'advance-orders':['view','create','edit','print'], 'credit-ledger':['view','create'], 'daily-closure':['view','create','close'], 'debug-centre':['view'] } as any } : role.id === 'kitchen-manager' ? { ...role, permissions: { 'kitchen-planner':['view','create','edit'], 'kitchen-kds':['view','edit'], 'qc-waste':['view','create','edit'], 'label-print':['view','print'], 'packing-dispatch':['view','create','edit','print'], 'inventory-ledger':['view'], 'debug-centre':['view'] } as any } : { ...role, permissions: Object.fromEntries(['executive-command','users-permissions','items-menu','branch-pricebook','recipes-bom','purchase-grn','inventory-ledger','stock-audit','production-approval','packing-dispatch','crm-loyalty','finance-gst','attendance-payroll','reports-bi','integrations','debug-centre'].map(key => [key, viewCreateEdit])) as any });

export const users: AppUser[] = [];

export const productionPlans: ProductionPlan[] = [];

export const finishedStocks: FinishedStock[] = [...posMenuFinishedStocks];

export const dispatches: Dispatch[] = [];

export const counterSessions = [];
export const bills = [];
export const refunds = [];

export const customers: Customer[] = [
  { id:'cust-001', name:'Walk-in Customer', phone:'', type:'retail', creditLimit:0, loyaltyPoints:0, favoriteProducts:[] }
];

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
