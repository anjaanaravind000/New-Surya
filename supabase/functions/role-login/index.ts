import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET');
  if (!supabaseUrl || !anonKey || !jwtSecret) {
    return json({ ok: false, error: 'Server configuration is incomplete.' }, 500);
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  const username = body.username?.trim();
  const password = body.password ?? '';
  if (!username || !password) return json({ ok: false, error: 'Username and password are required.' }, 400);

  const supabase = createClient(supabaseUrl, anonKey);
  const { data, error } = await supabase.rpc('verify_role_login', { p_username: username, p_password: password });
  if (error) return json({ ok: false, error: 'Login failed. Please try again.' }, 500);

  const match = Array.isArray(data) ? data[0] : data;
  if (!match) return json({ ok: false, error: 'Username or password is incorrect.' }, 401);

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'authenticated',
    role: 'authenticated',
    sub: match.login_id,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    role_code: match.role_code,
    role_name: match.role_name,
    dashboards: match.dashboards,
    display_name: match.display_name,
  };

  const accessToken = await signJwt(payload, jwtSecret);

  return json({
    ok: true,
    access_token: accessToken,
    expires_at: payload.exp,
    role_code: match.role_code,
    role_name: match.role_name,
    dashboards: match.dashboards,
    display_name: match.display_name,
  }, 200);
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function base64url(input: ArrayBuffer | string): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJwt(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(signature)}`;
}
