
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AlertTriangle, ChefHat, ClipboardCheck, Factory, PackageCheck, Route, Scale, TimerReset } from 'lucide-react';
import { ActionButton, Card, DashboardTabs, DataTable, DebugPanel, Field, inputClass, Metric, Pill, Shell } from '../components/UI';
import { byId, money, productionShortages, recipeCost, recipeRequirement } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { ProductionStatus } from '../lib/types';
import OperationalWorkbench from '../components/OperationalWorkbench';
import { isExtensionTab, roleExtensionTabs } from '../lib/roleExtensions';
import CompleteFeatureCenter from '../components/CompleteFeatureCenter';
import { KitchenIntegratedFeature, type KitchenIntegratedModule } from '../components/IntegratedFeatureModules';

const existingTabs = ['Kitchen Cockpit', 'Live Kitchen Operations', 'Bake Planner', 'Approval Queue', 'KDS Stage Board', 'QC & Wastage', 'Store / Low Stock', 'Packing Labels', 'Dispatch', 'Reports', 'Debug', 'Materials & Procurement', 'Baker Production', 'Production Operations', 'Production Workstations', 'Cake Production', 'Packing & Dispatch', 'Kitchen Product Master', 'Kitchen Recipe Management', 'Complete Feature Centre'] as const;
const tabs = [...existingTabs, ...roleExtensionTabs.kitchen] as const;
type Tab = typeof tabs[number];

const stages: ProductionStatus[] = ['prep','mixing','proofing','baking','cooling','qc','packing','completed'];

export default function KitchenDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [searchParams] = useSearchParams();
  const appRole = useAuthStore.getState().currentUser?.role;
  const [tab, setTab] = useState<Tab>(() => searchParams.get('suite') === 'complete-feature-centre' ? 'Complete Feature Centre' : searchParams.get('suite') === 'materials-procurement' || appRole === 'store' ? 'Materials & Procurement' : appRole === 'cake_master' ? 'Cake Production' : ['sweet_master','savouries_master','cookies_master','puffs_master','bakery_master'].includes(String(appRole)) ? 'Production Workstations' : searchParams.get('suite') === 'production-operations' || appRole === 'baker' ? 'Baker Production' : searchParams.get('suite') === 'packing-dispatch' || appRole === 'packing' ? 'Packing & Dispatch' : appRole === 'kitchen' ? 'Live Kitchen Operations' : 'Kitchen Cockpit');
  const [selectedProduct, setSelectedProduct] = useState(state.products[0]?.id ?? '');
  const [qty, setQty] = useState(20);
  const products = byId(state.products);
  const ingredients = byId(state.ingredients);
  const branches = byId(state.branches);
  const recipe = state.recipes.find(r => r.productId === selectedProduct && r.active);
  const req = recipe ? recipeRequirement(recipe, qty) : [];
  const shortage = productionShortages(recipe, state.ingredients, qty);
  const cost = recipe ? recipeCost(recipe, state.ingredients, qty) : undefined;

  return <Shell title="Central Kitchen" subtitle="Plan production, control raw materials, move batches through quality checks, and dispatch to every branch.">
    <DashboardTabs tabs={tabs} active={tab} setActive={setTab} />
    {tab === 'Kitchen Cockpit' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"><Metric icon={ChefHat} label="Running batches" value={String(metrics.runningProduction.length)} helper="Active production batches across stages." tone="orange" /><Metric icon={ClipboardCheck} label="Admin approval" value={String(metrics.pendingProduction.length)} helper="Waiting before raw deduction." tone="amber" /><Metric icon={AlertTriangle} label="Low raw stock" value={String(metrics.lowIngredients.length)} helper="Kitchen purchase risk." tone="red" /><Metric icon={Scale} label="Expiry risk" value={String(metrics.expiringFinished.length)} helper="Finished batches expiring soon." tone="purple" /><Metric icon={Route} label="Dispatches" value={String(state.dispatches.length)} helper="Crate and route tracking." tone="blue" /></div>
      <Card title="Today’s production pipeline"><div className="grid gap-3 lg:grid-cols-3">{state.productionPlans.map(plan => <div key={plan.id} className="rounded-2xl bg-white/70 p-4 ring-1 ring-white/70"><div className="flex flex-wrap items-center gap-2"><Pill tone={plan.status === 'pending-admin-approval' ? 'amber' : plan.status === 'completed' ? 'green':'blue'}>{plan.status}</Pill><b>{products[plan.productId]?.name}</b></div><p className="mt-2 text-sm text-slate-600">{plan.requestedQty} {products[plan.productId]?.unit} · {plan.notes}</p><p className="text-xs text-slate-500">Demand: {Object.entries(plan.branchDemand).map(([id, q]) => `${branches[id]?.name}: ${q}`).join(' | ')}</p></div>)}</div></Card>
    </div>}

    {tab === 'Bake Planner' && <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Card title="Create kitchen production request" description="Kitchen can decide product and quantity. Admin approval is required before raw material deduction.">
        <div className="grid gap-3"><Field label="Product"><select className={inputClass} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>{state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Quantity"><input className={inputClass} type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} /></Field><ActionButton tone="green" onClick={() => dispatch({ type:'create-production', productId:selectedProduct, requestedQty:qty, requestedBy:'Kitchen Lead', notes:'Kitchen planned production from planner', branchDemand:{ 'marathahalli':qty } })}>Send to Admin approval</ActionButton></div>
      </Card>
      <Card title="Raw material and cost preview"><div className="mb-3 flex flex-wrap gap-2"><Pill tone={shortage.length ? 'red':'green'}>{shortage.length ? 'shortage' : 'can produce'}</Pill>{cost && <Pill tone="blue">Batch cost {money(cost.totalCost)}</Pill>}{cost && <Pill tone="purple">Unit cost {money(cost.perUnit)}</Pill>}</div><DataTable rows={req} empty="No recipe configured" columns={[{key:'ingredientId',label:'Raw material',render:r => ingredients[r.ingredientId]?.name},{key:'stage',label:'Stage'},{key:'requiredQty',label:'Required',render:r => `${r.requiredQty} ${ingredients[r.ingredientId]?.unit}`},{key:'ingredientId',label:'Available',render:r => `${ingredients[r.ingredientId]?.currentStock ?? 0} ${ingredients[r.ingredientId]?.unit ?? ''}`},{key:'wastagePct',label:'Wastage',render:r => `${r.wastagePct}%`}]} />{shortage.length > 0 && <div className="mt-3 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{shortage.join(' · ')}</div>}</Card>
    </div>}

    {tab === 'Approval Queue' && <Card title="Admin approval status"><DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Qty'},{key:'status',label:'Status',render:p => <Pill tone={p.status === 'pending-admin-approval' ? 'amber': p.status === 'raw-issued' ? 'green':'blue'}>{p.status}</Pill>},{key:'approvedBy',label:'Approved by'},{key:'notes',label:'Notes'}]} /></Card>}

    {tab === 'KDS Stage Board' && <div className="grid gap-4 xl:grid-cols-4">{stages.map(stage => <Card key={stage} title={stage.toUpperCase()} className="min-h-[18rem]"><div className="space-y-3">{state.productionPlans.filter(p => p.status === stage || (stage === 'prep' && p.status === 'raw-issued')).map(plan => <div key={plan.id} className="rounded-2xl bg-white/75 p-3 ring-1 ring-white/70"><b className="text-sm">{products[plan.productId]?.name}</b><p className="text-xs text-slate-500">{plan.requestedQty} {products[plan.productId]?.unit}</p><div className="mt-2 flex flex-wrap gap-1">{stages.filter(s => s !== stage).slice(0,3).map(s => <ActionButton key={s} tone="blue" onClick={() => dispatch({ type:'move-production', planId:plan.id, status:s })}>{s}</ActionButton>)}<ActionButton tone="green" onClick={() => dispatch({ type:'complete-production', planId:plan.id, actualYield:plan.requestedQty, qcNotes:'Passed from KDS quick complete' })}>Complete</ActionButton></div></div>)}</div></Card>)}</div>}

    {tab === 'QC & Wastage' && <Card title="QC, yield and wastage"><DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Planned'},{key:'actualYield',label:'Actual'},{key:'wastageQty',label:'Wastage'},{key:'qualityStatus',label:'QC',render:p => <Pill tone={p.qualityStatus === 'passed' ? 'green': p.qualityStatus === 'failed' ? 'red':'amber'}>{p.qualityStatus ?? 'pending'}</Pill>},{key:'qcNotes',label:'Notes'},{key:'id',label:'Action',render:p => <ActionButton tone="green" onClick={() => dispatch({ type:'complete-production', planId:p.id, actualYield:p.requestedQty * .98, wastageQty:p.requestedQty * .02, qcNotes:'QC passed with 2% demo variance' })}>QC pass + complete</ActionButton>}]} /></Card>}

    {tab === 'Store / Low Stock' && <Card title="Kitchen store raw materials" description="Purchase, consumption, costing, batch and expiry controls from the supplied raw-material register."><DataTable rows={state.ingredients} columns={[{key:'name',label:'Raw material'},{key:'category',label:'Category'},{key:'purchaseUnit',label:'Purchase',render:i => i.purchaseUnit || i.unit},{key:'consumptionUnit',label:'Consumption',render:i => i.consumptionUnit || i.unit},{key:'currentStock',label:'Stock',render:i => `${i.currentStock} ${i.unit}`},{key:'minStock',label:'Minimum',render:i => i.minStock > 0 ? `${i.minStock} ${i.unit}` : '-'},{key:'transferPrice',label:'Transfer cost',render:i => money(i.transferPrice ?? i.unitCost)},{key:'stockKeepingMethod',label:'Issue method',render:i => i.stockKeepingMethod || '-'},{key:'batchWise',label:'Batch',render:i => i.batchWise == null ? '-' : i.batchWise ? 'Yes':'No'},{key:'expiryTracked',label:'Best before',render:i => i.expiryTracked ? `${i.bestBeforeDays ?? 0} days`:'-'},{key:'currentStock',label:'Status',render:i => { const low = i.minStock > 0 && i.currentStock <= i.minStock; return <Pill tone={low ? 'red': i.active === false ? 'slate':'green'}>{i.active === false ? 'inactive': low ? 'low' : 'ok'}</Pill>; }}]} /></Card>}

    {tab === 'Packing Labels' && <Card title="Packing labels and batch traceability" description="Batch labels contain product, batch, expiry, allergen and branch dispatch info."><DataTable rows={state.finishedStocks} columns={[{key:'productId',label:'Product',render:s => products[s.productId]?.name},{key:'branchId',label:'Location',render:s => branches[s.branchId]?.name},{key:'qty',label:'Qty'},{key:'batchNo',label:'Batch'},{key:'producedAt',label:'Produced',render:s => s.producedAt.slice(0,10)},{key:'expiryAt',label:'Expiry',render:s => s.expiryAt.slice(0,10)},{key:'costPerUnit',label:'Cost',render:s => money(s.costPerUnit)}]} /></Card>}

    {tab === 'Dispatch' && <div className="space-y-5"><Card title="Create dispatch to branch"><div className="grid gap-3 md:grid-cols-5"><ActionButton tone="green" onClick={() => dispatch({ type:'create-dispatch', toBranchId:'marathahalli', route:'East Route 2', driver:'Auto assigned', vehicleNo:'KA-01-DEMO', crates:['CR-DEMO-1'], lines:[{ productId:'prod-mixture', qty:20, batchNo:'MX-0706-A' }] })}>Create demo dispatch</ActionButton><ActionButton tone="blue" onClick={() => state.dispatches[0] && dispatch({ type:'pack-dispatch', dispatchId:state.dispatches[0].id })}>Dispatch first</ActionButton></div></Card><Card title="Dispatch board"><DataTable rows={state.dispatches} columns={[{key:'toBranchId',label:'To',render:d => branches[d.toBranchId]?.name},{key:'status',label:'Status',render:d => <Pill tone={d.status === 'received' ? 'green': d.status === 'dispatched' ? 'blue':'amber'}>{d.status}</Pill>},{key:'crateIds',label:'Crates',render:d => d.crateIds.join(', ')},{key:'route',label:'Route'},{key:'driver',label:'Driver'},{key:'vehicleNo',label:'Vehicle'},{key:'lines',label:'Items',render:d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ')}]} /></Card></div>}

    {tab === 'Reports' && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Metric icon={Factory} label="Planned" value={String(state.productionPlans.length)} helper="All production plans" tone="blue" /><Metric icon={TimerReset} label="Running" value={String(metrics.runningProduction.length)} helper="Active KDS batches" tone="orange" /><Metric icon={PackageCheck} label="Finished stock" value={String(state.finishedStocks.length)} helper="Batch records" tone="green" /><Metric icon={AlertTriangle} label="Waste risk" value={String(state.productionPlans.filter(p => (p.wastageQty ?? 0) > 0).length)} helper="Wastage captured" tone="red" /></div><Card title="Production report"><DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Planned'},{key:'actualYield',label:'Actual'},{key:'wastageQty',label:'Waste'},{key:'status',label:'Status'},{key:'plannedDate',label:'Date'}]} /></Card></div>}

    {tab === 'Debug' && <DebugPanel events={state.debugEvents} />}
    {tab === 'Complete Feature Centre' && <CompleteFeatureCenter dashboard="kitchen" initialModule={searchParams.get('module') ?? undefined} />}
    {tab === 'Materials & Procurement' && <KitchenIntegratedFeature module="Materials & Procurement" />}
    {tab === 'Production Operations' && <KitchenIntegratedFeature module={['sweet_master','savouries_master','cookies_master','puffs_master','bakery_master'].includes(String(appRole)) ? 'Production Workstations' : 'Baker Production'} />}
    {tab === 'Packing & Dispatch' && <KitchenIntegratedFeature module="Packing & Dispatch" />}
    {(['Live Kitchen Operations','Baker Production','Production Workstations','Cake Production','Kitchen Product Master','Kitchen Recipe Management','Kitchen Waste Log'] as readonly string[]).includes(tab) && <KitchenIntegratedFeature module={tab as KitchenIntegratedModule} />}
    {tab === 'Material Orders' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="orders" />}
    {tab === 'Material Inventory' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="inventory" />}
    {tab === 'Suppliers' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="suppliers" />}
    {tab === 'Purchase Invoices' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="invoices" />}
    {tab === 'Materials Analytics' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="analytics" />}
    {tab === 'Custom Plan' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="custom" />}
    {tab === 'Materials Closure' && <KitchenIntegratedFeature module="Materials & Procurement" internalTab="closure" />}
    {tab === 'Recipe Management' && <KitchenIntegratedFeature module="Kitchen Recipe Management" />}
    {tab === 'Production Queue' && <KitchenIntegratedFeature module="Baker Production" internalTab="orders" />}
    {tab === 'Production History' && <KitchenIntegratedFeature module="Baker Production" internalTab="completed" />}
    {tab === 'Packing Queue' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="orders" />}
    {tab === 'Cake Orders' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="cake-orders" />}
    {tab === 'Corrections' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="corrections" />}
    {tab === 'Transfer In' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="transfer-in" />}
    {tab === 'Packing Billing' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="billing" />}
    {tab === 'Leftover Items' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="leftover" />}
    {tab === 'Dispatched History' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="dispatched" />}
    {tab === 'Packing Closure' && <KitchenIntegratedFeature module="Packing & Dispatch" internalTab="closure" />}
    {!(['Live Kitchen Operations','Baker Production','Production Workstations','Cake Production','Kitchen Product Master','Kitchen Recipe Management','Kitchen Waste Log','Material Orders','Material Inventory','Suppliers','Purchase Invoices','Materials Analytics','Custom Plan','Materials Closure','Recipe Management','Production Queue','Production History','Packing Queue','Cake Orders','Corrections','Transfer In','Packing Billing','Leftover Items','Dispatched History','Packing Closure'] as readonly string[]).includes(tab) && isExtensionTab('kitchen', tab) && <OperationalWorkbench scope="kitchen" module={tab} branchName="Central Kitchen" />}
  </Shell>;
}
