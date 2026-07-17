-- BakeryOS Pro production schema foundation
-- Covers GOFRUGAL/Petpooja-level bakery ERP/POS modules: roles, permissions, item master,
-- recipe/BOM, production approval, stock ledger, dispatch, branch billing, online orders,
-- payments, credit, attendance, audit, integrations and debug events.

create extension if not exists pgcrypto;

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  branch_type text not null check (branch_type in ('admin','central_kitchen','retail','cloud','wholesale')),
  address text,
  phone text,
  channels text[] default '{}',
  gstin text,
  opening_hours text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  dashboards text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  phone text,
  email text,
  role_id uuid references public.roles(id),
  branch_ids uuid[] default '{}',
  active boolean default true,
  last_login timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references public.roles(id) on delete cascade,
  module_id text not null,
  actions text[] not null default '{view}',
  unique(role_id, module_id)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text unique,
  barcode text unique,
  name text not null,
  category text not null,
  unit text not null,
  price numeric(12,2) not null default 0,
  tax_rate numeric(5,2) default 5,
  hsn text,
  shelf_life_hours integer default 48,
  kot_station text,
  allow_online boolean default true,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.branch_price_lists (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  product_id uuid references public.products(id),
  sale_price numeric(12,2) not null,
  effective_from date default current_date,
  active boolean default true,
  unique(branch_id, product_id, effective_from)
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  category text,
  unit text not null,
  min_stock numeric(14,3) default 0,
  reorder_qty numeric(14,3) default 0,
  unit_cost numeric(12,2) default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.ingredient_batches (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid references public.ingredients(id),
  branch_id uuid references public.branches(id),
  batch_no text,
  qty numeric(14,3) not null default 0,
  unit_cost numeric(12,2) default 0,
  received_at timestamptz default now(),
  expiry_at timestamptz,
  supplier text,
  status text default 'available' check(status in ('available','hold','expired','consumed'))
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) unique,
  yield_qty numeric(14,3) not null,
  yield_unit text not null,
  labor_cost numeric(12,2) default 0,
  energy_cost numeric(12,2) default 0,
  packaging_cost numeric(12,2) default 0,
  active boolean default true,
  version integer default 1,
  approved_by uuid references public.app_users(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.recipe_lines (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid references public.recipes(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id),
  qty numeric(14,3) not null,
  wastage_pct numeric(5,2) default 0
);

create table if not exists public.production_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  requested_qty numeric(14,3) not null,
  planned_date date not null,
  status text not null default 'pending_admin_approval',
  branch_demand jsonb default '{}'::jsonb,
  requested_by uuid references public.app_users(id),
  approved_by uuid references public.app_users(id),
  approved_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  actual_yield numeric(14,3),
  wastage_qty numeric(14,3),
  qc_notes text,
  created_at timestamptz default now()
);

create table if not exists public.inventory_ledger (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  item_type text not null check(item_type in ('ingredient','finished_good')),
  item_id uuid not null,
  qty_change numeric(14,3) not null,
  unit text,
  reason text not null,
  source text not null,
  source_id uuid,
  user_id uuid references public.app_users(id),
  created_at timestamptz default now()
);

create table if not exists public.finished_stock_batches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id),
  branch_id uuid references public.branches(id),
  production_plan_id uuid references public.production_plans(id),
  batch_no text not null,
  qty numeric(14,3) not null default 0,
  produced_at timestamptz default now(),
  expiry_at timestamptz,
  status text default 'available' check(status in ('available','hold','sold','expired','returned','waste'))
);

create table if not exists public.stock_audits (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  item_type text check(item_type in ('ingredient','finished_good')),
  item_id uuid not null,
  system_qty numeric(14,3) not null,
  physical_qty numeric(14,3) not null,
  variance_reason text,
  status text default 'pending_approval',
  created_by uuid references public.app_users(id),
  approved_by uuid references public.app_users(id),
  approved_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_name text not null,
  status text default 'draft',
  expected_date date,
  created_by uuid references public.app_users(id),
  created_at timestamptz default now()
);

create table if not exists public.purchase_order_lines (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid references public.purchase_orders(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id),
  qty numeric(14,3) not null,
  rate numeric(12,2) not null
);

create table if not exists public.dispatches (
  id uuid primary key default gen_random_uuid(),
  from_branch_id uuid references public.branches(id),
  to_branch_id uuid references public.branches(id),
  route text,
  driver text,
  vehicle_no text,
  crate_ids text[] default '{}',
  status text default 'draft',
  created_at timestamptz default now(),
  received_at timestamptz,
  shortage_note text
);

create table if not exists public.dispatch_lines (
  id uuid primary key default gen_random_uuid(),
  dispatch_id uuid references public.dispatches(id) on delete cascade,
  product_id uuid references public.products(id),
  batch_no text,
  qty numeric(14,3) not null
);

create table if not exists public.counter_sessions (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  cashier_id uuid references public.app_users(id),
  terminal text not null,
  opening_cash numeric(12,2) not null,
  closing_cash numeric(12,2),
  status text default 'open',
  opened_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  counter_session_id uuid references public.counter_sessions(id),
  bill_no text unique not null,
  customer_name text,
  customer_phone text,
  subtotal numeric(12,2) default 0,
  discount_total numeric(12,2) default 0,
  tax_total numeric(12,2) default 0,
  grand_total numeric(12,2) default 0,
  payment_mode text not null,
  paid_amount numeric(12,2) default 0,
  credit_due_date date,
  print_type text default 'original',
  status text default 'paid',
  created_at timestamptz default now()
);

create table if not exists public.bill_lines (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid references public.bills(id) on delete cascade,
  product_id uuid references public.products(id),
  qty numeric(14,3) not null,
  rate numeric(12,2) not null,
  discount_pct numeric(5,2) default 0,
  batch_no text,
  notes text
);

create table if not exists public.online_orders (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  external_ref text not null,
  branch_id uuid references public.branches(id),
  customer_name text,
  payload jsonb default '{}'::jsonb,
  amount numeric(12,2) default 0,
  commission_pct numeric(5,2) default 0,
  status text default 'new',
  received_at timestamptz default now(),
  unique(platform, external_ref)
);

create table if not exists public.advance_orders (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  customer_name text not null,
  phone text,
  product_id uuid references public.products(id),
  qty numeric(14,3) not null,
  delivery_at timestamptz,
  design_notes text,
  photo_url text,
  advance_paid numeric(12,2) default 0,
  balance numeric(12,2) default 0,
  status text default 'booked',
  created_at timestamptz default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.app_users(id),
  attendance_date date not null,
  check_in time,
  check_out time,
  status text,
  advance_taken numeric(12,2) default 0,
  advance_reason text,
  created_at timestamptz default now()
);

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  category text,
  status text default 'missing_credentials',
  health text default 'warning',
  config jsonb default '{}'::jsonb,
  last_sync timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references public.branches(id),
  job_type text not null,
  payload jsonb not null,
  status text default 'queued',
  error_message text,
  created_at timestamptz default now(),
  printed_at timestamptz
);

create table if not exists public.debug_events (
  id uuid primary key default gen_random_uuid(),
  level text not null,
  module text not null,
  message text not null,
  detail text,
  user_id uuid references public.app_users(id),
  created_at timestamptz default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.app_users(id),
  module text not null,
  action text not null,
  entity_type text,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  created_at timestamptz default now()
);

alter table public.branches enable row level security;
alter table public.roles enable row level security;
alter table public.app_users enable row level security;
alter table public.role_permissions enable row level security;
alter table public.products enable row level security;
alter table public.branch_price_lists enable row level security;
alter table public.ingredients enable row level security;
alter table public.ingredient_batches enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_lines enable row level security;
alter table public.production_plans enable row level security;
alter table public.inventory_ledger enable row level security;
alter table public.finished_stock_batches enable row level security;
alter table public.stock_audits enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.dispatches enable row level security;
alter table public.dispatch_lines enable row level security;
alter table public.counter_sessions enable row level security;
alter table public.bills enable row level security;
alter table public.bill_lines enable row level security;
alter table public.online_orders enable row level security;
alter table public.advance_orders enable row level security;
alter table public.attendance_records enable row level security;
alter table public.integrations enable row level security;
alter table public.print_jobs enable row level security;
alter table public.debug_events enable row level security;
alter table public.audit_log enable row level security;

-- Demo policies: tighten before real go-live. Authenticated users can read/write while app permissions enforce UX.
do $$
declare t text;
begin
  foreach t in array array[
    'branches','roles','app_users','role_permissions','products','branch_price_lists','ingredients','ingredient_batches','recipes','recipe_lines','production_plans','inventory_ledger','finished_stock_batches','stock_audits','purchase_orders','purchase_order_lines','dispatches','dispatch_lines','counter_sessions','bills','bill_lines','online_orders','advance_orders','attendance_records','integrations','print_jobs','debug_events','audit_log'
  ] loop
    execute format('drop policy if exists authenticated_all on public.%I', t);
    execute format('create policy authenticated_all on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

create or replace function public.record_debug_event(p_level text, p_module text, p_message text, p_detail text default null)
returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  insert into public.debug_events(level, module, message, detail) values (p_level, p_module, p_message, p_detail) returning id into new_id;
  return new_id;
end $$;

create or replace function public.ensure_counter_open(p_branch_id uuid)
returns boolean language sql stable as $$
  select exists(select 1 from public.counter_sessions where branch_id = p_branch_id and status = 'open');
$$;
