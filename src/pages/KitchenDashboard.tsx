
import { useState } from 'react';
import { AlertTriangle, ChefHat, ClipboardCheck, Factory, PackageCheck, Printer, Route, Scale, TimerReset } from 'lucide-react';
import { ActionButton, Card, DataTable, DebugPanel, Field, inputClass, Metric, Pill, Shell } from '../components/UI';
import { byId, money, productionShortages, recipeCost, recipeRequirement } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { ProductionStatus } from '../lib/types';

const tabs = ['Kitchen Cockpit', 'Bake Planner', 'Approval Queue', 'KDS Stage Board', 'QC & Wastage', 'Store / Low Stock', 'Packing Labels', 'Dispatch', 'Reports', 'Debug'] as const;
type Tab = typeof tabs[number];

const stages: ProductionStatus[] = ['prep','mixing','proofing','baking','cooling','qc','packing','completed'];

function CockpitStat({ label, value, tone }: { label: string; value: string; tone: 'red' | 'amber' | 'blue' | 'green' }) {
  const colors = { red:'border-rose-400/30 bg-rose-400/10 text-rose-300', amber:'border-marigold-100/30 bg-marigold-100/10 text-marigold-100', blue:'border-sky-400/30 bg-sky-400/10 text-sky-300', green:'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' };
  return <div className={`border p-3.5 ${colors[tone]}`}><p className="text-[10px] font-bold text-white/50">{label}</p><p className="mt-1 font-ticket text-xl font-extrabold text-white">{value}</p></div>;
}

export default function KitchenDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [tab, setTab] = useState<Tab>('Kitchen Cockpit');
  const [selectedProduct, setSelectedProduct] = useState(state.products[0]?.id ?? '');
  const [qty, setQty] = useState(20);
  const [storeStatus, setStoreStatus] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('');
  const [qcRowId, setQcRowId] = useState<string | null>(null);
  const [qcDraft, setQcDraft] = useState({ actualYield: 0, wastageQty: 0, qcNotes: '' });
  const products = byId(state.products);
  const ingredients = byId(state.ingredients);
  const branches = byId(state.branches);
  const recipe = state.recipes.find(r => r.productId === selectedProduct && r.active);
  const req = recipe ? recipeRequirement(recipe, qty) : [];
  const shortage = productionShortages(recipe, state.ingredients, qty);
  const cost = recipe ? recipeCost(recipe, state.ingredients, qty) : undefined;

  return <Shell title="Central Kitchen" subtitle="Plan production, control raw materials, move batches through quality checks, and dispatch to every branch." tabs={tabs} activeTab={tab} onTabChange={t => setTab(t as Tab)}>
    {tab === 'Kitchen Cockpit' && <div className="space-y-5">
      <section className="grid gap-6 border border-black/20 bg-ink p-6 text-white shadow-xl lg:grid-cols-[1.2fr_.8fr] lg:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Pill tone={metrics.pendingProduction.length || metrics.lowIngredients.length ? 'amber' : 'green'}>{metrics.pendingProduction.length || metrics.lowIngredients.length ? 'Action needed' : 'Kitchen running clean'}</Pill><span className="text-xs text-white/50">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</span></div>
          <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wide text-white/50">Batches in motion right now</h3>
          <p className="mt-1 font-ticket text-5xl font-extrabold leading-none text-white">{metrics.runningProduction.length}</p>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">Across prep, bake and packing. {metrics.pendingProduction.length} plan{metrics.pendingProduction.length === 1 ? '' : 's'} waiting on Admin approval before raw material is drawn.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <ActionButton tone="orange" onClick={() => setTab('Bake Planner')}><ChefHat className="size-4" />New production request</ActionButton>
            <ActionButton tone="blue" onClick={() => setTab('KDS Stage Board')}><Route className="size-4" />Open stage board</ActionButton>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CockpitStat label="Approvals" value={String(metrics.pendingProduction.length)} tone="amber" />
          <CockpitStat label="Low raw stock" value={String(metrics.lowIngredients.length)} tone="red" />
          <CockpitStat label="Expiry risk" value={String(metrics.expiringFinished.length)} tone="blue" />
          <CockpitStat label="Dispatches" value={String(state.dispatches.length)} tone="green" />
        </div>
      </section>
      <Card title="Today's production pipeline" description="Every batch currently planned, approved, baking or ready.">
        {!state.productionPlans.length && <p className="rounded-lg border border-dashed border-ink/20 bg-paper-dim px-4 py-8 text-center text-sm font-semibold text-ink-600">No production plans yet. Start one from Bake Planner.</p>}
        <div className="grid gap-3 lg:grid-cols-3">{state.productionPlans.map(plan => <div key={plan.id} className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><div className="flex flex-wrap items-center gap-2"><Pill tone={plan.status === 'pending-admin-approval' ? 'amber' : plan.status === 'completed' ? 'green':'blue'}>{plan.status}</Pill><b className="font-display text-ink">{products[plan.productId]?.name}</b></div><p className="mt-2 text-sm text-ink-600">{plan.requestedQty} {products[plan.productId]?.unit} · {plan.notes}</p><p className="text-xs text-ink-600/70">Demand: {Object.entries(plan.branchDemand).map(([id, q]) => `${branches[id]?.name}: ${q}`).join(' | ')}</p></div>)}</div>
      </Card>
    </div>}

    {tab === 'Bake Planner' && <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Card title="Create kitchen production request" description="Kitchen can decide product and quantity. Admin approval is required before raw material deduction.">
        <div className="grid gap-3"><Field label="Product"><select className={inputClass} value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}>{state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field><Field label="Quantity"><input className={inputClass} type="number" min="1" value={qty} onChange={e => setQty(Number(e.target.value))} /></Field><ActionButton tone="green" onClick={() => dispatch({ type:'create-production', productId:selectedProduct, requestedQty:qty, requestedBy:'Kitchen Lead', notes:'Kitchen planned production from planner', branchDemand:{ 'marathahalli':Math.round(qty*.35), 'sarjapur-road':Math.round(qty*.25), 'kadubeesanahalli':Math.round(qty*.25), 'koramangala':Math.round(qty*.15) } })}>Send to Admin approval</ActionButton></div>
      </Card>
      <Card title="Raw material and cost preview"><div className="mb-3 flex flex-wrap gap-2"><Pill tone={shortage.length ? 'red':'green'}>{shortage.length ? 'shortage' : 'can produce'}</Pill>{cost && <Pill tone="blue">Batch cost {money(cost.totalCost)}</Pill>}{cost && <Pill tone="purple">Unit cost {money(cost.perUnit)}</Pill>}</div><DataTable rows={req} empty="No recipe configured" columns={[{key:'ingredientId',label:'Raw material',render:r => ingredients[r.ingredientId]?.name},{key:'stage',label:'Stage'},{key:'requiredQty',label:'Required',render:r => `${r.requiredQty} ${ingredients[r.ingredientId]?.unit}`},{key:'ingredientId',label:'Available',render:r => `${ingredients[r.ingredientId]?.currentStock ?? 0} ${ingredients[r.ingredientId]?.unit ?? ''}`},{key:'wastagePct',label:'Wastage',render:r => `${r.wastagePct}%`}]} />{shortage.length > 0 && <div className="mt-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-oxblood">{shortage.join(' · ')}</div>}</Card>
    </div>}

    {tab === 'Approval Queue' && <Card title="Admin approval status"><DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Qty'},{key:'status',label:'Status',render:p => <Pill tone={p.status === 'pending-admin-approval' ? 'amber': p.status === 'raw-issued' ? 'green':'blue'}>{p.status}</Pill>},{key:'approvedBy',label:'Approved by'},{key:'notes',label:'Notes'}]} /></Card>}

    {tab === 'KDS Stage Board' && <div className="grid gap-4 xl:grid-cols-4">{stages.map(stage => <Card key={stage} title={stage.toUpperCase()} className="min-h-[18rem]"><div className="space-y-3">{state.productionPlans.filter(p => p.status === stage || (stage === 'prep' && p.status === 'raw-issued')).map(plan => <div key={plan.id} className="rounded-lg border border-ink/10 bg-paper p-3 shadow-sm"><b className="text-sm text-ink">{products[plan.productId]?.name}</b><p className="text-xs text-ink-600">{plan.requestedQty} {products[plan.productId]?.unit}</p><div className="mt-2 flex flex-wrap gap-1">{stages.filter(s => s !== stage).slice(0,3).map(s => <ActionButton key={s} tone="blue" onClick={() => dispatch({ type:'move-production', planId:plan.id, status:s })}>{s}</ActionButton>)}<ActionButton tone="green" onClick={() => setTab('QC & Wastage')}>Complete + QC</ActionButton></div></div>)}</div></Card>)}</div>}

    {tab === 'QC & Wastage' && <Card title="QC, yield and wastage"><DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Planned'},{key:'actualYield',label:'Actual'},{key:'wastageQty',label:'Wastage'},{key:'qualityStatus',label:'QC',render:p => <Pill tone={p.qualityStatus === 'passed' ? 'green': p.qualityStatus === 'failed' ? 'red':'amber'}>{p.qualityStatus ?? 'pending'}</Pill>},{key:'qcNotes',label:'Notes'},{key:'id',label:'Action',render:p => p.status === 'completed' ? <span className="text-xs text-ink-600/50">—</span> : qcRowId === p.id
      ? <div className="flex flex-wrap items-center gap-1.5"><input className={`${inputClass} h-9 w-20 font-ticket`} type="number" min="0" step="0.01" placeholder="Yield" value={qcDraft.actualYield || ''} onChange={e => setQcDraft(d => ({ ...d, actualYield:Number(e.target.value) }))} /><input className={`${inputClass} h-9 w-20 font-ticket`} type="number" min="0" step="0.01" placeholder="Waste" value={qcDraft.wastageQty || ''} onChange={e => setQcDraft(d => ({ ...d, wastageQty:Number(e.target.value) }))} /><input className={`${inputClass} h-9 w-32`} placeholder="QC notes" value={qcDraft.qcNotes} onChange={e => setQcDraft(d => ({ ...d, qcNotes:e.target.value }))} /><ActionButton tone="green" onClick={() => { if (!qcDraft.actualYield) return; dispatch({ type:'complete-production', planId:p.id, actualYield:qcDraft.actualYield, wastageQty:qcDraft.wastageQty, qcNotes:qcDraft.qcNotes || 'QC passed' }); setQcRowId(null); setQcDraft({ actualYield:0, wastageQty:0, qcNotes:'' }); }}>Save</ActionButton><ActionButton tone="slate" onClick={() => setQcRowId(null)}>Cancel</ActionButton></div>
      : <ActionButton tone="green" onClick={() => { setQcRowId(p.id); setQcDraft({ actualYield:p.requestedQty, wastageQty:0, qcNotes:'' }); }}>QC pass + complete</ActionButton>}]} /></Card>}

    {tab === 'Store / Low Stock' && <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Card title="Add a raw material" description="Adds a new item to the kitchen store register.">
          <form className="grid gap-3" onSubmit={event => {
            event.preventDefault();
            const form = event.currentTarget;
            const f = new FormData(form);
            const name = String(f.get('name') || '').trim();
            if (!name) return;
            dispatch({ type:'add-ingredient', ingredient: {
              name, category: String(f.get('category') || 'General'), unit: String(f.get('unit') || 'kg'),
              currentStock: Number(f.get('currentStock') || 0), minStock: Number(f.get('minStock') || 0),
              maxStock: Number(f.get('maxStock') || 0) || Number(f.get('currentStock') || 0) * 4,
              reorderQty: Number(f.get('reorderQty') || 0), unitCost: Number(f.get('unitCost') || 0), storage: (String(f.get('storage') || 'ambient') as 'ambient' | 'chilled' | 'frozen')
            } });
            setStoreStatus(`${name} added to the raw material register.`);
            form.reset();
          }}>
            <Field label="Material name"><input className={inputClass} name="name" placeholder="e.g. Cashew" required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><input className={inputClass} name="category" placeholder="e.g. Dry fruits" /></Field>
              <Field label="Unit"><input className={inputClass} name="unit" placeholder="kg / ltr / pcs" defaultValue="kg" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Opening stock"><input className={inputClass} name="currentStock" type="number" min="0" step="0.01" /></Field>
              <Field label="Minimum"><input className={inputClass} name="minStock" type="number" min="0" step="0.01" /></Field>
              <Field label="Reorder qty"><input className={inputClass} name="reorderQty" type="number" min="0" step="0.01" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unit cost (₹)"><input className={inputClass} name="unitCost" type="number" min="0" step="0.01" /></Field>
              <Field label="Storage"><select className={inputClass} name="storage" defaultValue="ambient"><option value="ambient">Ambient</option><option value="chilled">Chilled</option><option value="frozen">Frozen</option></select></Field>
            </div>
            <ActionButton tone="green" className="w-fit"><PackageCheck className="size-4" />Add raw material</ActionButton>
          </form>
        </Card>
        <Card title="Adjust stock" description="Record a purchase receipt, spillage, or physical count correction against an existing raw material.">
          <form className="grid gap-3" onSubmit={event => {
            event.preventDefault();
            const form = event.currentTarget;
            const f = new FormData(form);
            const ingredientId = String(f.get('ingredientId') || '');
            const qtyChange = Number(f.get('qtyChange') || 0);
            const reason = String(f.get('reason') || '').trim();
            if (!ingredientId || !qtyChange || !reason) { setStoreStatus('Choose a material, a quantity, and a reason.'); return; }
            dispatch({ type:'manual-stock-adjust', ingredientId, qtyChange, reason, userName:'Kitchen Store' });
            setStoreStatus(`${ingredients[ingredientId]?.name}: ${qtyChange > 0 ? '+' : ''}${qtyChange} ${ingredients[ingredientId]?.unit} recorded.`);
            form.reset();
          }}>
            <Field label="Raw material"><select className={inputClass} name="ingredientId" required defaultValue="">
              <option value="" disabled>Select material</option>
              {state.ingredients.map(i => <option key={i.id} value={i.id}>{i.name} ({i.currentStock} {i.unit})</option>)}
            </select></Field>
            <Field label="Quantity change"><input className={inputClass} name="qtyChange" type="number" step="0.01" placeholder="e.g. 25 to add, -2 to deduct" required /></Field>
            <Field label="Reason"><input className={inputClass} name="reason" placeholder="e.g. Purchase receipt, spillage, count correction" required /></Field>
            <ActionButton tone="blue" className="w-fit"><Scale className="size-4" />Record adjustment</ActionButton>
          </form>
        </Card>
      </div>
      {storeStatus && <p className="rounded-md bg-paper-dim px-3 py-2 text-xs font-semibold text-ink-600">{storeStatus}</p>}
      <Card title="Kitchen store raw materials" description="Purchase, consumption, costing, batch and expiry controls from the supplied raw-material register."><DataTable rows={state.ingredients} columns={[{key:'name',label:'Raw material'},{key:'category',label:'Category'},{key:'purchaseUnit',label:'Purchase',render:i => i.purchaseUnit || i.unit},{key:'consumptionUnit',label:'Consumption',render:i => i.consumptionUnit || i.unit},{key:'currentStock',label:'Stock',render:i => `${i.currentStock} ${i.unit}`},{key:'minStock',label:'Minimum',render:i => i.minStock > 0 ? `${i.minStock} ${i.unit}` : '-'},{key:'transferPrice',label:'Transfer cost',render:i => money(i.transferPrice ?? i.unitCost)},{key:'stockKeepingMethod',label:'Issue method',render:i => i.stockKeepingMethod || '-'},{key:'batchWise',label:'Batch',render:i => i.batchWise == null ? '-' : i.batchWise ? 'Yes':'No'},{key:'expiryTracked',label:'Best before',render:i => i.expiryTracked ? `${i.bestBeforeDays ?? 0} days`:'-'},{key:'currentStock',label:'Status',render:i => { const low = i.minStock > 0 && i.currentStock <= i.minStock; return <Pill tone={low ? 'red': i.active === false ? 'slate':'green'}>{i.active === false ? 'inactive': low ? 'low' : 'ok'}</Pill>; }}]} /></Card>
    </div>}

    {tab === 'Packing Labels' && <div className="space-y-5">
      <Card title="Finished batches — label control" description="Batch labels contain product, batch, expiry, allergen and branch dispatch info. A label is queued automatically when production completes.">
        <DataTable rows={state.finishedStocks} columns={[{key:'productId',label:'Product',render:s => products[s.productId]?.name},{key:'branchId',label:'Location',render:s => branches[s.branchId]?.name},{key:'qty',label:'Qty'},{key:'batchNo',label:'Batch'},{key:'producedAt',label:'Produced',render:s => s.producedAt.slice(0,10)},{key:'expiryAt',label:'Expiry',render:s => s.expiryAt.slice(0,10)},{key:'costPerUnit',label:'Cost',render:s => money(s.costPerUnit)},{key:'id',label:'Action',render:s => <ActionButton tone="blue" onClick={() => dispatch({ type:'reprint-label', stockId:s.id })}><Printer className="size-4" />Print label</ActionButton>}]} />
      </Card>
      <Card title="Label print queue"><DataTable rows={state.printJobs.filter(j => j.type === 'label')} empty="No label jobs queued" columns={[{key:'payload',label:'Label'},{key:'status',label:'Status',render:j => <Pill tone={j.status === 'printed' ? 'green' : j.status === 'failed' ? 'red' : 'amber'}>{j.status}</Pill>},{key:'createdAt',label:'Queued at',render:j => new Date(j.createdAt).toLocaleString()},{key:'id',label:'Action',render:j => j.status === 'queued' && <ActionButton tone="green" onClick={() => dispatch({ type:'mark-print-job', printJobId:j.id, status:'printed' })}>Mark printed</ActionButton>}]} /></Card>
    </div>}

    {tab === 'Dispatch' && <div className="space-y-5">
      <Card title="Create dispatch to branch" description="Send a finished-goods batch from the central kitchen to a branch for billing.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const toBranchId = String(f.get('toBranchId') || '');
          const productId = String(f.get('productId') || '');
          const dispatchQty = Number(f.get('qty') || 0);
          if (!toBranchId || !productId || !dispatchQty) { setDispatchStatus('Choose a branch, product and quantity.'); return; }
          const batchNo = String(f.get('batchNo') || `BATCH-${Date.now()}`);
          dispatch({
            type:'create-dispatch', toBranchId,
            lines:[{ productId, qty:dispatchQty, batchNo }],
            route: String(f.get('route') || 'Standard route'),
            driver: String(f.get('driver') || 'Unassigned'),
            vehicleNo: String(f.get('vehicleNo') || ''),
            crates: [`CR-${Date.now()}`]
          });
          setDispatchStatus(`Dispatch created: ${products[productId]?.name} × ${dispatchQty} to ${branches[toBranchId]?.name}.`);
          form.reset();
        }}>
          <Field label="Destination branch"><select className={inputClass} name="toBranchId" required defaultValue="">
            <option value="" disabled>Select branch</option>
            {state.branches.filter(b => b.type !== 'central-kitchen').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select></Field>
          <Field label="Product"><select className={inputClass} name="productId" required defaultValue="">
            <option value="" disabled>Select product</option>
            {state.products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></Field>
          <Field label="Quantity"><input className={inputClass} name="qty" type="number" min="1" step="1" required /></Field>
          <Field label="Batch no."><input className={inputClass} name="batchNo" placeholder="Auto-generated if left blank" /></Field>
          <Field label="Driver"><input className={inputClass} name="driver" placeholder="Driver name" /></Field>
          <Field label="Vehicle no."><input className={inputClass} name="vehicleNo" placeholder="e.g. KA-01-AB-1234" /></Field>
          <Field label="Route"><input className={inputClass} name="route" placeholder="e.g. East Route 1" /></Field>
          <div className="flex items-end"><ActionButton tone="green" className="w-fit"><Route className="size-4" />Create dispatch</ActionButton></div>
        </form>
        {dispatchStatus && <p className="mt-3 rounded-md bg-paper-dim px-3 py-2 text-xs font-semibold text-ink-600">{dispatchStatus}</p>}
      </Card>
      <Card title="Dispatch board"><DataTable rows={state.dispatches} empty="No dispatches yet" columns={[{key:'toBranchId',label:'To',render:d => branches[d.toBranchId]?.name},{key:'status',label:'Status',render:d => <Pill tone={d.status === 'received' ? 'green': d.status === 'dispatched' ? 'blue':'amber'}>{d.status}</Pill>},{key:'crateIds',label:'Crates',render:d => d.crateIds.join(', ')},{key:'route',label:'Route'},{key:'driver',label:'Driver'},{key:'vehicleNo',label:'Vehicle'},{key:'lines',label:'Items',render:d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ')},{key:'id',label:'Action',render:d => d.status === 'draft' || d.status === 'packed' ? <ActionButton tone="blue" onClick={() => dispatch({ type:'pack-dispatch', dispatchId:d.id })}>Dispatch</ActionButton> : d.status === 'dispatched' ? <ActionButton tone="green" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:d.id })}>Mark received</ActionButton> : <span className="text-xs text-ink-600/50">—</span>}]} /></Card>
    </div>}

    {tab === 'Reports' && <div className="space-y-5"><div className="grid gap-4 md:grid-cols-4"><Metric icon={Factory} label="Planned" value={String(state.productionPlans.length)} helper="All production plans" tone="blue" /><Metric icon={TimerReset} label="Running" value={String(metrics.runningProduction.length)} helper="Active KDS batches" tone="orange" /><Metric icon={PackageCheck} label="Finished stock" value={String(state.finishedStocks.length)} helper="Batch records" tone="green" /><Metric icon={AlertTriangle} label="Waste risk" value={String(state.productionPlans.filter(p => (p.wastageQty ?? 0) > 0).length)} helper="Wastage captured" tone="red" /></div><Card title="Production report"><DataTable rows={state.productionPlans} columns={[{key:'productId',label:'Product',render:p => products[p.productId]?.name},{key:'requestedQty',label:'Planned'},{key:'actualYield',label:'Actual'},{key:'wastageQty',label:'Waste'},{key:'status',label:'Status'},{key:'plannedDate',label:'Date'}]} /></Card></div>}

    {tab === 'Debug' && <DebugPanel events={state.debugEvents} />}
  </Shell>;
}
