-- Repair username/password role login on Supabase projects where pgcrypto
-- functions are installed in the extensions schema.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  installed_schema text;
begin
  select namespace.nspname
    into installed_schema
  from pg_extension extension_row
  join pg_namespace namespace on namespace.oid = extension_row.extnamespace
  where extension_row.extname = 'pgcrypto';

  if installed_schema is distinct from 'extensions' then
    execute 'alter extension pgcrypto set schema extensions';
  end if;
end
$$;

create table if not exists public.role_logins (
  id uuid primary key default extensions.gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  username text not null,
  password_hash text not null,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.role_logins add column if not exists role_id uuid references public.roles(id) on delete cascade;
alter table public.role_logins add column if not exists username text;
alter table public.role_logins add column if not exists password_hash text;
alter table public.role_logins add column if not exists display_name text;
alter table public.role_logins add column if not exists active boolean not null default true;
alter table public.role_logins add column if not exists created_at timestamptz not null default now();
alter table public.role_logins add column if not exists updated_at timestamptz not null default now();

create unique index if not exists role_logins_username_lower_uidx
  on public.role_logins(lower(username));

alter table public.role_logins enable row level security;
revoke all on table public.role_logins from public, anon, authenticated;
grant all on table public.role_logins to service_role;

create or replace function public.verify_role_login(p_username text, p_password text)
returns table (
  login_id uuid,
  role_code text,
  role_name text,
  dashboards text[],
  display_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    login.id,
    role.code,
    role.name,
    role.dashboards,
    login.display_name
  from public.role_logins login
  join public.roles role on role.id = login.role_id
  where lower(login.username) = lower(btrim(p_username))
    and login.active
    and login.password_hash = extensions.crypt(p_password, login.password_hash)
  limit 1
$$;

revoke all on function public.verify_role_login(text, text) from public;
grant execute on function public.verify_role_login(text, text) to anon, authenticated, service_role;

-- Create or repair the five initial role accounts used by the login screen.
-- Change these passwords before production launch.
insert into public.role_logins(role_id, username, password_hash, display_name, active)
select role.id, seed.username, extensions.crypt('NewSurya', extensions.gen_salt('bf', 12)), seed.display_name, true
from (
  values
    ('owner', 'Admin', 'New Surya Administrator'),
    ('kitchen-manager', 'Kitchen', 'Central Kitchen'),
    ('branch-cashier', 'Branch', 'Branch Cashier'),
    ('branch-incharge', 'Branch Incharge', 'Branch Incharge'),
    ('auditor', 'Stock Audit', 'Stock Auditor')
) seed(role_code, username, display_name)
join public.roles role on role.code = seed.role_code
where not exists (
  select 1 from public.role_logins existing
  where lower(existing.username) = lower(seed.username)
);

-- The reported Admin account is explicitly reset so the documented test
-- credentials work even when an older broken row already exists.
update public.role_logins
set password_hash = extensions.crypt('NewSurya', extensions.gen_salt('bf', 12)),
    active = true,
    updated_at = now()
where lower(username) = 'admin';

comment on function public.verify_role_login(text, text) is
  'Verifies a role login using pgcrypto functions explicitly qualified in the extensions schema.';
