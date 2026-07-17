-- Five-role, branch-scoped production security for BakeryOS Pro.
-- Apply after the two foundation migrations in this repository.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter table public.app_users add column if not exists email text;
alter table public.app_users add column if not exists updated_at timestamptz not null default now();
alter table public.audit_log add column if not exists auth_actor_id uuid references auth.users(id) on delete set null;
alter table public.purchase_orders add column if not exists supplier_id uuid references public.suppliers(id);
alter table public.bills add column if not exists customer_id uuid references public.customers(id);
alter table public.bills add column if not exists customer_phone text;
alter table public.bills add column if not exists order_channel text not null default 'walk-in';
alter table public.bills add column if not exists round_off numeric(12,2) not null default 0;
alter table public.bills add column if not exists print_count integer not null default 1;

create unique index if not exists app_users_auth_user_id_uidx
  on public.app_users(auth_user_id) where auth_user_id is not null;
create unique index if not exists app_users_email_uidx
  on public.app_users(lower(email)) where email is not null;

create table if not exists public.user_branch_access (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  unique(auth_user_id, branch_id)
);

create index if not exists user_branch_access_user_idx on public.user_branch_access(auth_user_id);
create index if not exists user_branch_access_branch_idx on public.user_branch_access(branch_id);
create index if not exists stock_audits_branch_status_idx on public.stock_audits(branch_id, status, created_at desc);
create index if not exists bills_branch_created_idx on public.bills(branch_id, created_at desc);
create index if not exists online_orders_branch_status_idx on public.online_orders(branch_id, status, received_at desc);
create index if not exists inventory_ledger_branch_created_idx on public.inventory_ledger(branch_id, created_at desc);

insert into public.roles(code, name, description, dashboards)
values
  ('owner', 'Owner / Super Admin', 'Full access to all five workspaces', array['admin','kitchen','branch','branch-incharge','stock-audit']),
  ('admin-manager', 'Admin Manager', 'Company configuration, users, approvals and reporting', array['admin']),
  ('kitchen-manager', 'Kitchen Manager', 'Store, production, baking, packing and dispatch', array['kitchen']),
  ('branch-incharge', 'Branch Incharge', 'Outlet people, stock, cash, approvals and reporting', array['branch-incharge']),
  ('branch-cashier', 'Branch Cashier', 'Counter, billing, customer orders and closure', array['branch']),
  ('auditor', 'Stock Auditor', 'Independent counts, inward verification and variance evidence', array['stock-audit'])
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  dashboards = excluded.dashboards;

insert into public.branches(code, name, branch_type, address, phone, channels, opening_hours, active)
values
  ('central-kitchen', 'Central Kitchen & Warehouse', 'central_kitchen', 'Verify exact address with client', '+91 90000 00001', array['wholesale','website'], '24x7 production window', true),
  ('marathahalli', 'Marathahalli Outlet', 'retail', '824, 3rd Cross, Tulasi Theater Road, Marathahalli, Bengaluru', '+91 97417 62989', array['walk-in','swiggy','zomato','website','qr','phone'], '8:00 AM - 11:00 PM', true),
  ('sarjapur-road', 'Sarjapur Road Outlet', 'retail', '65/1C, Shivaganga Complex, Kaikondrahalli, Sarjapur Road, Bengaluru', '+91 90668 87768', array['walk-in','swiggy','zomato','website','qr','phone'], '8:00 AM - 10:30 PM', true),
  ('kadubeesanahalli', 'Kadubeesanahalli Outlet', 'retail', '56/4, Panathur Main Road, Kadubeesanahalli, Bengaluru', '+91 90668 87768', array['walk-in','swiggy','zomato','website','qr','phone'], '8:00 AM - 10:15 PM', true),
  ('koramangala', 'Koramangala Online Outlet', 'cloud', 'Verify exact address with client', '+91 90000 00005', array['swiggy','zomato','website','qr'], '8:00 AM - 11:00 PM', true)
on conflict (code) do update set
  name = excluded.name,
  branch_type = excluded.branch_type,
  address = excluded.address,
  phone = excluded.phone,
  channels = excluded.channels,
  opening_hours = excluded.opening_hours,
  active = excluded.active;

insert into public.role_permissions(role_id, module_id, actions)
select role.id, permission.module_id, permission.actions
from public.roles role
cross join lateral (
  values
    ('users-permissions', array['view','create','edit','delete','approve']::text[]),
    ('items-menu', array['view','create','edit','delete','export']::text[]),
    ('reports-bi', array['view','export']::text[]),
    ('production-approval', array['view','approve','edit']::text[]),
    ('stock-audit', array['view','create','edit','approve','export']::text[]),
    ('finance-gst', array['view','create','edit','approve','export','close']::text[]),
    ('integrations', array['view','edit','sync']::text[])
) permission(module_id, actions)
where role.code in ('owner','admin-manager')
on conflict (role_id, module_id) do update set actions = excluded.actions;

insert into public.role_permissions(role_id, module_id, actions)
select role.id, permission.module_id, permission.actions
from public.roles role
cross join lateral (
  values
    ('kitchen-planner', array['view','create','edit']::text[]),
    ('kitchen-kds', array['view','edit']::text[]),
    ('qc-waste', array['view','create','edit']::text[]),
    ('packing-dispatch', array['view','create','edit','print']::text[]),
    ('inventory-ledger', array['view']::text[]),
    ('label-print', array['view','print']::text[])
) permission(module_id, actions)
where role.code in ('owner','kitchen-manager')
on conflict (role_id, module_id) do update set actions = excluded.actions;

insert into public.role_permissions(role_id, module_id, actions)
select role.id, permission.module_id, permission.actions
from public.roles role
cross join lateral (
  values
    ('counter-session', array['view','create','close']::text[]),
    ('fast-billing', array['view','create','print']::text[]),
    ('online-orders', array['view','create','edit','print']::text[]),
    ('advance-orders', array['view','create','edit','print']::text[]),
    ('daily-closure', array['view','create','close']::text[])
) permission(module_id, actions)
where role.code in ('owner','branch-cashier')
on conflict (role_id, module_id) do update set actions = excluded.actions;

insert into public.role_permissions(role_id, module_id, actions)
select role.id, permission.module_id, permission.actions
from public.roles role
cross join lateral (
  values
    ('counter-session', array['view','create','edit','close']::text[]),
    ('fast-billing', array['view','create','print','refund','void','override']::text[]),
    ('online-orders', array['view','create','edit','approve','override']::text[]),
    ('advance-orders', array['view','create','edit','approve']::text[]),
    ('inventory-ledger', array['view','export']::text[]),
    ('stock-audit', array['view','create','approve','export']::text[]),
    ('attendance-payroll', array['view','create','edit']::text[]),
    ('daily-closure', array['view','create','approve','export','close']::text[]),
    ('reports-bi', array['view','export']::text[])
) permission(module_id, actions)
where role.code in ('owner','branch-incharge')
on conflict (role_id, module_id) do update set actions = excluded.actions;

insert into public.role_permissions(role_id, module_id, actions)
select role.id, permission.module_id, permission.actions
from public.roles role
cross join lateral (
  values
    ('stock-audit', array['view','create','edit','export']::text[]),
    ('inventory-ledger', array['view','export']::text[]),
    ('goods-receipt', array['view','create']::text[]),
    ('reports-bi', array['view','export']::text[])
) permission(module_id, actions)
where role.code in ('owner','auditor')
on conflict (role_id, module_id) do update set actions = excluded.actions;

insert into public.user_branch_access(auth_user_id, branch_id)
select user_row.auth_user_id, branch_id
from public.app_users user_row
cross join lateral unnest(user_row.branch_ids) branch_id
where user_row.auth_user_id is not null
on conflict (auth_user_id, branch_id) do nothing;

create or replace function private.current_role_code()
returns text
language sql stable security definer set search_path = ''
as $$
  select role.code
  from public.app_users app_user
  join public.roles role on role.id = app_user.role_id
  where app_user.auth_user_id = (select auth.uid()) and app_user.active
  limit 1
$$;

create or replace function private.has_permission(p_module text, p_action text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    private.current_role_code() = 'owner'
    or exists (
      select 1
      from public.app_users app_user
      join public.role_permissions permission on permission.role_id = app_user.role_id
      where app_user.auth_user_id = (select auth.uid())
        and app_user.active
        and permission.module_id = p_module
        and p_action = any(permission.actions)
    ), false
  )
$$;

create or replace function private.has_branch_access(p_branch_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    private.current_role_code() in ('owner','admin-manager')
    or exists (
      select 1 from public.user_branch_access access
      where access.auth_user_id = (select auth.uid()) and access.branch_id = p_branch_id
    )
    or exists (
      select 1 from public.app_users app_user
      where app_user.auth_user_id = (select auth.uid()) and p_branch_id = any(app_user.branch_ids)
    ), false
  )
$$;

create or replace function public.current_user_can(p_module text, p_action text)
returns boolean
language sql stable security invoker set search_path = ''
as $$ select private.has_permission(p_module, p_action) $$;

create or replace function private.bootstrap_owner(p_email text)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  auth_id uuid;
  app_id uuid;
  owner_role_id uuid;
begin
  select id into auth_id from auth.users where lower(email) = lower(p_email) limit 1;
  if auth_id is null then raise exception 'Create the Auth user first: %', p_email; end if;
  select id into owner_role_id from public.roles where code = 'owner';

  select id into app_id from public.app_users where auth_user_id = auth_id limit 1;
  if app_id is null then
    insert into public.app_users(auth_user_id, name, email, role_id, branch_ids, active)
    select auth_id, coalesce(raw_user_meta_data ->> 'display_name', split_part(email, '@', 1)), email, owner_role_id,
      coalesce((select array_agg(id) from public.branches where active), '{}'::uuid[]), true
    from auth.users where id = auth_id
    returning id into app_id;
  else
    update public.app_users
    set role_id = owner_role_id,
      active = true,
      branch_ids = coalesce((select array_agg(id) from public.branches where active), '{}'::uuid[]),
      updated_at = now()
    where id = app_id;
  end if;

  insert into public.user_branch_access(auth_user_id, branch_id)
  select auth_id, id from public.branches where active
  on conflict (auth_user_id, branch_id) do nothing;
  return app_id;
end
$$;

revoke all on function private.current_role_code() from public, anon;
revoke all on function private.has_permission(text, text) from public, anon;
revoke all on function private.has_branch_access(uuid) from public, anon;
revoke all on function public.current_user_can(text, text) from public, anon;
revoke all on function private.bootstrap_owner(text) from public, anon, authenticated;
grant execute on function private.current_role_code() to authenticated;
grant execute on function private.has_permission(text, text) to authenticated;
grant execute on function private.has_branch_access(uuid) to authenticated;
grant execute on function public.current_user_can(text, text) to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'branches','roles','app_users','role_permissions','user_branch_access','suppliers','products','branch_price_lists','branch_prices',
    'ingredients','ingredient_batches','recipes','recipe_lines','production_plans','inventory_ledger',
    'finished_stock_batches','stock_audits','purchase_orders','purchase_order_lines','dispatches',
    'dispatch_lines','goods_receipts','goods_receipt_lines','customers','counter_sessions','bills','bill_lines','refunds','online_orders','advance_orders','credit_entries',
    'attendance_records','integrations','print_jobs','debug_events','sync_queue','audit_log'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists authenticated_all on public.%I', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format('grant all on table public.%I to service_role', table_name);
  end loop;
end $$;

drop policy if exists branches_read on public.branches;
create policy branches_read on public.branches for select to authenticated using (active or private.current_role_code() in ('owner','admin-manager'));
drop policy if exists branches_admin_write on public.branches;
create policy branches_admin_write on public.branches for all to authenticated using (private.has_permission('users-permissions','edit')) with check (private.has_permission('users-permissions','edit'));

drop policy if exists roles_read on public.roles;
create policy roles_read on public.roles for select to authenticated using (true);
drop policy if exists roles_admin_write on public.roles;
create policy roles_admin_write on public.roles for all to authenticated using (private.has_permission('users-permissions','edit')) with check (private.has_permission('users-permissions','edit'));

drop policy if exists app_users_read on public.app_users;
create policy app_users_read on public.app_users for select to authenticated using (auth_user_id = (select auth.uid()) or private.has_permission('users-permissions','view'));
drop policy if exists app_users_admin_write on public.app_users;
create policy app_users_admin_write on public.app_users for all to authenticated using (private.has_permission('users-permissions','edit')) with check (private.has_permission('users-permissions','edit'));

drop policy if exists role_permissions_read on public.role_permissions;
create policy role_permissions_read on public.role_permissions for select to authenticated using (private.has_permission('users-permissions','view') or role_id = (select role_id from public.app_users where auth_user_id = (select auth.uid()) limit 1));
drop policy if exists role_permissions_admin_write on public.role_permissions;
create policy role_permissions_admin_write on public.role_permissions for all to authenticated using (private.has_permission('users-permissions','edit')) with check (private.has_permission('users-permissions','edit'));

drop policy if exists user_branch_access_read on public.user_branch_access;
create policy user_branch_access_read on public.user_branch_access for select to authenticated using (auth_user_id = (select auth.uid()) or private.has_permission('users-permissions','view'));
drop policy if exists user_branch_access_admin_write on public.user_branch_access;
create policy user_branch_access_admin_write on public.user_branch_access for all to authenticated using (private.has_permission('users-permissions','edit')) with check (private.has_permission('users-permissions','edit'));

do $$
declare table_name text;
begin
  foreach table_name in array array['suppliers','products','ingredients','recipes','recipe_lines','integrations'] loop
    execute format('drop policy if exists reference_read on public.%I', table_name);
    execute format('create policy reference_read on public.%I for select to authenticated using (true)', table_name);
    execute format('drop policy if exists reference_admin_write on public.%I', table_name);
    execute format('create policy reference_admin_write on public.%I for all to authenticated using (private.has_permission(''items-menu'',''edit'')) with check (private.has_permission(''items-menu'',''edit''))', table_name);
  end loop;
end $$;

drop policy if exists legacy_branch_prices_access on public.branch_prices;
create policy legacy_branch_prices_access on public.branch_prices for select to authenticated using (private.has_branch_access(branch_id));
drop policy if exists legacy_branch_prices_write on public.branch_prices;
create policy legacy_branch_prices_write on public.branch_prices for all to authenticated using (private.has_permission('items-menu','edit')) with check (private.has_permission('items-menu','edit'));

drop policy if exists branch_prices_access on public.branch_price_lists;
create policy branch_prices_access on public.branch_price_lists for select to authenticated using (private.has_branch_access(branch_id));
drop policy if exists branch_prices_admin_write on public.branch_price_lists;
create policy branch_prices_admin_write on public.branch_price_lists for all to authenticated using (private.has_permission('items-menu','edit')) with check (private.has_permission('items-menu','edit'));

drop policy if exists ingredient_batches_access on public.ingredient_batches;
create policy ingredient_batches_access on public.ingredient_batches for select to authenticated using (private.has_branch_access(branch_id));
drop policy if exists ingredient_batches_write on public.ingredient_batches;
create policy ingredient_batches_write on public.ingredient_batches for all to authenticated using (private.has_branch_access(branch_id) and (private.has_permission('inventory-ledger','view') or private.has_permission('kitchen-planner','edit'))) with check (private.has_branch_access(branch_id) and (private.has_permission('inventory-ledger','view') or private.has_permission('kitchen-planner','edit')));

drop policy if exists production_plans_read on public.production_plans;
create policy production_plans_read on public.production_plans for select to authenticated using (private.has_permission('kitchen-planner','view') or private.has_permission('production-approval','view'));
drop policy if exists production_plans_write on public.production_plans;
create policy production_plans_write on public.production_plans for all to authenticated using (private.has_permission('kitchen-planner','edit') or private.has_permission('production-approval','approve')) with check (private.has_permission('kitchen-planner','create') or private.has_permission('production-approval','approve'));

drop policy if exists inventory_ledger_read on public.inventory_ledger;
create policy inventory_ledger_read on public.inventory_ledger for select to authenticated using (private.has_branch_access(branch_id) and private.has_permission('inventory-ledger','view'));
drop policy if exists inventory_ledger_insert on public.inventory_ledger;
create policy inventory_ledger_insert on public.inventory_ledger for insert to authenticated with check (private.has_branch_access(branch_id) and (private.has_permission('stock-audit','create') or private.has_permission('kitchen-planner','edit')));

drop policy if exists finished_stock_access on public.finished_stock_batches;
create policy finished_stock_access on public.finished_stock_batches for select to authenticated using (private.has_branch_access(branch_id));
drop policy if exists finished_stock_write on public.finished_stock_batches;
create policy finished_stock_write on public.finished_stock_batches for all to authenticated using (private.has_branch_access(branch_id) and (private.has_permission('kitchen-kds','edit') or private.has_permission('stock-audit','approve'))) with check (private.has_branch_access(branch_id) and (private.has_permission('kitchen-kds','edit') or private.has_permission('stock-audit','approve')));

drop policy if exists stock_audits_access on public.stock_audits;
create policy stock_audits_access on public.stock_audits for select to authenticated using (private.has_branch_access(branch_id) and private.has_permission('stock-audit','view'));
drop policy if exists stock_audits_insert on public.stock_audits;
create policy stock_audits_insert on public.stock_audits for insert to authenticated with check (private.has_branch_access(branch_id) and private.has_permission('stock-audit','create'));
drop policy if exists stock_audits_update on public.stock_audits;
create policy stock_audits_update on public.stock_audits for update to authenticated using (private.has_branch_access(branch_id) and (private.has_permission('stock-audit','edit') or private.has_permission('stock-audit','approve'))) with check (private.has_branch_access(branch_id) and (private.has_permission('stock-audit','edit') or private.has_permission('stock-audit','approve')));

drop policy if exists dispatches_access on public.dispatches;
create policy dispatches_access on public.dispatches for select to authenticated using (private.has_branch_access(from_branch_id) or private.has_branch_access(to_branch_id));
drop policy if exists dispatches_write on public.dispatches;
create policy dispatches_write on public.dispatches for all to authenticated using ((private.has_branch_access(from_branch_id) or private.has_branch_access(to_branch_id)) and (private.has_permission('packing-dispatch','edit') or private.has_permission('goods-receipt','create'))) with check ((private.has_branch_access(from_branch_id) or private.has_branch_access(to_branch_id)) and (private.has_permission('packing-dispatch','create') or private.has_permission('goods-receipt','create')));

drop policy if exists dispatch_lines_access on public.dispatch_lines;
create policy dispatch_lines_access on public.dispatch_lines for select to authenticated using (exists (select 1 from public.dispatches dispatch where dispatch.id = dispatch_id and (private.has_branch_access(dispatch.from_branch_id) or private.has_branch_access(dispatch.to_branch_id))));
drop policy if exists dispatch_lines_write on public.dispatch_lines;
create policy dispatch_lines_write on public.dispatch_lines for all to authenticated using (private.has_permission('packing-dispatch','edit')) with check (private.has_permission('packing-dispatch','create'));

do $$
declare table_name text;
declare module_name text;
begin
  for table_name, module_name in values
    ('counter_sessions','counter-session'),
    ('bills','fast-billing'),
    ('online_orders','online-orders'),
    ('advance_orders','advance-orders')
  loop
    execute format('drop policy if exists branch_operation_read on public.%I', table_name);
    execute format('create policy branch_operation_read on public.%I for select to authenticated using (private.has_branch_access(branch_id) and private.has_permission(%L,''view''))', table_name, module_name);
    execute format('drop policy if exists branch_operation_write on public.%I', table_name);
    execute format('create policy branch_operation_write on public.%I for all to authenticated using (private.has_branch_access(branch_id) and (private.has_permission(%L,''edit'') or private.has_permission(%L,''close'') or private.has_permission(%L,''override''))) with check (private.has_branch_access(branch_id) and (private.has_permission(%L,''create'') or private.has_permission(%L,''edit'')))', table_name, module_name, module_name, module_name, module_name, module_name);
  end loop;
end $$;

drop policy if exists bill_lines_access on public.bill_lines;
create policy bill_lines_access on public.bill_lines for select to authenticated using (exists (select 1 from public.bills bill where bill.id = bill_id and private.has_branch_access(bill.branch_id)));
drop policy if exists bill_lines_write on public.bill_lines;
create policy bill_lines_write on public.bill_lines for all to authenticated using (private.has_permission('fast-billing','edit')) with check (private.has_permission('fast-billing','create'));

drop policy if exists purchase_orders_read on public.purchase_orders;
create policy purchase_orders_read on public.purchase_orders for select to authenticated using (private.has_permission('goods-receipt','view') or private.has_permission('production-approval','view'));
drop policy if exists purchase_orders_write on public.purchase_orders;
create policy purchase_orders_write on public.purchase_orders for all to authenticated using (private.has_permission('production-approval','edit')) with check (private.has_permission('production-approval','edit'));
drop policy if exists purchase_order_lines_read on public.purchase_order_lines;
create policy purchase_order_lines_read on public.purchase_order_lines for select to authenticated using (private.has_permission('goods-receipt','view') or private.has_permission('production-approval','view'));
drop policy if exists purchase_order_lines_write on public.purchase_order_lines;
create policy purchase_order_lines_write on public.purchase_order_lines for all to authenticated using (private.has_permission('production-approval','edit')) with check (private.has_permission('production-approval','edit'));

drop policy if exists goods_receipts_read on public.goods_receipts;
create policy goods_receipts_read on public.goods_receipts for select to authenticated using (private.has_permission('goods-receipt','view') or private.has_permission('production-approval','view'));
drop policy if exists goods_receipts_write on public.goods_receipts;
create policy goods_receipts_write on public.goods_receipts for all to authenticated using (private.has_permission('goods-receipt','create') or private.has_permission('production-approval','edit')) with check (private.has_permission('goods-receipt','create') or private.has_permission('production-approval','edit'));
drop policy if exists goods_receipt_lines_read on public.goods_receipt_lines;
create policy goods_receipt_lines_read on public.goods_receipt_lines for select to authenticated using (private.has_permission('goods-receipt','view') or private.has_permission('production-approval','view'));
drop policy if exists goods_receipt_lines_write on public.goods_receipt_lines;
create policy goods_receipt_lines_write on public.goods_receipt_lines for all to authenticated using (private.has_permission('goods-receipt','create') or private.has_permission('production-approval','edit')) with check (private.has_permission('goods-receipt','create') or private.has_permission('production-approval','edit'));

drop policy if exists customers_access on public.customers;
create policy customers_access on public.customers for select to authenticated using (private.has_permission('fast-billing','view') or private.has_permission('credit-ledger','view'));
drop policy if exists customers_write on public.customers;
create policy customers_write on public.customers for all to authenticated using (private.has_permission('fast-billing','create') or private.has_permission('credit-ledger','edit')) with check (private.has_permission('fast-billing','create') or private.has_permission('credit-ledger','create'));

drop policy if exists refunds_access on public.refunds;
create policy refunds_access on public.refunds for select to authenticated using (exists (select 1 from public.bills bill where bill.id = bill_id and private.has_branch_access(bill.branch_id)));
drop policy if exists refunds_write on public.refunds;
create policy refunds_write on public.refunds for all to authenticated using (private.has_permission('fast-billing','refund')) with check (private.has_permission('fast-billing','refund'));

drop policy if exists credit_entries_access on public.credit_entries;
create policy credit_entries_access on public.credit_entries for select to authenticated using (private.has_permission('credit-ledger','view'));
drop policy if exists credit_entries_write on public.credit_entries;
create policy credit_entries_write on public.credit_entries for all to authenticated using (private.has_permission('credit-ledger','edit')) with check (private.has_permission('credit-ledger','create'));

drop policy if exists attendance_access on public.attendance_records;
create policy attendance_access on public.attendance_records for select to authenticated using (private.has_permission('attendance-payroll','view'));
drop policy if exists attendance_write on public.attendance_records;
create policy attendance_write on public.attendance_records for all to authenticated using (private.has_permission('attendance-payroll','edit')) with check (private.has_permission('attendance-payroll','create'));

drop policy if exists audit_log_read on public.audit_log;
create policy audit_log_read on public.audit_log for select to authenticated using (private.current_role_code() in ('owner','admin-manager','auditor'));
drop policy if exists audit_log_insert on public.audit_log;
create policy audit_log_insert on public.audit_log for insert to authenticated with check (auth_actor_id = (select auth.uid()));

drop policy if exists print_jobs_access on public.print_jobs;
create policy print_jobs_access on public.print_jobs for select to authenticated using (branch_id is null or private.has_branch_access(branch_id));
drop policy if exists print_jobs_insert on public.print_jobs;
create policy print_jobs_insert on public.print_jobs for insert to authenticated with check (branch_id is null or private.has_branch_access(branch_id));

drop policy if exists debug_events_access on public.debug_events;
create policy debug_events_access on public.debug_events for select to authenticated using (private.current_role_code() in ('owner','admin-manager'));

drop policy if exists sync_queue_access on public.sync_queue;
create policy sync_queue_access on public.sync_queue for select to authenticated using (private.current_role_code() in ('owner','admin-manager'));
drop policy if exists sync_queue_insert on public.sync_queue;
create policy sync_queue_insert on public.sync_queue for insert to authenticated with check (true);

-- API access is explicit because new Supabase projects may not expose SQL-created tables automatically.
grant usage on schema public to authenticated, service_role;
revoke all on all tables in schema public from anon;

comment on table public.user_branch_access is 'Normalized branch assignments used by RLS; app_users.branch_ids remains for compatibility.';
comment on function public.current_user_can(text, text) is 'Returns whether the authenticated user has an action in role_permissions.';
