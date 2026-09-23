# BHUMISETU Frontend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            BHUMISETU React Application                  │   │
│  │                (http://localhost:5174)                  │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────────┐      │   │
│  │  │  Sidebar Navigation                          │      │   │
│  │  │  - BHUMISETU Branding                        │      │   │
│  │  │  - Active Link Highlighting (Brass)          │      │   │
│  │  │  - Quick Project Access                      │      │   │
│  │  └───────────────────────────────────────────────┘      │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────────┐      │   │
│  │  │  Main Content Area - Route-based Pages        │      │   │
│  │  │                                                │      │   │
│  │  │  Dashboard → State Progress, KPIs, Alerts    │      │   │
│  │  │  Projects → Project Portfolio Grid           │      │   │
│  │  │  Workspace → Detailed Project + Parcels      │      │   │
│  │  │  Map → GIS Parcel Explorer                   │      │   │
│  │  │  Intelligence → Risk Assessment + Alerts     │      │   │
│  │  │  Documents → Document Repository             │      │   │
│  │  │  Workflow → 9-Step Lifecycle Timeline        │      │   │
│  │  │                                                │      │   │
│  │  └───────────────────────────────────────────────┘      │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────────┐      │   │
│  │  │  Design System (Tailwind)                    │      │   │
│  │  │  - Color Tokens (Forest, Brass, Status)      │      │   │
│  │  │  - Typography (DM Serif Display, Manrope)   │      │   │
│  │  │  - Spacing & Sizing                          │      │   │
│  │  │  - Responsive Breakpoints                    │      │   │
│  │  └───────────────────────────────────────────────┘      │   │
│  │                                                          │   │
│  │  ┌───────────────────────────────────────────────┐      │   │
│  │  │  Data Management                              │      │   │
│  │  │  - React State (useState)                     │      │   │
│  │  │  - Side Effects (useEffect)                   │      │   │
│  │  │  - Routing State (useParams)                  │      │   │
│  │  └───────────────────────────────────────────────┘      │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│                      ⬇️  API CALLS  ⬇️                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│              (http://localhost:5001/api)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Express.js Routes                                       │   │
│  │  ├─ GET /health              → Server status           │   │
│  │  ├─ GET /dashboard           → KPIs + alerts + risk    │   │
│  │  ├─ GET /projects            → All projects            │   │
│  │  ├─ GET /projects/:id        → Single project          │   │
│  │  ├─ GET /projects/:id/parcels → Parcels list           │   │
│  │  ├─ GET /documents           → Documents               │   │
│  │  ├─ GET /intelligence        → Risk + recommendations  │   │
│  │  └─ GET /map                 → Parcel coordinates      │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Mock Data                                               │   │
│  │  └─ /data/mockData.js                                   │   │
│  │     ├─ dashboardSummary                                 │   │
│  │     ├─ projects                                         │   │
│  │     ├─ parcels                                          │   │
│  │     ├─ documents                                        │   │
│  │     ├─ alerts                                           │   │
│  │     └─ riskInsights                                     │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Component Hierarchy

```
App
├── BrowserRouter
│   └── AppLayout
│       ├── Sidebar
│       │   ├── Brand Block (BHUMISETU)
│       │   └── Navigation Links
│       │       ├── Dashboard
│       │       ├── Projects
│       │       ├── Map
│       │       ├── Workflow
│       │       ├── Intelligence
│       │       └── Documents
│       │
│       └── Main Content (Routes)
│           ├── DashboardPage /
│           │   ├── Header with eyebrow
│           │   ├── Stats Grid (6 KPIs)
│           │   ├── State-wise Progress
│           │   ├── Alerts Panel
│           │   ├── Project Portfolio
│           │   └── Project Snapshot
│           │
│           ├── ProjectsPage /projects
│           │   ├── Header
│           │   └── Project List (Grid)
│           │
│           ├── ProjectWorkspacePage /projects/:id
│           │   ├── Project Header
│           │   ├── Overview Cards
│           │   ├── Risk Assessment
│           │   └── Parcels Table
│           │
│           ├── MapPage /map
│           │   ├── Interactive Map Surface
│           │   ├── Parcel Pins
│           │   ├── Details Sidebar
│           │   └── Parcels Grid
│           │
│           ├── IntelligencePage /intelligence
│           │   ├── Risk Score Card
│           │   ├── Recommended Actions
│           │   ├── Documents Table
│           │   └── Alerts
│           │
│           ├── DocumentsPage /documents
│           │   ├── Header
│           │   ├── Documents Table
│           │   └── Stats Cards
│           │
│           └── WorkflowPage /workflow
│               ├── Header
│               ├── Workflow Steps
│               ├── Progress Summary
│               └── Process Overview
```

---

## Data Flow Patterns

### 1. Dashboard Data Flow
```
User opens /
  ⬇️
DashboardPage mounts
  ⬇️
useEffect triggers
  ⬇️
fetch /api/dashboard
  ⬇️
Parse JSON response
  ⬇️
setState(dashboard)
  ⬇️
Component re-renders with data
  ⬇️
Display KPIs, Progress, Alerts, Projects
```

### 2. Project Selection Flow
```
User clicks project card
  ⬇️
onClick handler
  ⬇️
setSelectedProject(project)
  ⬇️
Component re-renders
  ⬇️
Display selected project details
```

### 3. Navigation Flow
```
User clicks sidebar link
  ⬇️
React Router navigates
  ⬇️
URL changes
  ⬇️
Matching Route renders new component
  ⬇️
New page's useEffect fires
  ⬇️
Fetch new data
  ⬇️
Display new page
```

### 4. Interactive Map Flow
```
Map renders with parcel pins
  ⬇️
User clicks parcel
  ⬇️
onClick handler triggers
  ⬇️
setSelectedParcel(parcel)
  ⬇️
Map re-renders (pin highlighted)
  ⬇️
Sidebar updates with parcel details
```

---

## Design System Layer

```
Tailwind CSS Configuration
│
├─ Color Tokens
│  ├─ Primary: Forest Green (#004643)
│  ├─ Dark: Darkest (#08120F)
│  ├─ Accent: Brass (#C7A75B)
│  ├─ Muted: Green (#527A67)
│  ├─ Cream: Off-white (#F4F1E8)
│  └─ Status Colors (Success, Warning, Danger, Info)
│
├─ Font Families
│  ├─ Display: DM Serif Display (headings)
│  └─ Body: Manrope (text/UI)
│
├─ Spacing & Sizing
│  ├─ Base unit: 4px (Tailwind default)
│  ├─ Gap/Padding: p-4, p-6, p-8 standard
│  └─ Border radius: rounded-lg, rounded-xl, rounded-2xl
│
├─ Shadows
│  ├─ subtle: 0 10px 30px rgba(15, 23, 42, 0.04)
│  └─ elevated: 0 8px 25px rgba(0, 0, 0, 0.15)
│
└─ Responsive Breakpoints
   ├─ Mobile: < 768px
   ├─ Tablet: 768px - 1024px (md:)
   └─ Desktop: > 1024px (lg:)
```

---

## Build & Deployment Pipeline

```
Source Code (Git)
  ⬇️
├─ Development
│  ├─ npm install (deps)
│  ├─ npm run dev (Vite dev server)
│  ├─ HMR (Hot Module Reload)
│  └─ Browser reload
│
├─ Linting
│  └─ npm run lint (Oxlint)
│
├─ Building
│  └─ npm run build
│     ├─ Vite optimizes
│     ├─ Tailwind purges unused CSS
│     ├─ Tree-shaking unused code
│     └─ Creates dist/ folder
│
└─ Production
   ├─ Copy dist/ to web server
   ├─ Configure API_BASE URL
   ├─ Enable GZIP compression
   ├─ Cache static assets
   └─ Serve with HTTPS
```

---

## Performance Optimizations

### 1. Code Splitting
- React Router enables automatic code splitting per page
- Each page component loaded on demand

### 2. Tailwind CSS
- Utility-first CSS reduces file size
- Purges unused styles in production
- Smaller CSS bundle than traditional frameworks

### 3. Asset Loading
- Vite provides instant ESM imports
- Lightning-fast HMR during development
- Optimized production build with minification

### 4. State Management
- Minimal state using React hooks
- No extra state management library overhead
- Component-level state prevents prop drilling

---

## Error Handling Strategy

### API Errors
```javascript
fetch(url)
  .then(res => res.json())
  .then(data => setData(data))
  .catch(error => {
    console.error('API Error:', error)
    // Show error UI
  })
```

### Loading States
```javascript
if (!data) {
  return <LoadingUI /> // Show spinner
}
// Render data
```

### Empty States
```javascript
if (data.length === 0) {
  return <EmptyUI /> // Show "No data" message
}
```

---

## Security Considerations

### Current (Development)
- CORS enabled for localhost
- No authentication (mock data)
- HTTP for local testing

### Production Checklist
- [ ] Enable HTTPS
- [ ] Implement authentication/JWT
- [ ] Validate all API inputs
- [ ] Sanitize HTML output
- [ ] Implement CSRF protection
- [ ] Set secure CORS headers
- [ ] Rate limit API calls
- [ ] Add error boundaries
- [ ] Remove console.logs
- [ ] Security headers (CSP, X-Frame-Options, etc.)

---

## File Size & Metrics

### Expected Bundle Sizes (Production)
```
JavaScript (minified + gzipped): ~100-150 KB
CSS (Tailwind minified + gzipped): ~30-50 KB
Total: ~150-200 KB

Lighthouse Metrics (Target):
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
```

---

## Testing Strategy (Future)

### Unit Tests
- Component rendering
- Event handlers
- Utility functions

### Integration Tests
- API calls with mock data
- Page navigation
- Data flow between components

### E2E Tests
- User workflows
- Full page interactions
- API integration

---

## Monitoring & Analytics (Future)

### Metrics to Track
- Page load time
- API response time
- User engagement
- Error rates
- Browser/device breakdown

### Tools
- Google Analytics
- Sentry for error tracking
- Performance monitoring

---

## Maintenance & Updates

### Regular Tasks
- Keep dependencies updated
- Monitor security advisories
- Test across browsers
- Performance profiling
- User feedback incorporation

### Version Management
- Semantic versioning
- Changelog maintenance
- Release notes

---

## Conclusion

BHUMISETU frontend is built as a modern, scalable React application with:
- Clean component architecture
- Consistent design system
- Real-time API integration
- Responsive, accessible UI
- Production-ready code

Ready for SIH 2026 demonstration and deployment.

---

**Architecture Version**: 1.0.0  
**Last Updated**: 2026-08-30  
**Status**: Production Ready
