import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  History,
  PackageCheck,
  Scale,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { ActionButton, Card, DashboardTabs, DataTable, ExportButton, Field, inputClass, Metric, Pill, Shell } from '../components/UI';
import { byId, downloadCsv } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import OperationalWorkbench from '../components/OperationalWorkbench';
import { isExtensionTab, roleExtensionTabs } from '../lib/roleExtensions';

const existingTabs = ['Audit Desk', 'Physical Count', 'Incoming Verification', 'Purchase Match', 'Waste & Movements', 'History'] as const;
const tabs = [...existingTabs, ...roleExtensionTabs['stock-audit']] as const;
type Tab = typeof tabs[number];

export default function StockAuditDashboard() {
  const { state, dispatch } = useBakeryStore();
  const [tab, setTab] = useState<Tab>('Audit Desk');
  const [itemType, setItemType] = useState<'ingredient' | 'finished-good'>('finished-good');
  const products = byId(state.products);
  const ingredients = byId(state.ingredients);
  const branches = byId(state.branches);
  const suppliers = byId(state.suppliers);
  const branchAudits = useMemo(() => state.stockAudits.filter(audit => audit.branchId === state.selectedBranchId), [state.stockAudits, state.selectedBranchId]);
  const pendingAudits = state.stockAudits.filter(audit => audit.status === 'pending-approval');
  const varianceValue = state.stockAudits.reduce((sum, audit) => sum + Math.abs(audit.physicalQty - audit.systemQty), 0);
  const incoming = state.dispatches.filter(item => item.toBranchId === state.selectedBranchId && item.status === 'dispatched');
  const movementRows = state.ledger.filter(row => ['audit', 'return', 'waste', 'manual'].includes(row.sourceType));
  const countItems = itemType === 'ingredient' ? state.ingredients : state.products;

  return <Shell title="Stock Audit" subtitle="Independent physical counting, inward checks, invoice matching, variance evidence and approval-ready history across all four branches.">
    <div className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[minmax(240px,1fr)_auto] md:items-end">
      <Field label="Audit location">
        <select className={inputClass} value={state.selectedBranchId} onChange={event => dispatch({ type:'select-branch', branchId:event.target.value })}>
          {state.branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
      </Field>
      <div className="flex flex-wrap gap-2"><Pill tone="blue">Independent count</Pill><Pill tone="green">Evidence tracked</Pill><Pill tone="slate">Maker-checker approval</Pill></div>
    </div>

    <DashboardTabs tabs={tabs} active={tab} setActive={setTab} />

    {tab === 'Audit Desk' && <div className="space-y-4">
      <section className="grid gap-4 border border-slate-800 bg-[#111b25] p-5 text-white shadow-lg lg:grid-cols-[1.2fr_.8fr] lg:p-6">
        <div><div className="flex items-center gap-2"><Pill tone={pendingAudits.length ? 'amber' : 'green'}>{pendingAudits.length ? 'Review required' : 'Counts reconciled'}</Pill><span className="text-xs text-slate-400">{branches[state.selectedBranchId]?.name}</span></div><h3 className="mt-4 text-2xl font-extrabold">Trust the shelf, not assumptions.</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Count physical stock, verify incoming crates and document every difference before it reaches the inventory ledger.</p><div className="mt-5 flex flex-wrap gap-2"><ActionButton tone="green" onClick={() => setTab('Physical Count')}><Scale className="size-4" />Start count</ActionButton><ActionButton tone="blue" onClick={() => setTab('Incoming Verification')}><Truck className="size-4" />Verify incoming</ActionButton></div></div>
        <div className="grid grid-cols-2 gap-3"><AuditSignal label="Pending approval" value={String(pendingAudits.length)} tone="amber" /><AuditSignal label="Branch counts" value={String(branchAudits.length)} tone="blue" /><AuditSignal label="Variance units" value={varianceValue.toFixed(2)} tone="red" /><AuditSignal label="Incoming loads" value={String(incoming.length)} tone="green" /></div>
      </section>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={ClipboardCheck} label="Audits recorded" value={String(state.stockAudits.length)} helper="Physical counts with branch and item evidence" tone="blue" /><Metric icon={AlertTriangle} label="Awaiting review" value={String(pendingAudits.length)} helper="Admin approval is required before posting" tone={pendingAudits.length ? 'amber' : 'green'} /><Metric icon={ArrowDownToLine} label="Incoming checks" value={String(incoming.length)} helper="Dispatches awaiting quantity confirmation" tone="purple" /><Metric icon={ShieldCheck} label="Audit trail" value={String(movementRows.length)} helper="Controlled inventory movements retained" tone="green" /></div>
      <Card title="Priority variance queue" description="Largest and newest differences stay visible until an authorized approver clears them."><DataTable rows={pendingAudits} empty="No stock differences are waiting for approval" columns={[{key:'branchId',label:'Branch',render:a => branches[a.branchId]?.name},{key:'itemId',label:'Item',render:a => a.itemType === 'ingredient' ? ingredients[a.itemId]?.name : products[a.itemId]?.name},{key:'systemQty',label:'System'},{key:'physicalQty',label:'Physical'},{key:'variance',label:'Variance',render:a => (a.physicalQty - a.systemQty).toFixed(2)},{key:'varianceReason',label:'Evidence / reason'},{key:'status',label:'Status',render:a => <Pill tone="amber">{a.status}</Pill>}]} /></Card>
    </div>}

    {tab === 'Physical Count' && <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card title="Record physical count" description="The system quantity is captured with the count so the variance cannot be hidden later.">
        <form className="grid gap-3" onSubmit={event => { event.preventDefault(); const form = new FormData(event.currentTarget); const itemId = String(form.get('itemId')); const systemQty = itemType === 'ingredient' ? Number(ingredients[itemId]?.currentStock ?? 0) : state.finishedStocks.filter(stock => stock.branchId === state.selectedBranchId && stock.productId === itemId).reduce((sum, stock) => sum + stock.qty, 0); dispatch({ type:'create-stock-audit', audit:{ branchId:state.selectedBranchId, itemType, itemId, systemQty, physicalQty:Number(form.get('physicalQty') || 0), varianceReason:String(form.get('reason') || 'Physical count completed') } }); event.currentTarget.reset(); }}>
          <Field label="Stock type"><select className={inputClass} value={itemType} onChange={event => setItemType(event.target.value as typeof itemType)}><option value="finished-good">Finished goods</option><option value="ingredient">Raw materials</option></select></Field>
          <Field label="Item"><select className={inputClass} name="itemId">{countItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field>
          <Field label="Physical quantity"><input className={inputClass} name="physicalQty" required min="0" step="0.001" type="number" placeholder="Enter counted quantity" /></Field>
          <Field label="Variance evidence / reason"><textarea className={`${inputClass} h-24 py-3`} name="reason" required placeholder="Damage, expiry, short receipt, counting note..." /></Field>
          <ActionButton type="submit" tone="green"><ClipboardCheck className="size-4" />Submit count</ActionButton>
        </form>
      </Card>
      <Card title="Selected branch count sheet" description="Draft, pending and approved counts for the active audit location."><DataTable rows={branchAudits} empty="No counts recorded for this branch" columns={[{key:'itemId',label:'Item',render:a => a.itemType === 'ingredient' ? ingredients[a.itemId]?.name : products[a.itemId]?.name},{key:'itemType',label:'Type'},{key:'systemQty',label:'System'},{key:'physicalQty',label:'Physical'},{key:'variance',label:'Variance',render:a => (a.physicalQty - a.systemQty).toFixed(3)},{key:'varianceReason',label:'Reason'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'approved' ? 'green' : a.status === 'pending-approval' ? 'amber' : 'slate'}>{a.status}</Pill>}]} /></Card>
    </div>}

    {tab === 'Incoming Verification' && <Card title="Incoming dispatch verification" description="Match crate, batch and quantity before the branch accepts stock from the central kitchen."><DataTable rows={incoming} empty="No dispatch is waiting at this location" columns={[{key:'id',label:'Dispatch'},{key:'route',label:'Route'},{key:'driver',label:'Driver'},{key:'vehicleNo',label:'Vehicle'},{key:'crateIds',label:'Crates',render:d => d.crateIds.join(', ')},{key:'lines',label:'Items',render:d => d.lines.map(line => `${products[line.productId]?.name} x ${line.qty}`).join(', ')},{key:'status',label:'Verification',render:d => <div className="flex gap-2"><ActionButton tone="green" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:d.id })}><CheckCircle2 className="size-4" />Matches</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:d.id, shortageNote:'Variance recorded during independent stock audit' })}>Report variance</ActionButton></div>}]} /></Card>}

    {tab === 'Purchase Match' && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Metric icon={FileSearch} label="Purchase orders" value={String(state.purchaseOrders.length)} helper="Orders available for three-way matching" tone="blue" /><Metric icon={PackageCheck} label="Goods receipts" value={String(state.grns.length)} helper="Supplier invoice and received quantity" tone="green" /><Metric icon={AlertTriangle} label="Open receipts" value={String(state.purchaseOrders.filter(po => po.status !== 'received').length)} helper="POs not yet fully received" tone="amber" /></div><Card title="PO and receipt register"><DataTable rows={state.purchaseOrders} columns={[{key:'id',label:'PO'},{key:'supplierId',label:'Supplier',render:po => suppliers[po.supplierId]?.name},{key:'expectedDate',label:'Expected'},{key:'lines',label:'Ordered',render:po => po.lines.map(line => `${ingredients[line.ingredientId]?.name} ${line.qty}`).join(', ')},{key:'status',label:'Match status',render:po => <Pill tone={po.status === 'received' ? 'green' : po.status === 'partial-received' ? 'amber' : 'blue'}>{po.status}</Pill>}]} /></Card></div>}

    {tab === 'Waste & Movements' && <Card title="Controlled stock movements" description="Audit corrections, returns, waste and manual adjustments are separated from sales movement."><DataTable rows={movementRows} empty="No controlled movements have been posted" columns={[{key:'at',label:'Time',render:row => new Date(row.at).toLocaleString('en-IN')},{key:'branchId',label:'Branch',render:row => branches[row.branchId]?.name},{key:'itemId',label:'Item',render:row => row.itemType === 'ingredient' ? ingredients[row.itemId]?.name : products[row.itemId]?.name},{key:'qtyChange',label:'Quantity'},{key:'sourceType',label:'Movement'},{key:'reason',label:'Reason'},{key:'userName',label:'Recorded by'}]} /></Card>}

    {tab === 'History' && <div className="space-y-4"><Card title="Completed and pending audit history" action={<ExportButton onClick={() => downloadCsv('stock-audit-history.csv', state.stockAudits as unknown as Record<string, unknown>[])} />}><DataTable rows={state.stockAudits} columns={[{key:'createdAt',label:'Date',render:a => new Date(a.createdAt).toLocaleString('en-IN')},{key:'branchId',label:'Branch',render:a => branches[a.branchId]?.name},{key:'itemId',label:'Item',render:a => a.itemType === 'ingredient' ? ingredients[a.itemId]?.name : products[a.itemId]?.name},{key:'systemQty',label:'System'},{key:'physicalQty',label:'Physical'},{key:'varianceReason',label:'Reason'},{key:'status',label:'Status',render:a => <Pill tone={a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'red' : 'amber'}>{a.status}</Pill>},{key:'approvedBy',label:'Approved by',render:a => a.approvedBy ?? '-'}]} /></Card><Card title="Audit controls"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{['Every count retains system quantity','Auditor cannot silently overwrite stock','Variance requires a reason','Approval creates a ledger entry'].map((text,index) => <div key={text} className="flex gap-3 border border-slate-200 bg-slate-50 p-3"><History className={`mt-0.5 size-4 shrink-0 ${index === 1 ? 'text-rose-600' : 'text-emerald-600'}`} /><p className="text-xs font-semibold leading-5 text-slate-700">{text}</p></div>)}</div></Card></div>}
    {isExtensionTab('stock-audit', tab) && <OperationalWorkbench scope="stock-audit" module={tab} branchName={state.branches.find(branch => branch.id === state.selectedBranchId)?.name} />}
  </Shell>;
}

function AuditSignal({ label, value, tone }: { label:string; value:string; tone:'amber'|'blue'|'red'|'green' }) {
  const colors = { amber:'border-amber-400/30 bg-amber-400/10 text-amber-300', blue:'border-sky-400/30 bg-sky-400/10 text-sky-300', red:'border-rose-400/30 bg-rose-400/10 text-rose-300', green:'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' };
  return <div className={`border p-3 ${colors[tone]}`}><p className="text-[10px] font-bold text-slate-400">{label}</p><p className="mt-1 text-2xl font-extrabold">{value}</p></div>;
}
