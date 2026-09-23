# Bhumi Setu Rigorous Testing Guide

This guide tests the current Bhumi Setu prototype end to end on Windows.

It covers:

- Backend startup and health
- Frontend startup and production build
- Existing dashboard, projects, GIS, workflow, and Compensation Intelligence modules
- Existing Gemini document-intelligence routes
- MongoDB and in-memory fallback behavior
- Negative/error-path testing
- Regression checks

The existing GIS and Compensation Intelligence modules must remain functional throughout testing.

---

## 1. Safety and rollback

These instructions do not create commits or rewrite Git history.

Before testing, check the current worktree:

```powershell
git status --short
```

If you want a recovery point before making local edits:

```powershell
git branch backup-before-testing
```

To discard only the current uncommitted changes later, review first:

```powershell
git diff --stat
git diff
```

Do not use `git reset --hard` unless you intentionally want to discard all uncommitted work.

---

## 2. Prerequisites

Install or confirm:

- Node.js 18 or newer
- npm
- Git
- A modern browser
- Optional: MongoDB, if persistent claim verification is required
- Optional: Gemini API key

Check versions:

```powershell
node --version
npm --version
git --version
```

The repository has two separate Node projects:

```text
backend\
frontend\
```

Install dependencies:

```powershell
Set-Location .\backend
npm install

Set-Location ..\frontend
npm install

Set-Location ..
```

---

## 3. Configure backend environment variables

Create the local backend environment file if it does not exist:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

Edit `backend\.env`.

Minimum local configuration:

```text
PORT=5001
```

Optional Gemini configuration:

```text
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_FALLBACK_MODELS=gemini-2.5-flash,gemini-2.5-flash-lite
```

Optional MongoDB configuration:

```text
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=land_acquisition
```

### Credential safety

- Never put AI keys in `frontend\.env`.
- Never use `VITE_GEMINI_API_KEY`.
- Never commit `backend\.env`.
- Do not paste API tokens into screenshots, issue comments, or logs.
- If a secret is exposed, revoke it immediately and create a replacement.

---

## 4. Start the backend

Open PowerShell window 1:

```powershell
Set-Location C:\Users\VISHAL\Desktop\Land_Acquisition\backend
npm run dev
```

Expected output:

```text
Land Acquisition API running on http://localhost:5001
```

If MongoDB is not running, this is acceptable for the prototype. The backend should report an in-memory fallback for claim verification.

Keep this terminal running.

---

## 5. Backend smoke tests

Open PowerShell window 2.

### 5.1 Health check

```powershell
Invoke-RestMethod http://localhost:5001/api/health | ConvertTo-Json
```

Expected:

- `status` is `ok`
- A current `timestamp` is returned

### 5.2 Dashboard

```powershell
$dashboard = Invoke-RestMethod http://localhost:5001/api/dashboard
$dashboard.summary | ConvertTo-Json
```

Verify that the response contains:

- `totalProjects`
- `landProposed`
- `landAcquired`
- `compensationAssessed`
- `compensationDisbursed`
- `affectedFamilies`
- `stateBreakdown`

### 5.3 Projects

```powershell
$projects = Invoke-RestMethod http://localhost:5001/api/projects
$projects.projects.Count
$projects.projects[0] | ConvertTo-Json -Depth 5
```

Expected:

- Multiple projects are returned.
- Every project has an `id`, `name`, `status`, `progress`, and `riskScore`.

### 5.4 Project and parcel endpoints

Use an ID from the previous command:

```powershell
$projectId = $projects.projects[0].id
$project = Invoke-RestMethod "http://localhost:5001/api/projects/$projectId"
$parcels = Invoke-RestMethod "http://localhost:5001/api/projects/$projectId/parcels"

$project.project | ConvertTo-Json -Depth 5
$parcels.parcels[0] | ConvertTo-Json -Depth 8
```

Verify:

- The project response contains the selected project.
- The parcel response contains at least one parcel.
- Parcels include geometry or `leafletCoordinates`.
- Parcels include compensation and possession fields.

### 5.5 Map endpoint

```powershell
$map = Invoke-RestMethod http://localhost:5001/api/map
$map.parcels.Count
$map.parcels[0] | ConvertTo-Json -Depth 8
```

Verify:

- Multiple parcels are returned.
- Parcel geometry is present.
- Parcel coordinates are valid numeric values.

### 5.6 Intelligence summary

```powershell
Invoke-RestMethod http://localhost:5001/api/intelligence | ConvertTo-Json -Depth 8
```

Verify that the response contains:

- `risk`
- `alerts`
- `documents`
- `today.projectsRequiringAttention`
- `today.recordDiscrepancies`
- `today.rnrCasesRequiringReview`

---

## 6. Compensation Intelligence API tests

The compensation calculation is deterministic. AI only interprets the result; it must not change the calculation.

### 6.1 Valid calculation

```powershell
$calculationBody = @{
  projectId = "NHSRCL-MAHSR"
  parcelId = "PAR-1000"
  area = @{
    value = 2.6
    unit = "hectare"
  }
  marketRate = 1800000
  marketRateUnit = "INR/hectare"
  locality = "rural"
  cropsValue = 220000
  livelihoodAmount = 180000
  displacement = $true
  livelihoodImpact = $true
  notificationDate = "2025-01-15"
  awardDate = "2026-08-14"
} | ConvertTo-Json -Depth 5

$calculationResponse = Invoke-RestMethod `
  -Uri http://localhost:5001/api/compensation/calculate `
  -Method Post `
  -ContentType "application/json" `
  -Body $calculationBody

$calculationResponse.calculation | ConvertTo-Json -Depth 10
```

Verify:

- `status` is `PRELIMINARY_RULE_BASED`.
- `normalized.areaHectares` is present.
- `breakdown.total` is numeric.
- `rules.version` and `rules.source` are present.
- `auditNotes` are present.
- The disclaimer says the result is preliminary and requires authority review.

### 6.2 Invalid calculation

```powershell
$invalidBody = @{
  locality = "unknown"
  marketRate = 1000
} | ConvertTo-Json

try {
  Invoke-RestMethod `
    -Uri http://localhost:5001/api/compensation/calculate `
    -Method Post `
    -ContentType "application/json" `
    -Body $invalidBody `
    -ErrorAction Stop
} catch {
  $_.ErrorDetails.Message
}
```

Expected:

- HTTP 422
- A useful `message`
- No fabricated calculation

### 6.3 AI interpretation

```powershell
$analysisBody = @{
  calculation = $calculationResponse.calculation
} | ConvertTo-Json -Depth 20

try {
  $analysisResponse = Invoke-RestMethod `
    -Uri http://localhost:5001/api/compensation/analyze `
    -Method Post `
    -ContentType "application/json" `
    -Body $analysisBody

  $analysisResponse | ConvertTo-Json -Depth 10
} catch {
  $_.ErrorDetails.Message
}
```

Verify:

- `calculation.breakdown.total` is unchanged.
- An `insight` object is returned.
- If AI is unavailable, the response is clearly labeled as a deterministic fallback.
- No AI response changes the financial values.

### 6.4 Save and retrieve assessment

```powershell
$assessmentBody = @{
  projectId = "NHSRCL-MAHSR"
  parcelId = "PAR-1000"
  calculation = $calculationResponse.calculation
  insight = $analysisResponse.insight
} | ConvertTo-Json -Depth 20

$saved = Invoke-RestMethod `
  -Uri http://localhost:5001/api/compensation/assessments `
  -Method Post `
  -ContentType "application/json" `
  -Body $assessmentBody

$saved.assessment.assessmentId

Invoke-RestMethod `
  "http://localhost:5001/api/compensation/assessments/$($saved.assessment.assessmentId)" `
  | ConvertTo-Json -Depth 10
```

Expected:

- An assessment ID such as `ASM-0001`.
- The assessment can be read back while the backend process remains running.
- The response identifies the current prototype persistence behavior.

Restarting the backend currently clears these compensation assessments because they are stored in memory.

---

## 7. Existing document-intelligence tests

Demo documents are available in:

```text
backend\demo-docs\award-demo.pdf
backend\demo-docs\compensation-demo.pdf
backend\demo-docs\rr-demo.pdf
```

### 7.1 Award analysis

```powershell
$award = Invoke-RestMethod `
  -Uri http://localhost:5001/api/intelligence/award `
  -Method Post `
  -Form @{ document = Get-Item .\backend\demo-docs\award-demo.pdf }

$award | ConvertTo-Json -Depth 12
```

### 7.2 Compensation ledger analysis

```powershell
$compensation = Invoke-RestMethod `
  -Uri http://localhost:5001/api/intelligence/compensation `
  -Method Post `
  -Form @{ document = Get-Item .\backend\demo-docs\compensation-demo.pdf }

$compensation | ConvertTo-Json -Depth 12
```

### 7.3 R&R checklist analysis

```powershell
$rnr = Invoke-RestMethod `
  -Uri http://localhost:5001/api/intelligence/rnr `
  -Method Post `
  -Form @{ document = Get-Item .\backend\demo-docs\rr-demo.pdf }

$rnr | ConvertTo-Json -Depth 15
```

Verify for each:

- A document type is returned.
- Extracted data is present.
- A matched record or clear discrepancy is returned.
- Recommendations are present.
- Any fallback/demo output is clearly marked in backend logs or response data.

If the PowerShell version does not support `-Form`, use the browser UI at `/compensation` for the existing module, or use `curl.exe`:

```powershell
curl.exe -X POST `
  -F "document=@backend/demo-docs/award-demo.pdf" `
  http://localhost:5001/api/intelligence/award
```

---

## 8. Claim verification workflow

This is the existing multilayer verification route.

### 8.1 Matching case

```powershell
curl.exe -X POST `
  -F "documents=@backend/demo-docs/award-demo.pdf" `
  -F 'claim={"parcelId":"PAR-1000","surveyNumber":"","demoCase":"matching"}' `
  http://localhost:5001/api/claims/verify
```

Save the returned `claimId`.

Verify the response contains:

- `claimId`
- `workflowStatus`
- `conflicts`
- `fieldComparisons`
- `integrityIndicators`
- `graph`
- `report`

### 8.2 Owner mismatch

```powershell
curl.exe -X POST `
  -F "documents=@backend/demo-docs/award-demo.pdf" `
  -F 'claim={"parcelId":"PAR-1000","demoCase":"owner-mismatch"}' `
  http://localhost:5001/api/claims/verify
```

Expected:

- A conflict with type `owner-mismatch`.
- High-severity/manual-review behavior.
- The report does not declare legal ownership or forgery.

### 8.3 Area and mutation mismatch

```powershell
curl.exe -X POST `
  -F "documents=@backend/demo-docs/award-demo.pdf" `
  -F 'claim={"parcelId":"PAR-1000","demoCase":"area-mutation-mismatch"}' `
  http://localhost:5001/api/claims/verify
```

Expected:

- Area or mutation conflict.
- Review-required workflow status.

### 8.4 Internal inconsistency

```powershell
curl.exe -X POST `
  -F "documents=@backend/demo-docs/award-demo.pdf" `
  -F "documents=@backend/demo-docs/compensation-demo.pdf" `
  -F 'claim={"parcelId":"PAR-1000","demoCase":"internal-inconsistency"}' `
  http://localhost:5001/api/claims/verify
```

Expected:

- `internal-inconsistency` conflict.
- Multiple extracted documents.
- Claim graph includes a conflict node.

### 8.5 Retrieve a claim

Replace `CLM_ID_FROM_RESPONSE`:

```powershell
Invoke-RestMethod `
  http://localhost:5001/api/claims/CLM_ID_FROM_RESPONSE `
  | ConvertTo-Json -Depth 15
```

If MongoDB is not configured, retrieval works only while the backend process remains running.

---

## 9. Frontend testing

Open PowerShell window 3:

```powershell
Set-Location C:\Users\VISHAL\Desktop\Land_Acquisition\frontend
npm run dev
```

Open the URL shown by Vite, commonly:

```text
http://localhost:5173
```

### 9.1 Role selection

Test:

1. Open `/`.
2. Select **Acquiring Authority**.
3. Confirm navigation to `/dashboard`.
4. Return to `/`.
5. Select **Administrator**.
6. Confirm navigation to `/dashboard`.
7. Select **Affected Landowner**.
8. Confirm the informational modal opens without claiming that the portal is implemented.

Important: this is currently UI navigation, not real authentication.

### 9.2 Dashboard

Open:

```text
/dashboard
```

Verify:

- Summary cards load.
- Project portfolio renders.
- Alerts render.
- Selecting a project updates the operational snapshot.
- Export creates a PDF.

### 9.3 Projects

Open:

```text
/projects
```

Verify:

- Multiple projects render.
- Status, risk, and progress are displayed.
- Selecting a project opens `/projects/:projectId`.

### 9.4 Project workspace

Verify:

- Project overview loads.
- Risk panel loads.
- Parcel watchlist loads.
- Lifecycle milestones render.

### 9.5 GIS Maps

Open:

```text
/map
```

Verify:

- The map loads without a blank panel.
- Parcel boundaries are visible.
- Standard, satellite, terrain, and topographic layers switch.
- Clicking a parcel opens the inspector.
- The map flies to the selected parcel.
- Parcel area, land type, acquisition, possession, compensation, and validation render.
- The project context and timeline render.
- No route/API error appears in the browser console.

### 9.6 Compensation Intelligence

Open:

```text
/compensation
```

Test:

1. Select a project.
2. Select a parcel.
3. Confirm parcel facts populate the form.
4. Click **Calculate preliminary estimate**.
5. Confirm deterministic breakdown and total appear.
6. Confirm applied rules and audit notes appear.
7. Confirm flags and resettlement considerations appear.
8. Confirm AI interpretation appears if a provider is configured.
9. Remove/disable AI credentials and repeat.
10. Confirm the deterministic result still works with labeled fallback decision support.
11. Click **Save assessment**.
12. Confirm an assessment ID appears.
13. Click **Print / export** and verify the print output is readable.

### 9.7 Workflow

Open:

```text
/workflow
```

Test every demo case:

- Matching record
- Owner mismatch
- Area + mutation mismatch
- Internal document inconsistency
- Duplicate acquisition signal

For every case:

1. Upload one or more demo documents.
2. Submit the claim.
3. Confirm the workflow result appears.
4. Confirm field comparisons render.
5. Confirm conflict classification renders.
6. Confirm the claim graph renders.
7. Confirm the verification report renders.

### 9.8 Legacy document intelligence

The current router redirects `/intelligence` to `/compensation`, even though `IntelligencePage.jsx` exists in the source tree.

Test the backend document routes directly using the commands in section 7.

Do not treat `/intelligence` as a working frontend route until routing is intentionally changed.

---

Expected:

- Provider selection is visible in `metadata.provider`.
- No fake extraction is returned when all providers fail.

---

## 10. MongoDB persistence test

This is optional.

If MongoDB is installed locally, start it using the normal service/command for your installation.

Confirm the backend logs:

```text
[MongoDB] Connected to land_acquisition.
```

Run the claim verification test from section 9.

Stop and restart the backend, then retrieve the same claim:

```powershell
Invoke-RestMethod `
  http://localhost:5001/api/claims/CLAIM_ID_FROM_RESPONSE `
  | ConvertTo-Json -Depth 15
```

Expected with MongoDB:

- The claim remains available after backend restart.
- Persistence metadata identifies MongoDB.

Expected without MongoDB:

- Backend explicitly reports in-memory fallback.
- The claim is lost after backend restart.

---

## 11. Regression checklist

Run this checklist after every future change:

- [ ] `GET /api/health` returns `status: ok`.
- [ ] `/dashboard` loads.
- [ ] `/projects` loads.
- [ ] A project workspace opens.
- [ ] `/map` renders parcel geometry.
- [ ] Parcel inspector opens.
- [ ] `/compensation` calculates a deterministic result.
- [ ] Compensation rules and audit notes appear.
- [ ] Compensation save/retrieve works during the same backend session.
- [ ] `/workflow` verifies a matching claim.
- [ ] `/workflow` detects an owner mismatch.
- [ ] Existing `/api/intelligence/award` still accepts the demo PDF.
- [ ] Existing `/api/intelligence/compensation` still accepts the demo PDF.
- [ ] Existing `/api/intelligence/rnr` still accepts the demo PDF.
- [ ] Unsupported uploads are rejected.
- [ ] Files above 10 MB are rejected.
- [ ] No secret appears in frontend files, browser network payloads, or logs.
- [ ] Frontend lint passes.
- [ ] Frontend production build passes.
- [ ] Backend JavaScript syntax checks pass.

---

## 12. Automated local validation commands

### Backend syntax

From the repository root:

```powershell
Get-ChildItem -Path .\backend -Recurse -Filter *.js |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' } |
  ForEach-Object { node --check $_.FullName }
```

Expected: no syntax errors.

### Frontend lint

```powershell
Set-Location .\frontend
npm run lint
Set-Location ..
```

### Frontend build

```powershell
Set-Location .\frontend
npm run build
Set-Location ..
```

Expected:

- Build succeeds.
- A chunk-size warning may appear; it is currently non-blocking.

---

## 13. Troubleshooting

### `Failed to fetch` in the frontend

Check:

1. Backend is running on port 5001.
2. `frontend/src/config.js` points to `http://localhost:5001/api` during development.
3. Open `http://localhost:5001/api/health` directly.
4. Check the browser Network tab.

### Port 5001 is already in use

Find the process:

```powershell
Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue
```

Stop only the specific process if required:

```powershell
Stop-Process -Id PROCESS_ID
```

Alternatively, change `PORT` in `backend\.env` and update the frontend API URL for local testing.

### AI endpoint returns HTTP 503

Check:

1. `backend\.env` has valid credentials.
3. The backend was restarted after changing `.env`.
5. Gemini key has access to the configured model.
6. Backend logs for provider-specific errors.

### AI endpoint returns HTTP 422

Check:

- `documentText` is not empty, or
- a PDF/JPG/PNG is uploaded using the field name `document`.

### MongoDB fallback appears

This is expected when:

- `MONGODB_URI` is not configured, or
- MongoDB is not running, or
- MongoDB cannot be reached within the startup timeout.

Claim verification can still be tested in memory.

### Map is blank

Check:

- Browser has network access to map tile providers.
- Browser console for Leaflet errors.
- `/api/map` returns parcel geometry.
- The frontend is not blocking external tile requests.

### Frontend build fails after a change

Run:

```powershell
Set-Location .\frontend
npm install
npm run lint
npm run build
```

Read the first error, fix the source issue, and rerun the same command.

---

## 14. Suggested test evidence to capture

For a serious demonstration or SIH review, capture:

- Backend health response
- Dashboard loaded with project metrics
- GIS map with selected parcel inspector
- Compensation calculation breakdown
- Claim verification with an owner mismatch
- Document-intelligence response
- New extraction endpoint response with provider metadata
- Audit/disclaimer text showing AI is advisory
- Frontend build and lint output

Do not capture or publish:

- API keys
- Authorization headers
- `.env` contents
- Personal data from real documents
- Unredacted private land records

---

## 15. Definition of a successful test run

A test run is successful when:

1. Backend starts without a fatal error.
2. Health, dashboard, project, parcel, and map APIs respond.
3. The GIS frontend displays parcel geometry and inspection details.
4. Compensation calculations remain deterministic and explainable.
5. Existing document-intelligence routes still work.
6. Claim verification detects both matching and conflicting cases.
7. The new AI extraction route returns normalized, evidence-aware output when a provider is configured.
8. The new AI extraction route fails explicitly and safely when no provider is configured.
9. Frontend lint and build pass.
10. No secret is exposed in source, browser code, or logs.
