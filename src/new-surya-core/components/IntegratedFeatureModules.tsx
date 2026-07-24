import { lazy, Suspense, useEffect, useState } from 'react';
import type { ProductionDestination } from '@/bakery/productionRouting';
import { useAuthStore } from '@/stores/authStore';
import { useSearchParams } from 'react-router-dom';

const BusinessManagementModule = lazy(() => import('@/modules/admin/BusinessManagementModule'));
const ExecutiveControlModule = lazy(() => import('@/modules/admin/ExecutiveControlModule'));
const MenuManagement = lazy(() => import('@/modules/admin/MenuManagementModule'));
const SalesReport = lazy(() => import('@/modules/admin/SalesReportsModule'));
const StaffManagement = lazy(() => import('@/modules/admin/StaffManagementModule'));
const AttendanceSalary = lazy(() => import('@/modules/shared/WorkforcePayrollModule'));
const OrderHistory = lazy(() => import('@/modules/shared/OrderHistoryModule'));
const AdminInvoicesPage = lazy(() => import('@/modules/admin/InvoiceReviewModule'));
const AdminAlertsPage = lazy(() => import('@/modules/shared/AlertsModule'));
const DigitalMenuManagementModule = lazy(() => import('@/modules/admin/DigitalMenuManagementModule'));
const BakeryItemManagement = lazy(() => import('@/bakery/BakeryItemManagement'));
const RecipeManagement = lazy(() => import('@/bakery/RecipeManagement'));

const OrderPad = lazy(() => import('@/modules/branch/OrderTakingModule'));
const RetailBillingModule = lazy(() => import('@/modules/branch/RetailBillingModule'));
const DailyClosure = lazy(() => import('@/modules/branch/DailyClosureModule'));
const PrimaryRetailOperations = lazy(() => import('@/modules/branch/PrimaryRetailOperationsModule'));
const SecondaryRetailOperations = lazy(() => import('@/modules/branch/SecondaryRetailOperationsModule'));
const WholesaleCreditOperations = lazy(() => import('@/modules/branch/WholesaleCreditOperationsModule'));

const PrimaryOutletManagement = lazy(() => import('@/modules/incharge/PrimaryOutletManagementModule'));
const SecondaryOutletManagement = lazy(() => import('@/modules/incharge/SecondaryOutletManagementModule'));

const KitchenOperationsModule = lazy(() => import('@/modules/kitchen/KitchenOperationsModule'));
const KitchenWasteLogTab = lazy(() => import('@/components/KitchenWasteLogTab'));
const MaterialsProcurementModule = lazy(() => import('@/bakery/MaterialsProcurementModule'));
const ProductionOperationsModule = lazy(() => import('@/bakery/ProductionOperationsModule'));
const CakeProductionModule = lazy(() => import('@/bakery/CakeProductionModule'));
const PackingDispatchModule = lazy(() => import('@/bakery/PackingDispatchModule'));
const OrderingReceivingModule = lazy(() => import('@/bakery/OrderingReceivingModule'));

function LoadingModule() {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-xl border border-stone-200 bg-white/80 p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <div>
        <div className="mx-auto size-12 animate-pulse rounded-2xl bg-amber-100 dark:bg-amber-500/20" />
        <p className="mt-3 text-sm font-bold text-stone-700 dark:text-stone-200">Loading complete workflow…</p>
      </div>
    </div>
  );
}

function Surface({ children, internalTab }: { children: React.ReactNode; internalTab?: string }) {
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!internalTab || searchParams.get('tab') === internalTab) return;
    const next = new URLSearchParams(searchParams);
    next.set('tab', internalTab);
    setSearchParams(next, { replace: true });
  }, [internalTab, searchParams, setSearchParams]);
  return <Suspense fallback={<LoadingModule />}><div className="integrated-feature-surface min-w-0">{children}</div></Suspense>;
}

export type AdminIntegratedModule =
  | 'Business Management'
  | 'Executive Control'
  | 'Menu Management'
  | 'Sales Reports'
  | 'Staff Management'
  | 'Attendance & Payroll'
  | 'Order History'
  | 'Invoice Review'
  | 'Alerts & Notifications'
  | 'Digital Menu Management'
  | 'Product Master'
  | 'Recipe Management';

export function AdminIntegratedFeature({ module, internalTab }: { module: AdminIntegratedModule; internalTab?: string }) {
  return <Surface internalTab={internalTab}>{
    module === 'Business Management' ? <BusinessManagementModule />
      : module === 'Executive Control' ? <ExecutiveControlModule />
      : module === 'Menu Management' ? <MenuManagement />
      : module === 'Sales Reports' ? <SalesReport />
      : module === 'Staff Management' ? <StaffManagement />
      : module === 'Attendance & Payroll' ? <AttendanceSalary />
      : module === 'Order History' ? <OrderHistory />
      : module === 'Invoice Review' ? <AdminInvoicesPage />
      : module === 'Alerts & Notifications' ? <AdminAlertsPage />
      : module === 'Digital Menu Management' ? <DigitalMenuManagementModule />
      : module === 'Product Master' ? <BakeryItemManagement />
      : <RecipeManagement />
  }</Surface>;
}

export type BranchIntegratedModule =
  | 'Order Taking'
  | 'Complete Retail Billing'
  | 'Complete Bill History'
  | 'Cashier Daily Closure'
  | 'Primary Outlet Operations'
  | 'Secondary Outlet Operations'
  | 'Wholesale & Credit Operations';

export function BranchIntegratedFeature({ module, internalTab }: { module: BranchIntegratedModule; internalTab?: string }) {
  return <Surface internalTab={internalTab}>{
    module === 'Order Taking' ? <OrderPad />
      : module === 'Complete Retail Billing' ? <RetailBillingModule />
      : module === 'Complete Bill History' ? <OrderHistory />
      : module === 'Cashier Daily Closure' ? <DailyClosure />
      : module === 'Primary Outlet Operations' ? <PrimaryRetailOperations />
      : module === 'Secondary Outlet Operations' ? <SecondaryRetailOperations />
      : <WholesaleCreditOperations />
  }</Surface>;
}

export type InchargeIntegratedModule =
  | 'Primary Outlet Management'
  | 'Secondary Outlet Management'
  | 'Workforce & Payroll'
  | 'Management Alerts';

export function InchargeIntegratedFeature({ module, internalTab }: { module: InchargeIntegratedModule; internalTab?: string }) {
  return <Surface internalTab={internalTab}>{
    module === 'Primary Outlet Management' ? <PrimaryOutletManagement />
      : module === 'Secondary Outlet Management' ? <SecondaryOutletManagement />
      : module === 'Workforce & Payroll' ? <AttendanceSalary />
      : <AdminAlertsPage />
  }</Surface>;
}

export type KitchenIntegratedModule =
  | 'Live Kitchen Operations'
  | 'Materials & Procurement'
  | 'Baker Production'
  | 'Production Workstations'
  | 'Cake Production'
  | 'Packing & Dispatch'
  | 'Kitchen Product Master'
  | 'Kitchen Recipe Management'
  | 'Kitchen Waste Log';

const productionDesks: Array<{ id: ProductionDestination; label: string }> = [
  { id: 'sweet_master', label: 'Sweets' },
  { id: 'savouries_master', label: 'Savouries' },
  { id: 'cookies_master', label: 'Cookies' },
  { id: 'puffs_master', label: 'Puffs' },
  { id: 'bakery_master', label: 'Bakery' },
];

function AllProductionWorkstations() {
  const currentRole = useAuthStore(state => state.currentUser?.role);
  const [desk, setDesk] = useState<ProductionDestination>(() => productionDesks.some(item => item.id === currentRole) ? currentRole as ProductionDestination : 'sweet_master');
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
        {productionDesks.map(item => (
          <button key={item.id} type="button" onClick={() => setDesk(item.id)} className={`min-h-11 rounded-lg px-4 text-sm font-bold transition ${desk === item.id ? 'bg-amber-700 text-white shadow-sm' : 'border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 dark:border-white/10 dark:bg-white/5 dark:text-stone-200'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <ProductionOperationsModule destination={desk} title={`${productionDesks.find(item => item.id === desk)?.label ?? 'Production'} Workstation`} />
    </div>
  );
}

export function KitchenIntegratedFeature({ module, internalTab }: { module: KitchenIntegratedModule; internalTab?: string }) {
  return <Surface internalTab={internalTab}>{
    module === 'Live Kitchen Operations' ? <KitchenOperationsModule />
      : module === 'Materials & Procurement' ? <MaterialsProcurementModule />
      : module === 'Baker Production' ? <ProductionOperationsModule destination="baker" title="Baker Production" />
      : module === 'Production Workstations' ? <AllProductionWorkstations />
      : module === 'Cake Production' ? <CakeProductionModule />
      : module === 'Packing & Dispatch' ? <PackingDispatchModule />
      : module === 'Kitchen Product Master' ? <BakeryItemManagement />
      : module === 'Kitchen Recipe Management' ? <RecipeManagement />
      : <KitchenWasteLogTab />
  }</Surface>;
}

export type StockAuditIntegratedModule = 'Primary Ordering & Receiving' | 'Secondary Ordering & Receiving';

export function StockAuditIntegratedFeature({ module, internalTab }: { module: StockAuditIntegratedModule; internalTab?: string }) {
  return <Surface internalTab={internalTab}><OrderingReceivingModule branchOverride={module === 'Secondary Ordering & Receiving' ? 'SECONDARY_OUTLET' : 'PRIMARY_OUTLET'} /></Surface>;
}
