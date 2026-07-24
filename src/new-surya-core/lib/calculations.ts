import { brandExportValue, replaceVisibleBranding, sanitizeExportFilename } from '@/lib/visibleBranding';
import type { Bill, CartLine, FinishedStock, Ingredient, Product, Recipe } from './types';

export function byId<T extends { id: string }>(rows: T[]): Record<string, T> {
  return Object.fromEntries(rows.map(row => [row.id, row]));
}

export function money(value: number): string {
  return `\u20B9${Math.round(value).toLocaleString('en-IN')}`;
}

export function billTotals(lines: CartLine[], products: Product[]) {
  const productMap = byId(products);
  let subTotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;
  for (const line of lines) {
    const product = productMap[line.productId];
    const gross = line.qty * line.price;
    const discount = gross * (line.discountPct / 100);
    const taxable = gross - discount;
    const tax = taxable * ((product?.taxRate ?? 0) / 100);
    subTotal += gross;
    discountTotal += discount;
    taxTotal += tax;
  }
  const beforeRound = subTotal - discountTotal + taxTotal;
  const grandTotal = Math.round(beforeRound);
  const roundOff = Number((grandTotal - beforeRound).toFixed(2));
  return { subTotal: round2(subTotal), discountTotal: round2(discountTotal), taxTotal: round2(taxTotal), roundOff, grandTotal };
}

export function round2(value: number) { return Math.round(value * 100) / 100; }

export function recipeRequirement(recipe: Recipe, outputQty: number) {
  const factor = outputQty / recipe.outputQty;
  return recipe.lines.map(line => ({ ...line, requiredQty: round2(line.qty * factor * (1 + line.wastagePct / 100)) }));
}

export function recipeCost(recipe: Recipe, ingredients: Ingredient[], outputQty: number) {
  const ingredientMap = byId(ingredients);
  const req = recipeRequirement(recipe, outputQty);
  const ingredientCost = req.reduce((sum, line) => sum + line.requiredQty * (ingredientMap[line.ingredientId]?.unitCost ?? 0), 0);
  const factor = outputQty / recipe.outputQty;
  const fixedCost = (recipe.laborCost + recipe.overheadCost + recipe.packagingCost) * factor;
  return { ingredientCost: round2(ingredientCost), fixedCost: round2(fixedCost), totalCost: round2(ingredientCost + fixedCost), perUnit: round2((ingredientCost + fixedCost) / Math.max(1, outputQty)) };
}

export function productionShortages(recipe: Recipe | undefined, ingredients: Ingredient[], qty: number) {
  if (!recipe) return ['Recipe not configured'];
  const ingredientMap = byId(ingredients);
  return recipeRequirement(recipe, qty)
    .filter(line => (ingredientMap[line.ingredientId]?.currentStock ?? 0) < line.requiredQty)
    .map(line => `${ingredientMap[line.ingredientId]?.name ?? line.ingredientId}: need ${line.requiredQty}, available ${ingredientMap[line.ingredientId]?.currentStock ?? 0}`);
}

export function canFulfillCart(lines: CartLine[], stocks: FinishedStock[], branchId: string) {
  const issues: string[] = [];
  for (const line of lines) {
    const available = stocks.filter(s => s.branchId === branchId && s.productId === line.productId).reduce((sum, s) => sum + s.qty, 0);
    if (available + 1e-9 < line.qty) issues.push(`${line.productId}: need ${line.qty}, available ${available}`);
  }
  return { ok: issues.length === 0, issues };
}

export function allocateFinishedStock(stocks: FinishedStock[], branchId: string, productId: string, qty: number) {
  let remaining = qty;
  const sorted = [...stocks].sort((a, b) => new Date(a.expiryAt).getTime() - new Date(b.expiryAt).getTime());
  const changed = sorted.map(stock => {
    if (remaining <= 0 || stock.branchId !== branchId || stock.productId !== productId || stock.qty <= 0) return stock;
    const use = Math.min(stock.qty, remaining);
    remaining = round2(remaining - use);
    return { ...stock, qty: round2(stock.qty - use) };
  });
  return changed.filter(stock => stock.qty > 0);
}

export function csvFromRows(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const safe = (v: unknown) => `"${String(brandExportValue(v) ?? '').replaceAll('"', '""')}"`;
  return [headers.map(replaceVisibleBranding).join(','), ...rows.map(row => headers.map(h => safe(row[h])).join(','))].join('\n');
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  const csv = csvFromRows(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = sanitizeExportFilename(filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function nowIso() { return new Date().toISOString(); }
export function today() { return new Date().toISOString().slice(0, 10); }
export function addHours(hours: number) { return new Date(Date.now() + hours * 3600_000).toISOString(); }
