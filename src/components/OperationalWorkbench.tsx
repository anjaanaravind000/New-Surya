import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardPlus,
  IndianRupee,
  Pencil,
  Plus,
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
};

type Definition = {
  description: string;
  recordLabel: string;
  partyLabel: string;
  amountLabel: string;
};

const definitions: Record<string, Definition> = {
  Expenses: { description: 'Enter, approve, track and export every operating expense.', recordLabel: 'Expense reference', partyLabel: 'Category / paid to', amountLabel: 'Amount' },
  Complaints: { description: 'Assign customer and operational issues with a visible resolution trail.', recordLabel: 'Complaint number', partyLabel: 'Customer / owner', amountLabel: 'Impact value' },
  Quotations: { description: 'Prepare quotations, track approvals and convert accepted quotes.', recordLabel: 'Quotation number', partyLabel: 'Customer', amountLabel: 'Quoted value' },
  'Purchase Returns': { description: 'Record supplier returns, reasons, settlement and stock impact.', recordLabel: 'Return number', partyLabel: 'Supplier', amountLabel: 'Return value' },
  'Supplier Payments': { description: 'Allocate supplier payments and retain references for reconciliation.', recordLabel: 'Payment reference', partyLabel: 'Supplier', amountLabel: 'Paid amount' },
  'Bank Deposits': { description: 'Track cash deposits, bank acknowledgements and pending deposits.', recordLabel: 'Deposit slip', partyLabel: 'Bank / account', amountLabel: 'Deposit amount' },
  'Current Cash': { description: 'Monitor expected, counted and allocated cash across active counters.', recordLabel: 'Cash sheet', partyLabel: 'Counter / custodian', amountLabel: 'Cash amount' },
  'Payment Mode Edit': { description: 'Correct payment allocation with maker-checker approval and history.', recordLabel: 'Bill number', partyLabel: 'Requested by', amountLabel: 'Bill value' },
  Alerts: { description: 'Prioritise operational alerts and assign accountable owners.', recordLabel: 'Alert reference', partyLabel: 'Assigned owner', amountLabel: 'Exposure' },
  Notifications: { description: 'Create and track branch, kitchen and management notifications.', recordLabel: 'Notification ID', partyLabel: 'Audience', amountLabel: 'Related value' },
  'Waste Logs': { description: 'Capture dump, damage and transfer-out records with verification.', recordLabel: 'Waste reference', partyLabel: 'Verified by', amountLabel: 'Loss value' },
  'Daily Stock Take': { description: 'Save physical counts, variances and evidence for approval.', recordLabel: 'Count sheet', partyLabel: 'Counter / area', amountLabel: 'Variance value' },
  'Purchase Invoice': { description: 'Capture invoice totals, matching status and review ownership.', recordLabel: 'Invoice number', partyLabel: 'Supplier', amountLabel: 'Invoice total' },
  'Purchase Order': { description: 'Plan requirements, approve orders and follow supplier fulfilment.', recordLabel: 'PO number', partyLabel: 'Supplier', amountLabel: 'Order value' },
  'Packing Queue': { description: 'Track packed quantity, shortages, labels and dispatch readiness.', recordLabel: 'Packing batch', partyLabel: 'Assigned packer', amountLabel: 'Batch value' },
  'Baker Queue': { description: 'Sequence production jobs and record accountable batch ownership.', recordLabel: 'Batch number', partyLabel: 'Assigned baker', amountLabel: 'Planned value' },
};

const defaultDefinition: Definition = {
  description: 'Create, edit, approve and review operational records from one controlled workspace.',
  recordLabel: 'Reference',
  partyLabel: 'Owner / party',
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
  const [form, setForm] = useState({ reference: '', party: '', amount: '', dueDate: new Date().toISOString().slice(0, 10), notes: '' });

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
    setForm({ reference: '', party: '', amount: '', dueDate: new Date().toISOString().slice(0, 10), notes: '' });
  };

  const saveRecord = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount || 0);
    if (!form.reference.trim() || !form.party.trim()) return;
    if (editingId) {
      setRows(current => current.map(row => row.id === editingId ? { ...row, ...form, amount, updatedAt: new Date().toISOString() } : row));
    } else {
      setRows(current => [{ id: crypto.randomUUID(), ...form, amount, status: 'Pending', updatedAt: new Date().toISOString() }, ...current]);
    }
    clearForm();
  };

  const editRecord = (record: WorkRecord) => {
    setEditingId(record.id);
    setForm({ reference: record.reference, party: record.party, amount: String(record.amount), dueDate: record.dueDate, notes: record.notes });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const advanceStatus = (id: string) => setRows(current => current.map(row => {
    if (row.id !== id) return row;
    const next = row.status === 'Draft' ? 'Pending' : row.status === 'Pending' ? 'Approved' : 'Completed';
    return { ...row, status: next, updatedAt: new Date().toISOString() };
  }));

  return <div className="space-y-5">
    <section className="overflow-hidden border border-slate-800 bg-[#151a1f] text-white shadow-lg">
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#e6bc72]"><Activity className="size-4" />{scope.replace('-', ' ').toUpperCase()} OPERATIONS</div>
          <h2 className="mt-2 text-2xl font-extrabold text-white">{module}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{definition.description} {branchName ? `Current location: ${branchName}.` : ''}</p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-white/10 border border-white/10 bg-white/[.04] p-3 text-center">
          <div><b className="text-xl text-white">{rows.length}</b><p className="mt-1 text-[10px] font-bold text-slate-400">RECORDS</p></div>
          <div><b className="text-xl text-amber-300">{pending}</b><p className="mt-1 text-[10px] font-bold text-slate-400">PENDING</p></div>
          <div><b className="text-xl text-emerald-300">{completed}</b><p className="mt-1 text-[10px] font-bold text-slate-400">CLOSED</p></div>
        </div>
      </div>
    </section>

    <div className="grid gap-4 md:grid-cols-3">
      <Metric icon={ClipboardPlus} label="Total records" value={String(rows.length)} helper="Saved in this operational register." tone="blue" />
      <Metric icon={IndianRupee} label="Tracked value" value={money(totalValue)} helper="Combined value or quantity exposure." tone="purple" />
      <Metric icon={CheckCircle2} label="Completion" value={`${rows.length ? Math.round((completed / rows.length) * 100) : 0}%`} helper="Records fully completed." tone="green" />
    </div>

    <div className="grid items-start gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
      <Card title={editingId ? `Edit ${definition.recordLabel}` : `Add ${definition.recordLabel}`} description="All saved changes remain available when this dashboard is reopened.">
        <form className="space-y-3" onSubmit={saveRecord}>
          <Field label={definition.recordLabel}><input required className={inputClass} value={form.reference} onChange={event => setForm(current => ({ ...current, reference: event.target.value }))} placeholder="Enter reference" /></Field>
          <Field label={definition.partyLabel}><input required className={inputClass} value={form.party} onChange={event => setForm(current => ({ ...current, party: event.target.value }))} placeholder="Select or enter owner" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={definition.amountLabel}><input className={inputClass} type="number" min="0" step="0.01" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} /></Field>
            <Field label="Due date"><input className={inputClass} type="date" value={form.dueDate} onChange={event => setForm(current => ({ ...current, dueDate: event.target.value }))} /></Field>
          </div>
          <Field label="Notes"><textarea className={`${inputClass} h-24 resize-none py-3`} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="Reason, supporting details or follow-up" /></Field>
          <div className="flex gap-2">
            <button className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-700" type="submit"><Save className="size-4" />{editingId ? 'Save changes' : 'Add record'}</button>
            {editingId && <button className="min-h-10 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600" type="button" onClick={clearForm}>Cancel</button>}
          </div>
        </form>
      </Card>

      <Card title="Activity visualization" description="Eight-period operational volume for quick comparison.">
        <div className="flex h-44 items-end gap-2 border-b border-slate-200 px-2 pb-2">
          {chart.map((value, index) => <div key={index} className="group flex h-full flex-1 items-end"><div title={`Period ${index + 1}: ${value}`} className="w-full rounded-t-sm bg-sky-500 transition hover:bg-[#b8872d]" style={{ height: `${value}%` }} /></div>)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500"><span>Previous periods</span><span className="inline-flex items-center gap-1 text-emerald-700"><TrendingUp className="size-4" />Live operational trend</span></div>
      </Card>
    </div>

    <Card title={`${module} register`} description="Search, edit, approve or remove a record. Every action is available to the assigned role.">
      <div className="relative mb-3 max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-9`} value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this register" /></div>
      <DataTable rows={filtered} empty="No records in this register" columns={[
        { key: 'reference', label: 'Reference' },
        { key: 'party', label: definition.partyLabel },
        { key: 'amount', label: definition.amountLabel, render: row => money(row.amount) },
        { key: 'dueDate', label: 'Due date' },
        { key: 'status', label: 'Status', render: row => <Pill tone={statusTone(row.status)}>{row.status}</Pill> },
        { key: 'notes', label: 'Notes' },
        { key: 'id', label: 'Actions', render: row => <div className="flex gap-2">
          <ActionButton title="Edit record" tone="blue" onClick={() => editRecord(row)}><Pencil className="size-4" /></ActionButton>
          <ActionButton title="Move to next status" tone="green" disabled={row.status === 'Completed'} onClick={() => advanceStatus(row.id)}><CheckCircle2 className="size-4" /></ActionButton>
          <ActionButton title="Delete record" tone="red" onClick={() => setRows(current => current.filter(item => item.id !== row.id))}><Trash2 className="size-4" /></ActionButton>
        </div> }
      ]} />
    </Card>
  </div>;
}
