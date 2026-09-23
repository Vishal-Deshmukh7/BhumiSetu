# Redeployment Guide — BHUMISETU

> Step-by-step instructions to push changes and redeploy the live app on Render (backend) and Vercel (frontend).

---

## What Changed

These files were modified or added. You need to push them to GitHub so Render and Vercel pick up the changes.

### Modified Files (changes to existing code)

```
backend/.env.example              — Added LANDOWNER_OPENROUTER_MODEL with fallback
backend/server.js                 — Added auth route import and mount
backend/data/landownerData.js     — Restructured: 2 user profiles, Kudankulam data added
backend/routes/landowner.js       — Added auth middleware, user-based data filtering
backend/services/ai/landownerAiService.js — Model fallback array, improved system prompts
frontend/src/App.jsx              — Route isolation (admin vs landowner), added login route
frontend/src/pages/landowner/LandownerLayout.jsx — Auth protection, redirect to login
frontend/src/pages/RoleSelectionPage.jsx — Landowner goes to /landowner/login
```

### New Files (added to project)

```
backend/routes/auth.js                         — Login + session validation endpoints
frontend/src/context/LandownerAuthContext.jsx   — Auth state management
frontend/src/pages/landowner/LandownerLogin.jsx — Login page
DEPLOYMENT.md                                  — This file
```

### Unused Files (kept but not imported)

```
frontend/src/components/CardNav.jsx  — Not used anywhere
frontend/src/components/CardNav.css  — Not used anywhere
```

---

## Step 1: Push to GitHub

Open a terminal in your project root and run these commands one by one:

```bash
# Check what changed
git status

# Stage all changed and new files
git add backend/.env.example backend/server.js backend/data/landownerData.js
git add backend/routes/landowner.js backend/routes/auth.js
git add backend/services/ai/landownerAiService.js
git add frontend/src/App.jsx
frontend/src/pages/landowner/LandownerLayout.jsx
frontend/src/pages/landowner/LandownerLogin.jsx
frontend/src/pages/RoleSelectionPage.jsx
frontend/src/context/LandownerAuthContext.jsx
git add DEPLOYMENT.md

# Commit with a message
git commit -m "Add landowner auth, route isolation, Kudankulam data, AI model fallback"

# Push to GitHub (do NOT force push)
git push origin main
```

**If you're on a different branch**, replace `main` with your branch name.

**Verify push worked:** Go to your GitHub repo in a browser and confirm the new files appear.

---

## Step 2: Render Auto-Deploys (Backend)

Render auto-deploys when it detects a push to your connected branch.

### Check if auto-deploy is enabled

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click on your backend service (the one running `node server.js`)
3. Go to **Settings** → **Build & Deploy**
4. Under **Auto Deploy**, make sure it says **Yes** and the branch is `main` (or your branch)

If auto-deploy is ON: Render will automatically start deploying when it sees your push. Go to the **Events** tab to watch the deploy progress.

If auto-deploy is OFF: Click **Manual Deploy** → **Deploy latest commit**.

### Verify Render deploy succeeded

1. Go to your service → **Logs** tab
2. Look for these lines (no errors):
   ```
   [MongoDB] Startup connection failed; using in-memory claim persistence.
   Land Acquisition API running on http://localhost:5001
   ```
3. Test the health endpoint in your browser:
   ```
   https://your-service-name.onrender.com/api/health
   ```
   Should return `{"status":"ok",...}`

4. Test the auth endpoint:
   ```
   https://your-service-name.onrender.com/api/landowner/auth/login
   ```
   This is a POST endpoint — you can't test it in the browser directly. It will return a 405 or 400, which is fine (it means the route exists and is working).

---

## Step 3: Update Render Environment Variables

Some environment variables may need to be added or updated.

### On Render Dashboard

1. Go to your backend service → **Environment** tab
2. Check if `LANDOWNER_OPENROUTER_API_KEY` exists. If not, add it:
   ```
   Key:   LANDOWNER_OPENROUTER_API_KEY
   Value: sk-or-v1-your_landowner_openrouter_key_here
   ```
3. Check if `LANDOWNER_OPENROUTER_MODEL` exists. If not, add it:
   ```
   Key:   LANDOWNER_OPENROUTER_MODEL
   Value: nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free,inclusionai/ling-3.0-flash-vl:free
   ```
4. Click **Save Changes**
5. Render will auto-restart the service

**Note:** `LANDOWNER_OPENROUTER_API_KEY` can be the same key as `OPENROUTER_API_KEY` if you only have one OpenRouter account. That's fine.

---

## Step 4: Update Vercel Environment Variables (Frontend)

### On Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your frontend project
3. Go to **Settings** → **Environment Variables**
4. Make sure this variable exists:
   ```
   Key:   VITE_API_BASE_URL
   Value: https://your-render-service-name.onrender.com/api
   ```
   **Important:** The URL must end with `/api` (no trailing slash). Replace `your-render-service-name` with your actual Render service name.

5. If you need to add or update it:
   - Click **Edit** on the existing variable, or **Add** if it doesn't exist
   - Set the value to your Render backend URL + `/api`
   - Make sure it's applied to **Production**, **Preview**, and **Development** environments
   - Click **Save**

### Trigger Vercel redeploy

Vercel also auto-deploys on push. Check:

1. Go to your Vercel project → **Deployments** tab
2. You should see a new deployment from your latest push
3. If not, go to **Settings** → **Git** and make sure **Auto-deploy** is enabled for your branch

If you need to manually trigger:
1. Go to **Deployments** tab
2. Click the three dots on the latest deployment → **Redeploy**

---

## Step 5: Verify Everything Works

Open your live Vercel URL in a browser.

### Test Admin Portal

1. Click **Acquiring Authority** or **Administrator** on the role selection page
2. Should go to `/dashboard` with the admin sidebar (green/forest theme)
3. Verify sidebar shows: Dashboard, Projects, GIS Map, Workflow, Compensation Intelligence
4. Should NOT show any landowner links (My Land, Proposals, Disputes, Documents, Contacts)

### Test Landowner Portal — Login

1. Go back to role selection (click "Exit to role selection" or go to `/`)
2. Click **Affected Landowner**
3. Should redirect to `/landowner/login` (login form, not dashboard)
4. Enter:
   - Username: `ramesh`
   - Password: `ramesh123`
5. Click **Sign in**
6. Should redirect to `/landowner/dashboard`

### Test Landowner Portal — Data Isolation

1. After logging in as Ramesh, verify:
   - Dashboard shows "Ramesh Vitthal Kelvekar"
   - Parcels: PAR-1000, PAR-1001, PAR-1010 (3 parcels)
   - Sidebar shows only: Dashboard, My Land, Proposals, Disputes, Documents, Contacts
   - Should NOT show any admin links (Projects, GIS Map, Workflow, Compensation Intelligence)

2. Sign out (click "Sign out" in sidebar)
3. Log in as Kudankulam:
   - Username: `kudankulam`
   - Password: `kudankulam123`
4. Verify:
   - Dashboard shows "Kudankulam Nuclear Power Project Units 3 & 4"
   - Parcels: PAR-2000, PAR-2001 (2 parcels, different from Ramesh)
   - Location: Kudankulam, Tirunelveli, Tamil Nadu

### Test Unauthenticated Access

1. Open an incognito/private browser window
2. Go to your Vercel URL + `/landowner/dashboard`
3. Should redirect to `/landowner/login` (not show the dashboard)

---

## Common Issues & Fixes

### "Login failed" or "Invalid credentials"

- Check that `LANDOWNER_OPENROUTER_API_KEY` is set in Render (needed for auth route to work)
- Verify the auth route is mounted: check Render logs for errors on startup

### Landowner dashboard shows no data

- Open browser DevTools (F12) → **Network** tab
- Click on any API request to `/api/landowner/dashboard`
- Check the **Response** — if it says "Authentication required", the token isn't being sent
- Make sure you're logged in (check if sidebar shows your name at the bottom)

### Admin portal shows landowner links (or vice versa)

- This means the old code is cached. Hard refresh:
  - Windows/Linux: `Ctrl + Shift + R`
  - Mac: `Cmd + Shift + R`
- If still broken, check that the Vercel deployment picked up the latest commit

### Vercel shows old version

1. Go to Vercel → Deployments
2. Check if the latest deployment matches your latest commit
3. If not, the deploy may have failed — check the build logs
4. If build failed, check for missing `VITE_API_BASE_URL`

### Render keeps restarting

- Check logs for startup errors
- Common: missing required environment variable
- The app should start even without MongoDB (falls back to in-memory)

### CORS errors in browser console

- Your Vercel frontend URL must be allowed by the backend
- Current setup uses `cors()` with no restrictions, so this shouldn't happen
- If you added custom CORS config, make sure your Vercel URL is in the allowed list

---

## If You Need to Roll Back

If something breaks after deploying:

### On Render
1. Go to your service → **Events** tab
2. Find the last working deploy
3. Click **Rollback to this deploy**

### On Vercel
1. Go to your project → **Deployments** tab
2. Find the last working deployment
3. Click the three dots → **Promote to Production**

### On GitHub
```bash
# See recent commits
git log --oneline -5

# Revert to previous commit (replace abc123 with the hash)
git revert abc123

# Push the revert
git push origin main
```

Render and Vercel will auto-deploy the reverted code.

---

## Quick Reference — URLs

| Service | URL | What it runs |
|---------|-----|-------------|
| Backend (Render) | `https://your-service.onrender.com` | Express API |
| Frontend (Vercel) | `https://your-project.vercel.app` | React app |
| Health check | `https://your-service.onrender.com/api/health` | Should return `{"status":"ok"}` |
| Login endpoint | `POST https://your-service.onrender.com/api/landowner/auth/login` | Body: `{"username":"ramesh","password":"ramesh123"}` |

Replace `your-service` and `your-project` with your actual Render/Vercel names.
