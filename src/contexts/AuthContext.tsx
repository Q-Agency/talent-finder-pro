import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** True when the URL may still be processed into a session (invite / magic link / PKCE). */
function hasPendingAuthUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const { hash, search } = window.location;
  return (
    /access_token|refresh_token|type=|error=/.test(hash) || /code=/.test(search)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const pendingUrl = hasPendingAuthUrl();
    const safetyTimeout =
      pendingUrl &&
      window.setTimeout(() => {
        if (!cancelled) setIsLoading(false);
      }, 8000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!cancelled) {
        setSession(s);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return;
      setSession(s);
      // If tokens are in the URL, getSession() often resolves before the client finishes
      // parsing the hash — wait for onAuthStateChange so protected routes don't redirect to /login.
      if (!pendingUrl) {
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
      if (safetyTimeout) window.clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase is not configured' } };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error ? { message: error.message } : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    await supabase.auth.signOut();
  }, []);

  const value: AuthContextType = {
    session,
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
