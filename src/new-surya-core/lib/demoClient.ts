// Demo-mode Supabase replacement: a localStorage-backed PostgREST-like client.
// Active only when VITE_SUPABASE_URL is not configured. No network calls.

type Row = Record<string, unknown>;
type Result = { data: unknown; error: null; count: number | null; status: number; statusText: string };

const PREFIX = 'newsurya-demo-db:';

function readTable(table: string): Row[] {
  try {
    const raw = localStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as Row[]) : [];
  } catch {
    return [];
  }
}

function writeTable(table: string, rows: Row[]) {
  try {
    localStorage.setItem(PREFIX + table, JSON.stringify(rows));
  } catch {
    // storage full or unavailable — demo mode tolerates this
  }
}

function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `demo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

class DemoQuery implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private payload: Row | Row[] | null = null;
  private filters: Array<(r: Row) => boolean> = [];
  private orders: Array<{ col: string; asc: boolean }> = [];
  private limitN: number | null = null;
  private offsetN = 0;
  private singleMode: 'none' | 'single' | 'maybe' = 'none';
  private countMode: string | null = null;

  constructor(private table: string) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (opts?.count) this.countMode = opts.count;
    return this;
  }
  insert(payload: Row | Row[]) { this.op = 'insert'; this.payload = payload; return this; }
  upsert(payload: Row | Row[], _opts?: unknown) { this.op = 'upsert'; this.payload = payload; return this; }
  update(payload: Row) { this.op = 'update'; this.payload = payload; return this; }
  delete() { this.op = 'delete'; return this; }

  eq(col: string, val: unknown) { this.filters.push(r => r[col] === val); return this; }
  neq(col: string, val: unknown) { this.filters.push(r => r[col] !== val); return this; }
  gt(col: string, val: never) { this.filters.push(r => (r[col] as never) > val); return this; }
  gte(col: string, val: never) { this.filters.push(r => (r[col] as never) >= val); return this; }
  lt(col: string, val: never) { this.filters.push(r => (r[col] as never) < val); return this; }
  lte(col: string, val: never) { this.filters.push(r => (r[col] as never) <= val); return this; }
  in(col: string, vals: unknown[]) { this.filters.push(r => vals.includes(r[col])); return this; }
  is(col: string, val: unknown) { this.filters.push(r => r[col] === val); return this; }
  like(col: string, pattern: string) { return this.ilike(col, pattern); }
  ilike(col: string, pattern: string) {
    const re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i');
    this.filters.push(r => re.test(String(r[col] ?? '')));
    return this;
  }
  contains() { return this; }
  or() { return this; }
  not() { return this; }
  filter() { return this; }
  match(query: Row) { Object.entries(query).forEach(([k, v]) => this.eq(k, v)); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orders.push({ col, asc: opts?.ascending !== false }); return this; }
  limit(n: number) { this.limitN = n; return this; }
  range(from: number, to: number) { this.offsetN = from; this.limitN = to - from + 1; return this; }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybe'; return this; }
  csv() { return this; }
  abortSignal() { return this; }
  throwOnError() { return this; }

  private exec(): Result {
    let rows = readTable(this.table);
    const matches = (r: Row) => this.filters.every(f => f(r));

    let affected: Row[] = [];
    if (this.op === 'insert' || this.op === 'upsert') {
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]).filter(Boolean) as Row[];
      for (const item of items) {
        const withId = { id: newId(), created_at: new Date().toISOString(), ...item };
        if (this.op === 'upsert' && item.id != null) {
          const idx = rows.findIndex(r => r.id === item.id);
          if (idx >= 0) { rows[idx] = { ...rows[idx], ...item }; affected.push(rows[idx]); continue; }
        }
        rows.push(withId);
        affected.push(withId);
      }
      writeTable(this.table, rows);
    } else if (this.op === 'update') {
      rows = rows.map(r => { if (matches(r)) { const upd = { ...r, ...(this.payload as Row) }; affected.push(upd); return upd; } return r; });
      writeTable(this.table, rows);
    } else if (this.op === 'delete') {
      affected = rows.filter(matches);
      writeTable(this.table, rows.filter(r => !matches(r)));
    } else {
      affected = rows.filter(matches);
      for (const { col, asc } of [...this.orders].reverse()) {
        affected.sort((a, b) => {
          const av = a[col] as never; const bv = b[col] as never;
          if (av === bv) return 0;
          return (av > bv ? 1 : -1) * (asc ? 1 : -1);
        });
      }
      if (this.offsetN || this.limitN != null) affected = affected.slice(this.offsetN, this.limitN != null ? this.offsetN + this.limitN : undefined);
    }

    let data: unknown = affected;
    if (this.singleMode !== 'none') data = affected[0] ?? null;
    return { data, error: null, count: this.countMode ? affected.length : null, status: 200, statusText: 'OK' };
  }

  then<T1 = Result, T2 = never>(onfulfilled?: ((value: Result) => T1 | PromiseLike<T1>) | null, onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null): PromiseLike<T1 | T2> {
    return Promise.resolve(this.exec()).then(onfulfilled, onrejected);
  }
}

function makeChannel() {
  const channel = {
    on: () => channel,
    subscribe: (cb?: (status: string) => void) => { cb?.('SUBSCRIBED'); return channel; },
    unsubscribe: async () => 'ok',
    send: async () => 'ok',
    track: async () => 'ok',
  };
  return channel;
}

export function createDemoClient() {
  return {
    from: (table: string) => new DemoQuery(table),
    rpc: async (_fn: string, _args?: unknown) => ({ data: null, error: null }),
    functions: { invoke: async () => ({ data: null, error: { message: 'Demo mode: edge functions unavailable' } }) },
    channel: () => makeChannel(),
    removeChannel: () => {},
    removeAllChannels: () => {},
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
    },
    storage: { from: () => ({ upload: async () => ({ data: null, error: { message: 'Demo mode' } }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}
