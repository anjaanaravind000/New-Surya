import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

const badgeTone: Record<Tone, string> = {
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  blue: 'border-sky-200 bg-sky-50 text-sky-700',
  purple: 'border-violet-200 bg-violet-50 text-violet-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  slate: 'border-slate-200 bg-slate-100 text-slate-700',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  pink: 'border-pink-200 bg-pink-50 text-pink-700'
};

const iconTone: Record<Tone, string> = {
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  red: 'bg-rose-50 text-rose-700 ring-rose-100',
  blue: 'bg-sky-50 text-sky-700 ring-sky-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  pink: 'bg-pink-50 text-pink-700 ring-pink-100'
};

const buttonTone: Record<Tone, string> = {
  orange: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-200',
  green: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200',
  emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-200',
  red: 'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-200',
  blue: 'bg-sky-600 text-white hover:bg-sky-700 focus-visible:ring-sky-200',
  purple: 'bg-violet-600 text-white hover:bg-violet-700 focus-visible:ring-violet-200',
  amber: 'bg-amber-400 text-slate-950 hover:bg-amber-300 focus-visible:ring-amber-200',
  slate: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-300',
  cyan: 'bg-cyan-600 text-white hover:bg-cyan-700 focus-visible:ring-cyan-200',
  pink: 'bg-pink-600 text-white hover:bg-pink-700 focus-visible:ring-pink-200'
};

const barTone: Record<Tone, string> = {
  orange: 'bg-orange-500', green: 'bg-emerald-500', emerald: 'bg-emerald-500', red: 'bg-rose-500',
  blue: 'bg-sky-500', purple: 'bg-violet-500', amber: 'bg-amber-500', slate: 'bg-slate-500',
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
  return <div className={`min-w-0 rounded-lg border border-slate-200/90 border-t-2 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)] ${tone === 'orange' || tone === 'amber' ? 'border-t-[#b7791f]' : tone === 'green' || tone === 'emerald' ? 'border-t-emerald-500' : tone === 'red' ? 'border-t-rose-500' : tone === 'blue' || tone === 'cyan' ? 'border-t-sky-500' : tone === 'purple' || tone === 'pink' ? 'border-t-violet-500' : 'border-t-slate-500'}`}>
    <div className="flex items-start gap-3">
      <div className={`grid size-10 shrink-0 place-items-center rounded-lg ring-1 ${iconTone[tone]}`}><Icon className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <div className="mt-0.5 break-words text-xl font-extrabold leading-7 text-slate-950">{value}</div>
      </div>
    </div>
    <p className="mt-3 min-h-5 text-xs leading-5 text-slate-500">{helper}</p>
  </div>;
}

export function Card({ title, description, action, children, className = '' }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`min-w-0 rounded-lg border border-slate-200/90 bg-white shadow-[0_1px_3px_rgba(15,23,42,.05)] ${className}`}>
    <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between lg:px-5">
      <div className="min-w-0">
        <h3 className="text-[15px] font-bold leading-6 text-slate-950">{title}</h3>
        {description && <p className="mt-0.5 max-w-3xl text-sm leading-5 text-slate-500">{description}</p>}
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

  if (!rows.length) return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center text-sm font-semibold text-slate-500">{empty}</div>;
  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
    {searchable && <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input aria-label="Search table" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search records" className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100" />
      </label>
      <p className="text-xs font-semibold text-slate-500">{filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} records</p>
    </div>}
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-50/90">
          <tr>{columns.map((c, columnIndex) => <th key={`${c.key}-${columnIndex}`} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-[11px] font-bold text-slate-500">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleRows.map((row, index) => <tr key={String((row as Record<string, unknown>).id ?? (row as Record<string, unknown>).itemCode ?? `${effectivePage}-${index}`)} className="transition-colors hover:bg-sky-50/35">
            {columns.map((c, columnIndex) => <td key={`${c.key}-${columnIndex}`} className="max-w-[22rem] whitespace-nowrap px-4 py-3 align-middle text-slate-700">{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
    {!filteredRows.length && <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">No matching records</div>}
    {searchable && totalPages > 1 && <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold text-slate-500">Page {effectivePage} of {totalPages}</p>
      <div className="flex gap-2">
        <button type="button" title="Previous page" aria-label="Previous page" disabled={effectivePage === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35"><ChevronLeft className="size-4" /></button>
        <button type="button" title="Next page" aria-label="Next page" disabled={effectivePage === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-35"><ChevronRight className="size-4" /></button>
      </div>
    </div>}
  </div>;
}

export function DashboardTabs<T extends string>({ tabs, active, setActive }: { tabs: readonly T[]; active: T; setActive: (tab: T) => void }) {
  return <div className="no-print sticky top-[68px] z-30 mb-4 border border-slate-200 bg-white/95 p-2 shadow-[0_3px_12px_rgba(15,23,42,.06)] backdrop-blur">
    <div className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex">
      {tabs.map(tab => <button key={tab} onClick={() => setActive(tab)} className={`min-h-10 shrink-0 rounded-md border px-3.5 text-sm font-semibold transition ${active === tab ? 'border-[#a66b16] bg-[#a66b16] text-white shadow-sm' : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950'}`}>{tab}</button>)}
    </div>
    <div className="relative md:hidden">
      <select aria-label="Current module" className="h-11 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-10 text-sm font-bold text-slate-900 outline-none" value={active} onChange={event => setActive(event.target.value as T)}>
        {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
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
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
}

export const inputClass = 'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100';

export function DebugPanel({ events }: { events: DebugEvent[] }) {
  const tone = (level: DebugEvent['level']): Tone => level === 'error' ? 'red' : level === 'warning' ? 'amber' : level === 'success' ? 'green' : 'blue';
  return <Card title="Support activity" description="Recent system events and operational checks.">
    <div className="divide-y divide-slate-100">{events.slice(0, 14).map(event => <div key={event.id} className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-2"><Pill tone={tone(event.level)}>{event.level}</Pill><b className="text-sm text-slate-900">{event.module}</b><span className="text-xs text-slate-400">{new Date(event.at).toLocaleString()}</span></div>
      <p className="mt-2 text-sm font-semibold text-slate-700">{event.message}</p>
      {event.detail && <p className="mt-1 text-xs leading-5 text-slate-500">{event.detail}</p>}
    </div>)}</div>
  </Card>;
}

export function MiniBar({ label, value, max = 100, tone = 'orange' }: { label: string; value: number; max?: number; tone?: Tone }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return <div>
    <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500"><span>{label}</span><span>{pct}%</span></div>
    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${barTone[tone]}`} style={{ width: `${pct}%` }} /></div>
  </div>;
}

export function ShortcutGrid() {
  const keys = [['F2','Search'],['Ctrl+K','Find item'],['F4','Hold bill'],['F6','Open counter'],['F7','Cash'],['F8','UPI'],['F9','Checkout'],['Alt+D','Duplicate'],['Alt+R','Recall'],['Ctrl+Backspace','Clear']];
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{keys.map(([key, value]) => <div key={key} className="rounded-md border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center gap-2"><Keyboard className="size-4 text-slate-400" /><b className="text-sm text-slate-800">{key}</b></div>
    <p className="mt-1 text-xs text-slate-500">{value}</p>
  </div>)}</div>;
}

const navigation = [
  { to: '/', label: 'Admin', icon: LayoutDashboard, hint: 'Company command centre' },
  { to: '/kitchen', label: 'Kitchen', icon: ChefHat, hint: 'Store, bake and packing' },
  { to: '/branch', label: 'Branch', icon: Store, hint: 'Billing and customer orders' },
  { to: '/branch-incharge', label: 'Branch Incharge', icon: UserCog, hint: 'Outlet people and controls' },
  { to: '/stock-audit', label: 'Stock Audit', icon: ClipboardCheck, hint: 'Count, verify and reconcile' }
];

export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const location = useLocation();
  const activeNav = navigation.find(item => item.to === location.pathname) ?? navigation[0];
  const sessionRole = location.pathname.startsWith('/branch-incharge') || location.pathname.startsWith('/branch-control')
    ? { name:'Branch Incharge', initials:'BI' }
    : location.pathname.startsWith('/stock-audit')
      ? { name:'Stock Auditor', initials:'SA' }
    : location.pathname.startsWith('/branch')
      ? { name:'Branch Cashier', initials:'BC' }
      : location.pathname.startsWith('/kitchen')
        ? { name:'Kitchen Manager', initials:'KM' }
        : { name:'Owner / Super Admin', initials:'OA' };
  return <div className="min-h-screen bg-[#f3f5f6] text-slate-950">
    {mobileMenu && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={() => setMobileMenu(false)} />}
    <aside className={`no-print fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-[#2e2923] bg-[#171a1d] text-white transition-transform lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-[92px] items-center gap-3 border-b border-white/10 px-5">
        <img src="/brand/new-surya-client-logo.jpg" alt="New Surya Sweets & Savouries" className="h-auto w-[210px] object-contain" />
        <button aria-label="Close navigation" className="ml-auto grid size-9 place-items-center rounded-md text-slate-300 hover:bg-white/10 lg:hidden" onClick={() => setMobileMenu(false)}><X className="size-5" /></button>
      </div>
      <div className="px-3 py-5">
        <p className="px-3 text-[10px] font-bold text-slate-500">ROLE WORKSPACES</p>
        <nav className="mt-2 space-y-1">{navigation.map(item => {
          const Icon = item.icon;
          return <NavLink key={item.to} end={item.to === '/'} to={item.to} onClick={() => setMobileMenu(false)} className={({ isActive }) => `group flex min-h-[56px] items-center gap-3 rounded-lg border px-3 py-2.5 transition ${isActive ? 'border-[#c18a31]/40 bg-[#c18a31]/15 text-[#f3cf8e] shadow-sm' : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'}`}>
            <Icon className="size-5 shrink-0" />
            <span className="min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className="block text-[11px] opacity-55">{item.hint}</span></span>
          </NavLink>;
        })}</nav>
      </div>
      <div className="mt-auto p-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300"><Wifi className="size-4 text-emerald-400" />Operations connected</div>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">New Surya Sweets · Since 1995</p>
        </div>
      </div>
    </aside>

    <div className="lg:pl-[272px]">
      <header className="no-print sticky top-0 z-40 flex h-[68px] items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7">
        <button aria-label="Open navigation" className="mr-3 grid size-10 place-items-center rounded-md border border-slate-200 text-slate-700 lg:hidden" onClick={() => setMobileMenu(true)}><Menu className="size-5" /></button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#9b671d]">NEW SURYA · {activeNav.label}</p>
          <p className="truncate text-sm font-bold text-slate-900">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button title="Notifications" className="relative grid size-10 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-rose-500" /></button>
          <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-3 sm:flex">
            <div className="grid size-7 place-items-center rounded-md bg-slate-900 text-xs font-bold text-white">{sessionRole.initials}</div>
            <div><p className="text-xs font-bold leading-4 text-slate-800">{sessionRole.name}</p><p className="text-[10px] text-slate-400">Secure session</p></div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1780px] px-3 pb-10 pt-6 sm:px-5 lg:px-7">
        <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="mb-1 text-[10px] font-bold text-[#9b671d]">{activeNav.label.toUpperCase()} WORKSPACE</p><h2 className="text-2xl font-extrabold leading-tight text-slate-950 sm:text-[28px]">{title}</h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">{subtitle}</p>
          </div><div className="hidden items-center gap-2 text-xs font-semibold text-slate-500 sm:flex"><span className="size-2 rounded-full bg-emerald-500" />Live operational data</div>
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
    if (this.state.error) return <div className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
        <div className="grid size-11 place-items-center rounded-lg bg-rose-50 text-rose-600"><AlertTriangle className="size-6" /></div>
        <h1 className="mt-4 text-xl font-bold">We could not open this workspace</h1>
        <p className="mt-2 text-sm text-slate-500">The error was contained. Reload the page or share the detail below with support.</p>
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-200">{this.state.error.message}\n{this.state.error.stack}</pre>
      </div>
    </div>;
    return this.props.children;
  }
}
