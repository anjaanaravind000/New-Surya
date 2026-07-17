import { Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/UI';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import BranchBillingDashboard from './pages/BranchBillingDashboard';
import BranchInchargeDashboard from './pages/BranchInchargeDashboard';
import StockAuditDashboard from './pages/StockAuditDashboard';

export default function App() {
  return <ErrorBoundary>
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/owner" element={<AdminDashboard />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/kitchen" element={<KitchenDashboard />} />
      <Route path="/branch" element={<BranchBillingDashboard />} />
      <Route path="/branch-billing" element={<BranchBillingDashboard />} />
      <Route path="/branch-incharge" element={<BranchInchargeDashboard />} />
      <Route path="/branch-control" element={<BranchInchargeDashboard />} />
      <Route path="/stock-audit" element={<StockAuditDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </ErrorBoundary>;
}
