import React from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
  Moon,
  Search,
  Store,
  Sun,
  UserCog,
  Wifi,
  X,
  type LucideIcon
} from 'lucide-react';
import type { DebugEvent, ModuleStatus, Tone } from '../lib/types';
import { useAuth } from '../state/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import CoreCommandCenter from './CoreCommandCenter';
import type { DashboardId } from '../data/completeFeatureCatalog';

const badgeTone: Record<Tone, string> = {
  orange: 'border-[hsl(var(--pn-gold))]/40 bg-[hsl(var(--pn-gold))]/12 text-[hsl(var(--pn-gold))]',
  green: 'border-[hsl(var(--pn-pistachio))]/40 bg-[hsl(var(--pn-pistachio))]/12 text-[hsl(var(--pn-pistachio))]',
  emerald: 'border-[hsl(var(--pn-pistachio))]/40 bg-[hsl(var(--pn-pistachio))]/12 text-[hsl(var(--pn-pistachio))]',
  red: 'border-[hsl(var(--pn-berry))]/40 bg-[hsl(var(--pn-berry))]/12 text-[hsl(var(--pn-berry))]',
  blue: 'border-sky-400/40 bg-sky-400/12 text-sky-300',
  purple: 'border-violet-400/40 bg-violet-400/12 text-violet-300',
  amber: 'border-[hsl(var(--pn-gold))]/40 bg-[hsl(var(--pn-gold))]/12 text-[hsl(var(--pn-gold))]',
  slate: 'border-white/12 bg-white/6 text-[hsl(var(--pn-cream-soft))]',
  cyan: 'border-cyan-400/40 bg-cyan-400/12 text-cyan-300',
  pink: 'border-[hsl(var(--pn-rose))]/40 bg-[hsl(var(--pn-rose))]/12 text-[hsl(var(--pn-rose))]'
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
  orange: 'pn-btn-gold text-[hsl(var(--pn-espresso))] focus-visible:ring-amber-200/30',
  green: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(16,185,129,.5)] focus-visible:ring-emerald-200/30',
  emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(16,185,129,.5)] focus-visible:ring-emerald-200/30',
  red: 'bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(244,63,94,.5)] focus-visible:ring-rose-200/30',
  blue: 'bg-gradient-to-br from-sky-500 to-sky-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(14,165,233,.5)] focus-visible:ring-sky-200/30',
  purple: 'bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(139,92,246,.5)] focus-visible:ring-violet-200/30',
  amber: 'pn-btn-gold text-[hsl(var(--pn-espresso))] focus-visible:ring-amber-200/30',
  slate: 'bg-white/[0.05] text-[hsl(var(--pn-cream))] border border-white/10 hover:bg-white/[0.09] hover:border-[hsl(var(--pn-gold))]/30 focus-visible:ring-stone-300/30',
  cyan: 'bg-gradient-to-br from-cyan-500 to-cyan-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(6,182,212,.5)] focus-visible:ring-cyan-200/30',
  pink: 'bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_8px_22px_-10px_rgba(236,72,153,.5)] focus-visible:ring-pink-200/30'
};

const barTone: Record<Tone, string> = {
  orange: 'bg-[#b06a2b]', green: 'bg-emerald-500', emerald: 'bg-emerald-500', red: 'bg-rose-500',
  blue: 'bg-sky-500', purple: 'bg-violet-500', amber: 'bg-[#d4a64f]', slate: 'bg-stone-500',
  cyan: 'bg-cyan-500', pink: 'bg-pink-500'
};

export function Pill({ children, tone = 'slate' }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none ${badgeTone[tone]}`}>{children}</span>;
}

export function StatusPill({ status }: { status: ModuleStatus }) {
  const tone: Tone = status === 'implemented' ? 'green' : status === 'credential-required' ? 'amber' : status === 'device-required' ? 'purple' : status === 'schema-ready' ? 'blue' : 'slate';
  return <Pill tone={tone}>{status.replaceAll('-', ' ')}</Pill>;
}

const orbTintClass: Record<Tone, string> = {
  orange: 'pn-tint-gold',
  green: 'pn-tint-pistachio',
  emerald: 'pn-tint-pistachio',
  red: 'pn-tint-berry',
  blue: 'pn-tint-sky',
  purple: 'pn-tint-violet',
  amber: 'pn-tint-gold',
  slate: 'pn-tint-cocoa',
  cyan: 'pn-tint-sky',
  pink: 'pn-tint-rose'
};

export function Metric({ icon: Icon, label, value, helper, tone = 'orange' }: { icon: LucideIcon; label: string; value: string; helper: string; tone?: Tone }) {
  const reduceMotion = useReducedMotion();
  return <motion.div
    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }}
    whileHover={reduceMotion ? undefined : { y: -4 }}
    className={`pn-orb ${orbTintClass[tone]}`}>
    <div className="flex items-start gap-3">
      <div className="pn-orb-icon shrink-0"><Icon className="size-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="pn-orb-label">{label}</p>
        <div className="pn-orb-value break-words">{value}</div>
      </div>
    </div>
    <p className="pn-orb-helper">{helper}</p>
  </motion.div>;
}

export function Card({ title, description, action, children, className = '' }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.section
    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: .35, ease: [0.22, 1, 0.36, 1] }}
    className={`pn-card min-w-0 ${className}`}>
    <div className="pn-card-head flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h3 className="pn-card-title">{title}</h3>
        {description && <p className="pn-card-desc max-w-3xl">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div className="pn-card-body">{children}</div>
  </motion.section>;
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

  if (!rows.length) return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center text-sm font-semibold text-slate-500">{empty}</div>;
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    {searchable && <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative block w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input aria-label="Search table" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search records" className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-[#b06a2b] focus:ring-4 focus:ring-amber-100" />
      </label>
      <p className="text-xs font-semibold text-slate-500">{filteredRows.length.toLocaleString()} of {rows.length.toLocaleString()} records</p>
    </div>}
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-slate-50/90">
          <tr>{columns.map((c, columnIndex) => <th key={`${c.key}-${columnIndex}`} className="whitespace-nowrap border-b border-slate-200 px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[.12em] text-slate-500">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleRows.map((row, index) => <tr key={String((row as Record<string, unknown>).id ?? (row as Record<string, unknown>).itemCode ?? `${effectivePage}-${index}`)} className="transition-colors hover:bg-amber-50/40 dark:hover:bg-white/[.04]">
            {columns.map((c, columnIndex) => <td key={`${c.key}-${columnIndex}`} className="max-w-[22rem] whitespace-nowrap px-4 py-3 align-middle text-slate-700">{c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}</td>)}
          </tr>)}
        </tbody>
      </table>
    </div>
    {!filteredRows.length && <div className="px-5 py-10 text-center text-sm font-semibold text-slate-500">No matching records</div>}
    {searchable && totalPages > 1 && <div className="flex items-center justify-between border-t border-slate-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold text-slate-500">Page {effectivePage} of {totalPages}</p>
      <div className="flex gap-2">
        <button type="button" title="Previous page" aria-label="Previous page" disabled={effectivePage === 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="grid size-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-35"><ChevronLeft className="size-4" /></button>
        <button type="button" title="Next page" aria-label="Next page" disabled={effectivePage === totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))} className="grid size-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-35"><ChevronRight className="size-4" /></button>
      </div>
    </div>}
  </div>;
}

// Tab category taxonomy — pattern-based, shared across all 5 dashboards.
// Order defines display order. First matching category wins.
const CATEGORY_ORDER: string[] = ['Overview', 'Sales & Billing', 'Inventory & Stock', 'Kitchen & Production', 'Purchases & Suppliers', 'Customers & CRM', 'Team & Attendance', 'Finance & Payments', 'Reports & Analytics', 'Marketing & Growth', 'Compliance & Audit', 'Configuration', 'System'];
const CATEGORY_ICONS: Record<string, string> = {
  'Overview': 'M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z',
  'Sales & Billing': 'M3 3h18v4H3V3zm0 6h18v12H3V9z',
  'Inventory & Stock': 'M4 7l8-4 8 4-8 4-8-4zm0 5l8 4 8-4M4 17l8 4 8-4',
  'Kitchen & Production': 'M12 2a5 5 0 015 5v2H7V7a5 5 0 015-5zm-7 9h14l-1 11H6L5 11z',
  'Purchases & Suppliers': 'M3 3h18v4H3zM5 7v14h14V7',
  'Customers & CRM': 'M12 12a4 4 0 100-8 4 4 0 000 8zm-8 9a8 8 0 0116 0',
  'Team & Attendance': 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
  'Finance & Payments': 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
  'Reports & Analytics': 'M3 3v18h18M9 17V9m4 8V5m4 12v-7',
  'Marketing & Growth': 'M3 11l19-9-9 19-2-8-8-2z',
  'Compliance & Audit': 'M12 2l9 4v6c0 5-3.5 9-9 10-5.5-1-9-5-9-10V6l9-4z',
  'Configuration': 'M12 15a3 3 0 100-6 3 3 0 000 6zm7-3l3-2-2-3-3 1-2-1-1-3h-4l-1 3-2 1-3-1-2 3 3 2v2l-3 2 2 3 3-1 2 1 1 3h4l1-3 2-1 3 1 2-3-3-2v-2z',
  'System': 'M4 4h16v6H4zm0 10h16v6H4z'
};

function categorize(tab: string): string {
  const t = tab.toLowerCase();
  if (/^command$|^today$|^audit desk$|^kitchen cockpit$|^executive|overview|dashboard|control|home/i.test(tab)) return 'Overview';
  if (/bill|invoice|pos|sales|order|checkout|counter|cashier|closure|refund|dispatch|delivery/.test(t)) return 'Sales & Billing';
  if (/stock|inventor|item|product|master|recip|bom|expiry|physical count|packing|verif|movement|waste|yield|barcod|batch|label|traceab/.test(t)) return 'Inventory & Stock';
  if (/kitchen|production|bake|kot|kds|qc|trial|equipment maintenance|approval queue|store \/|planner/.test(t)) return 'Kitchen & Production';
  if (/purchas|supplier|procurement|vendor|grn|po\b|rate contract/.test(t)) return 'Purchases & Suppliers';
  if (/customer|crm|loyalt|hamper|feedback|complaint|booking|party|home delivery|franchise/.test(t)) return 'Customers & CRM';
  if (/attend|staff|team|shift|roster|salespers|payroll|user|access|role/.test(t)) return 'Team & Attendance';
  if (/cash|bank|payment|credit|expens|deposit|quotation|salary|advance/.test(t)) return 'Finance & Payments';
  if (/report|bi\b|analytic|visuali|forecast|performance|p&l|history/.test(t)) return 'Reports & Analytics';
  if (/promo|campaign|marketing|festival|season|gift|referral/.test(t)) return 'Marketing & Growth';
  if (/gst|compliance|audit|traceab|fssai|log|alert|notification/.test(t)) return 'Compliance & Audit';
  if (/setting|threshold|integration|hardware|permission|registry|feature|menu management|digital menu/.test(t)) return 'Configuration';
  return 'System';
}

export function DashboardTabs<T extends string>({ tabs, active, setActive }: { tabs: readonly T[]; active: T; setActive: (tab: T) => void }) {
  const stripRef = React.useRef<HTMLDivElement>(null);
  const [sidebarSlot, setSidebarSlot] = React.useState<HTMLElement | null>(null);
  const [moduleQuery, setModuleQuery] = React.useState('');
  React.useEffect(() => {
    setSidebarSlot(document.getElementById('sidebar-modules-slot'));
  }, []);
  React.useEffect(() => {
    const current = stripRef.current?.querySelector<HTMLButtonElement>('[data-current="true"]');
    current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [active]);
  const move = (direction: number) => stripRef.current?.scrollBy({ left: direction * 420, behavior: 'smooth' });

  const query = moduleQuery.trim().toLowerCase();
  const visibleTabs = query ? tabs.filter(tab => tab.toLowerCase().includes(query)) : tabs;

  // Group visible tabs into categories
  const grouped = React.useMemo(() => {
    const groups = new Map<string, T[]>();
    for (const tab of visibleTabs) {
      const cat = categorize(tab);
      const list = groups.get(cat) ?? [];
      list.push(tab);
      groups.set(cat, list);
    }
    return CATEGORY_ORDER
      .filter(cat => groups.has(cat))
      .map(cat => ({ category: cat, items: groups.get(cat)! }))
      .concat(Array.from(groups.keys()).filter(cat => !CATEGORY_ORDER.includes(cat)).map(cat => ({ category: cat, items: groups.get(cat)! })));
  }, [visibleTabs]);

  // Track collapsed categories in localStorage per dashboard signature.
  const storageKey = `pn-sidebar-open-${tabs.slice(0, 3).join('|')}`;
  const [openCats, setOpenCats] = React.useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return new Set(JSON.parse(saved) as string[]);
    } catch { /* ignore */ }
    // Default: first two categories expanded, rest collapsed.
    return new Set(CATEGORY_ORDER.slice(0, 2));
  });
  React.useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(Array.from(openCats))); } catch { /* ignore */ } }, [openCats, storageKey]);

  // Auto-expand the group that contains the active tab.
  const activeCategory = React.useMemo(() => categorize(active), [active]);
  React.useEffect(() => {
    setOpenCats(current => current.has(activeCategory) ? current : new Set([...Array.from(current), activeCategory]));
  }, [activeCategory]);

  const toggleCat = (cat: string) => setOpenCats(current => {
    const next = new Set(current);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    return next;
  });

  const desktopList = <div className="flex flex-col gap-1 py-2">
    <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--pn-gold))]/90">Workspace modules</p>
    {tabs.length > 8 && <label className="relative mx-2 mb-2 block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-500" />
      <input value={moduleQuery} onChange={event => setModuleQuery(event.target.value)} placeholder="Filter modules…" data-testid="sidebar-module-filter" className="h-9 w-full rounded-xl border border-white/10 bg-white/[.04] pl-8 pr-3 text-xs font-semibold text-stone-200 outline-none transition-colors placeholder:text-stone-500 focus:border-[hsl(var(--pn-gold))]/60 focus:bg-white/[.08]" />
    </label>}
    {grouped.map(group => {
      const isOpen = !!query || openCats.has(group.category) || group.items.some(item => item === active);
      const iconPath = CATEGORY_ICONS[group.category] ?? CATEGORY_ICONS['System'];
      return <div key={group.category} data-testid={`sidebar-group-${group.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
        <button type="button" onClick={() => toggleCat(group.category)} className="group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--pn-cream-mute))] transition-colors hover:text-[hsl(var(--pn-gold))]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0 opacity-70"><path d={iconPath} /></svg>
          <span className="flex-1">{group.category}</span>
          <span className="rounded-full bg-white/[.06] px-1.5 py-0.5 text-[9px] font-bold text-[hsl(var(--pn-cream-soft))]">{group.items.length}</span>
          <ChevronDown className={`size-3.5 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        </button>
        {isOpen && <div className="mb-2 mt-0.5 flex flex-col gap-0.5 pl-2">
          {group.items.map(tab => <button key={tab} data-current={active === tab} onClick={() => setActive(tab)} className={`pn-tab ${active === tab ? 'pn-tab-active' : ''}`}>{tab}</button>)}
        </div>}
      </div>;
    })}
    {!visibleTabs.length && <p className="px-3 py-2 text-xs text-stone-500">No modules match</p>}
  </div>;

  return <>
    <div className="no-print mb-5 overflow-hidden rounded-2xl border border-[hsl(var(--pn-gold))]/15 bg-[hsl(var(--pn-espresso-3))]/90 shadow-warm backdrop-blur lg:hidden">
      <div className="flex items-center gap-3 border-b border-[hsl(var(--pn-gold))]/10 bg-[hsl(var(--pn-espresso-2))]/80 px-3 py-2">
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-[hsl(var(--pn-gold))]">Active module</p><p className="truncate text-sm font-extrabold text-[hsl(var(--pn-cream))]">{active}</p></div>
        <span className="hidden text-xs font-semibold text-[hsl(var(--pn-cream-mute))] sm:block">{tabs.length} modules</span>
        <div className="relative w-[190px] sm:w-[230px]">
          <select aria-label="Jump to module" className="h-11 w-full appearance-none rounded-xl border border-[hsl(var(--pn-gold))]/25 bg-[hsl(var(--pn-espresso-3))] px-3 pr-9 text-sm font-bold text-[hsl(var(--pn-cream))] outline-none focus:border-[hsl(var(--pn-gold))] focus:ring-4 focus:ring-[hsl(var(--pn-gold))]/20" value={active} onChange={event => setActive(event.target.value as T)}>
            {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--pn-cream-mute))]" />
        </div>
      </div>
      <div className="relative flex items-center">
        <button type="button" title="Previous modules" aria-label="Previous modules" onClick={() => move(-1)} className="grid size-11 shrink-0 place-items-center border-r border-[hsl(var(--pn-gold))]/10 bg-transparent text-[hsl(var(--pn-cream-soft))] transition-colors hover:bg-white/5"><ChevronLeft className="size-4" /></button>
        <div ref={stripRef} className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto p-2">
          {tabs.map(tab => <button key={tab} data-current={active === tab} onClick={() => setActive(tab)} className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold transition-all duration-200 ${active === tab ? 'border-[hsl(var(--pn-gold))]/50 bg-gradient-to-r from-[hsl(var(--pn-gold))] to-[hsl(var(--pn-gold-deep))] text-[hsl(var(--pn-espresso))] shadow-lg' : 'border-transparent text-[hsl(var(--pn-cream-soft))] hover:border-white/10 hover:bg-white/[.06] hover:text-[hsl(var(--pn-cream))]'}`}>{tab}</button>)}
        </div>
        <button type="button" title="More modules" aria-label="More modules" onClick={() => move(1)} className="grid size-11 shrink-0 place-items-center border-l border-[hsl(var(--pn-gold))]/10 bg-transparent text-[hsl(var(--pn-cream-soft))] transition-colors hover:bg-white/5"><ChevronRight className="size-4" /></button>
      </div>
    </div>
    {sidebarSlot ? createPortal(desktopList, sidebarSlot) : null}
  </>;
}

export function ActionButton({ children, onClick, tone = 'slate', disabled = false, title, className = '', type = 'button', 'data-testid': testId }: { children: React.ReactNode; onClick?: () => void; tone?: Tone; disabled?: boolean; title?: string; className?: string; type?: 'button' | 'submit'; 'data-testid'?: string }) {
  return <motion.button type={type} title={title} aria-label={title} data-testid={testId} disabled={disabled} onClick={onClick} whileTap={disabled ? undefined : { scale: .97 }} transition={{ duration: .12 }} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm outline-none transition-colors duration-200 focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-45 ${buttonTone[tone]} ${className}`}>{children}</motion.button>;
}

export function ExportButton({ onClick, label = 'Export CSV' }: { onClick: () => void; label?: string }) {
  return <ActionButton onClick={onClick} tone="blue"><Download className="size-4" />{label}</ActionButton>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>{children}</label>;
}

export const inputClass = 'h-11 w-full rounded-xl border border-white/12 bg-white/[.04] px-3 text-sm font-medium text-[hsl(var(--pn-cream))] shadow-inner outline-none transition-colors placeholder:text-[hsl(var(--pn-cream-mute))] focus:border-[hsl(var(--pn-gold))]/60 focus:bg-white/[.08] focus:ring-4 focus:ring-[hsl(var(--pn-gold))]/15';

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
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{keys.map(([key, value]) => <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div className="flex items-center gap-2"><Keyboard className="size-4 text-slate-400" /><b className="text-sm text-slate-800">{key}</b></div>
    <p className="mt-1 text-xs text-slate-500">{value}</p>
  </div>)}</div>;
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('new-surya-theme', next ? 'dark' : 'light'); } catch { /* private mode */ }
  };
  return <button title={dark ? 'Switch to light mode' : 'Switch to dark mode'} data-testid="theme-toggle" onClick={toggle} className="pn-icon-btn">
    {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
  </button>;
}

const navByRole: Record<string, { to: string; label: string; icon: LucideIcon; hint: string; name: string; initials: string }> = {
  admin: { to: '/admin', label: 'Admin', icon: LayoutDashboard, hint: 'Company command centre', name: 'Executive / Super Admin', initials: 'EA' },
  kitchen: { to: '/kitchen', label: 'Kitchen', icon: ChefHat, hint: 'Materials, production and dispatch', name: 'Kitchen Manager', initials: 'KM' },
  branch: { to: '/branch', label: 'Branch', icon: Store, hint: 'Billing and customer orders', name: 'Branch Cashier', initials: 'BC' },
  'branch-incharge': { to: '/branch-incharge', label: 'Branch Incharge', icon: UserCog, hint: 'Outlet people and controls', name: 'Branch Incharge', initials: 'BI' },
  'stock-audit': { to: '/stock-audit', label: 'Stock Audit', icon: ClipboardCheck, hint: 'Count, verify and reconcile', name: 'Stock Auditor', initials: 'SA' }
};

export function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const [mobileMenu, setMobileMenu] = React.useState(false);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const appUser = useAuthStore(state => state.currentUser);
  const routeDashboard = location.pathname.includes('/branch-incharge')
    ? 'branch-incharge'
    : location.pathname.includes('/stock-audit')
      ? 'stock-audit'
      : location.pathname.includes('/kitchen')
        ? 'kitchen'
        : location.pathname.includes('/branch')
          ? 'branch'
          : 'admin';
  const dashboardId = routeDashboard || profile?.dashboards[0] || 'admin';
  const activeNav = navByRole[dashboardId] || navByRole.admin;
  const availableDashboardIds = React.useMemo<Array<keyof typeof navByRole>>(() => {
    const role = appUser?.role;
    if (role === 'admin' || role === 'executive') return ['admin', 'branch', 'branch-incharge', 'kitchen', 'stock-audit'];
    if (role === 'branch_incharge_primary' || role === 'branch_incharge_secondary') return ['branch-incharge', 'branch'];
    if (role === 'branch_primary' || role === 'branch_secondary' || role === 'branch_wholesale' || role === 'billing') return ['branch'];
    if (role === 'stock_audit_primary' || role === 'stock_audit_secondary') return ['stock-audit'];
    if (role === 'kitchen' || role === 'store' || role === 'baker' || role === 'packing' || role === 'sweet_master' || role === 'savouries_master' || role === 'cookies_master' || role === 'puffs_master' || role === 'bakery_master' || role === 'cake_master') return ['kitchen'];
    return [dashboardId];
  }, [appUser?.role, dashboardId]);
  const availableNav = availableDashboardIds.map(id => navByRole[id]).filter(Boolean);
  const displayName = profile?.name ?? appUser?.displayName ?? appUser?.username ?? activeNav.name;
  const initials = profile?.initials ?? (displayName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || activeNav.initials);

  async function handleLogout() {
    await signOut();
    useAuthStore.getState().logout();
    navigate('/login', { replace: true });
  }

  return <div className="pn-shell relative min-h-screen text-stone-100">
    {mobileMenu && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenu(false)} />}
    <aside data-testid="app-sidebar" className={`no-print pn-rail fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col text-white transition-transform lg:translate-x-0 ${mobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="pn-rail-logo flex h-[96px] items-center gap-3 px-5">
        <img src="/brand/new-surya-client-logo.jpg" alt="New Surya Sweets & Savouries" className="h-auto w-[210px] rounded-lg object-contain" />
        <button aria-label="Close navigation" className="ml-auto grid size-9 place-items-center rounded-xl text-stone-300 hover:bg-white/10 lg:hidden" onClick={() => setMobileMenu(false)}><X className="size-5" /></button>
      </div>
      <div id="sidebar-modules-slot" className="hidden min-h-0 flex-1 overflow-y-auto px-2.5 py-3 lg:block" />
      <div className="px-3 py-5 lg:hidden">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[.22em] text-[hsl(var(--pn-gold))]">Your workspace</p>
        <nav className="mt-2 space-y-1">
          {availableNav.map(item => {
            const ItemIcon = item.icon;
            return <NavLink key={item.to} to={item.to} onClick={() => setMobileMenu(false)} className={({ isActive }) => `group flex min-h-[56px] items-center gap-3 rounded-xl border px-3 py-2.5 shadow-sm transition-colors duration-200 ${isActive ? 'border-[hsl(var(--pn-gold))]/45 bg-[hsl(var(--pn-gold))]/15 text-[hsl(var(--pn-gold))]' : 'border-transparent text-stone-300 hover:border-white/10 hover:bg-white/[0.07] hover:text-white'}`}>
              <ItemIcon className="size-5 shrink-0" />
              <span className="min-w-0"><span className="block text-sm font-semibold">{item.label}</span><span className="block text-[11px] opacity-55">{item.hint}</span></span>
            </NavLink>;
          })}
        </nav>
      </div>
      <div className="mt-auto space-y-3 p-4">
        {availableNav.length > 1 && <div className="hidden gap-1.5 lg:flex">
          {availableNav.map(item => {
            const ItemIcon = item.icon;
            return <NavLink key={item.to} to={item.to} title={item.label} className={({ isActive }) => `grid size-9 place-items-center rounded-xl border transition-colors duration-200 ${isActive ? 'border-[hsl(var(--pn-gold))]/45 bg-[hsl(var(--pn-gold))]/20 text-[hsl(var(--pn-gold))]' : 'border-white/10 bg-white/[0.03] text-stone-400 hover:bg-white/[0.07] hover:text-white'}`}>
              <ItemIcon className="size-4" />
            </NavLink>;
          })}
        </div>}
        <div className="rounded-xl border border-[hsl(var(--pn-gold))]/15 bg-gradient-to-br from-white/[0.06] to-transparent p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-200"><Wifi className="size-4 text-[hsl(var(--pn-pistachio))]" />Operations connected</div>
          <p className="mt-1 text-[11px] leading-4 text-stone-500">New Surya Sweets · Since 1995</p>
        </div>
        <button onClick={handleLogout} data-testid="sidebar-signout" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs font-bold text-stone-300 transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </aside>

    <div className="relative z-10 lg:pl-[280px]">
      <header className="pn-header no-print sticky top-0 z-40 flex h-[72px] items-center px-4 lg:px-8">
        <button aria-label="Open navigation" className="mr-3 grid size-10 place-items-center rounded-xl border border-white/10 text-stone-200 lg:hidden" onClick={() => setMobileMenu(true)}><Menu className="size-5" /></button>
        <div className="min-w-0">
          <p className="pn-header-eyebrow text-[10px] font-bold uppercase">New Surya · {activeNav.label}</p>
          <p className="font-display truncate text-[15px] font-bold text-[hsl(var(--pn-cream))]">{title}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <CoreCommandCenter dashboard={dashboardId as DashboardId} />
          <ThemeToggle />
          <button title="Notifications" data-testid="notifications-bell" className="pn-icon-btn relative"><Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-[hsl(var(--pn-berry))] shadow-[0_0_8px_hsl(var(--pn-berry))]" /></button>
          <div className="hidden items-center gap-2 rounded-full border border-[hsl(var(--pn-gold))]/20 bg-gradient-to-r from-white/[0.05] to-transparent py-1.5 pl-2 pr-4 sm:flex">
            <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[hsl(var(--pn-gold))] to-[hsl(var(--pn-gold-deep))] text-xs font-bold text-[hsl(var(--pn-espresso))] shadow-inner">{initials}</div>
            <div><p className="text-xs font-bold leading-4 text-[hsl(var(--pn-cream))]">{displayName}</p><p className="text-[10px] text-[hsl(var(--pn-cream-mute))]">Secure session</p></div>
          </div>
          <button title="Sign out" data-testid="header-signout" onClick={handleLogout} className="pn-icon-btn hidden sm:grid hover:!border-rose-500/40 hover:!text-rose-300"><LogOut className="size-4" /></button>
        </div>
      </header>

      <motion.main data-testid="app-main" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-auto w-full max-w-[1780px] px-3 pb-14 pt-7 sm:px-5 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 border-b border-[hsl(var(--pn-gold))]/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.24em] text-[hsl(var(--pn-gold))]">{activeNav.label} workspace</p>
            <h2 className="font-display bg-gradient-to-r from-[hsl(var(--pn-cream))] via-[hsl(var(--pn-gold))] to-[hsl(var(--pn-rose))] bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent sm:text-4xl">{title}</h2>
            <p className="mt-1.5 max-w-4xl text-sm leading-6 text-[hsl(var(--pn-cream-mute))]">{subtitle}</p>
          </div>
          <div className="pn-live"><span className="pn-live-dot" />Live operational data</div>
        </div>
        {children}
      </motion.main>
    </div>
  </div>;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error?: Error }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = {}; }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <div className="grid min-h-screen place-items-center bg-background p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-warm">
        <div className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-600"><AlertTriangle className="size-6" /></div>
        <h1 className="font-display mt-4 text-xl font-bold">We could not open this workspace</h1>
        <p className="mt-2 text-sm text-slate-500">The error was contained. Reload the page or share the detail below with support.</p>
        <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-stone-950 p-4 text-xs text-stone-200">{this.state.error.message}\n{this.state.error.stack}</pre>
      </div>
    </div>;
    return this.props.children;
  }
}
