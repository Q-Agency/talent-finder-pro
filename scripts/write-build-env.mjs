/**
 * Writes `.env.production.local` from process.env before `vite build`.
 * AWS Amplify injects VITE_* into the build shell; this persists them for Vite's loadEnv.
 * Values are JSON-stringified so special characters are safe.
 * If no VITE_* keys are set, removes a stale file so local `.env.local` still applies.
 */
import { existsSync, unlinkSync, writeFileSync } from "node:fs";

const KEYS = [
  "VITE_API_BASE_URL",
  "VITE_LOGIN_USERNAME",
  "VITE_LOGIN_PASSWORD",
  "VITE_LOGIN_PASSWORD_B64",
];

const OUT = ".env.production.local";

const lines = [];
for (const k of KEYS) {
  const v = process.env[k];
  if (v !== undefined && v !== "") {
    lines.push(`${k}=${JSON.stringify(v)}`);
  }
}

if (lines.length > 0) {
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(`[write-build-env] Wrote ${lines.length} key(s) to ${OUT}`);
} else if (existsSync(OUT)) {
  unlinkSync(OUT);
  console.log(`[write-build-env] Removed stale ${OUT} (no VITE_* in environment)`);
}
