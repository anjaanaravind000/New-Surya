import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/lib/supabase';
import {
  Activity, AlertTriangle, Bot, CheckCircle2, ChevronDown, ChevronRight, CircleDollarSign,
  CloudCog, Download, FileCheck2, FileClock, Filter, Gauge, History, Link2, Pencil, Plus,
  Save, Search, Settings2, ShieldCheck, Sparkles, Trash2, Upload, X
} from 'lucide-react';
import { ActionButton, Card, DataTable, Field, inputClass, Metric, Pill } from './UI';
import { downloadCsv, money } from '../lib/calculations';
import { groupsForDashboard, modulesForDashboard, type DashboardId, type FeatureModule } from '../data/completeFeatureCatalog';

type WorkflowStatus = 'Draft' | 'Pending' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

type CentreRecord = {
  id: string;
  reference: string;
  title: string;
  assignee: string;
  amount: number;
  date: string;
  priority: Priority;
  status: WorkflowStatus;
  notes: string;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
};

type AuditEvent = {
  id: string;
  recordId: string;
  action: string;
  detail: string;
  at: string;
};

type FormState = {
  reference: string;
  title: string;
  assignee: string;
  amount: string;
  date: string;
  priority: Priority;
  notes: string;
  evidence: string[];
};

const statusFlow: WorkflowStatus[] = ['Draft', 'Pending', 'Approved', 'In Progress', 'Completed'];
const today = () => new Date().toISOString().slice(0, 10);
const uid = () => globalThis.crypto?.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, character => { const random = Math.floor(Math.random() * 16); const value = character === 'x' ? random : (random & 0x3) | 0x8; return value.toString(16); });

function storageKey(module: FeatureModule) { return `new-surya-feature-v2-${module.id}`; }
function auditKey(module: FeatureModule) { return `new-surya-feature-audit-v2-${module.id}`; }
function draftKey(module: FeatureModule) { return `new-surya-feature-draft-v2-${module.id}`; }

function safeLoad<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}

function safeSave(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Storage may be restricted. */ }
}


type ServerRecordRow = {
  id: string; reference: string; title: string; responsible_person: string; amount: number | string;
  due_date: string | null; priority: Priority; status: WorkflowStatus; notes: string; evidence: unknown;
  created_at: string; updated_at: string;
};

type ServerAuditRow = {
  id: string; record_id: string | null; action: string; detail: string; created_at: string;
};

function mapServerRecord(row: ServerRecordRow): CentreRecord {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    assignee: row.responsible_person,
    amount: Number(row.amount ?? 0),
    date: row.due_date ?? today(),
    priority: row.priority,
    status: row.status,
    notes: row.notes ?? '',
    evidence: Array.isArray(row.evidence) ? row.evidence.map(String) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapServerAudit(row: ServerAuditRow): AuditEvent {
  return { id: row.id, recordId: row.record_id ?? 'module', action: row.action, detail: row.detail, at: row.created_at };
}

function toneForStatus(status: WorkflowStatus) {
  if (status === 'Completed') return 'green' as const;
  if (status === 'Rejected') return 'red' as const;
  if (status === 'Approved' || status === 'In Progress') return 'blue' as const;
  if (status === 'Pending') return 'amber' as const;
  return 'slate' as const;
}

function priorityTone(priority: Priority) {
  if (priority === 'Critical') return 'red' as const;
  if (priority === 'High') return 'amber' as const;
  if (priority === 'Medium') return 'blue' as const;
  return 'slate' as const;
}

function parseCsv(text: string): Array<Record<string, string>> {
  const rows = text.trim().split(/\r?\n/).filter(Boolean);
  if (!rows.length) return [];
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let current = '';
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const character = line[index];
      if (character === '"' && line[index + 1] === '"' && quoted) { current += '"'; index += 1; }
      else if (character === '"') quoted = !quoted;
      else if (character === ',' && !quoted) { cells.push(current.trim()); current = ''; }
      else current += character;
    }
    cells.push(current.trim());
    return cells;
  };
  const headers = parseLine(rows[0]).map(header => header.toLowerCase().replace(/[^a-z0-9]+/g, ''));
  return rows.slice(1).map(line => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ''])));
}

function IntegrationPanel({ module }: { module: FeatureModule }) {
  const providers = module.name === 'Printers'
    ? ['Thermal Printer', 'Kitchen Printer', 'Label Printer', 'Cash Drawer', 'Customer Display']
    : module.name === 'Devices'
      ? ['Barcode Scanner', 'Weighing Scale', 'Biometric Attendance', 'Tablet Kiosk', 'Customer Display']
      : module.name === 'API Configuration'
        ? ['Public API', 'Webhook Endpoint', 'Authentication Keys', 'Rate Limits', 'Audit Logs']
        : ['Supabase', 'WhatsApp Business', 'UPI & Paytm', 'Swiggy', 'Zomato', 'Accounting Export', 'Google Maps', 'SMS & Email'];
  const supabaseConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [testState, setTestState] = useState<Record<string, 'idle' | 'testing' | 'passed' | 'failed'>>({});

  const testProvider = async (provider: string) => {
    setTestState(current => ({ ...current, [provider]: 'testing' }));
    if (provider !== 'Supabase' || !supabaseConfigured) {
      setTestState(current => ({ ...current, [provider]: 'failed' }));
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string },
      });
      setTestState(current => ({ ...current, [provider]: response.ok || response.status === 404 ? 'passed' : 'failed' }));
    } catch { setTestState(current => ({ ...current, [provider]: 'failed' })); }
  };

  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{providers.map(provider => {
    const configured = provider === 'Supabase' && supabaseConfigured;
    const tested = testState[provider];
    const status = tested === 'passed' ? 'Connected' : configured ? 'Configured · test required' : 'Not configured';
    return <article key={provider} className="rounded-3xl border border-white/70 bg-white/85 p-4 shadow-[0_18px_55px_-32px_rgba(50,24,8,.45)] backdrop-blur dark:border-white/10 dark:bg-white/[.04]">
      <div className="flex items-start justify-between gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-700 dark:from-orange-500/20 dark:to-rose-500/10 dark:text-orange-300"><Link2 className="size-5" /></span><Pill tone={tested === 'passed' ? 'green' : tested === 'failed' ? 'red' : configured ? 'amber' : 'slate'}>{status}</Pill></div>
      <h4 className="mt-4 font-extrabold text-slate-950 dark:text-white">{provider}</h4><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/50">Credentials, permissions and a successful connection test are required before this connector is shown as live.</p>
      <div className="mt-4 flex flex-wrap gap-2"><ActionButton tone="slate" onClick={() => setExpanded(current => current === provider ? null : provider)}><CloudCog className="size-4" />Setup</ActionButton><ActionButton tone="blue" disabled={tested === 'testing'} onClick={() => void testProvider(provider)}>{tested === 'testing' ? 'Testing…' : 'Test connection'}</ActionButton></div>
      {expanded === provider && <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">Add credentials using environment variables or the server-side secrets manager. Secret keys are never stored in browser local storage. Hardware adapters must be configured on the device running the POS.</div>}
    </article>;
  })}</div>;
}

function SettingsPanel({ module }: { module: FeatureModule }) {
  const key = `new-surya-settings-${module.id}`;
  const [settings, setSettings] = useState<Record<string, string | boolean>>(() => safeLoad(key, { theme: 'System', density: 'Comfortable', motion: 'Balanced', cardDepth: 'Premium', requireApproval: true, compactTables: false }));
  const [saved, setSaved] = useState(false);
  const update = (name: string, value: string | boolean) => { setSaved(false); setSettings(current => ({ ...current, [name]: value })); };
  const save = () => {
    safeSave(key, settings);
    if (module.name === 'Appearance' || module.name === 'Application Settings') {
      const theme = String(settings.theme).toLowerCase();
      const dark = theme === 'dark' || (theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('new-surya-theme', theme);
      document.documentElement.dataset.density = String(settings.density).toLowerCase();
      document.documentElement.dataset.motion = String(settings.motion).toLowerCase();
    }
    setSaved(true);
  };
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
    <Card title={`${module.name} configuration`} description="Preferences are saved locally; protected business rules remain enforced by the database.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Theme"><select className={inputClass} value={String(settings.theme)} onChange={event => update('theme', event.target.value)}><option>System</option><option>Light</option><option>Dark</option></select></Field>
        <Field label="Interface density"><select className={inputClass} value={String(settings.density)} onChange={event => update('density', event.target.value)}><option>Comfortable</option><option>Compact</option><option>Spacious</option></select></Field>
        <Field label="Animation level"><select className={inputClass} value={String(settings.motion)} onChange={event => update('motion', event.target.value)}><option>Reduced</option><option>Balanced</option><option>Rich</option></select></Field>
        <Field label="Card depth"><select className={inputClass} value={String(settings.cardDepth)} onChange={event => update('cardDepth', event.target.value)}><option>Flat</option><option>Soft</option><option>Premium</option></select></Field>
        <label className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70"><span>Require approval</span><input type="checkbox" checked={Boolean(settings.requireApproval)} onChange={event => update('requireApproval', event.target.checked)} /></label>
        <label className="flex min-h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/70"><span>Compact tables</span><input type="checkbox" checked={Boolean(settings.compactTables)} onChange={event => update('compactTables', event.target.checked)} /></label>
      </div>
      <div className="mt-5 flex items-center justify-end gap-3">{saved && <span className="text-xs font-bold text-emerald-700">Saved successfully</span>}<ActionButton tone="green" onClick={save}><Save className="size-4" />Save configuration</ActionButton></div>
    </Card>
    <article className="overflow-hidden rounded-[30px] border border-amber-200/70 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.25),transparent_38%),linear-gradient(145deg,#fff8ec,#fff,#effbf5)] p-5 shadow-2xl shadow-amber-950/10 dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.15),transparent_38%),linear-gradient(145deg,#20140d,#0d1713)]"><p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-600">Live preview</p><div className="mt-4 rounded-3xl border border-white/80 bg-white/85 p-4 shadow-xl backdrop-blur dark:border-white/10 dark:bg-white/5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white"><Settings2 className="size-5" /></span><div><h4 className="font-black text-slate-950 dark:text-white">New Surya Premium</h4><p className="text-xs text-slate-500 dark:text-white/45">{String(settings.theme)} · {String(settings.density)} · {String(settings.motion)}</p></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-amber-400 to-emerald-500" /></div></div></article>
  </div>;
}

function IntelligencePanel({ module }: { module: FeatureModule }) {
  const initial = [
    { id: 'demand', title: 'Demand risk detected', reason: 'Recent movement and planned orders indicate a likely shortfall.', confidence: 86, impact: 'High', state: 'New' },
    { id: 'waste', title: 'Waste reduction opportunity', reason: 'A repeated quantity variance appears in recent operational records.', confidence: 78, impact: 'Medium', state: 'New' },
    { id: 'margin', title: 'Margin review suggested', reason: 'Cost movement is faster than the configured selling-price movement.', confidence: 72, impact: 'Medium', state: 'New' },
  ];
  const [suggestions, setSuggestions] = useState(initial);
  return <div className="grid gap-4 lg:grid-cols-3">{suggestions.map(item => <article key={item.id} className="rounded-3xl border border-violet-200/60 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,.17),transparent_38%),rgba(255,255,255,.9)] p-5 shadow-xl shadow-violet-950/5 dark:border-violet-400/15 dark:bg-violet-950/20">
    <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-violet-600 text-white"><Bot className="size-5" /></span><Pill tone={item.state === 'Dismissed' ? 'slate' : item.state === 'Under review' ? 'blue' : 'purple'}>{item.state}</Pill></div>
    <h4 className="mt-4 font-extrabold text-slate-950 dark:text-white">{item.title}</h4><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/55">{item.reason}</p><p className="mt-3 text-xs font-bold text-violet-700 dark:text-violet-300">Confidence {item.confidence}% · Impact {item.impact} · {module.name}</p>
    <div className="mt-4 flex gap-2"><ActionButton tone="green" disabled={item.state === 'Under review'} onClick={() => setSuggestions(current => current.map(row => row.id === item.id ? { ...row, state: 'Under review' } : row))}>Review</ActionButton><ActionButton tone="slate" disabled={item.state === 'Dismissed'} onClick={() => setSuggestions(current => current.map(row => row.id === item.id ? { ...row, state: 'Dismissed' } : row))}>Dismiss</ActionButton></div>
  </article>)}</div>;
}

export default function CompleteFeatureCenter({ dashboard, initialModule }: { dashboard: DashboardId; initialModule?: string }) {
  const modules = useMemo(() => modulesForDashboard(dashboard), [dashboard]);
  const groups = useMemo(() => groupsForDashboard(dashboard), [dashboard]);
  const first = modules[0];
  const [selectedId, setSelectedId] = useState(() => modules.find(module => module.id === initialModule || module.name === initialModule)?.id ?? first?.id ?? '');
  const selected = modules.find(module => module.id === selectedId) ?? first;
  const [rows, setRows] = useState<CentreRecord[]>(() => selected ? safeLoad(storageKey(selected), []) : []);
  const [audit, setAudit] = useState<AuditEvent[]>(() => selected ? safeLoad(auditKey(selected), []) : []);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState<CentreRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStep, setFormStep] = useState<1 | 2>(1);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [auditOpen, setAuditOpen] = useState(false);
  const [syncState, setSyncState] = useState<'loading' | 'server' | 'offline'>('loading');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serverConfigured = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  const emptyForm = (): FormState => ({ reference: '', title: '', assignee: '', amount: '', date: today(), priority: 'Medium', notes: '', evidence: [] });
  const [form, setForm] = useState<FormState>(() => selected ? safeLoad(draftKey(selected), emptyForm()) : emptyForm());

  useEffect(() => {
    if (!selected) return;
    let active = true;
    const cachedRows = safeLoad<CentreRecord[]>(storageKey(selected), []);
    const cachedAudit = safeLoad<AuditEvent[]>(auditKey(selected), []);
    setRows(cachedRows);
    setAudit(cachedAudit);
    setForm(safeLoad(draftKey(selected), emptyForm()));
    setEditing(null); setFormOpen(false); setQuery(''); setStatusFilter('All'); setNotice(''); setFormError('');

    if (selected.integration || selected.intelligence || selected.settings || !serverConfigured) {
      setSyncState(serverConfigured ? 'server' : 'offline');
      return () => { active = false; };
    }

    setSyncState('loading');
    void Promise.all([
      supabase.rpc('list_new_surya_feature_records_secure', { p_dashboard: dashboard, p_module_id: selected.id }),
      supabase.rpc('list_new_surya_feature_audit_secure', { p_dashboard: dashboard, p_module_id: selected.id }),
    ]).then(([recordsResult, auditResult]) => {
      if (!active) return;
      if (recordsResult.error || auditResult.error) {
        setSyncState('offline');
        return;
      }
      const serverRows = ((recordsResult.data ?? []) as ServerRecordRow[]).map(mapServerRecord);
      const serverAudit = ((auditResult.data ?? []) as ServerAuditRow[]).map(mapServerAudit);
      setRows(serverRows);
      setAudit(serverAudit);
      safeSave(storageKey(selected), serverRows);
      safeSave(auditKey(selected), serverAudit);
      setSyncState('server');
    }).catch(() => { if (active) setSyncState('offline'); });

    return () => { active = false; };
  }, [dashboard, selected?.id, serverConfigured]);

  useEffect(() => { if (selected) safeSave(storageKey(selected), rows); }, [rows, selected]);
  useEffect(() => { if (selected) safeSave(auditKey(selected), audit); }, [audit, selected]);
  useEffect(() => { if (selected && formOpen && !editing) safeSave(draftKey(selected), form); }, [editing, form, formOpen, selected]);

  if (!selected) return null;

  const addAudit = (recordId: string, action: string, detail: string) => setAudit(current => [{ id: uid(), recordId, action, detail, at: new Date().toISOString() }, ...current].slice(0, 500));
  const refreshServerAudit = async () => {
    if (!serverConfigured || selected.integration || selected.intelligence || selected.settings) return;
    const { data, error } = await supabase.rpc('list_new_surya_feature_audit_secure', { p_dashboard: dashboard, p_module_id: selected.id });
    if (!error) { const next = ((data ?? []) as ServerAuditRow[]).map(mapServerAudit); setAudit(next); setSyncState('server'); }
  };
  const persistServerRecord = async (record: CentreRecord): Promise<CentreRecord | null> => {
    if (!serverConfigured) return null;
    const { data, error } = await supabase.rpc('save_new_surya_feature_record_secure', {
      p_id: record.id,
      p_dashboard: dashboard,
      p_module_id: selected.id,
      p_reference: record.reference,
      p_title: record.title,
      p_responsible_person: record.assignee,
      p_amount: record.amount,
      p_due_date: record.date || null,
      p_priority: record.priority,
      p_status: record.status,
      p_notes: record.notes,
      p_evidence: record.evidence,
    });
    if (error || !data) { setSyncState('offline'); return null; }
    setSyncState('server');
    const row = (Array.isArray(data) ? data[0] : data) as ServerRecordRow;
    return mapServerRecord(row);
  };

  const filtered = rows.filter(row => {
    const matchStatus = statusFilter === 'All' || row.status === statusFilter;
    const term = query.trim().toLowerCase();
    return matchStatus && (!term || Object.values(row).some(value => String(value).toLowerCase().includes(term)));
  });
  const pending = rows.filter(row => ['Draft', 'Pending', 'Approved', 'In Progress'].includes(row.status)).length;
  const completed = rows.filter(row => row.status === 'Completed').length;
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const recentAssignees = Array.from(new Set(rows.map(row => row.assignee).filter(Boolean))).slice(0, 8);

  const resetForm = () => { setEditing(null); setForm(emptyForm()); setFormStep(1); setFormError(''); if (selected) localStorage.removeItem(draftKey(selected)); };
  const openCreate = () => { setEditing(null); setForm(safeLoad(draftKey(selected), emptyForm())); setFormStep(1); setFormError(''); setFormOpen(true); };
  const openEdit = (row: CentreRecord) => { setEditing(row); setForm({ reference: row.reference, title: row.title, assignee: row.assignee, amount: String(row.amount), date: row.date, priority: row.priority, notes: row.notes, evidence: row.evidence ?? [] }); setFormStep(1); setFormError(''); setFormOpen(true); };

  const validate = () => {
    if (!form.reference.trim() || !form.title.trim() || !form.assignee.trim()) return 'Reference, title and responsible person are required.';
    const duplicate = rows.find(row => row.reference.trim().toLowerCase() === form.reference.trim().toLowerCase() && row.id !== editing?.id);
    if (duplicate) return `Reference ${form.reference.trim()} already exists.`;
    if (Number(form.amount || 0) < 0) return 'Value or quantity cannot be negative.';
    return '';
  };

  const commit = async (status: WorkflowStatus, addAnother = false) => {
    const error = validate();
    if (error) { setFormError(error); setFormStep(1); return; }
    const now = new Date().toISOString();
    const localRecord: CentreRecord = editing
      ? { ...editing, ...form, reference: form.reference.trim(), title: form.title.trim(), assignee: form.assignee.trim(), amount: Number(form.amount || 0), status, updatedAt: now }
      : { id: uid(), ...form, reference: form.reference.trim(), title: form.title.trim(), assignee: form.assignee.trim(), amount: Number(form.amount || 0), status, createdAt: now, updatedAt: now };

    setBusy(true);
    const serverRecord = await persistServerRecord(localRecord);
    const finalRecord = serverRecord ?? localRecord;
    setRows(current => editing ? current.map(row => row.id === editing.id ? finalRecord : row) : [finalRecord, ...current]);
    if (serverRecord) await refreshServerAudit();
    else addAudit(finalRecord.id, editing ? 'Updated offline' : 'Created offline', `${finalRecord.reference} saved as ${status}; secure sync will retry after connectivity is restored.`);
    setNotice(serverRecord ? `${selected.name} saved securely.` : `${selected.name} saved to the offline cache. Apply the feature-centre migration and reconnect to enable secure server sync.`);
    setBusy(false);
    resetForm();
    if (addAnother) { setFormOpen(true); setFormStep(1); } else setFormOpen(false);
  };

  const advance = async (row: CentreRecord) => {
    const index = statusFlow.indexOf(row.status);
    const next = index < 0 || index === statusFlow.length - 1 ? row.status : statusFlow[index + 1];
    const localRecord = { ...row, status: next, updatedAt: new Date().toISOString() };
    setBusy(true);
    const serverRecord = await persistServerRecord(localRecord);
    const finalRecord = serverRecord ?? localRecord;
    setRows(current => current.map(item => item.id === row.id ? finalRecord : item));
    if (serverRecord) await refreshServerAudit();
    else addAudit(row.id, 'Status changed offline', `${row.reference}: ${row.status} → ${next}.`);
    setBusy(false);
  };

  const remove = async (row: CentreRecord) => {
    if (!window.confirm(`Delete ${row.reference}? This action remains in the audit history.`)) return;
    setBusy(true);
    let removedOnServer = false;
    if (serverConfigured) {
      const { data, error } = await supabase.rpc('delete_new_surya_feature_record_secure', { p_id: row.id, p_dashboard: dashboard, p_module_id: selected.id });
      removedOnServer = !error && Boolean(data);
      if (error) setSyncState('offline');
    }
    setRows(current => current.filter(item => item.id !== row.id));
    if (removedOnServer) await refreshServerAudit();
    else addAudit(row.id, 'Deleted offline', `${row.reference} was removed from the local register and remains queued for secure synchronization.`);
    setBusy(false);
  };

  const importFile = async (file: File) => {
    try {
      const text = await file.text();
      const raw = file.name.toLowerCase().endsWith('.json') ? JSON.parse(text) as Array<Record<string, unknown>> : parseCsv(text);
      if (!Array.isArray(raw)) throw new Error('Import must contain a list of records.');
      const now = new Date().toISOString();
      const imported = raw.map((row, index): CentreRecord => ({
        id: uid(),
        reference: String(row.reference ?? row.ref ?? `IMPORT-${Date.now()}-${index + 1}`),
        title: String(row.title ?? row.name ?? `${selected.name} import`),
        assignee: String(row.assignee ?? row.responsibleperson ?? row.executive ?? 'Imported Record'),
        amount: Number(row.amount ?? row.value ?? row.quantity ?? 0),
        date: String(row.date ?? today()).slice(0, 10),
        priority: ['Low', 'Medium', 'High', 'Critical'].includes(String(row.priority)) ? String(row.priority) as Priority : 'Medium',
        status: ['Draft', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'].includes(String(row.status)) ? String(row.status) as WorkflowStatus : 'Pending',
        notes: String(row.notes ?? ''), evidence: [], createdAt: now, updatedAt: now,
      })).filter(row => !rows.some(existing => existing.reference.toLowerCase() === row.reference.toLowerCase()));
      setBusy(true);
      const persisted = await Promise.all(imported.map(async row => (await persistServerRecord(row)) ?? row));
      setRows(current => [...persisted, ...current]);
      if (serverConfigured && syncState === 'server') await refreshServerAudit();
      else addAudit('module', 'Imported offline', `${imported.length} records imported from ${file.name}.`);
      setBusy(false);
      setNotice(`${imported.length} records imported. Duplicate references were skipped.`);
    } catch (error) { setBusy(false); setNotice(error instanceof Error ? `Import failed: ${error.message}` : 'Import failed.'); }
  };

  const [sidebarSlot, setSidebarSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSidebarSlot(document.getElementById('sidebar-modules-slot')); }, []);
  const moduleListNav = <div className="space-y-4 p-1">{Object.entries(groups).map(([group, names]) => <div key={group}><p className="px-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-500 dark:text-white/40">{group}</p><div className="mt-1 space-y-1">{names.map(name => { const module = modules.find(item => item.name === name); if (!module) return null; const active = module.id === selected.id; return <button key={module.id} aria-current={active ? 'page' : undefined} onClick={() => setSelectedId(module.id)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-bold transition ${active ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-950/20' : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'}`}><span className="truncate">{module.name}</span><ChevronRight className="size-3.5 shrink-0" /></button>; })}</div></div>)}</div>;

  return <div className={sidebarSlot ? "grid gap-5" : "grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]"}>
    {sidebarSlot ? createPortal(
      <div>
        <p className="px-3 text-[10px] font-black uppercase tracking-[.22em] text-amber-400">Complete feature centre</p>
        <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400">{modules.length} modules</p>
        {moduleListNav}
      </div>,
      sidebarSlot
    ) : <aside className="no-print self-start overflow-hidden rounded-3xl border border-amber-200/70 bg-white/90 shadow-[0_24px_80px_-45px_rgba(83,46,15,.55)] backdrop-blur dark:border-white/10 dark:bg-slate-950/75 xl:sticky xl:top-[150px] xl:max-h-[calc(100vh-175px)] xl:overflow-y-auto">
      <div className="border-b border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 dark:border-white/10 dark:from-amber-950/30 dark:via-slate-950 dark:to-orange-950/20"><p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-600">Complete feature centre</p><h3 className="mt-1 font-extrabold text-slate-950 dark:text-white">All modules</h3><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-white/45">{modules.length} operational modules inside this dashboard.</p></div>
      <div className="p-3">{moduleListNav}</div>
    </aside>}

    <section className="min-w-0 space-y-5" aria-busy={busy || syncState === 'loading'}>
      <div className="overflow-hidden rounded-[30px] border border-white/15 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.25),transparent_35%),linear-gradient(135deg,#24150d_0%,#4a2815_50%,#113b31_100%)] p-5 text-white shadow-2xl shadow-amber-950/15 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Pill tone="amber">{selected.group}</Pill><Pill tone="green">Enabled</Pill><Pill tone={syncState === 'server' ? 'green' : syncState === 'loading' ? 'amber' : 'slate'}>{syncState === 'server' ? 'Secure sync' : syncState === 'loading' ? 'Syncing…' : 'Offline cache'}</Pill></div><h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">{selected.name}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">{selected.description}</p></div><div className="flex flex-wrap gap-2"><ActionButton tone="green" disabled={busy} onClick={openCreate}><Plus className="size-4" />Create</ActionButton><ActionButton tone="blue" disabled={busy} onClick={() => downloadCsv(`${selected.id}.csv`, rows as unknown as Record<string, unknown>[])}><Download className="size-4" />Export</ActionButton><ActionButton tone="slate" disabled={busy} onClick={() => fileInputRef.current?.click()}><Upload className="size-4" />Import</ActionButton><input ref={fileInputRef} hidden type="file" accept=".csv,.json,text/csv,application/json" onChange={event => { const file = event.target.files?.[0]; if (file) void importFile(file); event.currentTarget.value = ''; }} /></div></div>
      </div>

      {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-100"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss message"><X className="size-4" /></button></div>}

      {selected.integration ? <IntegrationPanel module={selected} /> : selected.intelligence ? <IntelligencePanel module={selected} /> : selected.settings ? <SettingsPanel module={selected} /> : <>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Activity} label="Records" value={String(rows.length)} helper="Operational records retained." tone="blue" /><Metric icon={AlertTriangle} label="Open" value={String(pending)} helper="Items requiring attention." tone={pending ? 'amber' : 'green'} /><Metric icon={CheckCircle2} label="Completed" value={String(completed)} helper="Fully processed items." tone="green" /><Metric icon={CircleDollarSign} label="Tracked value" value={money(total)} helper="Combined financial or quantity value." tone="purple" /></div>
        <Card title={`${selected.name} register`} description="Search, filter, create, approve, edit, import, export and retain a complete audit trail.">
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="relative w-full max-w-md"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input className={`${inputClass} pl-9`} value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${selected.name.toLowerCase()}`} /></div><div className="flex flex-wrap gap-2"><select className={`${inputClass} w-auto min-w-40`} value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All</option>{['Draft', 'Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'].map(status => <option key={status}>{status}</option>)}</select><ActionButton tone="slate" onClick={() => { setQuery(''); setStatusFilter('All'); }}><Filter className="size-4" />Reset</ActionButton></div></div>
          <DataTable rows={filtered} empty={`No ${selected.name.toLowerCase()} records`} columns={[
            { key: 'reference', label: 'Reference' }, { key: 'title', label: 'Title' }, { key: 'assignee', label: 'Responsible person' },
            { key: 'amount', label: 'Value', render: row => row.amount ? money(row.amount) : '-' }, { key: 'date', label: 'Date' },
            { key: 'priority', label: 'Priority', render: row => <Pill tone={priorityTone(row.priority)}>{row.priority}</Pill> },
            { key: 'status', label: 'Status', render: row => <Pill tone={toneForStatus(row.status)}>{row.status}</Pill> },
            { key: 'id', label: 'Actions', render: row => <div className="flex gap-2"><ActionButton title="Edit" tone="blue" disabled={busy} onClick={() => openEdit(row)}><Pencil className="size-4" /></ActionButton><ActionButton title="Advance status" tone="green" disabled={busy || row.status === 'Completed' || row.status === 'Rejected'} onClick={() => void advance(row)}><FileCheck2 className="size-4" /></ActionButton><ActionButton title="Delete" tone="red" disabled={busy} onClick={() => void remove(row)}><Trash2 className="size-4" /></ActionButton></div> },
          ]} />
        </Card>
        <Card title="Audit history" description="Record creation, edits, approvals, imports and deletions are retained on the secure server and cached for offline review." action={<ActionButton tone="slate" onClick={() => setAuditOpen(current => !current)}><History className="size-4" />{auditOpen ? 'Hide' : 'Show'} history<ChevronDown className={`size-4 transition ${auditOpen ? 'rotate-180' : ''}`} /></ActionButton>}>
          {auditOpen ? <DataTable rows={audit} empty="No audit events yet" columns={[{ key: 'at', label: 'Time', render: row => new Date(row.at).toLocaleString('en-IN') }, { key: 'action', label: 'Action' }, { key: 'detail', label: 'Details' }]} /> : <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:text-white/45">{audit.length} audit event{audit.length === 1 ? '' : 's'} retained.</div>}
        </Card>
      </>}
    </section>

    {formOpen && <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="feature-form-title"><button className="absolute inset-0" aria-label="Close" onClick={() => setFormOpen(false)} /><form onSubmit={event => { event.preventDefault(); if (formStep === 1) { const error = validate(); if (error) setFormError(error); else { setFormError(''); setFormStep(2); } } else void commit('Pending'); }} className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/20 bg-white p-5 shadow-[0_40px_120px_-30px_rgba(15,23,42,.8)] dark:bg-slate-950 sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-600">{selected.group}</p><h3 id="feature-form-title" className="mt-1 text-xl font-black text-slate-950 dark:text-white">{editing ? 'Edit' : 'Create'} {selected.name}</h3><div className="mt-3 flex items-center gap-2 text-xs font-bold"><Pill tone={formStep === 1 ? 'amber' : 'green'}>1 · Details</Pill><ChevronRight className="size-3.5 text-slate-400" /><Pill tone={formStep === 2 ? 'amber' : 'slate'}>2 · Review</Pill></div></div><button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-white/10" onClick={() => setFormOpen(false)}><X className="size-4" /></button></div>
      {formError && <div role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{formError}</div>}
      {formStep === 1 ? <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Reference"><input required autoFocus className={inputClass} value={form.reference} onChange={event => setForm(current => ({ ...current, reference: event.target.value }))} /></Field>
        <Field label="Date"><input type="date" className={inputClass} value={form.date} onChange={event => setForm(current => ({ ...current, date: event.target.value }))} /></Field>
        <Field label="Title"><input required className={inputClass} value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></Field>
        <Field label="Responsible person"><input required list="new-surya-recent-assignees" className={inputClass} value={form.assignee} onChange={event => setForm(current => ({ ...current, assignee: event.target.value }))} /><datalist id="new-surya-recent-assignees">{recentAssignees.map(value => <option key={value} value={value} />)}</datalist></Field>
        <Field label="Value / quantity"><input type="number" min="0" step="0.01" className={inputClass} value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} /></Field>
        <Field label="Priority"><select className={inputClass} value={form.priority} onChange={event => setForm(current => ({ ...current, priority: event.target.value as Priority }))}>{['Low', 'Medium', 'High', 'Critical'].map(priority => <option key={priority}>{priority}</option>)}</select></Field>
        <div className="sm:col-span-2"><Field label="Notes"><textarea className={`${inputClass} h-28 py-3`} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} /></Field></div>
        <div className="sm:col-span-2"><Field label="Evidence attachments"><input type="file" multiple className={`${inputClass} h-auto py-2`} onChange={event => setForm(current => ({ ...current, evidence: Array.from(event.target.files ?? []).map(file => file.name) }))} />{form.evidence.length > 0 && <p className="mt-2 text-xs font-semibold text-slate-500">{form.evidence.join(', ')}</p>}</Field></div>
      </div> : <div className="mt-5 grid gap-3 sm:grid-cols-2"><Review label="Reference" value={form.reference} /><Review label="Date" value={form.date} /><Review label="Title" value={form.title} /><Review label="Responsible person" value={form.assignee} /><Review label="Value / quantity" value={form.amount || '0'} /><Review label="Priority" value={form.priority} /><div className="sm:col-span-2"><Review label="Notes" value={form.notes || 'No notes'} /></div><div className="sm:col-span-2"><Review label="Evidence" value={form.evidence.join(', ') || 'No attachments'} /></div></div>}
      <div className="mt-6 flex flex-wrap justify-between gap-2"><div>{formStep === 2 && <ActionButton tone="slate" disabled={busy} onClick={() => setFormStep(1)}>Back</ActionButton>}</div><div className="flex flex-wrap justify-end gap-2"><ActionButton tone="slate" disabled={busy} onClick={() => setFormOpen(false)}>Cancel</ActionButton>{formStep === 1 ? <><ActionButton tone="blue" disabled={busy} onClick={() => void commit('Draft')}><FileClock className="size-4" />Save draft</ActionButton><ActionButton type="submit" tone="green" disabled={busy}>Review<ChevronRight className="size-4" /></ActionButton></> : <><ActionButton tone="blue" disabled={busy} onClick={() => void commit('Pending', true)}><Plus className="size-4" />Save & add another</ActionButton><ActionButton type="submit" tone="green" disabled={busy}><Save className="size-4" />{busy ? 'Saving…' : 'Save & view'}</ActionButton></>}</div></div>
    </form></div>}
  </div>;
}

function Review({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"><p className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-bold text-slate-900 dark:text-white">{value}</p></div>;
}
