import { requireSupabase } from './supabaseClient';

export interface AuthProfile {
  authUserId: string;
  name: string;
  roleCode: string;
  roleName: string;
  dashboards: string[];
  homePath: string;
  initials: string;
}

// Convenience only — lets people type a friendly name instead of an email.
// Contains no secrets: passwords are verified by Supabase Auth, not here.
const USERNAME_TO_EMAIL: Record<string, string> = {
  admin: 'admin@newsurya.local',
  branch: 'branch@newsurya.local',
  kitchen: 'kitchen@newsurya.local',
  'branch incharge': 'branch-incharge@newsurya.local',
  stock: 'stock@newsurya.local'
};

const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin',
  kitchen: '/kitchen',
  branch: '/branch',
  'branch-incharge': '/branch-incharge',
  'stock-audit': '/stock-audit'
};

function resolveEmail(username: string) {
  const trimmed = username.trim();
  if (trimmed.includes('@')) return trimmed;
  return USERNAME_TO_EMAIL[trimmed.toLowerCase()] ?? trimmed;
}

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '??';
}

export async function signInWithUsername(username: string, password: string): Promise<AuthProfile> {
  const supabase = requireSupabase();
  const email = resolveEmail(username);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Username or password is incorrect.');

  const profile = await fetchCurrentProfile();
  if (!profile) {
    await supabase.auth.signOut();
    throw new Error('This account has no workspace access configured. Contact your admin.');
  }
  return profile;
}

export async function fetchCurrentProfile(): Promise<AuthProfile | null> {
  const supabase = requireSupabase();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_users')
    .select('name, active, role:roles(code, name, dashboards)')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error || !data || !data.active || !data.role) return null;
  const role = Array.isArray(data.role) ? data.role[0] : data.role;
  if (!role) return null;

  const dashboards: string[] = role.dashboards ?? [];
  const homePath = DASHBOARD_PATHS[dashboards[0]] ?? '/login';

  return {
    authUserId: user.id,
    name: data.name,
    roleCode: role.code,
    roleName: role.name,
    dashboards,
    homePath,
    initials: initialsFor(data.name)
  };
}

export async function signOut() {
  const supabase = requireSupabase();
  await supabase.auth.signOut();
}

export function dashboardPath(dashboard: string) {
  return DASHBOARD_PATHS[dashboard] ?? '/login';
}
