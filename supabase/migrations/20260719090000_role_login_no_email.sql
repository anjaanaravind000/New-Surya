-- Email-free role logins for BakeryOS Pro.
-- Credentials live ONLY in this table (bcrypt-hashed via pgcrypto) — never in the app bundle,
-- and with no email/auth.users involved at all. The app calls the role-login edge function,
-- which calls verify_role_login() below and mints a signed session token on success.

create extension if not exists pgcrypto;

create table if not exists public.role_logins (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  password_hash text not null,
  role_id uuid not null references public.roles(id) on delete restrict,
  display_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists role_logins_username_uidx on public.role_logins (lower(username));

alter table public.role_logins enable row level security;
-- No policies are created on purpose: nobody can select/insert/update this table directly
-- through the API, not even authenticated users. All access goes through verify_role_login().
revoke all on public.role_logins from anon, authenticated;
grant all on public.role_logins to service_role;

-- Some installs used the alternate "full_schema" migration where app_users.auth_user_id
-- still has a hard foreign key to auth.users, and where pin_required doesn't exist at all.
-- Since role logins no longer live in auth.users, drop that FK if present.
do $$
declare
  fk_name text;
begin
  select tc.constraint_name into fk_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name and tc.table_schema = kcu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'app_users'
    and tc.constraint_type = 'FOREIGN KEY'
    and kcu.column_name = 'auth_user_id';
  if fk_name is not null then
    execute format('alter table public.app_users drop constraint %I', fk_name);
  end if;
end $$;

-- Delete any leftover users/app_users rows from the earlier email-based seed, if it was ever applied.
delete from public.app_users where email in (
  'admin@newsurya.local','branch@newsurya.local','kitchen@newsurya.local',
  'branch-incharge@newsurya.local','stock@newsurya.local'
);
delete from auth.identities where user_id in (
  select id from auth.users where email in (
    'admin@newsurya.local','branch@newsurya.local','kitchen@newsurya.local',
    'branch-incharge@newsurya.local','stock@newsurya.local'
  )
);
delete from auth.users where email in (
  'admin@newsurya.local','branch@newsurya.local','kitchen@newsurya.local',
  'branch-incharge@newsurya.local','stock@newsurya.local'
);

do $$
declare
  logins jsonb := '[
    {"username":"Admin",           "password":"NewSurya", "role_code":"admin-manager"},
    {"username":"Branch",          "password":"NewSurya", "role_code":"branch-cashier"},
    {"username":"Kitchen",         "password":"NewSurya", "role_code":"kitchen-manager"},
    {"username":"Branch Incharge", "password":"NewSurya", "role_code":"branch-incharge"},
    {"username":"Stock",           "password":"NewSurya", "role_code":"auditor"}
  ]'::jsonb;
  login jsonb;
  target_role_id uuid;
  login_id uuid;
begin
  for login in select * from jsonb_array_elements(logins) loop
    select id into target_role_id from public.roles where code = login->>'role_code';
    if target_role_id is null then
      raise exception 'Role % not found — run the five-role-branch-security migration first.', login->>'role_code';
    end if;

    select id into login_id from public.role_logins where lower(username) = lower(login->>'username');

    if login_id is null then
      insert into public.role_logins (username, password_hash, role_id, display_name, active)
      values (login->>'username', crypt(login->>'password', gen_salt('bf')), target_role_id, login->>'username', true)
      returning id into login_id;
    else
      update public.role_logins
      set password_hash = crypt(login->>'password', gen_salt('bf')),
        role_id = target_role_id,
        active = true,
        updated_at = now()
      where id = login_id;
    end if;

    if exists (select 1 from public.app_users where auth_user_id = login_id) then
      update public.app_users
      set name = login->>'username',
        role_id = target_role_id,
        active = true,
        updated_at = now()
      where auth_user_id = login_id;
    else
      insert into public.app_users (auth_user_id, name, email, role_id, branch_ids, active)
      values (login_id, login->>'username', null, target_role_id, '{}', true);
    end if;
  end loop;
end $$;

create or replace function public.verify_role_login(p_username text, p_password text)
returns table (
  login_id uuid,
  role_code text,
  role_name text,
  dashboards text[],
  display_name text
)
language plpgsql
security definer
set search_path = 'public'
as $$
begin
  return query
  select login.id, role.code, role.name, role.dashboards, login.display_name
  from public.role_logins login
  join public.roles role on role.id = login.role_id
  where lower(login.username) = lower(trim(p_username))
    and login.active
    and login.password_hash = crypt(p_password, login.password_hash);
end;
$$;

revoke all on function public.verify_role_login(text, text) from public, authenticated;
grant execute on function public.verify_role_login(text, text) to anon, authenticated, service_role;

comment on table public.role_logins is 'Standalone username/password store for the 5 role logins. No email, no auth.users. Verified only via verify_role_login().';
comment on function public.verify_role_login(text, text) is 'Checks a username/password against role_logins and returns role/dashboard info on success. Called by the role-login edge function.';
