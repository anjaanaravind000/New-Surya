import type { ComponentType } from 'react';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './state/AuthContext';
import { BakeryStoreProvider } from './state/BakeryStore';
import KitchenDashboard from './pages/KitchenDashboard';
import BranchDashboard from './pages/BranchDashboard';
import BranchInchargeDashboard from './pages/BranchInchargeDashboard';
import StockAuditDashboard from './pages/StockAuditDashboard';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function withCoreProviders(Page: ComponentType) {
  return function IntegratedWorkspace() {
    return (
      <AuthProvider>
        <BakeryStoreProvider>
          <div className="new-surya-core-root">
            <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm font-semibold text-stone-500">Loading workspace…</div>}>
              <Page />
            </Suspense>
          </div>
        </BakeryStoreProvider>
      </AuthProvider>
    );
  };
}

export const CoreAdminWorkspace = withCoreProviders(AdminDashboard);
export const CoreKitchenWorkspace = withCoreProviders(KitchenDashboard);
export const CoreBranchWorkspace = withCoreProviders(BranchDashboard);
export const CoreBranchInchargeWorkspace = withCoreProviders(BranchInchargeDashboard);
export const CoreStockAuditWorkspace = withCoreProviders(StockAuditDashboard);
