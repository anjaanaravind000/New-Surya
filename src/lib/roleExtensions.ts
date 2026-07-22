export type WorkbenchScope = 'admin' | 'branch' | 'branch-incharge' | 'kitchen' | 'stock-audit';

export const roleExtensionTabs = {
  admin: ['Visualization Studio', 'Expenses', 'Complaints', 'Quotations', 'Purchase Returns', 'Supplier Payments', 'Bank Deposits', 'Current Cash', 'Salesperson Management', 'Cashier Controls', 'Invoice Review'] as const,
  branch: ['Bill History', 'Payment Mode Edit', 'Cashier Closure', 'Alerts', 'Salesperson Report', 'Purchase', 'Purchase Pay', 'Purchase Order', 'Current Cash', 'Bank Deposits', 'Notifications', 'Audit Logs', 'Thresholds'] as const,
  'branch-incharge': ['Sales & Returns', 'Stock Synced', 'Update Stock', 'Suppliers', 'Expenses', 'Complaints', 'Waste Logs', 'Quotations', 'Credit Control', 'Purchase Invoices', 'Purchase Returns', 'Supplier Payments', 'Bank Deposits', 'Current Cash', 'Salesperson Management', 'Cashier Reports', 'Daily Closure', 'Stock Audit', 'History', 'Notifications'] as const,
  kitchen: ['Store Orders', 'Store Inventory', 'Store Suppliers', 'Store Invoices', 'Store Analytics', 'Custom Plan', 'Store Closure', 'Recipe Management', 'Baker Queue', 'Baking History', 'Packing Queue', 'Cake Orders', 'Corrections', 'Transfer In', 'Packing Billing', 'Leftover Items', 'Dispatched History', 'Packing Closure', 'Kitchen Waste Log'] as const,
  'stock-audit': ['Place Order', 'Live Order Status', 'Placed Orders', 'Packing Alerts', 'Purchase Order', 'Purchase Invoice', 'Purchase Return', 'Stock Movements', 'Daily Stock Take', 'Advance Orders', 'Order Closure'] as const
} as const;

export function isExtensionTab(scope: WorkbenchScope, tab: string) {
  return (roleExtensionTabs[scope] as readonly string[]).includes(tab);
}
