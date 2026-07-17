import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const forbidden = [/SNB/i, /VRSNB/i, /Hosur/i, /CafeAadvikam/i, /Aadvikam/i, /OutletNorth/i, /OutletSouth/i];
const roots = ['src', 'docs', 'supabase', 'README.md', 'index.html'];
const files = [];
function walk(p) {
  const st = statSync(p);
  if (st.isDirectory()) for (const f of readdirSync(p)) walk(join(p, f));
  else files.push(p);
}
for (const r of roots) walk(r);
const hits = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const rx of forbidden) if (rx.test(text)) hits.push(`${file}: ${rx}`);
}
if (hits.length) {
  console.error('Forbidden old-client terms found:\n' + hits.join('\n'));
  process.exit(1);
}
console.log(`Audit passed: ${files.length} files scanned, no old-client names found.`);
