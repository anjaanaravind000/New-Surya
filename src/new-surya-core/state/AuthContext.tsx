import React from 'react';
import { restoreProfile, signInWithUsername, signOut as authSignOut, type AuthProfile } from '../lib/auth';

interface AuthContextValue {
  status: 'loading' | 'authed' | 'anon';
  profile: AuthProfile | null;
  signIn: (username: string, password: string) => Promise<AuthProfile>;
  signOut: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<'loading' | 'authed' | 'anon'>('loading');
  const [profile, setProfile] = React.useState<AuthProfile | null>(null);

  React.useEffect(() => {
    const restored = restoreProfile();
    setProfile(restored);
    setStatus(restored ? 'authed' : 'anon');
  }, []);

  const signIn = React.useCallback(async (username: string, password: string) => {
    const result = await signInWithUsername(username, password);
    setProfile(result);
    setStatus('authed');
    return result;
  }, []);

  const signOut = React.useCallback(() => {
    authSignOut();
    setProfile(null);
    setStatus('anon');
  }, []);

  return <AuthContext.Provider value={{ status, profile, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
