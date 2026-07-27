import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getRoleDefaultPath } from '@/lib/routing';
import { Eye, EyeOff, Loader2, AlertCircle, Lock, User, Croissant, ArrowRight } from 'lucide-react';
import retailLogo from '@/assets/retail-logo.png';

const HERO     = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&q=85';
const HERO_400 = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=75&fm=webp';
const HERO_800 = 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80&fm=webp';

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;
const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin' },
  { label: 'Branch', username: 'branch' },
  { label: 'Incharge', username: 'branch incharge' },
  { label: 'Kitchen', username: 'kitchen' },
  { label: 'Stock Audit', username: 'stock audit' },
];

export default function Login() {
  const { login, currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);

  // C-03: client-side brute-force protection with exponential back-off + lockout.
  const MAX_ATTEMPTS  = 5;
  const LOCKOUT_MS    = 15 * 60 * 1000;
  const [failCount,   setFailCount]   = useState(0);
  const [lockUntil,   setLockUntil]   = useState<number | null>(null);
  const [backoffMs,   setBackoffMs]   = useState(0);

  const nowLocked     = lockUntil !== null && Date.now() < lockUntil;
  const remainingSecs = nowLocked ? Math.ceil((lockUntil! - Date.now()) / 1000) : 0;
  const remainingMins = Math.ceil(remainingSecs / 60);

  if (currentUser) {
    return <Navigate to={getRoleDefaultPath(currentUser.role)} replace />;
  }

  const performLogin = async (loginUser: string, loginPass: string) => {
    setError('');
    if (!loginUser.trim() || !loginPass) { setError('Please enter both username and password'); return; }
    if (nowLocked) {
      setError(`Too many failed attempts. Try again in ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}.`);
      return;
    }
    if (backoffMs > 0) {
      setLoading(true);
      await new Promise(r => setTimeout(r, backoffMs));
    }
    setLoading(true);
    const ok = await login(loginUser.trim(), loginPass);
    if (ok) {
      setFailCount(0); setLockUntil(null); setBackoffMs(0);
      const user = useAuthStore.getState().currentUser;
      navigate(user ? getRoleDefaultPath(user.role) : '/billing', { replace: true });
    } else {
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= MAX_ATTEMPTS) {
        setLockUntil(Date.now() + LOCKOUT_MS);
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        const delay = Math.min(Math.pow(2, newCount - 1) * 1000, 30_000);
        setBackoffMs(delay);
        const left = MAX_ATTEMPTS - newCount;
        setError(`Invalid username or password. ${left} attempt${left !== 1 ? 's' : ''} remaining.`);
      }
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin(username, password);
  };

  const inputStyle = 'w-full rounded-2xl border border-white/15 bg-white/[.07] py-3.5 text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-[#d4a64f]/70 focus:bg-white/[.1]';

  return (
    <div className="grid min-h-screen bg-[#100c09] text-white lg:grid-cols-[1.15fr_1fr]">
      {/* ── Cinematic hero panel ── */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={HERO}
          srcSet={`${HERO_400} 400w, ${HERO_800} 800w, ${HERO} 1200w`}
          sizes="(max-width: 1024px) 800px, 1200px"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(16,12,9,.55) 0%, rgba(16,12,9,.82) 78%, rgba(16,12,9,.98) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d4a64f]/40 bg-[#d4a64f]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-[#f8d996]">
            <Croissant className="size-4" /> Premium Bakery OS
          </div>
          <h1 className="font-display max-w-xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Baked with care.<br />Run with precision.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/60">
            One suite for every role — admin command centre, branch billing, kitchen production, outlet management and stock audit.
          </p>
        </div>
      </div>

      {/* ── Sign-in panel ── */}
      <div className="relative flex items-center justify-center px-6 py-12">
        <div className="pointer-events-none absolute right-[-15%] top-[-10%] size-96 rounded-full opacity-25" style={{ background: 'radial-gradient(circle, hsl(30 62% 40%), transparent 68%)', filter: 'blur(70px)' }} />
        <div className="relative w-full max-w-sm">
          <div className="mb-9 flex items-center gap-4">
            <img src={retailLogo} alt="New Surya" className="size-16 rounded-2xl border border-white/20 object-cover shadow-2xl" />
            <div>
              <h1 className="font-display text-2xl font-black tracking-tight text-white">Staff Login</h1>
              <p className="text-xs uppercase tracking-[.2em] text-white/45">New Surya Foods LLP</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-red-500/35 bg-red-500/15 px-4 py-3" data-testid="login-error">
                <AlertCircle className="size-4 shrink-0 text-red-300" />
                <span className="text-sm text-red-200">{error}</span>
              </div>
            )}

            <div className="relative">
              <User className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="off"
                autoComplete="username"
                data-testid="login-username-input"
                className={`${inputStyle} pl-11 pr-4`}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                data-testid="login-password-input"
                className={`${inputStyle} pl-11 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || nowLocked}
              data-testid="login-submit-button"
              className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-full py-4 text-sm font-bold text-[#241505] transition-transform duration-150 active:scale-[.98] disabled:opacity-60"
              style={{ background: loading ? 'rgba(255,255,255,.25)' : 'linear-gradient(135deg, hsl(42 72% 55%), hsl(30 62% 44%))', boxShadow: loading ? 'none' : '0 8px 28px rgba(212,166,79,.35)' }}
            >
              {loading ? <><Loader2 className="size-4 animate-spin" />Signing in…</> : <>Sign In<ArrowRight className="size-4" /></>}
            </button>
          </form>

          {DEMO_MODE && (
            <div className="mt-8">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/40">Demo mode · one-tap sign in</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DEMO_ACCOUNTS.map(account => (
                  <button
                    key={account.username}
                    type="button"
                    disabled={loading}
                    data-testid={`demo-login-${account.label.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => { setUsername(account.username); setPassword('NewSurya'); void performLogin(account.username, 'NewSurya'); }}
                    className="rounded-2xl border border-white/12 bg-white/[.05] px-3 py-2.5 text-xs font-bold text-white/75 transition-colors hover:border-[#d4a64f]/50 hover:bg-[#d4a64f]/10 hover:text-[#f8d996]"
                  >
                    {account.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-white/30">Pure Vegetarian · Restaurant &amp; Bakery · Since 1995</p>
        </div>
      </div>
    </div>
  );
}
