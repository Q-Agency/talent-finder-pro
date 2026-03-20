# Resourcing Hub (Talent Finder Pro)

Internal resourcing hub for finding the right employee based on skills, experience, seniority, and availability. Built with React, TypeScript, Vite, and shadcn/ui.

---

## Features

- **Resource search & browse** — Search and filter internal resources by role, seniority, skills (with senior/mid/junior levels), industries, certificates, employment type, and verticals.
- **Skill filtering** — AND/OR mode for multiple skills; optional global skill levels (senior, mid, junior) with counts and level breakdown.
- **Grid & list views** — Toggle between card grid and list; sort by name (asc/desc), seniority, or employment type.
- **Analytics** — Dashboard with charts: most abundant skills (stacked bar), skill competency heatmap, certificates, industry distribution (pie), employment type, seniority distribution, role distribution.
- **AI chatbot** — In-app assistant for resourcing questions; supports test and production backends.
- **Test vs production mode** — Profile menu toggle to use test webhook endpoints (`/webhook-test/`) or production (`/webhook/`).
- **Dataset refresh** — Trigger backend dataset refresh (with 60s timeout); respects test/prod mode.
- **Auth** — [Supabase Auth](https://supabase.com/docs/guides/auth) email/password (`signInWithPassword`); session persisted by the Supabase client; `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` at build time; protected routes.
- **Theme** — Light/dark/system via `next-themes` and theme toggle in header.

---

## Tech stack

| Category        | Technology |
|----------------|------------|
| Build          | Vite 5, SWC (React) |
| Language       | TypeScript 5 |
| UI             | React 18, React Router 6 |
| Components     | shadcn/ui (Radix), Tailwind CSS, CVA, Lucide icons |
| Data           | TanStack Query, React Hook Form, Zod |
| Charts         | Recharts |
| Auth           | @supabase/supabase-js |
| Other          | date-fns, react-markdown, remark-gfm, sonner, cmdk, next-themes |

---

## Project structure

```
src/
├── App.tsx                 # Routes, providers (Query, Theme, Auth)
├── main.tsx                # Entry, root render
├── index.css               # Global + Tailwind
├── contexts/
│   └── AuthContext.tsx     # Supabase session, sign-in / sign-out
├── pages/
│   ├── Index.tsx           # Main hub: filters, search, grid/list, chatbot
│   ├── Login.tsx           # Login form
│   ├── Analytics.tsx       # Charts and workforce analytics
│   └── NotFound.tsx        # 404
├── components/             # App-specific components
│   ├── FilterSidebar.tsx   # All filter sections (dynamic options from API)
│   ├── SearchHeader.tsx
│   ├── ResourceGrid.tsx, ResourceCard.tsx, ResourceListItem.tsx
│   ├── ResourceDetailModal.tsx
│   ├── ActiveFiltersBanner.tsx, SortSelect.tsx, ViewToggle.tsx
│   ├── RefreshDatasetButton.tsx, Chatbot.tsx
│   ├── ProfileMenu.tsx, ThemeToggle.tsx, ProtectedRoute.tsx
│   └── ui/                 # shadcn-style primitives
├── services/
│   ├── apiConfig.ts        # BASE_URL (VITE_API_BASE_URL or default)
│   ├── resourceApi.ts      # POST search (filters, semantic search)
│   ├── propertiesApi.ts    # GET filter options (roles, skills, industries, etc.)
│   ├── chatbotApi.ts       # POST chatbot message
│   └── refreshApi.ts       # POST dataset refresh
├── hooks/
│   ├── useProperties.ts    # Cached fetch of filter options (test/prod)
│   └── use-toast.ts
├── lib/
│   ├── utils.ts
│   └── supabaseClient.ts   # Supabase browser client + env helpers
└── data/
    └── mockData.ts         # employmentTypes, seniorities (fallbacks)
```

---

## Prerequisites

- **Node.js** (LTS recommended) and **npm**
- Backend API for resources search, properties, chatbot, and dataset refresh (see API section below)

---

## Getting started

### 1. Clone and install

```bash
git clone <repository-url>
cd talent-finder-pro-frontend
npm install
```

### 2. Environment

Create `.env.local` (see [`.env.example`](.env.example)):

```bash
# API (optional — defaults to http://192.168.20.70:5678 if unset)
VITE_API_BASE_URL=https://your-api-host.example.com

# Supabase — required for sign-in (Project Settings → API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read at **build time** and bundled into the client (standard for Supabase SPAs). The **anon** key is public; protect data with [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) in Supabase.

### 3. Run development server

```bash
npm run dev
```

App runs at **http://localhost:8080** (or the host shown in the terminal).

### 4. Login

Create a user in **Supabase → Authentication → Users** (with Email provider enabled), then sign in on `/login` with that **email** and password. Sessions refresh automatically via the Supabase client.

---

## Scripts

| Command           | Description |
|-------------------|-------------|
| `npm run dev`     | Start Vite dev server (port 8080) |
| `npm run build`   | Writes CI `VITE_*` to `.env.production.local`, then production build |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint |

---

## API integration

The app expects a backend that provides:

| Purpose           | Mode   | Endpoint (relative to `BASE_URL`) |
|-------------------|--------|-----------------------------------|
| Resource search   | Prod   | `POST /webhook/api/resources/search` |
| Resource search   | Test   | `POST /webhook-test/api/resources/search` |
| Filter options   | Prod   | `GET /webhook/resourcing_get_properties` |
| Filter options   | Test   | `GET /webhook-test/resourcing_get_properties` |
| Chatbot          | Prod   | `POST /webhook/resourcing_chatbot` (or `/resourcing_chatbot`) |
| Chatbot          | Test   | `POST /webhook-test/resourcing_chatbot` (or others, see `chatbotApi.ts`) |
| Dataset refresh  | Prod   | `POST /webhook/resources_refresh_dataset` |
| Dataset refresh  | Test   | `POST /webhook-test/resources_refresh_dataset` |

- **BASE_URL** is set in `src/services/apiConfig.ts`: `VITE_API_BASE_URL` or default `http://192.168.20.70:5678`.
- Requests send `ngrok-skip-browser-warning: true` for compatibility with ngrok.

---

## Main UI flows

1. **Login** → Email + password (Supabase) → redirect to `/`.
2. **Hub (`/`)** → Set filters in sidebar, optional free-text search, sort and view toggle → results in grid or list; click resource for detail modal; use chatbot or “Refresh dataset” as needed.
3. **Analytics (`/analytics`)** → Summary cards and tabs: Skills (bar chart + heatmap), Certificates, Industries (pie + list), Workforce (employment, seniority, roles).

---

## Deployment

- **Build:** `npm run build` → output in `dist/`.
- **Preview:** `npm run preview` to test the built app locally.
- For production, serve `dist/` with a static host (e.g. Nginx, Vercel, Netlify). Ensure `VITE_API_BASE_URL` is set at build time for the correct API.

### AWS Amplify Hosting

The repo includes everything Amplify needs:

| Item | Role |
|------|------|
| [`amplify.yml`](amplify.yml) | `npm ci` → `npm run build`, publish `dist/`, cache `node_modules` |
| [`.nvmrc`](.nvmrc) | Node **20** for the Amplify build (`nvm install` / `nvm use`) |
| [`public/_redirects`](public/_redirects) | SPA **200 rewrite** to `index.html` so React Router routes work on refresh |
| [`.env.example`](.env.example) | Documents `VITE_API_BASE_URL` and Supabase |

**Amplify Console checklist**

1. Connect the Git repo; Amplify picks up `amplify.yml` automatically.
2. Under **Environment variables**, set **`VITE_API_BASE_URL`**, **`VITE_SUPABASE_URL`**, and **`VITE_SUPABASE_ANON_KEY`**. Redeploy after changes — Vite inlines env at build time.
3. Ensure your API allows **CORS** from your Amplify domain (and custom domain if used). Avoid **HTTP** APIs from an **HTTPS** Amplify site (mixed content).

Full step-by-step: [`docs/deployment-aws-amplify.md`](docs/deployment-aws-amplify.md).

---

## License and attribution

- **Title / meta:** Resourcing Hub – Find the Right Talent.
- **Author / OG:** Lovable (see `index.html`). Adjust meta and author as needed for your organization.
