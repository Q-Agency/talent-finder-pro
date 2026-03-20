# Deploy Resourcing Hub on AWS Amplify Hosting

This app is a **Vite + React SPA**. Amplify runs `npm ci` and `npm run build`, then serves the **`dist/`** output.

## What’s already in the repo

| File | Purpose |
|------|---------|
| [`amplify.yml`](../amplify.yml) | Build phases, `dist` artifacts, `node_modules` cache |
| [`scripts/write-build-env.mjs`](../scripts/write-build-env.mjs) | Runs before `vite build`; writes Amplify `VITE_*` into `.env.production.local` so login/API env is embedded reliably |
| [`.nvmrc`](../.nvmrc) | Node 20 for `nvm install` / `nvm use` in Amplify |
| [`public/_redirects`](../public/_redirects) | SPA rewrite so `/login`, `/analytics`, etc. load `index.html` (200) |
| [`.env.example`](../.env.example) | Documents API URL, login env vars, optional auth tuning |

## One-time Amplify setup

1. **AWS Console** → **Amplify** → **Create new app** → **Host web app**.
2. Connect your **Git provider** and select this repository and branch (e.g. `main`).
3. Amplify should **auto-detect** `amplify.yml` at the repository root. Confirm:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. **Environment variables** (App settings → **Environment variables**):
   - `VITE_API_BASE_URL` — public API base URL, e.g. `https://api.example.com` (**no trailing slash**).
   - `VITE_LOGIN_USERNAME` — allowed sign-in username.
   - `VITE_LOGIN_PASSWORD` — allowed password. **Letters and numbers only** is the simplest (no quoting issues). If the password must include **`#`** or similar, use **`VITE_LOGIN_PASSWORD_B64`** instead (UTF‑8 → Base64, one line, no quotes). Generate locally:  
     `node -e "console.log(Buffer.from('your exact password').toString('base64'))"`
   - Optional: `VITE_SESSION_MAX_AGE_MS`, `VITE_LOGIN_MAX_ATTEMPTS`, `VITE_LOGIN_LOCKOUT_MS` (see `.env.example`).
   - Vite inlines these at **build time** — change any variable and **redeploy** to apply.
5. Save and **deploy**.

## Backend / CORS / HTTPS

- The browser calls `VITE_API_BASE_URL` from your Amplify domain (`https://main.<id>.amplifyapp.com` or a custom domain).
- Your API must send **CORS** headers allowing that **Origin** (and `OPTIONS` for preflight if needed).
- The site is served over **HTTPS**. Calling **HTTP** APIs from the page will be blocked as mixed content — use **HTTPS** for the API or a reverse proxy on the same origin.

## Custom domain

Amplify → **Domain management** → add domain and follow DNS steps. Add the new HTTPS origin to your API **CORS** allowlist.

## Branch previews

Optional: enable **branch auto-detection** so PR branches get preview URLs (set the same `VITE_API_BASE_URL` or branch-specific overrides in Amplify env vars).

## Verify locally (production build)

```bash
cp .env.example .env.local
# Edit VITE_API_BASE_URL in .env.local

npm ci
npm run build
npm run preview
```

Open the preview URL and confirm `/login` and `/analytics` work after a full page refresh.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Blank page or 404 on refresh | `public/_redirects` must be in `dist/` (Vite copies `public/`). Rebuild and redeploy. |
| API errors / blocked requests | CORS, HTTPS vs HTTP, correct `VITE_API_BASE_URL`. |
| Old API URL after env change | Redeploy; Vite bakes env at build time. |
| Build fails on `npm ci` | Commit `package-lock.json`; don’t delete it. |
