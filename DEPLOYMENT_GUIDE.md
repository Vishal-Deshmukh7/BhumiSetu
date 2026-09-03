# BHUMISETU Deployment Guide

This project has two deployable parts:

- **Frontend:** React/Vite application deployed on Vercel.
- **Backend:** Express API deployed on Render.

The frontend must call the public Render API URL after deployment. Never put `GEMINI_API_KEY` in the frontend or in Vercel.

## Data sources and demo boundaries

The mock adapter in `backend/data/mockData.js` contains seven identifiable
public infrastructure projects with links to their government or implementing
agency sources. Project identity, broad scope, location and agency are public
metadata. Parcel ownership, title references, boundaries, progress, risk,
compensation and R&R figures are explicitly synthetic demonstration records;
they must not be treated as legal, cadastral or payment records. A production
deployment should replace this adapter with the authorised records/MongoDB
integration without exposing ownership data to the browser beyond the
approved API contract.

Parcel detail endpoints are available at:

- `GET /api/parcels/:parcelId`
- `GET /api/parcels/:parcelId/context`

The context response combines the synthetic parcel with its public project
metadata, acquisition timeline and operational dependency for the inspector.

## 1. Before deployment

1. Create a GitHub repository.
2. Open the project folder in VS Code.
3. Check that `backend/.env` is not committed. It is ignored by `backend/.gitignore`.
4. Do not commit real API keys.
5. In `backend/.env.example`, keep only placeholder values.
6. Push the project to GitHub:

```powershell
git init
git add .
git commit -m "Prepare BHUMISETU for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## 2. Deploy the backend on Render

1. Go to https://render.com and create an account.
2. Click **New +** in the dashboard.
3. Select **Web Service**.
4. Connect GitHub and select this repository.
5. Configure the service:
   - **Name:** `bhumisetu-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free for testing
6. Open **Environment Variables** and click **Add Environment Variable**:
   - `GEMINI_API_KEY` = your real Gemini API key
   - `GEMINI_MODEL` = the model that is enabled for your key
   - `GEMINI_FALLBACK_MODELS` = comma-separated enabled fallback models, for example `gemini-1.5-flash-8b,gemini-1.5-pro`
   - `PORT` = `10000`
7. Click **Create Web Service**.
8. Wait until Render shows **Live**.
9. Copy the Render URL, for example:

```text
https://bhumisetu-api.onrender.com
```

10. Test the backend in a browser:

```text
https://bhumisetu-api.onrender.com/api/health
```

You should see a JSON response with `"status":"ok"`.

## 3. Deploy the frontend on Vercel

1. Go to https://vercel.com and create an account.
2. Click **Add New...** and select **Project**.
3. Import the same GitHub repository.
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Expand **Environment Variables**.
6. Add:

```text
Name: VITE_API_BASE_URL
Value: https://bhumisetu-api.onrender.com/api
```

7. Click **Deploy**.
8. Open the Vercel URL after the deployment completes.

## 4. Test the live website

Open each route:

- `/`
- `/projects`
- `/map`
- `/workflow`
- `/compensation`
- `/intelligence`

Then verify:

1. The dashboard loads project data.
2. Project cards open correctly.
3. The GIS map loads parcel geometry and tiles.
4. Compensation Intelligence loads project and synthetic parcel records, calculates a preliminary estimate and saves an assessment.
5. The legacy Intelligence page can still upload a PDF when document reconciliation is needed.
6. Gemini output appears in the Render service logs when the API call succeeds.
7. If Gemini is unavailable or rate-limited, deterministic calculation and a labelled fallback insight still appear.
8. Print / export on the Compensation Intelligence assessment produces a readable browser printout.

## 5. View Gemini logs on Render

1. Open Render dashboard.
2. Click the backend service.
3. Click **Logs** in the left navigation.
4. Upload a document from the live Vercel site.
5. Look for:

```text
[Gemini] Attempting live extraction
[Gemini] Raw API response:
[Gemini] Live extraction succeeded
```

When the configured model is rate-limited, the backend tries each enabled fallback model in order and logs the switch. If all models fail, fallback output is marked with:

```text
[Gemini] API error
[Gemini] Using fallback synthetic extraction
```

The fallback list must contain models enabled for the same Gemini API key. Model switching cannot bypass a key-wide quota or billing limit; it only handles model-specific limits and temporary model failures.

## 6. Updating the deployed app

After making a code change:

```powershell
git add .
git commit -m "Update BHUMISETU"
git push
```

Vercel and Render automatically redeploy when the connected GitHub branch changes.

If only an environment variable changes:

- In Render, edit the backend environment variable and click **Save Changes**.
- In Vercel, edit `VITE_API_BASE_URL`, then trigger **Redeploy**.

## 7. Important security rules

- Never upload `.env` to GitHub.
- Never set `GEMINI_API_KEY` in Vercel.
- Never use `VITE_GEMINI_API_KEY`; Vite exposes variables beginning with `VITE_` to browser users.
- If a real key was ever committed or shared publicly, revoke it in Google AI Studio and create a replacement.
- Render logs can contain document extraction data. Use test documents during demonstrations and restrict dashboard access.

## 8. Common beginner problems

### Frontend says “failed to fetch”

Check that:

1. The Render service is **Live**.
2. `VITE_API_BASE_URL` ends with `/api`.
3. The Vercel deployment was redeployed after adding the variable.
4. Opening `https://YOUR-RENDER-URL/api/health` works.

### Render deployment fails

Check:

- Root Directory is `backend`.
- Start Command is `npm start`.
- `backend/package.json` exists.

### Gemini uses fallback

Open Render logs. A `429 Too Many Requests` response means the key is recognized but the Gemini quota or rate limit was reached. A missing-key message means `GEMINI_API_KEY` was not added to Render.

### Map tiles do not load

Check the browser network connection and confirm the map page has internet access to OpenStreetMap tile servers.
