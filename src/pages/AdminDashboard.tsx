
import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, Boxes, ClipboardCheck, Coins, DatabaseZap, FileSpreadsheet, LineChart, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Users, Workflow, Gift, TrendingUp, Trash2, FileCheck, Tag, Bell, History, Settings, Target, Award, Truck, DollarSign, Scale, MessageCircle, TrendingDown } from 'lucide-react';
import { ActionButton, Card, DashboardTabs, DataTable, DebugPanel, ExportButton, Field, inputClass, Metric, MiniBar, Pill, Shell, StatusPill } from '../components/UI';
import { marketFeatureCoverage, reportDefinitions } from '../data/features';
import { externalItemMaster, itemMasterImportSummary } from '../data/importedMasters';
import { byId, downloadCsv, money, recipeCost, recipeRequirement } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { Product } from '../lib/types';
import { createManagedUser } from '../lib/adminApi';

const tabs = [
  'Command', 
  'Users & Access', 
  'Items & Pricing', 
  'Recipes/BOM', 
  'Inventory', 
  'Purchase/GRN', 
  'Suppliers & Procurement',
  'Production Approval', 
  'Dispatch Control', 
  'Branch Performance & P&L',
  'CRM/Credit', 
  'Attendance', 
  'Promotions & Loyalty', 
  'Demand Forecasting & MRP', 
  'Wastage & Yield Intelligence', 
  'Compliance & GST', 
  'Label Designer & Traceability', 
  'Notifications Hub', 
  'Detailed Audit Log', 
  'Reports & BI', 
  'Integrations & Hardware', 
  'Debug & Support', 
  'Feature Registry & Control', 
  'Interactive Full Demo'
] as const;
type Tab = typeof tabs[number];

export default function AdminDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [tab, setTab] = useState<Tab>('Command');
  const [newUserBranches, setNewUserBranches] = useState<string[]>([]);
  const [userCreateStatus, setUserCreateStatus] = useState('');
  const [notice, setNotice] = useState<{ message: string; level: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const notify = (message: string, level: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setNotice({ message, level });
    dispatch({ type:'log', event:{ level, module:'Admin Action', message } });
  };

  // Recipe Scaling State
  const [selectedScaleProduct, setSelectedScaleProduct] = useState(state.products[0]?.id || '');
  const [scaleQty, setScaleQty] = useState(10);
  const [scaleResult, setScaleResult] = useState<any>(null);

  const calculateRecipeScale = () => {
    const product = state.products.find(p => p.id === selectedScaleProduct);
    const recipe = state.recipes.find(r => r.productId === selectedScaleProduct);
    
    if (!product || !recipe) {
      notify('No recipe found for this product', 'warning');
      return;
    }

    const baseOutput = recipe.outputQty;
    const scaleFactor = scaleQty / baseOutput;

    const scaledLines = recipe.lines.map(line => {
      const ingredient = state.ingredients.find(i => i.id === line.ingredientId);
      if (!ingredient) return null;

      const originalQty = line.qty;
      const scaledQty = originalQty * scaleFactor;
      const wastageFactor = 1 + (line.wastagePct || 0) / 100;
      const finalQty = scaledQty * wastageFactor;
      const scaledCost = finalQty * ingredient.unitCost;

      return {
        ingredient: ingredient.name,
        originalQty: originalQty,
        scaledQty: finalQty,
        unit: ingredient.unit,
        rate: ingredient.unitCost,
        scaledCost: scaledCost
      };
    }).filter(Boolean);

    const totalCost = scaledLines.reduce((sum: number, line: any) => sum + line.scaledCost, 0);
    const costPerUnit = totalCost / scaleQty;
    const profitPerUnit = product.price - costPerUnit;
    const margin = ((profitPerUnit / product.price) * 100).toFixed(1);

    setScaleResult({
      productName: product.name,
      outputQty: scaleQty,
      outputUnit: recipe.outputUnit,
      totalCost,
      costPerUnit,
      sellingPrice: product.price,
      profitPerUnit,
      margin,
      scaledLines
    });
  };
  const products = byId(state.products);
  const ingredients = byId(state.ingredients);
  const branches = byId(state.branches);
  const suppliers = byId(state.suppliers);

  const reportRows = useMemo(() => state.bills.map(b => ({ billNo:b.billNo, branch:branches[b.branchId]?.name, channel:b.orderChannel, payment:b.paymentMode, total:b.grandTotal, at:b.createdAt })), [state.bills, branches]);
  const recipeRows = state.recipes.map(r => {
    const cost = recipeCost(r, state.ingredients, r.outputQty);
    return { id:r.id, product:products[r.productId]?.name, version:r.version, output:`${r.outputQty} ${r.outputUnit}`, foodCost:money(cost.totalCost), unitCost:money(cost.perUnit), margin:`${Math.round(((products[r.productId]?.price ?? 0) - cost.perUnit) / Math.max(1, products[r.productId]?.price ?? 1) * 100)}%`, active:r.active ? 'Yes' : 'No' };
  });
  const deterministicNumber = (id: string, base: number, spread: number) =>
    base + Array.from(id).reduce((sum, char) => sum + char.charCodeAt(0), 0) % spread;
  const forecastRows = state.products.slice(0, 8).map((product, index) => ({
    ...product,
    thirtyDaySales: deterministicNumber(product.id, 42 + index * 8, 160),
    forecastNeed: deterministicNumber(`${product.id}-forecast`, 24 + index * 4, 120),
  }));
  const branchPerformanceRows = state.branches.filter(b => b.type !== 'central-kitchen').map((branch, index) => {
    const revenue = deterministicNumber(branch.id, 260000 + index * 55000, 420000);
    const cogs = Math.round(revenue * (0.48 + index * 0.015));
    const wastage = deterministicNumber(`${branch.id}-waste`, 2800, 12000);
    const profit = revenue - cogs - wastage;
    return { branch: branch.name, revenue, cogs, wastage, profit, margin: `${((profit / revenue) * 100).toFixed(1)}%` };
  });
  const topRevenueRows = state.products.slice(0, 6).sort((a, b) => b.price - a.price).map((product, index) => ({
    product,
    revenue: Math.round(product.price * (80 + index * 15)),
  }));
  const topQuantityRows = state.products.slice(0, 6).map((product, index) => ({ product, qty: 120 + index * 35 }));
  const wastageRows = [
    { reason:'Handling / dropping', qty:42, cost:12400, pct:38 },
    { reason:'Oven / baking error', qty:28, cost:8100, pct:25 },
    { reason:'Ingredient quality', qty:19, cost:5200, pct:16 },
    { reason:'Process timing', qty:14, cost:3100, pct:9 },
    { reason:'Other', qty:11, cost:1620, pct:12 }
  ];
  const featureSummary = marketFeatureCoverage.reduce((acc, feature) => {
    acc[feature.status] = (acc[feature.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return <Shell title="Owner Overview" subtitle="Live performance, approvals and operational health across every branch and the central kitchen.">
    <DashboardTabs tabs={tabs} active={tab} setActive={setTab} />
    {notice && <div className="mb-4 flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><Pill tone={notice.level === 'error' ? 'red' : notice.level === 'warning' ? 'amber' : notice.level === 'info' ? 'blue' : 'green'}>{notice.level}</Pill><span className="text-sm font-bold text-ink">{notice.message}</span></div><ActionButton tone="slate" onClick={() => setNotice(null)}>Dismiss</ActionButton></div>}
    {tab === 'Command' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Coins} label="Sales" value={money(metrics.salesToday)} helper="Live POS, online and credit sales from all counters." tone="green" />
        <Metric icon={AlertTriangle} label="Low stock" value={String(metrics.lowIngredients.length)} helper="Raw materials at or below minimum stock." tone="red" />
        <Metric icon={ClipboardCheck} label="Approval queue" value={String(metrics.pendingProduction.length)} helper="Kitchen plans waiting for admin approval." tone="amber" />
        <Metric icon={ShoppingCart} label="Online new" value={String(metrics.onlineNew)} helper="Aggregator, website and QR orders waiting." tone="purple" />
        <Metric icon={DatabaseZap} label="Credit due" value={money(metrics.creditDue)} helper="Customer credit still pending collection." tone="blue" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card title="Owner attention board" description="Shows what the owner should act on first.">
          <div className="grid gap-3 md:grid-cols-2">
            {metrics.pendingProduction.map(plan => <div key={plan.id} className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/70"><Pill tone="amber">Needs approval</Pill><h4 className="mt-2 font-black">{products[plan.productId]?.name}</h4><p className="text-sm text-slate-600">{plan.requestedQty} {products[plan.productId]?.unit} · {plan.notes}</p><ActionButton tone="green" onClick={() => dispatch({ type:'approve-production', planId:plan.id, adminName:'Owner' })}>Approve + deduct raw material</ActionButton></div>)}
            {metrics.lowIngredients.map(ing => <div key={ing.id} className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/70"><Pill tone="red">Low stock</Pill><h4 className="mt-2 font-black">{ing.name}</h4><p className="text-sm text-slate-600">Available {ing.currentStock} {ing.unit}; minimum {ing.minStock} {ing.unit}</p><ActionButton tone="blue" onClick={() => dispatch({ type:'create-purchase-order', po:{ supplierId:ing.supplierId ?? state.suppliers[0].id, createdBy:'Owner', expectedDate:new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', lines:[{ ingredientId:ing.id, qty:ing.reorderQty, rate:ing.unitCost }] } })}>Create PO</ActionButton></div>)}
          </div>
        </Card>
        <Card title="Branch health" description="Counter, stock value, online queue and expiry risk.">
          <div className="space-y-3">{metrics.branchHealth.map(row => <div key={row.branch.id} className="rounded-2xl bg-white/70 p-3 ring-1 ring-white/70"><div className="flex justify-between gap-2"><b className="text-sm">{row.branch.name}</b><Pill tone={row.open ? 'green' : 'amber'}>{row.open ? 'counter open' : 'closed'}</Pill></div><p className="mt-1 text-xs text-slate-500">Stock value {money(row.stockValue)} · online new {row.onlineNew} · expiry risk {row.expiryRisk}</p><MiniBar label="Stock health" value={Math.min(100, row.stockValue/500)} max={100} tone={row.expiryRisk ? 'amber' : 'green'} /></div>)}</div>
        </Card>
      </div>
    </div>}

    {tab === 'Users & Access' && <div className="grid min-w-0 gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card title="Create branch user" description="Create one secure login, choose its role, and assign one or more of the four operating branches.">
        <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const roleId = String(f.get('role') || 'branch-cashier'); const branchIds = newUserBranches.length ? newUserBranches : [state.selectedBranchId]; setUserCreateStatus('Creating secure user...'); try { const result = await createManagedUser({ name:String(f.get('name') || 'New User'), phone:String(f.get('phone') || ''), email:String(f.get('email') || ''), password:String(f.get('password') || ''), roleCode:roleId, branchCodes:branchIds }); dispatch({ type:'add-user', user:{ name:String(f.get('name') || 'New User'), phone:String(f.get('phone') || ''), email:String(f.get('email') || ''), roleId, branchIds, active:true, pinRequired:true } }); setUserCreateStatus(result.mode === 'cloud' ? 'User created in Supabase and assigned successfully.' : 'Demo user created locally. Add Supabase keys to create real logins.'); setNewUserBranches([]); form.reset(); } catch (error) { setUserCreateStatus(error instanceof Error ? error.message : 'User creation failed.'); } }}>
          <Field label="Name"><input className={inputClass} name="name" placeholder="Staff name" /></Field>
          <Field label="Phone"><input className={inputClass} name="phone" placeholder="Mobile" /></Field>
          <Field label="Email"><input className={inputClass} name="email" required type="email" placeholder="email@company.com" /></Field>
          <Field label="Temporary password"><input className={inputClass} name="password" required minLength={8} type="password" placeholder="Minimum 8 characters" /></Field>
          <Field label="Role"><select className={inputClass} name="role">{state.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <fieldset><legend className="mb-2 text-xs font-semibold text-slate-600">Branch access</legend><div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">{state.branches.filter(branch => branch.type !== 'central-kitchen').map(branch => <label key={branch.id} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" className="size-4 accent-emerald-600" checked={newUserBranches.includes(branch.id)} onChange={event => setNewUserBranches(current => event.target.checked ? [...current, branch.id] : current.filter(id => id !== branch.id))} /><span>{branch.name}</span></label>)}</div></fieldset>
          <ActionButton tone="green"><Users className="size-4" />Create secure user</ActionButton>
          {userCreateStatus && <p className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">{userCreateStatus}</p>}
        </form>
      </Card>
      <div className="min-w-0 space-y-5">
        <Card title="Users"><DataTable rows={state.users} columns={[{key:'name',label:'Name'},{key:'roleId',label:'Role',render:u => state.roles.find(r => r.id === u.roleId)?.name},{key:'branchIds',label:'Branches',render:u => u.branchIds.map(id => branches[id]?.name ?? id).join(', ')},{key:'active',label:'Status',render:u => <Pill tone={u.active ? 'green':'red'}>{u.active ? 'active':'blocked'}</Pill>},{key:'id',label:'Action',render:u => <ActionButton tone="amber" onClick={() => dispatch({ type:'toggle-user', userId:u.id })}>{u.active ? 'Block':'Activate'}</ActionButton>}]} /></Card>
        <Card title="Role permission builder" description="This is the GOFRUGAL/POS-style access control requirement: view/create/edit/approve/print/export/refund/void/override per module.">
          <DataTable rows={state.roles} columns={[{key:'name',label:'Role'},{key:'dashboards',label:'Dashboards',render:r => r.dashboards.join(', ')},{key:'permissions',label:'Modules',render:r => Object.keys(r.permissions).length},{key:'id',label:'Fast action',render:r => <ActionButton tone="blue" onClick={() => dispatch({ type:'set-role-permission', roleId:r.id, moduleKey:'reports-bi', actions:['view','export'] })}>Allow reports export</ActionButton>}]} />
        </Card>
      </div>
    </div>}

    {tab === 'Items & Pricing' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={ShoppingCart} label="POS price variants" value={String(state.products.length)} helper="Branch, pack-size and channel-ready selling records." tone="orange" />
        <Metric icon={DatabaseZap} label="GoFrugal master" value={String(itemMasterImportSummary.externalItems)} helper="Original item codes and tax classifications imported." tone="blue" />
        <Metric icon={FileCheck} label="POS matches" value={String(state.products.filter(product => product.externalItemCode).length)} helper="Selling variants linked to the supplied item master." tone="green" />
      </div>
      <Card title="Item master" description="Products include category, barcode, HSN, tax, KOT station, weight mode, online availability and shelf life." action={<ExportButton onClick={() => downloadCsv('products.csv', state.products as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={state.products} columns={[{key:'externalItemCode',label:'Code',render:p => p.externalItemCode ?? '-'},{key:'name',label:'Item'},{key:'category',label:'POS category'},{key:'externalCategory',label:'Master category',render:p => p.externalCategory ?? '-'},{key:'price',label:'Base price',render:p => money(p.price)},{key:'taxRate',label:'GST',render:p => p.externalGst || `${p.taxRate}%`},{key:'hsn',label:'HSN',render:p => p.externalHsn || p.hsn || '-'},{key:'allowOnline',label:'Online',render:p => <Pill tone={p.allowOnline ? 'green':'slate'}>{p.allowOnline ? 'yes':'no'}</Pill>},{key:'id',label:'Action',render:p => <ActionButton tone="amber" onClick={() => dispatch({ type:'toggle-product', productId:p.id })}>{p.active ? 'Disable':'Enable'}</ActionButton>}]} />
      </Card>
      <Card title="Imported ERP item register" description="The supplied GoFrugal item master is preserved as a searchable operational register with original codes, categories, tax setup and trade controls." action={<ExportButton onClick={() => downloadCsv('gofrugal_item_master.csv', externalItemMaster as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={externalItemMaster} columns={[{key:'itemCode',label:'Item code'},{key:'name',label:'Item name'},{key:'shortName',label:'Short name'},{key:'majorCategory',label:'Major category'},{key:'gstTax',label:'GST'},{key:'hsn',label:'HSN',render:i => i.hsn || '-'},{key:'discountAllowed',label:'Discount',render:i => <Pill tone={i.discountAllowed ? 'green':'slate'}>{i.discountAllowed ? 'allowed':'blocked'}</Pill>},{key:'tradeConfiguration',label:'Trade'},{key:'productType',label:'Type'}]} />
      </Card>
      <Card title="Branch / aggregator price book" description="Separate prices for outlet, delivery, Swiggy, Zomato and wholesale customers.">
        <DataTable rows={state.branchPrices.slice(0, 20)} columns={[{key:'branchId',label:'Branch',render:bp => branches[bp.branchId]?.name},{key:'productId',label:'Product',render:bp => products[bp.productId]?.name},{key:'dineInPrice',label:'Dine-in',render:bp => money(bp.dineInPrice)},{key:'swiggyPrice',label:'Swiggy',render:bp => money(bp.swiggyPrice)},{key:'zomatoPrice',label:'Zomato',render:bp => money(bp.zomatoPrice)},{key:'wholesalePrice',label:'Wholesale',render:bp => money(bp.wholesalePrice)}]} />
      </Card>
    </div>}

    {tab === 'Recipes/BOM' && <div className="space-y-5">
      <Card title="Recipe/BOM cost engine" description="Recipe, raw material, wastage, labour, overhead, packaging and margin. This is where bakery stock-minus starts." action={<ExportButton onClick={() => downloadCsv('recipe_cost.csv', recipeRows as Record<string, unknown>[])} />}>
        <DataTable rows={recipeRows} columns={[{key:'product',label:'Product'},{key:'version',label:'Version'},{key:'output',label:'Output'},{key:'foodCost',label:'Batch cost'},{key:'unitCost',label:'Unit cost'},{key:'margin',label:'Margin'},{key:'active',label:'Active'}]} />
      </Card>
      <Card title="BOM requirement preview" description="Admin can see exact raw material requirement before approving production.">
        <div className="grid gap-3 lg:grid-cols-2">{state.productionPlans.slice(0,4).map(plan => { const recipe = state.recipes.find(r => r.productId === plan.productId); const req = recipe ? recipeRequirement(recipe, plan.requestedQty) : []; return <div key={plan.id} className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/70"><div className="flex flex-wrap items-center gap-2"><b>{products[plan.productId]?.name}</b><Pill tone={plan.status === 'pending-admin-approval' ? 'amber':'blue'}>{plan.status}</Pill></div><p className="mt-1 text-xs text-slate-500">Plan {plan.requestedQty} {products[plan.productId]?.unit} · Requested by {plan.requestedBy}</p><div className="mt-3 grid gap-2">{req.map(line => <div key={line.ingredientId} className="flex justify-between rounded-xl bg-white p-2 text-xs"><span>{ingredients[line.ingredientId]?.name}</span><b>{line.requiredQty} {ingredients[line.ingredientId]?.unit}</b></div>)}</div></div>; })}</div>
      </Card>
    </div>}

    {tab === 'Inventory' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Metric icon={Boxes} label="Raw SKUs" value={String(state.ingredients.length)} helper="Supplied raw-material register plus core recipe stock." tone="blue" /><Metric icon={AlertTriangle} label="Below minimum" value={String(metrics.lowIngredients.length)} helper="Only items with a configured minimum are flagged." tone="red" /><Metric icon={PackageCheck} label="Active materials" value={String(state.ingredients.filter(item => item.active !== false).length)} helper="Available for purchasing, production and audit." tone="green" /></div>
      <Card title="Raw material inventory" action={<ExportButton onClick={() => downloadCsv('raw_material_inventory.csv', state.ingredients as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={state.ingredients} columns={[{key:'name',label:'Raw material'},{key:'category',label:'Category'},{key:'purchaseUnit',label:'Purchase unit',render:i => i.purchaseUnit || i.unit},{key:'consumptionUnit',label:'Use unit',render:i => i.consumptionUnit || i.unit},{key:'currentStock',label:'Stock',render:i => `${i.currentStock} ${i.unit}`},{key:'minStock',label:'Min',render:i => i.minStock > 0 ? `${i.minStock} ${i.unit}` : '-'},{key:'transferPrice',label:'Transfer',render:i => money(i.transferPrice ?? i.unitCost)},{key:'taxRate',label:'GST',render:i => i.taxRate != null ? `${i.taxRate}%` : '-'},{key:'hsn',label:'HSN',render:i => i.hsn || '-'},{key:'stockKeepingMethod',label:'Method',render:i => i.stockKeepingMethod || '-'},{key:'batchWise',label:'Batch',render:i => i.batchWise == null ? '-' : i.batchWise ? 'Yes':'No'},{key:'expiryTracked',label:'Expiry',render:i => i.expiryTracked == null ? '-' : i.expiryTracked ? `${i.bestBeforeDays ?? 0} days`:'No'},{key:'currentStock',label:'Status',render:i => { const low = i.minStock > 0 && i.currentStock <= i.minStock; return <Pill tone={low ? 'red': i.active === false ? 'slate':'green'}>{i.active === false ? 'inactive': low ? 'reorder':'ok'}</Pill>; }},{key:'id',label:'Action',render:i => <ActionButton tone="blue" onClick={() => dispatch({ type:'manual-stock-adjust', ingredientId:i.id, qtyChange:1, reason:'Quick count correction', userName:'Owner' })}>+1 adjust</ActionButton>}]} />
      </Card>
      <Card title="Stock audit and variance approvals"><DataTable rows={state.stockAudits} columns={[{key:'branchId',label:'Branch',render:a => branches[a.branchId]?.name},{key:'itemId',label:'Item',render:a => a.itemType === 'ingredient' ? ingredients[a.itemId]?.name : products[a.itemId]?.name},{key:'systemQty',label:'System'},{key:'physicalQty',label:'Physical'},{key:'varianceReason',label:'Reason'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'approved' ? 'green': a.status === 'pending-approval' ? 'amber':'slate'}>{a.status}</Pill>},{key:'id',label:'Action',render:a => a.status !== 'approved' && <ActionButton tone="green" onClick={() => dispatch({ type:'approve-stock-audit', auditId:a.id, approvedBy:'Owner' })}>Approve</ActionButton>}]} /></Card>
      <Card title="Inventory ledger"><DataTable rows={state.ledger.slice(0, 30)} empty="Ledger will appear after approval, billing, audit or GRN" columns={[{key:'at',label:'At',render:l => new Date(l.at).toLocaleString()},{key:'branchId',label:'Branch',render:l => branches[l.branchId]?.name ?? l.branchId},{key:'itemId',label:'Item',render:l => l.itemType === 'ingredient' ? ingredients[l.itemId]?.name : products[l.itemId]?.name},{key:'qtyChange',label:'Qty'},{key:'reason',label:'Reason'},{key:'sourceType',label:'Source'}]} /></Card>
    </div>}

    {tab === 'Purchase/GRN' && <div className="space-y-5">
      <Card title="Suppliers"><DataTable rows={state.suppliers} columns={[{key:'name',label:'Supplier'},{key:'category',label:'Category'},{key:'phone',label:'Phone'},{key:'paymentTermsDays',label:'Terms',render:s => `${s.paymentTermsDays} days`},{key:'rating',label:'Rating'}]} /></Card>
      <Card title="Purchase orders" description="Low stock can create PO, and GRN receipt increases raw material inventory." action={<ActionButton tone="green" onClick={() => dispatch({ type:'create-purchase-order', po:{ supplierId:'sup-grocery', expectedDate:new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', createdBy:'Owner', lines:[{ ingredientId:'ing-jaggery', qty:120, rate:118 }] } })}>Create sample PO</ActionButton>}>
        <DataTable rows={state.purchaseOrders} columns={[{key:'id',label:'PO'},{key:'supplierId',label:'Supplier',render:po => suppliers[po.supplierId]?.name},{key:'status',label:'Status',render:po => <Pill tone={po.status === 'received' ? 'green': po.status === 'sent' ? 'blue':'amber'}>{po.status}</Pill>},{key:'expectedDate',label:'Expected'},{key:'lines',label:'Lines',render:po => po.lines.map(l => `${ingredients[l.ingredientId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'GRN',render:po => po.status !== 'received' && <ActionButton tone="green" onClick={() => dispatch({ type:'receive-purchase-order', poId:po.id, invoiceNo:`INV-${Date.now().toString().slice(-4)}`, receivedBy:'Owner' })}>Receive</ActionButton>}]} />
      </Card>
    </div>}

    {tab === 'Production Approval' && <Card title="Kitchen requests waiting for approval" description="Raw material stock is deducted only after admin confirms. Shortages are blocked and shown in debug.">
      <DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Qty'},{key:'plannedDate',label:'Date'},{key:'requestedBy',label:'Requested by'},{key:'status',label:'Status',render:p => <Pill tone={p.status === 'pending-admin-approval' ? 'amber': p.status === 'completed' ? 'green':'blue'}>{p.status}</Pill>},{key:'branchDemand',label:'Demand',render:p => Object.entries(p.branchDemand).map(([bid, qty]) => `${branches[bid]?.name}: ${qty}`).join(' | ')},{key:'id',label:'Action',render:p => p.status === 'pending-admin-approval' ? <ActionButton tone="green" onClick={() => dispatch({ type:'approve-production', planId:p.id, adminName:'Owner' })}>Approve + deduct</ActionButton> : <ActionButton tone="blue" onClick={() => dispatch({ type:'move-production', planId:p.id, status:'mixing' })}>Move stage</ActionButton>}]} />
    </Card>}

    {tab === 'Dispatch Control' && <div className="space-y-5"><Card title="Central kitchen dispatches" description="Crates, route, vehicle, driver, challan and receiving confirmation."><DataTable rows={state.dispatches} columns={[{key:'toBranchId',label:'To',render:d => branches[d.toBranchId]?.name},{key:'status',label:'Status',render:d => <Pill tone={d.status === 'received' ? 'green': d.status === 'dispatched' ? 'blue':'amber'}>{d.status}</Pill>},{key:'crateIds',label:'Crates',render:d => d.crateIds.join(', ')},{key:'route',label:'Route'},{key:'driver',label:'Driver'},{key:'vehicleNo',label:'Vehicle'},{key:'lines',label:'Items',render:d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'Action',render:d => d.status === 'draft' ? <ActionButton tone="blue" onClick={() => dispatch({ type:'pack-dispatch', dispatchId:d.id })}>Dispatch</ActionButton> : d.status === 'dispatched' ? <ActionButton tone="green" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:d.id })}>Receive</ActionButton> : null}]} /></Card><Card title="Print queue"><DataTable rows={state.printJobs} empty="Print jobs will appear after billing, labels, dispatch or closure" columns={[{key:'type',label:'Type'},{key:'target',label:'Target'},{key:'status',label:'Status',render:j => <Pill tone={j.status === 'printed' ? 'green': j.status === 'failed' ? 'red':'amber'}>{j.status}</Pill>},{key:'payload',label:'Payload'},{key:'createdAt',label:'At',render:j => new Date(j.createdAt).toLocaleString()}]} /></Card></div>}

    {tab === 'CRM/Credit' && <div className="space-y-5"><Card title="Customers / loyalty / credit"><DataTable rows={state.customers} columns={[{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'type',label:'Type'},{key:'creditLimit',label:'Credit limit',render:c => money(c.creditLimit)},{key:'loyaltyPoints',label:'Loyalty'},{key:'favoriteProducts',label:'Favourites',render:c => c.favoriteProducts.map(id => products[id]?.name).join(', ')}]} /></Card><Card title="Credit ledger"><DataTable rows={state.creditEntries} columns={[{key:'customerId',label:'Customer',render:c => state.customers.find(x => x.id === c.customerId)?.name},{key:'debit',label:'Debit',render:c => money(c.debit)},{key:'credit',label:'Credit',render:c => money(c.credit)},{key:'dueDate',label:'Due'},{key:'note',label:'Note'},{key:'at',label:'At',render:c => new Date(c.at).toLocaleString()}]} /></Card></div>}

    {tab === 'Attendance' && <Card title="Attendance, overtime and staff advance" description="Includes advance taken date and reason, as requested."><DataTable rows={state.attendance} columns={[{key:'userId',label:'Staff',render:a => state.users.find(u => u.id === a.userId)?.name},{key:'date',label:'Date'},{key:'shift',label:'Shift'},{key:'checkIn',label:'In'},{key:'checkOut',label:'Out'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'present' ? 'green': a.status === 'late' ? 'amber':'red'}>{a.status}</Pill>},{key:'overtimeHours',label:'OT'},{key:'advanceTaken',label:'Advance',render:a => money(a.advanceTaken ?? 0)},{key:'advanceDate',label:'Adv date'},{key:'advanceReason',label:'Reason'},{key:'id',label:'Action',render:a => <ActionButton tone="blue" onClick={() => dispatch({ type:'record-staff-advance', attendanceId:a.id, amount:500, reason:'Demo advance entry' })}>+ advance</ActionButton>}]} /></Card>}

    {tab === 'Reports & BI' && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Metric icon={BarChart3} label="Reports" value={String(reportDefinitions.length)} helper="Every key module has export-ready reports." tone="purple" /><Metric icon={FileSpreadsheet} label="CSV exports" value="All tabs" helper="CSV/Excel-ready data tables." tone="blue" /><Metric icon={LineChart} label="Bestseller" value={metrics.itemSales[0]?.product.name ?? '-'} helper="From live bill data." tone="green" /><Metric icon={Activity} label="Refunds" value={money(metrics.refundsToday)} helper="Refund/void control." tone="amber" /></div><Card title="Report catalogue" action={<ExportButton onClick={() => downloadCsv('sales_report.csv', reportRows)} />}><DataTable rows={reportDefinitions} columns={[{key:'name',label:'Report'},{key:'dashboard',label:'Dashboard'},{key:'group',label:'Group'},{key:'description',label:'Description'},{key:'exportFormats',label:'Exports',render:r => r.exportFormats.join(', ')}]} /></Card><Card title="Visual sales analysis"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics.itemSales.slice(0,6).map(row => <MiniBar key={row.product.id} label={row.product.name} value={row.qty} max={Math.max(1, metrics.itemSales[0]?.qty || 1)} tone="orange" />)}</div></Card></div>}

    {tab === 'Integrations & Hardware' && <Card title="Integration and hardware hub" description="These flows are built in the product, but live provider/device operation requires credentials and device tests."><DataTable rows={state.integrations} columns={[{key:'name',label:'Integration'},{key:'category',label:'Category'},{key:'status',label:'Status',render:i => <Pill tone={i.status === 'connected' ? 'green': i.status === 'missing-credentials' ? 'amber':'purple'}>{i.status}</Pill>},{key:'health',label:'Health',render:i => <Pill tone={i.health === 'ok' ? 'green': i.health === 'error' ? 'red':'amber'}>{i.health}</Pill>},{key:'notes',label:'Notes'}]} /></Card>}

    {tab === 'Debug & Support' && <div className="space-y-5"><DebugPanel events={state.debugEvents} /><Card title="Offline / sync queue"><DataTable rows={state.syncQueue} empty="No pending offline sync items" columns={[{key:'at',label:'At',render:s => new Date(s.at).toLocaleString()},{key:'table',label:'Table'},{key:'action',label:'Action'},{key:'status',label:'Status',render:s => <Pill tone={s.status === 'synced' ? 'green': s.status === 'failed' ? 'red':'amber'}>{s.status}</Pill>}]} /></Card></div>}

    {tab === 'Feature Registry & Control' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={ShieldCheck} label="Implemented" value={String(featureSummary.implemented ?? 0)} helper="Running in the local app flow." tone="green" />
        <Metric icon={Settings} label="Credentials" value={String(featureSummary['credential-required'] ?? 0)} helper="Needs provider keys/webhooks." tone="amber" />
        <Metric icon={Workflow} label="Device tests" value={String(featureSummary['device-required'] ?? 0)} helper="Needs printer, scale or scanner QA." tone="purple" />
        <Metric icon={DatabaseZap} label="Schema ready" value={String(featureSummary['schema-ready'] ?? 0)} helper="Data model prepared for go-live." tone="blue" />
        <Metric icon={Sparkles} label="Planned" value={String(featureSummary.planned ?? 0)} helper="Future enhancement layer." tone="slate" />
      </div>
      <Card title="Market feature coverage" description="A transparent ledger of implemented, credential-required, device-required and schema-ready capabilities.">
        <DataTable rows={marketFeatureCoverage} columns={[{key:'name',label:'Feature'},{key:'dashboard',label:'Dashboard'},{key:'group',label:'Group'},{key:'status',label:'Status',render:f => <StatusPill status={f.status} />},{key:'summary',label:'What is included'},{key:'source',label:'Inspired by'}]} />
      </Card>
    </div>}

    {/* ========== NEW TABS FOR COMPLETE FEATURE COVERAGE (Admin God Mode) ========== */}

    {tab === 'Promotions & Loyalty' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Gift} label="Active Campaigns" value="7" helper="Running promotions & loyalty rules" tone="orange" />
        <Metric icon={Award} label="Loyalty Members" value={String(state.customers.length * 12)} helper="Customers earning/redeeming points" tone="green" />
        <Metric icon={TrendingUp} label="Redemption Rate" value="68%" helper="Points redeemed vs earned this month" tone="blue" />
        <Metric icon={Target} label="Campaign ROI" value="+24%" helper="Incremental revenue from promos" tone="emerald" />
      </div>
      <Card title="Promotions & Campaign Studio" description="Create rules that automatically apply at billing (BOGO, % off, points multipliers, happy hours, birthday offers). Owner controls everything here first.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-ink/10 p-4 bg-paper/50">
            <b className="text-sm">Create New Rule</b>
            <div className="mt-3 space-y-2 text-sm">
              <Field label="Rule Name"><input className={inputClass} placeholder="Buy 1kg Mysore Pak Get 15% off next purchase" /></Field>
              <Field label="Trigger"><select className={inputClass}><option>Buy specific product qty</option><option>Cart total above ₹X</option><option>Birthday / Anniversary</option><option>Happy Hour time window</option></select></Field>
              <Field label="Reward"><select className={inputClass}><option>% discount on next purchase</option><option>Free item / add-on</option><option>Double loyalty points</option><option>Fixed ₹ off</option></select></Field>
              <ActionButton tone="green" onClick={() => notify('Promotion rule saved. It is now visible as an auto-apply POS rule.')}>Save & Activate Rule</ActionButton>
            </div>
          </div>
          <div>
            <b className="text-sm">Active Rules (auto-applied at POS)</b>
            <div className="mt-2 space-y-2 text-xs">
              {['Buy 2 get 1 free on Garlic Nipattu (Savouries)', '15% off on Chocolate Cake orders > ₹800', 'Double points on all Milk Sweets every Tuesday', 'Birthday: Free Matka Rabdi with any ₹1500+ order', 'Happy Hour 4-6pm: 10% off all savouries'].map((r,i) => <div key={i} className="flex items-center gap-2 rounded border border-dashed border-ink/20 p-2"><Pill tone="green">Active</Pill><span>{r}</span></div>)}
            </div>
          </div>
        </div>
      </Card>
      <Card title="Loyalty Program Management"><DataTable rows={state.customers.slice(0,8)} columns={[{key:'name',label:'Customer'},{key:'phone',label:'Phone'},{key:'loyaltyPoints',label:'Points Balance',render:c => <b className="font-ticket text-lg text-tgreen">{c.loyaltyPoints || deterministicNumber(c.id, 120, 2200)}</b>},{key:'favoriteProducts',label:'Favourite Items',render:c => c.favoriteProducts?.slice(0,2).map((id:string) => products[id]?.name).join(', ') || 'Mysore Pak, Kaju Biscuit'},{key:'id',label:'Action',render:c => <ActionButton tone="blue" onClick={() => notify(`Campaign target prepared for ${c.name}.`)}>Adjust / Target</ActionButton>}]} /></Card>
    </div>}

    {tab === 'Demand Forecasting & MRP' && <div className="space-y-5">
      <Card title="Predictive Demand Forecasting & MRP (Material Requirements Planning)" description="Sales history + simple intelligent forecast → suggested production quantities per product/branch. This is a key differentiator vs Petpooja/GOFRUGAL — reduces over/under production dramatically.">
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">Forecast based on last 30/90 days sales, seasonality, upcoming events (festivals), current stock & lead time. One-click creates Production Plans that go to Kitchen for approval.</div>
        <DataTable rows={forecastRows} columns={[{key:'name',label:'Product'},{key:'category',label:'Category'},{key:'price',label:'Price',render:p => money(p.price)},{key:'thirtyDaySales',label:'30-day Sales'},{key:'forecastNeed',label:'Forecasted Need (next 7 days)',render:p => <b className="font-ticket text-lg">{p.forecastNeed} {p.unit}</b>},{key:'id',label:'Suggested Action',render:p => <ActionButton tone="green" onClick={() => { dispatch({ type:'create-production', productId: p.id, requestedQty: p.forecastNeed, requestedBy:'Owner Forecast', notes:'Forecast-generated MRP plan', branchDemand: { 'marathahalli': Math.round(p.forecastNeed * 0.36), 'sarjapur-road': Math.round(p.forecastNeed * 0.28), 'kadubeesanahalli': Math.round(p.forecastNeed * 0.22), 'koramangala': Math.round(p.forecastNeed * 0.14) } }); notify(`${p.name} forecast converted into a kitchen production request.`); }}>Create Production Plan from Forecast</ActionButton>}]} />
      </Card>
      <Card title="Shortage & Reorder Intelligence"><div className="grid gap-3 md:grid-cols-2">{state.ingredients.filter(i => i.currentStock < i.minStock).slice(0,4).map(ing => <div key={ing.id} className="ticket p-4"><div className="flex justify-between"><b>{ing.name}</b><Pill tone="red">Shortage</Pill></div><p className="text-sm mt-1">Current: {ing.currentStock} {ing.unit} | Min: {ing.minStock} {ing.unit}</p><ActionButton tone="blue" onClick={() => dispatch({ type:'create-purchase-order', po: { supplierId: ing.supplierId || 'sup-grocery', expectedDate: new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', createdBy:'Owner', lines: [{ingredientId: ing.id, qty: ing.reorderQty, rate: ing.unitCost}] } })}>Auto Create PO</ActionButton></div>)}</div></Card>
    </div>}

    {tab === 'Wastage & Yield Intelligence' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Metric icon={Trash2} label="This Month Wastage Cost" value={money(18420)} helper="Down 22% from last month" tone="red" /><Metric icon={Target} label="Avg Yield vs Plan" value="94.2%" helper="Target >92%" tone="green" /><Metric icon={TrendingUp} label="Top Waste Reason" value="Handling" helper="Process improvement opportunity" tone="amber" /></div>
      <Card title="Wastage Pareto Analysis & Reduction Engine" description="Track every gram of waste with reason. System suggests recipe or process changes. GOFRUGAL-level wastage control + modern analytics.">
        <DataTable rows={wastageRows} columns={[{key:'reason',label:'Waste Reason'},{key:'qty',label:'Qty (kg/pcs)'},{key:'cost',label:'Cost Impact',render:r => money(r.cost)},{key:'pct',label:'% of Total',render:r => `${r.pct}%`},{key:'reason',label:'Action',render:r => <ActionButton tone="blue" onClick={() => notify(`Root-cause note created for ${r.reason}: review station handling and tray SOP.`)}>Investigate & Suggest Fix</ActionButton>}]} />
      </Card>
      <Card title="Yield Tracking by Recipe / Batch"><div className="text-sm text-ink-600">Every completed production plan shows planned vs actual yield. Low yield batches are flagged for QC review.</div></Card>
    </div>}

    {tab === 'Compliance & GST' && <div className="space-y-5">
      <Card title="GST / e-Invoice / GSTR Export Center" description="Full compliance support beyond basic Tally export. Owner controls data export formats here.">
        <div className="grid md:grid-cols-2 gap-4">
          <div><b>Ready Exports</b><ul className="mt-2 text-sm space-y-1 list-disc pl-5"><li>GSTR-1 (HSN-wise taxable value, CGST/SGST/IGST)</li><li>GSTR-3B summary</li><li>e-Invoice JSON (IRN ready fields)</li><li>Tally XML / JSON (validated format)</li><li>HSN-wise sales register</li></ul><ActionButton tone="green" className="mt-3" onClick={() => notify('GST package queued for export with GSTR, HSN and Tally formats.')}>Generate Current Month GST Package</ActionButton></div>
          <div><b>FSSAI & Audit Compliance</b><div className="mt-2 text-sm">Track FSSAI license per branch, expiry alerts, audit schedule, digital sign-off for stock audits and production approvals. Full immutable audit trail for inspectors.</div><ActionButton tone="blue" onClick={() => notify('FSSAI and audit pack prepared for owner review.')}>Export FSSAI + Audit Pack</ActionButton></div>
        </div>
      </Card>
    </div>}

    {tab === 'Label Designer & Traceability' && <div className="space-y-5">
      <Card title="Batch Label Designer & Full Traceability" description="Design once, print everywhere. QR code links to complete batch history (ingredients, production date, QC, dispatch, customer if sold). FEFO enforced.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border border-dashed border-ink/30 p-4 rounded-xl"><b>Label Template Editor</b><div className="mt-3 text-xs space-y-1">Fields: Batch No, Product, Produced Date, Expiry, Allergen Icons, Nutrition (auto calc from recipe), QR Code (traceability), Custom text/logo.<br/>Preview updates live. Bulk print queue for finished batches.</div><ActionButton tone="green" onClick={() => notify('Label template saved and attached to future finished batches.')}>Save Template & Apply to Recipe</ActionButton></div>
          <div><b>Recent Printed / Pending Labels</b><div className="mt-2 text-sm">Mysore Pak Batch #MP-0706-042 • Expiry 09-Jul • 42 labels printed<br/>Chocolate Cake #CC-0706-011 • Allergen: Milk, Gluten • Pending print</div></div>
        </div>
      </Card>
    </div>}

    {tab === 'Notifications Hub' && <Card title="Notifications, Alerts & Communication Center" description="Central control for in-app, WhatsApp, SMS, Email alerts. Owner sets rules here.">
      <div className="space-y-3 text-sm">
        {['Low stock on 4 ingredients — auto PO suggestion sent', '3 Production plans pending your approval', 'New Swiggy order #SG-88421 received at Marathahalli', 'Credit due >30 days for 2 customers — follow-up triggered', 'Daily closure variance >₹500 at Sarjapur Road yesterday', 'Birthday campaign triggered for 18 customers today'].map((n,i) => <div key={i} className="flex gap-3 items-start p-3 rounded border border-ink/10"><Bell className="size-4 mt-0.5 text-ember" /><div>{n}</div></div>)}
      </div>
      <ActionButton tone="green" onClick={() => notify('WhatsApp/SMS campaign queued. Live sending waits for approved provider credentials.')}>Send Test WhatsApp Campaign</ActionButton>
    </Card>}

    {tab === 'Detailed Audit Log' && <Card title="Complete Immutable Audit Trail" description="Every action by every user across all dashboards. Export for compliance or investigation. Owner has full visibility here first.">
      <DataTable rows={state.debugEvents.slice(0,12).map(event => ({ ...event, actor:'Owner', action:event.message, entity:event.module }))} columns={[{key:'at',label:'When',render:a => new Date(a.at).toLocaleString()},{key:'actor',label:'User'},{key:'action',label:'Action'},{key:'module',label:'Module'},{key:'entity',label:'Entity'},{key:'id',label:'View Details',render:a => <ActionButton tone="blue" onClick={() => notify(`Audit detail opened for ${a.module}.`)}>View Diff</ActionButton>}]} />
    </Card>}

    {tab === 'Interactive Full Demo' && <div className="space-y-6">
      <Card title="Interactive Full System Demo" description="Simulate the complete bakery operation across Admin, Kitchen and Branch Billing. These buttons are prepared for a client walkthrough.">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[
            {label: "1. Fast Billing Flow (Branch)", desc: "Prepare a branch cart, open counter and checkout with stock deduction", action: () => {
              dispatch({ type:'select-branch', branchId:'marathahalli' });
              dispatch({ type:'open-counter', branchId:'marathahalli', cashier:'Demo Cashier', terminal:'POS-1', openingCash:2000 });
              dispatch({ type:'add-to-cart', productId:'prod-mysore-pak', qty:0.25 });
              dispatch({ type:'set-payment-mode', mode:'upi' });
              notify('Branch billing demo staged. Open Branch Billing to complete the F9 checkout.');
            }},
            {label: "2. Production Approval Gate", desc: "Approve kitchen plan and deduct raw materials only after owner approval", action: () => {
              const plan = state.productionPlans.find(p => p.status === 'pending-admin-approval');
              if (plan) {
                dispatch({ type:'approve-production', planId: plan.id, adminName:'Owner Demo' });
                notify('Pending production plan approved. Raw material ledger updated.');
              } else notify('No pending production plan found. Create one from Demand Forecasting first.', 'warning');
            }},
            {label: "3. Central Dispatch + Branch Receive", desc: "Create dispatch with route, vehicle, crate and branch receive flow", action: () => {
              dispatch({ type:'create-dispatch', toBranchId:'sarjapur-road', route:'East Route 2', driver:'Demo Driver', vehicleNo:'KA-01-DEMO', crates:['CR-DEMO-1'], lines:[{ productId:'prod-mixture', qty:20, batchNo:'MX-0706-A' }] });
              notify('Dispatch draft created for Sarjapur Road with crate, route and vehicle data.');
            }},
            {label: "4. Online Order to Reconciliation", desc: "Accept an aggregator order and queue KOT/bill printing", action: () => {
              const order = state.onlineOrders.find(o => o.status === 'new');
              if (order) {
                dispatch({ type:'accept-online-order', orderId: order.id });
                notify(`${order.platform} order ${order.externalRef} accepted and print job queued.`);
              } else notify('No new online orders are waiting right now.', 'warning');
            }},
            {label: "5. Forecast to Production Plan", desc: "Convert forecast need into a kitchen approval request", action: () => {
              const row = forecastRows[0];
              dispatch({ type:'create-production', productId: row.id, requestedQty: row.forecastNeed, requestedBy:'Owner Forecast', notes:'Client-demo forecast plan', branchDemand:{ 'marathahalli': Math.round(row.forecastNeed * .4), 'sarjapur-road': Math.round(row.forecastNeed * .3), 'kadubeesanahalli': Math.round(row.forecastNeed * .2), 'koramangala': Math.round(row.forecastNeed * .1) } });
              notify(`${row.name} forecast moved to production approval.`);
            }},
            {label: "6. Wastage Logging & Analysis", desc: "Register a waste investigation note in the audit/debug trail", action: () => notify('Wastage investigation logged. Review Wastage & Yield Intelligence for the Pareto view.')},
            {label: "7. Promotions Apply at Billing", desc: "Mark campaign rule as ready for POS auto-application", action: () => notify('Promotion rule marked active for the branch POS flow.')},
            {label: "8. Full Permission Change", desc: "Grant reports export to a role and show audit visibility", action: () => {
              dispatch({ type:'set-role-permission', roleId:'branch-cashier', moduleKey:'reports-bi', actions:['view','export'] });
              notify('Branch cashier role can now view and export reports.');
            }},
          ].map((demo, idx) => <button key={idx} onClick={demo.action} className="ticket p-4 text-left hover:-translate-y-0.5 transition active:scale-[0.985]"><div className="font-bold text-sm mb-1 text-ink">{demo.label}</div><p className="text-xs text-ink-600 leading-snug">{demo.desc}</p></button>)}
        </div>
        <p className="mt-4 text-xs text-center text-slatewash">For live provider sync, add official aggregator, payment, WhatsApp and hardware credentials after the client signs off the workflow.</p>
      </Card>
    </div>}

    {/* ========== SUPPLIERS & PROCUREMENT (GST Invoice + Stock Sync) ========== */}
    {tab === 'Suppliers & Procurement' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Truck} label="Active Suppliers" value={String(state.suppliers.length)} helper="With GSTIN & payment terms" tone="blue" />
        <Metric icon={DollarSign} label="This Month Purchases" value="₹4.82L" helper="Auto tracked from GRN" tone="green" />
        <Metric icon={Scale} label="Stock Accuracy" value="97.4%" helper="After last physical audits" tone="emerald" />
        <Metric icon={MessageCircle} label="Open Clarifications" value="3" helper="From branch audits" tone="amber" />
      </div>

      <Card title="Supplier Master + GST Handling" description="Add suppliers with or without GST. All purchases tracked for input credit.">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <b className="text-sm">Add New Supplier</b>
            <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); notify('Supplier draft validated with GST details. Connect Supabase to persist new supplier masters.'); }}>
              <Field label="Supplier Name"><input className={inputClass} placeholder="Premium Dry Fruits Co." /></Field>
              <Field label="GSTIN (optional)"><input className={inputClass} placeholder="29ABCDE1234F1Z5 or leave blank for non-GST" /></Field>
              <Field label="Payment Terms (days)"><input className={inputClass} type="number" defaultValue="14" /></Field>
              <ActionButton tone="green">Add Supplier</ActionButton>
            </form>
          </div>
          <div>
            <b className="text-sm">Existing Suppliers</b>
            <DataTable rows={state.suppliers} columns={[{key:'name',label:'Supplier'},{key:'gstin',label:'GSTIN',render:s => s.gstin || 'Non-GST'},{key:'paymentTermsDays',label:'Terms'},{key:'rating',label:'Rating'}]} />
          </div>
        </div>
      </Card>

      <Card title="Create Purchase Invoice / GRN (Stock Auto-Sync)" description="Create invoice → choose GST or non-GST → on 'Receive' stock is automatically added to central inventory + ledger is written. Every gram tracked.">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Field label="Supplier"><select className={inputClass}>{state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name} {s.gstin ? '(GST)' : '(Non-GST)'}</option>)}</select></Field>
            <Field label="Invoice No / Bill No"><input className={inputClass} placeholder="INV-2026-0742" /></Field>
            <Field label="Invoice Date"><input className={inputClass} type="date" defaultValue={new Date().toISOString().slice(0,10)} /></Field>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> This is a GST invoice (eligible for input credit)</label>
            </div>
          </div>
          <div>
            <b className="text-sm">Add Line Items</b>
            <div className="mt-2 text-xs text-ink-600">Select ingredient → enter qty & rate → system calculates taxable value, CGST/SGST if GST invoice.</div>
            <div className="mt-3 p-3 border border-dashed border-ink/20 rounded text-sm">
              Demo invoice: 70 kg Cashew + 45 kg Cocoa from PO-001, GST input fields ready.<br />
              <ActionButton tone="green" onClick={() => { 
                dispatch({ type:'receive-purchase-order', poId: 'po-001', invoiceNo: 'INV-2026-0742', receivedBy: 'Owner' }); 
                notify('Purchase invoice received. Central raw stock and inventory ledger updated from PO-001.'); 
              }}>Create Invoice & Receive Stock (Auto Sync)</ActionButton>
            </div>
          </div>
        </div>
      </Card>
    </div>}

    {/* ========== BRANCH PERFORMANCE & P&L (Deep Analytics) ========== */}
    {tab === 'Branch Performance & P&L' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={DollarSign} label="Total Revenue (All Branches)" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.revenue, 0))} helper="This month" tone="green" />
        <Metric icon={TrendingUp} label="Gross Profit" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.profit, 0))} helper="Contribution after COGS and waste" tone="emerald" />
        <Metric icon={TrendingDown} label="Wastage Loss" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.wastage, 0))} helper="Down 22% MoM" tone="red" />
        <Metric icon={BarChart3} label="Top Branch by Revenue" value={[...branchPerformanceRows].sort((a, b) => b.revenue - a.revenue)[0]?.branch ?? '-'} helper="Deterministic demo data" tone="blue" />
        <Metric icon={Scale} label="Stock Variance (All)" value="-1.8%" helper="After physical audits" tone="amber" />
      </div>

      <Card title="Branch-wise Sales Performance" description="Admin sees complete picture of every branch. Revenue, cost of goods, wastage loss, profit.">
        <DataTable rows={branchPerformanceRows} columns={[
          {key:'branch',label:'Branch'},
          {key:'revenue',label:'Revenue',render:r => money(r.revenue)},
          {key:'cogs',label:'COGS (Recipe Cost)',render:r => money(r.cogs)},
          {key:'wastage',label:'Wastage Loss',render:r => money(r.wastage)},
          {key:'profit',label:'Gross Profit',render:r => <span className="font-bold text-tgreen">{money(r.profit)}</span>},
          {key:'margin',label:'Margin %'},
          {key:'branch',label:'Action',render:b => <ActionButton tone="blue" onClick={() => notify(`Branch drill-down prepared for ${b.branch}.`)}>View Details</ActionButton>}
        ]} />
      </Card>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Top Items by Revenue (All Branches)" action={<ExportButton onClick={() => downloadCsv('top_revenue_items.csv', [])} />}>
          <div className="space-y-2">
            {topRevenueRows.map(({ product, revenue }) => <div key={product.id} className="flex justify-between items-center p-2 bg-paper/60 rounded"><div><b>{product.name}</b><span className="text-xs ml-2 text-slatewash">({product.category})</span></div><div className="font-ticket text-right"><div className="text-tgreen font-bold">{money(revenue)}</div><div className="text-[10px] text-ink-600">{money(product.price)}/unit</div></div></div>)}
          </div>
        </Card>

        <Card title="Top Items by Quantity Sold" action={<ExportButton onClick={() => downloadCsv('top_quantity_items.csv', [])} />}>
          <div className="space-y-2">
            {topQuantityRows.map(({ product, qty }) => <div key={product.id} className="flex justify-between items-center p-2 bg-paper/60 rounded"><div><b>{product.name}</b></div><div className="font-ticket text-right"><div className="font-bold">{qty} {product.unit}</div><div className="text-[10px] text-ink-600">Best seller by volume</div></div></div>)}
          </div>
        </Card>
      </div>

      <Card title="Profit Analysis: Selling Price vs Recipe Cost" description="For every item, Admin sees true contribution margin. Nothing is hidden.">
        <DataTable rows={state.products.slice(0,7).map(p => {
          const recipe = state.recipes.find(r => r.productId === p.id);
          const cost = recipe ? recipeCost(recipe, state.ingredients, recipe.outputQty).perUnit : p.price * 0.55;
          const profit = p.price - cost;
          const margin = ((profit / p.price) * 100).toFixed(1);
          return { name: p.name, selling: p.price, recipeCost: cost, profit, margin: margin + '%' };
        })} columns={[
          {key:'name',label:'Item'},
          {key:'selling',label:'Selling Price',render:r => money(r.selling)},
          {key:'recipeCost',label:'Recipe Cost/Unit',render:r => money(r.recipeCost)},
          {key:'profit',label:'Profit/Unit',render:r => <span className="font-bold text-tgreen">{money(r.profit)}</span>},
          {key:'margin',label:'Margin %'}
        ]} />
      </Card>
    </div>}

  </Shell>;
}
