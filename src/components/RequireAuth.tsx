import { Navigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

export default function RequireAuth({ dashboard, children }: { dashboard: string; children: React.ReactNode }) {
  const { status, profile } = useAuth();

  if (status === 'loading') {
    return <div className="grid min-h-screen place-items-center bg-[#0b0d10] text-sm font-semibold text-slate-400">Checking your session…</div>;
  }
  if (status === 'anon' || !profile) return <Navigate to="/login" replace />;
  if (!profile.dashboards.includes(dashboard)) return <Navigate to={profile.homePath} replace />;
  return <>{children}</>;
}
