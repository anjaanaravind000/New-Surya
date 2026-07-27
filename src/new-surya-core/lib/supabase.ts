import { createClient } from '@supabase/supabase-js';
import { getAppSessionToken } from '@/lib/appSession';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.info('[NewSurya] Running in demo mode with local data (Supabase not configured).');
}

const REQUEST_TIMEOUT_MS = 15000;

const sessionAwareFetch: typeof fetch = async (input, init: RequestInit = {}) => {
  const headers = new Headers(init.headers ?? {});
  const requestUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;
  const isEdgeFunctionRequest = requestUrl.includes('/functions/v1/');
  const isDiagnosticRequest = requestUrl.includes('/rpc/report_client_error_secure');

  // Edge Functions have their own CORS contract. Do not attach the app-only
  // session headers there, otherwise the browser can stop after OPTIONS and
  // never issue the POST request. PostgREST/RPC requests still receive them.
  if (!isEdgeFunctionRequest) {
    const token = typeof window !== 'undefined' ? getAppSessionToken() : null;
    if (token) headers.set('x-retail-session', token);
    headers.set('x-client-app', 'new-surya-web');
  }

  // BUG FIX: without a timeout, a slow/unreachable backend hangs this fetch
  // forever, and every component awaiting it (or its store) is stuck in a
  // permanent loading state with no error ever surfacing. Abort and let the
  // normal error-handling path below run instead.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const externalSignal = init.signal;
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(input, { ...init, headers, signal: controller.signal });
    clearTimeout(timeoutId);
    if (typeof window !== 'undefined') {
      if (!response.ok && !isDiagnosticRequest) {
        // Peek at the body (without consuming it for the real caller) to see if this
        // is specifically an expired/invalid app session, so the UI can show a clear
        // "please log in again" message and redirect, instead of a generic error banner.
        let sessionExpired = false;
        let responseMessage = `Server returned ${response.status}`;
        let responseCode: string | undefined;
        let responseDetails: string | undefined;
        let responseHint: string | undefined;
        try {
          const bodyText = await response.clone().text();
          sessionExpired = /SESSION_REQUIRED/i.test(bodyText);
          try {
            const body = JSON.parse(bodyText) as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
            if (typeof body.message === 'string') responseMessage = body.message;
            if (typeof body.code === 'string') responseCode = body.code;
            if (typeof body.details === 'string') responseDetails = body.details;
            if (typeof body.hint === 'string') responseHint = body.hint;
          } catch {
            // Non-JSON errors retain the status-based message.
          }
        } catch {
          // Body wasn't readable (e.g. binary/stream) — fall through to the generic banner.
        }
        if (sessionExpired) {
          window.dispatchEvent(new CustomEvent('retail:session-expired', { detail: { at: Date.now() } }));
        } else {
          window.dispatchEvent(new CustomEvent('retail:data-error', { detail: {
            message: responseMessage,
            code: responseCode,
            details: responseDetails,
            hint: responseHint,
            status: response.status,
            module: 'Supabase API',
            at: Date.now(),
          } }));
        }
      }
      else if (!isDiagnosticRequest) window.dispatchEvent(new Event('retail:data-recovered'));
    }
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    const timedOut = error instanceof DOMException && error.name === 'AbortError' && !externalSignal?.aborted;
    const message = timedOut ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000}s. Please check your connection and try again.` : (error instanceof Error ? error.message : 'Network request failed');
    if (typeof window !== 'undefined' && !isDiagnosticRequest) window.dispatchEvent(new CustomEvent('retail:data-error', { detail: { message, module: 'Network', at: Date.now() } }));
    throw timedOut ? new Error(message) : error;
  }
};

import { createDemoClient } from '@/lib/demoClient';

export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = isDemoMode
  ? createDemoClient()
  : createClient(
      supabaseUrl as string,
      supabaseAnonKey as string,
      {
        global: { fetch: sessionAwareFetch },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      },
    );
