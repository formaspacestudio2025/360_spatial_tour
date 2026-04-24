
# 360 Spatial Tours - Project Memory

## Project Overview
360° walkthrough platform with issue management, scene navigation, hotspot interactions, and AI-powered media processing. Supports role-based access (admin/manager/editor).

## Frontend Structure (frontend/src/)
- **Entry**: `main.tsx` → React + React Router + TanStack Query
- **Pages**: `pages/Dashboard.tsx`, `pages/Login.tsx`, `pages/Register.tsx`, `pages/WalkthroughViewer.tsx`
- **Components**:
  - `layout/Header.tsx` - Main nav with issue management link
  - `issueManagement/IssueListPage.tsx` - Issue list (route: `/issues`)
  - `issueManagement/CreateIssueForm.tsx` - Issue creation form
  - `issueManagement/EditIssueStatus.tsx` - Issue status editor
  - `walkthrough/` - Walkthrough CRUD components
  - `auth/ProtectedRoute.tsx` - Route guard
- **API Layer**: `api/client.ts` (axios instance with auth interceptor), `api/walkthroughs.ts`, `api/issuesApi.ts` (empty)
- **State**: `stores/authStore.ts` (Zustand + persist)
- **Types**: `types/` directory

## Backend Structure (backend/src/)
- **Entry**: `index.ts` (Express + CORS + JSON middleware)
- **Routes**: `routes/` (auth, dashboard, walkthroughs, scenes, hotspots, hotspot-media, hotspot-links, ai, issuesRoutes, index.ts)
- **Services**: `services/issue.service.ts`, `services/ai.service.ts`
- **Database**: `config/database.ts` (JSON file-based, NOT SQLite), `data/db.json`
- **Types**: `types/issue.ts`

## Database Flow
- **Type**: JSON file store (`backend/data/db.json`)
- **Wrapper**: `config/database.ts` emulates SQLite API (prepare/run/all/get)
- **Tables**: users, walkthroughs, scenes, navigation_edges, ai_tags, issues, versions, walkthrough_members, comments, hotspot_media, hotspot_links
- **Persistence**: Auto-saves to `db.json` on write operations

## Authentication Flow
1. UI: `Login.tsx` → `authStore.login(token, user)`
2. Frontend: `api/client.ts` adds `Bearer` token to all requests via axios interceptor
3. Backend: `routes/auth.ts` validates credentials, returns JWT token
4. Storage: `authStore` persists to localStorage via Zustand persist middleware
5. Route Guard: `ProtectedRoute.tsx` checks `isAuthenticated` state

## API Flow Pattern
- Frontend: `api/client.ts` → axios instance → `baseURL: VITE_API_URL || localhost:3000`
- Backend: `index.ts` mounts routes under `/api/*`
- Issue Example:
  - GET `/api/issues` → `issuesRoutes.ts` → `issue.service.ts` → `database.ts` → `db.issues`
  - POST `/api/issues` → same flow, inserts into `db.issues`

## Architecture Maps

### Login Flow
`Login.tsx` → `authStore.login()` → `api/auth.ts` → `backend/auth routes` → `auth service` → `db.users` → token returned → `authStore` persisted

### Issue Management Flow
`Header.tsx` (nav link) → `/issues` route → `IssueListPage.tsx` → axios GET `/api/issues` → `issuesRoutes.ts` → `issue.service.getIssues()` → `db.issues` → returns list → renders UI

### Walkthrough Flow
`Dashboard.tsx` → TanStack Query `walkthroughApi.getAll()` → GET `/api/walkthroughs` → `walkthroughRoutes.ts` → walkthrough service → `db.walkthroughs` → returns list → renders cards

### Image Upload Flow
`WalkthroughViewer.tsx` → `hotspot-media.ts` API → POST `/api/hotspot-media` → `hotspotMediaRoutes.ts` → storage service → `backend/storage/` → DB record

## Critical Files List

### Entry Points
- `frontend/src/main.tsx`
- `backend/src/index.ts`

### Auth Files
- `frontend/src/stores/authStore.ts`
- `frontend/src/components/auth/ProtectedRoute.tsx`
- `backend/src/routes/auth.ts`

### API Routes
- `backend/src/routes/index.ts` (mounts all sub-routes)
- `backend/src/routes/issuesRoutes.ts`
- `backend/src/routes/walkthroughs.ts`
- `frontend/src/api/client.ts`
- `frontend/src/api/walkthroughs.ts`

### Services
- `backend/src/services/issue.service.ts`
- `backend/src/services/ai.service.ts`

### Database
- `backend/src/config/database.ts`
- `backend/data/db.json`

### Frontend Pages Tied to Backend
- `frontend/src/pages/Dashboard.tsx` → `/api/walkthroughs`, `/api/dashboard`
- `frontend/src/components/issueManagement/IssueListPage.tsx` → `/api/issues`
- `frontend/src/pages/WalkthroughViewer.tsx` → `/api/scenes`, `/api/hotspots`

### Types
- `backend/src/types/issue.ts`
- `frontend/src/types/` (index.ts, issue.ts)

## Deployment Notes
- No Docker/CI configs found
- Frontend: Vite build (`npm run build`)
- Backend: tsx for dev, tsc build to `dist/`, node `dist/index.js` for prod
- Env: `backend/.env` (PORT, CORS, JWT_SECRET, DB_PATH)

## Known Issues
1. Issue management panel not initially visible (fixed: added route + nav link)
2. Backend requires `db:init` script (json db creates file automatically)
3. `frontend/src/api/issuesApi.ts` is empty - IssueListPage uses direct axios import
4. Issue service uses SQLite-style API but DB is JSON file (works via emulation)
5. CORS may block requests if frontend port differs

## Dangerous Areas (Edit with Caution)
1. **Auth Logic**: `authStore.ts`, `ProtectedRoute.tsx`, `backend/src/routes/auth.ts` - breaks all logins
2. **DB Wrapper**: `backend/src/config/database.ts` - custom JSON emulation, not standard SQLite
3. **Route Registration**: `backend/src/index.ts` - missing routes break API endpoints
4. **Axios Interceptor**: `frontend/src/api/client.ts` - token handling affects all API calls
5. **Zustand Persist**: `authStore.ts` - localStorage schema changes break auth state
6. **Issue Service Queries**: `issue.service.ts` - uses db.prepare() which is emulated

## Debugging Tips
- Backend: Check terminal for "✅ JSON Database initialized" and route registration logs
- Frontend: Check browser console for API requests, React Query devtools (not installed)
- Auth: Clear localStorage if auth state corrupts
- DB: Inspect `backend/data/db.json` directly for data issues
