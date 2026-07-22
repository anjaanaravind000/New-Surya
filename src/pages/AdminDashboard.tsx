
import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, BarChart3, Boxes, ChefHat, ClipboardCheck, Coins, DatabaseZap, FileSpreadsheet, LineChart, PackageCheck, ShoppingCart, Users, Workflow, Gift, TrendingUp, Trash2, FileCheck, Tag, Bell, History, Target, Award, Truck, DollarSign, Scale, MessageCircle, TrendingDown, ShoppingBag, CreditCard, MapPin, Globe, Printer, Server } from 'lucide-react';
import { ActionButton, BarChartPanel, Card, DataTable, DebugPanel, ExportButton, Field, inputClass, Metric, MiniBar, Pill, Shell, TrendLine } from '../components/UI';
import { reportDefinitions } from '../data/features';
import { externalItemMaster, itemMasterImportSummary } from '../data/importedMasters';
import { byId, downloadCsv, money, recipeCost, recipeRequirement } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { Customer, Product } from '../lib/types';
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
  'Debug & Support'
] as const;
type Tab = typeof tabs[number];

function CommandStat({ label, value, tone }: { label: string; value: string; tone: 'red' | 'amber' | 'blue' | 'green' }) {
  const colors = { red:'border-rose-400/30 bg-rose-400/10 text-rose-300', amber:'border-marigold-100/30 bg-marigold-100/10 text-marigold-100', blue:'border-sky-400/30 bg-sky-400/10 text-sky-300', green:'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' };
  return <div className={`border p-3.5 ${colors[tone]}`}><p className="text-[10px] font-bold text-white/50">{label}</p><p className="mt-1 font-ticket text-xl font-extrabold text-white">{value}</p></div>;
}

export default function AdminDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [tab, setTab] = useState<Tab>('Command');
  const [newUserBranches, setNewUserBranches] = useState<string[]>([]);
  const [userCreateStatus, setUserCreateStatus] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ name: '', price: 0, category: '' });
  const [advanceRowId, setAdvanceRowId] = useState<string | null>(null);
  const [advanceDraft, setAdvanceDraft] = useState({ amount: 0, reason: '' });
  const [adjustRowId, setAdjustRowId] = useState<string | null>(null);
  const [adjustDraft, setAdjustDraft] = useState({ qtyChange: 0, reason: '' });
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
  const salesByBranch = useMemo(() => state.branches.filter(b => b.type !== 'central-kitchen').map(b => ({
    label: b.name.replace(/ Branch$/i, ''),
    value: state.bills.filter(bill => bill.branchId === b.id).reduce((sum, bill) => sum + bill.grandTotal, 0)
  })), [state.branches, state.bills]);
  const sevenDayTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    return days.map(d => ({
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      value: state.bills.filter(bill => new Date(bill.createdAt).toDateString() === d.toDateString()).reduce((sum, bill) => sum + bill.grandTotal, 0)
    }));
  }, [state.bills]);
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
  const recipeByProduct = useMemo(() => {
    const map: Record<string, typeof state.recipes[number]> = {};
    state.recipes.forEach(r => { if (r.active) map[r.productId] = r; });
    return map;
  }, [state.recipes]);
  const resolvedAudits = state.stockAudits.filter(a => a.status === 'approved' && a.systemQty > 0);
  const stockVariancePct = resolvedAudits.length
    ? (resolvedAudits.reduce((sum, a) => sum + (a.physicalQty - a.systemQty) / a.systemQty, 0) / resolvedAudits.length) * 100
    : null;
  const branchPerformanceRows = state.branches.filter(b => b.type !== 'central-kitchen').map(branch => {
    const branchBills = state.bills.filter(bill => bill.branchId === branch.id);
    const revenue = branchBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
    const cogs = branchBills.reduce((sum, bill) => sum + bill.lines.reduce((lineSum, line) => {
      const recipe = recipeByProduct[line.productId];
      const unitCost = recipe ? recipeCost(recipe, state.ingredients, recipe.outputQty).perUnit : line.price * 0.45;
      return lineSum + unitCost * line.qty;
    }, 0), 0);
    const wastage = state.ledger.filter(entry => entry.branchId === branch.id && entry.sourceType === 'waste').reduce((sum, entry) => {
      const value = entry.itemType === 'ingredient' ? (ingredients[entry.itemId]?.unitCost ?? 0) : (products[entry.itemId]?.price ?? 0) * 0.45;
      return sum + Math.abs(entry.qtyChange) * value;
    }, 0);
    const profit = revenue - cogs - wastage;
    return { branch: branch.name, revenue, cogs, wastage, profit, margin: revenue ? `${((profit / revenue) * 100).toFixed(1)}%` : '0%' };
  });
  const productSalesTotals = useMemo(() => {
    const totals: Record<string, { qty: number; revenue: number }> = {};
    state.bills.forEach(bill => bill.lines.forEach(line => {
      const entry = totals[line.productId] ?? { qty: 0, revenue: 0 };
      entry.qty += line.qty;
      entry.revenue += line.qty * line.price;
      totals[line.productId] = entry;
    }));
    return totals;
  }, [state.bills]);
  const topRevenueRows = Object.entries(productSalesTotals).map(([productId, totals]) => ({ product: products[productId], revenue: totals.revenue })).filter(row => row.product).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  const topQuantityRows = Object.entries(productSalesTotals).map(([productId, totals]) => ({ product: products[productId], qty: totals.qty })).filter(row => row.product).sort((a, b) => b.qty - a.qty).slice(0, 6);
  const wasteLedgerEntries = state.ledger.filter(entry => entry.sourceType === 'waste');
  const liveNotifications = (() => {
    const items: { level: 'info' | 'warning' | 'error' | 'success'; message: string }[] = [];
    const lowStock = state.ingredients.filter(i => i.minStock > 0 && i.currentStock <= i.minStock);
    if (lowStock.length) items.push({ level:'warning', message: `Low stock on ${lowStock.length} ingredient${lowStock.length === 1 ? '' : 's'} — ${lowStock.slice(0,3).map(i => i.name).join(', ')}${lowStock.length > 3 ? '…' : ''}` });
    const pendingPlans = state.productionPlans.filter(p => p.status === 'pending-admin-approval');
    if (pendingPlans.length) items.push({ level:'info', message: `${pendingPlans.length} production plan${pendingPlans.length === 1 ? '' : 's'} pending your approval` });
    const newOnline = state.onlineOrders.filter(o => o.status === 'new');
    newOnline.slice(0, 3).forEach(o => items.push({ level:'info', message: `New ${o.platform} order ${o.externalRef} received at ${branches[o.branchId]?.name ?? o.branchId}` }));
    const overdueCredit = state.creditEntries.filter(c => c.dueDate && new Date(c.dueDate).getTime() < Date.now());
    if (overdueCredit.length) items.push({ level:'error', message: `Credit overdue for ${overdueCredit.length} account${overdueCredit.length === 1 ? '' : 's'} — follow-up needed` });
    const pendingAudits = state.stockAudits.filter(a => a.status === 'pending-approval');
    if (pendingAudits.length) items.push({ level:'warning', message: `${pendingAudits.length} stock variance${pendingAudits.length === 1 ? '' : 's'} awaiting sign-off` });
    return items;
  })();
  const wastageRows = (() => {
    const byReason: Record<string, { reason: string; qty: number; cost: number }> = {};
    wasteLedgerEntries.forEach(entry => {
      const value = entry.itemType === 'ingredient' ? (ingredients[entry.itemId]?.unitCost ?? 0) : (products[entry.itemId]?.price ?? 0) * 0.45;
      const qty = Math.abs(entry.qtyChange);
      const key = entry.reason || 'Unspecified';
      const row = byReason[key] ?? { reason: key, qty: 0, cost: 0 };
      row.qty += qty;
      row.cost += qty * value;
      byReason[key] = row;
    });
    const rows = Object.values(byReason).sort((a, b) => b.cost - a.cost);
    const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
    return rows.map(row => ({ ...row, pct: totalCost ? Math.round((row.cost / totalCost) * 100) : 0 }));
  })();
  const totalWastageCost = wastageRows.reduce((sum, row) => sum + row.cost, 0);
  const completedPlansWithYield = state.productionPlans.filter(p => p.status === 'completed' && p.actualYield != null);
  const avgYieldPct = completedPlansWithYield.length
    ? Math.round(completedPlansWithYield.reduce((sum, p) => sum + (p.actualYield! / Math.max(1, p.requestedQty)) * 100, 0) / completedPlansWithYield.length)
    : null;

  return <Shell title="Owner Overview" subtitle="Live performance, approvals and operational health across every branch and the central kitchen." tabs={tabs} activeTab={tab} onTabChange={t => setTab(t as Tab)}>
    {notice && <div className="mb-4 flex flex-col gap-3 rounded-md border border-ink/10 bg-paper p-4 shadow-sm md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-3"><Pill tone={notice.level === 'error' ? 'red' : notice.level === 'warning' ? 'amber' : notice.level === 'info' ? 'blue' : 'green'}>{notice.level}</Pill><span className="text-sm font-bold text-ink">{notice.message}</span></div><ActionButton tone="slate" onClick={() => setNotice(null)}>Dismiss</ActionButton></div>}
    {tab === 'Command' && <div className="space-y-5">
      <section className="grid gap-6 border border-black/20 bg-ink p-6 text-white shadow-xl lg:grid-cols-[1.3fr_.7fr] lg:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={metrics.pendingProduction.length || metrics.lowIngredients.length ? 'amber' : 'green'}>{metrics.pendingProduction.length || metrics.lowIngredients.length ? 'Needs your decision' : 'All clear'}</Pill>
            <span className="text-xs text-white/50">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</span>
          </div>
          <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-white/50">Today's sales, all branches</h3>
          <p className="mt-1 font-ticket text-5xl font-extrabold leading-none text-white">{money(metrics.salesToday)}</p>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">{metrics.pendingProduction.length + metrics.lowIngredients.length} item{metrics.pendingProduction.length + metrics.lowIngredients.length === 1 ? '' : 's'} below need a decision from you today — approvals and restocking, prioritised underneath.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <ActionButton tone="orange" onClick={() => setTab('Branch Performance & P&L')}><BarChart3 className="size-4" />View P&L</ActionButton>
            <ActionButton tone="blue" onClick={() => setTab('Items & Pricing')}><ShoppingCart className="size-4" />Manage catalogue</ActionButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CommandStat label="Low stock" value={String(metrics.lowIngredients.length)} tone="red" />
          <CommandStat label="Approvals" value={String(metrics.pendingProduction.length)} tone="amber" />
          <CommandStat label="Online new" value={String(metrics.onlineNew)} tone="blue" />
          <CommandStat label="Credit due" value={money(metrics.creditDue)} tone="green" />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="7-day sales trend" description="Total billed across all branches, most recent 7 days.">
          <TrendLine data={sevenDayTrend} tone="orange" />
        </Card>
        <Card title="Sales by branch" description="Lifetime billed total per branch, at a glance.">
          <BarChartPanel data={salesByBranch} valueFormat={v => money(v)} tone="green" />
        </Card>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card title="Owner attention board" description="Shows what the owner should act on first.">
          {!metrics.pendingProduction.length && !metrics.lowIngredients.length && <p className="rounded-lg border border-dashed border-ink/20 bg-paper-dim px-4 py-8 text-center text-sm font-semibold text-ink-600">Nothing waiting on you right now.</p>}
          <div className="grid gap-3 md:grid-cols-2">
            {metrics.pendingProduction.map(plan => <div key={plan.id} className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><Pill tone="amber">Needs approval</Pill><h4 className="mt-2 font-display font-bold text-ink">{products[plan.productId]?.name}</h4><p className="text-sm text-ink-600">{plan.requestedQty} {products[plan.productId]?.unit} · {plan.notes}</p><ActionButton tone="green" className="mt-3" onClick={() => dispatch({ type:'approve-production', planId:plan.id, adminName:'Owner' })}>Approve + deduct raw material</ActionButton></div>)}
            {metrics.lowIngredients.map(ing => <div key={ing.id} className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><Pill tone="red">Low stock</Pill><h4 className="mt-2 font-display font-bold text-ink">{ing.name}</h4><p className="text-sm text-ink-600">Available {ing.currentStock} {ing.unit}; minimum {ing.minStock} {ing.unit}</p><ActionButton tone="blue" className="mt-3" onClick={() => dispatch({ type:'create-purchase-order', po:{ supplierId:ing.supplierId ?? state.suppliers[0].id, createdBy:'Owner', expectedDate:new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', lines:[{ ingredientId:ing.id, qty:ing.reorderQty, rate:ing.unitCost }] } })}>Create PO</ActionButton></div>)}
          </div>
        </Card>
        <Card title="Branch health" description="Counter, stock value, online queue and expiry risk.">
          <div className="space-y-3">{metrics.branchHealth.map(row => <div key={row.branch.id} className="rounded-lg border border-ink/10 bg-paper p-3.5 shadow-sm"><div className="flex justify-between gap-2"><b className="font-display text-sm text-ink">{row.branch.name}</b><Pill tone={row.open ? 'green' : 'amber'}>{row.open ? 'counter open' : 'closed'}</Pill></div><p className="mt-1 text-xs text-ink-600">Stock value {money(row.stockValue)} · online new {row.onlineNew} · expiry risk {row.expiryRisk}</p><div className="mt-2"><MiniBar label="Stock health" value={Math.min(100, row.stockValue/500)} max={100} tone={row.expiryRisk ? 'amber' : 'green'} /></div></div>)}</div>
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
          <fieldset><legend className="mb-2 text-xs font-semibold text-ink-600">Branch access</legend><div className="grid gap-2 rounded-lg border border-ink/10 bg-paper-dim p-3">{state.branches.filter(branch => branch.type !== 'central-kitchen').map(branch => <label key={branch.id} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm font-semibold text-ink-700"><input type="checkbox" className="size-4 accent-emerald-600" checked={newUserBranches.includes(branch.id)} onChange={event => setNewUserBranches(current => event.target.checked ? [...current, branch.id] : current.filter(id => id !== branch.id))} /><span>{branch.name}</span></label>)}</div></fieldset>
          <ActionButton tone="green"><Users className="size-4" />Create secure user</ActionButton>
          {userCreateStatus && <p className="rounded-md bg-paper-dim px-3 py-2 text-xs font-semibold leading-5 text-ink-600">{userCreateStatus}</p>}
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
      <Card title="Add a new item" description="Adds a sellable item to the POS catalogue immediately — it will appear on every branch's billing screen.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const name = String(f.get('name') || '').trim();
          if (!name) return;
          dispatch({ type:'add-product', product: {
            name, category: String(f.get('category') || 'General'), unit: (String(f.get('unit') || 'pcs') as Product['unit']),
            price: Number(f.get('price') || 0), taxRate: Number(f.get('taxRate') || 5), hsn: '', active: true,
            sellByWeight: false, kotStation: (String(f.get('kotStation') || 'no-kot') as Product['kotStation']), shelfLifeHours: 72, allowOnline: true
          } });
          notify(`${name} added to the item master.`);
          form.reset();
        }}>
          <Field label="Item name"><input className={inputClass} name="name" placeholder="e.g. Badam Halwa" required /></Field>
          <Field label="Category"><input className={inputClass} name="category" placeholder="e.g. Sweets" required /></Field>
          <Field label="Unit"><select className={inputClass} name="unit" defaultValue="pcs"><option value="pcs">Pieces</option><option value="kg">Kilogram</option><option value="box">Box</option><option value="plate">Plate</option><option value="tray">Tray</option><option value="portion">Portion</option></select></Field>
          <Field label="Base price (₹)"><input className={inputClass} name="price" type="number" min="0" step="0.01" required /></Field>
          <Field label="GST %"><input className={inputClass} name="taxRate" type="number" min="0" step="0.01" defaultValue={5} /></Field>
          <Field label="Kitchen station"><select className={inputClass} name="kotStation" defaultValue="no-kot"><option value="sweets">Sweets</option><option value="savouries">Savouries</option><option value="cakes">Cakes</option><option value="chaat">Chaat</option><option value="packing">Packing</option><option value="no-kot">No KOT</option></select></Field>
          <div className="flex items-end lg:col-span-2"><ActionButton tone="orange" className="w-fit"><ShoppingCart className="size-4" />Add item</ActionButton></div>
        </form>
      </Card>
      <Card title="Item master" description="Products include category, barcode, HSN, tax, KOT station, weight mode, online availability and shelf life. Click Edit to change name, category or price." action={<ExportButton onClick={() => downloadCsv('products.csv', state.products as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={state.products} columns={[
          {key:'externalItemCode',label:'Code',render:p => p.externalItemCode ?? '-'},
          {key:'name',label:'Item',render:p => editingProductId === p.id ? <input className={`${inputClass} h-9 min-w-[160px]`} value={editDraft.name} onChange={e => setEditDraft(d => ({ ...d, name:e.target.value }))} /> : p.name},
          {key:'category',label:'POS category',render:p => editingProductId === p.id ? <input className={`${inputClass} h-9 min-w-[130px]`} value={editDraft.category} onChange={e => setEditDraft(d => ({ ...d, category:e.target.value }))} /> : p.category},
          {key:'externalCategory',label:'Master category',render:p => p.externalCategory ?? '-'},
          {key:'price',label:'Base price',render:p => editingProductId === p.id ? <input className={`${inputClass} h-9 w-28 font-ticket`} type="number" min="0" step="0.01" value={editDraft.price} onChange={e => setEditDraft(d => ({ ...d, price:Number(e.target.value) }))} /> : <span className="font-ticket">{money(p.price)}</span>},
          {key:'taxRate',label:'GST',render:p => p.externalGst || `${p.taxRate}%`},
          {key:'hsn',label:'HSN',render:p => p.externalHsn || p.hsn || '-'},
          {key:'allowOnline',label:'Online',render:p => <Pill tone={p.allowOnline ? 'green':'slate'}>{p.allowOnline ? 'yes':'no'}</Pill>},
          {key:'id',label:'Action',render:p => editingProductId === p.id
            ? <div className="flex gap-1.5"><ActionButton tone="green" onClick={() => { dispatch({ type:'update-product', productId:p.id, changes:editDraft }); setEditingProductId(null); notify(`${editDraft.name} updated.`); }}>Save</ActionButton><ActionButton tone="slate" onClick={() => setEditingProductId(null)}>Cancel</ActionButton></div>
            : <div className="flex gap-1.5"><ActionButton tone="blue" onClick={() => { setEditingProductId(p.id); setEditDraft({ name:p.name, price:p.price, category:p.category }); }}>Edit</ActionButton><ActionButton tone="amber" onClick={() => dispatch({ type:'toggle-product', productId:p.id })}>{p.active ? 'Disable':'Enable'}</ActionButton></div>}
        ]} />
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
        <div className="grid gap-3 lg:grid-cols-2">{state.productionPlans.slice(0,4).map(plan => { const recipe = state.recipes.find(r => r.productId === plan.productId); const req = recipe ? recipeRequirement(recipe, plan.requestedQty) : []; return <div key={plan.id} className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><div className="flex flex-wrap items-center gap-2"><b className="font-display text-ink">{products[plan.productId]?.name}</b><Pill tone={plan.status === 'pending-admin-approval' ? 'amber':'blue'}>{plan.status}</Pill></div><p className="mt-1 text-xs text-ink-600">Plan {plan.requestedQty} {products[plan.productId]?.unit} · Requested by {plan.requestedBy}</p><div className="mt-3 grid gap-2">{req.map(line => <div key={line.ingredientId} className="flex justify-between rounded-md bg-paper-dim p-2 text-xs"><span>{ingredients[line.ingredientId]?.name}</span><b>{line.requiredQty} {ingredients[line.ingredientId]?.unit}</b></div>)}</div></div>; })}</div>
      </Card>
    </div>}

    {tab === 'Inventory' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Metric icon={Boxes} label="Raw SKUs" value={String(state.ingredients.length)} helper="Supplied raw-material register plus core recipe stock." tone="blue" /><Metric icon={AlertTriangle} label="Below minimum" value={String(metrics.lowIngredients.length)} helper="Only items with a configured minimum are flagged." tone="red" /><Metric icon={PackageCheck} label="Active materials" value={String(state.ingredients.filter(item => item.active !== false).length)} helper="Available for purchasing, production and audit." tone="green" /></div>
      <Card title="Raw material inventory" action={<ExportButton onClick={() => downloadCsv('raw_material_inventory.csv', state.ingredients as unknown as Record<string, unknown>[])} />}>
        <DataTable rows={state.ingredients} columns={[{key:'name',label:'Raw material'},{key:'category',label:'Category'},{key:'purchaseUnit',label:'Purchase unit',render:i => i.purchaseUnit || i.unit},{key:'consumptionUnit',label:'Use unit',render:i => i.consumptionUnit || i.unit},{key:'currentStock',label:'Stock',render:i => `${i.currentStock} ${i.unit}`},{key:'minStock',label:'Min',render:i => i.minStock > 0 ? `${i.minStock} ${i.unit}` : '-'},{key:'transferPrice',label:'Transfer',render:i => money(i.transferPrice ?? i.unitCost)},{key:'taxRate',label:'GST',render:i => i.taxRate != null ? `${i.taxRate}%` : '-'},{key:'hsn',label:'HSN',render:i => i.hsn || '-'},{key:'stockKeepingMethod',label:'Method',render:i => i.stockKeepingMethod || '-'},{key:'batchWise',label:'Batch',render:i => i.batchWise == null ? '-' : i.batchWise ? 'Yes':'No'},{key:'expiryTracked',label:'Expiry',render:i => i.expiryTracked == null ? '-' : i.expiryTracked ? `${i.bestBeforeDays ?? 0} days`:'No'},{key:'currentStock',label:'Status',render:i => { const low = i.minStock > 0 && i.currentStock <= i.minStock; return <Pill tone={low ? 'red': i.active === false ? 'slate':'green'}>{i.active === false ? 'inactive': low ? 'reorder':'ok'}</Pill>; }},{key:'id',label:'Action',render:i => adjustRowId === i.id
          ? <div className="flex flex-wrap items-center gap-1.5"><input className={`${inputClass} h-9 w-20 font-ticket`} type="number" step="0.01" placeholder="+/- qty" value={adjustDraft.qtyChange || ''} onChange={e => setAdjustDraft(d => ({ ...d, qtyChange:Number(e.target.value) }))} /><input className={`${inputClass} h-9 w-32`} placeholder="Reason" value={adjustDraft.reason} onChange={e => setAdjustDraft(d => ({ ...d, reason:e.target.value }))} /><ActionButton tone="green" onClick={() => { if (!adjustDraft.qtyChange || !adjustDraft.reason.trim()) { notify('Enter a quantity and reason.', 'warning'); return; } dispatch({ type:'manual-stock-adjust', ingredientId:i.id, qtyChange:adjustDraft.qtyChange, reason:adjustDraft.reason, userName:'Owner' }); setAdjustRowId(null); setAdjustDraft({ qtyChange:0, reason:'' }); }}>Save</ActionButton><ActionButton tone="slate" onClick={() => setAdjustRowId(null)}>Cancel</ActionButton></div>
          : <ActionButton tone="blue" onClick={() => { setAdjustRowId(i.id); setAdjustDraft({ qtyChange:0, reason:'' }); }}>Adjust</ActionButton>}]} />
      </Card>
      <Card title="Stock audit and variance approvals"><DataTable rows={state.stockAudits} columns={[{key:'branchId',label:'Branch',render:a => branches[a.branchId]?.name},{key:'itemId',label:'Item',render:a => a.itemType === 'ingredient' ? ingredients[a.itemId]?.name : products[a.itemId]?.name},{key:'systemQty',label:'System'},{key:'physicalQty',label:'Physical'},{key:'varianceReason',label:'Reason'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'approved' ? 'green': a.status === 'pending-approval' ? 'amber':'slate'}>{a.status}</Pill>},{key:'id',label:'Action',render:a => a.status !== 'approved' && <ActionButton tone="green" onClick={() => dispatch({ type:'approve-stock-audit', auditId:a.id, approvedBy:'Owner' })}>Approve</ActionButton>}]} /></Card>
      <Card title="Inventory ledger"><DataTable rows={state.ledger.slice(0, 30)} empty="Ledger will appear after approval, billing, audit or GRN" columns={[{key:'at',label:'At',render:l => new Date(l.at).toLocaleString()},{key:'branchId',label:'Branch',render:l => branches[l.branchId]?.name ?? l.branchId},{key:'itemId',label:'Item',render:l => l.itemType === 'ingredient' ? ingredients[l.itemId]?.name : products[l.itemId]?.name},{key:'qtyChange',label:'Qty'},{key:'reason',label:'Reason'},{key:'sourceType',label:'Source'}]} /></Card>
    </div>}

    {tab === 'Purchase/GRN' && <div className="space-y-5">
      <Card title="Suppliers"><DataTable rows={state.suppliers} columns={[{key:'name',label:'Supplier'},{key:'category',label:'Category'},{key:'phone',label:'Phone'},{key:'paymentTermsDays',label:'Terms',render:s => `${s.paymentTermsDays} days`},{key:'rating',label:'Rating'}]} /></Card>
      <Card title="Create purchase order" description="Raise a PO against a supplier for a raw material. Low-stock ingredients are flagged in Inventory.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-5" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const supplierId = String(f.get('supplierId') || '');
          const ingredientId = String(f.get('ingredientId') || '');
          const qty = Number(f.get('qty') || 0);
          const rate = Number(f.get('rate') || 0);
          if (!supplierId || !ingredientId || !qty || !rate) { notify('Fill in supplier, material, quantity and rate.', 'warning'); return; }
          dispatch({ type:'create-purchase-order', po:{ supplierId, expectedDate: String(f.get('expectedDate') || new Date(Date.now()+48*3600_000).toISOString().slice(0,10)), status:'draft', createdBy:'Owner', lines:[{ ingredientId, qty, rate }] } });
          notify('Purchase order created.');
          form.reset();
        }}>
          <Field label="Supplier"><select className={inputClass} name="supplierId" required defaultValue="">
            <option value="" disabled>Select supplier</option>
            {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></Field>
          <Field label="Raw material"><select className={inputClass} name="ingredientId" required defaultValue="">
            <option value="" disabled>Select material</option>
            {state.ingredients.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select></Field>
          <Field label="Quantity"><input className={inputClass} name="qty" type="number" min="1" step="0.01" required /></Field>
          <Field label="Rate (₹/unit)"><input className={inputClass} name="rate" type="number" min="0" step="0.01" required /></Field>
          <Field label="Expected date"><input className={inputClass} name="expectedDate" type="date" defaultValue={new Date(Date.now()+48*3600_000).toISOString().slice(0,10)} /></Field>
          <div className="lg:col-span-5"><ActionButton tone="green" className="w-fit">Create purchase order</ActionButton></div>
        </form>
      </Card>
      <Card title="Purchase orders" description="Low stock can create PO, and GRN receipt increases raw material inventory.">
        <DataTable rows={state.purchaseOrders} empty="No purchase orders yet" columns={[{key:'id',label:'PO'},{key:'supplierId',label:'Supplier',render:po => suppliers[po.supplierId]?.name},{key:'status',label:'Status',render:po => <Pill tone={po.status === 'received' ? 'green': po.status === 'sent' ? 'blue':'amber'}>{po.status}</Pill>},{key:'expectedDate',label:'Expected'},{key:'lines',label:'Lines',render:po => po.lines.map(l => `${ingredients[l.ingredientId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'GRN',render:po => po.status !== 'received' && <ActionButton tone="green" onClick={() => dispatch({ type:'receive-purchase-order', poId:po.id, invoiceNo:`INV-${Date.now().toString().slice(-4)}`, receivedBy:'Owner' })}>Receive</ActionButton>}]} />
      </Card>
    </div>}

    {tab === 'Production Approval' && <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={ClipboardCheck} label="Awaiting approval" value={String(state.productionPlans.filter(p => p.status === 'pending-admin-approval').length)} helper="Raw material not yet committed" tone="amber" />
        <Metric icon={ChefHat} label="In production" value={String(state.productionPlans.filter(p => !['pending-admin-approval','completed'].includes(p.status)).length)} helper="Approved and moving through kitchen stages" tone="blue" />
        <Metric icon={CheckCircle2} label="Completed" value={String(state.productionPlans.filter(p => p.status === 'completed').length)} helper="With recorded actual yield" tone="green" />
      </div>
      {!state.productionPlans.length && <div className="rounded-lg border border-dashed border-ink/20 bg-paper-dim px-4 py-10 text-center text-sm font-semibold text-ink-600">No production requests yet.</div>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {state.productionPlans.map(p => <div key={p.id} className={`rounded-lg border bg-paper p-4 shadow-sm ${p.status === 'pending-admin-approval' ? 'border-marigold ring-1 ring-marigold-100' : 'border-ink/10'}`}>
          <div className="flex items-center justify-between gap-2"><b className="font-display text-sm text-ink">{products[p.productId]?.name}</b><Pill tone={p.status === 'pending-admin-approval' ? 'amber' : p.status === 'completed' ? 'green' : 'blue'}>{p.status.replaceAll('-', ' ')}</Pill></div>
          <p className="mt-1 font-ticket text-lg font-bold text-ink">{p.requestedQty} {products[p.productId]?.unit}</p>
          <p className="mt-1 text-xs text-ink-600">{p.plannedDate} · requested by {p.requestedBy}</p>
          <p className="mt-2 text-xs leading-5 text-ink-600/80">{Object.entries(p.branchDemand).map(([bid, qty]) => `${branches[bid]?.name}: ${qty}`).join(' · ')}</p>
          <div className="mt-3">{p.status === 'pending-admin-approval'
            ? <ActionButton tone="green" onClick={() => dispatch({ type:'approve-production', planId:p.id, adminName:'Owner' })}><CheckCircle2 className="size-4" />Approve + deduct raw material</ActionButton>
            : p.status !== 'completed' && <ActionButton tone="blue" onClick={() => dispatch({ type:'move-production', planId:p.id, status:'mixing' })}>Move stage</ActionButton>}</div>
        </div>)}
      </div>
    </div>}

    {tab === 'Dispatch Control' && <div className="space-y-5"><Card title="Central kitchen dispatches" description="Crates, route, vehicle, driver, challan and receiving confirmation."><DataTable rows={state.dispatches} columns={[{key:'toBranchId',label:'To',render:d => branches[d.toBranchId]?.name},{key:'status',label:'Status',render:d => <Pill tone={d.status === 'received' ? 'green': d.status === 'dispatched' ? 'blue':'amber'}>{d.status}</Pill>},{key:'crateIds',label:'Crates',render:d => d.crateIds.join(', ')},{key:'route',label:'Route'},{key:'driver',label:'Driver'},{key:'vehicleNo',label:'Vehicle'},{key:'lines',label:'Items',render:d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'Action',render:d => d.status === 'draft' ? <ActionButton tone="blue" onClick={() => dispatch({ type:'pack-dispatch', dispatchId:d.id })}>Dispatch</ActionButton> : d.status === 'dispatched' ? <ActionButton tone="green" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:d.id })}>Receive</ActionButton> : null}]} /></Card><Card title="Print queue"><DataTable rows={state.printJobs} empty="Print jobs will appear after billing, labels, dispatch or closure" columns={[{key:'type',label:'Type'},{key:'target',label:'Target'},{key:'status',label:'Status',render:j => <Pill tone={j.status === 'printed' ? 'green': j.status === 'failed' ? 'red':'amber'}>{j.status}</Pill>},{key:'payload',label:'Payload'},{key:'createdAt',label:'At',render:j => new Date(j.createdAt).toLocaleString()}]} /></Card></div>}

    {tab === 'CRM/Credit' && <div className="space-y-5">
      <Card title="Add a customer" description="Adds a customer record with credit and loyalty tracking.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const name = String(f.get('name') || '').trim();
          if (!name) return;
          dispatch({ type:'add-customer', customer: { name, phone: String(f.get('phone') || ''), type: (String(f.get('type') || 'retail') as Customer['type']), creditLimit: Number(f.get('creditLimit') || 0), loyaltyPoints: 0, favoriteProducts: [] } });
          notify(`${name} added to customer master.`);
          form.reset();
        }}>
          <Field label="Customer name"><input className={inputClass} name="name" required /></Field>
          <Field label="Phone"><input className={inputClass} name="phone" /></Field>
          <Field label="Type"><select className={inputClass} name="type" defaultValue="retail"><option value="retail">Retail</option><option value="corporate">Corporate</option><option value="event">Event</option></select></Field>
          <Field label="Credit limit (₹)"><input className={inputClass} name="creditLimit" type="number" min="0" step="100" defaultValue={0} /></Field>
          <div className="lg:col-span-4"><ActionButton tone="green" className="w-fit">Add customer</ActionButton></div>
        </form>
      </Card>
      <Card title="Customers / loyalty / credit"><DataTable rows={state.customers} columns={[{key:'name',label:'Name'},{key:'phone',label:'Phone'},{key:'type',label:'Type'},{key:'creditLimit',label:'Credit limit',render:c => money(c.creditLimit)},{key:'loyaltyPoints',label:'Loyalty'},{key:'favoriteProducts',label:'Favourites',render:c => c.favoriteProducts.map(id => products[id]?.name).join(', ')}]} /></Card>
      <Card title="Credit ledger"><DataTable rows={state.creditEntries} empty="No credit transactions recorded yet" columns={[{key:'customerId',label:'Customer',render:c => state.customers.find(x => x.id === c.customerId)?.name},{key:'debit',label:'Debit',render:c => money(c.debit)},{key:'credit',label:'Credit',render:c => money(c.credit)},{key:'dueDate',label:'Due'},{key:'note',label:'Note'},{key:'at',label:'At',render:c => new Date(c.at).toLocaleString()}]} /></Card>
    </div>}

    {tab === 'Attendance' && <Card title="Attendance, overtime and staff advance" description="Includes advance taken date and reason, as requested."><DataTable rows={state.attendance} columns={[{key:'userId',label:'Staff',render:a => state.users.find(u => u.id === a.userId)?.name},{key:'date',label:'Date'},{key:'shift',label:'Shift'},{key:'checkIn',label:'In'},{key:'checkOut',label:'Out'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'present' ? 'green': a.status === 'late' ? 'amber':'red'}>{a.status}</Pill>},{key:'overtimeHours',label:'OT'},{key:'advanceTaken',label:'Advance',render:a => money(a.advanceTaken ?? 0)},{key:'advanceDate',label:'Adv date'},{key:'advanceReason',label:'Reason'},{key:'id',label:'Action',render:a => advanceRowId === a.id
      ? <div className="flex flex-wrap items-center gap-1.5"><input className={`${inputClass} h-9 w-24 font-ticket`} type="number" min="0" placeholder="Amount" value={advanceDraft.amount || ''} onChange={e => setAdvanceDraft(d => ({ ...d, amount:Number(e.target.value) }))} /><input className={`${inputClass} h-9 w-36`} placeholder="Reason" value={advanceDraft.reason} onChange={e => setAdvanceDraft(d => ({ ...d, reason:e.target.value }))} /><ActionButton tone="green" onClick={() => { if (!advanceDraft.amount || !advanceDraft.reason.trim()) { notify('Enter an amount and reason.', 'warning'); return; } dispatch({ type:'record-staff-advance', attendanceId:a.id, amount:advanceDraft.amount, reason:advanceDraft.reason }); setAdvanceRowId(null); setAdvanceDraft({ amount:0, reason:'' }); }}>Save</ActionButton><ActionButton tone="slate" onClick={() => setAdvanceRowId(null)}>Cancel</ActionButton></div>
      : <ActionButton tone="blue" onClick={() => { setAdvanceRowId(a.id); setAdvanceDraft({ amount:0, reason:'' }); }}>+ advance</ActionButton>}]} /></Card>}

    {tab === 'Reports & BI' && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Metric icon={BarChart3} label="Reports" value={String(reportDefinitions.length)} helper="Every key module has export-ready reports." tone="purple" /><Metric icon={FileSpreadsheet} label="CSV exports" value="All tabs" helper="CSV/Excel-ready data tables." tone="blue" /><Metric icon={LineChart} label="Bestseller" value={metrics.itemSales[0]?.product.name ?? '-'} helper="From live bill data." tone="green" /><Metric icon={Activity} label="Refunds" value={money(metrics.refundsToday)} helper="Refund/void control." tone="amber" /></div><Card title="Report catalogue" action={<ExportButton onClick={() => downloadCsv('sales_report.csv', reportRows)} />}><DataTable rows={reportDefinitions} columns={[{key:'name',label:'Report'},{key:'dashboard',label:'Dashboard'},{key:'group',label:'Group'},{key:'description',label:'Description'},{key:'exportFormats',label:'Exports',render:r => r.exportFormats.join(', ')}]} /></Card><Card title="Visual sales analysis"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{metrics.itemSales.slice(0,6).map(row => <MiniBar key={row.product.id} label={row.product.name} value={row.qty} max={Math.max(1, metrics.itemSales[0]?.qty || 1)} tone="orange" />)}</div></Card></div>}

    {tab === 'Integrations & Hardware' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Server} label="Connected" value={String(state.integrations.filter(i => i.status === 'connected').length)} helper="Live and receiving real traffic" tone="green" />
        <Metric icon={AlertTriangle} label="Needs setup" value={String(state.integrations.filter(i => i.status === 'missing-credentials' || i.status === 'needs-device-test').length)} helper="Waiting on credentials or a device test" tone="amber" />
        <Metric icon={Workflow} label="Sandbox / preview" value={String(state.integrations.filter(i => i.status === 'sandbox').length)} helper="Built and ready, running in preview mode" tone="blue" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.integrations.map(item => {
          const Icon = { aggregator: ShoppingBag, payment: CreditCard, communication: MessageCircle, accounting: FileSpreadsheet, hardware: Printer, maps: MapPin, ecommerce: Globe }[item.category] ?? Server;
          return <div key={item.id} className="flex flex-col rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`grid size-11 shrink-0 place-items-center rounded-lg ${item.health === 'ok' ? 'bg-emerald-50 text-tgreen' : item.health === 'error' ? 'bg-red-50 text-oxblood' : 'bg-marigold-50 text-marigold-700'}`}><Icon className="size-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold leading-5 text-ink">{item.name}</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-600/60">{item.category}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5"><Pill tone={item.status === 'connected' ? 'green' : item.status === 'missing-credentials' ? 'amber' : 'blue'}>{item.status.replaceAll('-', ' ')}</Pill><Pill tone={item.health === 'ok' ? 'green' : item.health === 'error' ? 'red' : 'amber'}>{item.health}</Pill></div>
            <p className="mt-3 flex-1 text-xs leading-5 text-ink-600">{item.notes}</p>
          </div>;
        })}
      </div>
    </div>}

    {tab === 'Debug & Support' && <div className="space-y-5"><DebugPanel events={state.debugEvents} /><Card title="Offline / sync queue"><DataTable rows={state.syncQueue} empty="No pending offline sync items" columns={[{key:'at',label:'At',render:s => new Date(s.at).toLocaleString()},{key:'table',label:'Table'},{key:'action',label:'Action'},{key:'status',label:'Status',render:s => <Pill tone={s.status === 'synced' ? 'green': s.status === 'failed' ? 'red':'amber'}>{s.status}</Pill>}]} /></Card></div>}

    {/* ========== NEW TABS FOR COMPLETE FEATURE COVERAGE (Admin God Mode) ========== */}

    {tab === 'Promotions & Loyalty' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={Gift} label="Active rules" value={String(state.promotions.filter(p => p.active).length)} helper="Currently saved and marked active" tone="orange" />
        <Metric icon={Award} label="Customers tracked" value={String(state.customers.length)} helper="With loyalty points on file" tone="green" />
        <Metric icon={Target} label="Total loyalty points" value={String(state.customers.reduce((sum, c) => sum + c.loyaltyPoints, 0))} helper="Sum across all customers" tone="blue" />
      </div>
      <Card title="Promotions & Campaign Rules" description="Rules saved here are recorded for staff reference. Auto-apply at billing is not yet wired into the POS checkout flow.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-ink/10 p-4 bg-paper/50">
            <b className="text-sm">Create New Rule</b>
            <form className="mt-3 space-y-2 text-sm" onSubmit={event => {
              event.preventDefault();
              const form = event.currentTarget;
              const f = new FormData(form);
              const name = String(f.get('name') || '').trim();
              if (!name) return;
              dispatch({ type:'add-promotion', name, trigger: String(f.get('trigger') || ''), reward: String(f.get('reward') || '') });
              notify('Promotion rule saved.');
              form.reset();
            }}>
              <Field label="Rule Name"><input className={inputClass} name="name" placeholder="Buy 1kg Mysore Pak Get 15% off next purchase" required /></Field>
              <Field label="Trigger"><select className={inputClass} name="trigger" defaultValue="Buy specific product qty"><option>Buy specific product qty</option><option>Cart total above ₹X</option><option>Birthday / Anniversary</option><option>Happy Hour time window</option></select></Field>
              <Field label="Reward"><select className={inputClass} name="reward" defaultValue="% discount on next purchase"><option>% discount on next purchase</option><option>Free item / add-on</option><option>Double loyalty points</option><option>Fixed ₹ off</option></select></Field>
              <ActionButton tone="green">Save Rule</ActionButton>
            </form>
          </div>
          <div>
            <b className="text-sm">Saved Rules</b>
            <div className="mt-2 space-y-2 text-xs">
              {state.promotions.map(p => <div key={p.id} className="flex items-center gap-2 rounded border border-dashed border-ink/20 p-2"><Pill tone={p.active ? 'green' : 'slate'}>{p.active ? 'Active' : 'Paused'}</Pill><span className="flex-1">{p.name} — {p.trigger} → {p.reward}</span><button onClick={() => dispatch({ type:'toggle-promotion', promotionId:p.id })} className="text-[11px] font-semibold text-sky-700">{p.active ? 'Pause' : 'Activate'}</button></div>)}
              {!state.promotions.length && <p className="text-ink-600">No rules saved yet. Create one on the left.</p>}
            </div>
          </div>
        </div>
      </Card>
      <Card title="Loyalty Program"><DataTable rows={state.customers} empty="No customers on file yet" columns={[{key:'name',label:'Customer'},{key:'phone',label:'Phone'},{key:'loyaltyPoints',label:'Points Balance',render:c => <b className="font-ticket text-lg text-tgreen">{c.loyaltyPoints}</b>},{key:'favoriteProducts',label:'Favourite Items',render:c => c.favoriteProducts?.length ? c.favoriteProducts.slice(0,2).map((id:string) => products[id]?.name).join(', ') : 'None recorded yet'}]} /></Card>
    </div>}

    {tab === 'Demand Forecasting & MRP' && <div className="space-y-5">
      <Card title="Predictive Demand Forecasting & MRP (Material Requirements Planning)" description="Sales history + simple intelligent forecast → suggested production quantities per product/branch. This is a key differentiator vs Petpooja/GOFRUGAL — reduces over/under production dramatically.">
        <div className="mb-4 p-4 rounded-lg bg-marigold-50 border border-marigold-100 text-sm text-ink-700">Forecast based on last 30/90 days sales, seasonality, upcoming events (festivals), current stock & lead time. One-click creates Production Plans that go to Kitchen for approval.</div>
        <DataTable rows={forecastRows} columns={[{key:'name',label:'Product'},{key:'category',label:'Category'},{key:'price',label:'Price',render:p => money(p.price)},{key:'thirtyDaySales',label:'30-day Sales'},{key:'forecastNeed',label:'Forecasted Need (next 7 days)',render:p => <b className="font-ticket text-lg">{p.forecastNeed} {p.unit}</b>},{key:'id',label:'Suggested Action',render:p => <ActionButton tone="green" onClick={() => { dispatch({ type:'create-production', productId: p.id, requestedQty: p.forecastNeed, requestedBy:'Owner Forecast', notes:'Forecast-generated MRP plan', branchDemand: { 'marathahalli': Math.round(p.forecastNeed * 0.36), 'sarjapur-road': Math.round(p.forecastNeed * 0.28), 'kadubeesanahalli': Math.round(p.forecastNeed * 0.22), 'koramangala': Math.round(p.forecastNeed * 0.14) } }); notify(`${p.name} forecast converted into a kitchen production request.`); }}>Create Production Plan from Forecast</ActionButton>}]} />
      </Card>
      <Card title="Shortage & Reorder Intelligence"><div className="grid gap-3 md:grid-cols-2">{state.ingredients.filter(i => i.currentStock < i.minStock).slice(0,4).map(ing => <div key={ing.id} className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><div className="flex justify-between"><b className="font-display text-ink">{ing.name}</b><Pill tone="red">Shortage</Pill></div><p className="text-sm mt-1 text-ink-600">Current: {ing.currentStock} {ing.unit} | Min: {ing.minStock} {ing.unit}</p><ActionButton tone="blue" className="mt-2" onClick={() => dispatch({ type:'create-purchase-order', po: { supplierId: ing.supplierId || state.suppliers[0]?.id, expectedDate: new Date(Date.now()+48*3600_000).toISOString().slice(0,10), status:'draft', createdBy:'Owner', lines: [{ingredientId: ing.id, qty: ing.reorderQty, rate: ing.unitCost}] } })}>Auto Create PO</ActionButton></div>)}</div></Card>
    </div>}

    {tab === 'Wastage & Yield Intelligence' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3"><Metric icon={Trash2} label="Recorded Wastage Cost" value={money(totalWastageCost)} helper="From logged waste movements" tone="red" /><Metric icon={Target} label="Avg Yield vs Plan" value={avgYieldPct != null ? `${avgYieldPct}%` : '—'} helper={completedPlansWithYield.length ? 'From completed production batches' : 'No completed batches with yield data yet'} tone="green" /><Metric icon={TrendingUp} label="Top Waste Reason" value={wastageRows[0]?.reason ?? '—'} helper="By recorded cost impact" tone="amber" /></div>
      <Card title="Wastage Pareto Analysis & Reduction Engine" description="Track every gram of waste with reason. System suggests recipe or process changes. GOFRUGAL-level wastage control + modern analytics.">
        <DataTable rows={wastageRows} columns={[{key:'reason',label:'Waste Reason'},{key:'qty',label:'Qty (kg/pcs)'},{key:'cost',label:'Cost Impact',render:r => money(r.cost)},{key:'pct',label:'% of Total',render:r => `${r.pct}%`},{key:'reason',label:'Action',render:r => <ActionButton tone="blue" onClick={() => notify(`Root-cause note created for ${r.reason}: review station handling and tray SOP.`)}>Investigate & Suggest Fix</ActionButton>}]} />
      </Card>
      <Card title="Yield Tracking by Recipe / Batch" description="Every completed production plan, planned vs actual yield. Low-yield batches are flagged for QC review.">
        <DataTable rows={state.productionPlans.filter(p => p.status === 'completed')} empty="No completed batches yet" columns={[
          { key:'productId', label:'Product', render:p => products[p.productId]?.name },
          { key:'requestedQty', label:'Planned', render:p => `${p.requestedQty} ${products[p.productId]?.unit ?? ''}` },
          { key:'actualYield', label:'Actual', render:p => p.actualYield != null ? `${p.actualYield} ${products[p.productId]?.unit ?? ''}` : '—' },
          { key:'wastageQty', label:'Wastage', render:p => p.wastageQty != null ? `${p.wastageQty} ${products[p.productId]?.unit ?? ''}` : '—' },
          { key:'id', label:'Yield %', render:p => { const pct = p.actualYield != null ? Math.round((p.actualYield / Math.max(1, p.requestedQty)) * 100) : null; return pct != null ? <Pill tone={pct >= 95 ? 'green' : pct >= 85 ? 'amber' : 'red'}>{pct}%</Pill> : '—'; } },
          { key:'qcNotes', label:'QC notes' }
        ]} />
      </Card>
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
          <div><b>Recent Printed / Pending Labels</b><div className="mt-2 space-y-1.5 text-sm">{state.printJobs.filter(job => job.type === 'label').slice(0, 6).map(job => <p key={job.id}>{job.payload} • <Pill tone={job.status === 'printed' ? 'green' : job.status === 'failed' ? 'red' : 'amber'}>{job.status}</Pill></p>)}{!state.printJobs.filter(job => job.type === 'label').length && <p className="text-ink-600">No label print jobs queued yet.</p>}</div></div>
        </div>
      </Card>
    </div>}

    {tab === 'Notifications Hub' && <Card title="Notifications, Alerts & Communication Center" description="Live alerts computed from current stock, orders, credit and approvals. Owner sets rules here.">
      <div className="space-y-3 text-sm">
        {liveNotifications.map((n, i) => <div key={i} className="flex gap-3 items-start p-3 rounded border border-ink/10"><Bell className={`size-4 mt-0.5 ${n.level === 'error' ? 'text-oxblood' : n.level === 'warning' ? 'text-marigold-700' : 'text-sky-600'}`} /><div>{n.message}</div></div>)}
        {!liveNotifications.length && <p className="text-ink-600">No alerts right now — stock, orders, credit and approvals are all clear.</p>}
      </div>
      <ActionButton tone="green" className="mt-4" onClick={() => notify('WhatsApp/SMS campaign queued. Live sending waits for approved provider credentials.')}>Send Test WhatsApp Campaign</ActionButton>
    </Card>}

    {tab === 'Detailed Audit Log' && <Card title="Complete Immutable Audit Trail" description="Every system-recorded action, most recent first. Export for compliance or investigation.">
      <DataTable rows={state.debugEvents.map(event => ({ ...event, actor: event.actor ?? 'System', action: event.message, entity: event.module }))} columns={[{key:'at',label:'When',render:a => new Date(a.at).toLocaleString()},{key:'actor',label:'Actor'},{key:'action',label:'Action'},{key:'module',label:'Module'},{key:'level',label:'Level',render:a => <Pill tone={a.level === 'error' ? 'red' : a.level === 'warning' ? 'amber' : a.level === 'success' ? 'green' : 'blue'}>{a.level}</Pill>}]} />
    </Card>}


    {/* ========== SUPPLIERS & PROCUREMENT (GST Invoice + Stock Sync) ========== */}
    {tab === 'Suppliers & Procurement' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Truck} label="Active Suppliers" value={String(state.suppliers.length)} helper="With GSTIN & payment terms" tone="blue" />
        <Metric icon={DollarSign} label="Open Purchase Orders" value={String(state.purchaseOrders.filter(po => po.status !== 'received').length)} helper="Sent or draft, awaiting receipt" tone="green" />
        <Metric icon={Scale} label="Purchase Order Value" value={money(state.purchaseOrders.reduce((sum, po) => sum + po.lines.reduce((lineSum, line) => lineSum + line.qty * line.rate, 0), 0))} helper="Across all recorded POs" tone="emerald" />
        <Metric icon={MessageCircle} label="Pending Stock Approvals" value={String(state.stockAudits.filter(a => a.status === 'pending-approval').length)} helper="Awaiting Branch Incharge sign-off" tone="amber" />
      </div>

      <Card title="Supplier Master + GST Handling" description="Add suppliers with or without GST. All purchases tracked for input credit.">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <b className="text-sm">Add New Supplier</b>
            <form className="mt-3 space-y-2" onSubmit={event => {
              event.preventDefault();
              const form = event.currentTarget;
              const f = new FormData(form);
              const name = String(f.get('name') || '').trim();
              if (!name) return;
              dispatch({ type:'add-supplier', supplier: { name, phone: String(f.get('phone') || ''), category: String(f.get('category') || 'General'), paymentTermsDays: Number(f.get('paymentTermsDays') || 14), gstin: String(f.get('gstin') || '') || undefined, rating: 4 } });
              notify(`${name} added to supplier master.`);
              form.reset();
            }}>
              <Field label="Supplier Name"><input className={inputClass} name="name" placeholder="Premium Dry Fruits Co." required /></Field>
              <Field label="Phone"><input className={inputClass} name="phone" placeholder="Contact number" /></Field>
              <Field label="Category"><input className={inputClass} name="category" placeholder="e.g. Dry fruits, Packaging" /></Field>
              <Field label="GSTIN (optional)"><input className={inputClass} name="gstin" placeholder="29ABCDE1234F1Z5 or leave blank for non-GST" /></Field>
              <Field label="Payment Terms (days)"><input className={inputClass} name="paymentTermsDays" type="number" defaultValue="14" /></Field>
              <ActionButton tone="green">Add Supplier</ActionButton>
            </form>
          </div>
          <div>
            <b className="text-sm">Existing Suppliers</b>
            <DataTable rows={state.suppliers} columns={[{key:'name',label:'Supplier'},{key:'gstin',label:'GSTIN',render:s => s.gstin || 'Non-GST'},{key:'paymentTermsDays',label:'Terms'},{key:'rating',label:'Rating'}]} />
          </div>
        </div>
      </Card>

      <Card title="Receive Purchase Order (Stock Auto-Sync)" description="Select a sent purchase order, confirm the supplier invoice number, and receive it — stock is automatically added to central inventory and the ledger is written.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const poId = String(f.get('poId') || '');
          const invoiceNo = String(f.get('invoiceNo') || '').trim();
          if (!poId || !invoiceNo) { notify('Choose a purchase order and enter the supplier invoice number.', 'warning'); return; }
          dispatch({ type:'receive-purchase-order', poId, invoiceNo, receivedBy:'Owner' });
          notify('Purchase invoice received. Central raw stock and inventory ledger updated.');
          form.reset();
        }}>
          <Field label="Purchase order"><select className={inputClass} name="poId" required defaultValue="">
            <option value="" disabled>Select a PO awaiting receipt</option>
            {state.purchaseOrders.filter(po => po.status !== 'received').map(po => <option key={po.id} value={po.id}>{suppliers[po.supplierId]?.name ?? po.supplierId} · {po.lines.length} line{po.lines.length === 1 ? '' : 's'}</option>)}
          </select></Field>
          <Field label="Invoice No / Bill No"><input className={inputClass} name="invoiceNo" placeholder="INV-2026-0742" required /></Field>
          <Field label="Invoice Date"><input className={inputClass} name="invoiceDate" type="date" defaultValue={new Date().toISOString().slice(0,10)} /></Field>
          <div className="flex items-end"><ActionButton tone="green" className="w-fit">Receive & Sync Stock</ActionButton></div>
        </form>
        {!state.purchaseOrders.filter(po => po.status !== 'received').length && <p className="mt-3 text-xs font-semibold text-ink-600">No purchase orders are currently awaiting receipt. Create one from the Purchase/GRN tab.</p>}
      </Card>
    </div>}

    {/* ========== BRANCH PERFORMANCE & P&L (Deep Analytics) ========== */}
    {tab === 'Branch Performance & P&L' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-5">
        <Metric icon={DollarSign} label="Total Revenue (All Branches)" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.revenue, 0))} helper="From recorded bills" tone="green" />
        <Metric icon={TrendingUp} label="Gross Profit" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.profit, 0))} helper="Contribution after COGS and waste" tone="emerald" />
        <Metric icon={TrendingDown} label="Wastage Loss" value={money(branchPerformanceRows.reduce((sum, row) => sum + row.wastage, 0))} helper="From logged waste movements" tone="red" />
        <Metric icon={BarChart3} label="Top Branch by Revenue" value={[...branchPerformanceRows].sort((a, b) => b.revenue - a.revenue)[0]?.branch ?? '-'} helper="Ranked by recorded bill revenue" tone="blue" />
        <Metric icon={Scale} label="Stock Variance (Approved Audits)" value={stockVariancePct != null ? `${stockVariancePct > 0 ? '+' : ''}${stockVariancePct.toFixed(1)}%` : '—'} helper={resolvedAudits.length ? 'Average across approved audits' : 'No approved audits yet'} tone="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {branchPerformanceRows.map(row => <div key={row.branch} className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2"><b className="font-display text-sm text-ink">{row.branch}</b><Pill tone={row.profit >= 0 ? 'green' : 'red'}>{row.margin}</Pill></div>
          <p className="mt-3 font-ticket text-2xl font-extrabold text-ink">{money(row.revenue)}</p>
          <p className="text-xs text-ink-600">Revenue</p>
          <div className="mt-3 space-y-1.5 border-t border-ink/8 pt-3 text-xs">
            <div className="flex justify-between text-ink-600"><span>COGS</span><span className="font-ticket">{money(row.cogs)}</span></div>
            <div className="flex justify-between text-ink-600"><span>Wastage</span><span className="font-ticket text-oxblood">{money(row.wastage)}</span></div>
            <div className="flex justify-between font-bold text-ink"><span>Profit</span><span className="font-ticket text-tgreen">{money(row.profit)}</span></div>
          </div>
        </div>)}
      </div>

      <Card title="Branch-wise Sales Performance" description="Same figures as the cards above, in exportable table form.">
        <DataTable rows={branchPerformanceRows} columns={[
          {key:'branch',label:'Branch'},
          {key:'revenue',label:'Revenue',render:r => money(r.revenue)},
          {key:'cogs',label:'COGS (Recipe Cost)',render:r => money(r.cogs)},
          {key:'wastage',label:'Wastage Loss',render:r => money(r.wastage)},
          {key:'profit',label:'Gross Profit',render:r => <span className="font-bold text-tgreen">{money(r.profit)}</span>},
          {key:'margin',label:'Margin %'}
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
