import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  IndianRupee,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  Store,
  Target,
  Truck,
  UserCheck,
  Users,
  WalletCards
} from 'lucide-react';
import { ActionButton, Card, DashboardTabs, DataTable, Field, inputClass, Metric, MiniBar, Pill, Shell } from '../components/UI';
import { byId, money } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import OperationalWorkbench from '../components/OperationalWorkbench';
import { isExtensionTab, roleExtensionTabs } from '../lib/roleExtensions';
import CompleteFeatureCenter from '../components/CompleteFeatureCenter';
import { InchargeIntegratedFeature, type InchargeIntegratedModule } from '../components/IntegratedFeatureModules';

const existingTabs = ['Today', 'Orders', 'Inventory', 'Team', 'Cash & Closure', 'Approvals', 'Reports', 'Outlet Management', 'Secondary Outlet Management', 'Primary Outlet Management', 'Secondary Outlet Management Full', 'Workforce & Payroll', 'Management Alerts', 'Complete Feature Centre'] as const;
const tabs = [...existingTabs, ...roleExtensionTabs['branch-incharge']] as const;
type Tab = typeof tabs[number];

const salesPulse = [38, 48, 34, 56, 72, 64, 84, 70, 92, 77, 66, 88];

export default function BranchInchargeDashboard() {
  const { state, dispatch } = useBakeryStore();
  const [searchParams] = useSearchParams();
  const appRole = useAuthStore.getState().currentUser?.role;
  const [tab, setTab] = useState<Tab>(() => searchParams.get('suite') === 'complete-feature-centre' ? 'Complete Feature Centre' : searchParams.get('suite') === 'secondary-branch-management' || appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : searchParams.get('suite') === 'branch-management' || appRole === 'branch_incharge_primary' ? 'Outlet Management' : 'Today');
  const [now] = useState(() => Date.now());
  const [closingCash, setClosingCash] = useState('');
  const products = byId(state.products);
  const users = byId(state.users);
  const currentBranch = state.branches.find(branch => branch.id === state.selectedBranchId);
  const branchBills = useMemo(() => state.bills.filter(bill => bill.branchId === state.selectedBranchId), [state.bills, state.selectedBranchId]);
  const branchOrders = useMemo(() => state.onlineOrders.filter(order => order.branchId === state.selectedBranchId), [state.onlineOrders, state.selectedBranchId]);
  const branchStock = useMemo(() => state.finishedStocks.filter(stock => stock.branchId === state.selectedBranchId), [state.finishedStocks, state.selectedBranchId]);
  const branchDispatches = useMemo(() => state.dispatches.filter(item => item.toBranchId === state.selectedBranchId), [state.dispatches, state.selectedBranchId]);
  const branchUsers = useMemo(() => state.users.filter(user => user.branchIds.includes(state.selectedBranchId)), [state.users, state.selectedBranchId]);
  const openSession = state.counterSessions.find(session => session.branchId === state.selectedBranchId && session.status === 'open');
  const sales = branchBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const digitalSales = branchBills.filter(bill => bill.paymentMode !== 'cash').reduce((sum, bill) => sum + bill.grandTotal, 0);
  const newOrders = branchOrders.filter(order => order.status === 'new');
  const expiringStock = branchStock.filter(stock => new Date(stock.expiryAt).getTime() - now < 24 * 3600_000);
  const lowStock = branchStock.filter(stock => stock.qty <= 8);
  const pendingReceipts = branchDispatches.filter(item => item.status === 'dispatched');
  const presentTeam = state.attendance.filter(row => ['present', 'late', 'half-day'].includes(row.status) && branchUsers.some(user => user.id === row.userId));
  const target = 125000;
  const achievement = Math.min(100, Math.round((sales / target) * 100));

  const openCounter = () => dispatch({ type:'open-counter', branchId:state.selectedBranchId, cashier:'Branch Incharge', terminal:'POS-1', openingCash:2000 });

  return <Shell title="Branch Control" subtitle={`${currentBranch?.name ?? 'Selected branch'} daily operations, people, stock, orders, approvals and cash control`}>
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <Field label="Managing branch">
        <select className={`${inputClass} min-w-[260px]`} value={state.selectedBranchId} onChange={event => dispatch({ type:'select-branch', branchId:event.target.value })}>
          {state.branches.filter(branch => ['retail', 'cloud-kitchen'].includes(branch.type)).map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
        </select>
      </Field>
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={openSession ? 'green' : 'amber'}>{openSession ? `${openSession.terminal} open` : 'counter closed'}</Pill>
        {openSession ? <ActionButton tone="amber" onClick={() => setTab('Cash & Closure')}><Clock3 className="size-4" />Close shift</ActionButton> : <ActionButton tone="green" onClick={openCounter}><Store className="size-4" />Open counter</ActionButton>}
      </div>
    </div>

    <DashboardTabs tabs={tabs.filter(t => appRole === 'branch_incharge_secondary' ? !(['Outlet Management','Primary Outlet Management'] as readonly string[]).includes(t) : appRole === 'branch_incharge_primary' ? !(['Secondary Outlet Management','Secondary Outlet Management Full'] as readonly string[]).includes(t) : true)} active={tab} setActive={setTab} />

    {tab === 'Today' && <div className="space-y-4">
      <section className="grid gap-4 rounded-lg bg-[#17202a] p-5 text-white shadow-lg shadow-slate-950/10 lg:grid-cols-[1.1fr_.9fr] lg:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Pill tone={openSession ? 'green' : 'amber'}>{openSession ? 'Branch trading' : 'Action required'}</Pill><span className="text-xs text-slate-400">Today, {new Date(now).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
          <h3 className="mt-4 text-2xl font-extrabold">Good morning, Branch Incharge</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-300">Your branch has {newOrders.length + pendingReceipts.length + expiringStock.length} items needing attention. Clear the urgent work before the next rush.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton tone="green" onClick={() => setTab('Orders')}><ShoppingBag className="size-4" />Review orders</ActionButton>
            <ActionButton tone="blue" onClick={() => setTab('Inventory')}><Boxes className="size-4" />Check stock</ActionButton>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-slate-400">Daily sales target</p><p className="mt-1 text-2xl font-extrabold">{money(sales)} <span className="text-sm font-medium text-slate-400">/ {money(target)}</span></p></div><Target className="size-6 text-emerald-400" /></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width:`${Math.max(4, achievement)}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs text-slate-400"><span>{achievement}% achieved</span><span>{money(Math.max(0, target - sales))} remaining</span></div>
          <div className="mt-5 flex h-16 items-end gap-1.5" aria-label="Hourly sales pulse">{salesPulse.map((height, index) => <div key={index} className="flex-1 rounded-sm bg-sky-400/70" style={{ height:`${height}%` }} />)}</div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={IndianRupee} label="Net sales" value={money(sales)} helper={`${branchBills.length} bills completed today`} tone="green" />
        <Metric icon={ShoppingBag} label="Online queue" value={String(newOrders.length)} helper={`${branchOrders.length} orders across all channels`} tone={newOrders.length ? 'amber' : 'blue'} />
        <Metric icon={Boxes} label="Stock alerts" value={String(lowStock.length + expiringStock.length)} helper={`${lowStock.length} low, ${expiringStock.length} expiring soon`} tone={lowStock.length ? 'red' : 'green'} />
        <Metric icon={UserCheck} label="Team present" value={`${presentTeam.length}/${branchUsers.length}`} helper="Attendance and shift coverage" tone="blue" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <Card title="Needs your attention" description="Priority work for this branch, ordered by operational impact.">
          <div className="divide-y divide-slate-100">
            <AttentionRow icon={ShoppingBag} tone="amber" title={`${newOrders.length} new online orders`} detail="Accept or reject before the preparation timer expires" action="Open queue" onClick={() => setTab('Orders')} />
            <AttentionRow icon={Truck} tone="blue" title={`${pendingReceipts.length} dispatches awaiting receipt`} detail="Verify crates, batch quantities and damage before accepting" action="Receive stock" onClick={() => setTab('Inventory')} />
            <AttentionRow icon={AlertTriangle} tone="red" title={`${expiringStock.length} batches expiring within 24 hours`} detail="Prioritize sale, transfer or record wastage" action="Review batches" onClick={() => setTab('Inventory')} />
            <AttentionRow icon={ClipboardCheck} tone="green" title="Daily checks ready" detail="Counter, cash drawer, hygiene and opening checklist" action="View checks" onClick={() => setTab('Approvals')} />
          </div>
        </Card>
        <Card title="Branch pulse" description="A quick read of service and control health.">
          <div className="space-y-5">
            <MiniBar label="Sales target" value={achievement} tone="green" />
            <MiniBar label="Order response" value={newOrders.length ? 64 : 96} tone={newOrders.length ? 'amber' : 'green'} />
            <MiniBar label="Stock availability" value={Math.max(10, 100 - lowStock.length * 12)} tone={lowStock.length ? 'amber' : 'green'} />
            <MiniBar label="Team coverage" value={branchUsers.length ? (presentTeam.length / branchUsers.length) * 100 : 0} tone="blue" />
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div><p className="text-xs text-slate-500">Digital mix</p><p className="mt-1 text-lg font-bold text-slate-900">{sales ? Math.round((digitalSales / sales) * 100) : 0}%</p></div>
              <div><p className="text-xs text-slate-500">Refunds</p><p className="mt-1 text-lg font-bold text-slate-900">{money(state.refunds.reduce((sum, row) => sum + row.amount, 0))}</p></div>
            </div>
          </div>
        </Card>
      </div>
    </div>}

    {tab === 'Orders' && <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={ShoppingBag} label="New" value={String(newOrders.length)} helper="Waiting for branch response" tone="amber" />
        <Metric icon={Clock3} label="In progress" value={String(branchOrders.filter(order => ['accepted','preparing'].includes(order.status)).length)} helper="Accepted and being prepared" tone="blue" />
        <Metric icon={CheckCircle2} label="Completed" value={String(branchOrders.filter(order => ['ready','picked-up','reconciled'].includes(order.status)).length)} helper="Ready, collected or reconciled" tone="green" />
      </div>
      <Card title="Unified order queue" description="Swiggy, Zomato, website, QR and phone orders in one branch view.">
        <DataTable rows={branchOrders} columns={[
          { key:'platform', label:'Channel' }, { key:'externalRef', label:'Order' }, { key:'customerName', label:'Customer' },
          { key:'receivedAt', label:'Received', render:order => new Date(order.receivedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) },
          { key:'amount', label:'Value', render:order => money(order.amount) },
          { key:'status', label:'Status', render:order => <Pill tone={order.status === 'new' ? 'amber' : order.status === 'rejected' ? 'red' : order.status === 'reconciled' ? 'green' : 'blue'}>{order.status}</Pill> },
          { key:'id', label:'Action', render:order => order.status === 'new' ? <div className="flex gap-2"><ActionButton tone="green" onClick={() => dispatch({ type:'accept-online-order', orderId:order.id })}>Accept</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type:'reject-online-order', orderId:order.id, reason:'Unavailable at branch' })}>Reject</ActionButton></div> : <ActionButton tone="blue" onClick={() => dispatch({ type:'reconcile-online-order', orderId:order.id, payoutReceived:order.payoutExpected })}><RefreshCw className="size-4" />Reconcile</ActionButton> }
        ]} />
      </Card>
    </div>}

    {tab === 'Inventory' && <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3"><Metric icon={PackageCheck} label="Batches on hand" value={String(branchStock.length)} helper="Finished stock at this branch" tone="green" /><Metric icon={AlertTriangle} label="Low stock" value={String(lowStock.length)} helper="At or below branch threshold" tone="red" /><Metric icon={Truck} label="Incoming" value={String(pendingReceipts.length)} helper="Dispatches waiting for receipt" tone="blue" /></div>
      {pendingReceipts.length > 0 && <Card title="Incoming from central kitchen" description="Confirm crates and quantities before stock is added to the branch."><DataTable rows={pendingReceipts} columns={[
        { key:'id', label:'Dispatch' }, { key:'route', label:'Route' }, { key:'driver', label:'Driver' }, { key:'vehicleNo', label:'Vehicle' },
        { key:'crateIds', label:'Crates', render:item => item.crateIds.join(', ') },
        { key:'lines', label:'Items', render:item => item.lines.map(line => `${products[line.productId]?.name} x ${line.qty}`).join(', ') },
        { key:'status', label:'Action', render:item => <div className="flex gap-2"><ActionButton tone="green" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:item.id })}>Receive all</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type:'receive-dispatch', dispatchId:item.id, shortageNote:'Shortage reported by Branch Incharge' })}>Report issue</ActionButton></div> }
      ]} /></Card>}
      <Card title="Branch stock and shelf life" description="Batch-level availability with expiry risk."><DataTable rows={branchStock} columns={[
        { key:'productId', label:'Product', render:stock => products[stock.productId]?.name }, { key:'qty', label:'Available' }, { key:'batchNo', label:'Batch' },
        { key:'producedAt', label:'Produced', render:stock => new Date(stock.producedAt).toLocaleDateString('en-IN') },
        { key:'expiryAt', label:'Expires', render:stock => new Date(stock.expiryAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) },
        { key:'id', label:'Health', render:stock => <Pill tone={new Date(stock.expiryAt).getTime() - now < 24 * 3600_000 ? 'red' : stock.qty <= 8 ? 'amber' : 'green'}>{new Date(stock.expiryAt).getTime() - now < 24 * 3600_000 ? 'expiry risk' : stock.qty <= 8 ? 'low' : 'healthy'}</Pill> }
      ]} /></Card>
    </div>}

    {tab === 'Team' && <div className="grid gap-4 xl:grid-cols-[.7fr_1.3fr]">
      <Card title="Shift coverage" description="People assigned to the selected branch.">
        <div className="space-y-3">{branchUsers.map(user => { const attendance = state.attendance.find(row => row.userId === user.id); return <div key={user.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">{user.name.split(' ').map(part => part[0]).join('').slice(0,2)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{user.name}</p><p className="text-xs text-slate-500">{state.roles.find(role => role.id === user.roleId)?.name}</p></div><Pill tone={!attendance ? 'slate' : attendance.status === 'present' ? 'green' : attendance.status === 'late' ? 'amber' : 'red'}>{attendance?.status ?? 'not marked'}</Pill></div>; })}</div>
      </Card>
      <Card title="Attendance and shifts"><DataTable rows={state.attendance.filter(row => branchUsers.some(user => user.id === row.userId))} empty="No attendance recorded for this branch" columns={[
        { key:'userId', label:'Team member', render:row => users[row.userId]?.name }, { key:'date', label:'Date' }, { key:'shift', label:'Shift' }, { key:'checkIn', label:'Check in', render:row => row.checkIn ?? '-' }, { key:'checkOut', label:'Check out', render:row => row.checkOut ?? '-' }, { key:'status', label:'Status', render:row => <Pill tone={row.status === 'present' ? 'green' : row.status === 'late' ? 'amber' : 'red'}>{row.status}</Pill> }, { key:'overtimeHours', label:'OT', render:row => `${row.overtimeHours ?? 0}h` }
      ]} /></Card>
    </div>}

    {tab === 'Cash & Closure' && <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Banknote} label="Cash" value={money(branchBills.filter(bill => bill.paymentMode === 'cash').reduce((sum, bill) => sum + bill.grandTotal, 0))} helper="Expected in drawer" tone="green" /><Metric icon={CreditCard} label="Card & UPI" value={money(branchBills.filter(bill => ['card','upi','paytm'].includes(bill.paymentMode)).reduce((sum, bill) => sum + bill.grandTotal, 0))} helper="Digital settlements" tone="blue" /><Metric icon={WalletCards} label="Credit" value={money(branchBills.filter(bill => bill.paymentMode === 'credit').reduce((sum, bill) => sum + bill.grandTotal, 0))} helper="Customer account sales" tone="amber" /><Metric icon={ReceiptText} label="Bills" value={String(branchBills.length)} helper="Completed at this branch" tone="slate" /></div>
      <Card title="Shift and daily closure" description="Count the drawer, compare expected collections and close the active session.">
        {openSession ? <div className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-end"><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Opened by</p><p className="mt-1 font-bold">{openSession.cashier}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Opening cash</p><p className="mt-1 font-bold">{money(openSession.openingCash)}</p></div><div className="rounded-lg bg-slate-50 p-4"><p className="text-xs text-slate-500">Expected drawer</p><p className="mt-1 font-bold">{money(openSession.openingCash + branchBills.filter(bill => bill.paymentMode === 'cash').reduce((sum, bill) => sum + bill.grandTotal, 0))}</p></div></div><div className="space-y-2"><Field label="Counted closing cash"><input className={inputClass} type="number" min="0" value={closingCash} onChange={event => setClosingCash(event.target.value)} placeholder="Enter drawer count" /></Field><ActionButton className="w-full" tone="amber" disabled={!closingCash} onClick={() => { dispatch({ type:'close-counter', sessionId:openSession.id, closingCash:Number(closingCash) }); setClosingCash(''); }}>Save and close shift</ActionButton></div></div> : <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"><CheckCircle2 className="size-5" />No active counter session. The branch is ready for the next opening.</div>}
      </Card>
    </div>}

    {tab === 'Approvals' && <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Branch approvals" description="Manager-level actions included in the Branch Incharge role."><div className="space-y-3">{[
        ['Refunds and voids','Approve genuine customer corrections with audit trail'],['Stock variances','Review physical count differences before posting'],['Credit overrides','Approve credit limits and overdue exceptions'],['Discount overrides','Authorize discounts above cashier limits'],['Shift closure','Sign off cash variance and daily closure'],['Goods receipt issues','Accept shortages, damage and crate discrepancies']
      ].map(([title, detail], index) => <div key={title} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"><div className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-md ${index < 2 ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}><ClipboardCheck className="size-4" /></div><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{detail}</p></div></div>)}</div></Card>
      <Card title="Role access summary" description="Branch Incharge is restricted to assigned branches and operational actions."><div className="space-y-3">{Object.entries(state.roles.find(role => role.id === 'branch-incharge')?.permissions ?? {}).map(([module, actions]) => <div key={module} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><span className="text-sm font-semibold text-slate-700">{module.replaceAll('-', ' ')}</span><span className="text-right text-xs text-slate-500">{actions.join(', ')}</span></div>)}</div></Card>
    </div>}

    {tab === 'Reports' && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Metric icon={IndianRupee} label="Branch sales" value={money(sales)} helper="Current session and saved bills" tone="green" /><Metric icon={ArrowUpRight} label="Average bill" value={money(branchBills.length ? sales / branchBills.length : 0)} helper="Net sales per completed bill" tone="blue" /><Metric icon={Users} label="Customers served" value={String(branchBills.length)} helper="Completed transactions" tone="slate" /></div><Card title="Branch bill register"><DataTable rows={branchBills} empty="No bills completed yet" columns={[{ key:'billNo', label:'Bill' }, { key:'createdAt', label:'Time', render:bill => new Date(bill.createdAt).toLocaleString('en-IN') }, { key:'orderChannel', label:'Channel' }, { key:'paymentMode', label:'Payment' }, { key:'grandTotal', label:'Total', render:bill => money(bill.grandTotal) }, { key:'status', label:'Status', render:bill => <Pill tone={bill.status === 'paid' ? 'green' : bill.status === 'credit' ? 'amber' : 'red'}>{bill.status}</Pill> }]} /></Card></div>}

    {tab === 'Complete Feature Centre' && <CompleteFeatureCenter dashboard="branch-incharge" initialModule={searchParams.get('module') ?? undefined} />}
    {tab === 'Outlet Management' && <InchargeIntegratedFeature module="Primary Outlet Management" />}
    {tab === 'Secondary Outlet Management' && <InchargeIntegratedFeature module="Secondary Outlet Management" />}
    {tab === 'Primary Outlet Management' && <InchargeIntegratedFeature module="Primary Outlet Management" />}
    {tab === 'Secondary Outlet Management Full' && <InchargeIntegratedFeature module="Secondary Outlet Management" />}
    {(['Workforce & Payroll','Management Alerts'] as readonly string[]).includes(tab) && <InchargeIntegratedFeature module={tab as InchargeIntegratedModule} />}
    {tab === 'Sales & Returns' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="sales" />}
    {tab === 'Stock Synced' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="stock-synced" />}
    {tab === 'Update Stock' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="update-stock" />}
    {tab === 'Suppliers' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="suppliers" />}
    {tab === 'Expenses' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="expenses" />}
    {tab === 'Complaints' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="complaints" />}
    {tab === 'Waste Logs' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="waste" />}
    {tab === 'Quotations' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="quotations" />}
    {tab === 'Credit Control' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="credit" />}
    {tab === 'Purchase Invoices' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="invoices" />}
    {tab === 'Purchase Returns' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="purchase-returns" />}
    {tab === 'Supplier Payments' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="payments" />}
    {tab === 'Bank Deposits' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="bank" />}
    {tab === 'Current Cash' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="current-cash" />}
    {tab === 'Salesperson Management' && <InchargeIntegratedFeature module="Primary Outlet Management" internalTab="salespersons" />}
    {tab === 'Cashier Reports' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="cashier-report" />}
    {tab === 'Daily Closure' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="closure" />}
    {tab === 'Stock Audit' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="audit-stock" />}
    {tab === 'History' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="history" />}
    {tab === 'Notifications' && <InchargeIntegratedFeature module={appRole === 'branch_incharge_secondary' ? 'Secondary Outlet Management' : 'Primary Outlet Management'} internalTab="notifications" />}
    {!(['Workforce & Payroll','Management Alerts','Sales & Returns','Stock Synced','Update Stock','Suppliers','Expenses','Complaints','Waste Logs','Quotations','Credit Control','Purchase Invoices','Purchase Returns','Supplier Payments','Bank Deposits','Current Cash','Salesperson Management','Cashier Reports','Daily Closure','Stock Audit','History','Notifications'] as readonly string[]).includes(tab) && isExtensionTab('branch-incharge', tab) && <OperationalWorkbench scope="branch-incharge" module={tab} branchName={currentBranch?.name} />}
  </Shell>;
}

function AttentionRow({ icon: Icon, tone, title, detail, action, onClick }: { icon: typeof AlertTriangle; tone:'amber'|'blue'|'red'|'green'; title:string; detail:string; action:string; onClick:() => void }) {
  const colors = { amber:'bg-amber-50 text-amber-700', blue:'bg-sky-50 text-sky-700', red:'bg-rose-50 text-rose-700', green:'bg-emerald-50 text-emerald-700' };
  return <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><div className={`grid size-10 shrink-0 place-items-center rounded-lg ${colors[tone]}`}><Icon className="size-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-0.5 text-xs leading-5 text-slate-500">{detail}</p></div><button onClick={onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">{action}<ArrowUpRight className="size-4" /></button></div>;
}
