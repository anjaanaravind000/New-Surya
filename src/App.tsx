import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/UI';
import RequireAuth from './components/RequireAuth';
import { AuthProvider, useAuth } from './state/AuthContext';
import Login from './pages/Login';
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const KitchenDashboard = lazy(() => import('./pages/KitchenDashboard'));
const BranchBillingDashboard = lazy(() => import('./pages/BranchBillingDashboard'));
const BranchInchargeDashboard = lazy(() => import('./pages/BranchInchargeDashboard'));
const StockAuditDashboard = lazy(() => import('./pages/StockAuditDashboard'));

function WorkspaceLoading() {
  return <div className="grid min-h-screen place-items-center bg-stone-50"><div className="flex items-center gap-3 text-sm font-semibold text-stone-600"><span className="size-2 animate-pulse rounded-full bg-amber-700" />Preparing your workspace...</div></div>;
}

function RootRedirect() {
  const { status, profile } = useAuth();
  if (status === 'loading') {
    return <WorkspaceLoading />;
  }
  return <Navigate to={profile ? profile.homePath : '/login'} replace />;
}

export default function App() {
  return <ErrorBoundary>
    <AuthProvider>
      <Suspense fallback={<WorkspaceLoading />}>
        <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<RequireAuth dashboard="admin"><AdminDashboard /></RequireAuth>} />
        <Route path="/owner" element={<RequireAuth dashboard="admin"><AdminDashboard /></RequireAuth>} />
        <Route path="/dashboard" element={<RequireAuth dashboard="admin"><AdminDashboard /></RequireAuth>} />

        <Route path="/kitchen" element={<RequireAuth dashboard="kitchen"><KitchenDashboard /></RequireAuth>} />

        <Route path="/branch" element={<RequireAuth dashboard="branch"><BranchBillingDashboard /></RequireAuth>} />
        <Route path="/branch-billing" element={<RequireAuth dashboard="branch"><BranchBillingDashboard /></RequireAuth>} />

        <Route path="/branch-incharge" element={<RequireAuth dashboard="branch-incharge"><BranchInchargeDashboard /></RequireAuth>} />
        <Route path="/branch-control" element={<RequireAuth dashboard="branch-incharge"><BranchInchargeDashboard /></RequireAuth>} />

        <Route path="/stock-audit" element={<RequireAuth dashboard="stock-audit"><StockAuditDashboard /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  </ErrorBoundary>;
}
