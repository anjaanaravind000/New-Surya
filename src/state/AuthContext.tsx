import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { fetchCurrentProfile, signInWithUsername, signOut as authSignOut, type AuthProfile } from '../lib/auth';

interface AuthContextValue {
  status: 'loading' | 'authed' | 'anon';
  profile: AuthProfile | null;
  signIn: (username: string, password: string) => Promise<AuthProfile>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<'loading' | 'authed' | 'anon'>('loading');
  const [profile, setProfile] = React.useState<AuthProfile | null>(null);

  const refresh = React.useCallback(async () => {
    const current = await fetchCurrentProfile();
    setProfile(current);
    setStatus(current ? 'authed' : 'anon');
  }, []);

  React.useEffect(() => {
    if (!supabase) { setStatus('anon'); return; }
    refresh();
    const { data: subscription } = supabase.auth.onAuthStateChange(() => { refresh(); });
    return () => subscription.subscription.unsubscribe();
  }, [refresh]);

  const signIn = React.useCallback(async (username: string, password: string) => {
    const result = await signInWithUsername(username, password);
    setProfile(result);
    setStatus('authed');
    return result;
  }, []);

  const signOut = React.useCallback(async () => {
    await authSignOut();
    setProfile(null);
    setStatus('anon');
  }, []);

  return <AuthContext.Provider value={{ status, profile, signIn, signOut, refresh }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
