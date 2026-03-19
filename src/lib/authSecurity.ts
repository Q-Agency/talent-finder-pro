/**
 * Client-side auth hardening (complements a real backend later).
 * Credentials still ship in the JS bundle if set via Vite env — use only for
 * low-risk internal gates; prefer SSO / API auth for production.
 */

const STORAGE_FAIL_COUNT = 'auth_login_fail_count';
const STORAGE_LOCKOUT_UNTIL = 'auth_login_lockout_until';

/** Session idle wall-clock expiry (stored with `isAuthenticated` in localStorage). */
export const AUTH_SESSION_EXPIRES_AT_KEY = 'auth_session_expires_at';

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours

function maxAttempts(): number {
  const n = Number(import.meta.env.VITE_LOGIN_MAX_ATTEMPTS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_MAX_ATTEMPTS;
}

function lockoutMs(): number {
  const n = Number(import.meta.env.VITE_LOGIN_LOCKOUT_MS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_LOCKOUT_MS;
}

function sessionMaxAgeMs(): number {
  const n = Number(import.meta.env.VITE_SESSION_MAX_AGE_MS);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_SESSION_MS;
}

/** Read expected credentials from build-time env (never commit real values). */
export function getExpectedLoginCredentials(): { username: string; password: string } | null {
  const username = (import.meta.env.VITE_LOGIN_USERNAME as string | undefined)?.trim();
  const password = import.meta.env.VITE_LOGIN_PASSWORD as string | undefined;
  if (!username || password === undefined || password === '') {
    if (import.meta.env.DEV) {
      console.warn(
        '[auth] Set VITE_LOGIN_USERNAME and VITE_LOGIN_PASSWORD in .env.local (see .env.example).',
      );
    }
    return null;
  }
  return { username, password };
}

/** Reduce timing leaks when comparing secrets (best-effort in JS). */
function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ba = enc.encode(a);
  const bb = enc.encode(b);
  if (ba.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ba.length; i++) {
    diff |= ba[i] ^ bb[i];
  }
  return diff === 0;
}

export function credentialsMatch(inputUser: string, inputPass: string): boolean {
  const expected = getExpectedLoginCredentials();
  if (!expected) return false;
  const u = inputUser.trim();
  return constantTimeEqual(u, expected.username) && constantTimeEqual(inputPass, expected.password);
}

export function getLoginLockoutState(): { locked: boolean; retryAfterMs?: number } {
  const untilRaw = localStorage.getItem(STORAGE_LOCKOUT_UNTIL);
  if (!untilRaw) return { locked: false };
  const until = parseInt(untilRaw, 10);
  if (Number.isNaN(until) || Date.now() >= until) {
    localStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
    localStorage.removeItem(STORAGE_FAIL_COUNT);
    return { locked: false };
  }
  return { locked: true, retryAfterMs: until - Date.now() };
}

export function registerFailedLoginAttempt(): void {
  const { locked } = getLoginLockoutState();
  if (locked) return;

  const prev = parseInt(localStorage.getItem(STORAGE_FAIL_COUNT) || '0', 10);
  const next = Number.isNaN(prev) ? 1 : prev + 1;
  localStorage.setItem(STORAGE_FAIL_COUNT, String(next));

  if (next >= maxAttempts()) {
    localStorage.setItem(STORAGE_LOCKOUT_UNTIL, String(Date.now() + lockoutMs()));
    localStorage.removeItem(STORAGE_FAIL_COUNT);
  }
}

export function clearLoginSecurityState(): void {
  localStorage.removeItem(STORAGE_FAIL_COUNT);
  localStorage.removeItem(STORAGE_LOCKOUT_UNTIL);
}

export function persistSessionExpiry(): void {
  localStorage.setItem(AUTH_SESSION_EXPIRES_AT_KEY, String(Date.now() + sessionMaxAgeMs()));
}

export function clearSessionExpiry(): void {
  localStorage.removeItem(AUTH_SESSION_EXPIRES_AT_KEY);
}

/** True if expiry is set and already passed. */
export function isSessionExpired(): boolean {
  const raw = localStorage.getItem(AUTH_SESSION_EXPIRES_AT_KEY);
  if (!raw) return false;
  const exp = parseInt(raw, 10);
  if (Number.isNaN(exp)) return false;
  return Date.now() >= exp;
}

export function getRemainingAttemptsBeforeLockout(): number {
  const { locked } = getLoginLockoutState();
  if (locked) return 0;
  const n = parseInt(localStorage.getItem(STORAGE_FAIL_COUNT) || '0', 10);
  return Math.max(0, maxAttempts() - (Number.isNaN(n) ? 0 : n));
}
