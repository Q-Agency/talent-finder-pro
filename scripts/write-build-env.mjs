/**
 * Writes `.env.production.local` from process.env before `vite build`.
 * AWS Amplify injects VITE_* into the build shell; this persists them for Vite's loadEnv.
 * Values are JSON-stringified so special characters are safe.
 */
import { existsSync, unlinkSync, writeFileSync } from "node:fs";

const KEYS = [
  "VITE_API_BASE_URL",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];

const OUT = ".env.production.local";

const lines = [];
for (const k of KEYS) {
  const v = process.env[k];
  if (v !== undefined && v !== "") {
    lines.push(`${k}=${JSON.stringify(v)}`);
  }
}

const present = KEYS.filter((k) => process.env[k] !== undefined && process.env[k] !== "");

console.log(`[write-build-env] Keys present in build env (names only): ${present.join(", ") || "(none)"}`);

const hasSupabase =
  (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_URL !== "") &&
  (process.env.VITE_SUPABASE_ANON_KEY && process.env.VITE_SUPABASE_ANON_KEY !== "");
if (!hasSupabase) {
  console.warn(
    "[write-build-env] WARNING: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY should both be set for sign-in. Redeploy after setting them in Amplify.",
  );
}

if (lines.length > 0) {
  writeFileSync(OUT, `${lines.join("\n")}\n`);
  console.log(`[write-build-env] Wrote ${lines.length} line(s) to ${OUT}`);
} else if (existsSync(OUT)) {
  unlinkSync(OUT);
  console.log(`[write-build-env] Removed stale ${OUT} (no VITE_* in environment)`);
}
