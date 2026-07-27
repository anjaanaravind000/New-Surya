import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardPlus,
  IndianRupee,
  Pencil,
  Printer,
  Save,
  Search,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { ActionButton, Card, DataTable, Field, inputClass, Metric, Pill } from './UI';
import { money } from '../lib/calculations';
import type { WorkbenchScope } from '../lib/roleExtensions';

type WorkRecord = {
  id: string;
  reference: string;
  party: string;
  amount: number;
  dueDate: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Completed';
  notes: string;
  updatedAt: string;
  /** Optional: extra field used only by Cake Bookings (advance collected) */
  advance?: number;
  /** Optional: extra field used only by Cake Bookings (customer phone) */
  contact?: string;
};

type Definition = {
  description: string;
  recordLabel: string;
  partyLabel: string;
  amountLabel: string;
};

const definitions: Record<string, Definition> = {
  Expenses: { description: 'Enter, approve, track and export every operating expense.', recordLabel: 'Expense reference', partyLabel: 'Category / paid to', amountLabel: 'Amount' },
  Complaints: { description: 'Assign customer and operational issues with a visible resolution trail.', recordLabel: 'Complaint number', partyLabel: 'Customer / executive', amountLabel: 'Impact value' },
  Quotations: { description: 'Prepare quotations, track approvals and convert accepted quotes.', recordLabel: 'Quotation number', partyLabel: 'Customer', amountLabel: 'Quoted value' },
  'Purchase Returns': { description: 'Record supplier returns, reasons, settlement and stock impact.', recordLabel: 'Return number', partyLabel: 'Supplier', amountLabel: 'Return value' },
  'Supplier Payments': { description: 'Allocate supplier payments and retain references for reconciliation.', recordLabel: 'Payment reference', partyLabel: 'Supplier', amountLabel: 'Paid amount' },
  'Bank Deposits': { description: 'Track cash deposits, bank acknowledgements and pending deposits.', recordLabel: 'Deposit slip', partyLabel: 'Bank / account', amountLabel: 'Deposit amount' },
  'Current Cash': { description: 'Monitor expected, counted and allocated cash across active counters.', recordLabel: 'Cash sheet', partyLabel: 'Counter / custodian', amountLabel: 'Cash amount' },
  'Payment Mode Edit': { description: 'Correct payment allocation with maker-checker approval and history.', recordLabel: 'Bill number', partyLabel: 'Requested by', amountLabel: 'Bill value' },
  Alerts: { description: 'Prioritise operational alerts and assign accountable executives.', recordLabel: 'Alert reference', partyLabel: 'Assigned executive', amountLabel: 'Exposure' },
  Notifications: { description: 'Create and track branch, kitchen and management notifications.', recordLabel: 'Notification ID', partyLabel: 'Audience', amountLabel: 'Related value' },
  'Waste Logs': { description: 'Capture dump, damage and transfer-out records with verification.', recordLabel: 'Waste reference', partyLabel: 'Verified by', amountLabel: 'Loss value' },
  'Daily Stock Take': { description: 'Save physical counts, variances and evidence for approval.', recordLabel: 'Count sheet', partyLabel: 'Counter / area', amountLabel: 'Variance value' },
  'Purchase Invoice': { description: 'Capture invoice totals, matching status and review executiveship.', recordLabel: 'Invoice number', partyLabel: 'Supplier', amountLabel: 'Invoice total' },
  'Purchase Order': { description: 'Plan requirements, approve orders and follow supplier fulfilment.', recordLabel: 'PO number', partyLabel: 'Supplier', amountLabel: 'Order value' },
  'Packing Queue': { description: 'Track packed quantity, shortages, labels and dispatch readiness.', recordLabel: 'Packing batch', partyLabel: 'Assigned packer', amountLabel: 'Batch value' },
  'Production Queue': { description: 'Sequence production jobs and record accountable batch executiveship.', recordLabel: 'Batch number', partyLabel: 'Assigned baker', amountLabel: 'Planned value' },
  'Festival & Season Planner': { description: 'Plan festival specials, seasonal menus, production ramp-ups and pre-booking targets.', recordLabel: 'Festival plan', partyLabel: 'Festival / season', amountLabel: 'Target revenue' },
  'Marketing Campaigns': { description: 'Run offers, social promotions and locality campaigns with budget and response tracking.', recordLabel: 'Campaign code', partyLabel: 'Channel / audience', amountLabel: 'Budget' },
  'Franchise Enquiries': { description: 'Track franchise leads, site evaluations, agreements and onboarding milestones.', recordLabel: 'Enquiry reference', partyLabel: 'Prospect / location', amountLabel: 'Investment value' },
  'Gift Hampers': { description: 'Build corporate and festive hamper offers, track orders and delivery commitments.', recordLabel: 'Hamper order', partyLabel: 'Customer / company', amountLabel: 'Order value' },
  'Cake Bookings': { description: 'Capture custom cake bookings with delivery date, advance collected and design notes.', recordLabel: 'Booking number', partyLabel: 'Customer', amountLabel: 'Cake value' },
  'Party & Bulk Orders': { description: 'Manage party trays and bulk orders with advances, delivery slots and kitchen handoff.', recordLabel: 'Order number', partyLabel: 'Customer / event', amountLabel: 'Order value' },
  'Customer Feedback': { description: 'Log praise and complaints from the counter with follow-up ownership.', recordLabel: 'Feedback reference', partyLabel: 'Customer', amountLabel: 'Goodwill value' },
  'Home Delivery': { description: 'Track home delivery orders, riders, delivery status and collection amounts.', recordLabel: 'Delivery number', partyLabel: 'Customer / rider', amountLabel: 'Order value' },
  'Shift Roster': { description: 'Plan staff shifts, weekly offs and swap approvals for the outlet.', recordLabel: 'Roster entry', partyLabel: 'Staff member', amountLabel: 'Shift hours' },
  'Local Promotions': { description: 'Run outlet-level promotions and sampling drives with cost and outcome tracking.', recordLabel: 'Promotion code', partyLabel: 'Locality / audience', amountLabel: 'Spend' },
  'New Product Trials': { description: 'Track trial bakes, tasting scores, costing and launch approvals for new items.', recordLabel: 'Trial batch', partyLabel: 'Product / chef', amountLabel: 'Trial cost' },
  'Equipment Maintenance': { description: 'Schedule oven, mixer and chiller maintenance with AMC and breakdown history.', recordLabel: 'Service ticket', partyLabel: 'Equipment / vendor', amountLabel: 'Service cost' },
  'Expiry Watchlist': { description: 'Watch items nearing expiry, plan markdowns and record disposal approvals.', recordLabel: 'Watch entry', partyLabel: 'Item / batch', amountLabel: 'Stock value' },
  'Vendor Rate Contracts': { description: 'Maintain negotiated vendor rates, validity and renewal reminders.', recordLabel: 'Contract number', partyLabel: 'Vendor', amountLabel: 'Contract value' },
};

const defaultDefinition: Definition = {
  description: 'Create, edit, approve and review operational records from one controlled workspace.',
  recordLabel: 'Reference',
  partyLabel: 'Responsible party',
  amountLabel: 'Value / quantity'
};

function hashValue(value: string) {
  return [...value].reduce((total, character) => total + character.charCodeAt(0), 0);
}

function initialRows(module: string): WorkRecord[] {
  const seed = hashValue(module);
  const today = new Date();
  return [0, 1, 2].map(index => {
    const due = new Date(today);
    due.setDate(today.getDate() + index);
    return {
      id: `${module.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
      reference: `${module.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase() || 'OPS'}-${String(seed + index + 1).slice(-4)}`,
      party: index === 0 ? 'Morning operations' : index === 1 ? 'Branch review' : 'Management approval',
      amount: 750 + ((seed * (index + 3)) % 7200),
      dueDate: due.toISOString().slice(0, 10),
      status: index === 0 ? 'Pending' : index === 1 ? 'Approved' : 'Completed',
      notes: index === 0 ? 'Needs attention today' : index === 1 ? 'Checked against source record' : 'Completed with audit trail',
      updatedAt: new Date(Date.now() - index * 3_600_000).toISOString()
    };
  });
}

function statusTone(status: WorkRecord['status']) {
  if (status === 'Completed') return 'green' as const;
  if (status === 'Approved') return 'blue' as const;
  if (status === 'Pending') return 'amber' as const;
  return 'slate' as const;
}

export default function OperationalWorkbench({ scope, module, branchName }: { scope: WorkbenchScope; module: string; branchName?: string }) {
  const definition = definitions[module] ?? defaultDefinition;
  const storageKey = `new-surya-workbench-${scope}-${module.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const [rows, setRows] = useState<WorkRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) as WorkRecord[] : initialRows(module);
    } catch {
      return initialRows(module);
    }
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ reference: '', party: '', amount: '', dueDate: new Date().toISOString().slice(0, 10), notes: '', advance: '', contact: '' });
  const isCakeBooking = module === 'Cake Bookings';

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  }, [rows, storageKey]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return !term ? rows : rows.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(term)));
  }, [query, rows]);
  const pending = rows.filter(row => row.status === 'Pending' || row.status === 'Draft').length;
  const completed = rows.filter(row => row.status === 'Completed').length;
  const totalValue = rows.reduce((total, row) => total + row.amount, 0);
  const chart = useMemo(() => Array.from({ length: 8 }, (_, index) => 28 + ((hashValue(module) * (index + 5)) % 68)), [module]);

  const clearForm = () => {
    setEditingId(null);
    setForm({ reference: '', party: '', amount: '', dueDate: new Date().toISOString().slice(0, 10), notes: '', advance: '', contact: '' });
  };

  const saveRecord = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount || 0);
    const advance = Number(form.advance || 0);
    if (!form.reference.trim() || !form.party.trim()) return;
    if (editingId) {
      setRows(current => current.map(row => row.id === editingId ? { ...row, ...form, amount, advance: isCakeBooking ? advance : row.advance, contact: isCakeBooking ? form.contact : row.contact, updatedAt: new Date().toISOString() } : row));
    } else {
      setRows(current => [{ id: crypto.randomUUID(), reference: form.reference, party: form.party, amount, dueDate: form.dueDate, notes: form.notes, advance: isCakeBooking ? advance : undefined, contact: isCakeBooking ? form.contact : undefined, status: 'Pending', updatedAt: new Date().toISOString() }, ...current]);
    }
    clearForm();
  };

  const editRecord = (record: WorkRecord) => {
    setEditingId(record.id);
    setForm({ reference: record.reference, party: record.party, amount: String(record.amount), dueDate: record.dueDate, notes: record.notes, advance: record.advance != null ? String(record.advance) : '', contact: record.contact ?? '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const advanceStatus = (id: string) => setRows(current => current.map(row => {
    if (row.id !== id) return row;
    const next = row.status === 'Draft' ? 'Pending' : row.status === 'Pending' ? 'Approved' : 'Completed';
    return { ...row, status: next, updatedAt: new Date().toISOString() };
  }));

  const printCakeBookingSlip = (record: WorkRecord) => {
    const win = window.open('', '_blank', 'width=460,height=780');
    if (!win) return;
    const value = record.amount || 0;
    const advance = record.advance || 0;
    const balance = Math.max(0, value - advance);
    const fmt = (n: number) => `₹${n.toFixed(2)}`;
    const created = new Date(record.updatedAt);
    const delivery = new Date(record.dueDate);
    const brandOrigin = window.location.origin;
    win.document.write(`<!doctype html><html><head><title>Cake Booking ${record.reference}</title><style>
      @page{size:80mm auto;margin:4mm}
      *{box-sizing:border-box}
      body{margin:0;font-family:'Inter',Arial,sans-serif;font-size:12px;color:#241505;background:#fff;width:72mm}
      .head{text-align:center;padding-bottom:10px;border-bottom:2px solid #b06a2b}
      .head img{width:150px;border-radius:10px;margin-bottom:6px}
      .brand{font-family:Georgia,'Fraunces',serif;font-size:17px;font-weight:900;letter-spacing:.02em}
      .sub{font-size:10px;color:#7a6a55;margin-top:2px}
      .badge{margin-top:6px;display:inline-block;border:1px solid #e8b4a0;border-radius:999px;padding:3px 12px;font-size:10.5px;font-weight:900;color:#a63d1e;background:#fef1ec;letter-spacing:.14em;text-transform:uppercase}
      .tag{text-align:center;margin:10px 0 4px;font-size:11px;font-weight:900;letter-spacing:.24em;color:#8a5313}
      .meta{display:flex;justify-content:space-between;font-size:10.5px;color:#5c4a33;margin:3px 0}
      .meta b{color:#241505}
      .divider{border-top:1px dashed #cbb489;margin:9px 0}
      .card{background:#fdf6e8;border:1px solid #e8d5a8;border-radius:12px;padding:10px 12px;margin-top:8px}
      .card .row{display:flex;justify-content:space-between;padding:2px 0;font-size:11.5px;color:#5c4a33}
      .card .row b{color:#241505}
      .grand{display:flex;justify-content:space-between;margin-top:8px;padding:9px 12px;background:#241505;color:#f8d996;border-radius:12px;font-size:15px;font-weight:900}
      .signature{margin-top:14px;display:flex;justify-content:space-between;font-size:10px;color:#7a6a55}
      .signature div{border-top:1px solid #b06a2b;padding-top:5px;width:44%;text-align:center;font-weight:800}
      .foot{text-align:center;margin-top:12px;padding-top:9px;border-top:2px solid #b06a2b;font-size:9.5px;color:#7a6a55;line-height:1.5}
      .foot b{display:block;font-size:11.5px;color:#241505;margin-bottom:2px}
      .notes{margin-top:10px;padding:8px 10px;border-left:3px solid #b06a2b;background:#faf3e3;font-size:11px;color:#5c4a33;line-height:1.45;border-radius:6px}
    </style></head><body>
      <div class="head">
        <img src="${brandOrigin}/brand/new-surya-client-logo.jpg" alt="New Surya" onerror="this.style.display='none'" />
        <div class="brand">New Surya Sweets &amp; Savouries</div>
        <div class="sub">Custom Cakes · Party Trays · Bulk Orders</div>
        <div class="badge">Cake Booking Slip</div>
      </div>
      <div class="tag">ADVANCE RECEIPT</div>
      <div class="meta"><span>Booking No: <b>${record.reference}</b></span><span>${created.toLocaleDateString('en-IN')} ${created.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span></div>
      <div class="divider"></div>
      <div class="meta"><span>Customer:</span><b>${record.party || 'Walk-in'}</b></div>
      ${record.contact ? `<div class="meta"><span>Contact:</span><b>${record.contact}</b></div>` : ''}
      <div class="meta"><span>Delivery date:</span><b style="color:#a63d1e">${delivery.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</b></div>
      <div class="meta"><span>Status:</span><b>${record.status}</b></div>
      ${record.notes ? `<div class="notes"><b style="display:block;color:#241505;font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:3px">Design &amp; Instructions</b>${record.notes.replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</div>` : ''}
      <div class="card">
        <div class="row"><span>Cake value</span><b>${fmt(value)}</b></div>
        <div class="row"><span>Advance collected</span><b style="color:#0b7a3f">${fmt(advance)}</b></div>
        <div class="row"><span>Balance due on delivery</span><b style="color:#a63d1e">${fmt(balance)}</b></div>
      </div>
      <div class="grand"><span>TOTAL VALUE</span><span>${fmt(value)}</span></div>
      <div class="signature"><div>Customer signature</div><div>Received by</div></div>
      <div class="foot"><b>Thank you for booking with us!</b>Kindly collect this slip on delivery.<br/>For changes, call at least 24 hours before delivery.<br/>This is a computer generated advance receipt.</div>
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
    win.document.close();
  };

  return <div className="space-y-5">
    <div className="grid gap-4 md:grid-cols-3">
      <Metric icon={ClipboardPlus} label="Total records" value={String(rows.length)} helper="Saved in this operational register." tone="blue" />
      <Metric icon={IndianRupee} label="Tracked value" value={money(totalValue)} helper={isCakeBooking ? 'Total cake booking value.' : 'Combined value or quantity exposure.'} tone="purple" />
      <Metric icon={CheckCircle2} label="Completion" value={`${rows.length ? Math.round((completed / rows.length) * 100) : 0}%`} helper="Records fully completed." tone="green" />
    </div>

    <div className="grid items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
      <Card title={editingId ? `Edit ${definition.recordLabel}` : `Add ${definition.recordLabel}`} description={`${definition.description}${branchName ? ' Current location: ' + branchName + '.' : ''}`}>
        <form className="space-y-3" onSubmit={saveRecord}>
          <Field label={definition.recordLabel}><input required className={inputClass} value={form.reference} onChange={event => setForm(current => ({ ...current, reference: event.target.value }))} placeholder="Enter reference" /></Field>
          <Field label={definition.partyLabel}><input required className={inputClass} value={form.party} onChange={event => setForm(current => ({ ...current, party: event.target.value }))} placeholder="Select or enter responsible person" /></Field>
          {isCakeBooking && <Field label="Customer phone"><input className={inputClass} value={form.contact} onChange={event => setForm(current => ({ ...current, contact: event.target.value }))} placeholder="Mobile number" /></Field>}
          <div className="grid grid-cols-2 gap-3">
            <Field label={definition.amountLabel}><input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} /></Field>
            <Field label={isCakeBooking ? 'Delivery date' : 'Due date'}><input className={inputClass} type="date" value={form.dueDate} onChange={event => setForm(current => ({ ...current, dueDate: event.target.value }))} /></Field>
          </div>
          {isCakeBooking && <Field label="Advance collected"><input className={inputClass} type="number" min="0" step="0.01" value={form.advance} onChange={event => setForm(current => ({ ...current, advance: event.target.value }))} placeholder="0.00" /></Field>}
          <Field label={isCakeBooking ? 'Design notes & flavour' : 'Notes'}><textarea className={`${inputClass} h-24 resize-none py-3`} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder={isCakeBooking ? 'e.g. 1kg pineapple, name on top, no eggs' : 'Reason, supporting details or follow-up'} /></Field>
          <div className="flex gap-2">
            <ActionButton type="submit" tone="green" className="flex-1"><Save className="size-4" />{editingId ? 'Save changes' : (isCakeBooking ? 'Book cake' : 'Add record')}</ActionButton>
            {editingId && <ActionButton tone="slate" onClick={clearForm}>Cancel</ActionButton>}
          </div>
        </form>
      </Card>

      <Card title="Activity visualization" description="Eight-period operational volume for quick comparison.">
        <div className="flex h-44 items-end gap-2 rounded-xl border border-[hsl(var(--pn-gold))]/12 bg-[hsl(var(--pn-espresso))]/50 p-3">
          {chart.map((value, index) => <div key={index} className="group flex h-full flex-1 items-end"><div title={`Period ${index + 1}: ${value}`} className="w-full rounded-t-md bg-gradient-to-t from-[hsl(var(--pn-cocoa))]/60 to-[hsl(var(--pn-gold))]/70 transition hover:brightness-125" style={{ height: `${value}%` }} /></div>)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-[hsl(var(--pn-cream-mute))]"><span>Previous periods</span><span className="inline-flex items-center gap-1 text-[hsl(var(--pn-pistachio))]"><TrendingUp className="size-4" />Live operational trend</span></div>
      </Card>
    </div>

    <Card title={`${module} register`} description="Search, edit, approve or remove a record. Every action is available to the assigned role.">
      <div className="relative mb-3 max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--pn-cream-mute))]" /><input className={`${inputClass} pl-9`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this register" /></div>
      <DataTable rows={filtered} empty="No records in this register" columns={[
        { key: 'reference', label: 'Reference' },
        { key: 'party', label: definition.partyLabel },
        { key: 'amount', label: definition.amountLabel, render: row => money(row.amount) },
        ...(isCakeBooking ? [{ key: 'advance', label: 'Advance', render: (row: WorkRecord) => money(row.advance ?? 0) }] : []),
        { key: 'dueDate', label: isCakeBooking ? 'Delivery' : 'Due date' },
        { key: 'status', label: 'Status', render: row => <Pill tone={statusTone(row.status)}>{row.status}</Pill> },
        { key: 'notes', label: 'Notes' },
        { key: 'id', label: 'Actions', render: row => <div className="flex gap-2">
          {isCakeBooking && <ActionButton title="Print booking slip" tone="amber" data-testid={`print-booking-${row.id}`} onClick={() => printCakeBookingSlip(row)}><Printer className="size-4" /></ActionButton>}
          <ActionButton title="Edit record" tone="blue" onClick={() => editRecord(row)}><Pencil className="size-4" /></ActionButton>
          <ActionButton title="Move to next status" tone="green" disabled={row.status === 'Completed'} onClick={() => advanceStatus(row.id)}><CheckCircle2 className="size-4" /></ActionButton>
          <ActionButton title="Delete record" tone="red" onClick={() => setRows(current => current.filter(item => item.id !== row.id))}><Trash2 className="size-4" /></ActionButton>
        </div> }
      ]} />
    </Card>
  </div>;
}
