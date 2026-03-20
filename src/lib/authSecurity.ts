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

function decodeBase64Utf8(b64: string): string | null {
  const t = b64.trim();
  if (!t) return null;
  try {
    const bin = atob(t);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Why login might be unavailable (for user-facing messages; no secrets).
 * Prefer VITE_LOGIN_PASSWORD_B64 on Amplify if your password contains # or special chars.
 */
export type AuthSetupIssue =
  | "ok"
  | "missing_username"
  | "missing_password"
  | "invalid_password_b64";

/**
 * Plain login password from env (build-time). Order: VITE_LOGIN_PASSWORD, then aliases.
 * Aliases help when hosts (e.g. AWS Amplify) do not inject variables whose names contain "PASSWORD".
 */
function getPlainPasswordFromEnv(): string | undefined {
  const a = import.meta.env.VITE_LOGIN_PASSWORD as string | undefined;
  if (a != null && String(a).length > 0) return String(a);
  const b = import.meta.env.VITE_LOGIN_PASS as string | undefined;
  if (b != null && String(b).length > 0) return String(b);
  const c = import.meta.env.VITE_AUTH_PASS as string | undefined;
  if (c != null && String(c).length > 0) return String(c);
  return undefined;
}

export function getAuthSetupIssue(): AuthSetupIssue {
  const username = (import.meta.env.VITE_LOGIN_USERNAME as string | undefined)?.trim();
  const b64 = import.meta.env.VITE_LOGIN_PASSWORD_B64 as string | undefined;
  const plain = getPlainPasswordFromEnv();
  const hasPlain = plain != null && plain.length > 0;
  const hasB64 = b64 != null && String(b64).trim().length > 0;

  if (!username) return "missing_username";
  if (hasB64) {
    const decoded = decodeBase64Utf8(String(b64));
    if (decoded) return "ok";
    if (hasPlain) return "ok";
    return "invalid_password_b64";
  }
  if (!hasPlain) return "missing_password";
  return "ok";
}

/** User-facing explanation (no secrets). Use for login page banner and submit errors. */
export function getAuthSetupUserMessage(isDev: boolean): string {
  const issue = getAuthSetupIssue();
  const adminHint =
    "In AWS Amplify: Hosting → Environment variables for this branch → set username + password vars → Save → Redeploy.";
  if (issue === "ok") return "";
  if (isDev) {
    return "Sign-in is not configured. Add VITE_LOGIN_USERNAME and a password (VITE_LOGIN_PASSWORD or VITE_LOGIN_PASS) in .env.local — see .env.example.";
  }
  if (issue === "missing_username") {
    return `This deployment was built without a login username. ${adminHint}`;
  }
  if (issue === "missing_password") {
    return `This deployment was built without a login password. If VITE_LOGIN_PASSWORD is not injected by Amplify, use VITE_LOGIN_PASS instead (same value). Redeploy after saving. ${adminHint}`;
  }
  if (issue === "invalid_password_b64") {
    return "VITE_LOGIN_PASSWORD_B64 is not valid Base64. Fix it in Amplify and redeploy.";
  }
  return `Sign-in is not configured for this deployment. ${adminHint}`;
}

/** Read expected credentials from build-time env (never commit real values). */
export function getExpectedLoginCredentials(): { username: string; password: string } | null {
  const issue = getAuthSetupIssue();
  if (issue !== "ok") {
    if (import.meta.env.DEV) {
      console.warn(
        "[auth] Set VITE_LOGIN_USERNAME and password (VITE_LOGIN_PASSWORD, VITE_LOGIN_PASS, or VITE_LOGIN_PASSWORD_B64) in .env.local — see .env.example.",
      );
    }
    return null;
  }

  const username = (import.meta.env.VITE_LOGIN_USERNAME as string).trim();
  const b64 = import.meta.env.VITE_LOGIN_PASSWORD_B64 as string | undefined;
  if (b64 != null && String(b64).trim() !== "") {
    const decoded = decodeBase64Utf8(String(b64));
    if (decoded) return { username, password: decoded };
  }
  const plain = getPlainPasswordFromEnv();
  if (plain != null && plain.length > 0) {
    return { username, password: plain };
  }
  return null;
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
