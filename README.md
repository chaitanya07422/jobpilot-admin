# JobPilot Admin

Internal admin portal for managing the JobPilot job catalog.

## Local setup

```bash
cd jobpilot-admin
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5174**

## Environment

```env
VITE_API_URL=http://localhost:3000
# Optional local dev only — pre-fills login form (do NOT set in production builds)
VITE_ADMIN_API_KEY=dev-admin-key-change-in-production
```

Backend must have matching `ADMIN_API_KEY` and `ADMIN_FRONTEND_URL=http://localhost:5174`.

## Deploy (Cloudflare Pages)

1. Push this folder to GitHub (`jobpilot-admin` repo).
2. Cloudflare Pages → Create project → Connect repo.
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Environment variables:
   - `VITE_API_URL=https://jobpilot-api.duckdns.org`
   - **Do not** set `VITE_ADMIN_API_KEY` in production.
5. Add custom domain e.g. `admin.yourdomain.com`.

On the API VM `.env`:

```env
ADMIN_API_KEY=<strong-random-secret>
ADMIN_FRONTEND_URL=https://admin.yourdomain.com
```

## Features

- Admin API key login
- List / filter jobs
- Add, edit, close, delete jobs
- Seed sample jobs (`scripts/data/seed-jobs.json` on API server)
