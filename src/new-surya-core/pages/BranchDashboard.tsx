import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Banknote,
  Bell,
  Boxes,
  CalendarClock,
  CakeSlice,
  CheckCircle2,
  Clock3,
  Cookie,
  CreditCard,
  Minus,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  ScanBarcode,
  Search,
  ShoppingCart,
  Smartphone,
  SplitSquareHorizontal,
  Store,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
  XCircle,
  type LucideIcon
} from 'lucide-react';
import { ActionButton, Card, DashboardTabs, DataTable, DebugPanel, Field, inputClass, Metric, Pill, Shell } from '../components/UI';
import { billTotals, byId, money } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { Bill, BranchPrice, PaymentMode, Product } from '../lib/types';
import OperationalWorkbench from '../components/OperationalWorkbench';
import { isExtensionTab, roleExtensionTabs } from '../lib/roleExtensions';
import CompleteFeatureCenter from '../components/CompleteFeatureCenter';
import { BranchIntegratedFeature, type BranchIntegratedModule } from '../components/IntegratedFeatureModules';

const existingTabs = ['Quick Billing', 'POS Billing', 'Order Taking', 'Complete Retail Billing', 'Complete Bill History', 'Cashier Daily Closure', 'Counter', 'Online Orders', 'Advance Orders', 'Credit', 'Goods Receipt', 'Stock', 'Returns', 'Daily Closure', 'Reports', 'Devices', 'Debug', 'Retail Billing & Counter', 'Stock-Aware Retail Operations', 'Wholesale & Credit', 'Primary Outlet Operations', 'Secondary Outlet Operations', 'Wholesale & Credit Operations', 'Complete Feature Centre'] as const;
const tabs = [...existingTabs, ...roleExtensionTabs.branch] as const;
type Tab = typeof tabs[number];

const paymentButtons: { mode: PaymentMode; label: string; icon: LucideIcon }[] = [
  { mode: 'cash', label: 'Cash', icon: Banknote },
  { mode: 'card', label: 'Card', icon: CreditCard },
  { mode: 'upi', label: 'UPI', icon: Smartphone },
  { mode: 'paytm', label: 'Paytm', icon: Smartphone },
  { mode: 'split', label: 'Split', icon: SplitSquareHorizontal },
  { mode: 'credit', label: 'Credit', icon: WalletCards },
  { mode: 'online', label: 'Online', icon: ShoppingCart },
  { mode: 'wallet', label: 'Wallet', icon: WalletCards }
];

const orderChannels: Bill['orderChannel'][] = ['walk-in', 'qr', 'phone', 'swiggy', 'zomato', 'website', 'wholesale'];

function formatQty(qty: number) {
  if (Number.isInteger(qty)) return String(qty);
  return qty.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function productStep(product?: Product) {
  return product?.sellByWeight ? 0.25 : 1;
}

function productVisual(product: Product) {
  const value = `${product.category} ${product.name}`.toLowerCase();
  if (value.includes('cake')) return { Icon: CakeSlice, style: 'bg-rose-50 text-rose-600' };
  if (value.includes('savour') || value.includes('snack') || value.includes('mixture')) return { Icon: Cookie, style: 'bg-amber-50 text-amber-700' };
  return { Icon: Sparkles, style: 'bg-emerald-50 text-emerald-700' };
}

export default function BranchBillingDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [searchParams] = useSearchParams();
  const appRole = useAuthStore.getState().currentUser?.role;
  const [tab, setTab] = useState<Tab>(() => searchParams.get('suite') === 'complete-feature-centre' ? 'Complete Feature Centre' : appRole === 'order_taker' ? 'Order Taking' : searchParams.get('suite') === 'secondary-branch-operations' || appRole === 'branch_secondary' ? 'Stock-Aware Retail Operations' : searchParams.get('suite') === 'wholesale-credit-operations' || appRole === 'branch_wholesale' ? 'Wholesale & Credit' : searchParams.get('suite') === 'branch-operations' || appRole === 'branch_primary' ? 'Quick Billing' : searchParams.get('suite') === 'retail-billing-counter' || appRole === 'billing' ? 'Quick Billing' : 'Quick Billing');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showCounterSetup, setShowCounterSetup] = useState(false);
  const [showDeliveryAlert, setShowDeliveryAlert] = useState(true);
  const [counterForm, setCounterForm] = useState({ cashier: 'Branch Cashier', terminal: 'POS-1', openingCash: '2000', closingCash: '' });
  const [advanceForm, setAdvanceForm] = useState(() => ({
    customerId: state.customers[0]?.id ?? '',
    productId: state.products[0]?.id ?? '',
    qty: '1',
    deliveryAt: new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 16),
    advancePaid: '0',
    designNotes: ''
  }));
  const searchRef = useRef<HTMLInputElement>(null);
  const products = byId(state.products);
  const branches = byId(state.branches);
  const customers = byId(state.customers);
  const currentBranch = branches[state.selectedBranchId];
  const cartTotals = billTotals(state.cart, state.products);
  const onlineChannel = state.orderChannel === 'swiggy' || state.orderChannel === 'zomato' || state.orderChannel === 'website';

  const priceBook = useMemo(() => state.branchPrices
    .filter(price => price.branchId === state.selectedBranchId)
    .reduce<Record<string, BranchPrice>>((book, price) => {
      book[price.productId] = price;
      return book;
    }, {}), [state.branchPrices, state.selectedBranchId]);

  const sellingPrice = (product: Product) => {
    const price = priceBook[product.id];
    if (!price) return product.price;
    if (state.orderChannel === 'swiggy') return price.swiggyPrice;
    if (state.orderChannel === 'zomato') return price.zomatoPrice;
    if (state.orderChannel === 'website') return price.deliveryPrice;
    if (state.orderChannel === 'wholesale') return price.wholesalePrice;
    return state.orderChannel === 'walk-in' ? price.dineInPrice : price.takeawayPrice;
  };

  const selectedStock = useMemo(() => state.finishedStocks.filter(s => s.branchId === state.selectedBranchId), [state.finishedStocks, state.selectedBranchId]);
  const stockByProduct = useMemo(() => selectedStock.reduce<Record<string, number>>((acc, stock) => {
    acc[stock.productId] = (acc[stock.productId] ?? 0) + stock.qty;
    return acc;
  }, {}), [selectedStock]);

  const channelProducts = useMemo(() => state.products.filter(product => product.active && (onlineChannel ? product.allowOnline : product.allowInStore !== false)), [onlineChannel, state.products]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(channelProducts.map(product => product.category)))], [channelProducts]);
  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return channelProducts
      .filter(product => category === 'All' || product.category === category)
      .filter(product => !term || product.name.toLowerCase().includes(term) || product.barcode.includes(term) || product.category.toLowerCase().includes(term))
      .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)) || (stockByProduct[b.id] ?? 0) - (stockByProduct[a.id] ?? 0) || a.name.localeCompare(b.name))
      .slice(0, 24);
  }, [category, channelProducts, search, stockByProduct]);

  const branchOnlineOrders = useMemo(() => state.onlineOrders.filter(order => order.branchId === state.selectedBranchId), [state.onlineOrders, state.selectedBranchId]);
  const branchBills = useMemo(() => state.bills.filter(bill => bill.branchId === state.selectedBranchId), [state.bills, state.selectedBranchId]);
  const deliveryCutoff = useMemo(() => {
    const cutoff = new Date();
    cutoff.setHours(23, 59, 59, 999);
    return cutoff.getTime();
  }, []);
  const dueDeliveries = useMemo(() => state.advanceOrders
    .filter(order => order.branchId === state.selectedBranchId)
    .filter(order => !['delivered', 'cancelled'].includes(order.status))
    .filter(order => new Date(order.deliveryAt).getTime() <= deliveryCutoff)
    .sort((a, b) => new Date(a.deliveryAt).getTime() - new Date(b.deliveryAt).getTime()), [state.advanceOrders, state.selectedBranchId, deliveryCutoff]);
  const stockRiskCount = useMemo(() => state.products.filter(product => {
    const qty = stockByProduct[product.id] ?? 0;
    return product.active && qty > 0 && qty <= 8;
  }).length, [state.products, stockByProduct]);
  const cashChange = Math.max(0, state.cashReceived - cartTotals.grandTotal);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'F4') { e.preventDefault(); if (state.cart.length) dispatch({ type: 'hold-cart', name: `Held ${new Date().toLocaleTimeString()}` }); }
      if (e.key === 'F6') { e.preventDefault(); setShowCounterSetup(true); }
      if (e.key === 'F7') { e.preventDefault(); dispatch({ type: 'set-payment-mode', mode: 'cash' }); }
      if (e.key === 'F8') { e.preventDefault(); dispatch({ type: 'set-payment-mode', mode: 'upi' }); }
      if (e.key === 'F9') { e.preventDefault(); dispatch({ type: 'checkout', paidAmount: cartTotals.grandTotal, customerId: state.customers[0]?.id }); }
      if (e.ctrlKey && e.key === 'Backspace') { e.preventDefault(); dispatch({ type: 'clear-cart' }); }
      if (e.altKey && e.key.toLowerCase() === 'r') { e.preventDefault(); const held = state.heldCarts[0]; if (held) dispatch({ type: 'recall-cart', heldCartId: held.id }); }
      if (e.altKey && e.key.toLowerCase() === 'd') { e.preventDefault(); const bill = state.bills[0]; if (bill) dispatch({ type: 'duplicate-print', billId: bill.id }); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cartTotals.grandTotal, dispatch, state.bills, state.cart, state.customers, state.heldCarts, state.selectedBranchId]);

  const addProduct = (product: Product) => dispatch({ type: 'add-to-cart', productId: product.id, qty: productStep(product), price: sellingPrice(product) });
  const openCounter = () => setShowCounterSetup(true);
  const confirmOpenCounter = () => {
    dispatch({ type: 'open-counter', branchId: state.selectedBranchId, cashier: counterForm.cashier.trim() || 'Branch Cashier', terminal: counterForm.terminal.trim() || 'POS-1', openingCash: Number(counterForm.openingCash || 0) });
    setShowCounterSetup(false);
  };
  const closeCounter = () => {
    if (!metrics.openSession) return;
    dispatch({ type: 'close-counter', sessionId: metrics.openSession.id, closingCash: Number(counterForm.closingCash || 0) });
    setCounterForm(current => ({ ...current, closingCash: '' }));
  };
  const checkout = () => {
    if (!metrics.openSession) {
      openCounter();
      return;
    }
    if (!state.cart.length) return;
    dispatch({
      type: 'checkout',
      paidAmount: state.selectedPaymentMode === 'cash' ? (state.cashReceived || cartTotals.grandTotal) : cartTotals.grandTotal,
      customerId: state.customers[0]?.id
    });
  };

  return <Shell title="Branch POS" subtitle={`${currentBranch?.name ?? 'Selected branch'} counter billing, online orders, stock receiving, returns and closure`}>
    {showCounterSetup && !metrics.openSession && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-label="Open counter" className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="bg-[#171a1d] px-5 py-4 text-white"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center bg-emerald-400 text-emerald-950"><Store className="size-5" /></div><div><h2 className="text-lg font-bold">Open billing counter</h2><p className="text-xs text-slate-400">Confirm cashier, terminal and physical opening cash.</p></div></div></div>
        <div className="grid gap-3 p-5">
          <Field label="Cashier name"><input autoFocus className={inputClass} value={counterForm.cashier} onChange={event => setCounterForm(current => ({ ...current, cashier: event.target.value }))} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Terminal"><input className={inputClass} value={counterForm.terminal} onChange={event => setCounterForm(current => ({ ...current, terminal: event.target.value }))} /></Field><Field label="Opening cash"><input className={inputClass} min="0" type="number" value={counterForm.openingCash} onChange={event => setCounterForm(current => ({ ...current, openingCash: event.target.value }))} /></Field></div>
          <div className="mt-2 flex justify-end gap-2"><button className="min-h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-600" onClick={() => setShowCounterSetup(false)}>Cancel</button><ActionButton tone="green" onClick={confirmOpenCounter}><Store className="size-4" />Open and start billing</ActionButton></div>
        </div>
      </section>
    </div>}

    {showDeliveryAlert && dueDeliveries.length > 0 && <div className="fixed inset-0 z-[90] grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-label="Deliveries due today" className="w-full max-w-2xl overflow-hidden rounded-lg border border-amber-200 bg-white shadow-2xl">
        <div className="flex items-start gap-3 bg-amber-50 px-5 py-4"><div className="grid size-11 shrink-0 place-items-center bg-amber-400 text-amber-950"><CalendarClock className="size-5" /></div><div className="flex-1"><h2 className="text-lg font-extrabold text-slate-950">{dueDeliveries.length} delivery {dueDeliveries.length === 1 ? 'is' : 'are'} due</h2><p className="mt-1 text-sm text-slate-600">Review today and overdue advance orders before starting counter work.</p></div><button aria-label="Close delivery alert" className="grid size-9 place-items-center rounded-md text-slate-500 hover:bg-white" onClick={() => setShowDeliveryAlert(false)}><XCircle className="size-5" /></button></div>
        <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">{dueDeliveries.map(order => <div key={order.id} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><b className="text-sm text-slate-950">{customers[order.customerId]?.name}</b><Pill tone={new Date(order.deliveryAt).toDateString() === new Date().toDateString() ? 'amber' : 'red'}>{new Date(order.deliveryAt).toDateString() === new Date().toDateString() ? 'today' : 'overdue'}</Pill></div><p className="mt-1 text-sm text-slate-600">{products[order.productId]?.name} x {order.qty} - {new Date(order.deliveryAt).toLocaleString('en-IN')}</p><p className="mt-1 text-xs text-slate-500">Balance {money(order.balance)} - {order.designNotes}</p></div><ActionButton tone="green" onClick={() => dispatch({ type:'advance-status', orderId:order.id, status:'ready' })}>Mark ready</ActionButton></div>)}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4"><button className="min-h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600" onClick={() => setShowDeliveryAlert(false)}>Remind me later</button><ActionButton tone="blue" onClick={() => { setTab('Advance Orders'); setShowDeliveryAlert(false); }}><Bell className="size-4" />Open advance orders</ActionButton></div>
      </section>
    </div>}

    {dueDeliveries.length > 0 && <button onClick={() => setShowDeliveryAlert(true)} className="mb-4 flex w-full items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left shadow-sm"><span className="flex items-center gap-3"><Bell className="size-5 text-amber-700" /><span><b className="block text-sm text-amber-950">{dueDeliveries.length} advance deliveries need attention</b><span className="text-xs text-amber-700">Open the delivery list and update preparation status.</span></span></span><span className="text-xs font-bold text-amber-800">Review</span></button>}
    {/* Single-branch launch: this outlet is retail-only, so hide tab buttons meant for
        wholesale/secondary-outlet operating modes that don't apply here. The underlying
        content still renders if reached directly (e.g. via URL suite param), this only
        declutters the visible tab strip. */}
    <DashboardTabs tabs={tabs.filter(t => !(['Wholesale & Credit', 'Wholesale & Credit Operations', 'Secondary Outlet Operations', 'Stock-Aware Retail Operations'] as readonly string[]).includes(t))} active={tab} setActive={setTab} />

    {tab === 'Quick Billing' && <BranchIntegratedFeature module="Complete Retail Billing" />}

    {tab === 'POS Billing' && <div className="space-y-4">
      <section className="flex flex-col gap-4 border border-slate-800 bg-[#111b25] px-4 py-4 text-white shadow-lg shadow-slate-950/10 lg:flex-row lg:items-center lg:px-5">
        <div className="flex min-w-0 items-center gap-3 lg:w-[290px]">
          <div className={`grid size-11 shrink-0 place-items-center ${metrics.openSession ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}><Store className="size-5" /></div>
          <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{currentBranch?.name}</p><p className="text-xs text-slate-400">{metrics.openSession ? `${metrics.openSession.terminal} is ready for service` : 'Open the counter to begin billing'}</p></div>
        </div>
        <div className="grid flex-1 grid-cols-3 divide-x divide-white/10 border border-white/10 bg-white/5 py-2.5">
          <div className="px-3"><p className="text-[10px] font-semibold text-slate-400">CURRENT BILL</p><p className="mt-0.5 text-lg font-extrabold text-white">{money(cartTotals.grandTotal)}</p></div>
          <div className="px-3"><p className="text-[10px] font-semibold text-slate-400">ONLINE WAITING</p><p className="mt-0.5 text-lg font-extrabold text-sky-300">{branchOnlineOrders.filter(order => order.status === 'new').length}</p></div>
          <div className="px-3"><p className="text-[10px] font-semibold text-slate-400">STOCK ALERTS</p><p className={`mt-0.5 text-lg font-extrabold ${stockRiskCount ? 'text-amber-300' : 'text-emerald-300'}`}>{stockRiskCount}</p></div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><span className={`size-2 ${metrics.openSession ? 'bg-emerald-400' : 'bg-amber-300'}`} />{metrics.openSession ? 'Live counter' : 'Setup required'}</div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="min-w-0 space-y-4">
          <div className="border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <Field label="Selling from">
                <select className={inputClass} value={state.selectedBranchId} onChange={event => dispatch({ type:'select-branch', branchId:event.target.value })}>{state.branches.filter(branch => branch.type !== 'central-kitchen').map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
              </Field>
              <Field label="Find a product">
                <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input ref={searchRef} className={`${inputClass} pl-10 pr-12`} placeholder="Search item, category or scan barcode" value={search} onChange={event => setSearch(event.target.value)} /><ScanBarcode className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" /></div>
              </Field>
            </div>
            <div className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 whitespace-nowrap rounded-md border px-3 text-xs font-semibold transition ${category === item ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>{item}</button>)}</div>
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"><span className="mr-1 shrink-0 text-xs font-semibold text-slate-500">Order type</span>{orderChannels.map(channel => <button key={channel} onClick={() => { setCategory('All'); dispatch({ type:'set-order-channel', channel }); }} className={`min-h-8 shrink-0 rounded-md px-2.5 text-xs font-semibold capitalize transition ${state.orderChannel === channel ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'text-slate-500 hover:bg-slate-100'}`}>{channel.replace('-', ' ')}</button>)}<span className="ml-auto shrink-0 text-[11px] font-semibold text-slate-400">{channelProducts.length} sellable SKUs</span></div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleProducts.map(product => {
              const available = stockByProduct[product.id] ?? 0;
              const disabled = available <= 0;
              const visual = productVisual(product);
              return <button key={product.id} disabled={disabled} onClick={() => addProduct(product)} className={`group relative flex min-h-[190px] flex-col overflow-hidden border bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(15,23,42,.04)] transition ${disabled ? 'cursor-not-allowed border-slate-200 opacity-55' : 'border-slate-200 hover:-translate-y-0.5 hover:border-[#b8872d] hover:shadow-lg hover:shadow-slate-900/8'}`}>
                <span className={`absolute inset-x-0 top-0 h-1 ${disabled ? 'bg-slate-200' : available <= 8 ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                <div className="flex items-start justify-between gap-2">{product.image ? <img src={product.image} alt="" className="h-14 w-16 rounded-md object-cover" /> : <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${visual.style}`}><visual.Icon className="size-5" /></div>}<Pill tone={disabled ? 'red' : available <= 8 ? 'amber' : 'green'}>{disabled ? 'sold out' : `${formatQty(available)} in stock`}</Pill></div>
                <h3 className="mt-3 min-h-10 text-sm font-bold leading-5 text-slate-950">{product.name}</h3>
                <p className="mt-1 text-[11px] text-slate-500">{product.category}</p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-3"><div><p className="text-lg font-extrabold text-slate-950">{money(sellingPrice(product))}</p><p className="text-[11px] font-medium text-slate-400">{onlineChannel ? 'Online Menu 2025' : 'POS Menu 2025'}</p></div><span className={`grid size-9 place-items-center ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-[#b8872d] text-white group-hover:bg-[#91671d]'}`}><Plus className="size-4" /></span></div>
              </button>;
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Held bills</h3><Clock3 className="size-4 text-slate-400" /></div><div className="space-y-2">{state.heldCarts.slice(0,2).map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-2.5"><span className="min-w-0 truncate text-sm font-medium text-slate-700">{item.name} - {item.lines.length} items</span><button onClick={() => dispatch({ type:'recall-cart', heldCartId:item.id })} className="text-xs font-semibold text-sky-700">Recall</button></div>)}{!state.heldCarts.length && <p className="text-sm text-slate-400">No held bills</p>}</div></div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900">Recent bills</h3><Printer className="size-4 text-slate-400" /></div><div className="space-y-2">{branchBills.slice(0,2).map(bill => <div key={bill.id} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 p-2.5"><span className="text-sm font-medium text-slate-700">{bill.billNo}</span><b className="text-sm text-slate-900">{money(bill.grandTotal)}</b></div>)}{!branchBills.length && <p className="text-sm text-slate-400">No completed bills yet</p>}</div></div>
          </div>
        </section>

        <aside className="min-w-0 xl:sticky xl:top-[84px]">
          <section className="overflow-hidden border border-slate-800 bg-white shadow-xl shadow-slate-900/10">
            <div className="flex items-center justify-between bg-[#111b25] px-4 py-3.5 text-white"><div className="flex items-center gap-3"><div className="grid size-10 place-items-center bg-emerald-400 text-emerald-950"><ShoppingCart className="size-5" /></div><div><h3 className="text-sm font-bold text-white">Current bill</h3><p className="text-xs text-slate-400">{state.cart.length} item line{state.cart.length === 1 ? '' : 's'}</p></div></div><Pill tone={metrics.openSession ? 'green' : 'amber'}>{metrics.openSession ? 'ready' : 'counter closed'}</Pill></div>
            <div className="max-h-[34vh] min-h-[180px] space-y-2 overflow-y-auto p-3">
              {state.cart.map(line => { const product = products[line.productId]; const step = productStep(product); return <div key={line.productId} className="rounded-lg border border-slate-200 p-3"><div className="flex items-start gap-3"><div className={`grid size-9 shrink-0 place-items-center rounded-md ${product ? productVisual(product).style : 'bg-slate-100 text-slate-500'}`}>{product && (() => { const Icon = productVisual(product).Icon; return <Icon className="size-4" />; })()}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold leading-5 text-slate-900">{product?.name ?? line.productId}</p><p className="text-xs text-slate-500">{money(line.price)} each</p></div><button title="Remove item" onClick={() => dispatch({ type:'remove-cart-line', productId:line.productId })} className="grid size-8 shrink-0 place-items-center rounded-md text-rose-600 hover:bg-rose-50"><Trash2 className="size-4" /></button></div><div className="mt-3 flex items-center gap-2"><button title="Reduce quantity" onClick={() => dispatch({ type:'set-cart-line', productId:line.productId, qty:Number(Math.max(0, line.qty - step).toFixed(2)) })} className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600"><Minus className="size-4" /></button><input className={`${inputClass} h-9 w-20 px-1 text-center`} type="number" step={step} value={line.qty} onChange={event => dispatch({ type:'set-cart-line', productId:line.productId, qty:Number(event.target.value) })} /><button title="Increase quantity" onClick={() => dispatch({ type:'set-cart-line', productId:line.productId, qty:Number((line.qty + step).toFixed(2)) })} className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600"><Plus className="size-4" /></button><b className="ml-auto text-sm text-slate-950">{money(line.qty * line.price)}</b></div></div>; })}
              {!state.cart.length && <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center"><div><ReceiptText className="mx-auto size-7 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-500">Your bill is empty</p><p className="mt-1 text-xs text-slate-400">Select a product to add it</p></div></div>}
            </div>
            <div className="border-t border-slate-100 p-3">
              <p className="mb-2 text-xs font-semibold text-slate-500">Payment method</p><div className="grid grid-cols-4 gap-1.5">{paymentButtons.map(({ mode, label, icon:Icon }) => <button key={mode} onClick={() => dispatch({ type:'set-payment-mode', mode })} className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-md border text-[11px] font-semibold transition ${state.selectedPaymentMode === mode ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50'}`}><Icon className="size-4" />{label}</button>)}</div>
              {state.selectedPaymentMode === 'cash' && <div className="mt-3 grid grid-cols-[1fr_112px] items-end gap-2 rounded-lg bg-slate-50 p-3"><Field label="Cash received"><input className={inputClass} type="number" min="0" placeholder={String(cartTotals.grandTotal)} value={state.cashReceived || ''} onChange={event => dispatch({ type:'set-cash-received', cash:Number(event.target.value) })} /></Field><div className="rounded-md bg-white p-2.5 text-right ring-1 ring-slate-200"><p className="text-[10px] text-slate-500">Change</p><b className="text-base text-slate-900">{money(cashChange)}</b></div></div>}
              <div className="mt-3 space-y-1.5 rounded-lg bg-slate-50 p-3"><div className="flex justify-between text-xs text-slate-500"><span>Subtotal</span><span>{money(cartTotals.subTotal)}</span></div><div className="flex justify-between text-xs text-slate-500"><span>Tax</span><span>{money(cartTotals.taxTotal)}</span></div><div className="flex justify-between border-t border-slate-200 pt-2 text-xl font-extrabold text-slate-950"><span>Total</span><span>{money(cartTotals.grandTotal)}</span></div></div>
              <div className="mt-3 grid grid-cols-[1fr_1fr_2fr] gap-2"><ActionButton tone="amber" disabled={!state.cart.length} onClick={() => dispatch({ type:'hold-cart', name:`Bill ${state.heldCarts.length + 1}` })}>Hold</ActionButton><ActionButton tone="red" disabled={!state.cart.length} onClick={() => dispatch({ type:'clear-cart' })}>Clear</ActionButton><ActionButton tone={metrics.openSession ? 'green' : 'blue'} disabled={Boolean(metrics.openSession) && !state.cart.length} onClick={checkout}><CheckCircle2 className="size-4" />{metrics.openSession ? 'Charge' : 'Open counter'}</ActionButton></div>
            </div>
          </section>
        </aside>
      </div>
    </div>}

    {tab === 'Counter' && <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <Card title="Counter session" description="Open before billing and close during daily settlement.">
        <div className="grid gap-3">
          <Field label="Branch">
            <select className={inputClass} value={state.selectedBranchId} onChange={e => dispatch({ type: 'select-branch', branchId: e.target.value })}>
              {state.branches.filter(b => b.type !== 'central-kitchen').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          {!metrics.openSession && <ActionButton tone="green" onClick={openCounter}><Store className="size-4" />Open counter</ActionButton>}
          {metrics.openSession && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-emerald-950">{metrics.openSession.cashier}</p><p className="text-xs text-emerald-700">{metrics.openSession.terminal} opened with {money(metrics.openSession.openingCash)}</p></div><Pill tone="green">live</Pill></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"><Field label="Counted closing cash"><input className={inputClass} type="number" min="0" value={counterForm.closingCash} onChange={event => setCounterForm(current => ({ ...current, closingCash: event.target.value }))} placeholder="Enter physical cash" /></Field><ActionButton tone="amber" disabled={!counterForm.closingCash} onClick={closeCounter}>Save and close counter</ActionButton></div></div>}
        </div>
      </Card>
      <Card title="Counter sessions"><DataTable rows={state.counterSessions} columns={[
        { key: 'branchId', label: 'Branch', render: s => branches[s.branchId]?.name },
        { key: 'terminal', label: 'Terminal' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'openingCash', label: 'Opening', render: s => money(s.openingCash) },
        { key: 'closingCash', label: 'Closing', render: s => s.closingCash ? money(s.closingCash) : '-' },
        { key: 'status', label: 'Status', render: s => <Pill tone={s.status === 'open' ? 'green' : 'slate'}>{s.status}</Pill> },
        { key: 'openedAt', label: 'Opened', render: s => new Date(s.openedAt).toLocaleString() }
      ]} /></Card>
    </div>}

    {tab === 'Online Orders' && <Card title="Swiggy / Zomato / Website / QR order queue"><DataTable rows={state.onlineOrders} columns={[
      { key: 'platform', label: 'Platform' },
      { key: 'externalRef', label: 'Ref' },
      { key: 'branchId', label: 'Branch', render: o => branches[o.branchId]?.name },
      { key: 'customerName', label: 'Customer' },
      { key: 'amount', label: 'Amount', render: o => money(o.amount) },
      { key: 'payoutExpected', label: 'Expected payout', render: o => money(o.payoutExpected) },
      { key: 'status', label: 'Status', render: o => <Pill tone={o.status === 'new' ? 'amber' : o.status === 'reconciled' ? 'green' : 'blue'}>{o.status}</Pill> },
      { key: 'id', label: 'Actions', render: o => <div className="flex flex-wrap gap-2"><ActionButton tone="green" onClick={() => dispatch({ type: 'accept-online-order', orderId: o.id })}><CheckCircle2 className="size-4" />Accept</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type: 'reject-online-order', orderId: o.id, reason: 'Demo rejection' })}><XCircle className="size-4" />Reject</ActionButton><ActionButton tone="blue" onClick={() => dispatch({ type: 'reconcile-online-order', orderId: o.id, payoutReceived: o.payoutExpected })}><RefreshCw className="size-4" />Reconcile</ActionButton></div> }
    ]} /></Card>}

    {tab === 'Advance Orders' && <div className="space-y-5">
      <div className="grid items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <Card title="Book advance order" description="Save delivery time, design, advance collection and remaining balance.">
          <form className="grid gap-3" onSubmit={event => {
            event.preventDefault();
            const qty = Number(advanceForm.qty || 0);
            const advancePaid = Number(advanceForm.advancePaid || 0);
            const orderValue = qty * (products[advanceForm.productId]?.price ?? 0);
            dispatch({ type:'create-advance-order', order:{ branchId:state.selectedBranchId, customerId:advanceForm.customerId, productId:advanceForm.productId, qty, deliveryAt:new Date(advanceForm.deliveryAt).toISOString(), designNotes:advanceForm.designNotes, imageRequired:Boolean(advanceForm.designNotes), advancePaid, balance:Math.max(0, orderValue - advancePaid) } });
            setShowDeliveryAlert(true);
          }}>
            <Field label="Customer"><select required className={inputClass} value={advanceForm.customerId} onChange={event => setAdvanceForm(current => ({ ...current, customerId:event.target.value }))}>{state.customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name} - {customer.phone}</option>)}</select></Field>
            <Field label="Product"><select required className={inputClass} value={advanceForm.productId} onChange={event => setAdvanceForm(current => ({ ...current, productId:event.target.value }))}>{state.products.filter(product => product.active).map(product => <option key={product.id} value={product.id}>{product.name} - {money(product.price)}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Quantity"><input required className={inputClass} min="0.25" step="0.25" type="number" value={advanceForm.qty} onChange={event => setAdvanceForm(current => ({ ...current, qty:event.target.value }))} /></Field><Field label="Advance paid"><input required className={inputClass} min="0" type="number" value={advanceForm.advancePaid} onChange={event => setAdvanceForm(current => ({ ...current, advancePaid:event.target.value }))} /></Field></div>
            <Field label="Delivery date and time"><input required className={inputClass} type="datetime-local" value={advanceForm.deliveryAt} onChange={event => setAdvanceForm(current => ({ ...current, deliveryAt:event.target.value }))} /></Field>
            <Field label="Design / packing / message"><textarea className={`${inputClass} h-24 resize-none py-3`} value={advanceForm.designNotes} onChange={event => setAdvanceForm(current => ({ ...current, designNotes:event.target.value }))} /></Field>
            <div className="flex items-center justify-between rounded-md bg-stone-100 px-3 py-2 text-sm"><span className="text-stone-600">Estimated balance</span><b>{money(Math.max(0, Number(advanceForm.qty || 0) * (products[advanceForm.productId]?.price ?? 0) - Number(advanceForm.advancePaid || 0)))}</b></div>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"><CalendarClock className="size-4" />Save advance order</button>
          </form>
        </Card>
        <Card title="Delivery board" description="Today and overdue orders stay highlighted until delivered."><DataTable rows={state.advanceOrders.filter(order => order.branchId === state.selectedBranchId)} columns={[
          { key: 'customerId', label: 'Customer', render: o => customers[o.customerId]?.name },
          { key: 'productId', label: 'Product', render: o => products[o.productId]?.name },
          { key: 'qty', label: 'Qty' },
          { key: 'deliveryAt', label: 'Delivery', render: o => <span className={new Date(o.deliveryAt).getTime() <= deliveryCutoff && !['delivered','cancelled'].includes(o.status) ? 'font-bold text-rose-700' : ''}>{new Date(o.deliveryAt).toLocaleString('en-IN')}</span> },
          { key: 'advancePaid', label: 'Advance', render: o => money(o.advancePaid) },
          { key: 'balance', label: 'Balance', render: o => money(o.balance) },
          { key: 'status', label: 'Status', render: o => <Pill tone={o.status === 'delivered' ? 'green' : o.status === 'ready' ? 'blue' : 'amber'}>{o.status}</Pill> },
          { key: 'id', label: 'Next action', render: o => !['delivered','cancelled'].includes(o.status) && <ActionButton tone="green" onClick={() => dispatch({ type:'advance-status', orderId:o.id, status:o.status === 'booked' ? 'confirmed' : o.status === 'ready' ? 'delivered' : o.status === 'confirmed' ? 'production-alerted' : 'ready' })}>{o.status === 'booked' ? 'Confirm' : o.status === 'confirmed' ? 'Alert kitchen' : o.status === 'ready' ? 'Deliver' : 'Mark ready'}</ActionButton> }
        ]} /></Card>
      </div>
    </div>}

    {tab === 'Credit' && <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={UserRound} label="Credit customers" value={String(state.customers.filter(c => c.creditLimit > 0).length)} helper="Retail, corporate and wholesale accounts" tone="purple" />
        <Metric icon={WalletCards} label="Outstanding" value={money(metrics.creditDue)} helper="Debit minus collections" tone={metrics.creditDue ? 'amber' : 'green'} />
        <Metric icon={ReceiptText} label="Entries" value={String(state.creditEntries.length)} helper="Ledger rows available" tone="blue" />
      </div>
      <Card title="Credit customers and collections"><DataTable rows={state.creditEntries} columns={[
        { key: 'customerId', label: 'Customer', render: e => customers[e.customerId]?.name },
        { key: 'debit', label: 'Debit', render: e => money(e.debit) },
        { key: 'credit', label: 'Credit', render: e => money(e.credit) },
        { key: 'dueDate', label: 'Due' },
        { key: 'note', label: 'Note' },
        { key: 'id', label: 'Action', render: e => <ActionButton tone="green" onClick={() => dispatch({ type: 'add-credit-collection', customerId: e.customerId, amount: 500, note: 'Demo payment received' })}>Collect {money(500)}</ActionButton> }
      ]} /></Card>
    </div>}

    {tab === 'Goods Receipt' && <Card title="Receive central kitchen dispatch"><DataTable rows={state.dispatches.filter(d => d.toBranchId === state.selectedBranchId || d.status === 'dispatched')} columns={[
      { key: 'toBranchId', label: 'To', render: d => branches[d.toBranchId]?.name },
      { key: 'status', label: 'Status', render: d => <Pill tone={d.status === 'received' ? 'green' : 'amber'}>{d.status}</Pill> },
      { key: 'crateIds', label: 'Crates', render: d => d.crateIds.join(', ') },
      { key: 'lines', label: 'Items', render: d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ') },
      { key: 'id', label: 'Action', render: d => d.status === 'dispatched' && <div className="flex flex-wrap gap-2"><ActionButton tone="green" onClick={() => dispatch({ type: 'receive-dispatch', dispatchId: d.id })}><Truck className="size-4" />Receive OK</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type: 'receive-dispatch', dispatchId: d.id, shortageNote: 'Demo shortage/damage note' })}>Shortage</ActionButton></div> }
    ]} /></Card>}

    {tab === 'Stock' && <Card title="Branch stock with batch and expiry"><DataTable rows={selectedStock} columns={[
      { key: 'productId', label: 'Product', render: s => products[s.productId]?.name },
      { key: 'qty', label: 'Qty', render: s => formatQty(s.qty) },
      { key: 'batchNo', label: 'Batch' },
      { key: 'producedAt', label: 'Produced', render: s => s.producedAt.slice(0, 10) },
      { key: 'expiryAt', label: 'Expiry', render: s => s.expiryAt.slice(0, 10) },
      { key: 'costPerUnit', label: 'Cost', render: s => money(s.costPerUnit) }
    ]} /></Card>}

    {tab === 'Returns' && <Card title="Refund / void / return approval"><DataTable rows={state.bills} empty="No bills yet" columns={[
      { key: 'billNo', label: 'Bill' },
      { key: 'branchId', label: 'Branch', render: b => branches[b.branchId]?.name },
      { key: 'grandTotal', label: 'Total', render: b => money(b.grandTotal) },
      { key: 'paymentMode', label: 'Payment' },
      { key: 'status', label: 'Status', render: b => <Pill tone={b.status === 'paid' ? 'green' : b.status === 'credit' ? 'amber' : 'red'}>{b.status}</Pill> },
      { key: 'printCount', label: 'Prints' },
      { key: 'id', label: 'Actions', render: b => <div className="flex flex-wrap gap-2"><ActionButton tone="blue" onClick={() => dispatch({ type: 'duplicate-print', billId: b.id })}><Printer className="size-4" />Duplicate</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type: 'refund-bill', billId: b.id, amount: b.grandTotal, reason: 'Demo approved refund', restock: true, approvedBy: 'Manager' })}>Refund</ActionButton></div> }
    ]} /></Card>}

    {tab === 'Daily Closure' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Banknote} label="Cash" value={money(state.bills.filter(b => b.paymentMode === 'cash').reduce((s, b) => s + b.grandTotal, 0))} helper="Cash bills" tone="green" />
        <Metric icon={CreditCard} label="Card" value={money(state.bills.filter(b => b.paymentMode === 'card').reduce((s, b) => s + b.grandTotal, 0))} helper="Card bills" tone="blue" />
        <Metric icon={Smartphone} label="UPI/Paytm" value={money(state.bills.filter(b => ['upi', 'paytm'].includes(b.paymentMode)).reduce((s, b) => s + b.grandTotal, 0))} helper="Digital settlement" tone="purple" />
        <Metric icon={SplitSquareHorizontal} label="Credit" value={money(state.bills.filter(b => b.paymentMode === 'credit').reduce((s, b) => s + b.grandTotal, 0))} helper="Credit bills" tone="amber" />
      </div>
      <Card title="Daily closure actions">{metrics.openSession ? <div className="grid gap-3 sm:grid-cols-[minmax(220px,360px)_auto] sm:items-end"><Field label="Physical counted cash"><input className={inputClass} type="number" min="0" value={counterForm.closingCash} onChange={event => setCounterForm(current => ({ ...current, closingCash:event.target.value }))} placeholder="Enter drawer count" /></Field><ActionButton tone="amber" disabled={!counterForm.closingCash} onClick={closeCounter}>Save closure and close counter</ActionButton></div> : <Pill tone="green">No open counter for selected branch</Pill>}</Card>
    </div>}

    {tab === 'Reports' && <div className="space-y-5">
      <Card title="Bill history and print control"><DataTable rows={state.bills} empty="No bills yet" columns={[
        { key: 'billNo', label: 'Bill' },
        { key: 'createdAt', label: 'At', render: b => new Date(b.createdAt).toLocaleString() },
        { key: 'branchId', label: 'Branch', render: b => branches[b.branchId]?.name },
        { key: 'orderChannel', label: 'Channel' },
        { key: 'paymentMode', label: 'Payment' },
        { key: 'grandTotal', label: 'Total', render: b => money(b.grandTotal) },
        { key: 'printCount', label: 'Print count' }
      ]} /></Card>
      <Card title="Print jobs"><DataTable rows={state.printJobs} empty="No print jobs" columns={[
        { key: 'type', label: 'Type' },
        { key: 'target', label: 'Target' },
        { key: 'payload', label: 'Payload' },
        { key: 'status', label: 'Status', render: j => <Pill tone={j.status === 'printed' ? 'green' : j.status === 'failed' ? 'red' : 'amber'}>{j.status}</Pill> },
        { key: 'createdAt', label: 'At', render: j => new Date(j.createdAt).toLocaleString() }
      ]} /></Card>
    </div>}

    {tab === 'Devices' && <div className="grid gap-5 md:grid-cols-2">
      <Card title="Hardware readiness"><div className="grid gap-3">{state.integrations.filter(i => i.category === 'hardware').map(i => <div key={i.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><b>{i.name}</b><Pill tone="purple">{i.status}</Pill></div><p className="mt-1 text-sm text-slate-600">{i.notes}</p></div>)}</div></Card>
      <Card title="Payment/integration readiness"><div className="grid gap-3">{state.integrations.filter(i => i.category !== 'hardware').map(i => <div key={i.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><b>{i.name}</b><Pill tone={i.status === 'missing-credentials' ? 'amber' : 'blue'}>{i.status}</Pill></div><p className="mt-1 text-sm text-slate-600">{i.notes}</p></div>)}</div></Card>
    </div>}

    {tab === 'Debug' && <DebugPanel events={state.debugEvents} />}
    {tab === 'Complete Feature Centre' && <CompleteFeatureCenter dashboard="branch" initialModule={searchParams.get('module') ?? undefined} />}
    {tab === 'Retail Billing & Counter' && <BranchIntegratedFeature module="Complete Retail Billing" />}
    {tab === 'Stock-Aware Retail Operations' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} />}
    {tab === 'Wholesale & Credit' && <BranchIntegratedFeature module="Wholesale & Credit Operations" />}
    {(['Order Taking','Complete Retail Billing','Complete Bill History','Cashier Daily Closure','Primary Outlet Operations','Secondary Outlet Operations','Wholesale & Credit Operations'] as readonly string[]).includes(tab) && <BranchIntegratedFeature module={tab as BranchIntegratedModule} />}
    {tab === 'Bill History' && <BranchIntegratedFeature module="Complete Bill History" />}
    {tab === 'Payment Mode Edit' && <BranchIntegratedFeature module="Complete Retail Billing" internalTab="payment_edit" />}
    {tab === 'Cashier Closure' && <BranchIntegratedFeature module="Cashier Daily Closure" />}
    {tab === 'Alerts' && <BranchIntegratedFeature module="Complete Retail Billing" internalTab="alerts" />}
    {tab === 'Salesperson Report' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="salesperson" />}
    {tab === 'Purchase' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="purchase" />}
    {tab === 'Purchase Pay' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="purchase-pay" />}
    {tab === 'Purchase Order' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="po" />}
    {tab === 'Current Cash' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="current-cash" />}
    {tab === 'Bank Deposits' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="bank" />}
    {tab === 'Notifications' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="notifications" />}
    {tab === 'Audit Logs' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="audit" />}
    {tab === 'Thresholds' && <BranchIntegratedFeature module={appRole === 'branch_secondary' ? 'Secondary Outlet Operations' : 'Primary Outlet Operations'} internalTab="settings" />}
    {!(['Order Taking','Complete Retail Billing','Complete Bill History','Cashier Daily Closure','Primary Outlet Operations','Secondary Outlet Operations','Wholesale & Credit Operations','Bill History','Payment Mode Edit','Cashier Closure','Alerts','Salesperson Report','Purchase','Purchase Pay','Purchase Order','Current Cash','Bank Deposits','Notifications','Audit Logs','Thresholds'] as readonly string[]).includes(tab) && isExtensionTab('branch', tab) && <OperationalWorkbench scope="branch" module={tab} branchName={currentBranch?.name} />}
  </Shell>;
}
