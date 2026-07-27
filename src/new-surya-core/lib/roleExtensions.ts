export type WorkbenchScope = 'admin' | 'branch' | 'branch-incharge' | 'kitchen' | 'stock-audit';

export const roleExtensionTabs = {
  admin: ['Visualization Studio', 'Expenses', 'Complaints', 'Quotations', 'Purchase Returns', 'Supplier Payments', 'Bank Deposits', 'Current Cash', 'Salesperson Management', 'Cashier Controls', 'Festival & Season Planner', 'Marketing Campaigns', 'Franchise Enquiries', 'Gift Hampers'] as const,
  branch: ['Bill History', 'Payment Mode Edit', 'Cashier Closure', 'Alerts', 'Salesperson Report', 'Purchase', 'Purchase Pay', 'Purchase Order', 'Current Cash', 'Bank Deposits', 'Notifications', 'Audit Logs', 'Thresholds', 'Cake Bookings', 'Party & Bulk Orders', 'Customer Feedback', 'Home Delivery'] as const,
  'branch-incharge': ['Sales & Returns', 'Stock Synced', 'Update Stock', 'Suppliers', 'Expenses', 'Complaints', 'Waste Logs', 'Quotations', 'Credit Control', 'Purchase Invoices', 'Purchase Returns', 'Supplier Payments', 'Bank Deposits', 'Current Cash', 'Salesperson Management', 'Cashier Reports', 'Daily Closure', 'Stock Audit', 'History', 'Notifications', 'Shift Roster', 'Local Promotions'] as const,
  kitchen: ['Material Orders', 'Material Inventory', 'Suppliers', 'Purchase Invoices', 'Materials Analytics', 'Custom Plan', 'Materials Closure', 'Recipe Management', 'Production Queue', 'Production History', 'Packing Queue', 'Cake Orders', 'Corrections', 'Transfer In', 'Packing Billing', 'Leftover Items', 'Dispatched History', 'Packing Closure', 'Kitchen Waste Log', 'New Product Trials', 'Equipment Maintenance'] as const,
  'stock-audit': ['Place Order', 'Live Order Status', 'Placed Orders', 'Packing Alerts', 'Purchase Order', 'Purchase Invoice', 'Purchase Return', 'Stock Movements', 'Daily Stock Take', 'Advance Orders', 'Order Closure', 'Expiry Watchlist', 'Vendor Rate Contracts'] as const
} as const;

export function isExtensionTab(scope: WorkbenchScope, tab: string) {
  return (roleExtensionTabs[scope] as readonly string[]).includes(tab);
}
