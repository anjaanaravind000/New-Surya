// Single source of truth for role → default path mapping.
// The application is intentionally consolidated into the five original New
// Surya workspaces. Previously separate routes redirect into the appropriate New Surya tab.

import type { UserRole } from '@/types';

export function getRoleDefaultPath(role: UserRole): string {
  switch (role) {
    case 'admin':          return '/admin';
    case 'executive':          return '/admin?suite=executive-control';

    case 'kitchen':        return '/kitchen';
    case 'store':          return '/kitchen?suite=materials-procurement';
    case 'baker':          return '/kitchen?suite=production-operations';
    case 'packing':        return '/kitchen?suite=packing-dispatch';
    case 'sweet_master':
    case 'savouries_master':
    case 'cookies_master':
    case 'puffs_master':
    case 'bakery_master':
    case 'cake_master':    return '/kitchen';

    case 'stock_audit_primary':   return '/stock-audit?suite=ordering-receiving';
    case 'stock_audit_secondary': return '/stock-audit?suite=secondary-ordering-receiving';

    case 'branch_primary':     return '/branch?suite=branch-operations';
    case 'branch_secondary':     return '/branch?suite=secondary-branch-operations';
    case 'branch_wholesale':   return '/branch?suite=wholesale-credit-operations';

    case 'branch_incharge_primary':      return '/branch-incharge?suite=branch-management';
    case 'branch_incharge_secondary':    return '/branch-incharge?suite=secondary-branch-management';

    // Order taking and cashier roles open the Branch dashboard billing workspace.
    case 'order_taker':    return '/branch?suite=retail-billing-counter';
    case 'billing':         return '/branch?suite=retail-billing-counter';
    default:               return '/branch';
  }
}
