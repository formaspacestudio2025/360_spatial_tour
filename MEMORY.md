
# 360 Spatial Tours - Project Memory

## Project Overview
360° walkthrough platform with issue management, scene navigation, hotspot interactions, and AI-powered media processing. Supports role-based access (admin/manager/editor).

## Frontend Structure (frontend/src/)
- **Entry**: `main.tsx` → React + React Router + TanStack Query
- **Pages**: `pages/Dashboard.tsx`, `pages/Login.tsx`, `pages/Register.tsx`, `pages/WalkthroughViewer.tsx`, `pages/UserManagement.tsx`, `pages/AssetManagement.tsx`
- **Components**:
  - `layout/Header.tsx` - Main nav with issue management + user management links
  - `issueManagement/IssueListPage.tsx` - Issue list (route: `/issues`)
  - `issueManagement/CreateIssueForm.tsx` - Issue creation form
  - `issueManagement/EditIssueStatus.tsx` - Issue status editor
  - `viewer/AssetFormModal.tsx` - Asset creation/editing form modal
  - `viewer/AssetMarker.tsx` - 3D asset marker in 360° viewer
  - `assets/LifecycleTab.tsx` - Asset lifecycle management
  - `assets/QRModal.tsx` - QR code generation for assets
  - `graph/SceneGraphEditor.tsx` - Visual scene graph editor
  - `graph/SceneNode.tsx` - Scene node component for graph
  - `graph/GraphToolbar.tsx` - Toolbar for graph editor
  - `viewer/BulkUpload.tsx` - Bulk file upload component
  - `viewer/MediaManager.tsx` - Media management interface
  - `viewer/NadirPatch.tsx` - Nadir patch editing
  - `viewer/SceneSettings.tsx` - Scene configuration
  - `viewer/ViewModeToolbar.tsx` - View mode switching
  - `walkthrough/` - Walkthrough CRUD components
  - `auth/ProtectedRoute.tsx` - Route guard
- **API Layer**: `api/client.ts` (axios instance with auth interceptor), `api/walkthroughs.ts`, `api/issuesApi.ts`, `api/usersApi.ts`, `api/assetsApi.ts`
- **State**: `stores/authStore.ts` (Zustand + persist)
- **Types**: `types/index.ts` (User, UserRole, Walkthrough, Scene, Issue, Asset, etc.)

## Backend Structure (backend/src/)
- **Entry**: `index.ts` (Express + CORS + JSON middleware)
- **Routes**: `routes/` (auth, dashboard, walkthroughs, scenes, hotspots, hotspot-media, hotspot-links, ai, issuesRoutes, assetsRoutes, orgs, inspections, qrcode, reports, index.ts)
- **Services**: `services/issue.service.ts`, `services/ai.service.ts`, `services/asset.service.ts`, `services/inspection.service.ts`, `services/qrcode.service.ts`, `services/report.service.ts`
- **Database**: `config/database.ts` (JSON file-based, NOT SQLite), `data/db.json`
- **Types**: `types/issue.ts`, `types/asset.ts`

## Database Flow
- **Type**: JSON file store (`backend/data/db.json`)
- **Wrapper**: `config/database.ts` emulates SQLite API (prepare/run/all/get)
- **Tables**: users, walkthroughs, scenes, navigation_edges, ai_tags, issues, assets, versions, walkthrough_members, comments, hotspot_media, hotspot_links, organizations
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

### Issue Management Flow (Spatial Pinning)
`WalkthroughViewer.tsx` → Issues tab → `Viewer360` (renders `IssueMarker` components at yaw/pitch)
  → click panorama in placement mode → `handlePlaceIssue` → prompt for title/description
  → `issuesApi.create()` → POST `/api/issues` → `issuesRoutes.ts` → `issue.service.createIssue()` (stores yaw, pitch, floor, room)
  → `db.issues` → marker appears on panorama

### Issue Dashboard Flow
`Header.tsx` (nav link) → `/issues` route → `IssueListPage.tsx` → `issuesApi.getAll()` → GET `/api/issues` → returns list → renders UI

### Walkthrough Flow
`Dashboard.tsx` → TanStack Query `walkthroughApi.getAll()` → GET `/api/walkthroughs` → `walkthroughRoutes.ts` → walkthrough service → `db.walkthroughs` → returns list → renders cards

### Image Upload Flow
`WalkthroughViewer.tsx` → `hotspot-media.ts` API → POST `/api/hotspot-media` → `hotspotMediaRoutes.ts` → storage service → `backend/storage/` → DB record

### Asset Management Flow
`AssetManagement.tsx` → `assetsApi.getAll()` → GET `/api/assets` → `assetsRoutes.ts` → `asset.service.ts` → `db.assets` → returns list
`Viewer360.tsx` → `AssetMarker` components rendered at yaw/pitch → click to view/edit → `AssetFormModal` → `assetsApi.create/update()` → POST/PUT `/api/assets`

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
- `backend/src/routes/assetsRoutes.ts`
- `frontend/src/api/client.ts`
- `frontend/src/api/walkthroughs.ts`
- `frontend/src/api/assetsApi.ts`

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
1. Issue CREATE bug (fixed: misaligned `INSERT` query arguments caused JSON database wrapper to serialize wrong columns)
2. Backend requires `db:init` script (json db creates file automatically)
3. `frontend/src/api/issuesApi.ts` is now fully implemented (was empty) — IssueListPage uses it via TanStack Query
4. Issue service uses SQLite-style API but DB is JSON file (works via emulation)
5. CORS may block requests if frontend port differs
6. Blank screen on walkthrough click (fixed: corrected missing prop destructuring in Viewer360.tsx and added Suspense boundary)
7. Issue management CRUD (fixed: standardized backend response format, implemented update/delete logic on both ends, and replaced prompt with proper modal)
8. Enterprise transitions (added: zoom-into-hotspot effect using smooth FOV interpolation)
9. Blank screen on walkthrough click V2 (fixed: added missing useFrame import in Viewer360.tsx)
10. Enterprise Scene Transitions V2 (added: directional zoom support via OrbitControls setAzimuthalAngle, and Smart Preview Tooltips on hover).
11. Enterprise Issue Management V2 (added: expanded schema for assignment, due dates, SLAs, automated history tracking; IssueForm with tabs; threaded comments fully implemented in backend + frontend)
12. Configurable Scene Transitions (added: ability to choose `zoom-fade`, `fade`, `pan-slide`, `instant` per hotspot in HotspotEditor and execute them dynamically).
13. Issue CSV Export (implemented: backend route `/api/issues/export/csv`, frontend button in IssueListPage)
14. Dashboard Charts (implemented: Recharts integration via `DashboardCharts.tsx` — Area, Bar, Pie charts for issue trends, types, priorities, status)
15. Issue Attachments UI implemented (added: expandable attachment panel in IssueListPage with upload, list, preview, and delete; backend `POST/GET/DELETE /api/issues/:id/attachments` routes + `addAttachment/getAttachments/deleteAttachment` in service; frontend API ready)
16. User Management routes exist (backend `routes/users.ts` with GET/POST/PUT/DELETE, auth middleware, role checks) but NOT mounted in `routes/index.ts` — frontend UI missing
17. Frontend `types/issue.ts` is outdated (uses old status values `in-progress`/`resolved`/`closed`, missing `priority`, `floor`, `room`, `attachments`, `comments`, `history` fields) — backend `types/issue.ts` is the correct reference
18. Dashboard API enhanced (backend `dashboard.service.ts` provides `getStats`, `getActivity`, `getIssuesByStatus`, `getIssuesByType`, `getIssuesByPriority`, `getIssueTrend`; frontend `api/dashboard.ts` fully wired)
19. Dashboard UI enhanced (date range filter with quick 7d/30d/90d buttons, property-specific dashboard via `?walkthroughId=`, KPI cards with overdue/critical counts, activity feed)
20. Issue SLA Timer + Auto-Escalation (backend: `checkAndEscalateSLA()` in `issue.service.ts` with priority escalation rules, `getSlaStats()` for stats; API: `POST /api/issues/sla/check` and `GET /api/issues/sla/stats`; frontend: live countdown via `setInterval`, SLA stats in header, manual "Run SLA Check" button)
21. Asset TypeScript Build Error (fixed: `status` field in `AssetFormModal.tsx` and `AssetManagement.tsx` used `as const` which narrowed type to `'active'` only, changed to `as Asset['status']` to match union type `'active' | 'maintenance' | 'retired'`)

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

22. RBAC Implemented (added: org/property-level permissions via `backend/src/middleware/rbac.ts`, role hierarchy `ROLE_HIERARCHY` in `backend/src/types/user.ts`, route protection with `requirePermission` middleware for assets, issues, walkthroughs).
23. Org Model implemented (organizations table added to JSON DB, backend CRUD service and routes (`org.service.ts`, `orgs.ts`), TypeScript type `Org`, frontend API `orgsApi.ts`).
24. Permission Matrix UI added (frontend page `PermissionMatrix.tsx` displays role‑based permissions matrix, accessible via `/permission-matrix`).
157: 25. Smooth Transitions & Target View Capture (added: real-time camera orientation tracking in `viewerStore`, "Capture Current View" button in `HotspotEditor`, and smooth crossfade transitions in `Viewer360`).
158: 26. Black Screen Bug Fix (fixed: missing `opacity` prop in `SceneContent` component caused scene to remain invisible after refactor).
159: 27. Performance Optimization (fixed: high-frequency camera rotation updates in `viewerStore` were causing massive re-renders of the entire `WalkthroughViewer` component. Switched to specific selectors and added meaningful change threshold).
160: 28. Module 1.1 Inspection Mode implemented (added: `InspectionSidebar.tsx` component with red overlay UI, safety checklist with categories (Safety, Structural, Electrical, Plumbing, HVAC, Fire Safety, Accessibility, Cleanliness), required vs optional item tracking, progress tracking, export functionality, integrated into `WalkthroughViewer` with mode toggle).
161: 29. Module 1.2 Maintenance Mode implemented (added: `MaintenanceOverlay.tsx` component with asset tag highlighting, work order context, work order creation and management, priority-based filtering and status tracking, asset-to-work-order mapping, integrated into `WalkthroughViewer` with mode toggle).
162: 30. Module 1.3 Emergency Mode implemented (added: `EmergencyOverlay.tsx` component with red banners, emergency contacts display, evacuation routes with distance/time estimates, emergency reporting system (fire, medical, flood, power, security, other), safety guidelines, integrated into `WalkthroughViewer` with mode toggle).
163: 31. Module 1.4 Guided Tour Mode implemented (added: `TourControls.tsx` component with auto-advance scenes, configurable duration, narration text display, step counter and progress tracking, playback controls (play/pause/stop/next/previous), integrated into `WalkthroughViewer` with new Tour tab).
164: 32. Module 1.5 Floor Navigation UI implemented (added: `FloorSelector.tsx` component with floor selector, scene filtering by floor, scene count per floor, quick navigation between floors, integrated into `WalkthroughViewer` Scenes tab).
165: 33. Module 1.6 Hotspot Permissions implemented (added: `required_role` field to Hotspot type in backend and frontend, backend role-based filtering, `PinPrompt.tsx` component for restricted hotspots, visual lock indicators on restricted hotspots, role hierarchy checks in `HotspotMarker.tsx`).
166: 34. Module 1.7 Hotspot Categories implemented (added: `HotspotCategory` enum (navigation, information, warning, issue, media, document, custom), `HotspotFilters.tsx` component with dynamic filtering by category, category counts and visual indicators, integrated into `WalkthroughViewer` Hotspots tab).
167: 35. Module 1.8 Smart Scene Switch implemented (added: `Breadcrumbs.tsx` component, `navigation.ts` utilities with nearest scene suggestions, breadcrumb trail navigation, back button functionality, navigation utilities for scene relationships, integrated into `WalkthroughViewer` Scenes tab).
168: 36. Module 1.9 Minimap implemented (added: `Minimap.tsx` component with 2D floor plan rendering, real-time position tracking with camera orientation, click-to-jump scene functionality, floor-specific views, integrated into `WalkthroughViewer` with new Map tab).
169: 37. Module 1.10 Hotspot Clustering implemented (added: `MarkerCluster.tsx` component for grouping overlapping markers into cluster icons, displays count and expands on click, zoom-based unclustering, applied to hotspots, issues, and assets in `Viewer360.tsx`).
170: 38. Additional Backend Services implemented (added: `inspection.service.ts` for inspection management with CRUD operations, `qrcode.service.ts` for QR code generation with data URL and buffer output, `report.service.ts` for PDF report generation using Puppeteer).
171: 39. Additional Frontend Components implemented (added: `SceneGraphEditor.tsx` for visual scene graph editing with React Flow, `LifecycleTab.tsx` for asset lifecycle management, `QRModal.tsx` for QR code generation, `BulkUpload.tsx` for bulk file uploads, `MediaManager.tsx` for media management, `NadirPatch.tsx` for nadir patch editing, `SceneSettings.tsx` for scene configuration, `ViewModeToolbar.tsx` for view mode switching).
172: 40. Database Schema updated (added: `assets` and `organizations` tables to JSON database schema in `config/database.ts`, updated table list in documentation).
