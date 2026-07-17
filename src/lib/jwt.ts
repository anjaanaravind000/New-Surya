export interface RoleLoginClaims {
  sub: string;
  exp: number;
  role_code: string;
  role_name: string;
  dashboards: string[];
  display_name: string;
}

export function decodeJwt<T = RoleLoginClaims>(token: string): T | null {
  try {
    const [, payload] = token.split('.');
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(char => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function isExpired(claims: { exp: number }): boolean {
  return Date.now() >= claims.exp * 1000;
}
