import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  Boxes,
  CakeSlice,
  CheckCircle2,
  Clock3,
  Cookie,
  CreditCard,
  FileSpreadsheet,
  Globe,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  ScanBarcode,
  Search,
  Server,
  ShoppingBag,
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
import { ActionButton, Card, DataTable, DebugPanel, Field, inputClass, Metric, Pill, Shell } from '../components/UI';
import { billTotals, byId, money } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { Bill, BranchPrice, PaymentMode, Product } from '../lib/types';

const tabs = ['POS Billing', 'Counter', 'Online Orders', 'Advance Orders', 'Quotation', 'Credit', 'Goods Receipt', 'Stock', 'Returns', 'Cashier Report', 'Daily Closure', 'Reports', 'Devices', 'Debug'] as const;
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
  if (value.includes('cake')) return { Icon: CakeSlice, style: 'bg-red-50 text-oxblood' };
  if (value.includes('savour') || value.includes('snack') || value.includes('mixture')) return { Icon: Cookie, style: 'bg-marigold-50 text-marigold-700' };
  return { Icon: Sparkles, style: 'bg-emerald-50 text-tgreen' };
}

export default function BranchBillingDashboard() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [tab, setTab] = useState<Tab>('POS Billing');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [collectRowId, setCollectRowId] = useState<string | null>(null);
  const [collectAmount, setCollectAmount] = useState(0);
  const [refundRowId, setRefundRowId] = useState<string | null>(null);
  const [refundDraft, setRefundDraft] = useState({ amount: 0, reason: '' });
  const [closingCashInput, setClosingCashInput] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const products = byId(state.products);
  const branches = byId(state.branches);
  const customers = byId(state.customers);
  const currentBranch = branches[state.selectedBranchId];
  const cartTotals = billTotals(state.cart, state.products);
  const onlineChannel = state.orderChannel === 'swiggy' || state.orderChannel === 'zomato' || state.orderChannel === 'website';

  const todaysDeliveries = useMemo(() => {
    const todayKey = new Date().toDateString();
    return state.advanceOrders.filter(order => order.branchId === state.selectedBranchId
      && new Date(order.deliveryAt).toDateString() === todayKey
      && order.status !== 'delivered' && order.status !== 'cancelled');
  }, [state.advanceOrders, state.selectedBranchId]);

  useEffect(() => {
    if (!todaysDeliveries.length) return;
    const seenKey = `deliveryPopupSeen:${state.selectedBranchId}:${new Date().toDateString()}`;
    if (sessionStorage.getItem(seenKey)) return;
    sessionStorage.setItem(seenKey, '1');
    setShowDeliveryPopup(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedBranchId, todaysDeliveries.length]);

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
  const branchSessions = useMemo(() => state.counterSessions.filter(session => session.branchId === state.selectedBranchId).sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()), [state.counterSessions, state.selectedBranchId]);
  const cashierPerformance = useMemo(() => {
    const sessionsById = new Map(branchSessions.map(session => [session.id, session]));
    const byCashier: Record<string, { cashier: string; bills: number; sales: number; cash: number; digital: number; sessionIds: Set<string> }> = {};
    branchBills.forEach(bill => {
      const cashier = sessionsById.get(bill.counterSessionId)?.cashier ?? 'Unknown';
      const row = byCashier[cashier] ?? { cashier, bills: 0, sales: 0, cash: 0, digital: 0, sessionIds: new Set<string>() };
      row.bills += 1;
      row.sales += bill.grandTotal;
      if (bill.paymentMode === 'cash') row.cash += bill.grandTotal; else row.digital += bill.grandTotal;
      row.sessionIds.add(bill.counterSessionId);
      byCashier[cashier] = row;
    });
    return Object.values(byCashier).map(row => ({ cashier: row.cashier, bills: row.bills, sales: row.sales, avgBill: row.bills ? row.sales / row.bills : 0, cash: row.cash, digital: row.digital, sessions: row.sessionIds.size })).sort((a, b) => b.sales - a.sales);
  }, [branchBills, branchSessions]);
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
      if (e.key === 'F6') { e.preventDefault(); dispatch({ type: 'open-counter', branchId: state.selectedBranchId, cashier: 'Branch Cashier', terminal: 'POS-1', openingCash: 2000 }); }
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
  const openCounter = () => dispatch({ type: 'open-counter', branchId: state.selectedBranchId, cashier: 'Branch Cashier', terminal: 'POS-1', openingCash: 2000 });
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

  return <Shell title="Branch POS" subtitle={`${currentBranch?.name ?? 'Selected branch'} counter billing, online orders, stock receiving, returns and closure`} tabs={tabs} activeTab={tab} onTabChange={t => setTab(t as Tab)}>
    {showDeliveryPopup && <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/50 p-4" onClick={() => setShowDeliveryPopup(false)}>
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-3 bg-ink px-5 py-4 text-white">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-marigold text-white"><Truck className="size-5" /></div>
          <div><h3 className="text-sm font-bold">Today's deliveries — {currentBranch?.name}</h3><p className="text-xs text-white/60">{todaysDeliveries.length} order{todaysDeliveries.length === 1 ? '' : 's'} due today. Make sure these are ready on time.</p></div>
          <button onClick={() => setShowDeliveryPopup(false)} className="ml-auto grid size-8 shrink-0 place-items-center rounded-md text-white/70 hover:bg-white/10"><XCircle className="size-5" /></button>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto p-4">
          {todaysDeliveries.map(order => <div key={order.id} className="rounded-lg border border-ink/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="text-sm font-bold text-ink">{products[order.productId]?.name ?? order.productId} × {order.qty}</p><p className="mt-0.5 text-xs text-ink-600">{customers[order.customerId]?.name ?? 'Customer'} · Due {new Date(order.deliveryAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>{order.designNotes && <p className="mt-1 text-xs text-ink-600/60">{order.designNotes}</p>}</div>
              <Pill tone={order.status === 'ready' ? 'green' : order.status === 'production-alerted' ? 'blue' : 'amber'}>{order.status.replace('-', ' ')}</Pill>
            </div>
            <div className="mt-2 flex gap-2">
              {order.status !== 'ready' && <ActionButton tone="blue" onClick={() => dispatch({ type:'advance-status', orderId:order.id, status:'ready' })}>Mark ready</ActionButton>}
              <ActionButton tone="green" onClick={() => dispatch({ type:'advance-status', orderId:order.id, status:'delivered' })}>Mark delivered</ActionButton>
            </div>
          </div>)}
        </div>
      </div>
    </div>}

    {!showDeliveryPopup && todaysDeliveries.length > 0 && <button onClick={() => setShowDeliveryPopup(true)} className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-bold text-white shadow-xl shadow-ink/30 hover:brightness-110">
      <Truck className="size-4 text-marigold-100" />{todaysDeliveries.length} deliver{todaysDeliveries.length === 1 ? 'y' : 'ies'} due today
    </button>}

    {tab === 'POS Billing' && <div className="space-y-4">
      <section className="flex flex-col gap-4 border border-black/20 bg-ink px-4 py-4 text-white shadow-lg shadow-ink/10 lg:flex-row lg:items-center lg:px-5">
        <div className="flex min-w-0 items-center gap-3 lg:w-[290px]">
          <div className={`grid size-11 shrink-0 place-items-center ${metrics.openSession ? 'bg-tgreen text-white' : 'bg-marigold text-white'}`}><Store className="size-5" /></div>
          <div className="min-w-0"><p className="truncate font-display text-sm font-bold text-white">{currentBranch?.name}</p><p className="text-xs text-white/50">{metrics.openSession ? `${metrics.openSession.terminal} is ready for service` : 'Open the counter to begin billing'}</p></div>
        </div>
        <div className="grid flex-1 grid-cols-3 divide-x divide-white/10 border border-white/10 bg-white/5 py-2.5">
          <div className="px-3"><p className="text-[10px] font-semibold text-white/40">CURRENT BILL</p><p className="mt-0.5 font-ticket text-lg font-extrabold text-white">{money(cartTotals.grandTotal)}</p></div>
          <div className="px-3"><p className="text-[10px] font-semibold text-white/40">ONLINE WAITING</p><p className="mt-0.5 font-ticket text-lg font-extrabold text-sky-300">{branchOnlineOrders.filter(order => order.status === 'new').length}</p></div>
          <div className="px-3"><p className="text-[10px] font-semibold text-white/40">STOCK ALERTS</p><p className={`mt-0.5 font-ticket text-lg font-extrabold ${stockRiskCount ? 'text-marigold-100' : 'text-emerald-300'}`}>{stockRiskCount}</p></div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-white/70"><span className={`size-2 ${metrics.openSession ? 'bg-tgreen' : 'bg-marigold'}`} />{metrics.openSession ? 'Live counter' : 'Setup required'}</div>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_430px]">
        <section className="min-w-0 space-y-4">
          <div className="border border-ink/10 bg-paper shadow-sm">
            <div className="grid gap-3 border-b border-ink/8 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <Field label="Selling from">
                <select className={inputClass} value={state.selectedBranchId} onChange={event => dispatch({ type:'select-branch', branchId:event.target.value })}>{state.branches.filter(branch => branch.type !== 'central-kitchen').map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select>
              </Field>
              <Field label="Find a product">
                <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-600/50" /><input ref={searchRef} className={`${inputClass} pl-10 pr-12`} placeholder="Search item, category or scan barcode" value={search} onChange={event => setSearch(event.target.value)} /><ScanBarcode className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-ink-600/50" /></div>
              </Field>
            </div>
            <div className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">{categories.map(item => <button key={item} onClick={() => setCategory(item)} className={`min-h-9 whitespace-nowrap rounded-md border px-3 text-xs font-semibold transition ${category === item ? 'border-tgreen bg-tgreen text-white' : 'border-ink/15 bg-paper text-ink-600 hover:border-ink/30'}`}>{item}</button>)}</div>
              <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"><span className="mr-1 shrink-0 text-xs font-semibold text-ink-600">Order type</span>{orderChannels.map(channel => <button key={channel} onClick={() => { setCategory('All'); dispatch({ type:'set-order-channel', channel }); }} className={`min-h-8 shrink-0 rounded-md px-2.5 text-xs font-semibold capitalize transition ${state.orderChannel === channel ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'text-ink-600 hover:bg-paper-dim'}`}>{channel.replace('-', ' ')}</button>)}<span className="ml-auto shrink-0 text-[11px] font-semibold text-ink-600/60">{channelProducts.length} sellable SKUs</span></div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {visibleProducts.map(product => {
              const available = stockByProduct[product.id] ?? 0;
              const disabled = available <= 0;
              const visual = productVisual(product);
              return <button key={product.id} disabled={disabled} onClick={() => addProduct(product)} className={`group relative flex min-h-[190px] flex-col overflow-hidden border bg-paper p-3.5 text-left shadow-[0_1px_2px_rgba(31,41,51,.05)] transition ${disabled ? 'cursor-not-allowed border-ink/10 opacity-55' : 'border-ink/10 hover:-translate-y-0.5 hover:border-marigold hover:shadow-lg hover:shadow-ink/8'}`}>
                <span className={`absolute inset-x-0 top-0 h-1 ${disabled ? 'bg-ink/15' : available <= 8 ? 'bg-marigold' : 'bg-tgreen'}`} />
                <div className="flex items-start justify-between gap-2">{product.image ? <img src={product.image} alt="" className="h-14 w-16 rounded-md object-cover" /> : <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${visual.style}`}><visual.Icon className="size-5" /></div>}<Pill tone={disabled ? 'red' : available <= 8 ? 'amber' : 'green'}>{disabled ? 'sold out' : `${formatQty(available)} in stock`}</Pill></div>
                <h3 className="mt-3 min-h-10 font-display text-sm font-bold leading-5 text-ink">{product.name}</h3>
                <p className="mt-1 text-[11px] text-ink-600/70">{product.category}</p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-3"><div><p className="font-ticket text-lg font-extrabold text-ink">{money(sellingPrice(product))}</p><p className="text-[11px] font-medium text-ink-600/50">{onlineChannel ? 'Online Menu 2025' : 'POS Menu 2025'}</p></div><span className={`grid size-9 place-items-center ${disabled ? 'bg-ink/10 text-ink-600/40' : 'bg-marigold text-white group-hover:bg-marigold-600'}`}><Plus className="size-4" /></span></div>
              </button>;
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm font-bold text-ink">Held bills</h3><Clock3 className="size-4 text-ink-600/50" /></div><div className="space-y-2">{state.heldCarts.slice(0,2).map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-paper-dim p-2.5"><span className="min-w-0 truncate text-sm font-medium text-ink-700">{item.name} - {item.lines.length} items</span><button onClick={() => dispatch({ type:'recall-cart', heldCartId:item.id })} className="text-xs font-semibold text-sky-700">Recall</button></div>)}{!state.heldCarts.length && <p className="text-sm text-ink-600/60">No held bills</p>}</div></div>
            <div className="rounded-lg border border-ink/10 bg-paper p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-sm font-bold text-ink">Recent bills</h3><Printer className="size-4 text-ink-600/50" /></div><div className="space-y-2">{branchBills.slice(0,2).map(bill => <div key={bill.id} className="flex items-center justify-between gap-3 rounded-md bg-paper-dim p-2.5"><span className="font-ticket text-sm font-medium text-ink-700">{bill.billNo}</span><b className="font-ticket text-sm text-ink">{money(bill.grandTotal)}</b></div>)}{!branchBills.length && <p className="text-sm text-ink-600/60">No completed bills yet</p>}</div></div>
          </div>
        </section>

        <aside className="min-w-0 xl:sticky xl:top-[84px]">
          {/* Signature element: the cart reads as a real receipt — perforated tear edge, tabular ticket-mono figures. */}
          <section className="overflow-hidden border border-black/20 bg-paper shadow-xl shadow-ink/10">
            <div className="relative flex items-center justify-between bg-ink px-4 py-3.5 text-white">
              <div className="flex items-center gap-3"><div className="grid size-10 place-items-center bg-marigold text-white"><ShoppingCart className="size-5" /></div><div><h3 className="font-display text-sm font-bold text-white">Current bill</h3><p className="text-xs text-white/50">{state.cart.length} item line{state.cart.length === 1 ? '' : 's'}</p></div></div>
              <Pill tone={metrics.openSession ? 'green' : 'amber'}>{metrics.openSession ? 'ready' : 'counter closed'}</Pill>
              <span className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full bg-paper-dim" /><span className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full bg-paper-dim" />
            </div>
            <div className="border-b border-dashed border-ink/20" />
            <div className="max-h-[34vh] min-h-[180px] space-y-2 overflow-y-auto p-3">
              {state.cart.map(line => { const product = products[line.productId]; const step = productStep(product); return <div key={line.productId} className="rounded-lg border border-ink/10 p-3"><div className="flex items-start gap-3"><div className={`grid size-9 shrink-0 place-items-center rounded-md ${product ? productVisual(product).style : 'bg-paper-dim text-ink-600'}`}>{product && (() => { const Icon = productVisual(product).Icon; return <Icon className="size-4" />; })()}</div><div className="min-w-0 flex-1"><p className="text-sm font-semibold leading-5 text-ink">{product?.name ?? line.productId}</p><p className="font-ticket text-xs text-ink-600/60">{money(line.price)} each</p></div><button title="Remove item" onClick={() => dispatch({ type:'remove-cart-line', productId:line.productId })} className="grid size-8 shrink-0 place-items-center rounded-md text-oxblood hover:bg-red-50"><Trash2 className="size-4" /></button></div><div className="mt-3 flex items-center gap-2"><button title="Reduce quantity" onClick={() => dispatch({ type:'set-cart-line', productId:line.productId, qty:Number(Math.max(0, line.qty - step).toFixed(2)) })} className="grid size-9 place-items-center rounded-md border border-ink/15 text-ink-600"><Minus className="size-4" /></button><input className={`${inputClass} h-9 w-20 px-1 text-center font-ticket`} type="number" step={step} value={line.qty} onChange={event => dispatch({ type:'set-cart-line', productId:line.productId, qty:Number(event.target.value) })} /><button title="Increase quantity" onClick={() => dispatch({ type:'set-cart-line', productId:line.productId, qty:Number((line.qty + step).toFixed(2)) })} className="grid size-9 place-items-center rounded-md border border-ink/15 text-ink-600"><Plus className="size-4" /></button><b className="ml-auto font-ticket text-sm text-ink">{money(line.qty * line.price)}</b></div></div>; })}
              {!state.cart.length && <div className="grid min-h-[180px] place-items-center rounded-lg border border-dashed border-ink/20 bg-paper-dim text-center"><div><ReceiptText className="mx-auto size-7 text-ink/20" /><p className="mt-2 text-sm font-semibold text-ink-600">Your bill is empty</p><p className="mt-1 text-xs text-ink-600/60">Select a product to add it</p></div></div>}
            </div>
            <div className="border-t border-dashed border-ink/20 p-3">
              <p className="mb-2 text-xs font-semibold text-ink-600">Payment method</p><div className="grid grid-cols-4 gap-1.5">{paymentButtons.map(({ mode, label, icon:Icon }) => <button key={mode} onClick={() => dispatch({ type:'set-payment-mode', mode })} className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-md border text-[11px] font-semibold transition ${state.selectedPaymentMode === mode ? 'border-tgreen bg-tgreen text-white' : 'border-ink/15 text-ink-600 hover:border-ink/30 hover:bg-paper-dim'}`}><Icon className="size-4" />{label}</button>)}</div>
              {state.selectedPaymentMode === 'cash' && <div className="mt-3 grid grid-cols-[1fr_112px] items-end gap-2 rounded-lg bg-paper-dim p-3"><Field label="Cash received"><input className={`${inputClass} font-ticket`} type="number" min="0" placeholder={String(cartTotals.grandTotal)} value={state.cashReceived || ''} onChange={event => dispatch({ type:'set-cash-received', cash:Number(event.target.value) })} /></Field><div className="rounded-md bg-paper p-2.5 text-right ring-1 ring-ink/10"><p className="text-[10px] text-ink-600/60">Change</p><b className="font-ticket text-base text-ink">{money(cashChange)}</b></div></div>}
              <div className="mt-3 space-y-1.5 rounded-lg bg-paper-dim p-3 font-ticket"><div className="flex justify-between text-xs text-ink-600"><span>Subtotal</span><span>{money(cartTotals.subTotal)}</span></div><div className="flex justify-between text-xs text-ink-600"><span>Tax</span><span>{money(cartTotals.taxTotal)}</span></div><div className="flex justify-between border-t border-dashed border-ink/25 pt-2 text-xl font-extrabold text-ink"><span className="font-display">Total</span><span>{money(cartTotals.grandTotal)}</span></div></div>
              <div className="mt-3 grid grid-cols-[1fr_1fr_2fr] gap-2"><ActionButton tone="amber" disabled={!state.cart.length} onClick={() => dispatch({ type:'hold-cart', name:`Bill ${state.heldCarts.length + 1}` })}>Hold</ActionButton><ActionButton tone="red" disabled={!state.cart.length} onClick={() => dispatch({ type:'clear-cart' })}>Clear</ActionButton><ActionButton tone={metrics.openSession ? 'green' : 'orange'} disabled={Boolean(metrics.openSession) && !state.cart.length} onClick={checkout}><CheckCircle2 className="size-4" />{metrics.openSession ? 'Charge' : 'Open counter'}</ActionButton></div>
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
          <ActionButton tone="green" disabled={Boolean(metrics.openSession)} onClick={openCounter}>Open counter</ActionButton>
          {metrics.openSession && <>
            <Field label="Counted cash in drawer"><input className={`${inputClass} font-ticket`} type="number" min="0" placeholder={String(metrics.openSession.openingCash + branchBills.filter(b => b.paymentMode === 'cash').reduce((s, b) => s + b.grandTotal, 0))} value={closingCashInput || ''} onChange={event => setClosingCashInput(Number(event.target.value))} /></Field>
            <ActionButton tone="amber" onClick={() => { const expected = metrics.openSession!.openingCash + branchBills.filter(b => b.paymentMode === 'cash').reduce((s, b) => s + b.grandTotal, 0); dispatch({ type: 'close-counter', sessionId: metrics.openSession!.id, closingCash: closingCashInput || expected }); setClosingCashInput(0); }}>Close counter</ActionButton>
          </>}
        </div>
      </Card>
      <Card title="Counter sessions" description="This branch only."><DataTable rows={branchSessions} empty="No counter sessions recorded yet" columns={[
        { key: 'terminal', label: 'Terminal' },
        { key: 'cashier', label: 'Cashier' },
        { key: 'openingCash', label: 'Opening', render: s => money(s.openingCash) },
        { key: 'closingCash', label: 'Closing', render: s => s.closingCash ? money(s.closingCash) : '-' },
        { key: 'status', label: 'Status', render: s => <Pill tone={s.status === 'open' ? 'green' : 'slate'}>{s.status}</Pill> },
        { key: 'openedAt', label: 'Opened', render: s => new Date(s.openedAt).toLocaleString() }
      ]} /></Card>
    </div>}

    {tab === 'Online Orders' && <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={ShoppingCart} label="New orders" value={String(branchOnlineOrders.filter(o => o.status === 'new').length)} helper="Waiting for accept/reject" tone="amber" />
        <Metric icon={CheckCircle2} label="Accepted today" value={String(branchOnlineOrders.filter(o => o.status !== 'new').length)} helper="In progress or reconciled" tone="green" />
        <Metric icon={WalletCards} label="Expected payout" value={money(branchOnlineOrders.reduce((sum, o) => sum + o.payoutExpected, 0))} helper="Across all listed orders" tone="blue" />
      </div>
      {!branchOnlineOrders.length && <div className="rounded-lg border border-dashed border-ink/20 bg-paper-dim px-4 py-10 text-center text-sm font-semibold text-ink-600">No online orders yet for this branch.</div>}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {branchOnlineOrders.map(o => <div key={o.id} className={`rounded-lg border bg-paper p-4 shadow-sm ${o.status === 'new' ? 'border-marigold ring-1 ring-marigold-100' : 'border-ink/10'}`}>
          <div className="flex items-center justify-between gap-2"><b className="font-display text-sm text-ink">{o.platform}</b><Pill tone={o.status === 'new' ? 'amber' : o.status === 'reconciled' ? 'green' : 'blue'}>{o.status}</Pill></div>
          <p className="mt-1 font-ticket text-xs text-ink-600/70">{o.externalRef}</p>
          <p className="mt-2 text-sm font-semibold text-ink">{o.customerName}</p>
          <div className="mt-3 flex items-center justify-between border-t border-ink/8 pt-3"><div><p className="text-[10px] text-ink-600">Order</p><p className="font-ticket font-bold text-ink">{money(o.amount)}</p></div><div className="text-right"><p className="text-[10px] text-ink-600">Payout</p><p className="font-ticket font-bold text-tgreen">{money(o.payoutExpected)}</p></div></div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {o.status === 'new' && <>
              <ActionButton tone="green" onClick={() => dispatch({ type: 'accept-online-order', orderId: o.id })}><CheckCircle2 className="size-4" />Accept</ActionButton>
              <ActionButton tone="red" onClick={() => { const reason = window.prompt('Reason for rejecting this order?', 'Item unavailable'); if (reason) dispatch({ type: 'reject-online-order', orderId: o.id, reason }); }}><XCircle className="size-4" />Reject</ActionButton>
            </>}
            {o.status !== 'new' && o.status !== 'reconciled' && <ActionButton tone="blue" onClick={() => dispatch({ type: 'reconcile-online-order', orderId: o.id, payoutReceived: o.payoutExpected })}><RefreshCw className="size-4" />Reconcile</ActionButton>}
          </div>
        </div>)}
      </div>
    </div>}

    {tab === 'Advance Orders' && <div className="space-y-5">
      <Card title="Book a delivery / advance order" description="Cakes, party trays and custom orders for a future pickup or delivery date. New customers are created automatically from the phone number.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          const productId = String(f.get('productId') || '');
          const product = products[productId];
          const qty = Number(f.get('qty') || 1);
          const advancePaid = Number(f.get('advancePaid') || 0);
          if (!product) { setOrderStatus('Choose a product first.'); return; }
          const total = sellingPrice(product) * qty;
          const balance = Math.max(0, total - advancePaid);
          dispatch({
            type: 'book-delivery-order',
            branchId: state.selectedBranchId,
            customerName: String(f.get('customerName') || ''),
            customerPhone: String(f.get('customerPhone') || ''),
            productId,
            qty,
            deliveryAt: f.get('deliveryAt') ? new Date(String(f.get('deliveryAt'))).toISOString() : new Date().toISOString(),
            designNotes: String(f.get('designNotes') || ''),
            imageRequired: f.get('imageRequired') === 'on',
            advancePaid,
            balance
          });
          setOrderStatus(`Order booked for ${new Date(String(f.get('deliveryAt'))).toLocaleString()}. Balance due: ${money(balance)}`);
          form.reset();
        }}>
          <Field label="Customer name"><input className={inputClass} name="customerName" placeholder="Who is this for" required /></Field>
          <Field label="Phone"><input className={inputClass} name="customerPhone" placeholder="Mobile number" /></Field>
          <Field label="Product"><select className={inputClass} name="productId" required defaultValue="">
            <option value="" disabled>Select item</option>
            {state.products.filter(p => p.active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select></Field>
          <Field label="Quantity"><input className={inputClass} name="qty" type="number" min="1" step="1" defaultValue={1} required /></Field>
          <Field label="Delivery date & time"><input className={inputClass} name="deliveryAt" type="datetime-local" required /></Field>
          <Field label="Advance paid"><input className={inputClass} name="advancePaid" type="number" min="0" step="1" defaultValue={0} /></Field>
          <Field label="Design / special notes"><input className={inputClass} name="designNotes" placeholder="e.g. Blue theme, eggless, Happy Birthday" /></Field>
          <label className="flex min-h-11 items-center gap-2 self-end pb-2 text-sm font-semibold text-ink-600"><input type="checkbox" name="imageRequired" className="size-4 accent-emerald-600" />Reference photo required</label>
          <div className="self-end pb-1"><ActionButton tone="green"><Truck className="size-4" />Book order</ActionButton></div>
        </form>
        {orderStatus && <p className="mt-3 rounded-md bg-paper-dim px-3 py-2 text-xs font-semibold text-ink-600">{orderStatus}</p>}
      </Card>
      <Card title="Cake / party / custom advance orders">
        <DataTable rows={state.advanceOrders.filter(o => o.branchId === state.selectedBranchId)} empty="No advance orders booked yet for this branch" columns={[
          { key: 'customerId', label: 'Customer', render: o => customers[o.customerId]?.name },
          { key: 'productId', label: 'Product', render: o => products[o.productId]?.name },
          { key: 'qty', label: 'Qty' },
          { key: 'deliveryAt', label: 'Delivery', render: o => new Date(o.deliveryAt).toLocaleString() },
          { key: 'advancePaid', label: 'Advance', render: o => money(o.advancePaid) },
          { key: 'balance', label: 'Balance', render: o => money(o.balance) },
          { key: 'status', label: 'Status', render: o => <Pill tone={o.status === 'delivered' ? 'green' : o.status === 'confirmed' ? 'blue' : 'amber'}>{o.status.replace('-', ' ')}</Pill> },
          { key: 'id', label: 'Action', render: o => <ActionButton tone="green" onClick={() => dispatch({ type: 'advance-status', orderId: o.id, status: 'production-alerted' })}>Alert kitchen</ActionButton> }
        ]} />
      </Card>
    </div>}

    {tab === 'Quotation' && <div className="space-y-5">
      <Card title="Save current bill as a quotation" description="Price out a bulk or corporate order without committing stock. Add items on the POS Billing tab first, then save the quote here.">
        <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-4" onSubmit={event => {
          event.preventDefault();
          const form = event.currentTarget;
          const f = new FormData(form);
          if (!state.cart.length) { setOrderStatus('Add items on POS Billing first, then come back to save the quote.'); return; }
          dispatch({
            type: 'create-quotation',
            customerName: String(f.get('customerName') || ''),
            customerPhone: String(f.get('customerPhone') || ''),
            companyName: String(f.get('companyName') || ''),
            gstNumber: String(f.get('gstNumber') || '')
          });
          setOrderStatus('Quotation saved. Find it in the list below.');
          form.reset();
        }}>
          <Field label="Customer name"><input className={inputClass} name="customerName" placeholder="Who is this quote for" required /></Field>
          <Field label="Phone"><input className={inputClass} name="customerPhone" placeholder="Mobile number" /></Field>
          <Field label="Company (optional)"><input className={inputClass} name="companyName" placeholder="For corporate / bulk orders" /></Field>
          <Field label="GST number (optional)"><input className={inputClass} name="gstNumber" placeholder="GSTIN" /></Field>
          <div className="flex flex-col justify-end gap-1.5 lg:col-span-4"><p className="text-xs font-semibold text-ink-600">Current bill has {state.cart.length} item line{state.cart.length === 1 ? '' : 's'} · {money(cartTotals.grandTotal)}</p><ActionButton tone="orange" className="w-fit"><ReceiptText className="size-4" />Save as quotation</ActionButton></div>
        </form>
        {orderStatus && <p className="mt-3 rounded-md bg-paper-dim px-3 py-2 text-xs font-semibold text-ink-600">{orderStatus}</p>}
      </Card>
      <Card title="Quotations">
        <DataTable rows={state.quotations.filter(q => q.branchId === state.selectedBranchId)} empty="No quotations saved yet for this branch" columns={[
          { key: 'quoteNo', label: 'Quote No.', render: q => <span className="font-ticket font-semibold">{q.quoteNo}</span> },
          { key: 'customerName', label: 'Customer', render: q => <div><p className="font-semibold text-ink">{q.customerName}</p>{q.companyName && <p className="text-xs text-ink-600/60">{q.companyName}</p>}</div> },
          { key: 'lines', label: 'Items', render: q => `${q.lines.length} line${q.lines.length === 1 ? '' : 's'}` },
          { key: 'total', label: 'Total', render: q => <span className="font-ticket font-bold">{money(q.total)}</span> },
          { key: 'createdAt', label: 'Created', render: q => new Date(q.createdAt).toLocaleString() },
          { key: 'status', label: 'Status', render: q => <Pill tone={q.status === 'converted' ? 'green' : q.status === 'cancelled' ? 'red' : 'amber'}>{q.status}</Pill> },
          { key: 'id', label: 'Action', render: q => q.status === 'open' ? <div className="flex gap-2"><ActionButton tone="green" onClick={() => dispatch({ type:'convert-quotation', quotationId:q.id })}>Load into bill</ActionButton><ActionButton tone="red" onClick={() => dispatch({ type:'quotation-status', quotationId:q.id, status:'cancelled' })}>Cancel</ActionButton></div> : <span className="text-xs text-ink-600/50">—</span> }
        ]} />
      </Card>
    </div>}

    {tab === 'Credit' && <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={UserRound} label="Credit customers" value={String(state.customers.filter(c => c.creditLimit > 0).length)} helper="Retail, corporate and wholesale accounts, company-wide" tone="purple" />
        <Metric icon={WalletCards} label="Outstanding (company-wide)" value={money(metrics.creditDue)} helper="Customer credit isn't split per branch — debit minus collections across the whole business" tone={metrics.creditDue ? 'amber' : 'green'} />
        <Metric icon={ReceiptText} label="Entries" value={String(state.creditEntries.length)} helper="Ledger rows, company-wide" tone="blue" />
      </div>
      <Card title="Credit customers and collections" description="Shared across all branches — a customer's credit account isn't tied to one location.">
        <DataTable rows={state.creditEntries} empty="No credit activity recorded yet" columns={[
        { key: 'customerId', label: 'Customer', render: e => customers[e.customerId]?.name },
        { key: 'debit', label: 'Debit', render: e => money(e.debit) },
        { key: 'credit', label: 'Credit', render: e => money(e.credit) },
        { key: 'dueDate', label: 'Due' },
        { key: 'note', label: 'Note' },
        { key: 'id', label: 'Action', render: e => collectRowId === e.customerId
          ? <div className="flex items-center gap-1.5"><input className={`${inputClass} h-9 w-24 font-ticket`} type="number" min="1" placeholder="Amount" value={collectAmount || ''} onChange={ev => setCollectAmount(Number(ev.target.value))} /><ActionButton tone="green" onClick={() => { if (!collectAmount) { setOrderStatus('Enter an amount to collect.'); return; } dispatch({ type:'add-credit-collection', customerId:e.customerId, amount:collectAmount, note:'Collected at branch counter' }); setCollectRowId(null); setCollectAmount(0); }}>Save</ActionButton><ActionButton tone="slate" onClick={() => setCollectRowId(null)}>Cancel</ActionButton></div>
          : <ActionButton tone="green" onClick={() => { setCollectRowId(e.customerId); setCollectAmount(0); }}>Collect payment</ActionButton> }
      ]} /></Card>
    </div>}

    {tab === 'Goods Receipt' && <Card title="Receive central kitchen dispatch"><DataTable rows={state.dispatches.filter(d => d.toBranchId === state.selectedBranchId)} empty="No dispatches for this branch" columns={[
      { key: 'toBranchId', label: 'To', render: d => branches[d.toBranchId]?.name },
      { key: 'status', label: 'Status', render: d => <Pill tone={d.status === 'received' ? 'green' : 'amber'}>{d.status}</Pill> },
      { key: 'crateIds', label: 'Crates', render: d => d.crateIds.join(', ') },
      { key: 'lines', label: 'Items', render: d => d.lines.map(l => `${products[l.productId]?.name} ${l.qty}`).join(', ') },
      { key: 'id', label: 'Action', render: d => d.status === 'dispatched' && <div className="flex flex-wrap gap-2"><ActionButton tone="green" onClick={() => dispatch({ type: 'receive-dispatch', dispatchId: d.id })}><Truck className="size-4" />Receive OK</ActionButton><ActionButton tone="red" onClick={() => { const note = window.prompt('Describe the shortage or damage'); if (note) dispatch({ type: 'receive-dispatch', dispatchId: d.id, shortageNote: note }); }}>Shortage</ActionButton></div> }
    ]} /></Card>}

    {tab === 'Stock' && <Card title="Branch stock with batch and expiry"><DataTable rows={selectedStock} columns={[
      { key: 'productId', label: 'Product', render: s => products[s.productId]?.name },
      { key: 'qty', label: 'Qty', render: s => formatQty(s.qty) },
      { key: 'batchNo', label: 'Batch' },
      { key: 'producedAt', label: 'Produced', render: s => s.producedAt.slice(0, 10) },
      { key: 'expiryAt', label: 'Expiry', render: s => s.expiryAt.slice(0, 10) },
      { key: 'costPerUnit', label: 'Cost', render: s => money(s.costPerUnit) }
    ]} /></Card>}

    {tab === 'Returns' && <Card title="Refund / void / return approval"><DataTable rows={branchBills} empty="No bills yet for this branch" columns={[
      { key: 'billNo', label: 'Bill' },
      { key: 'grandTotal', label: 'Total', render: b => money(b.grandTotal) },
      { key: 'paymentMode', label: 'Payment' },
      { key: 'status', label: 'Status', render: b => <Pill tone={b.status === 'paid' ? 'green' : b.status === 'credit' ? 'amber' : 'red'}>{b.status}</Pill> },
      { key: 'printCount', label: 'Prints' },
      { key: 'id', label: 'Actions', render: b => refundRowId === b.id
        ? <div className="flex flex-wrap items-center gap-1.5"><input className={`${inputClass} h-9 w-24 font-ticket`} type="number" min="1" max={b.grandTotal} placeholder="Amount" value={refundDraft.amount || ''} onChange={e => setRefundDraft(d => ({ ...d, amount:Number(e.target.value) }))} /><input className={`${inputClass} h-9 w-36`} placeholder="Reason" value={refundDraft.reason} onChange={e => setRefundDraft(d => ({ ...d, reason:e.target.value }))} /><ActionButton tone="green" onClick={() => { if (!refundDraft.amount || !refundDraft.reason.trim()) { setOrderStatus('Enter a refund amount and reason.'); return; } dispatch({ type:'refund-bill', billId:b.id, amount:refundDraft.amount, reason:refundDraft.reason, restock:true, approvedBy:'Branch Manager' }); setRefundRowId(null); setRefundDraft({ amount:0, reason:'' }); }}>Confirm</ActionButton><ActionButton tone="slate" onClick={() => setRefundRowId(null)}>Cancel</ActionButton></div>
        : <div className="flex flex-wrap gap-2"><ActionButton tone="blue" onClick={() => dispatch({ type: 'duplicate-print', billId: b.id })}><Printer className="size-4" />Duplicate</ActionButton><ActionButton tone="red" onClick={() => { setRefundRowId(b.id); setRefundDraft({ amount:b.grandTotal, reason:'' }); }}>Refund</ActionButton></div> }
    ]} /></Card>}

    {tab === 'Cashier Report' && <div className="space-y-5">
      <Card title="Cashier / salesperson performance" description="Each completed bill is linked to the counter session that processed it, so this is calculated from real billing activity — not estimated.">
        <DataTable rows={cashierPerformance} empty="No completed bills yet for this branch" columns={[
          { key: 'cashier', label: 'Cashier' },
          { key: 'bills', label: 'Bills', render: row => row.bills },
          { key: 'sales', label: 'Total sales', render: row => <span className="font-ticket font-bold">{money(row.sales)}</span> },
          { key: 'avgBill', label: 'Avg. bill', render: row => money(row.avgBill) },
          { key: 'cash', label: 'Cash', render: row => money(row.cash) },
          { key: 'digital', label: 'Card/UPI', render: row => money(row.digital) },
          { key: 'sessions', label: 'Shifts worked', render: row => row.sessions }
        ]} />
      </Card>
      <Card title="Shift-by-shift sessions" description="Every counter open/close for this branch, with the cashier and cash reconciliation for that shift.">
        <DataTable rows={branchSessions} empty="No counter sessions recorded yet" columns={[
          { key: 'cashier', label: 'Cashier' },
          { key: 'terminal', label: 'Terminal' },
          { key: 'openedAt', label: 'Opened', render: s => new Date(s.openedAt).toLocaleString() },
          { key: 'closedAt', label: 'Closed', render: s => s.closedAt ? new Date(s.closedAt).toLocaleString() : '—' },
          { key: 'openingCash', label: 'Opening cash', render: s => money(s.openingCash) },
          { key: 'closingCash', label: 'Closing cash', render: s => s.closingCash != null ? money(s.closingCash) : '—' },
          { key: 'status', label: 'Status', render: s => <Pill tone={s.status === 'open' ? 'green' : 'slate'}>{s.status}</Pill> }
        ]} />
      </Card>
    </div>}

    {tab === 'Daily Closure' && <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric icon={Banknote} label="Cash" value={money(branchBills.filter(b => b.paymentMode === 'cash').reduce((s, b) => s + b.grandTotal, 0))} helper="Cash bills" tone="green" />
        <Metric icon={CreditCard} label="Card" value={money(branchBills.filter(b => b.paymentMode === 'card').reduce((s, b) => s + b.grandTotal, 0))} helper="Card bills" tone="blue" />
        <Metric icon={Smartphone} label="UPI/Paytm" value={money(branchBills.filter(b => ['upi', 'paytm'].includes(b.paymentMode)).reduce((s, b) => s + b.grandTotal, 0))} helper="Digital settlement" tone="purple" />
        <Metric icon={SplitSquareHorizontal} label="Credit" value={money(branchBills.filter(b => b.paymentMode === 'credit').reduce((s, b) => s + b.grandTotal, 0))} helper="Credit bills" tone="amber" />
      </div>
      <Card title="Daily closure actions">{metrics.openSession
        ? <div className="flex flex-wrap items-end gap-3"><Field label="Counted cash in drawer"><input className={`${inputClass} font-ticket`} type="number" min="0" placeholder={String(metrics.openSession.openingCash + branchBills.filter(b => b.paymentMode === 'cash').reduce((s, b) => s + b.grandTotal, 0))} value={closingCashInput || ''} onChange={event => setClosingCashInput(Number(event.target.value))} /></Field><ActionButton tone="amber" onClick={() => { const expected = metrics.openSession!.openingCash + branchBills.filter(b => b.paymentMode === 'cash').reduce((s, b) => s + b.grandTotal, 0); dispatch({ type: 'close-counter', sessionId: metrics.openSession!.id, closingCash: closingCashInput || expected }); setClosingCashInput(0); }}>Close active counter</ActionButton></div>
        : <Pill tone="green">No open counter for selected branch</Pill>}</Card>
    </div>}

    {tab === 'Reports' && <div className="space-y-5">
      <Card title="Bill history and print control"><DataTable rows={branchBills} empty="No bills yet for this branch" columns={[
        { key: 'billNo', label: 'Bill' },
        { key: 'createdAt', label: 'At', render: b => new Date(b.createdAt).toLocaleString() },
        { key: 'orderChannel', label: 'Channel' },
        { key: 'paymentMode', label: 'Payment' },
        { key: 'grandTotal', label: 'Total', render: b => money(b.grandTotal) },
        { key: 'printCount', label: 'Print count' }
      ]} /></Card>
      <Card title="Print jobs" description="Print jobs are not currently tagged per branch, so this list is shared across all branches."><DataTable rows={state.printJobs} empty="No print jobs" columns={[
        { key: 'type', label: 'Type' },
        { key: 'target', label: 'Target' },
        { key: 'payload', label: 'Payload' },
        { key: 'status', label: 'Status', render: j => <Pill tone={j.status === 'printed' ? 'green' : j.status === 'failed' ? 'red' : 'amber'}>{j.status}</Pill> },
        { key: 'createdAt', label: 'At', render: j => new Date(j.createdAt).toLocaleString() }
      ]} /></Card>
    </div>}

    {tab === 'Devices' && <div className="grid gap-5 md:grid-cols-2">
      <Card title="Hardware readiness" description="Printers, scales and in-store devices for this counter.">
        <div className="grid gap-3">{state.integrations.filter(i => i.category === 'hardware').map(i => <div key={i.id} className="flex items-start gap-3 rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
          <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${i.health === 'ok' ? 'bg-emerald-50 text-tgreen' : 'bg-marigold-50 text-marigold-700'}`}><Printer className="size-5" /></div>
          <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><b className="font-display text-sm text-ink">{i.name}</b><Pill tone={i.status === 'connected' ? 'green' : 'amber'}>{i.status.replaceAll('-', ' ')}</Pill></div><p className="mt-1 text-xs leading-5 text-ink-600">{i.notes}</p></div>
        </div>)}</div>
      </Card>
      <Card title="Payment / integration readiness" description="Aggregators, payments and messaging feeding this branch.">
        <div className="grid gap-3">{state.integrations.filter(i => i.category !== 'hardware').map(i => {
          const Icon = { aggregator: ShoppingBag, payment: CreditCard, communication: MessageCircle, accounting: FileSpreadsheet, maps: MapPin, ecommerce: Globe }[i.category as string] ?? Server;
          return <div key={i.id} className="flex items-start gap-3 rounded-lg border border-ink/10 bg-paper p-4 shadow-sm">
            <div className={`grid size-10 shrink-0 place-items-center rounded-lg ${i.health === 'ok' ? 'bg-emerald-50 text-tgreen' : 'bg-sky-50 text-sky-700'}`}><Icon className="size-5" /></div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><b className="font-display text-sm text-ink">{i.name}</b><Pill tone={i.status === 'missing-credentials' ? 'amber' : 'blue'}>{i.status.replaceAll('-', ' ')}</Pill></div><p className="mt-1 text-xs leading-5 text-ink-600">{i.notes}</p></div>
          </div>;
        })}</div>
      </Card>
    </div>}

    {tab === 'Debug' && <DebugPanel events={state.debugEvents} />}
  </Shell>;
}
