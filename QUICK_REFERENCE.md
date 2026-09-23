# BHUMISETU Quick Reference Guide

## 🚀 Quick Start

### Start Development Environment
```bash
# Terminal 1 - Frontend
cd frontend
npm install  # if first time
npm run dev
# Available at: http://localhost:5174

# Terminal 2 - Backend
cd backend
npm install  # if first time
npm run dev
# Running at: http://localhost:5001
```

---

## 📋 Page Routes & Components

| Route | File | Purpose |
|-------|------|---------|
| `/` | `DashboardPage.jsx` | Command center with KPIs, alerts, project overview |
| `/projects` | `ProjectsPage.jsx` | Browse all projects with filters |
| `/projects/:id` | `ProjectWorkspacePage.jsx` | Detailed project view + parcels |
| `/map` | `MapPage.jsx` | GIS-based parcel explorer |
| `/compensation` | `CompensationIntelligencePage.jsx` | Rule-based compensation and entitlement assessment |
| `/intelligence` | `IntelligencePage.jsx` | Legacy document reconciliation and AI risk assessment |
| `/workflow` | `WorkflowPage.jsx` | 9-step acquisition lifecycle |

---

## 🎨 Design System Quick Reference

### Colors (Tailwind Config)
```javascript
Primary: bhumisetu-forest (#004643)
Dark: bhumisetu-darkest (#08120F)
Accent: bhumisetu-brass (#C7A75B)
Muted: bhumisetu-muted (#527A67)

Status:
  Success: #3E8064 (green)
  Warning: #C58A35 (amber)
  Danger: #B84A43 (red)
  Info: #54748A (blue)
```

### Fonts
```
Headings:   font-display (DM Serif Display)
Body Text:  font-body (Manrope)
```

### Common Components
```jsx
// Card with shadow
<div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-subtle">

// Large heading
<h1 className="font-display text-5xl leading-tight text-bhumisetu-darkest">

// Status badge
<span className="px-4 py-2 rounded-full bg-green-100 text-green-900 text-xs font-bold">

// Progress bar
<div className="h-3 bg-gray-200 rounded-full overflow-hidden">
  <div className="h-full bg-gradient-to-r from-bhumisetu-forest to-bhumisetu-muted" />
</div>
```

---

## 🔌 API Integration

### Base URL
```javascript
const API_BASE = 'http://localhost:5001/api'
```

### Endpoints Used
```
GET /health                  - Server health
GET /dashboard               - KPIs + alerts + risk
GET /projects                - All projects
GET /projects/:id            - Single project
GET /projects/:id/parcels    - Parcels for project
GET /documents               - All documents
GET /intelligence            - Risk data + recommendations
POST /compensation/calculate - Deterministic preliminary estimate
POST /compensation/analyze  - AI interpretation of deterministic result
POST /compensation/assessments - Save an assessment
GET /compensation/assessments/:id - Retrieve a saved assessment
GET /map                     - All parcels with coordinates
```

### Fetch Pattern
```javascript
useEffect(() => {
  fetch(`${API_BASE}/endpoint`)
    .then(res => res.json())
    .then(data => setData(data))
    .catch(error => console.error('Error:', error))
}, [])
```

---

## 🎯 Common Patterns

### Color-coded Risk/Status
```javascript
const getRiskColor = (risk) => {
  switch (risk.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-900'
    case 'high': return 'bg-orange-100 text-orange-900'
    case 'medium': return 'bg-amber-100 text-amber-900'
    default: return 'bg-green-100 text-green-900'
  }
}

// Usage
<span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskColor(risk)}`}>
  {risk}
</span>
```

### Loading State
```javascript
if (!data) {
  return (
    <div className="flex items-center justify-center min-h-screen text-gray-600">
      <div className="text-center">
        <div className="font-display text-2xl mb-2">Loading</div>
        <div className="font-body">Page Title</div>
      </div>
    </div>
  )
}
```

### Responsive Grid
```jsx
{/* Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* items */}
</div>
```

### Data Table
```jsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b-2 border-gray-200">
        <th className="text-left px-4 py-3 text-xs font-body font-semibold text-gray-600 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody>
      {data.map(item => (
        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-4 py-4">{item.name}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 📦 Dependencies

### Production
```json
{
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-router-dom": "^7.18.3"
}
```

### Dev
```json
{
  "tailwindcss": "^3.x",
  "postcss": "^8.x",
  "autoprefixer": "^10.x",
  "@vitejs/plugin-react": "^6.1.0",
  "vite": "^8.2.2",
  "oxlint": "^1.79.0"
}
```

---

## 🛠️ Commands

```bash
# Development
npm run dev          # Start dev server with HMR
npm run preview      # Preview production build

# Production
npm run build        # Create optimized build
npm run lint         # Run Oxlint

# Package Management
npm install          # Install dependencies
npm update          # Update packages
```

---

## 📱 Responsive Breakpoints (Tailwind)

```
Mobile:  < 768px (no prefix or sm:)
Tablet:  768px - 1024px (md:)
Desktop: > 1024px (lg:)
```

### Example
```jsx
{/* Stacked on mobile, 2 cols on tablet, 3 cols on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## 🐛 Common Issues & Solutions

### Port Already in Use
```bash
# Change port in vite.config.js
export default defineConfig({
  server: { port: 5175 }
})
```

### Tailwind Classes Not Working
- Clear cache: `rm -rf node_modules .vite` (or in File Explorer)
- Reinstall: `npm install`
- Restart dev server: `npm run dev`

### API Connection Issues
- Check backend is running: `curl http://localhost:5001/api/health`
- Update `API_BASE` URL if port differs
- Check CORS headers in backend

### Styling Issues
- Ensure Tailwind CSS is imported in `index.css`
- Clear browser cache (Ctrl+Shift+Delete)
- Check for conflicting global styles

---

## 🎓 Key Concepts Used

### React Hooks
- `useState` - Local component state
- `useEffect` - Side effects (API calls)
- `useParams` - URL parameters (React Router)

### Tailwind Utilities
- `grid` - CSS Grid layouts
- `flex` - Flexbox layouts
- `bg-*` / `text-*` - Colors
- `p-*` / `m-*` - Padding/Margin
- `rounded-*` - Border radius
- `shadow-*` - Box shadows
- `hover:` / `focus:` - States
- `md:` / `lg:` - Responsive

### Component Patterns
- Functional components with hooks
- Conditional rendering for loading states
- Map for list rendering
- Event handlers for interactivity

---

## 📚 File Organization

```
frontend/
├── public/              # Static assets
├── src/
│   ├── pages/          # Page components (one per route)
│   ├── App.jsx         # Main layout & router
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles + Tailwind
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind design tokens
└── postcss.config.js   # PostCSS plugins
```

---

## 🔍 Debugging Tips

### Check Data Flow
```javascript
// Add console.log to see what's fetched
useEffect(() => {
  fetch(`${API_BASE}/dashboard`)
    .then(res => res.json())
    .then(data => {
      console.log('Dashboard data:', data)  // ← Debug
      setDashboard(data)
    })
}, [])
```

### Network Tab
- Open DevTools (F12)
- Go to Network tab
- Check API responses
- Verify status codes (200 = OK)

### React DevTools
- Install React DevTools extension
- Inspect component props and state
- Check hook values

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
# Creates: dist/ folder with optimized files
```

### Deploy to Server
1. Build the project
2. Copy `dist/` contents to web server
3. Configure backend API URL for production
4. Set up reverse proxy if needed

### Environment Variables
```javascript
// Create .env file (not committed to git)
VITE_API_BASE=https://api.example.com
```

---

## 📞 Support

### Documentation
- Tailwind CSS: https://tailwindcss.com/docs
- React Router: https://reactrouter.com/
- Vite: https://vitejs.dev/

### Project Docs
- See: `FRONTEND_IMPLEMENTATION.md` for full details
- See: `SIH_26016_Prototype_Architecture_Plan.md` for backend

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-08-30 | Initial BHUMISETU frontend implementation |

---

**Last Updated**: 2026-08-30  
**Status**: Production Ready for SIH 2026
