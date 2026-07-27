import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  Printer,
  Search,
  ShoppingCart,
  Smartphone,
  Store,
  Trash2,
  WalletCards,
  X
} from 'lucide-react';
import { ActionButton, Card, Field, inputClass, Pill } from './UI';
import { billTotals, money } from '../lib/calculations';
import { useBakeryStore } from '../state/BakeryStore';
import type { Bill, PaymentMode, Product, Branch } from '../lib/types';

function printBrandedBill(bill: Bill, products: Product[], branch: Branch | undefined) {
  const win = window.open('', '_blank', 'width=460,height=760');
  if (!win) return;
  const productMap = new Map(products.map(p => [p.id, p]));
  const dt = new Date(bill.createdAt);
  const halfTax = bill.taxTotal / 2;
  const fmt = (n: number) => `₹${n.toFixed(2)}`;
  const rows = bill.lines.map(line => {
    const p = productMap.get(line.productId);
    return `<tr><td>${p?.name ?? line.productId}</td><td class="c">${line.qty}</td><td class="r">${fmt(line.price)}</td><td class="r">${fmt(line.qty * line.price)}</td></tr>`;
  }).join('');
  win.document.write(`<!doctype html><html><head><title>Bill ${bill.billNo}</title><style>
    @page{size:80mm auto;margin:4mm}
    *{box-sizing:border-box}
    body{margin:0;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#241505;background:#fff;width:72mm}
    .head{text-align:center;padding-bottom:10px;border-bottom:2px solid #b06a2b}
    .head img{width:150px;border-radius:10px;margin-bottom:6px}
    .brand{font-family:Georgia,'Fraunces',serif;font-size:17px;font-weight:900;letter-spacing:.02em}
    .sub{font-size:10px;color:#7a6a55;margin-top:2px}
    .gst{margin-top:5px;display:inline-block;border:1px solid #d4a64f;border-radius:999px;padding:2px 10px;font-size:10px;font-weight:800;color:#8a5313;background:#fdf6e8}
    .tag{text-align:center;margin:8px 0 4px;font-size:10px;font-weight:900;letter-spacing:.25em;color:#8a5313}
    .meta{display:flex;justify-content:space-between;font-size:10.5px;color:#5c4a33;margin:2px 0}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{font-size:9.5px;text-transform:uppercase;letter-spacing:.08em;color:#8a5313;border-top:1px dashed #c9b48a;border-bottom:1px dashed #c9b48a;padding:5px 2px;text-align:left}
    td{padding:5px 2px;border-bottom:1px dotted #e8dcc6}
    .c{text-align:center}.r{text-align:right}
    .tot{margin-top:8px}
    .tot .line{display:flex;justify-content:space-between;padding:2.5px 0;color:#5c4a33}
    .tot .grand{display:flex;justify-content:space-between;margin-top:6px;padding:8px 10px;background:#241505;color:#f8d996;border-radius:12px;font-size:15px;font-weight:900}
    .pay{display:flex;justify-content:space-between;margin-top:7px;font-size:11px;font-weight:800;color:#8a5313}
    .foot{text-align:center;margin-top:12px;padding-top:9px;border-top:2px solid #b06a2b;font-size:10px;color:#7a6a55}
    .foot b{display:block;font-size:11.5px;color:#241505;margin-bottom:2px}
  </style></head><body>
    <div class="head">
      <img src="${window.location.origin}/brand/new-surya-client-logo.jpg" alt="New Surya" />
      <div class="brand">New Surya Sweets &amp; Savouries</div>
      <div class="sub">${branch?.name ?? ''}${branch?.address ? ' · ' + branch.address : ''}</div>
      <div class="sub">${branch?.phone ?? ''} · Pure Vegetarian</div>
      <div class="gst">GSTIN: ${branch?.gstin ?? '29AAFCN0000A1Z5'}</div>
    </div>
    <div class="tag">TAX INVOICE</div>
    <div class="meta"><span>Bill No: <b>${bill.billNo}</b></span><span>${dt.toLocaleDateString('en-IN')} ${dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
    <div class="meta"><span>Payment: <b style="text-transform:uppercase">${bill.paymentMode}</b></span><span>${bill.customerName ? 'Customer: ' + bill.customerName : 'Walk-in customer'}</span></div>
    <table><thead><tr><th>Item</th><th class="c">Qty</th><th class="r">Rate</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="tot">
      <div class="line"><span>Subtotal</span><span>${fmt(bill.subTotal)}</span></div>
      <div class="line"><span>Discount</span><span>-${fmt(bill.discountTotal)}</span></div>
      <div class="line"><span>CGST</span><span>${fmt(halfTax)}</span></div>
      <div class="line"><span>SGST</span><span>${fmt(halfTax)}</span></div>
      <div class="line"><span>Round off</span><span>${fmt(bill.roundOff)}</span></div>
      <div class="grand"><span>TOTAL</span><span>${fmt(bill.grandTotal)}</span></div>
      <div class="pay"><span>Paid</span><span>${fmt(bill.paidAmount)}</span></div>
    </div>
    <div class="foot"><b>Thank you for visiting!</b>Sweets · Bakery · Savouries — Since 1995<br/>This is a computer generated invoice.</div>
    <script>window.onload = () => { window.print(); }</script>
  </body></html>`);
  win.document.close();
}

const PAY_MODES: { mode: PaymentMode; label: string; icon: typeof Banknote }[] = [
  { mode: 'cash', label: 'Cash', icon: Banknote },
  { mode: 'upi', label: 'UPI', icon: Smartphone },
  { mode: 'card', label: 'Card', icon: CreditCard },
  { mode: 'credit', label: 'Credit', icon: WalletCards }
];

const TILE_COLORS = ['bg-amber-100 text-amber-900', 'bg-rose-100 text-rose-900', 'bg-emerald-100 text-emerald-900', 'bg-sky-100 text-sky-900', 'bg-violet-100 text-violet-900', 'bg-orange-100 text-orange-900'];

export default function QuickBilling() {
  const { state, dispatch, metrics } = useBakeryStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const billsBefore = useRef(state.bills.length);

  useEffect(() => {
    if (state.bills.length > billsBefore.current) {
      setSuccess(state.bills[0]?.billNo ?? 'Bill created');
      setCustomerName('');
      setCustomerPhone('');
      const timer = setTimeout(() => setSuccess(null), 2400);
      billsBefore.current = state.bills.length;
      return () => clearTimeout(timer);
    }
    billsBefore.current = state.bills.length;
  }, [state.bills]);

  const products = useMemo(() => state.products.filter(p => p.active !== false), [state.products]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const stockFor = (productId: string) => state.finishedStocks
    .filter(s => s.branchId === state.selectedBranchId && s.productId === productId)
    .reduce((sum, s) => sum + s.qty, 0);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter(p =>
      (category === 'All' || p.category === category) &&
      (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)));
  }, [products, category, search]);

  const totals = billTotals(state.cart, state.products);
  const cartCount = state.cart.reduce((sum, line) => sum + line.qty, 0);
  const session = metrics.openSession;
  const branch = state.branches.find(b => b.id === state.selectedBranchId);

  const openCounter = () => dispatch({ type: 'open-counter', branchId: state.selectedBranchId, cashier: 'Branch Cashier', terminal: 'Counter 1', openingCash: 2000 });
  const checkout = () => dispatch({ type: 'checkout', customerName: customerName || undefined, customerPhone: customerPhone || undefined });
  const lastIssue = state.debugEvents.find(e => e.module === 'Billing' && e.level !== 'success');

  return <div className="space-y-4" data-testid="quick-billing">
    {success && <div data-testid="quick-billing-success" className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 shadow-warm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="size-6 shrink-0 text-emerald-600" />
        <div><p className="font-display text-base font-bold">Bill {success} created</p><p className="text-xs opacity-80">Receipt queued to the thermal printer. Counter cash updated.</p></div>
      </div>
      <ActionButton tone="green" title="Print branded bill" data-testid="print-bill-button" className="shrink-0" onClick={() => state.bills[0] && printBrandedBill(state.bills[0], state.products, state.branches.find(b => b.id === state.bills[0].branchId) ?? branch)}><Printer className="size-4" />Print bill</ActionButton>
    </div>}

    {!session && <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><Store className="size-6 text-amber-700" /><div><p className="font-display text-base font-bold text-amber-900">Counter is closed</p><p className="text-xs text-amber-800/80">Open the counter with one tap to start billing at {branch?.name}.</p></div></div>
      <ActionButton tone="amber" onClick={openCounter} title="Open counter" className="shrink-0" data-testid="quick-billing-open-counter">Open counter · ₹2,000 float</ActionButton>
    </div>}

    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card title="Tap to add items" description={`Selling from ${branch?.name ?? 'branch'} · large touch tiles built for busy counters.`}>
        <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <Field label="Branch">
            <select className={inputClass} data-testid="quick-billing-branch" value={state.selectedBranchId} onChange={e => dispatch({ type: 'select-branch', branchId: e.target.value })}>
              {state.branches.filter(b => b.type !== 'central-kitchen').map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Search products">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-10`} data-testid="quick-billing-search" placeholder="Type item name or category…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button aria-label="Clear search" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X className="size-4" /></button>}
            </div>
          </Field>
        </div>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => <button key={c} onClick={() => setCategory(c)} data-testid={`quick-billing-category-${c.toLowerCase().replace(/\s+/g, '-')}`} className={`min-h-10 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors ${category === c ? 'border-[#a16207] bg-[#a16207] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-amber-50'}`}>{c}</button>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">
          {visible.map((p, index) => {
            const stock = stockFor(p.id);
            const inCart = state.cart.find(l => l.productId === p.id)?.qty ?? 0;
            return <button key={p.id} disabled={stock <= 0}
              onClick={() => dispatch({ type: 'add-to-cart', productId: p.id, qty: 1 })}
              data-testid={`product-tile-${p.id}`}
              className={`group relative flex min-h-[116px] flex-col justify-between rounded-2xl border p-3 text-left shadow-sm transition-colors ${stock > 0 ? 'border-slate-200 bg-white hover:border-[#d4a64f] hover:bg-amber-50/50' : 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-55'}`}>
              {inCart > 0 && <span className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-[#a16207] text-[11px] font-black text-white shadow">{inCart}</span>}
              <div className={`grid size-9 place-items-center rounded-xl text-sm font-black ${TILE_COLORS[index % TILE_COLORS.length]}`}>{p.name.slice(0, 2).toUpperCase()}</div>
              <div className="mt-2 min-w-0">
                <p className="line-clamp-2 text-[13px] font-bold leading-4 text-slate-900">{p.name}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[#9b671d]">{money(p.price)}</span>
                  <span className={`text-[10px] font-bold ${stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{stock > 0 ? `${stock} left` : 'No stock'}</span>
                </div>
              </div>
            </button>;
          })}
          {!visible.length && <p className="col-span-full py-8 text-center text-sm font-semibold text-slate-500">No products match your search</p>}
        </div>
      </Card>

      <div className="space-y-4 xl:sticky xl:top-24">
        <Card title={`Cart · ${cartCount} item${cartCount === 1 ? '' : 's'}`} description="Adjust quantities, pick a payment mode and bill in seconds."
          action={state.cart.length ? <ActionButton tone="red" title="Clear cart" onClick={() => dispatch({ type: 'clear-cart' })}><Trash2 className="size-4" />Clear</ActionButton> : undefined}>
          {!state.cart.length && <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
            <ShoppingCart className="size-8 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-500">Cart is empty — tap a product tile to add</p>
          </div>}
          <div className="space-y-2">
            {state.cart.map(line => {
              const product = state.products.find(p => p.id === line.productId);
              return <div key={line.productId} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-2.5" data-testid={`cart-line-${line.productId}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">{product?.name}</p>
                  <p className="text-xs text-slate-500">{money(line.price)} each</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button aria-label="Decrease quantity" data-testid={`cart-minus-${line.productId}`} onClick={() => line.qty > 1 ? dispatch({ type: 'set-cart-line', productId: line.productId, qty: line.qty - 1 }) : dispatch({ type: 'remove-cart-line', productId: line.productId })} className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"><Minus className="size-4" /></button>
                  <span className="w-8 text-center text-sm font-black text-slate-900">{line.qty}</span>
                  <button aria-label="Increase quantity" data-testid={`cart-plus-${line.productId}`} onClick={() => dispatch({ type: 'add-to-cart', productId: line.productId, qty: 1 })} className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"><Plus className="size-4" /></button>
                </div>
                <p className="w-20 text-right font-display text-sm font-bold text-slate-950">{money(line.qty * line.price)}</p>
              </div>;
            })}
          </div>

          {state.cart.length > 0 && <>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Field label="Customer name (optional)"><input className={inputClass} data-testid="quick-billing-customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walk-in customer" /></Field>
              <Field label="Phone (optional)"><input className={inputClass} data-testid="quick-billing-customer-phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="98450 00000" /></Field>
            </div>
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold text-slate-600">Payment mode</p>
              <div className="grid grid-cols-4 gap-2">
                {PAY_MODES.map(({ mode, label, icon: Icon }) => <button key={mode} data-testid={`pay-mode-${mode}`} onClick={() => dispatch({ type: 'set-payment-mode', mode })} className={`flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition-colors ${state.selectedPaymentMode === mode ? 'border-[#a16207] bg-[#a16207]/10 text-[#8a5313]' : 'border-slate-200 bg-white text-slate-600 hover:bg-amber-50'}`}><Icon className="size-5" />{label}</button>)}
              </div>
            </div>
            <div className="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{money(totals.subTotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>Discount</span><span>-{money(totals.discountTotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>GST</span><span>{money(totals.taxTotal)}</span></div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-2 font-display text-lg font-black text-slate-950"><span>Total</span><span data-testid="quick-billing-total">{money(totals.grandTotal)}</span></div>
            </div>
            {!session && <p className="mt-2 text-xs font-semibold text-amber-700">Open the counter above before completing the bill.</p>}
            {lastIssue && session && <p className="mt-2 text-xs font-semibold text-rose-600">{lastIssue.message}{lastIssue.detail ? ` — ${lastIssue.detail}` : ''}</p>}
            <ActionButton tone="green" disabled={!session} onClick={checkout} title="Complete bill" className="mt-3 w-full text-base" data-testid="quick-billing-checkout">
              Complete bill · {money(totals.grandTotal)}
            </ActionButton>
          </>}
        </Card>

        <Card title="Today at this counter" description="Live session summary."
          action={state.bills.length > 0 ? <ActionButton tone="slate" title="Reprint last bill" data-testid="reprint-last-bill" onClick={() => printBrandedBill(state.bills[0], state.products, state.branches.find(b => b.id === state.bills[0].branchId) ?? branch)}><Printer className="size-4" />Last bill</ActionButton> : undefined}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Sales</p><p className="font-display mt-1 text-base font-black text-emerald-800">{money(metrics.salesToday)}</p></div>
            <div className="rounded-2xl bg-sky-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Bills</p><p className="font-display mt-1 text-base font-black text-sky-800">{state.bills.filter(b => b.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10)).length}</p></div>
            <div className="rounded-2xl bg-amber-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Session</p><p className="mt-1.5"><Pill tone={session ? 'green' : 'amber'}>{session ? 'Open' : 'Closed'}</Pill></p></div>
          </div>
        </Card>
      </div>
    </div>
  </div>;
}
