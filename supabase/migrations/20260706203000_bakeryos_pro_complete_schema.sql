-- BakeryOS Pro complete Supabase schema
-- Run in Supabase SQL editor or through Supabase CLI.
-- Third-party integrations still require official credentials and provider approval.

create extension if not exists pgcrypto;

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  type text not null check (type in ('central-kitchen','retail','cloud-kitchen','warehouse','admin')),
  address text not null,
  phone text,
  gstin text,
  opening_hours text,
  channels text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  dashboards text[] default '{}',
  branch_ids text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references roles(id) on delete cascade,
  module_key text not null,
  actions text[] not null default '{}',
  unique(role_id, module_key)
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  name text not null,
  phone text,
  email text,
  role_id uuid references roles(id),
  branch_ids text[] default '{}',
  active boolean default true,
  pin_required boolean default true,
  last_login timestamptz,
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  category text,
  payment_terms_days int default 0,
  gstin text,
  rating numeric default 0,
  created_at timestamptz default now()
);

create table if not exists ingredients (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text,
  unit text not null,
  current_stock numeric default 0,
  min_stock numeric default 0,
  max_stock numeric default 0,
  reorder_qty numeric default 0,
  unit_cost numeric default 0,
  batch_no text,
  mfg_date date,
  expiry_date date,
  allergen text,
  supplier_id uuid references suppliers(id),
  storage text default 'ambient',
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text,
  unit text not null,
  price numeric not null default 0,
  tax_rate numeric default 0,
  hsn text,
  barcode text unique,
  active boolean default true,
  sell_by_weight boolean default false,
  kot_station text default 'no-kot',
  shelf_life_hours int default 48,
  allow_online boolean default true,
  contains_allergen text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists branch_prices (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  product_id uuid references products(id),
  dine_in_price numeric default 0,
  takeaway_price numeric default 0,
  delivery_price numeric default 0,
  swiggy_price numeric default 0,
  zomato_price numeric default 0,
  wholesale_price numeric default 0,
  unique(branch_id, product_id)
);

create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  output_qty numeric not null,
  output_unit text not null,
  version int default 1,
  labor_cost numeric default 0,
  overhead_cost numeric default 0,
  packaging_cost numeric default 0,
  instructions text[] default '{}',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists recipe_lines (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references recipes(id) on delete cascade,
  ingredient_id uuid references ingredients(id),
  qty numeric not null,
  wastage_pct numeric default 0,
  stage text default 'mixing'
);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_no text unique not null,
  supplier_id uuid references suppliers(id),
  expected_date date,
  status text default 'draft',
  created_by uuid references app_users(id),
  created_at timestamptz default now()
);

create table if not exists purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references purchase_orders(id) on delete cascade,
  ingredient_id uuid references ingredients(id),
  qty numeric not null,
  rate numeric not null,
  received_qty numeric default 0
);

create table if not exists goods_receipts (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references purchase_orders(id),
  supplier_invoice_no text,
  received_at timestamptz default now(),
  received_by uuid references app_users(id)
);

create table if not exists goods_receipt_lines (
  id uuid primary key default gen_random_uuid(),
  goods_receipt_id uuid references goods_receipts(id) on delete cascade,
  ingredient_id uuid references ingredients(id),
  qty numeric not null,
  rate numeric not null,
  batch_no text,
  expiry_date date
);

create table if not exists production_plans (
  id uuid primary key default gen_random_uuid(),
  plan_no text unique not null,
  product_id uuid references products(id),
  requested_qty numeric not null,
  planned_date date not null,
  branch_demand jsonb default '{}',
  status text not null default 'pending-admin-approval',
  requested_by uuid references app_users(id),
  approved_by uuid references app_users(id),
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  actual_yield numeric,
  wastage_qty numeric,
  qc_notes text,
  quality_status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists finished_stock_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  branch_id uuid references branches(id),
  qty numeric not null,
  batch_no text not null,
  produced_at timestamptz,
  expiry_at timestamptz,
  cost_per_unit numeric default 0,
  source_production_id uuid references production_plans(id),
  created_at timestamptz default now()
);

create table if not exists inventory_ledger (
  id uuid primary key default gen_random_uuid(),
  at timestamptz default now(),
  branch_id uuid references branches(id),
  item_type text not null check (item_type in ('ingredient','finished-good')),
  item_id uuid not null,
  qty_change numeric not null,
  unit text,
  reason text,
  source_type text,
  source_id uuid,
  user_id uuid references app_users(id)
);

create table if not exists stock_audits (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  item_type text not null,
  item_id uuid not null,
  system_qty numeric not null,
  physical_qty numeric not null,
  variance_reason text,
  status text default 'pending-approval',
  created_at timestamptz default now(),
  approved_by uuid references app_users(id)
);

create table if not exists dispatches (
  id uuid primary key default gen_random_uuid(),
  dispatch_no text unique not null,
  from_branch_id uuid references branches(id),
  to_branch_id uuid references branches(id),
  status text default 'draft',
  crate_ids text[] default '{}',
  route text,
  driver text,
  vehicle_no text,
  created_at timestamptz default now(),
  received_at timestamptz,
  notes text
);

create table if not exists dispatch_lines (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid references dispatches(id) on delete cascade,
  product_id uuid references products(id),
  qty numeric not null,
  batch_no text
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  type text default 'retail',
  credit_limit numeric default 0,
  loyalty_points int default 0,
  favorite_products text[] default '{}',
  birthday date,
  anniversary date,
  created_at timestamptz default now()
);

create table if not exists counter_sessions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  terminal text not null,
  cashier_id uuid references app_users(id),
  opening_cash numeric default 0,
  opened_at timestamptz default now(),
  closing_cash numeric,
  closed_at timestamptz,
  status text default 'open'
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  counter_session_id uuid references counter_sessions(id),
  bill_no text unique not null,
  customer_id uuid references customers(id),
  customer_name text,
  customer_phone text,
  order_channel text default 'walk-in',
  sub_total numeric default 0,
  tax_total numeric default 0,
  discount_total numeric default 0,
  round_off numeric default 0,
  grand_total numeric default 0,
  payment_mode text default 'cash',
  paid_amount numeric default 0,
  credit_due_date date,
  status text default 'paid',
  print_count int default 1,
  created_at timestamptz default now()
);

create table if not exists bill_lines (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id) on delete cascade,
  product_id uuid references products(id),
  qty numeric not null,
  price numeric not null,
  discount_pct numeric default 0,
  notes text
);

create table if not exists refunds (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references bills(id),
  amount numeric not null,
  reason text,
  restock boolean default false,
  approved_by uuid references app_users(id),
  created_at timestamptz default now()
);

create table if not exists online_orders (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  branch_id uuid references branches(id),
  external_ref text,
  customer_name text,
  customer_phone text,
  items jsonb default '[]',
  amount numeric default 0,
  status text default 'new',
  commission_pct numeric default 0,
  payout_expected numeric default 0,
  payout_received numeric,
  received_at timestamptz default now()
);

create table if not exists advance_orders (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  customer_id uuid references customers(id),
  product_id uuid references products(id),
  qty numeric not null,
  delivery_at timestamptz,
  design_notes text,
  image_required boolean default false,
  advance_paid numeric default 0,
  balance numeric default 0,
  status text default 'booked',
  created_at timestamptz default now()
);

create table if not exists credit_entries (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  bill_id uuid references bills(id),
  debit numeric default 0,
  credit numeric default 0,
  due_date date,
  note text,
  at timestamptz default now()
);

create table if not exists attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id),
  date date not null,
  shift text,
  check_in text,
  check_out text,
  status text default 'present',
  advance_taken numeric default 0,
  advance_date date,
  advance_reason text,
  overtime_hours numeric default 0
);

create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text,
  status text default 'missing-credentials',
  health text default 'warning',
  last_sync timestamptz,
  notes text,
  encrypted_config jsonb default '{}'
);

create table if not exists print_jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  target text not null,
  payload text,
  status text default 'queued',
  created_at timestamptz default now(),
  printed_at timestamptz,
  error text
);

create table if not exists debug_events (
  id uuid primary key default gen_random_uuid(),
  at timestamptz default now(),
  level text not null,
  module text not null,
  message text not null,
  detail text
);

create table if not exists sync_queue (
  id uuid primary key default gen_random_uuid(),
  at timestamptz default now(),
  table_name text not null,
  action text not null,
  payload jsonb,
  status text default 'queued',
  error text
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  at timestamptz default now(),
  user_id uuid references app_users(id),
  module text,
  action text,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address text
);

alter table branches enable row level security;
alter table roles enable row level security;
alter table role_permissions enable row level security;
alter table app_users enable row level security;
alter table suppliers enable row level security;
alter table ingredients enable row level security;
alter table products enable row level security;
alter table branch_prices enable row level security;
alter table recipes enable row level security;
alter table recipe_lines enable row level security;
alter table purchase_orders enable row level security;
alter table production_plans enable row level security;
alter table finished_stock_batches enable row level security;
alter table inventory_ledger enable row level security;
alter table stock_audits enable row level security;
alter table dispatches enable row level security;
alter table customers enable row level security;
alter table counter_sessions enable row level security;
alter table bills enable row level security;
alter table online_orders enable row level security;
alter table attendance_records enable row level security;
alter table print_jobs enable row level security;
alter table debug_events enable row level security;

-- During real go-live, replace permissive authenticated policies with branch/role-specific policies.
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'authenticated read/write branches') then
    create policy "authenticated read/write branches" on branches for all to authenticated using (true) with check (true);
  end if;
end $$;

create or replace function log_debug_event(p_level text, p_module text, p_message text, p_detail text default null)
returns uuid language plpgsql security definer as $$
declare v_id uuid;
begin
  insert into debug_events(level,module,message,detail) values(p_level,p_module,p_message,p_detail) returning id into v_id;
  return v_id;
end; $$;
