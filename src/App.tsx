import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/UI';
import RequireAuth from './components/RequireAuth';
import { AuthProvider, useAuth } from './state/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import BranchBillingDashboard from './pages/BranchBillingDashboard';
import BranchInchargeDashboard from './pages/BranchInchargeDashboard';
import StockAuditDashboard from './pages/StockAuditDashboard';

function RootRedirect() {
  const { status, profile } = useAuth();
  if (status === 'loading') {
    return <div className="grid min-h-screen place-items-center bg-[#0b0d10] text-sm font-semibold text-slate-400">Loading…</div>;
  }
  return <Navigate to={profile ? profile.homePath : '/login'} replace />;
}

export default function App() {
  return <ErrorBoundary>
    <AuthProvider>
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
    </AuthProvider>
  </ErrorBoundary>;
}
