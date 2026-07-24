import type { ComponentType } from 'react';
import { AuthProvider } from './state/AuthContext';
import { BakeryStoreProvider } from './state/BakeryStore';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import BranchDashboard from './pages/BranchDashboard';
import BranchInchargeDashboard from './pages/BranchInchargeDashboard';
import StockAuditDashboard from './pages/StockAuditDashboard';

function withCoreProviders(Page: ComponentType) {
  return function IntegratedWorkspace() {
    return (
      <AuthProvider>
        <BakeryStoreProvider>
          <div className="new-surya-core-root">
            <Page />
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
