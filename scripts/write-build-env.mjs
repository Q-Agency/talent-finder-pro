/**
 * Writes `.env.production.local` from process.env before `vite build`.
 * AWS Amplify injects VITE_* into the build shell; this persists them for Vite's loadEnv.
 * Values are JSON-stringified so special characters are safe.
 *
 * Note: Some hosts (including AWS Amplify) may not pass variables whose names contain
 * "PASSWORD" into the build. Use VITE_LOGIN_PASS or VITE_AUTH_PASS as aliases — we map
 * them to VITE_LOGIN_PASSWORD in the generated file so the app reads one shape.
 */
import { existsSync, unlinkSync, writeFileSync } from "node:fs";

const KEYS = [
  "VITE_API_BASE_URL",
  "VITE_LOGIN_USERNAME",
  "VITE_LOGIN_PASSWORD",
  "VITE_LOGIN_PASSWORD_B64",
];

/** Aliases: not written as separate keys; merged into VITE_LOGIN_PASSWORD if needed */
const PASSWORD_ALIAS_KEYS = ["VITE_LOGIN_PASS", "VITE_AUTH_PASS"];

const OUT = ".env.production.local";

const lines = [];
for (const k of KEYS) {
  const v = process.env[k];
  if (v !== undefined && v !== "") {
    lines.push(`${k}=${JSON.stringify(v)}`);
  }
}

const hasLoginPasswordLine = lines.some((l) => l.startsWith("VITE_LOGIN_PASSWORD="));
if (!hasLoginPasswordLine) {
  const fromAlias =
    PASSWORD_ALIAS_KEYS.map((k) => process.env[k]).find((v) => v != null && v !== "") ?? null;
  if (fromAlias) {
    lines.push(`VITE_LOGIN_PASSWORD=${JSON.stringify(fromAlias)}`);
  }
}

const present = KEYS.filter((k) => process.env[k] !== undefined && process.env[k] !== "");
const PASSWORD_KEYS = [
  "VITE_LOGIN_PASSWORD",
  "VITE_LOGIN_PASSWORD_B64",
  ...PASSWORD_ALIAS_KEYS,
];
const passwordPresent = PASSWORD_KEYS.filter((k) => process.env[k] != null && process.env[k] !== "");

console.log(`[write-build-env] Keys present in build env (names only): ${present.join(", ") || "(none)"}`);
console.log(
  `[write-build-env] Password-related keys present: ${passwordPresent.join(", ") || "(none)"}`,
);

const hasAnyPassword = passwordPresent.length > 0;

if (!hasAnyPassword) {
  console.warn(
    "[write-build-env] WARNING: No login password env found. Set VITE_LOGIN_PASSWORD, or if Amplify omits it, use VITE_LOGIN_PASS (same value), then redeploy.",
  );
}

if (lines.length > 0) {
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(`[write-build-env] Wrote ${lines.length} line(s) to ${OUT}`);
} else if (existsSync(OUT)) {
  unlinkSync(OUT);
  console.log(`[write-build-env] Removed stale ${OUT} (no VITE_* in environment)`);
}
