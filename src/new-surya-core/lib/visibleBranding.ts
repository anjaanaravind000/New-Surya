const visibleBrandReplacements: Array<[RegExp, string]> = [
  [/\bSECONDARY_OUTLET\s+Foods\s+LLP\b/gi, 'New Surya Foods LLP'],
  [/\bSECONDARY_OUTLET\s+Bakery\b/gi, 'New Surya Bakery'],
  [/\bPRIMARY_OUTLET\s+Bakery\s+Website\b/gi, 'Official Bakery Website'],
  [/\bPRIMARY_OUTLET\s+Bakery\b/gi, 'New Surya Bakery'],
  [/\bSECONDARY_OUTLET\s+Admin\b/gi, 'Outlet Management'],
  [/\bPRIMARY_OUTLET\s+Admin\b/gi, 'Outlet Management'],
  [/\bSECONDARY_OUTLET\s+Branch\b/gi, 'Retail Outlet'],
  [/\bPRIMARY_OUTLET\s+Branch\b/gi, 'Retail Outlet'],
  [/\bPRIMARY_OUTLET\s+Order\b/gi, 'Ordering & Receiving'],
  [/\bWholesale\s+Branch\b/gi, 'Wholesale & Credit Operations'],
  [/\bWholesale\b(?!\s+Outlet\b)/gi, 'Wholesale Outlet'],
  [/\bExecutive\s+Dashboard\b/gi, 'Executive Control'],
  [/\bStore\s+Dashboard\b/gi, 'Materials & Procurement'],
  [/\bBakery\s+Store\s+Control\b/gi, 'Materials & Procurement'],
  [/\bBaker\s+Dashboard\b/gi, 'Production Operations'],
  [/\bBaker\s+Production\s+Board\b/gi, 'Production Operations'],
  [/\bPacking\s+Dashboard\b/gi, 'Packing & Dispatch'],
  [/\bRetail\s+Biller\b/gi, 'Retail Billing'],
  [/\bRetail\s+Daily\s+Closure\b/gi, 'Retail Daily Closure'],
  [/\bSECONDARY_OUTLET\b/gi, 'Retail Outlet'],
  [/\bPRIMARY_OUTLET\b/gi, 'Retail Outlet'],
  [/\bCaf[eé]\b/gi, 'Retail Outlet'],
  [/\bExecutive\b/gi, 'Executive'],
  [/www\.primary_outletbakery\.in/gi, 'Official bakery website'],
];

export function replaceVisibleBranding(value: string) {
  return visibleBrandReplacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );
}

export function sanitizeExportFilename(value: string) {
  return replaceVisibleBranding(value)
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9._-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^[-_]+|[-_]+$/g, '') || 'New_Surya_Export';
}

export function brandExportValue<T>(value: T): T {
  return (typeof value === 'string' ? replaceVisibleBranding(value) : value) as T;
}
