import { useMemo, useState } from 'react';
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
import { ActionButton, BarChartPanel, Card, DataTable, Field, inputClass, Metric, MiniBar, Pill, Shell } from '../components/UI';
import { byId, money } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';

const tabs = ['Today', 'Orders', 'Inventory', 'Team', 'Cash & Closure', 'Approvals', 'Reports'] as const;
type Tab = typeof tabs[number];

export default function BranchInchargeDashboard() {
  const { state, dispatch } = useBakeryStore();
  const [tab, setTab] = useState<Tab>('Today');
  const [now] = useState(() => Date.now());
  const [closingCash, setClosingCash] = useState(0);
  const [creditStatus, setCreditStatus] = useState('');
  const products = byId(state.products);
  const users = byId(state.users);
  const currentBranch = state.branches.find(branch => branch.id === state.selectedBranchId);
  const branchBills = useMemo(() => state.bills.filter(bill => bill.branchId === state.selectedBranchId), [state.bills, state.selectedBranchId]);
  const branchOrders = useMemo(() => state.onlineOrders.filter(order => order.branchId === state.selectedBranchId), [state.onlineOrders, state.selectedBranchId]);
  const branchStock = useMemo(() => state.finishedStocks.filter(stock => stock.branchId === state.selectedBranchId), [state.finishedStocks, state.selectedBranchId]);
  const branchDispatches = useMemo(() => state.dispatches.filter(item => item.toBranchId === state.selectedBranchId), [state.dispatches, state.selectedBranchId]);
  const branchUsers = useMemo(() => state.users.filter(user => user.branchIds.includes(state.selectedBranchId)), [state.users, state.selectedBranchId]);
  const branchAudits = useMemo(() => state.stockAudits.filter(audit => audit.branchId === state.selectedBranchId && audit.status === 'pending-approval'), [state.stockAudits, state.selectedBranchId]);
  const hourlySales = useMemo(() => {
    const buckets = Array.from({ length: 12 }, (_, i) => ({ label: `${(9 + i) % 24}:00`, value: 0 }));
    branchBills.forEach(bill => {
      const hour = new Date(bill.createdAt).getHours();
      const index = hour - 9;
      if (index >= 0 && index < buckets.length) buckets[index].value += bill.grandTotal;
    });
    return buckets;
  }, [branchBills]);
  const openSession = state.counterSessions.find(session => session.branchId === state.selectedBranchId && session.status === 'open');
  const sales = branchBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const digitalSales = branchBills.filter(bill => bill.paymentMode !== 'cash').reduce((sum, bill) => sum + bill.grandTotal, 0);
  const newOrders = branchOrders.filter(order => order.status === 'new');
  const expiringStock = branchStock.filter(stock => new Date(stock.expiryAt).getTime() - now < 24 * 3600_000);
  const lowStock = branchStock.filter(stock => stock.qty <= 8);
  const pendingReceipts = branchDispatches.filter(item => item.status === 'dispatched');
  const presentTeam = state.attendance.filter(row => ['present', 'late', 'half-day'].includes(row.status) && branchUsers.some(user => user.id === row.userId));
  const expectedCashInDrawer = (openSession?.openingCash ?? 0) + branchBills.filter(bill => bill.paymentMode === 'cash').reduce((sum, bill) => sum + bill.grandTotal, 0);
  const target = 125000;
  const achievement = Math.min(100, Math.round((sales / target) * 100));

  const openCounter = () => dispatch({ type:'open-counter', branchId:state.selectedBranchId, cashier:'Branch Incharge', terminal:'POS-1', openingCash:2000 });

  return <Shell title="Branch Control" subtitle={`${currentBranch?.name ?? 'Selected branch'} daily operations, people, stock, orders, approvals and cash control`} tabs={tabs} activeTab={tab} onTabChange={t => setTab(t as Tab)}>
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-ink/10 bg-paper p-3 shadow-sm sm:flex-row sm:items-end sm:justify-between">
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

    {tab === 'Today' && <div className="space-y-4">
      <section className="grid gap-4 rounded-lg bg-ink p-5 text-white shadow-lg shadow-ink/10 lg:grid-cols-[1.1fr_.9fr] lg:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2"><Pill tone={openSession ? 'green' : 'amber'}>{openSession ? 'Branch trading' : 'Action required'}</Pill><span className="text-xs text-white/50">Today, {new Date(now).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span></div>
          <h3 className="mt-4 font-display text-2xl font-extrabold">Good morning, Branch Incharge</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-white/70">Your branch has {newOrders.length + pendingReceipts.length + expiringStock.length} items needing attention. Clear the urgent work before the next rush.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton tone="green" onClick={() => setTab('Orders')}><ShoppingBag className="size-4" />Review orders</ActionButton>
            <ActionButton tone="blue" onClick={() => setTab('Inventory')}><Boxes className="size-4" />Check stock</ActionButton>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-white/50">Daily sales target</p><p className="mt-1 font-ticket text-2xl font-extrabold">{money(sales)} <span className="text-sm font-medium text-white/50">/ {money(target)}</span></p></div><Target className="size-6 text-emerald-400" /></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width:`${Math.max(4, achievement)}%` }} /></div>
          <div className="mt-2 flex justify-between text-xs text-white/50"><span>{achievement}% achieved</span><span>{money(Math.max(0, target - sales))} remaining</span></div>
        </div>
      </section>

      <Card title="Hourly sales pattern" description="Real billed totals by hour for this branch today.">
        <BarChartPanel data={hourlySales} valueFormat={v => v ? money(v) : ''} tone="blue" />
      </Card>

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
            <div className="grid grid-cols-2 gap-3 border-t border-ink/8 pt-4">
              <div><p className="text-xs text-ink-600">Digital mix</p><p className="mt-1 text-lg font-bold text-ink">{sales ? Math.round((digitalSales / sales) * 100) : 0}%</p></div>
              <div><p className="text-xs text-ink-600">Refunds</p><p className="mt-1 text-lg font-bold text-ink">{money(state.refunds.reduce((sum, row) => sum + row.amount, 0))}</p></div>
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
      {!branchOrders.length && <div className="rounded-lg border border-dashed border-ink/20 bg-paper-dim px-4 py-10 text-center text-sm font-semibold text-ink-600">No orders yet for this branch.</div>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {branchOrders.map(order => <div key={order.id} className={`rounded-lg border bg-paper p-4 shadow-sm ${order.status === 'new' ? 'border-marigold ring-1 ring-marigold-100' : 'border-ink/10'}`}>
          <div className="flex items-center justify-between gap-2"><b className="font-display text-sm text-ink">{order.platform}</b><Pill tone={order.status === 'new' ? 'amber' : order.status === 'rejected' ? 'red' : order.status === 'reconciled' ? 'green' : 'blue'}>{order.status}</Pill></div>
          <p className="mt-1 font-ticket text-xs text-ink-600/70">{order.externalRef} · {new Date(order.receivedAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
          <p className="mt-2 text-sm font-semibold text-ink">{order.customerName}</p>
          <p className="mt-2 font-ticket text-lg font-bold text-ink">{money(order.amount)}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {order.status === 'new' && <>
              <ActionButton tone="green" onClick={() => dispatch({ type:'accept-online-order', orderId:order.id })}>Accept</ActionButton>
              <ActionButton tone="red" onClick={() => { const reason = window.prompt('Reason for rejecting this order?', 'Item unavailable'); if (reason) dispatch({ type:'reject-online-order', orderId:order.id, reason }); }}>Reject</ActionButton>
            </>}
            {order.status !== 'new' && order.status !== 'reconciled' && order.status !== 'rejected' && <ActionButton tone="blue" onClick={() => dispatch({ type:'reconcile-online-order', orderId:order.id, payoutReceived:order.payoutExpected })}><RefreshCw className="size-4" />Reconcile</ActionButton>}
          </div>
        </div>)}
      </div>
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
        <div className="space-y-3">{branchUsers.map(user => { const attendance = state.attendance.find(row => row.userId === user.id && row.date === new Date().toISOString().slice(0,10)); return <div key={user.id} className="flex items-center gap-3 rounded-lg border border-ink/10 p-3"><div className="grid size-10 shrink-0 place-items-center rounded-lg bg-paper-dim text-sm font-bold text-ink-700">{user.name.split(' ').map(part => part[0]).join('').slice(0,2)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink">{user.name}</p><p className="text-xs text-ink-600">{state.roles.find(role => role.id === user.roleId)?.name}</p></div>{attendance ? <Pill tone={attendance.status === 'present' ? 'green' : attendance.status === 'late' ? 'amber' : 'red'}>{attendance.status}</Pill> : <ActionButton tone="blue" onClick={() => dispatch({ type:'record-attendance', record:{ userId:user.id, date:new Date().toISOString().slice(0,10), shift:'General', checkIn: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }), status:'present' } })}>Check in</ActionButton>}</div>; })}</div>
      </Card>
      <Card title="Attendance and shifts"><DataTable rows={state.attendance.filter(row => branchUsers.some(user => user.id === row.userId))} empty="No attendance recorded for this branch" columns={[
        { key:'userId', label:'Team member', render:row => users[row.userId]?.name }, { key:'date', label:'Date' }, { key:'shift', label:'Shift' }, { key:'checkIn', label:'Check in', render:row => row.checkIn ?? '-' }, { key:'checkOut', label:'Check out', render:row => row.checkOut ?? '-' }, { key:'status', label:'Status', render:row => <Pill tone={row.status === 'present' ? 'green' : row.status === 'late' ? 'amber' : 'red'}>{row.status}</Pill> }, { key:'overtimeHours', label:'OT', render:row => `${row.overtimeHours ?? 0}h` }
      ]} /></Card>
    </div>}

    {tab === 'Cash & Closure' && <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Banknote} label="Cash" value={money(branchBills.filter(bill => bill.paymentMode === 'cash').reduce((sum, bill) => sum + bill.grandTotal, 0))} helper="Expected in drawer" tone="green" /><Metric icon={CreditCard} label="Card & UPI" value={money(branchBills.filter(bill => ['card','upi','paytm'].includes(bill.paymentMode)).reduce((sum, bill) => sum + bill.grandTotal, 0))} helper="Digital settlements" tone="blue" /><Metric icon={WalletCards} label="Credit" value={money(branchBills.filter(bill => bill.paymentMode === 'credit').reduce((sum, bill) => sum + bill.grandTotal, 0))} helper="Customer account sales" tone="amber" /><Metric icon={ReceiptText} label="Bills" value={String(branchBills.length)} helper="Completed at this branch" tone="slate" /></div>
      <Card title="Shift and daily closure" description="Count the drawer, compare expected collections and close the active session.">
        {openSession ? <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-paper-dim p-4"><p className="text-xs text-ink-600">Opened by</p><p className="mt-1 font-bold">{openSession.cashier}</p></div>
            <div className="rounded-lg bg-paper-dim p-4"><p className="text-xs text-ink-600">Opening cash</p><p className="mt-1 font-ticket font-bold">{money(openSession.openingCash)}</p></div>
            <div className="rounded-lg bg-paper-dim p-4"><p className="text-xs text-ink-600">Expected drawer</p><p className="mt-1 font-ticket font-bold">{money(expectedCashInDrawer)}</p></div>
          </div>
          <div className="flex items-end gap-3">
            <Field label="Counted cash in drawer"><input className={`${inputClass} font-ticket`} type="number" min="0" step="1" placeholder={String(expectedCashInDrawer)} value={closingCash || ''} onChange={event => setClosingCash(Number(event.target.value))} /></Field>
            <ActionButton tone="amber" onClick={() => dispatch({ type:'close-counter', sessionId:openSession.id, closingCash: closingCash || expectedCashInDrawer })}>Close and submit</ActionButton>
          </div>
          {closingCash > 0 && closingCash !== expectedCashInDrawer && <p className={`text-xs font-semibold lg:col-span-2 ${closingCash < expectedCashInDrawer ? 'text-oxblood' : 'text-tgreen'}`}>{closingCash < expectedCashInDrawer ? `Short by ${money(expectedCashInDrawer - closingCash)}` : `Excess of ${money(closingCash - expectedCashInDrawer)}`} versus expected drawer.</p>}
        </div> : <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 text-sm font-semibold text-tgreen"><CheckCircle2 className="size-5" />No active counter session. The branch is ready for the next opening.</div>}
      </Card>
    </div>}

    {tab === 'Approvals' && <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Stock variance approvals" description="Physical counts submitted by Stock Audit for this branch, waiting for your sign-off before they post to the ledger.">
        <DataTable rows={branchAudits} empty="No stock variances waiting for approval at this branch" columns={[
          { key:'itemId', label:'Item', render:a => a.itemType === 'ingredient' ? 'Raw material' : 'Finished good' },
          { key:'systemQty', label:'System' }, { key:'physicalQty', label:'Counted' },
          { key:'variance', label:'Variance', render:a => (a.physicalQty - a.systemQty).toFixed(2) },
          { key:'varianceReason', label:'Reason' },
          { key:'id', label:'Action', render:a => <ActionButton tone="green" onClick={() => dispatch({ type:'approve-stock-audit', auditId:a.id, approvedBy:'Branch Incharge' })}>Approve</ActionButton> }
        ]} />
      </Card>
      <Card title="Credit limit override" description="Raise or lower a customer's credit limit. This is logged with your name against the change.">
        <form className="grid gap-3" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const customerId = String(f.get('customerId') || '');
          const creditLimit = Number(f.get('creditLimit') || 0);
          if (!customerId) { setCreditStatus('Choose a customer first.'); return; }
          dispatch({ type:'update-customer-credit-limit', customerId, creditLimit, approvedBy:'Branch Incharge' });
          setCreditStatus(`${state.customers.find(c => c.id === customerId)?.name}'s credit limit set to ${money(creditLimit)}.`);
          form.reset();
        }}>
          <Field label="Customer"><select className={inputClass} name="customerId" required defaultValue="">
            <option value="" disabled>Select customer</option>
            {state.customers.map(c => <option key={c.id} value={c.id}>{c.name} (current: {money(c.creditLimit)})</option>)}
          </select></Field>
          <Field label="New credit limit (₹)"><input className={inputClass} name="creditLimit" type="number" min="0" step="100" required /></Field>
          <ActionButton tone="amber" className="w-fit"><ClipboardCheck className="size-4" />Update credit limit</ActionButton>
        </form>
        {creditStatus && <p className="mt-3 rounded-md bg-paper-dim px-3 py-2 text-xs font-semibold text-ink-600">{creditStatus}</p>}
        <div className="mt-5 border-t border-ink/8 pt-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-600/60">Also part of this role</p>
          <div className="space-y-2 text-xs text-ink-600">
            <p>• Refunds and voids — approved from the Branch billing screen's Returns tab</p>
            <p>• Goods receipt shortages — accepted or flagged from the Inventory tab here</p>
            <p>• Discounts above cashier limit — applied directly at POS billing</p>
          </div>
        </div>
      </Card>
    </div>}

    {tab === 'Reports' && <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3"><Metric icon={IndianRupee} label="Branch sales" value={money(sales)} helper="Current session and saved bills" tone="green" /><Metric icon={ArrowUpRight} label="Average bill" value={money(branchBills.length ? sales / branchBills.length : 0)} helper="Net sales per completed bill" tone="blue" /><Metric icon={Users} label="Customers served" value={String(branchBills.length)} helper="Completed transactions" tone="slate" /></div><Card title="Branch bill register"><DataTable rows={branchBills} empty="No bills completed yet" columns={[{ key:'billNo', label:'Bill' }, { key:'createdAt', label:'Time', render:bill => new Date(bill.createdAt).toLocaleString('en-IN') }, { key:'orderChannel', label:'Channel' }, { key:'paymentMode', label:'Payment' }, { key:'grandTotal', label:'Total', render:bill => money(bill.grandTotal) }, { key:'status', label:'Status', render:bill => <Pill tone={bill.status === 'paid' ? 'green' : bill.status === 'credit' ? 'amber' : 'red'}>{bill.status}</Pill> }]} /></Card></div>}
  </Shell>;
}

function AttentionRow({ icon: Icon, tone, title, detail, action, onClick }: { icon: typeof AlertTriangle; tone:'amber'|'blue'|'red'|'green'; title:string; detail:string; action:string; onClick:() => void }) {
  const colors = { amber:'bg-marigold-50 text-marigold-700', blue:'bg-sky-50 text-sky-700', red:'bg-red-50 text-oxblood', green:'bg-emerald-50 text-tgreen' };
  return <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"><div className={`grid size-10 shrink-0 place-items-center rounded-lg ${colors[tone]}`}><Icon className="size-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-ink">{title}</p><p className="mt-0.5 text-xs leading-5 text-ink-600">{detail}</p></div><button onClick={onClick} className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">{action}<ArrowUpRight className="size-4" /></button></div>;
}
