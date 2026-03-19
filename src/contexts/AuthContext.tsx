import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AUTH_SESSION_EXPIRES_AT_KEY,
  credentialsMatch,
  clearLoginSecurityState,
  persistSessionExpiry,
  clearSessionExpiry,
  isSessionExpired,
} from '@/lib/authSecurity';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_FLAG_KEY = 'isAuthenticated';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (localStorage.getItem(AUTH_FLAG_KEY) !== 'true') return false;
    if (isSessionExpired()) {
      localStorage.removeItem(AUTH_FLAG_KEY);
      clearSessionExpiry();
      return false;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(AUTH_FLAG_KEY, String(isAuthenticated));
  }, [isAuthenticated]);

  /** Enforce session expiry while the app stays open */
  useEffect(() => {
    if (!isAuthenticated) return;
    const tick = () => {
      if (isSessionExpired()) {
        setIsAuthenticated(false);
        localStorage.removeItem(AUTH_FLAG_KEY);
        clearSessionExpiry();
      }
    };
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [isAuthenticated]);

  /** Start or refresh session window for existing logins missing expiry (migration). */
  useEffect(() => {
    if (!isAuthenticated) return;
    const raw = localStorage.getItem(AUTH_SESSION_EXPIRES_AT_KEY);
    if (!raw) persistSessionExpiry();
  }, [isAuthenticated]);

  const login = (username: string, password: string): boolean => {
    if (!credentialsMatch(username, password)) {
      return false;
    }
    clearLoginSecurityState();
    persistSessionExpiry();
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_FLAG_KEY);
    clearSessionExpiry();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
