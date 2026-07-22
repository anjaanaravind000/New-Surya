import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, ClipboardCheck, Eye, EyeOff, Lock, ShieldCheck, Store, UserCog, UserRound } from 'lucide-react';
import { useAuth } from '../state/AuthContext';

type Role = 'admin' | 'branch' | 'kitchen' | 'branch-incharge' | 'stock-audit';

const roleCards: { role: Role; label: string; icon: typeof UserRound; blurb: string }[] = [
  { role: 'admin', label: 'Admin', icon: ShieldCheck, blurb: 'Company-wide command centre' },
  { role: 'branch', label: 'Branch', icon: Store, blurb: 'Billing & customer orders' },
  { role: 'kitchen', label: 'Kitchen', icon: ChefHat, blurb: 'Production, bake & packing' },
  { role: 'branch-incharge', label: 'Branch Incharge', icon: UserCog, blurb: 'Outlet people & controls' },
  { role: 'stock-audit', label: 'Stock Audit', icon: ClipboardCheck, blurb: 'Count, verify & reconcile' }
];

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  function handlePick(role: Role) {
    const profile = roleCards.find(r => r.role === role);
    if (profile) setUsername(profile.label);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const profile = await signIn(username, password);
      navigate(profile.homePath, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Username or password is incorrect. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0d10] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:26px_26px]" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl md:grid-cols-2">
        {/* Left brand / role panel */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#171a1d] via-[#15181b] to-[#0b0d10] p-8 md:flex">
          <div>
            <img src="/brand/new-surya-client-logo.jpg" alt="New Surya Sweets & Savouries" className="h-auto w-[190px] rounded-md object-contain" />
            <h1 className="mt-8 text-2xl font-extrabold leading-tight text-white">One login.<br />Your own workspace.</h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-slate-400">Each role sees only what it needs. Nothing else clutters the screen.</p>
          </div>
          <div className="space-y-2">
            {roleCards.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handlePick(item.role)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition hover:border-[#c18a31]/40 hover:bg-[#c18a31]/10"
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.06] text-[#e3b563] ring-1 ring-white/10 transition group-hover:bg-[#c18a31]/20">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="truncate text-[11px] text-slate-500">{item.blurb}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-600">New Surya Sweets &amp; Savouries | Since 1995</p>
        </div>

        {/* Right form panel */}
        <div className="flex flex-col justify-center bg-[#0f1114] p-8 sm:p-10">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 md:hidden">
              <img src="/brand/new-surya-client-logo.jpg" alt="New Surya Sweets & Savouries" className="h-auto w-[150px] rounded-md object-contain" />
            </div>

            <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#c18a31]/30 bg-[#c18a31]/10 px-3 py-1 text-[11px] font-bold text-[#e3b563]">
              <Lock className="size-3" /> Secure workspace access
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-white">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your role's username and password to continue.</p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Username</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="e.g. Admin"
                    autoComplete="username"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-[#c18a31]/50 focus:ring-4 focus:ring-[#c18a31]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-11 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-[#c18a31]/50 focus:ring-4 focus:ring-[#c18a31]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-white/5 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !username || !password}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c18a31] to-[#a06d20] text-sm font-bold text-white shadow-[0_10px_30px_-10px_rgba(193,138,49,0.6)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
              {roleCards.map(item => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handlePick(item.role)}
                  className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2.5 text-center text-[11px] font-semibold text-slate-300 hover:border-[#c18a31]/40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
