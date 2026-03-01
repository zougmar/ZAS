# ZAS – Vercel deployment guide

One project: **frontend** (React + Vite, static) + **backend** (Node + Express, serverless).

---

## 1. Prerequisites

- GitHub repo: https://github.com/zougmar/ZAS
- MongoDB Atlas cluster (for production DB)
- Vercel account

---

## 2. Environment variables (Vercel)

In **Vercel Dashboard** → your project → **Settings** → **Environment Variables**, add:

| Name | Value | Notes |
|------|--------|--------|
| `MONGODB_URI` | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority` | From Atlas: Connect → Connect your application. Use a DB user (not your Atlas login). |
| `JWT_SECRET` | A long random string (e.g. 32+ chars) | Generate with `openssl rand -hex 32` or similar. Same value for all environments. |
| `NODE_ENV` | `production` | Optional; Vercel often sets this. |

Apply to **Production** (and Preview if you want same behavior for PR previews).

**MongoDB Atlas**

- **Network Access**: Add IP **0.0.0.0/0** (Allow from anywhere) so Vercel’s IPs can connect.
- **Region**: Prefer a region close to your Vercel region (e.g. same as in Vercel project settings) to reduce latency and timeouts.

---

## 3. Deploy from GitHub

1. Go to [vercel.com](https://vercel.com) and sign in (with GitHub if the repo is on GitHub).
2. **Add New…** → **Project**.
3. **Import** the `zougmar/ZAS` repository.
4. **Configure Project**:
   - **Framework Preset**: Other (do not choose Vite or Next.js).
   - **Root Directory**: `./` (repo root).
   - **Build Command**: leave as is (uses `vercel.json`: `npm run build`).
   - **Output Directory**: leave as is (uses `vercel.json`: `frontend/dist`).
   - **Install Command**: leave as is (uses `vercel.json`: `npm install && cd backend && npm install`).
5. Add the environment variables from the table above (or link an env file; do not commit secrets).
6. Click **Deploy**.

Vercel will:

- Run `installCommand` (root + backend deps).
- Run `buildCommand` → `npm run build` → build frontend to `frontend/dist`.
- Deploy `frontend/dist` as static assets.
- Deploy `api/` as serverless functions (`api/index.js` = Express, `api/ping.js` = lightweight ping).

---

## 4. After deploy

- **App URL**: `https://<project>.vercel.app`  
  - `/` → SPA (React).  
  - `/api/*` → Express API (e.g. `/api/auth/login`, `/api/classes`).  
  - `/api/ping` → lightweight health check (no DB).
- **Logs**: Vercel Dashboard → **Deployments** → select deployment → **Functions** / **Logs** to debug API or build issues.

---

## 5. Optional: frontend env (different API URL)

If you later serve the frontend from another domain and need to point it at a different API:

- In Vercel: add **Environment Variable** `VITE_API_URL` = full API base URL (e.g. `https://<project>.vercel.app/api`).
- Rebuild/redeploy so the frontend is built with that value.

If `VITE_API_URL` is not set, the app uses relative `/api` (same origin), which is correct for this single-project setup.

---

## 6. Config summary

- **vercel.json**: build command, output directory, install command, rewrites (`/api/*` → API, `/*` → SPA), function timeouts (ping 5s, API 60s).
- **Root package.json**: `build` and `vercel-build` run frontend build.
- **Backend**: Uses `PORT` from env when running locally; on Vercel it runs as serverless (no listen). CORS allows same-origin and credentials; no hardcoded production URLs.
- **Frontend**: `src/utils/api.js` uses `VITE_API_URL` or `/api`; no localhost in production build.

---

## 7. Troubleshooting

| Issue | What to check |
|-------|----------------|
| 504 on `/api/*` | Function timeout (60s). Check MongoDB Atlas region and 0.0.0.0/0. Ensure `MONGODB_URI` and `JWT_SECRET` are set. |
| 503 “Database not configured” | `MONGODB_URI` missing or contains `localhost`. Set a real Atlas URI in Vercel. |
| SPA 404 on refresh | Rewrites must have `/(.*)` → `/index.html` after `/api` rules. Confirm `vercel.json` rewrites order. |
| CORS errors | Backend uses `cors({ origin: true, credentials: true })`. If frontend is on another domain, set `VITE_API_URL` to the full API URL and ensure that origin is allowed (or keep same-origin deployment). |
