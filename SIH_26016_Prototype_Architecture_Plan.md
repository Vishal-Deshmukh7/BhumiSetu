# SIH 2026 — Problem Statement 26016
# Real-Time National Land Acquisition & Management System
## Prototype Architecture & Implementation Plan

> **Prototype objective:** Build a convincing **50–60% vertical slice** of the proposed system.
>
> This is **not** the complete national platform and it is **not** intended to implement every workflow, government integration, legal process, or production-grade requirement in the prototype.
>
> The prototype must instead demonstrate one coherent end-to-end journey:
>
> **National monitoring → State/District → Project → Land Parcels → Acquisition Workflow → Documents → AI Validation → Risk/Decision Support → Audit Trail**
>
> The frontend is intentionally temporary in this phase. The backend, database, APIs, GIS data model, AI services, and demo data must be functional and stable so that a highly customized frontend can later be placed on top without redesigning the core system.

---

# 1. Prototype Philosophy

## What we are building

We are building a **working vertical slice of a National Land Acquisition Management + Decision Intelligence platform**.

The prototype should feel like a real government system, but its scope is deliberately constrained.

### We WILL demonstrate

- National/state/project-level monitoring
- Project acquisition lifecycle
- Land parcel records
- GIS/spatial visualization
- Compensation status
- Possession status
- R&R status
- Document management
- Role-based access
- AI-assisted document extraction/validation
- Data discrepancy detection
- Project risk scoring
- Delay/risk decision support
- Automated status/alert generation
- Audit logging
- API-first architecture
- Mock/sandbox integration adapters representing external government systems
- Realistic synthetic data

### We WILL NOT implement in the prototype

- Every legal acquisition procedure
- Every state-specific workflow
- Actual production access to government databases
- Aadhaar/identity integrations
- Real banking/payment integration
- Complete national cadastral integration
- Full mobile application
- Every possible government portal integration
- Advanced nationwide predictive ML
- Blockchain
- A complete enterprise document-management suite
- Every administrative role and permission combination

Those belong to the **production roadmap**, not the SIH prototype.

---

# 2. The Core Demo Story

The entire prototype should be designed around one continuous story.

### Demo flow

```text
National Dashboard
       ↓
Select Maharashtra
       ↓
Select District
       ↓
Open Project
       ↓
View Acquisition Progress
       ↓
Open GIS Parcel
       ↓
Inspect Parcel / Compensation / Possession / R&R
       ↓
Open Project Documents
       ↓
Upload or process a sample acquisition document
       ↓
AI extracts structured information
       ↓
AI compares extracted information with existing parcel/land-record data
       ↓
A discrepancy is detected
       ↓
System creates a verification issue
       ↓
Project risk score is recalculated
       ↓
Decision-support panel explains major risk factors
       ↓
Officer takes/records an action
       ↓
Audit log records the event
```

This is the **single most important design principle** for the prototype.

We are not trying to prove that 60 unrelated screens exist.

We are proving that the platform can connect fragmented information into one operational workflow.

---

# 3. Target Prototype Scope

The prototype should represent approximately **50–60% of the product vision**, while implementing only the highest-value portions deeply.

## Functional coverage

| Area | Prototype coverage |
|---|---|
| National dashboard | Implemented |
| State → District → Project drill-down | Implemented |
| Project lifecycle | Implemented |
| Land parcels | Implemented |
| GIS visualization | Implemented |
| Compensation | Implemented |
| Possession | Implemented |
| R&R | Implemented |
| Affected families | Implemented |
| Notifications/alerts | Implemented |
| Documents | Implemented |
| AI extraction | Implemented |
| AI validation | Implemented |
| Risk scoring | Implemented |
| Decision support | Implemented |
| Audit history | Implemented |
| RBAC | Basic implementation |
| External government APIs | Mock/sandbox adapters |
| Production integrations | Roadmap only |
| Mobile field application | Roadmap |
| Full legal workflow | Roadmap |
| Advanced predictive analytics | Roadmap |

---

# 4. High-Level Architecture

```text
                         ┌───────────────────────────┐
                         │      TEMPORARY UI         │
                         │                           │
                         │ React + Tailwind          │
                         │ React Router              │
                         │ Leaflet / MapLibre        │
                         │ Recharts                  │
                         └─────────────┬─────────────┘
                                       │
                                  REST / JSON
                                       │
                         ┌─────────────▼─────────────┐
                         │       API GATEWAY          │
                         │                            │
                         │ Node.js + Express          │
                         │ CORS / validation         │
                         │ authentication             │
                         └─────────────┬─────────────┘
                                       │
               ┌───────────────────────┼────────────────────────┐
               │                       │                        │
       ┌───────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
       │ Domain Services │     │ Integration Hub │     │ AI Service       │
       │                 │     │                 │     │                  │
       │ Projects        │     │ Land Records    │     │ Document         │
       │ Parcels         │     │ GIS/Cadastral   │     │ Extraction       │
       │ Compensation    │     │ Compensation    │     │ Validation       │
       │ R&R             │     │ Document APIs   │     │ Risk Analysis    │
       │ Workflow        │     │                 │     │ Decision Support │
       │ Notifications   │     │ Mock adapters   │     │                  │
       │ Audit           │     │ for prototype   │     │                  │
       └───────┬────────┘     └─────────────────┘     └────────┬─────────┘
               │                                                │
               └────────────────────┬───────────────────────────┘
                                    │
                          ┌─────────▼─────────┐
                          │     MongoDB       │
                          │                   │
                          │ Projects          │
                          │ Parcels           │
                          │ Families          │
                          │ Compensation      │
                          │ R&R               │
                          │ Documents         │
                          │ Risks             │
                          │ Notifications     │
                          │ Audit Logs        │
                          │ Integration Logs  │
                          └───────────────────┘
```

---

# 5. SECTION A — FRONTEND

## Important frontend constraint

The frontend is **temporary**.

It should exist only to:

1. prove that the backend works;
2. provide a usable demonstration;
3. allow the team to test the complete workflow;
4. expose every important backend capability through a simple UI.

Do **not** spend the majority of prototype development time making the temporary frontend beautiful.

The final visual layer will later be redesigned independently.

---

## 5.1 Temporary Frontend Stack

Recommended:

```text
React
Vite
React Router
Tailwind CSS
Axios
Leaflet / React-Leaflet OR MapLibre
Recharts
Lucide React
```

Optional later:

```text
GSAP
Framer Motion
Lenis
Three.js
custom typography
video backgrounds
advanced map styling
```

The optional visual stack is deliberately excluded from the first implementation.

---

# 6. Temporary Frontend Routes

Keep the temporary frontend small.

## Route 1 — `/dashboard`

### National Command Dashboard

Display:

- total projects
- land proposed
- land notified
- land acquired
- compensation assessed
- compensation disbursed
- affected families
- displaced families
- R&R progress
- possession progress
- delayed projects
- high-risk projects
- state-wise progress
- recent alerts

The data must come from backend APIs.

Do not hardcode dashboard numbers in React.

---

## Route 2 — `/projects`

### Project Explorer

Features:

- search
- filter by state
- filter by district
- filter by status
- filter by risk
- sort by progress
- project cards/table

Each project opens its project workspace.

---

## Route 3 — `/projects/:projectId`

### Project Workspace

Sections:

```text
Overview
Land
Compensation
Possession
Families
R&R
Documents
Risk
Timeline
Audit
```

For the temporary frontend these can be tabs rather than separate routes.

Show:

- project metadata
- lifecycle progress
- milestones
- land statistics
- compensation statistics
- affected families
- R&R progress
- possession
- current risk
- alerts

---

## Route 4 — `/map`

### GIS Parcel Explorer

Map must display actual synthetic parcel geometries.

Clicking a parcel opens a detail panel.

Parcel detail should show:

```text
Parcel ID
Survey Number
Village
District
Area
Land Type
Acquisition Status
Notification
Award
Compensation
Payment Status
Possession
R&R Requirement
Affected Family
Data Validation Status
```

The map is not decorative.

It must be connected to the parcel records in MongoDB.

---

## Route 5 — `/workflow`

### Proposal / Workflow Demo

A simple workflow screen demonstrating:

```text
Proposal
   ↓
Verification
   ↓
Scrutiny
   ↓
Notification
   ↓
Award
   ↓
Compensation
   ↓
Possession
   ↓
R&R
   ↓
Completed
```

Prototype actions:

- submit proposal
- move stage
- approve/reject
- create issue
- resolve issue

Every important action creates an audit record.

---

## Route 6 — `/intelligence`

### AI + Decision Intelligence

This is one of the strongest demo screens.

Show:

### Document Intelligence

```text
Document
   ↓
Extracted fields
   ↓
Validation
   ↓
Detected conflicts
```

### Risk Intelligence

```text
Project Risk
High

Risk Factors
- compensation backlog
- parcel data mismatch
- delayed possession
- R&R dependency

Recommended Actions
- verify affected parcels
- resolve payment exceptions
- prioritize R&R cases
```

---

## Route 7 — `/documents`

### Document Repository

Temporary capabilities:

- upload
- list
- view metadata
- associate with project
- associate with parcel
- process with AI
- show extracted fields
- show validation result
- show version number

Do not attempt a full enterprise DMS.

---

## Route 8 — `/admin/integrations`

### Integration Monitor

Display simulated external integrations:

```text
Land Records        CONNECTED
Cadastral/GIS       CONNECTED
Compensation        SANDBOX
Document Registry   SANDBOX
```

Show recent API events:

```text
12:42:11  LAND_RECORD_SYNC      SUCCESS
12:42:14  GIS_PARCEL_FETCH      SUCCESS
12:42:19  COMPENSATION_CHECK    SUCCESS
12:42:23  DOCUMENT_VALIDATION   SUCCESS
```

This demonstrates the architecture without falsely claiming production government connectivity.

---

# 7. Frontend Data Flow

The frontend should never directly communicate with MongoDB or the AI provider.

Correct:

```text
React
  ↓
Axios
  ↓
Express API
  ↓
Service Layer
  ↓
MongoDB / AI / Integration Adapter
```

Incorrect:

```text
React
  ↓
MongoDB
```

and:

```text
React
  ↓
LLM API key
```

AI credentials must remain server-side.

---

# 8. Temporary Frontend Component Structure

```text
src/
│
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── StatCard.jsx
│   ├── ProgressBar.jsx
│   ├── StatusBadge.jsx
│   ├── ProjectCard.jsx
│   ├── Timeline.jsx
│   ├── AlertCard.jsx
│   ├── RiskCard.jsx
│   ├── DataTable.jsx
│   └── LoadingState.jsx
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   ├── ProjectWorkspace.jsx
│   ├── MapExplorer.jsx
│   ├── Workflow.jsx
│   ├── Intelligence.jsx
│   ├── Documents.jsx
│   └── Integrations.jsx
│
├── services/
│   └── api.js
│
├── hooks/
│
├── utils/
│
└── App.jsx
```

The visual design should remain intentionally replaceable.

---

# 9. SECTION B — BACKEND + DATABASE + AI SERVICES

This section is the actual technical core of the prototype.

---

# 10. Backend Stack

Use:

```text
Node.js
Express.js
MongoDB
Mongoose
JWT
Joi or Zod
Multer
Axios
dotenv
Morgan / Pino
```

AI:

```text
Python + FastAPI
```

or, if the chosen AI provider can be reliably called from Node:

```text
Node.js AI service module
```

### Recommended prototype architecture

Keep AI as a logically separate service even if it runs on the same machine.

```text
Node API
   ↓
AI Service
   ↓
LLM / ML model
```

This keeps the architecture extensible.

---

# 11. Backend Folder Structure

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── LandParcel.js
│   │   ├── Family.js
│   │   ├── Compensation.js
│   │   ├── RRCase.js
│   │   ├── Document.js
│   │   ├── Workflow.js
│   │   ├── RiskAssessment.js
│   │   ├── Notification.js
│   │   ├── AuditLog.js
│   │   └── IntegrationLog.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── parcel.controller.js
│   │   ├── compensation.controller.js
│   │   ├── rr.controller.js
│   │   ├── document.controller.js
│   │   ├── workflow.controller.js
│   │   ├── intelligence.controller.js
│   │   ├── dashboard.controller.js
│   │   └── integration.controller.js
│   │
│   ├── services/
│   │   ├── project.service.js
│   │   ├── parcel.service.js
│   │   ├── workflow.service.js
│   │   ├── compensation.service.js
│   │   ├── rr.service.js
│   │   ├── document.service.js
│   │   ├── risk.service.js
│   │   └── audit.service.js
│   │
│   ├── integrations/
│   │   ├── landRecords.adapter.js
│   │   ├── cadastral.adapter.js
│   │   ├── compensation.adapter.js
│   │   └── documentRegistry.adapter.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rbac.js
│   │   ├── validate.js
│   │   ├── errorHandler.js
│   │   └── upload.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── project.routes.js
│   │   ├── parcel.routes.js
│   │   ├── compensation.routes.js
│   │   ├── rr.routes.js
│   │   ├── document.routes.js
│   │   ├── workflow.routes.js
│   │   ├── intelligence.routes.js
│   │   └── integration.routes.js
│   │
│   ├── seed/
│   │   └── seed.js
│   │
│   └── app.js
│
└── server.js
```

---

# 12. MongoDB Data Model

The database should model the actual domain rather than one giant `Project` document.

## Core collections

```text
users
projects
landParcels
families
compensation
rrCases
documents
workflows
riskAssessments
notifications
auditLogs
integrationLogs
```

---

# 13. Project Model

Example conceptual structure:

```js
{
  projectId,
  name,
  projectType,
  authority,
  state,
  district,
  description,

  status,

  proposedArea,
  notifiedArea,
  acquiredArea,
  possessionArea,

  affectedFamilies,
  displacedFamilies,

  compensationAssessed,
  compensationPaid,

  rrProgress,

  milestones: [
    {
      name,
      plannedDate,
      actualDate,
      status
    }
  ],

  riskLevel,
  riskScore,

  createdAt,
  updatedAt
}
```

---

# 14. Land Parcel Model

Use GeoJSON-compatible geometry.

```js
{
  parcelId,
  projectId,

  surveyNumber,
  village,
  district,
  state,

  area,
  landType,

  acquisitionStatus,

  notificationStatus,
  awardStatus,

  compensationStatus,
  compensationAmount,

  possessionStatus,

  rrRequired,
  familyIds: [],

  geometry: {
    type: "Polygon",
    coordinates: [...]
  },

  sourceSystem,
  lastSyncedAt,

  validationStatus,
  validationIssues: []
}
```

MongoDB geospatial indexing should be used for parcel queries.

Example:

```js
landParcelSchema.index({
  geometry: "2dsphere"
});
```

---

# 15. Family Model

```js
{
  familyId,
  projectId,

  anonymizedBeneficiaryId,

  village,
  district,

  affectedStatus,
  displacedStatus,

  compensationStatus,

  rrRequired,
  rrStatus,

  parcelIds: [],

  createdAt,
  updatedAt
}
```

Do not use real citizen PII in the prototype.

Use anonymized synthetic identities.

---

# 16. Compensation Model

```js
{
  projectId,
  parcelId,
  familyId,

  assessedAmount,
  approvedAmount,
  paidAmount,

  paymentStatus,

  assessmentDate,
  approvalDate,
  paymentDate,

  exceptionReason,

  sourceSystem,
  lastSyncedAt
}
```

---

# 17. R&R Model

```js
{
  projectId,
  familyId,

  entitlementType,

  status,

  benefitAssigned,
  benefitDelivered,

  targetDate,
  completionDate,

  delayDays,

  issue
}
```

---

# 18. Document Model

```js
{
  documentId,

  projectId,
  parcelId,

  documentType,
  fileName,
  fileUrl,

  version,

  uploadedBy,

  aiProcessed,

  extractedData: {},

  validationStatus,

  validationIssues: [],

  createdAt,
  updatedAt
}
```

Prototype storage can use:

```text
local filesystem
```

or:

```text
Cloud object storage
```

Do not build a sophisticated document-storage infrastructure during the prototype.

---

# 19. Workflow Model

The workflow should be configurable enough that future state-specific workflows can be added.

Prototype state machine:

```text
PROPOSAL
   ↓
VERIFICATION
   ↓
SCRUTINY
   ↓
NOTIFICATION
   ↓
AWARD
   ↓
COMPENSATION
   ↓
POSSESSION
   ↓
RR
   ↓
COMPLETED
```

Every transition must be validated.

Example:

```text
POST /api/projects/:id/workflow/transition
```

Payload:

```json
{
  "toStage": "COMPENSATION",
  "comment": "Award declared successfully"
}
```

The backend should:

1. validate the transition;
2. update workflow;
3. update project status;
4. create audit log;
5. generate notification if required;
6. optionally trigger risk recalculation.

---

# 20. RBAC

Prototype roles:

```text
CENTRAL_ADMIN
STATE_AUTHORITY
DISTRICT_AUTHORITY
PROJECT_AUTHORITY
FIELD_OFFICER
VIEWER
```

Do not implement hundreds of permissions.

Implement enough to demonstrate:

```text
Viewer
   → read-only

Field Officer
   → parcel/document updates

District Authority
   → verification/workflow actions

State Authority
   → approval/escalation

Central Admin
   → national dashboard / monitoring
```

---

# 21. API Design

Use REST.

## Dashboard

```text
GET /api/dashboard/overview
GET /api/dashboard/states
GET /api/dashboard/projects
GET /api/dashboard/alerts
```

## Projects

```text
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PATCH  /api/projects/:id
```

## Parcels

```text
GET /api/parcels
GET /api/parcels/:id
GET /api/projects/:id/parcels
GET /api/parcels/nearby
```

## Compensation

```text
GET /api/projects/:id/compensation
GET /api/parcels/:id/compensation
PATCH /api/compensation/:id
```

## R&R

```text
GET /api/projects/:id/rr
PATCH /api/rr/:id
```

## Workflow

```text
GET /api/projects/:id/workflow
POST /api/projects/:id/workflow/transition
```

## Documents

```text
POST /api/documents/upload
GET /api/projects/:id/documents
GET /api/documents/:id
POST /api/documents/:id/process
```

## Intelligence

```text
POST /api/intelligence/document/:id/extract
POST /api/intelligence/document/:id/validate
GET  /api/intelligence/projects/:id/risk
POST /api/intelligence/projects/:id/recalculate-risk
GET  /api/intelligence/projects/:id/recommendations
```

## Integrations

```text
GET /api/integrations/status
POST /api/integrations/land-records/sync
POST /api/integrations/cadastral/sync
POST /api/integrations/compensation/sync
GET /api/integrations/logs
```

## Audit

```text
GET /api/audit/project/:id
GET /api/audit/parcel/:id
```

---

# 22. Integration Architecture

This is critical.

The prototype should **not claim that it is connected to live government systems**.

Instead, create an abstraction layer.

```text
Application
     ↓
Integration Interface
     ↓
Adapter
     ↓
External System
```

Prototype:

```text
Integration Interface
       ↓
Mock Land Records Adapter
       ↓
Synthetic Land Record Dataset
```

Later:

```text
Integration Interface
       ↓
Government Land Records Adapter
       ↓
Authorized API
```

This means the domain application does not need to be rewritten when an actual integration becomes available.

---

# 23. Mock Land Records Adapter

Example:

```js
class LandRecordsAdapter {

  async getParcelBySurveyNumber(surveyNumber) {
    // Prototype:
    // read from synthetic external-system dataset

    return {
      surveyNumber,
      recordedArea: 2.31,
      village: "Wagholi",
      landType: "Agricultural"
    };
  }

}
```

The application should treat this as an external dependency.

It should not know whether the data came from:

```text
MongoDB mock data
```

or:

```text
real government API
```

---

# 24. GIS Integration

For prototype:

```text
Synthetic GeoJSON
        ↓
MongoDB
        ↓
REST API
        ↓
React Map
```

Each polygon must correspond to a real `landParcels` record.

This allows:

```text
Map click
   ↓
parcelId
   ↓
GET /api/parcels/:id
   ↓
parcel details
```

---

# 25. AI ARCHITECTURE

AI should solve **specific problems**.

Do not build a generic chatbot.

The prototype will use AI for:

1. document extraction;
2. document-to-database validation;
3. discrepancy detection;
4. project risk assessment;
5. decision-support recommendations.

---

# 26. AI Pipeline

```text
Document
   ↓
Text Extraction / OCR
   ↓
Structured Information Extraction
   ↓
Validation
   ↓
Comparison with platform data
   ↓
Issues
   ↓
Risk Engine
   ↓
Recommendations
```

---

# 27. AI Service

Recommended:

```text
ai-service/
│
├── app.py
│
├── routes/
│   ├── extraction.py
│   ├── validation.py
│   └── risk.py
│
├── services/
│   ├── document_extractor.py
│   ├── validator.py
│   ├── risk_engine.py
│   └── recommendation_engine.py
│
├── schemas/
│   └── intelligence.py
│
└── requirements.txt
```

FastAPI endpoints:

```text
POST /extract
POST /validate
POST /risk
POST /recommend
```

---

# 28. Document Extraction

Input:

```text
land_acquisition_notification.pdf
```

Expected structured output:

```json
{
  "village": "Wagholi",
  "district": "Pune",
  "surveyNumbers": [
    "142/3",
    "143/1",
    "144/2"
  ],
  "area": 18.42,
  "notificationDate": "2026-07-12"
}
```

The backend stores this in the Document record.

---

# 29. AI Validation

The strongest prototype AI demonstration should be a **cross-source consistency check**.

Example:

```text
Submitted Document
Area = 2.84 Ha

Land Records
Area = 2.31 Ha

Difference = 0.53 Ha
```

System:

```text
⚠ DATA DISCREPANCY

Parcel: MH00123
Survey No: 143/1

Documented area: 2.84 Ha
Recorded area:   2.31 Ha

Variance: +22.94%

Action:
Manual verification required.
```

This is much more defensible than a vague AI-generated "risk score."

---

# 30. Risk Engine

Use a transparent weighted scoring model for the prototype.

Example:

```text
Risk Score =
    compensation delay       × 0.30
  + possession delay         × 0.20
  + document discrepancies   × 0.20
  + R&R backlog              × 0.15
  + milestone delay          × 0.15
```

Normalize each factor to 0–100.

Then:

```text
0–29   LOW
30–59  MEDIUM
60–79  HIGH
80–100 CRITICAL
```

The weights should be configurable.

Do not pretend this is trained on national historical government data.

It is a **prototype decision-support model**.

---

# 31. Risk Output

Example:

```json
{
  "projectId": "MH-IC-2046",
  "score": 78,
  "level": "HIGH",

  "factors": [
    {
      "name": "Compensation Delay",
      "impact": 28
    },
    {
      "name": "Document Discrepancies",
      "impact": 19
    },
    {
      "name": "R&R Backlog",
      "impact": 16
    },
    {
      "name": "Possession Delay",
      "impact": 15
    }
  ],

  "recommendations": [
    "Verify affected parcels with data discrepancies",
    "Resolve compensation exceptions",
    "Prioritize pending R&R cases"
  ]
}
```

---

# 32. Human-in-the-Loop Principle

AI should never automatically make the administrative decision.

Correct:

```text
AI
 ↓
Recommendation
 ↓
Authorized Officer
 ↓
Decision
```

Not:

```text
AI
 ↓
Automatic land acquisition approval
```

Every AI recommendation should be explainable.

---

# 33. Audit Trail

Every significant mutation creates an audit record.

Example:

```js
{
  actorId,
  actorRole,

  action: "WORKFLOW_TRANSITION",

  entityType: "PROJECT",
  entityId,

  previousValue,
  newValue,

  timestamp,

  metadata
}
```

Important events:

```text
LOGIN
PROJECT_CREATED
DOCUMENT_UPLOADED
DOCUMENT_PROCESSED
PARCEL_UPDATED
WORKFLOW_CHANGED
COMPENSATION_UPDATED
RR_UPDATED
RISK_RECALCULATED
INTEGRATION_SYNC
ISSUE_CREATED
ISSUE_RESOLVED
```

---

# 34. Notifications

Prototype notification rules:

### Compensation delay

```text
IF payment pending > threshold
→ create alert
```

### Milestone delay

```text
IF actual date > planned date
→ create delay alert
```

### Data discrepancy

```text
IF document value != external record
→ create verification alert
```

### High risk

```text
IF riskScore >= 60
→ create project risk alert
```

---

# 35. Seed Dataset

The prototype must contain enough data to make the application feel real.

Suggested:

```text
States              8
Districts           25–40
Projects            50–100
Land Parcels        5,000+
Affected Families   5,000+
Compensation Cases  5,000+
R&R Cases           1,000+
Documents           500+
```

However, the initial development dataset can be much smaller:

```text
5 states
10 districts
15 projects
200 parcels
300 families
200 documents
```

Once functionality is stable, generate larger synthetic data.

---

# 36. Deliberately Seed Problems

The dataset must not be perfectly clean.

Create intentional scenarios:

```text
Parcel A
→ area mismatch

Parcel B
→ compensation pending

Parcel C
→ possession delayed

Parcel D
→ R&R overdue

Project E
→ multiple risk factors

Document F
→ missing survey number

Project G
→ milestone overdue
```

This is essential for demonstrating intelligence.

A dashboard where everything is green is a bad demo.

---

# 37. Demo Scenario Dataset

Create one flagship project.

Example:

```text
Project:
Maharashtra Industrial Corridor — Demo

State:
Maharashtra

District:
Pune

Proposed:
12,450 Ha

Notified:
9,840 Ha

Acquired:
7,420 Ha

Possession:
6,910 Ha

Affected Families:
4,820

Displaced Families:
1,230

Compensation Assessed:
₹1,240 Cr

Compensation Paid:
₹982 Cr

R&R:
68%

Risk:
HIGH
```

This project should contain the most interesting demo anomalies.

---

# 38. API Error Handling

All APIs should return consistent responses.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "PARCEL_NOT_FOUND",
    "message": "Land parcel was not found"
  }
}
```

Use centralized Express error handling.

---

# 39. Validation

Validate all incoming API data.

Use:

```text
Joi
```

or:

```text
Zod
```

Never rely only on frontend validation.

Examples:

```text
project creation
parcel creation
workflow transition
compensation update
document metadata
AI output
```

AI outputs should also be validated against a schema before being stored.

---

# 40. Security for Prototype

Minimum:

```text
JWT authentication
password hashing
RBAC middleware
environment variables
CORS
request validation
file type validation
file size limits
API error sanitization
```

Never commit:

```text
API keys
JWT secrets
database passwords
government credentials
```

---

# 41. Environment Variables

Example:

```env
PORT=5000

MONGO_URI=

JWT_SECRET=

AI_SERVICE_URL=http://localhost:8000

AI_API_KEY=

UPLOAD_DIR=./uploads

CLIENT_URL=http://localhost:5173
```

---

# 42. Local Development

Recommended setup:

```text
frontend → localhost:5173
backend  → localhost:5000
AI       → localhost:8000
MongoDB  → localhost:27017
```

Architecture:

```text
React :5173
    ↓
Express :5000
    ↓
MongoDB :27017

Express :5000
    ↓
FastAPI :8000
    ↓
AI provider / local model
```

---

# 43. Development Order

Do NOT build everything simultaneously.

## Phase 1 — Backend foundation

Build:

```text
Express
MongoDB
Mongoose
models
error handling
validation
seed data
```

---

## Phase 2 — Core APIs

Build:

```text
projects
parcels
families
compensation
R&R
dashboard
```

At the end of this phase, the complete domain should be accessible through APIs.

---

## Phase 3 — GIS

Build:

```text
GeoJSON parcel data
2dsphere index
parcel APIs
map endpoint
```

Verify:

```text
map polygon
   ↔
parcel database record
```

---

## Phase 4 — Workflow

Implement:

```text
proposal
verification
scrutiny
notification
award
compensation
possession
R&R
```

Add:

```text
transition validation
audit logs
notifications
```

---

## Phase 5 — Documents

Implement:

```text
upload
metadata
project association
parcel association
version
```

---

## Phase 6 — AI extraction

Implement:

```text
document
 ↓
text
 ↓
structured JSON
 ↓
MongoDB
```

---

## Phase 7 — AI validation

Implement:

```text
document extracted data
+
parcel record
+
mock land record
 ↓
comparison
 ↓
discrepancy
```

---

## Phase 8 — Risk engine

Implement:

```text
project data
 ↓
risk calculation
 ↓
factors
 ↓
recommendations
```

---

## Phase 9 — Integration adapters

Implement mock adapters:

```text
Land Records
Cadastral/GIS
Compensation
Document Registry
```

Make their behavior visible through the Integration Monitor.

---

## Phase 10 — Temporary React frontend

Only after the backend workflow is stable:

```text
dashboard
projects
project workspace
map
workflow
documents
intelligence
integrations
```

---

# 44. Definition of Done

The prototype is ready when a fresh machine can run:

```text
MongoDB
Backend
AI service
Frontend
```

and a judge can complete the following without developer intervention:

```text
1. Login
2. Open national dashboard
3. Select Maharashtra
4. Open flagship project
5. View acquisition progress
6. Open GIS map
7. Click a parcel
8. View compensation/possession/R&R
9. Open project document
10. Run AI extraction
11. Detect a deliberate data mismatch
12. View risk score
13. View recommendations
14. Perform a workflow action
15. View audit history
```

If this works reliably, the prototype is sufficient.

---

# 45. What Should Be Saved for the Production Roadmap

The following should be explicitly shown in the presentation as future progression:

```text
Phase 2
────────
Mobile field application
Offline field verification
Advanced GIS
Multilingual support
More state-specific workflows

Phase 3
────────
Authorized government API integrations
Cadastral synchronization
Land-record synchronization
Compensation system integration
Document registry integration

Phase 4
────────
Historical-data-trained predictive models
Advanced forecasting
Cross-project intelligence
National policy analytics
Advanced anomaly detection

Phase 5
────────
Nationwide deployment
High availability
Government identity infrastructure
Enterprise security
Disaster recovery
Inter-state interoperability
```

---

# 46. Final Prototype Architecture

The actual prototype should therefore be:

```text
                  ┌──────────────────────────┐
                  │   TEMPORARY REACT UI     │
                  │                          │
                  │ Dashboard                │
                  │ Projects                 │
                  │ GIS                      │
                  │ Workflow                 │
                  │ Documents                │
                  │ Intelligence             │
                  │ Integrations             │
                  └────────────┬─────────────┘
                               │
                               ▼
                  ┌──────────────────────────┐
                  │    EXPRESS REST API      │
                  │                          │
                  │ Auth / RBAC              │
                  │ Dashboard                │
                  │ Project                  │
                  │ Parcel                   │
                  │ Compensation             │
                  │ R&R                      │
                  │ Workflow                 │
                  │ Documents                │
                  │ Audit                    │
                  └───────┬─────────┬────────┘
                          │         │
                ┌─────────▼───┐   ┌─▼──────────────┐
                │  MongoDB    │   │ Integration    │
                │             │   │ Adapter Layer  │
                │ Domain Data │   │                │
                │ GIS Data    │   │ Land Records   │
                │ Documents   │   │ Cadastral      │
                │ Audit       │   │ Compensation   │
                └─────────────┘   └────────────────┘
                          │
                          │
                  ┌───────▼───────────┐
                  │    AI SERVICE     │
                  │                   │
                  │ Extraction        │
                  │ Validation        │
                  │ Anomaly Detection │
                  │ Risk Engine       │
                  │ Recommendations   │
                  └───────────────────┘
```

---

# 47. The One-Sentence Technical Pitch

> **A modular, API-first land acquisition platform that unifies project, parcel, compensation, possession, R&R and document data, connects them spatially through GIS, and applies explainable AI to detect inconsistencies and prioritize acquisition risks—while keeping authorized human officers in the decision loop.**

---

# 48. The One-Sentence Prototype Pitch

> **Our prototype demonstrates the complete intelligence loop from a national project dashboard to an individual land parcel, from document ingestion to cross-source discrepancy detection, and from detected issues to explainable project-risk recommendations.**

---

# 49. Final Rule

## Do not build breadth for the sake of breadth.

Build **depth around the demo journey**.

The prototype should make these five things extremely convincing:

```text
1. DATA
   Fragmented land-acquisition information becomes unified.

2. GIS
   Every important land record can be connected to a physical parcel.

3. WORKFLOW
   The acquisition lifecycle becomes trackable and auditable.

4. AI
   Documents and datasets can be compared to identify meaningful issues.

5. DECISION SUPPORT
   Officials can see what is delayed, why it is delayed,
   and what requires attention.
```

Everything else is secondary.

---

# 50. Recommended Repository

```text
land-acquisition-platform/
│
├── frontend/
│
├── backend/
│
├── ai-service/
│
├── mock-integrations/
│
├── data/
│   ├── projects.json
│   ├── parcels.geojson
│   ├── land-records.json
│   └── documents/
│
├── docs/
│
├── README.md
│
└── .gitignore
```

The `mock-integrations` directory can either be a separate service or be represented through adapters inside the backend during the earliest implementation.

---

# 51. Final Decision

### Build:

**React + Node.js + Express + MongoDB + GIS + focused AI**

### Do NOT build:

**A complete national enterprise system.**

### Prototype target:

**50–60% product vision, but only the most important vertical slice implemented end-to-end.**

### Frontend:

**Temporary and replaceable.**

### Backend:

**Real, modular, API-first, database-backed.**

### AI:

**Real and narrowly focused on document extraction, cross-source validation, anomaly detection, risk scoring and recommendations.**

### Government integrations:

**Mock/sandbox adapters now; production connectors later.**

### Demo:

**One continuous story rather than dozens of disconnected features.**

This gives the team a stable technical foundation while leaving the visual frontend completely open for a later custom design pass.
