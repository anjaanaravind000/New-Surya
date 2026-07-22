import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Store,
  UserCog,
  Wifi,
  X,
  type LucideIcon
} from 'lucide-react';
import type { DebugEvent, ModuleStatus, Tone } from '../lib/types';
import { useAuth } from '../state/AuthContext';

// ── Design system note ──────────────────────────────────────────────────────
// Display face: Archivo (font-display) — confident, poster-weight headings and big numbers.
// Body face: Inter (default) — dense tables and forms stay maximally legible.
// Ticket face: IBM Plex Mono (font-ticket) — tabular figures for money, qty, bill/order numbers.
// Brand colors: marigold (primary, matches the real shop-front gold), ember (urgent/attention),
// tgreen (positive/paid/in-stock), ink/paper (structure). Semantic sky/violet/cyan/pink remain
// as quiet functional accents, not brand colors.
// ─────────────────────────────────────────────────────────────────────────────

const badgeTone: Record<Tone, string> = {
  orange: 'border-marigold-100 bg-marigold-50 text-marigold-700',
  green: 'border-emerald-200 bg-emerald-50 text-tgreen',
  emerald: 'border-emerald-200 bg-emerald-50 text-tgreen',
  red: 'border-red-200 bg-red-50 text-oxblood',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  amber: 'border-marigold-100 bg-marigold-50 text-marigold-700',
  slate: 'border-ink/10 bg-paper-dim text-ink-600',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  pink: 'border-pink-200 bg-pink-50 text-pink-700'
};

const iconTone: Record<Tone, string> = {
  orange: 'bg-marigold-50 text-marigold-700 ring-marigold-100',
  green: 'bg-emerald-50 text-tgreen ring-emerald-100',
  emerald: 'bg-emerald-50 text-tgreen ring-emerald-100',
  red: 'bg-red-50 text-oxblood ring-red-100',
  blue: 'bg-sky-50 text-sky-700 ring-sky-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
  amber: 'bg-marigold-50 text-marigold-700 ring-marigold-100',
  slate: 'bg-paper-dim text-ink-600 ring-ink/10',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  pink: 'bg-pink-50 text-pink-700 ring-pink-100'
};

const buttonTone: Record<Tone, string> = {
  orange: 'bg-marigold text-white hover:bg-marigold-600 focus-visible:ring-marigold-100',
  green: 'bg-tgreen text-white hover:bg-emerald-800 focus-visible:ring-emerald-200',
  emerald: 'bg-tgreen text-white hover:bg-emerald-800 focus-visible:ring-emerald-200',
  red: 'bg-oxblood text-white hover:bg-red-800 focus-visible:ring-red-200',
  blue: 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-200',
  purple: 'bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-200',
  amber: 'bg-marigold-100 text-marigold-700 hover:bg-marigold-100/70 focus-visible:ring-marigold-100',
  slate: 'bg-ink text-white hover:bg-ink-700 focus-visible:ring-ink/20',
  cyan: 'bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:ring-cyan-200',
  pink: 'bg-pink-600 text-white hover:bg-pink-700 focus-visible:ring-pink-200'
};

const barTone: Record<Tone, string> = {
  orange: 'bg-marigold', green: 'bg-tgreen', emerald: 'bg-tgreen', red: 'bg-oxblood',
  blue: 'bg-sky-500', purple: 'bg-violet-500', amber: 'bg-marigold', slate: 'bg-ink/40',
  cyan: 'bg-cyan-500', pink: 'bg-pink-500'
};

export function Pill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${badgeTone[tone]}`}>{children}</span>;
}

export function StatusPill({ status }: { status: ModuleStatus }) {
  const tone: Tone = status === 'implemented' ? 'green' : status === 'credential-required' ? 'amber' : status === 'device-required' ? 'purple' : status === 'schema-ready' ? 'blue' : 'slate';
  return <Pill tone={tone}>{status.replaceAll('-', ' ')}</Pill>;
}

export function Metric({ icon: Icon, label, value, helper, tone = 'orange' }: { icon: LucideIcon; label: string; value: string; helper: string; tone?: Tone }) {
  return <div className={`min-w-0 rounded-lg border border-ink/10 border-t-2 bg-paper p-4 shadow-[0_2px_8px_rgba(31,41,51,.05)] ${tone === 'orange' || tone === 'amber' ? 'border-t-marigold' : tone === 'green' || tone === 'emerald' ? 'border-t-tgreen' : tone === 'red' ? 'border-t-oxblood' : tone === 'blue' || tone === 'cyan' ? 'border-t-sky-500' : tone === 'purple' || tone === 'pink' ? 'border-t-violet-500' : 'border-t-ink/30'}`}>
    <div className="flex items-start gap-3">
      <div className={`grid size-10 shrink-0 place-items-center rounded-lg ring-1 ${iconTone[tone]}`}><Icon className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink-600">{label}</p>
        <div className="mt-0.5 break-words font-display text-xl font-extrabold leading-7 text-ink">{value}</div>
      </div>
    </div>
    <p className="mt-3 min-h-5 text-xs leading-5 text-ink-600">{helper}</p>
  </div>;
}

export function Card({ title, description, action, children, className = '' }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-lg border border-ink/10 bg-paper shadow-[0_1px_3px_rgba(31,41,51,.06)] ${className}`}>
    <div className="flex flex-col gap-3 border-b border-ink/8 px-4 py-4 sm:flex-row sm:items-start sm:justify-between lg:px-5">
      <div className="min-w-0">
        <h3 className="font-display text-[15px] font-bold leading-6 text-ink">{title}</h3>
        {description && <p className="mt-0.5 max-w-3xl text-sm leading-5 text-ink-600">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="p-4 lg:p-5">{children}</div>
  </section>;
}

export function DataTable<T extends object>({ rows, columns, empty = 'No records found' }: { rows: T[]; columns: { key: string; label: string; render?: (row: T) => React.ReactNode }[]; empty?: string }) {
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState(1);
  const searchable = rows.length > 12;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = React.useMemo(() => normalizedQuery
    ? rows.filter(row => Object.values(row).some(value => String(value ?? '').toLowerCase().includes(normalizedQuery)))
    : rows, [rows, normalizedQuery]);
  const pageSize = searchable ? 20 : Math.max(1, filteredRows.length);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const effectivePage = Math.min(page, totalPages);
  const visibleRows = filteredRows.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  if (!rows.length) return <div className="rounded-lg border border-dashed border-ink/20 bg-paper-dim px-5 py-10 text-center text-sm font-semibold text-ink-600">{empty}</div>;
  return <div className="overflow-hidden rounded-lg border border-ink/10 bg-paper">
    {searchable && <div className="flex flex-col gap-3 border-b border-ink/10 bg-paper-dim/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-600/60" />
        <input aria-label="Search table" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search records" className="h-10 w-full rounded-md border border-ink/15 bg-paper pl-9 pr-3 text-sm outline-none focus:border-marigold focus:ring-4 focus:ring-marigold-50" />
      </label>
      <p className="text-xs font-semibold text-ink-600">{filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} records</p>
    </div>}
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-paper-dim/90">
          <tr>{columns.map((c, columnIndex) => <th key={`${c.key}-${columnIndex}`} className="whitespace-nowrap border-b border-ink/10 px-4 py-3 text-left font-display text-[11px] font-bold uppercase tracking-wide text-ink-600">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-ink/8">
          {visibleRows.map((row, index) => <tr key={String((row as Record<string, unknown>).id ?? (row as Record<string, unknown>).itemCode ?? `${effectivePage}-${index}`)} className="transition-colors hover:bg-marigold-50/40">
            {columns.map((c, columnIndex) => <td key={`${c.key}-${columnIndex}`} className="max-w-[22rem] whitespace-nowrap px-4 py-3 align-middle text-ink-700">{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
    {!filteredRows.length && <div className="px-5 py-10 text-center text-sm font-semibold text-ink-600">No matching records</div>}
    {searchable && totalPages > 1 && <div className="flex items-center justify-between border-t border-ink/10 bg-paper px-3 py-3">
      <p className="text-xs font-semibold text-ink-600">Page {effectivePage} of {totalPages}</p>
      <div className="flex gap-2">
        <button type="button" title="Previous page" aria-label="Previous page" disabled={effectivePage === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="grid size-9 place-items-center rounded-md border border-ink/15 text-ink-600 hover:bg-paper-dim disabled:opacity-35"><ChevronLeft className="size-4" /></button>
        <button type="button" title="Next page" aria-label="Next page" disabled={effectivePage === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="grid size-9 place-items-center rounded-md border border-ink/15 text-ink-600 hover:bg-paper-dim disabled:opacity-35"><ChevronRight className="size-4" /></button>
      </div>
    </div>}
  </div>;
}

export function DashboardTabs<T extends string>({ tabs, active, setActive }: { tabs: readonly T[]; active: T; setActive: (tab: T) => void }) {
  return <div className="no-print sticky top-[68px] z-30 mb-4 border border-ink/10 bg-paper/95 p-2 shadow-[0_3px_12px_rgba(31,41,51,.07)] backdrop-blur">
    <div className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex">
      {tabs.map(tab => <button key={tab} onClick={() => setActive(tab)} className={`min-h-10 shrink-0 rounded-md border px-3.5 text-sm font-semibold transition ${active === tab ? 'border-marigold-600 bg-marigold text-white shadow-sm' : 'border-transparent text-ink-600 hover:border-ink/15 hover:bg-paper-dim hover:text-ink'}`}>{tab}</button>)}
    </div>
    <div className="relative md:hidden">
      <select aria-label="Current module" className="h-11 w-full appearance-none rounded-md border border-ink/15 bg-paper px-3 pr-10 text-sm font-bold text-ink outline-none" value={active} onChange={event => setActive(event.target.value as T)}>
        {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-600/60" />
    </div>
  </div>;
}

export function ActionButton({ children, onClick, tone = 'slate', disabled = false, title, className = '' }: { children: React.ReactNode; onClick?: () => void; tone?: Tone; disabled?: boolean; title?: string; className?: string }) {
  return <button title={title} disabled={disabled} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold shadow-sm outline-none transition active:scale-[.98] focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 ${buttonTone[tone]} ${className}`}>{children}</button>;
}

export function ExportButton({ onClick, label = 'Export CSV' }: { onClick: () => void; label?: string }) {
  return <ActionButton onClick={onClick} tone="blue"><Download className="size-4" />{label}</ActionButton>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-ink-600">{label}</span>{children}</label>;
}

export const inputClass = 'h-11 w-full rounded-md border border-ink/15 bg-paper px-3 text-sm font-medium text-ink shadow-sm outline-none transition placeholder:text-ink-600/50 focus:border-marigold focus:ring-4 focus:ring-marigold-50';

export function DebugPanel({ events }: { events: DebugEvent[] }) {
  const tone = (level: DebugEvent['level']): Tone => level === 'error' ? 'red' : level === 'warning' ? 'amber' : level === 'success' ? 'green' : 'blue';
  return <Card title="Support activity" description="Recent system events and operational checks.">
    <div className="divide-y divide-ink/8">{events.slice(0, 14).map(event => <div key={event.id} className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2"><Pill tone={tone(event.level)}>{event.level}</Pill><b className="text-sm text-ink">{event.module}</b><span className="text-xs text-ink-600/60">{new Date(event.at).toLocaleString()}</span></div>
      <p className="mt-2 text-sm font-semibold text-ink-700">{event.message}</p>
      {event.detail && <p className="mt-1 text-xs leading-5 text-ink-600">{event.detail}</p>}
    </div>)}
    {!events.length && <p className="py-6 text-center text-sm font-semibold text-ink-600">No activity logged yet</p>}
    </div>
  </Card>;
}

export function MiniBar({ label, value, max = 100, tone = 'orange' }: { label: string; value: number; max?: number; tone?: Tone }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return <div>
    <div className="mb-1.5 flex justify-between text-xs font-medium text-ink-600"><span>{label}</span><span className="font-ticket">{pct}%</span></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-ink/8"><div className={`h-full rounded-full ${barTone[tone]}`} style={{ width: `${pct}%` }} /></div>
  </div>;
}

export function BarChartPanel({ data, valueFormat = String, tone = 'orange' }: { data: { label: string; value: number }[]; valueFormat?: (v: number) => string; tone?: Tone }) {
  const max = Math.max(1, ...data.map(d => d.value));
  const fill = tone === 'green' || tone === 'emerald' ? '#047857' : tone === 'red' ? '#B42318' : tone === 'blue' || tone === 'cyan' ? '#0284c7' : '#C9871F';
  if (!data.length) return <div className="grid h-40 place-items-center rounded-lg border border-dashed border-ink/20 bg-paper-dim text-sm font-semibold text-ink-600">No data yet</div>;
  return <div className="flex h-44 items-end gap-2.5 overflow-x-auto pb-1">
    {data.map(d => <div key={d.label} className="flex min-w-[44px] flex-1 flex-col items-center gap-1.5">
      <span className="font-ticket text-[11px] font-bold text-ink">{valueFormat(d.value)}</span>
      <div className="flex h-32 w-full items-end rounded-md bg-ink/5">
        <div className="w-full rounded-md transition-all" style={{ height: `${Math.max(4, (d.value / max) * 100)}%`, background: fill }} />
      </div>
      <span className="max-w-[60px] truncate text-[10px] font-semibold text-ink-600" title={d.label}>{d.label}</span>
    </div>)}
  </div>;
}

export function TrendLine({ data, tone = 'orange' }: { data: { label: string; value: number }[]; tone?: Tone }) {
  const width = 560, height = 140, pad = 24;
  const max = Math.max(1, ...data.map(d => d.value));
  const min = Math.min(0, ...data.map(d => d.value));
  const stroke = tone === 'green' || tone === 'emerald' ? '#047857' : tone === 'red' ? '#B42318' : '#C9871F';
  if (!data.length) return <div className="grid h-36 place-items-center rounded-lg border border-dashed border-ink/20 bg-paper-dim text-sm font-semibold text-ink-600">No data yet</div>;
  const points = data.map((d, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((d.value - min) / Math.max(1, max - min)) * (height - pad * 2);
    return `${x},${y}`;
  });
  const areaPath = `M${pad},${height - pad} L${points.join(' L')} L${width - pad},${height - pad} Z`;
  return <div className="w-full overflow-x-auto">
    <svg viewBox={`0 0 ${width} ${height}`} className="h-36 w-full min-w-[420px]">
      <path d={areaPath} fill={stroke} opacity="0.08" />
      <polyline points={points.join(' ')} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => { const [x, y] = points[i].split(','); return <circle key={d.label} cx={x} cy={y} r="3" fill={stroke} />; })}
    </svg>
    <div className="mt-1 flex justify-between text-[10px] font-semibold text-ink-600">{data.map(d => <span key={d.label} className="max-w-[70px] truncate">{d.label}</span>)}</div>
  </div>;
}

export function ShortcutGrid() {
  const keys = [['F2','Search'],['Ctrl+K','Find item'],['F4','Hold bill'],['F6','Open counter'],['F7','Cash'],['F8','UPI'],['F9','Checkout'],['Alt+D','Duplicate'],['Alt+R','Recall'],['Ctrl+Backspace','Clear']];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{keys.map(([key, value]) => <div key={key} className="rounded-md border border-ink/10 bg-paper-dim p-3">
    <div className="flex items-center gap-2"><Keyboard className="size-4 text-ink-600/60" /><b className="font-ticket text-sm text-ink-700">{key}</b></div>
    <p className="mt-1 text-xs text-ink-600">{value}</p>
  </div>)}</div>;
}

const navByRole: Record<string, { to: string; label: string; icon: LucideIcon; hint: string; name: string; initials: string }> = {
  admin: { to: '/admin', label: 'Admin', icon: LayoutDashboard, hint: 'Company command centre', name: 'Owner / Super Admin', initials: 'OA' },
  kitchen: { to: '/kitchen', label: 'Kitchen', icon: ChefHat, hint: 'Store, bake and packing', name: 'Kitchen Manager', initials: 'KM' },
  branch: { to: '/branch', label: 'Branch', icon: Store, hint: 'Billing and customer orders', name: 'Branch Cashier', initials: 'BC' },
  'branch-incharge': { to: '/branch-incharge', label: 'Branch Incharge', icon: UserCog, hint: 'Outlet people and controls', name: 'Branch Incharge', initials: 'BI' },
  'stock-audit': { to: '/stock-audit', label: 'Stock Audit', icon: ClipboardCheck, hint: 'Count, verify and reconcile', name: 'Stock Auditor', initials: 'SA' }
};

export function Shell({ title, subtitle, tabs, activeTab, onTabChange, children }: {
  title: string;
  subtitle: string;
  tabs?: readonly string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children: React.ReactNode;
}) {
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const dashboardId = profile?.dashboards[0] ?? 'admin';
  const activeNav = navByRole[dashboardId] || navByRole.admin;
  const Icon = activeNav.icon;
  const displayName = profile?.name ?? activeNav.name;
  const initials = profile?.initials ?? activeNav.initials;

  async function handleLogout() {
    await signOut();
    navigate('/login', { replace: true });
  }

  function selectTab(tab: string) {
    onTabChange?.(tab);
    setMobileMenu(false);
  }

  return <div className="min-h-screen bg-paper-dim text-ink">
    {mobileMenu && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setMobileMenu(false)} />}
    <aside className={`no-print fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-black/20 bg-ink text-white transition-transform lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[92px] shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <img src="/brand/new-surya-client-logo.jpg" alt="New Surya Sweets & Savouries" className="h-auto w-[210px] object-contain" />
        <button aria-label="Close navigation" className="ml-auto grid size-9 place-items-center rounded-md text-white/70 hover:bg-white/10 lg:hidden" onClick={() => setMobileMenu(false)}><X className="size-5" /></button>
      </div>
      <div className="shrink-0 px-3 pt-5">
        <p className="px-3 font-display text-[10px] font-bold uppercase tracking-wider text-white/40">Your workspace</p>
        <nav className="mt-2 space-y-1">
          <NavLink to={activeNav.to} onClick={() => setMobileMenu(false)} className="group flex min-h-[56px] items-center gap-3 rounded-lg border border-marigold/40 bg-marigold/15 px-3 py-2.5 text-marigold-100 shadow-sm transition">
            <Icon className="size-5 shrink-0" />
            <span className="min-w-0"><span className="block font-display text-sm font-semibold">{activeNav.label}</span><span className="block text-[11px] opacity-60">{activeNav.hint}</span></span>
          </NavLink>
        </nav>
      </div>

      {tabs && tabs.length > 0 && <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        <p className="px-3 font-display text-[10px] font-bold uppercase tracking-wider text-white/40">Modules</p>
        <nav className="mt-2 space-y-0.5">
          {tabs.map(t => <button
            key={t}
            onClick={() => selectTab(t)}
            className={`block w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold transition ${activeTab === t ? 'bg-marigold text-white shadow-sm' : 'text-white/65 hover:bg-white/5 hover:text-white'}`}
          >
            {t}
          </button>)}
        </nav>
      </div>}

      <div className={`space-y-3 p-4 ${tabs && tabs.length > 0 ? 'shrink-0' : 'mt-auto'}`}>
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-white/70"><Wifi className="size-4 text-emerald-400" />Operations connected</div>
          <p className="mt-1 text-[11px] leading-4 text-white/40">New Surya Sweets · Since 1995</p>
        </div>
        <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-bold text-white/70 transition hover:border-oxblood/40 hover:bg-oxblood/10 hover:text-red-200">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </aside>

    <div className="lg:pl-[272px]">
      <header className="no-print sticky top-0 z-40 flex h-[68px] items-center border-b border-ink/10 bg-paper/95 px-4 backdrop-blur lg:px-7">
        <button aria-label="Open navigation" className="mr-3 grid size-10 place-items-center rounded-md border border-ink/15 text-ink-700 lg:hidden" onClick={() => setMobileMenu(true)}><Menu className="size-5" /></button>
        <div className="min-w-0">
          <p className="font-display text-[11px] font-bold uppercase tracking-wide text-marigold-700">New Surya · {activeNav.label}</p>
          <p className="truncate text-sm font-bold text-ink">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button title="Notifications" className="relative grid size-10 place-items-center rounded-md border border-ink/15 text-ink-600 hover:bg-paper-dim"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-oxblood" /></button>
          <div className="hidden items-center gap-2 rounded-md border border-ink/15 bg-paper-dim py-1.5 pl-2 pr-3 sm:flex">
            <div className="grid size-7 place-items-center rounded-md bg-ink text-xs font-bold text-white">{initials}</div>
            <div><p className="text-xs font-bold leading-4 text-ink-700">{displayName}</p><p className="text-[10px] text-ink-600/60">Secure session</p></div>
          </div>
          <button title="Sign out" onClick={handleLogout} className="hidden size-10 place-items-center rounded-md border border-ink/15 text-ink-600 hover:border-oxblood/30 hover:bg-red-50 hover:text-oxblood sm:grid"><LogOut className="size-4" /></button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1780px] px-3 pb-10 pt-6 sm:px-5 lg:px-7">
        <div className="mb-5 flex flex-col gap-2 border-b border-ink/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 font-display text-[10px] font-bold uppercase tracking-wide text-marigold-700">{activeNav.label} workspace</p><h2 className="font-display text-2xl font-extrabold leading-tight text-ink sm:text-[28px]">{title}</h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-ink-600">{subtitle}</p>
          </div><div className="hidden items-center gap-2 text-xs font-semibold text-ink-600 sm:flex"><span className="size-2 rounded-full bg-tgreen" />Live operational data</div>
        </div>
        {children}
      </main>
    </div>
  </div>;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = {}; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <div className="grid min-h-screen place-items-center bg-paper-dim p-6">
      <div className="w-full max-w-2xl rounded-lg border border-ink/10 bg-paper p-6 shadow-xl">
        <div className="grid size-11 place-items-center rounded-lg bg-red-50 text-oxblood"><AlertTriangle className="size-6" /></div>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">We could not open this workspace</h1>
        <p className="mt-2 text-sm text-ink-600">The error was contained. Reload the page or share the detail below with support.</p>
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-ink p-4 font-ticket text-xs text-white/90">{this.state.error.message}\n{this.state.error.stack}</pre>
      </div>
    </div>;
    return this.props.children;
  }
}
