import { requireSupabase, setAuthToken } from './supabaseClient';
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

export async function signInWithUsername(username: string, password: string): Promise<AuthProfile> {
  const supabase = requireSupabase();
  const { data, error } = await supabase.functions.invoke('role-login', { body: { username, password } });

  if (error || !data?.ok) {
    throw new Error(data?.error ?? 'Username or password is incorrect.');
  }

  sessionStorage.setItem(TOKEN_KEY, data.access_token as string);
  setAuthToken(data.access_token as string);

  return {
    loginId: '',
    name: data.display_name,
    roleCode: data.role_code,
    roleName: data.role_name,
    dashboards: data.dashboards ?? [],
    homePath: DASHBOARD_PATHS[(data.dashboards ?? [])[0]] ?? '/login',
    initials: initialsFor(data.display_name)
  };
}

/** Restores a profile from the locally stored session token, without any network call. */
export function restoreProfile(): AuthProfile | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;

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
  setAuthToken(null);
}

export function dashboardPath(dashboard: string) {
  return DASHBOARD_PATHS[dashboard] ?? '/login';
}
