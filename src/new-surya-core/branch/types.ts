// src/branch/types.ts  ← NEW FILE
export type Branch = 'Retail' | 'SECONDARY_OUTLET' | 'PRIMARY_OUTLET' | 'Wholesale';
export const BRANCHES: Branch[] = ['Retail', 'SECONDARY_OUTLET', 'PRIMARY_OUTLET', 'Wholesale'];

export const BRANCH_LABELS: Record<Branch, string> = {
  Retail:  'New Surya',
  SECONDARY_OUTLET: 'New Surya Secondary Branch',
  PRIMARY_OUTLET:   'New Surya Branch',
  Wholesale: 'Wholesale',
};

export const BRANCH_COLORS: Record<Branch, {
  text: string; bg: string; badge: string; bar: string;
}> = {
  Retail: {
    text:  'text-green-700',
    bg:    'bg-green-50',
    badge: 'bg-green-100 text-green-700',
    bar:   'bg-green-500',
  },
  SECONDARY_OUTLET: {
    text:  'text-blue-700',
    bg:    'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    bar:   'bg-blue-500',
  },
  PRIMARY_OUTLET: {
    text:  'text-amber-700',
    bg:    'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    bar:   'bg-amber-500',
  },
  Wholesale: {
    text:  'text-emerald-700',
    bg:    'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    bar:   'bg-emerald-500',
  },
};
