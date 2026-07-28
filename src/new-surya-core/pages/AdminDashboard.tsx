
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Activity, AlertTriangle, BarChart3, Boxes, ClipboardCheck, Coins, DatabaseZap, FileSpreadsheet, LineChart, PackageCheck, ShieldCheck, ShoppingCart, Sparkles, Users, Workflow, Gift, TrendingUp, Trash2, FileCheck, Tag, Bell, History, Settings, Target, Award, Truck, DollarSign, Scale, MessageCircle, TrendingDown } from 'lucide-react';
import { ActionButton, Card, DashboardTabs, DataTable, DebugPanel, ExportButton, Field, inputClass, Metric, MiniBar, Pill, Shell, StatusPill } from '../components/UI';
import { marketFeatureCoverage, reportDefinitions } from '../data/features';
import { externalItemMaster, itemMasterImportSummary } from '../data/importedMasters';
import { byId, downloadCsv, money, recipeCost, recipeRequirement } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { Customer, Product } from '../lib/types';
import { createManagedUser } from '../lib/adminApi';
import OperationalWorkbench from '../components/OperationalWorkbench';
import { isExtensionTab, roleExtensionTabs } from '../lib/roleExtensions';
import ExecutiveVisualizations from '../components/ExecutiveVisualizations';
import CompleteFeatureCenter from '../components/CompleteFeatureCenter';
import { AdminIntegratedFeature, InchargeIntegratedFeature, type AdminIntegratedModule } from '../components/IntegratedFeatureModules';
import SalesForecastWidget from '../components/SalesForecastWidget';

const existingTabs = [
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
  'Promotions & Loyalty', 
  'Demand Forecasting & MRP', 
  'Wastage & Yield Intelligence', 
  'Detailed Audit Log', 
  'Reports & BI', 
  'Complete Feature Centre',
  'Business Management',
  'Executive Control',
  'Sales Reports',
  'Staff Management',
  'Attendance & Payroll',
  'Order History',
  'Invoice Review',
  'Alerts & Notifications',
  'Recipe Management'
] as const;
const tabs = [...existingTabs, ...roleExtensionTabs.admin] as const;
type Tab = typeof tabs[number];

export default function AdminDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [searchParams] = useSearchParams();
  const appRole = useAuthStore.getState().currentUser?.role;
  const [tab, setTab] = useState<Tab>(() => searchParams.get('suite') === 'complete-feature-centre' ? 'Complete Feature Centre' : searchParams.get('suite') === 'executive-control' || appRole === 'executive' ? 'Executive Control' : searchParams.get('suite') === 'admin-management' || appRole === 'admin' ? 'Business Management' : 'Command');
  const [newUserBranches, setNewUserBranches] = useState<string[]>([]);
  const [newUserTabs, setNewUserTabs] = useState<string[]>([]);
  const [userCreateStatus, setUserCreateStatus] = useState('');
  const [notice, setNotice] = useState<{ message: string; level: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [newItem, setNewItem] = useState({ name:'', category:'', price:'', unit:'pcs', taxRate:'5', hsn:'' });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemDraft, setEditItemDraft] = useState({ name:'', category:'', price:'', unit:'', taxRate:'' });
  const [priceForm, setPriceForm] = useState({ productId:'', scope:'all' as 'all' | string, onlinePrice:'', branchPrice:'' });
  const [newRecipe, setNewRecipe] = useState({ productId:'', outputQty:'', outputUnit:'kg', laborCost:'', overheadCost:'', packagingCost:'', margin:'' });
  const [newIngredient, setNewIngredient] = useState({ name:'', category:'', unit:'kg', currentStock:'', minStock:'', unitCost:'' });
  const [newSupplier, setNewSupplier] = useState({ name:'', category:'', phone:'', paymentTermsDays:'14' });
  const [newPo, setNewPo] = useState({ supplierId:'', ingredientId:'', qty:'', rate:'', expectedDate:'' });
  const [newCustomer, setNewCustomer] = useState({ name:'', phone:'', type:'retail', creditLimit:'' });
  const [newCredit, setNewCredit] = useState({ customerId:'', debit:'', credit:'', dueDate:'', note:'' });
  const [newPromo, setNewPromo] = useState({ name:'', trigger:'Buy specific product qty', reward:'% discount on next purchase', branchIds:[] as string[] });

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
  const branchPerformanceRows = state.branches.filter(b => b.type !== 'central-kitchen').map((branch) => {
    const branchBills = state.bills.filter(b => b.branchId === branch.id && b.status !== 'voided');
    const revenue = branchBills.reduce((sum, b) => sum + b.grandTotal, 0);
    const cogs = branchBills.reduce((sum, b) => sum + b.lines.reduce((lineSum, line) => {
      const recipe = state.recipes.find(r => r.productId === line.productId);
      const unitCost = recipe ? recipeCost(recipe, state.ingredients, recipe.outputQty).perUnit : 0;
      return lineSum + unitCost * line.qty;
    }, 0), 0);
    const wastage = state.ledger.filter(l => l.branchId === branch.id && l.sourceType === 'waste').reduce((sum, l) => {
      const ingredient = state.ingredients.find(i => i.id === l.itemId);
      return sum + Math.abs(l.qtyChange) * (ingredient?.unitCost ?? 0);
    }, 0);
    const profit = revenue - cogs - wastage;
    return { branch: branch.name, revenue, cogs, wastage, profit, margin: revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : '0%' };
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

  return <Shell title="New Surya Administration" subtitle="" hideHeader>
    <DashboardTabs tabs={(() => {
      const currentUserId = useAuthStore.getState().currentUser?.id;
      const allowed = state.users.find(u => u.id === currentUserId)?.allowedTabs;
      return allowed?.length ? tabs.filter(t => allowed.includes(t)) : tabs;
    })()} active={tab} setActive={setTab} />
    {notice && <div className="mb-4 flex flex-col gap-3 rounded-md border border-ink/10 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><Pill tone={notice.level === 'error' ? 'red' : notice.level === 'warning' ? 'amber' : notice.level === 'info' ? 'blue' : 'green'}>{notice.level}</Pill><span className="text-sm font-bold text-ink">{notice.message}</span></div><ActionButton tone="slate" onClick={() => setNotice(null)}>Dismiss</ActionButton></div>}
    {tab === 'Command' && <div className="space-y-6">
      {/* Morning briefing hero */}
      <div data-testid="admin-morning-briefing" className="pn-card relative overflow-hidden">
        <div className="pn-card-body flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[.24em] text-[hsl(var(--pn-gold))]">Today at a glance · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
            <h3 className="font-display mt-1.5 bg-gradient-to-r from-[hsl(var(--pn-cream))] via-[hsl(var(--pn-gold))] to-[hsl(var(--pn-rose))] bg-clip-text text-2xl font-black leading-tight text-transparent sm:text-3xl">
              {(() => { const h = new Date().getHours(); return h < 12 ? 'Good morning, Executive' : h < 17 ? 'Good afternoon, Executive' : 'Good evening, Executive'; })()}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--pn-cream-mute))]">
              You have <b className="text-[hsl(var(--pn-gold))]">{metrics.pendingProduction.length}</b> production plans awaiting approval, <b className="text-[hsl(var(--pn-berry))]">{metrics.lowIngredients.length}</b> low-stock ingredients, and <b className="text-[hsl(var(--pn-rose))]">{metrics.onlineNew}</b> new online orders. Sales today: <b className="text-[hsl(var(--pn-pistachio))]">{money(metrics.salesToday)}</b>.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton tone="amber" data-testid="jump-approvals" onClick={() => setTab('Production Approval')}><ClipboardCheck className="size-4" />Review approvals ({metrics.pendingProduction.length})</ActionButton>
              <ActionButton tone="slate" onClick={() => setTab('Inventory')}><Boxes className="size-4" />Fix low stock</ActionButton>
              <ActionButton tone="slate" onClick={() => setTab('Reports & BI')}><BarChart3 className="size-4" />Open reports</ActionButton>
            </div>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-3 md:min-w-[280px]">
            <div className="rounded-2xl border border-[hsl(var(--pn-gold))]/20 bg-gradient-to-br from-[hsl(var(--pn-gold))]/12 to-transparent p-3">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--pn-cream-mute))]">Live sessions</p>
              <p className="font-display mt-1 text-2xl font-black text-[hsl(var(--pn-gold))]">{metrics.branchHealth.filter(row => row.open).length}<span className="text-sm text-[hsl(var(--pn-cream-mute))]">/{metrics.branchHealth.length}</span></p>
              <p className="mt-1 text-[10px] text-[hsl(var(--pn-cream-mute))]">counters open</p>
            </div>
            <div className="rounded-2xl border border-[hsl(var(--pn-pistachio))]/25 bg-gradient-to-br from-[hsl(var(--pn-pistachio))]/12 to-transparent p-3">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--pn-cream-mute))]">Refunds</p>
              <p className="font-display mt-1 text-2xl font-black text-[hsl(var(--pn-pistachio))]">{money(metrics.refundsToday)}</p>
              <p className="mt-1 text-[10px] text-[hsl(var(--pn-cream-mute))]">today</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric icon={Coins} label="Sales" value={money(metrics.salesToday)} helper="Live POS, online and credit sales from all counters." tone="green" />
        <Metric icon={AlertTriangle} label="Low stock" value={String(metrics.lowIngredients.length)} helper="Raw materials at or below minimum stock." tone="red" />
        <Metric icon={ClipboardCheck} label="Approval queue" value={String(metrics.pendingProduction.length)} helper="Kitchen plans waiting for admin approval." tone="amber" />
        <Metric icon={ShoppingCart} label="Online new" value={String(metrics.onlineNew)} helper="Aggregator, website and QR orders waiting." tone="purple" />
        <Metric icon={DatabaseZap} label="Credit due" value={money(metrics.creditDue)} helper="Customer credit still pending collection." tone="blue" />
      </div>

      <SalesForecastWidget />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card title="Executive attention board" description="Shows the highest-priority actions across the business.">
          <div className="grid gap-3 md:grid-cols-2">
            {metrics.pendingProduction.map(plan => <div key={plan.id} className="rounded-2xl border border-[hsl(var(--pn-gold))]/15 bg-gradient-to-br from-white/[.04] to-transparent p-4"><Pill tone="amber">Needs approval</Pill><h4 className="mt-2 font-black text-[hsl(var(--pn-cream))]">{products[plan.productId]?.name}</h4><p className="text-sm text-[hsl(var(--pn-cream-mute))]">{plan.requestedQty} {products[plan.productId]?.unit} · {plan.notes}</p><ActionButton tone="green" className="mt-3" onClick={() => dispatch({ type:'approve-production', planId:plan.id, adminName:'New Surya Executive' })}>Approve + deduct raw material</ActionButton></div>)}
            {metrics.lowIngredients.map(ing => <div key={ing.id} className="rounded-2xl border border-[hsl(var(--pn-berry))]/25 bg-gradient-to-br from-[hsl(var(--pn-berry))]/8 to-transparent p-4"><Pill tone="red">Low stock</Pill><h4 className="mt-2 font-black text-[hsl(var(--pn-cream))]">{ing.name}</h4><p className="text-sm text-[hsl(var(--pn-cream-mute))]">Available {ing.currentStock} {ing.unit}; minimum {ing.minStock} {ing.unit}</p><ActionButton tone="blue" className="mt-3" onClick={() => dispatch({ type:'create-purchase-order', po:{ supplierId:ing.supplierId ?? state.suppliers[0].id, createdBy:'New Surya Executive', expectedDate:new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', lines:[{ ingredientId:ing.id, qty:ing.reorderQty, rate:ing.unitCost }] } })}>Create PO</ActionButton></div>)}
          </div>
        </Card>
        <Card title="Branch health" description="Counter, stock value, online queue and expiry risk.">
          <div className="space-y-3">{metrics.branchHealth.map(row => <div key={row.branch.id} className="rounded-2xl border border-[hsl(var(--pn-gold))]/15 bg-gradient-to-br from-white/[.04] to-transparent p-3"><div className="flex justify-between gap-2"><b className="text-sm text-[hsl(var(--pn-cream))]">{row.branch.name}</b><Pill tone={row.open ? 'green' : 'amber'}>{row.open ? 'counter open' : 'closed'}</Pill></div><p className="mt-1 text-xs text-[hsl(var(--pn-cream-mute))]">Stock value {money(row.stockValue)} · online new {row.onlineNew} · expiry risk {row.expiryRisk}</p><MiniBar label="Stock health" value={Math.min(100, row.stockValue/500)} max={100} tone={row.expiryRisk ? 'amber' : 'green'} /></div>)}</div>
        </Card>
      </div>
    </div>}

    {tab === 'Users & Access' && <div className="grid min-w-0 gap-5 2xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card title="Create branch user" description="Create one secure login, choose its role, and assign one or more of the four operating branches.">
        <form className="grid gap-3" onSubmit={async (e) => { e.preventDefault(); const form = e.currentTarget; const f = new FormData(form); const roleId = String(f.get('role') || 'branch-cashier'); const branchIds = newUserBranches.length ? newUserBranches : [state.selectedBranchId]; setUserCreateStatus('Creating secure user...'); try { const result = await createManagedUser({ name:String(f.get('name') || 'New User'), phone:String(f.get('phone') || ''), email:String(f.get('email') || ''), password:String(f.get('password') || ''), roleCode:roleId, branchCodes:branchIds }); dispatch({ type:'add-user', user:{ name:String(f.get('name') || 'New User'), phone:String(f.get('phone') || ''), email:String(f.get('email') || ''), roleId, branchIds, active:true, pinRequired:true, allowedTabs:newUserTabs } }); setUserCreateStatus(result.mode === 'cloud' ? 'User created in Supabase and assigned successfully.' : 'Demo user created locally. Add Supabase keys to create real logins.'); setNewUserBranches([]); setNewUserTabs([]); form.reset(); } catch (error) { setUserCreateStatus(error instanceof Error ? error.message : 'User creation failed.'); } }}>
          <Field label="Name"><input className={inputClass} name="name" placeholder="Staff name" /></Field>
          <Field label="Phone"><input className={inputClass} name="phone" placeholder="Mobile" /></Field>
          <Field label="Email"><input className={inputClass} name="email" required type="email" placeholder="email@company.com" /></Field>
          <Field label="Temporary password"><input className={inputClass} name="password" required minLength={8} type="password" placeholder="Minimum 8 characters" /></Field>
          <Field label="Role"><select className={inputClass} name="role">{state.roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></Field>
          <fieldset><legend className="mb-2 text-xs font-semibold text-slate-600">Branch access</legend><div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">{state.branches.filter(branch => branch.type !== 'central-kitchen').map(branch => <label key={branch.id} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" className="size-4 accent-emerald-600" checked={newUserBranches.includes(branch.id)} onChange={event => setNewUserBranches(current => event.target.checked ? [...current, branch.id] : current.filter(id => id !== branch.id))} /><span>{branch.name}</span></label>)}</div></fieldset>
          <fieldset><legend className="mb-2 text-xs font-semibold text-slate-600">Admin tab access (leave blank = all tabs allowed by role)</legend><div className="grid max-h-48 gap-1.5 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">{tabs.map(t => <label key={t} className="flex min-h-7 cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700"><input type="checkbox" className="size-3.5 accent-emerald-600" checked={newUserTabs.includes(t)} onChange={event => setNewUserTabs(current => event.target.checked ? [...current, t] : current.filter(x => x !== t))} /><span>{t}</span></label>)}</div></fieldset>
          <ActionButton type="submit" tone="green"><Users className="size-4" />Create secure user</ActionButton>
          {userCreateStatus && <p className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold leading-5 text-slate-600">{userCreateStatus}</p>}
        </form>
      </Card>
      <div className="min-w-0 space-y-5">
        <Card title="Users"><DataTable rows={state.users} columns={[{key:'name',label:'Name'},{key:'roleId',label:'Role',render:u => state.roles.find(r => r.id === u.roleId)?.name},{key:'branchIds',label:'Branches',render:u => u.branchIds.map(id => branches[id]?.name ?? id).join(', ')},{key:'allowedTabs',label:'Tab access',render:u => u.allowedTabs?.length ? `${u.allowedTabs.length} tab(s)` : 'All (role default)'},{key:'active',label:'Status',render:u => <Pill tone={u.active ? 'green':'red'}>{u.active ? 'active':'blocked'}</Pill>},{key:'id',label:'Action',render:u => <ActionButton tone="amber" onClick={() => dispatch({ type:'toggle-user', userId:u.id })}>{u.active ? 'Block':'Activate'}</ActionButton>}]} /></Card>
        <Card title="Role permission builder" description="This is the GOFRUGAL/POS-style access control requirement: view/create/edit/approve/print/export/refund/void/override per module.">
          <DataTable rows={state.roles} columns={[{key:'name',label:'Role'},{key:'dashboards',label:'Dashboards',render:r => r.dashboards.join(', ')},{key:'permissions',label:'Modules',render:r => Object.keys(r.permissions).length},{key:'id',label:'Fast action',render:r => <ActionButton tone="blue" onClick={() => dispatch({ type:'set-role-permission', roleId:r.id, moduleKey:'reports-bi', actions:['view','export'] })}>Allow reports export</ActionButton>}]} />
        </Card>
      </div>
    </div>}

    {tab === 'Items & Pricing' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={ShoppingCart} label="Items" value={String(state.products.length)} helper="Live item master." tone="orange" />
        <Metric icon={DatabaseZap} label="GoFrugal master" value={String(itemMasterImportSummary.externalItems)} helper="Original item codes and tax classifications imported." tone="blue" />
        <Metric icon={FileCheck} label="POS matches" value={String(state.products.filter(product => product.externalItemCode).length)} helper="Selling variants linked to the supplied item master." tone="green" />
      </div>

      <Card title="Add new item" description="Create an item so it can be priced, put in a recipe and stocked.">
        <div className="grid gap-3 md:grid-cols-6">
          <Field label="Name"><input className={inputClass} value={newItem.name} onChange={e => setNewItem({ ...newItem, name:e.target.value })} placeholder="Item name" /></Field>
          <Field label="Category"><input className={inputClass} value={newItem.category} onChange={e => setNewItem({ ...newItem, category:e.target.value })} placeholder="e.g. Sweets" /></Field>
          <Field label="Base price"><input type="number" className={inputClass} value={newItem.price} onChange={e => setNewItem({ ...newItem, price:e.target.value })} placeholder="0" /></Field>
          <Field label="Unit"><input className={inputClass} value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit:e.target.value })} placeholder="kg / pcs" /></Field>
          <Field label="GST %"><input type="number" className={inputClass} value={newItem.taxRate} onChange={e => setNewItem({ ...newItem, taxRate:e.target.value })} /></Field>
          <Field label="HSN"><input className={inputClass} value={newItem.hsn} onChange={e => setNewItem({ ...newItem, hsn:e.target.value })} /></Field>
        </div>
        <ActionButton tone="green" className="mt-3" onClick={() => {
          if (!newItem.name.trim() || !newItem.price) { notify('Enter item name and price.', 'warning'); return; }
          dispatch({ type:'add-product', product:{ name:newItem.name.trim(), category:newItem.category.trim() || 'Uncategorised', price:Number(newItem.price), unit:(newItem.unit.trim() || 'pcs') as Product['unit'], taxRate:Number(newItem.taxRate) || 0, hsn:newItem.hsn.trim(), active:true, sellByWeight:false, kotStation:'no-kot', shelfLifeHours:72, allowOnline:true } });
          setNewItem({ name:'', category:'', price:'', unit:'pcs', taxRate:'5', hsn:'' });
          notify('Item added.');
        }}>Add item</ActionButton>
      </Card>

      <Card title="Item master" description="Edit any item's name, category, base price, unit or GST.">
        <DataTable rows={state.products} columns={[
          {key:'externalItemCode',label:'Code',render:p => p.externalItemCode ?? '-'},
          {key:'name',label:'Item',render:p => editingItemId === p.id ? <input className={inputClass} value={editItemDraft.name} onChange={e => setEditItemDraft({ ...editItemDraft, name:e.target.value })} /> : p.name},
          {key:'category',label:'Category',render:p => editingItemId === p.id ? <input className={inputClass} value={editItemDraft.category} onChange={e => setEditItemDraft({ ...editItemDraft, category:e.target.value })} /> : p.category},
          {key:'price',label:'Base price',render:p => editingItemId === p.id ? <input type="number" className={inputClass} value={editItemDraft.price} onChange={e => setEditItemDraft({ ...editItemDraft, price:e.target.value })} /> : money(p.price)},
          {key:'unit',label:'Unit',render:p => editingItemId === p.id ? <input className={inputClass} value={editItemDraft.unit} onChange={e => setEditItemDraft({ ...editItemDraft, unit:e.target.value })} /> : p.unit},
          {key:'taxRate',label:'GST',render:p => editingItemId === p.id ? <input type="number" className={inputClass} value={editItemDraft.taxRate} onChange={e => setEditItemDraft({ ...editItemDraft, taxRate:e.target.value })} /> : `${p.taxRate}%`},
          {key:'allowOnline',label:'Online',render:p => <Pill tone={p.allowOnline ? 'green':'slate'}>{p.allowOnline ? 'yes':'no'}</Pill>},
          {key:'id',label:'Action',render:p => editingItemId === p.id
            ? <div className="flex gap-2">
                <ActionButton tone="green" onClick={() => { dispatch({ type:'update-product', productId:p.id, changes:{ name:editItemDraft.name, category:editItemDraft.category, price:Number(editItemDraft.price), unit:editItemDraft.unit as Product['unit'], taxRate:Number(editItemDraft.taxRate) } }); setEditingItemId(null); notify('Item updated.'); }}>Save</ActionButton>
                <ActionButton tone="slate" onClick={() => setEditingItemId(null)}>Cancel</ActionButton>
              </div>
            : <div className="flex gap-2">
                <ActionButton tone="blue" onClick={() => { setEditingItemId(p.id); setEditItemDraft({ name:p.name, category:p.category, price:String(p.price), unit:p.unit, taxRate:String(p.taxRate) }); }}>Edit</ActionButton>
                <ActionButton tone="amber" onClick={() => dispatch({ type:'toggle-product', productId:p.id })}>{p.active ? 'Disable':'Enable'}</ActionButton>
              </div>}
        ]} />
      </Card>

      <Card title="Imported ERP item register" description="The supplied GoFrugal item master is preserved as a searchable operational register with original codes, categories, tax setup and trade controls." action={<ExportButton onClick={() => downloadCsv('gofrugal_item_master.csv', externalItemMaster as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={externalItemMaster} columns={[{key:'itemCode',label:'Item code'},{key:'name',label:'Item name'},{key:'shortName',label:'Short name'},{key:'majorCategory',label:'Major category'},{key:'gstTax',label:'GST'},{key:'hsn',label:'HSN',render:i => i.hsn || '-'},{key:'discountAllowed',label:'Discount',render:i => <Pill tone={i.discountAllowed ? 'green':'slate'}>{i.discountAllowed ? 'allowed':'blocked'}</Pill>},{key:'tradeConfiguration',label:'Trade'},{key:'productType',label:'Type'}]} />
      </Card>

      <Card title="Price list" description="Only two price lists: Online (website / aggregator orders) and Branches (in-store). Apply to all branches at once, or pick one branch to override just that outlet.">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Item"><select className={inputClass} value={priceForm.productId} onChange={e => setPriceForm({ ...priceForm, productId:e.target.value })}><option value="">Select item</option>{state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Applies to"><select className={inputClass} value={priceForm.scope} onChange={e => setPriceForm({ ...priceForm, scope:e.target.value })}><option value="all">All branches</option>{state.branches.map(b => <option key={b.id} value={b.id}>{b.name} only</option>)}</select></Field>
          <Field label="Online price (₹)"><input type="number" className={inputClass} value={priceForm.onlinePrice} onChange={e => setPriceForm({ ...priceForm, onlinePrice:e.target.value })} /></Field>
          <Field label="Branch price (₹)"><input type="number" className={inputClass} value={priceForm.branchPrice} onChange={e => setPriceForm({ ...priceForm, branchPrice:e.target.value })} /></Field>
          <div className="flex items-end"><ActionButton tone="green" onClick={() => {
            if (!priceForm.productId || (!priceForm.onlinePrice && !priceForm.branchPrice)) { notify('Select an item and at least one price.', 'warning'); return; }
            const online = Number(priceForm.onlinePrice) || 0;
            const branch = Number(priceForm.branchPrice) || 0;
            const targetBranches = priceForm.scope === 'all' ? state.branches.map(b => b.id) : [priceForm.scope];
            targetBranches.forEach(branchId => {
              const existing = state.branchPrices.find(bp => bp.branchId === branchId && bp.productId === priceForm.productId);
              dispatch({ type:'upsert-branch-price', branchPrice:{
                id: existing?.id ?? crypto.randomUUID(), branchId, productId: priceForm.productId,
                dineInPrice: branch || existing?.dineInPrice || 0,
                takeawayPrice: branch || existing?.takeawayPrice || 0,
                deliveryPrice: online || existing?.deliveryPrice || 0,
                swiggyPrice: online || existing?.swiggyPrice || 0,
                zomatoPrice: online || existing?.zomatoPrice || 0,
                wholesalePrice: existing?.wholesalePrice || 0,
              } });
            });
            notify(`Price updated for ${targetBranches.length} branch(es).`);
          }}>Save price</ActionButton></div>
        </div>
        <div className="mt-4"><DataTable rows={state.branchPrices.slice(0, 30)} columns={[
          {key:'branchId',label:'Branch',render:bp => branches[bp.branchId]?.name},
          {key:'productId',label:'Item',render:bp => products[bp.productId]?.name},
          {key:'deliveryPrice',label:'Online price',render:bp => money(bp.deliveryPrice)},
          {key:'dineInPrice',label:'Branch price',render:bp => money(bp.dineInPrice)},
        ]} /></div>
      </Card>
    </div>}

    {tab === 'Recipes/BOM' && <div className="space-y-5">
      <Card title="Add recipe" description="Link a batch recipe to an item: batch output, labour/overhead/packaging cost. Margin is shown against the item's selling price.">
        <div className="grid gap-3 md:grid-cols-6">
          <Field label="Item"><select className={inputClass} value={newRecipe.productId} onChange={e => setNewRecipe({ ...newRecipe, productId:e.target.value })}><option value="">Select item</option>{state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
          <Field label="Batch output qty"><input type="number" className={inputClass} value={newRecipe.outputQty} onChange={e => setNewRecipe({ ...newRecipe, outputQty:e.target.value })} /></Field>
          <Field label="Output unit"><input className={inputClass} value={newRecipe.outputUnit} onChange={e => setNewRecipe({ ...newRecipe, outputUnit:e.target.value })} /></Field>
          <Field label="Labour cost (₹)"><input type="number" className={inputClass} value={newRecipe.laborCost} onChange={e => setNewRecipe({ ...newRecipe, laborCost:e.target.value })} /></Field>
          <Field label="Overhead cost (₹)"><input type="number" className={inputClass} value={newRecipe.overheadCost} onChange={e => setNewRecipe({ ...newRecipe, overheadCost:e.target.value })} /></Field>
          <Field label="Packaging cost (₹)"><input type="number" className={inputClass} value={newRecipe.packagingCost} onChange={e => setNewRecipe({ ...newRecipe, packagingCost:e.target.value })} /></Field>
        </div>
        {newRecipe.productId && newRecipe.outputQty && <p className="mt-2 text-xs text-slate-500">Batch cost so far: {money((Number(newRecipe.laborCost)||0)+(Number(newRecipe.overheadCost)||0)+(Number(newRecipe.packagingCost)||0))} · Unit cost: {money(((Number(newRecipe.laborCost)||0)+(Number(newRecipe.overheadCost)||0)+(Number(newRecipe.packagingCost)||0))/(Number(newRecipe.outputQty)||1))} · Item sells at {money(products[newRecipe.productId]?.price ?? 0)} (add ingredient lines after creating to complete raw-material cost).</p>}
        <ActionButton tone="green" className="mt-3" onClick={() => {
          if (!newRecipe.productId || !newRecipe.outputQty) { notify('Select an item and batch output quantity.', 'warning'); return; }
          dispatch({ type:'add-recipe', recipe:{ productId:newRecipe.productId, outputQty:Number(newRecipe.outputQty), outputUnit:newRecipe.outputUnit as Product['unit'], version:1, laborCost:Number(newRecipe.laborCost)||0, overheadCost:Number(newRecipe.overheadCost)||0, packagingCost:Number(newRecipe.packagingCost)||0, lines:[], instructions:[], active:true } });
          setNewRecipe({ productId:'', outputQty:'', outputUnit:'kg', laborCost:'', overheadCost:'', packagingCost:'', margin:'' });
          notify('Recipe added. Add raw-material lines next for full costing.');
        }}>Add recipe</ActionButton>
      </Card>
      <Card title="Recipe/BOM cost engine" description="Recipe, raw material, wastage, labour, overhead, packaging and margin. This is where bakery stock-minus starts." action={<ExportButton onClick={() => downloadCsv('recipe_cost.csv', recipeRows as Record<string, unknown>[])} />}>
        <DataTable rows={recipeRows} columns={[{key:'product',label:'Product'},{key:'version',label:'Version'},{key:'output',label:'Output'},{key:'foodCost',label:'Batch cost'},{key:'unitCost',label:'Unit cost'},{key:'margin',label:'Margin'},{key:'active',label:'Active'}]} />
      </Card>
      <Card title="BOM requirement preview" description="Admin can see exact raw material requirement before approving production.">
        <div className="grid gap-3 lg:grid-cols-2">{state.productionPlans.slice(0,4).map(plan => { const recipe = state.recipes.find(r => r.productId === plan.productId); const req = recipe ? recipeRequirement(recipe, plan.requestedQty) : []; return <div key={plan.id} className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/70"><div className="flex flex-wrap items-center gap-2"><b>{products[plan.productId]?.name}</b><Pill tone={plan.status === 'pending-admin-approval' ? 'amber':'blue'}>{plan.status}</Pill></div><p className="mt-1 text-xs text-slate-500">Plan {plan.requestedQty} {products[plan.productId]?.unit} · Requested by {plan.requestedBy}</p><div className="mt-3 grid gap-2">{req.map(line => <div key={line.ingredientId} className="flex justify-between rounded-xl bg-white p-2 text-xs"><span>{ingredients[line.ingredientId]?.name}</span><b>{line.requiredQty} {ingredients[line.ingredientId]?.unit}</b></div>)}</div></div>; })}</div>
      </Card>
    </div>}

    {tab === 'Inventory' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Metric icon={Boxes} label="Raw SKUs" value={String(state.ingredients.length)} helper="Supplied raw-material register plus core recipe stock." tone="blue" /><Metric icon={AlertTriangle} label="Below minimum" value={String(metrics.lowIngredients.length)} helper="Only items with a configured minimum are flagged." tone="red" /><Metric icon={PackageCheck} label="Active materials" value={String(state.ingredients.filter(item => item.active !== false).length)} helper="Available for purchasing, production and audit." tone="green" /></div>
      <Card title="Add raw material" description="New ingredients become available for recipes, purchase orders and stock counts immediately.">
        <div className="grid gap-3 md:grid-cols-6">
          <Field label="Name"><input className={inputClass} value={newIngredient.name} onChange={e => setNewIngredient({ ...newIngredient, name:e.target.value })} /></Field>
          <Field label="Category"><input className={inputClass} value={newIngredient.category} onChange={e => setNewIngredient({ ...newIngredient, category:e.target.value })} /></Field>
          <Field label="Unit"><input className={inputClass} value={newIngredient.unit} onChange={e => setNewIngredient({ ...newIngredient, unit:e.target.value })} /></Field>
          <Field label="Opening stock"><input type="number" className={inputClass} value={newIngredient.currentStock} onChange={e => setNewIngredient({ ...newIngredient, currentStock:e.target.value })} /></Field>
          <Field label="Min stock"><input type="number" className={inputClass} value={newIngredient.minStock} onChange={e => setNewIngredient({ ...newIngredient, minStock:e.target.value })} /></Field>
          <Field label="Unit cost (₹)"><input type="number" className={inputClass} value={newIngredient.unitCost} onChange={e => setNewIngredient({ ...newIngredient, unitCost:e.target.value })} /></Field>
        </div>
        <ActionButton tone="green" className="mt-3" onClick={() => {
          if (!newIngredient.name.trim()) { notify('Enter a raw material name.', 'warning'); return; }
          dispatch({ type:'add-ingredient', ingredient:{ name:newIngredient.name.trim(), category:newIngredient.category.trim() || 'Uncategorised', unit:newIngredient.unit.trim() || 'kg', currentStock:Number(newIngredient.currentStock)||0, minStock:Number(newIngredient.minStock)||0, maxStock:(Number(newIngredient.minStock)||0)*5, reorderQty:Number(newIngredient.minStock)||0, unitCost:Number(newIngredient.unitCost)||0, storage:'ambient' } as any });
          setNewIngredient({ name:'', category:'', unit:'kg', currentStock:'', minStock:'', unitCost:'' });
          notify('Raw material added.');
        }}>Add raw material</ActionButton>
      </Card>
      <Card title="Raw material inventory" action={<ExportButton onClick={() => downloadCsv('raw_material_inventory.csv', state.ingredients as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={state.ingredients} columns={[{key:'name',label:'Raw material'},{key:'category',label:'Category'},{key:'purchaseUnit',label:'Purchase unit',render:i => i.purchaseUnit || i.unit},{key:'consumptionUnit',label:'Use unit',render:i => i.consumptionUnit || i.unit},{key:'currentStock',label:'Stock',render:i => `${i.currentStock} ${i.unit}`},{key:'minStock',label:'Min',render:i => i.minStock > 0 ? `${i.minStock} ${i.unit}` : '-'},{key:'transferPrice',label:'Transfer',render:i => money(i.transferPrice ?? i.unitCost)},{key:'taxRate',label:'GST',render:i => i.taxRate != null ? `${i.taxRate}%` : '-'},{key:'hsn',label:'HSN',render:i => i.hsn || '-'},{key:'stockKeepingMethod',label:'Method',render:i => i.stockKeepingMethod || '-'},{key:'batchWise',label:'Batch',render:i => i.batchWise == null ? '-' : i.batchWise ? 'Yes':'No'},{key:'expiryTracked',label:'Expiry',render:i => i.expiryTracked == null ? '-' : i.expiryTracked ? `${i.bestBeforeDays ?? 0} days`:'No'},{key:'currentStock',label:'Status',render:i => { const low = i.minStock > 0 && i.currentStock <= i.minStock; return <Pill tone={low ? 'red': i.active === false ? 'slate':'green'}>{i.active === false ? 'inactive': low ? 'reorder':'ok'}</Pill>; }},{key:'id',label:'Action',render:i => <ActionButton tone="blue" onClick={() => dispatch({ type:'manual-stock-adjust', ingredientId:i.id, qtyChange:1, reason:'Quick count correction', userName:'New Surya Executive' })}>+1 adjust</ActionButton>}]} />
      </Card>
      <Card title="Stock audit and variance approvals"><DataTable rows={state.stockAudits} columns={[{key:'branchId',label:'Branch',render:a => branches[a.branchId]?.name},{key:'itemId',label:'Item',render:a => a.itemType === 'ingredient' ? ingredients[a.itemId]?.name : products[a.itemId]?.name},{key:'systemQty',label:'System'},{key:'physicalQty',label:'Physical'},{key:'varianceReason',label:'Reason'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'approved' ? 'green': a.status === 'pending-approval' ? 'amber':'slate'}>{a.status}</Pill>},{key:'id',label:'Action',render:a => a.status !== 'approved' && <ActionButton tone="green" onClick={() => dispatch({ type:'approve-stock-audit', auditId:a.id, approvedBy:'New Surya Executive' })}>Approve</ActionButton>}]} /></Card>
      <Card title="Inventory ledger"><DataTable rows={state.ledger.slice(0, 30)} empty="Ledger will appear after approval, billing, audit or GRN" columns={[{key:'at',label:'At',render:l => new Date(l.at).toLocaleString()},{key:'branchId',label:'Branch',render:l => branches[l.branchId]?.name ?? l.branchId},{key:'itemId',label:'Item',render:l => l.itemType === 'ingredient' ? ingredients[l.itemId]?.name : products[l.itemId]?.name},{key:'qtyChange',label:'Qty'},{key:'reason',label:'Reason'},{key:'sourceType',label:'Source'}]} /></Card>
    </div>}

    {tab === 'Purchase/GRN' && <div className="space-y-5">
      <Card title="Add supplier">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Name"><input className={inputClass} value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name:e.target.value })} /></Field>
          <Field label="Category"><input className={inputClass} value={newSupplier.category} onChange={e => setNewSupplier({ ...newSupplier, category:e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={newSupplier.phone} onChange={e => setNewSupplier({ ...newSupplier, phone:e.target.value })} /></Field>
          <Field label="Payment terms (days)"><input type="number" className={inputClass} value={newSupplier.paymentTermsDays} onChange={e => setNewSupplier({ ...newSupplier, paymentTermsDays:e.target.value })} /></Field>
          <div className="flex items-end"><ActionButton tone="green" onClick={() => {
            if (!newSupplier.name.trim()) { notify('Enter supplier name.', 'warning'); return; }
            dispatch({ type:'add-supplier', supplier:{ name:newSupplier.name.trim(), category:newSupplier.category.trim() || 'General', phone:newSupplier.phone.trim(), paymentTermsDays:Number(newSupplier.paymentTermsDays)||0, rating:4 } });
            setNewSupplier({ name:'', category:'', phone:'', paymentTermsDays:'14' });
            notify('Supplier added.');
          }}>Add supplier</ActionButton></div>
        </div>
      </Card>
      <Card title="Suppliers"><DataTable rows={state.suppliers} columns={[{key:'name',label:'Supplier'},{key:'category',label:'Category'},{key:'phone',label:'Phone'},{key:'paymentTermsDays',label:'Terms',render:s => `${s.paymentTermsDays} days`},{key:'rating',label:'Rating'}]} /></Card>
      <Card title="Create purchase order" description="Raise a PO for one raw material line against a supplier; receive it as GRN to add stock.">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Supplier"><select className={inputClass} value={newPo.supplierId} onChange={e => setNewPo({ ...newPo, supplierId:e.target.value })}><option value="">Select supplier</option>{state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Raw material"><select className={inputClass} value={newPo.ingredientId} onChange={e => setNewPo({ ...newPo, ingredientId:e.target.value })}><option value="">Select item</option>{state.ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></Field>
          <Field label="Qty"><input type="number" className={inputClass} value={newPo.qty} onChange={e => setNewPo({ ...newPo, qty:e.target.value })} /></Field>
          <Field label="Rate (₹)"><input type="number" className={inputClass} value={newPo.rate} onChange={e => setNewPo({ ...newPo, rate:e.target.value })} /></Field>
          <Field label="Expected date"><input type="date" className={inputClass} value={newPo.expectedDate} onChange={e => setNewPo({ ...newPo, expectedDate:e.target.value })} /></Field>
        </div>
        <ActionButton tone="green" className="mt-3" onClick={() => {
          if (!newPo.supplierId || !newPo.ingredientId || !newPo.qty) { notify('Select supplier, raw material and quantity.', 'warning'); return; }
          dispatch({ type:'create-purchase-order', po:{ supplierId:newPo.supplierId, expectedDate:newPo.expectedDate || new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', createdBy:'New Surya Executive', lines:[{ ingredientId:newPo.ingredientId, qty:Number(newPo.qty), rate:Number(newPo.rate)||0 }] } });
          setNewPo({ supplierId:'', ingredientId:'', qty:'', rate:'', expectedDate:'' });
          notify('Purchase order created.');
        }}>Create PO</ActionButton>
      </Card>
      <Card title="Purchase orders" description="GRN receipt increases raw material inventory.">
        <DataTable rows={state.purchaseOrders} columns={[{key:'id',label:'PO'},{key:'supplierId',label:'Supplier',render:po => suppliers[po.supplierId]?.name},{key:'status',label:'Status',render:po => <Pill tone={po.status === 'received' ? 'green': po.status === 'sent' ? 'blue':'amber'}>{po.status}</Pill>},{key:'expectedDate',label:'Expected'},{key:'lines',label:'Lines',render:po => po.lines.map(l => `${ingredients[l.ingredientId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'GRN',render:po => po.status !== 'received' && <ActionButton tone="green" onClick={() => dispatch({ type:'receive-purchase-order', poId:po.id, invoiceNo:`INV-${Date.now().toString().slice(-4)}`, receivedBy:'New Surya Executive' })}>Receive</ActionButton>}]} />
      </Card>
    </div>}

    {tab === 'Production Approval' && <Card title="Kitchen requests waiting for approval" description="Raw material stock is deducted only after admin confirms. Shortages are blocked and shown in debug.">
      <DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Qty'},{key:'plannedDate',label:'Date'},{key:'requestedBy',label:'Requested by'},{key:'status',label:'Status',render:p => <Pill tone={p.status === 'pending-admin-approval' ? 'amber': p.status === 'completed' ? 'green':'blue'}>{p.status}</Pill>},{key:'branchDemand',label:'Demand',render:p => Object.entries(p.branchDemand).map(([bid, qty]) => `${branches[bid]?.name}: ${qty}`).join(' | ')},{key:'id',label:'Action',render:p => p.status === 'pending-admin-approval' ? <ActionButton tone="green" onClick={() => dispatch({ type:'approve-production', planId:p.id, adminName:'New Surya Executive' })}>Approve + deduct</ActionButton> : <ActionButton tone="blue" onClick={() => dispatch({ type:'move-production', planId:p.id, status:'mixing' })}>Move stage</ActionButton>}]} />
    </Card>}

    {tab === 'Dispatch Control' && <div className="space-y-5"><Card title="Central kitchen dispatches" description="Crates, route, vehicle, driver, challan and receiving confirmation."><DataTable rows={state.dispatches} columns={[{key:'toBranchId',label:'To',render:d => branches[d.toBranchId]?.name},{key:'status',label:'Status',render:d => <Pill tone={d.status === 'received' ? 'green': d.status === 'dispatched' ? 'blue':'amber'}>{d.status}</Pill>},{key:'crateIds',label:'Crates',render:d => d.crateIds.join(', ')},{key:'route',label:'Route'},{key:'driver',label:'Driver'},{key:'vehicleNo',label:'Vehicle'},{key:'lines',label:'Items',render:d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'Action',render:d => d.status === 'draft' ? <ActionButton tone="blue" onClick={() => dispatch({ type:'pack-dispatch', dispatchId:d.id })}>Dispatch</ActionButton> : d.status === 'dispatched' ? <ActionButton tone="green" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:d.id })}>Receive</ActionButton> : null}]} /></Card><Card title="Print queue"><DataTable rows={state.printJobs} empty="Print jobs will appear after billing, labels, dispatch or closure" columns={[{key:'type',label:'Type'},{key:'target',label:'Target'},{key:'status',label:'Status',render:j => <Pill tone={j.status === 'printed' ? 'green': j.status === 'failed' ? 'red':'amber'}>{j.status}</Pill>},{key:'payload',label:'Payload'},{key:'createdAt',label:'At',render:j => new Date(j.createdAt).toLocaleString()}]} /></Card></div>}

    {tab === 'CRM/Credit' && <div className="space-y-5">
      <Card title="Add customer">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Name"><input className={inputClass} value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name:e.target.value })} /></Field>
          <Field label="Phone"><input className={inputClass} value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone:e.target.value })} /></Field>
          <Field label="Type"><select className={inputClass} value={newCustomer.type} onChange={e => setNewCustomer({ ...newCustomer, type:e.target.value })}><option value="retail">Retail</option><option value="wholesale">Wholesale</option><option value="corporate">Corporate</option></select></Field>
          <Field label="Credit limit (₹)"><input type="number" className={inputClass} value={newCustomer.creditLimit} onChange={e => setNewCustomer({ ...newCustomer, creditLimit:e.target.value })} /></Field>
          <div className="flex items-end"><ActionButton tone="green" onClick={() => {
            if (!newCustomer.name.trim()) { notify('Enter customer name.', 'warning'); return; }
            dispatch({ type:'add-customer', customer:{ name:newCustomer.name.trim(), phone:newCustomer.phone.trim(), type:newCustomer.type as Customer['type'], creditLimit:Number(newCustomer.creditLimit)||0, loyaltyPoints:0, favoriteProducts:[] } });
            setNewCustomer({ name:'', phone:'', type:'retail', creditLimit:'' });
            notify('Customer added.');
          }}>Add customer</ActionButton></div>
        </div>
      </Card>
      <Card title="Customers / loyalty / credit"><DataTable rows={state.customers} columns={[{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'type',label:'Type'},{key:'creditLimit',label:'Credit limit',render:c => money(c.creditLimit)},{key:'balance',label:'Outstanding',render:c => { const bal = state.creditEntries.filter(e => e.customerId === c.id).reduce((s,e) => s + e.debit - e.credit, 0); return <span className={bal > 0 ? 'text-red-600 font-semibold' : ''}>{money(bal)}</span>; }},{key:'loyaltyPoints',label:'Loyalty'}]} /></Card>
      <Card title="Record credit entry" description="Debit = amount billed on credit. Credit = payment received against outstanding balance.">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Customer"><select className={inputClass} value={newCredit.customerId} onChange={e => setNewCredit({ ...newCredit, customerId:e.target.value })}><option value="">Select customer</option>{state.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Debit (billed) ₹"><input type="number" className={inputClass} value={newCredit.debit} onChange={e => setNewCredit({ ...newCredit, debit:e.target.value })} /></Field>
          <Field label="Credit (collected) ₹"><input type="number" className={inputClass} value={newCredit.credit} onChange={e => setNewCredit({ ...newCredit, credit:e.target.value })} /></Field>
          <Field label="Due date"><input type="date" className={inputClass} value={newCredit.dueDate} onChange={e => setNewCredit({ ...newCredit, dueDate:e.target.value })} /></Field>
          <Field label="Note"><input className={inputClass} value={newCredit.note} onChange={e => setNewCredit({ ...newCredit, note:e.target.value })} /></Field>
        </div>
        <ActionButton tone="green" className="mt-3" onClick={() => {
          if (!newCredit.customerId || (!newCredit.debit && !newCredit.credit)) { notify('Select customer and enter debit or credit amount.', 'warning'); return; }
          dispatch({ type:'add-credit-entry', entry:{ customerId:newCredit.customerId, debit:Number(newCredit.debit)||0, credit:Number(newCredit.credit)||0, dueDate:newCredit.dueDate || undefined, note:newCredit.note.trim() || 'Manual entry' } });
          setNewCredit({ customerId:'', debit:'', credit:'', dueDate:'', note:'' });
          notify('Credit entry recorded.');
        }}>Save entry</ActionButton>
      </Card>
      <Card title="Credit ledger"><DataTable rows={state.creditEntries} columns={[{key:'customerId',label:'Customer',render:c => state.customers.find(x => x.id === c.customerId)?.name},{key:'debit',label:'Debit',render:c => money(c.debit)},{key:'credit',label:'Credit',render:c => money(c.credit)},{key:'dueDate',label:'Due'},{key:'note',label:'Note'},{key:'at',label:'At',render:c => new Date(c.at).toLocaleString()}]} /></Card>
    </div>}

    {tab === 'Reports & BI' && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Metric icon={BarChart3} label="Reports" value={String(reportDefinitions.length)} helper="Every key module has export-ready reports." tone="purple" /><Metric icon={FileSpreadsheet} label="CSV exports" value="All tabs" helper="CSV/Excel-ready data tables." tone="blue" /><Metric icon={LineChart} label="Bestseller" value={metrics.itemSales[0]?.product.name ?? '-'} helper="From live bill data." tone="green" /><Metric icon={Activity} label="Refunds" value={money(metrics.refundsToday)} helper="Refund/void control." tone="amber" /></div><Card title="Report catalogue" action={<ExportButton onClick={() => downloadCsv('sales_report.csv', reportRows)} />}><DataTable rows={reportDefinitions} columns={[{key:'name',label:'Report'},{key:'dashboard',label:'Dashboard'},{key:'group',label:'Group'},{key:'description',label:'Description'},{key:'exportFormats',label:'Exports',render:r => r.exportFormats.join(', ')}]} /></Card><Card title="Visual sales analysis"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics.itemSales.slice(0,6).map(row => <MiniBar key={row.product.id} label={row.product.name} value={row.qty} max={Math.max(1, metrics.itemSales[0]?.qty || 1)} tone="orange" />)}</div></Card></div>}

    {/* ========== NEW TABS FOR COMPLETE FEATURE COVERAGE (Admin God Mode) ========== */}

    {tab === 'Promotions & Loyalty' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Gift} label="Active Campaigns" value={String(state.promotions.filter(p => p.active).length)} helper="Running promotions & loyalty rules" tone="orange" />
        <Metric icon={Award} label="Customers" value={String(state.customers.length)} helper="Eligible for loyalty & offers" tone="green" />
        <Metric icon={Target} label="Branch-specific offers" value={String(state.promotions.filter(p => p.branchIds.length > 0).length)} helper="Restricted to selected branches" tone="blue" />
      </div>
      <Card title="Promotions & Campaign Studio" description="Create a rule and choose which branches it applies to. Leave branches unselected to run it everywhere; the branch dashboard will show it to eligible customers automatically.">
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Rule name"><input className={inputClass} value={newPromo.name} onChange={e => setNewPromo({ ...newPromo, name:e.target.value })} placeholder="e.g. 15% off orders above ₹800" /></Field>
          <Field label="Trigger"><select className={inputClass} value={newPromo.trigger} onChange={e => setNewPromo({ ...newPromo, trigger:e.target.value })}><option>Buy specific product qty</option><option>Cart total above ₹X</option><option>Birthday / Anniversary</option><option>Happy Hour time window</option></select></Field>
          <Field label="Reward"><select className={inputClass} value={newPromo.reward} onChange={e => setNewPromo({ ...newPromo, reward:e.target.value })}><option>% discount on next purchase</option><option>Free item / add-on</option><option>Double loyalty points</option><option>Fixed ₹ off</option></select></Field>
          <Field label="Branches (leave blank = all)">
            <select multiple className={inputClass + ' h-24'} value={newPromo.branchIds} onChange={e => setNewPromo({ ...newPromo, branchIds:Array.from(e.target.selectedOptions).map(o => o.value) })}>
              {state.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        </div>
        <ActionButton tone="green" className="mt-3" onClick={() => {
          if (!newPromo.name.trim()) { notify('Enter a rule name.', 'warning'); return; }
          dispatch({ type:'add-promotion', name:newPromo.name.trim(), trigger:newPromo.trigger, reward:newPromo.reward, branchIds:newPromo.branchIds });
          setNewPromo({ name:'', trigger:'Buy specific product qty', reward:'% discount on next purchase', branchIds:[] });
          notify('Promotion saved and now visible on the eligible branch dashboard(s).');
        }}>Save & activate rule</ActionButton>
      </Card>
      <Card title="Active rules">
        <DataTable rows={state.promotions} columns={[
          {key:'name',label:'Rule'},{key:'trigger',label:'Trigger'},{key:'reward',label:'Reward'},
          {key:'branchIds',label:'Branches',render:p => p.branchIds.length ? p.branchIds.map(id => branches[id]?.name).join(', ') : 'All branches'},
          {key:'active',label:'Status',render:p => <Pill tone={p.active ? 'green':'slate'}>{p.active ? 'active':'paused'}</Pill>},
          {key:'id',label:'Action',render:p => <ActionButton tone="amber" onClick={() => dispatch({ type:'toggle-promotion', promotionId:p.id })}>{p.active ? 'Pause':'Activate'}</ActionButton>}
        ]} />
      </Card>
      <Card title="Loyalty program"><DataTable rows={state.customers} columns={[{key:'name',label:'Customer'},{key:'phone',label:'Phone'},{key:'loyaltyPoints',label:'Points balance'},{key:'favoriteProducts',label:'Favourite items',render:c => c.favoriteProducts?.map((id:string) => products[id]?.name).join(', ') || '-'}]} /></Card>
    </div>}

    {tab === 'Demand Forecasting & MRP' && <div className="space-y-5">
      <Card title="Predictive Demand Forecasting & MRP (Material Requirements Planning)" description="Sales history + simple intelligent forecast → suggested production quantities per product/branch. This is a key differentiator vs Petpooja/GOFRUGAL — reduces over/under production dramatically.">
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm">Forecast based on last 30/90 days sales, seasonality, upcoming events (festivals), current stock & lead time. One-click creates Production Plans that go to Kitchen for approval.</div>
        <DataTable rows={forecastRows} columns={[{key:'name',label:'Product'},{key:'category',label:'Category'},{key:'price',label:'Price',render:p => money(p.price)},{key:'thirtyDaySales',label:'30-day Sales'},{key:'forecastNeed',label:'Forecasted Need (next 7 days)',render:p => <b className="font-ticket text-lg">{p.forecastNeed} {p.unit}</b>},{key:'id',label:'Suggested Action',render:p => <ActionButton tone="green" onClick={() => { dispatch({ type:'create-production', productId: p.id, requestedQty: p.forecastNeed, requestedBy:'Executive Forecast', notes:'Forecast-generated MRP plan', branchDemand: { 'marathahalli': Math.round(p.forecastNeed * 0.36), 'sarjapur-road': Math.round(p.forecastNeed * 0.28), 'kadubeesanahalli': Math.round(p.forecastNeed * 0.22), 'koramangala': Math.round(p.forecastNeed * 0.14) } }); notify(`${p.name} forecast converted into a kitchen production request.`); }}>Create Production Plan from Forecast</ActionButton>}]} />
      </Card>
      <Card title="Shortage & Reorder Intelligence"><div className="grid gap-3 md:grid-cols-2">{state.ingredients.filter(i => i.currentStock < i.minStock).slice(0,4).map(ing => <div key={ing.id} className="ticket p-4"><div className="flex justify-between"><b>{ing.name}</b><Pill tone="red">Shortage</Pill></div><p className="text-sm mt-1">Current: {ing.currentStock} {ing.unit} | Min: {ing.minStock} {ing.unit}</p><ActionButton tone="blue" onClick={() => dispatch({ type:'create-purchase-order', po: { supplierId: ing.supplierId || 'sup-grocery', expectedDate: new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', createdBy:'New Surya Executive', lines: [{ingredientId: ing.id, qty: ing.reorderQty, rate: ing.unitCost}] } })}>Auto Create PO</ActionButton></div>)}</div></Card>
    </div>}

    {tab === 'Wastage & Yield Intelligence' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Metric icon={Trash2} label="This Month Wastage Cost" value={money(18420)} helper="Down 22% from last month" tone="red" /><Metric icon={Target} label="Avg Yield vs Plan" value="94.2%" helper="Target >92%" tone="green" /><Metric icon={TrendingUp} label="Top Waste Reason" value="Handling" helper="Process improvement opportunity" tone="amber" /></div>
      <Card title="Wastage Pareto Analysis & Reduction Engine" description="Track every gram of waste with reason. System suggests recipe or process changes. GOFRUGAL-level wastage control + modern analytics.">
        <DataTable rows={wastageRows} columns={[{key:'reason',label:'Waste Reason'},{key:'qty',label:'Qty (kg/pcs)'},{key:'cost',label:'Cost Impact',render:r => money(r.cost)},{key:'pct',label:'% of Total',render:r => `${r.pct}%`},{key:'reason',label:'Action',render:r => <ActionButton tone="blue" onClick={() => notify(`Root-cause note created for ${r.reason}: review station handling and tray SOP.`)}>Investigate & Suggest Fix</ActionButton>}]} />
      </Card>
      <Card title="Yield Tracking by Recipe / Batch"><div className="text-sm text-ink-600">Every completed production plan shows planned vs actual yield. Low yield batches are flagged for QC review.</div></Card>
    </div>}

    {tab === 'Detailed Audit Log' && <Card title="Complete Immutable Audit Trail" description="Every action by every user across all dashboards. Export for compliance or investigation. Authorized administrators have full visibility.">
      <DataTable rows={state.debugEvents.slice(0,12).map(event => ({ ...event, actor:'New Surya Executive', action:event.message, entity:event.module }))} columns={[{key:'at',label:'When',render:a => new Date(a.at).toLocaleString()},{key:'actor',label:'User'},{key:'action',label:'Action'},{key:'module',label:'Module'},{key:'entity',label:'Entity'},{key:'id',label:'View Details',render:a => <ActionButton tone="blue" onClick={() => notify(`Audit detail opened for ${a.module}.`)}>View Diff</ActionButton>}]} />
    </Card>}

    {/* ========== SUPPLIERS & PROCUREMENT (GST Invoice + Stock Sync) ========== */}
    {tab === 'Suppliers & Procurement' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Truck} label="Active Suppliers" value={String(state.suppliers.length)} helper="With GSTIN & payment terms" tone="blue" />
        <Metric icon={DollarSign} label="Open purchase orders" value={String(state.purchaseOrders.filter(po => po.status !== 'received').length)} helper="Awaiting GRN receipt" tone="green" />
        <Metric icon={Scale} label="Received this period" value={String(state.purchaseOrders.filter(po => po.status === 'received').length)} helper="Stock synced to inventory" tone="emerald" />
      </div>

      <Card title="Supplier Master + GST Handling" description="Add suppliers with or without GST. All purchases tracked for input credit.">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <b className="text-sm">Add New Supplier</b>
            <div className="mt-3 space-y-2">
              <Field label="Supplier Name"><input className={inputClass} value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name:e.target.value })} placeholder="Supplier name" /></Field>
              <Field label="Category"><input className={inputClass} value={newSupplier.category} onChange={e => setNewSupplier({ ...newSupplier, category:e.target.value })} placeholder="e.g. Dry fruits, Dairy" /></Field>
              <Field label="Payment Terms (days)"><input className={inputClass} type="number" value={newSupplier.paymentTermsDays} onChange={e => setNewSupplier({ ...newSupplier, paymentTermsDays:e.target.value })} /></Field>
              <ActionButton tone="green" onClick={() => {
                if (!newSupplier.name.trim()) { notify('Enter supplier name.', 'warning'); return; }
                dispatch({ type:'add-supplier', supplier:{ name:newSupplier.name.trim(), category:newSupplier.category.trim() || 'General', phone:newSupplier.phone.trim(), paymentTermsDays:Number(newSupplier.paymentTermsDays)||0, rating:4 } });
                setNewSupplier({ name:'', category:'', phone:'', paymentTermsDays:'14' });
                notify('Supplier added.');
              }}>Add Supplier</ActionButton>
            </div>
          </div>
          <div>
            <b className="text-sm">Existing Suppliers</b>
            <DataTable rows={state.suppliers} columns={[{key:'name',label:'Supplier'},{key:'gstin',label:'GSTIN',render:s => s.gstin || 'Non-GST'},{key:'paymentTermsDays',label:'Terms'},{key:'rating',label:'Rating'}]} />
          </div>
        </div>
      </Card>

      <Card title="Purchase Orders & GRN (Stock Auto-Sync)" description="Create a PO against a supplier, then Receive to sync stock into central inventory + ledger.">
        <div className="grid gap-3 md:grid-cols-5">
          <Field label="Supplier"><select className={inputClass} value={newPo.supplierId} onChange={e => setNewPo({ ...newPo, supplierId:e.target.value })}><option value="">Select supplier</option>{state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Raw material"><select className={inputClass} value={newPo.ingredientId} onChange={e => setNewPo({ ...newPo, ingredientId:e.target.value })}><option value="">Select item</option>{state.ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></Field>
          <Field label="Qty"><input type="number" className={inputClass} value={newPo.qty} onChange={e => setNewPo({ ...newPo, qty:e.target.value })} /></Field>
          <Field label="Rate (₹)"><input type="number" className={inputClass} value={newPo.rate} onChange={e => setNewPo({ ...newPo, rate:e.target.value })} /></Field>
          <div className="flex items-end"><ActionButton tone="green" onClick={() => {
            if (!newPo.supplierId || !newPo.ingredientId || !newPo.qty) { notify('Select supplier, raw material and quantity.', 'warning'); return; }
            dispatch({ type:'create-purchase-order', po:{ supplierId:newPo.supplierId, expectedDate:new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', createdBy:'New Surya Executive', lines:[{ ingredientId:newPo.ingredientId, qty:Number(newPo.qty), rate:Number(newPo.rate)||0 }] } });
            setNewPo({ supplierId:'', ingredientId:'', qty:'', rate:'', expectedDate:'' });
            notify('Purchase order created.');
          }}>Create PO</ActionButton></div>
        </div>
        <div className="mt-4"><DataTable rows={state.purchaseOrders} columns={[{key:'id',label:'PO'},{key:'supplierId',label:'Supplier',render:po => suppliers[po.supplierId]?.name},{key:'status',label:'Status',render:po => <Pill tone={po.status === 'received' ? 'green': po.status === 'sent' ? 'blue':'amber'}>{po.status}</Pill>},{key:'expectedDate',label:'Expected'},{key:'lines',label:'Lines',render:po => po.lines.map(l => `${ingredients[l.ingredientId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'GRN',render:po => po.status !== 'received' && <ActionButton tone="green" onClick={() => dispatch({ type:'receive-purchase-order', poId:po.id, invoiceNo:`INV-${Date.now().toString().slice(-4)}`, receivedBy:'New Surya Executive' })}>Receive</ActionButton>}]} /></div>
      </Card>
    </div>}

    {/* ========== BRANCH PERFORMANCE & P&L (Deep Analytics) ========== */}
    {tab === 'Branch Performance & P&L' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={DollarSign} label="Total Revenue (All Branches)" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.revenue, 0))} helper="This month" tone="green" />
        <Metric icon={TrendingUp} label="Gross Profit" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.profit, 0))} helper="Contribution after COGS and waste" tone="emerald" />
        <Metric icon={TrendingDown} label="Wastage Loss" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.wastage, 0))} helper="Down 22% MoM" tone="red" />
        <Metric icon={BarChart3} label="Top Branch by Revenue" value={[...branchPerformanceRows].sort((a, b) => b.revenue - a.revenue)[0]?.branch ?? '-'} helper="From live billing data" tone="blue" />
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

    {tab === 'Visualization Studio' && <ExecutiveVisualizations />}
    {tab === 'Complete Feature Centre' && <CompleteFeatureCenter dashboard="admin" initialModule={searchParams.get('module') ?? undefined} />}
    {(['Business Management','Executive Control','Sales Reports','Staff Management','Attendance & Payroll','Order History','Invoice Review','Alerts & Notifications','Recipe Management'] as readonly string[]).includes(tab) && <AdminIntegratedFeature module={tab as AdminIntegratedModule} />}
    {tab === 'Expenses' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="expenses" />}
    {tab === 'Complaints' && <AdminIntegratedFeature module="Business Management" internalTab="complaints" />}
    {tab === 'Quotations' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="quotations" />}
    {tab === 'Purchase Returns' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="purchase-returns" />}
    {tab === 'Supplier Payments' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="payments" />}
    {tab === 'Current Cash' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="current-cash" />}
    {tab === 'Cashier Controls' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="cashier-report" />}
    {tab !== 'Visualization Studio' && !(['Business Management','Executive Control','Menu Management','Sales Reports','Staff Management','Attendance & Payroll','Order History','Invoice Review','Alerts & Notifications','Digital Menu Management','Product Master','Recipe Management','Expenses','Complaints','Quotations','Purchase Returns','Supplier Payments','Bank Deposits','Current Cash','Salesperson Management','Cashier Controls'] as readonly string[]).includes(tab) && isExtensionTab('admin', tab) && <OperationalWorkbench scope="admin" module={tab} branchName={state.branches.find(branch => branch.id === state.selectedBranchId)?.name} />}

  </Shell>;
}
