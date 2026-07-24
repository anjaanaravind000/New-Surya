import { useEffect, useMemo, useRef, useState } from 'react';
import { Command, Moon, Plus, Search, Sparkles, Sun, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { completeFeatureCatalog, type DashboardId } from '../data/completeFeatureCatalog';

const dashboardPath: Record<DashboardId, string> = {
  admin: '/admin',
  branch: '/branch',
  'branch-incharge': '/branch-incharge',
  kitchen: '/kitchen',
  'stock-audit': '/stock-audit',
};

export default function CoreCommandCenter({ dashboard }: { dashboard: DashboardId }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const inputRef = useRef<HTMLInputElement>(null);
  const modules = useMemo(() => completeFeatureCatalog.filter(module => module.dashboard === dashboard), [dashboard]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return !term ? modules : modules.filter(module => `${module.name} ${module.group} ${module.description}`.toLowerCase().includes(term));
  }, [modules, query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setOpen(value => !value);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(timer);
  }, [open]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('new-surya-theme', next ? 'dark' : 'light');
  };

  const choose = (id: string) => {
    setOpen(false); setQuery('');
    navigate(`${dashboardPath[dashboard]}?suite=complete-feature-centre&module=${encodeURIComponent(id)}`);
    window.setTimeout(() => window.location.reload(), 20);
  };

  return <>
    <button onClick={toggleTheme} title={dark ? 'Use light mode' : 'Use dark mode'} className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-white/70">{dark ? <Sun className="size-4" /> : <Moon className="size-4" />}</button>
    <button onClick={() => setOpen(true)} className="hidden min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-3.5 text-xs font-black text-white shadow-lg shadow-orange-950/15 transition hover:-translate-y-0.5 sm:flex"><Plus className="size-4" />Create / Search<span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[9px]">Ctrl K</span></button>
    <button onClick={() => setOpen(true)} title="Create or search" className="grid size-10 place-items-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg sm:hidden"><Search className="size-4" /></button>

    {open && <div className="fixed inset-0 z-[150] flex items-start justify-center bg-slate-950/70 px-3 pt-[7vh] backdrop-blur-md" role="dialog" aria-modal="true"><button className="absolute inset-0" aria-label="Close command centre" onClick={() => setOpen(false)} /><section className="relative w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/20 bg-white/95 shadow-[0_45px_140px_-35px_rgba(15,23,42,.9)] dark:bg-slate-950/95"><header className="border-b border-slate-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 dark:border-white/10 dark:from-amber-950/30 dark:via-slate-950 dark:to-orange-950/20"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white"><Sparkles className="size-5" /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.22em] text-orange-600">New Surya command centre</p><h2 className="text-xl font-black text-slate-950 dark:text-white">Find any module or create a record</h2></div><button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-500 dark:border-white/10"><X className="size-4" /></button></div><div className="relative mt-4"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input ref={inputRef} className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-12 text-sm font-bold text-slate-950 outline-none ring-orange-400/20 focus:ring-4 dark:border-white/10 dark:bg-white/5 dark:text-white" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, wallet, promotions, audit, production, reports…" /><Command className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" /></div></header><div className="max-h-[62vh] overflow-y-auto p-4"><div className="grid gap-2 sm:grid-cols-2">{filtered.map(module => <button key={module.id} onClick={() => choose(module.id)} className="group flex min-h-20 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[.04]"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-700 dark:from-orange-500/20 dark:to-rose-500/10 dark:text-orange-300"><Plus className="size-5" /></span><span className="min-w-0"><strong className="block text-sm font-black text-slate-950 dark:text-white">{module.name}</strong><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wide text-orange-600">{module.group}</span><span className="mt-1 line-clamp-2 block text-[11px] leading-4 text-slate-500 dark:text-white/45">{module.description}</span></span></button>)}</div>{filtered.length === 0 && <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-slate-300 text-sm font-bold text-slate-500 dark:border-white/15">No matching module</div>}</div></section></div>}
  </>;
}
