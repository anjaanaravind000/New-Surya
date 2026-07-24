import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import OfflineBanner from '@/components/layout/OfflineBanner';
import DataHealthBanner from '@/components/layout/DataHealthBanner';
import NewSuryaBrandingGuard from '@/components/layout/NewSuryaBrandingGuard';
import { getRoleDefaultPath } from '@/lib/routing';
import { useMenuStore } from '@/stores/menuStore';
import Login from '@/pages/Login';
import {
  CoreAdminWorkspace,
  CoreBranchInchargeWorkspace,
  CoreBranchWorkspace,
  CoreKitchenWorkspace,
  CoreStockAuditWorkspace,
} from '@/IntegratedWorkspaces';

function LiveMenuSync() {
  const { loadMenu, subscribe } = useMenuStore();
  useEffect(() => {
    void loadMenu();
    return subscribe();
  }, [loadMenu, subscribe]);
  return null;
}

function AppRoutes() {
  const { currentUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setHydrated(true);
    const fallback = window.setTimeout(() => setHydrated(true), 300);
    return () => {
      unsubscribe();
      window.clearTimeout(fallback);
    };
  }, [hydrated]);

  if (!hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="text-center">
          <div className="mx-auto size-11 animate-pulse rounded-2xl bg-primary/10" />
          <p className="mt-3 text-sm font-semibold text-muted-foreground">Loading New Surya…</p>
        </div>
      </div>
    );
  }

  const defaultRoute = currentUser ? getRoleDefaultPath(currentUser.role) : '/login';

  return (
    <Suspense fallback={<div className="grid min-h-[40vh] place-items-center text-sm font-semibold text-muted-foreground">Loading workspace…</div>}>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'executive']}><CoreAdminWorkspace /></ProtectedRoute>} />
        <Route path="/branch" element={<ProtectedRoute allowedRoles={['order_taker', 'billing', 'branch_primary', 'branch_secondary', 'branch_wholesale', 'admin', 'branch_incharge_primary', 'branch_incharge_secondary', 'executive']}><CoreBranchWorkspace /></ProtectedRoute>} />
        <Route path="/branch-incharge" element={<ProtectedRoute allowedRoles={['branch_incharge_primary', 'branch_incharge_secondary', 'admin', 'executive']}><CoreBranchInchargeWorkspace /></ProtectedRoute>} />
        <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['kitchen', 'store', 'baker', 'sweet_master', 'savouries_master', 'cookies_master', 'puffs_master', 'bakery_master', 'cake_master', 'packing', 'admin', 'executive']}><CoreKitchenWorkspace /></ProtectedRoute>} />
        <Route path="/stock-audit" element={<ProtectedRoute allowedRoles={['stock_audit_primary', 'stock_audit_secondary', 'admin', 'executive']}><CoreStockAuditWorkspace /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <NewSuryaBrandingGuard>
        <OfflineBanner />
        <DataHealthBanner />
        <BrowserRouter>
          <LiveMenuSync />
          <AppRoutes />
        </BrowserRouter>
      </NewSuryaBrandingGuard>
    </ErrorBoundary>
  );
}
