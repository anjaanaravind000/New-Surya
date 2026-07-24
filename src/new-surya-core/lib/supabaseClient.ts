import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// We don't use Supabase's built-in email-based Auth (GoTrue) for the 5 role logins —
// see /supabase/functions/role-login. Instead we mint our own short-lived JWT server-side
// (signed with the project's JWT secret) and attach it as a plain Authorization header.
// PostgREST verifies that JWT's signature directly, so Row Level Security still works,
// without any auth.users / email requirement anywhere.
let client: SupabaseClient | null = isSupabaseConfigured ? createClient(url as string, anonKey as string) : null;

export function requireSupabase(): SupabaseClient {
  if (!client) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return client;
}

/** Rebuilds the shared client with (or without) the role-login bearer token. Call on sign-in/sign-out. */
export function setAuthToken(token: string | null) {
  if (!url || !anonKey) return;
  client = createClient(
    url,
    anonKey,
    token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined
  );
}
