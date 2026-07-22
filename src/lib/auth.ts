import { isSupabaseConfigured, requireSupabase, setAuthToken } from './supabaseClient';
import { decodeJwt, isExpired, type RoleLoginClaims } from './jwt';

export interface AuthProfile {
  loginId: string;
  name: string;
  roleCode: string;
  roleName: string;
  dashboards: string[];
  homePath: string;
  initials: string;
}

const DASHBOARD_PATHS: Record<string, string> = {
  admin: '/admin',
  kitchen: '/kitchen',
  branch: '/branch',
  'branch-incharge': '/branch-incharge',
  'stock-audit': '/stock-audit'
};

const TOKEN_KEY = 'newsurya.token';
const PROFILE_KEY = 'newsurya.profile';

const DEVELOPMENT_ACCOUNTS: Record<string, Omit<AuthProfile, 'loginId' | 'initials' | 'homePath'>> = {
  admin: { name: 'Admin', roleCode: 'admin-manager', roleName: 'Admin Manager', dashboards: ['admin'] },
  kitchen: { name: 'Kitchen', roleCode: 'kitchen', roleName: 'Kitchen', dashboards: ['kitchen'] },
  branch: { name: 'Branch', roleCode: 'branch', roleName: 'Branch', dashboards: ['branch'] },
  'branch incharge': { name: 'Branch Incharge', roleCode: 'branch-incharge', roleName: 'Branch Incharge', dashboards: ['branch-incharge'] },
  'stock audit': { name: 'Stock Audit', roleCode: 'stock-audit', roleName: 'Stock Audit', dashboards: ['stock-audit'] }
};

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]?.toUpperCase()).join('') || '??';
}

function profileFromClaims(claims: RoleLoginClaims): AuthProfile {
  return {
    loginId: claims.sub,
    name: claims.display_name,
    roleCode: claims.role_code,
    roleName: claims.role_name,
    dashboards: claims.dashboards ?? [],
    homePath: DASHBOARD_PATHS[claims.dashboards?.[0]] ?? '/login',
    initials: initialsFor(claims.display_name)
  };
}

function saveProfile(profile: AuthProfile) {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

function profileFromLoginRow(row: Record<string, unknown>): AuthProfile {
  const dashboards = Array.isArray(row.dashboards) ? row.dashboards.map(String) : [];
  const name = String(row.display_name || row.role_name || 'New Surya User');
  return {
    loginId: String(row.login_id || ''),
    name,
    roleCode: String(row.role_code || ''),
    roleName: String(row.role_name || ''),
    dashboards,
    homePath: DASHBOARD_PATHS[dashboards[0]] ?? '/login',
    initials: initialsFor(name)
  };
}

export async function signInWithUsername(username: string, password: string): Promise<AuthProfile> {
  if (!isSupabaseConfigured) {
    const account = DEVELOPMENT_ACCOUNTS[username.trim().toLowerCase()];
    const demoLoginEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO_LOGIN === 'true';
    if (demoLoginEnabled && account && password === 'NewSurya') {
      const profile: AuthProfile = { ...account, loginId: `development-${account.roleCode}`, homePath: DASHBOARD_PATHS[account.dashboards[0]] ?? '/login', initials: initialsFor(account.name) };
      return saveProfile(profile);
    }
    throw new Error('Supabase is not configured. Add the project URL and publishable key to Vercel environment variables.');
  }

  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke('role-login', { body: { username, password } });

  if (!error && data?.ok) {
    sessionStorage.setItem(TOKEN_KEY, data.access_token as string);
    setAuthToken(data.access_token as string);

    return saveProfile({
      loginId: '',
      name: data.display_name,
      roleCode: data.role_code,
      roleName: data.role_name,
      dashboards: data.dashboards ?? [],
      homePath: DASHBOARD_PATHS[(data.dashboards ?? [])[0]] ?? '/login',
      initials: initialsFor(data.display_name)
    });
  }

  const rpcResult = await supabase.rpc('verify_role_login', { p_username: username, p_password: password });
  const row = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
  if (rpcResult.error || !row) throw new Error('Username or password is incorrect.');

  return saveProfile(profileFromLoginRow(row as Record<string, unknown>));
}

/** Restores a profile from the locally stored session token, without any network call. */
export function restoreProfile(): AuthProfile | null {
  const storedProfile = sessionStorage.getItem(PROFILE_KEY);
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) {
    if (!storedProfile) return null;
    try { return JSON.parse(storedProfile) as AuthProfile; } catch { sessionStorage.removeItem(PROFILE_KEY); return null; }
  }

  const claims = decodeJwt(token);
  if (!claims || isExpired(claims)) {
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    return null;
  }

  setAuthToken(token);
  return profileFromClaims(claims);
}

export function signOut() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(PROFILE_KEY);
  setAuthToken(null);
}

export function dashboardPath(dashboard: string) {
  return DASHBOARD_PATHS[dashboard] ?? '/login';
}
