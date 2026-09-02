# BHUMISETU Deployment Guide

This project has two deployable parts:

- **Frontend:** React/Vite application deployed on Vercel.
- **Backend:** Express API deployed on Render.

The frontend must call the public Render API URL after deployment. Never put `GEMINI_API_KEY` in the frontend or in Vercel.

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
- `/intelligence`
- `/documents`

Then verify:

1. The dashboard loads project data.
2. Project cards open correctly.
3. The GIS map loads parcel geometry and tiles.
4. The Intelligence page can upload a PDF.
5. Gemini output appears in the Render service logs when the API call succeeds.
6. If Gemini is unavailable or rate-limited, the fallback message appears in Render logs.
7. PDF export downloads successfully.

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

Fallback output is marked with:

```text
[Gemini] API error
[Gemini] Using fallback synthetic extraction
```

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
