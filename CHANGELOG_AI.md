# CHANGELOG_AI.md - AI-Assisted Changes

All changes made by Claude Code or other AI assistants are logged here for audit, rollback, and context.

---

## 2026-04-24

### Issue: Issue Management Panel Not Visible in UI
**Issue:**
- Issue management components existed (`IssueListPage.tsx`, `CreateIssueForm.tsx`, `EditIssueStatus.tsx`) but were not accessible
- No route defined in `App.tsx` for `/issues` path
- No navigation link in `Header.tsx` to access the issue management feature
- User could not see or use the issue management functionality

**Fix:**
1. Added `IssueListPage` import and `/issues` route to `frontend/src/App.tsx`
2. Added navigation links ("Dashboard" and "Issue Management") to `frontend/src/components/layout/Header.tsx`
3. Route is protected with `ProtectedRoute` component (requires authentication)

**Files changed:**
- `frontend/src/App.tsx` (added import + route)
- `frontend/src/components/layout/Header.tsx` (added nav links)

**Risk:**
- LOW - Frontend-only changes, no backend modifications
- Added route is protected (same auth pattern as other routes)
- Navigation links only visible on md+ screens (`hidden md:flex`)
- No breaking changes to existing functionality

**How to verify:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login at `http://localhost:5173`
4. Look for "Issue Management" link in header
5. Click to navigate to `/issues` route

---

## 2026-04-24

### Issue: Project Documentation Missing for AI Debugging
**Issue:**
- No structured documentation for AI assistants (Claude Code, Aider)
- No architecture maps or critical file lists
- No debugging checkpoints documented
- Future AI sessions would lack context on project structure

**Fix:**
Created three documentation files:
1. `MEMORY.md` - Project memory with overview, structure, flows, critical files, known issues, dangerous areas
2. `AIDER_CONTEXT.md` - Aider-specific context with priority files, dependency relationships, debugging checkpoints
3. `TOOL_NOTES.md` - Tool usage notes for Claude Code, Aider, OpenRouter/LM Studio

**Files changed:**
- `MEMORY.md` (new file)
- `AIDER_CONTEXT.md` (new file)
- `TOOL_NOTES.md` (new file)

**Risk:**
- NONE - Documentation only, no code changes
- Files are in `.gitignore` patterns? (verify - they should be committed for team visibility)

**How to verify:**
- Read any of the three files to confirm structure
- Files are in repo root directory

---

## 2026-04-25

### Issue: Implement Spatial Issue Pinning (Phase 1 of Issue Management Upgrade)
**Issue:**
- User wanted to upgrade issue management with spatial pinning (click exact location in panorama, drop marker/pin, attach issue to hotspot, support multiple pins per scene)
- Existing issue management had basic components but no spatial awareness
- No way to place issues directly on 360° panorama at specific (yaw, pitch) coordinates

**Fix: (Phase 1 – Spatial Issue Pinning)**
1. **Extended Issue model** (backend and frontend) with spatial fields: `yaw`, `pitch`, `floor?`, `room?`
2. **Created IssueMarker component** (`frontend/src/components/viewer/IssueMarker.tsx`) – renders 3D markers in panorama at (yaw, pitch) with status‑based colors
3. **Updated Viewer360** to accept `issueMarkers`, `onPlaceIssue`, `isPlacingIssue` props and render IssueMarker components
4. **Updated WalkthroughViewer** with new “Issues” tab in sidebar, issue placement mode, and `issuesApi` integration
5. **Created frontend Issue types** (`frontend/src/types/issue.ts`) and fully implemented `frontend/src/api/issuesApi.ts`
6. **Updated backend issue service and routes** to handle new fields and support filtering by `scene_id` / `walkthrough_id`

**Files changed:**
- `backend/src/types/issue.ts` – added yaw, pitch, floor, room fields to Issue interface
- `backend/src/services/issue.service.ts` – updated createIssue to persist spatial fields
- `backend/src/routes/issuesRoutes.ts` – added query‑param filtering (scene_id, walkthrough_id)
- `frontend/src/types/issue.ts` – new file, frontend Issue interface + CreateIssueData
- `frontend/src/api/issuesApi.ts` – new file, full CRUD API functions
- `frontend/src/components/viewer/IssueMarker.tsx` – new file, 3D marker component
- `frontend/src/components/viewer/Viewer360.tsx` – added issue marker rendering + placement handling
- `frontend/src/pages/WalkthroughViewer.tsx` – added Issues tab, placement mode, issue fetching

**Risk:**
- LOW – All changes are additive (new fields, new components). No existing functionality is removed.
- The JSON database (`backend/data/db.json`) auto‑persists new fields; no migration needed.
- IssueMarker follows the same pattern as existing HotspotMarker.
- The new Issues tab is only visible when viewing a walkthrough; does not affect other pages.

**How to verify:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login at `http://localhost:5173`, open a walkthrough
4. Click the “Issues” tab in the sidebar
5. If in Edit mode, click “Place Issue Pin” button
6. Click anywhere on the 360° panorama – a prompt will ask for title/description
7. After submitting, an issue marker (colored dot) appears at that location
8. Refresh the page – marker persists (data saved to `db.json`)

---

## 2026-04-25

### Issue: Blank Screen when Opening Existing Walkthrough
**Issue:**
- Clicking on a walkthrough card in the Dashboard resulted in a completely blank screen instead of the 360 viewer.
- **Root Cause:** A `ReferenceError` in `Viewer360.tsx` because props (`issueMarkers`, `isPlacingIssue`, `onPlaceIssue`) were being used in the component's JSX but were not destructured from the props object in the function signature.
- Additionally, the `Sphere360` component used `useTexture` (which suspends) without a `Suspense` boundary, which could cause the UI to unmount or crash if a texture failed to load or took too long.

**Fix:**
1. Corrected the destructuring of props in `frontend/src/components/viewer/Viewer360.tsx` to include `issueMarkers`, `isPlacingIssue`, and `onPlaceIssue`.
2. Added `Suspense` import and wrapped the `SceneContent` component inside the `<Canvas>` with a `<Suspense fallback={null}>` boundary.

**Files changed:**
- `frontend/src/components/viewer/Viewer360.tsx` (fixed destructuring + added Suspense)

**Risk:**
- VERY LOW - Correcting a ReferenceError is a safe and necessary change. Adding a Suspense boundary is a React best practice for components that use Suspense-enabled hooks.

**How to verify:**
1. Login to the application.
2. Click on any existing walkthrough card in the Dashboard.
3. The walkthrough viewer should now load correctly instead of showing a blank screen.

---

## 2026-04-25

### Issue: Broken Issue Management & Basic Scene Transitions
**Issue:**
- **Issue Management:** Creation worked partially but editing and deleting were completely unimplemented on both frontend and backend. Listing issues failed because of a response format mismatch between frontend (expecting `{ success, data }`) and backend (returning raw objects).
- **Transitions:** Scene switching was a simple fade-out/fade-in, lacking the "enterprise" feel requested by the user.

**Fix:**
1. **Backend Standardization:** Updated `issuesRoutes.ts` to wrap all responses in `{ success: true, data: ... }`.
2. **Issue CRUD Implementation:**
   - Added `updateIssue` and `deleteIssue` to `backend/src/services/issue.service.ts`.
   - Added `PUT /api/issues/:id` and `DELETE /api/issues/:id` to `backend/src/routes/issuesRoutes.ts`.
3. **Advanced UI:**
   - Created `IssueFormModal.tsx` to provide a professional form experience.
   - Integrated the modal into `WalkthroughViewer.tsx`, replacing `prompt()`.
   - Added Edit and Delete actions to the issue list in the sidebar.
4. **Enterprise Transitions:**
   - Implemented a "Zoom & Fade" effect in `Viewer360.tsx`.
   - Added smooth FOV (Field of View) interpolation using `useFrame` to create a zooming effect when moving between scenes.
   - **Fixed Blank Screen Bug:** Added missing `useFrame` import from `@react-three/fiber` which was causing a crash in `SceneContent`.

**Files changed:**
- `backend/src/services/issue.service.ts` (added update/delete)
- `backend/src/routes/issuesRoutes.ts` (added routes + standardized responses)
- `frontend/src/components/viewer/IssueFormModal.tsx` (new component)
- `frontend/src/pages/WalkthroughViewer.tsx` (integrated modal + CRUD)
- `frontend/src/components/viewer/Viewer360.tsx` (implemented zoom transitions + fixed missing import)

**Risk:**
- LOW - The changes are mostly additive or corrective. Standardizing the backend response format fixed a pre-existing bug.
- Performance: FOV interpolation in Three.js is lightweight.

**How to verify:**
1. Open any walkthrough.
2. Go to the "Issues" tab.
3. Place a new issue using the new modal.
4. Edit or delete an existing issue.
5. Click a hotspot to navigate and observe the smooth zoom-in transition.

## 2026-04-25
### Issue: Enterprise Scene Transitions & Issue Management Upgrade

**Issue:**
The user requested "Enterprise-Level" Scene Transitions (directional zoom, smart previews) and a "Critical" Issue Management System (assignments, workflows, history, SLA priority). 

**Fix:**
- **Transitions**: Added `initialOrientation` support to `Viewer360.tsx` which updates `OrbitControls.setAzimuthalAngle` so users face the correct direction when navigating between scenes. Added universal Smart Preview Tooltips to `AnimatedHotspot.tsx` to preview the target scene details on hover.
- **Issue Management**: Expanded the emulated DB schema in `issue.service.ts` to support `priority`, `assigned_to`, `due_date`, and `history`. Rewrote `IssueFormModal.tsx` into a tabbed interface (Details, Workflow, History) with full support for workflow statuses.

**Files changed:**
- `backend/src/services/issue.service.ts` (expanded schema and history generation)
- `frontend/src/types/issue.ts` (synced types)
- `frontend/src/components/viewer/IssueFormModal.tsx` (added tabs and workflow logic)
- `frontend/src/pages/WalkthroughViewer.tsx` (passed orientation state to Viewer360)
- `frontend/src/components/viewer/Viewer360.tsx` (applied directional orientations to camera)
- `frontend/src/components/viewer/AnimatedHotspot.tsx` (added Smart Preview tooltips)

**Risk:**
- LOW - Enhancements safely injected into the existing logic without breaking prior features.

**How to verify:**
1. Hover over a hotspot to see the new Smart Preview Tooltip.
2. Click a hotspot to observe directional transitions.
3. Open an issue and use the new tabbed UI to assign a user, change the status, and view the automated audit history.

---

## 2026-04-25
### Issue: Issue Management Save Bug & Custom Scene Transitions

**Issue:**
The user reported that the Issue management feature was still not working. Additionally, the user requested the ability to choose their own scene transition style from a list instead of having it automatically assigned.

**Fix:**
- **Issue Management**: Found and fixed a critical parameter misalignment bug in `backend/src/services/issue.service.ts`. The `INSERT` query contained a hardcoded `'open'` value inside `VALUES (...)` which caused the generic JSON database wrapper to assign the wrong data properties to columns (e.g. `history` was populated with the timestamp instead of the history array), corrupting the JSON file. Cleared the corrupted issues from `db.json` and fixed the SQL query.
- **Custom Transitions**: Added `transitionStyle` to Hotspot metadata. Updated `HotspotEditor.tsx` to include an enterprise-grade Scene Transition dropdown (`zoom-fade`, `fade`, `pan-slide`, `instant`). Updated `WalkthroughViewer.tsx` and `Viewer360.tsx` to read the selected transition and execute the corresponding animation.

**Files changed:**
- `backend/src/services/issue.service.ts` (fixed INSERT query values)
- `frontend/src/components/viewer/HotspotEditor.tsx` (added Transition Style dropdown)
- `frontend/src/components/viewer/HotspotMarker.tsx` (passed transition style to onNavigate)
- `frontend/src/components/viewer/AnimatedHotspot.tsx` (passed transition style to onNavigate)
- `frontend/src/pages/WalkthroughViewer.tsx` (handled transition state)
- `frontend/src/components/viewer/Viewer360.tsx` (applied custom transition animations)

**Risk:**
- LOW - Fixed a major backend bug preventing issue creation. Custom transitions degrade gracefully if not provided.

**How to verify:**
1. Open the Hotspot Editor and create/edit a hotspot. Observe the new "Scene Transition" dropdown.
2. Select different transition styles (e.g. Pan & Slide) and navigate to see the custom effect.
3. Open the Issues tab and create a new Issue. It should save properly without crashing the UI, and history tracking will correctly record the event.

---

## YYYY-MM-DD

### Issue: [Short description]

**Issue:**
[What was wrong, what the user reported, what you found]

**Fix:**
[What you changed, how you fixed it, any workarounds]

**Files changed:**
- `path/to/file1.ts` (what changed)
- `path/to/file2.tsx` (what changed)

**Risk:**
- HIGH/MEDIUM/LOW - [Why, what could break, rollback steps]

**How to verify:**
[Steps to test the fix, curl commands, UI paths, etc.]

---


## 2026-04-27

### Issue: User Management API endpoints missing `/api` prefix
**Issue:**
- The frontend `usersApi.ts` incorrectly called `/users` endpoints, causing 404 errors and preventing the User Management panel from displaying users.

**Fix:**
- Updated all user API calls (`getAll`, `create`, `update`, `delete`) to use `/api/users`.
- Verified that the backend routes are mounted at `/api/users` and that an admin user exists in the JSON DB.

**Files changed:**
- `frontend/src/api/usersApi.ts` (added `/api` prefix to all endpoints)

**Risk:**
- LOW – Only path strings changed; no functional logic altered.

**How to verify:**
1. Start backend and frontend servers.
2. Log in as admin (`admin` / `admin123`).
3. Navigate to User Management (`/users`).
4. The user list should load without errors.


### Issue: Issue SLA Timer + Auto-Escalation (Phase 1.12)

**Issue:**
- Issues have `due_date` and `priority` fields but no SLA enforcement
- No visual countdown timer for overdue issues
- No automatic escalation when SLA is breached
- Users couldn't see SLA statistics or trigger manual checks

**Fix:**
1. **Backend SLA Logic (`backend/src/services/issue.service.ts`):**
   - Added `checkAndEscalateSLA()` function that scans issues for breaches
   - Escalation rules:
     * ≥1 day overdue: priority upgrade (low→medium→high→critical)
     * ≥3 days overdue: status → 'pending_approval' (manager escalation)
   - Added `getSlaStats()` for dashboard metrics
   - Each escalation creates history entries with system audit trail

2. **API Endpoints (`backend/src/routes/issuesRoutes.ts`):**
   - `POST /api/issues/sla/check` - Trigger manual SLA check
   - `GET /api/issues/sla/stats` - Get SLA statistics

3. **Frontend UI (`frontend/src/components/issueManagement/IssueListPage.tsx`):**
   - Live countdown timer (updates every minute via `setInterval`)
   - SLA stats in header: tracked issues, overdue count, critical overdue
   - "Run SLA Check" button for manual escalation
   - Updated `getSlaInfo()` uses live clock for accurate countdown
   - Added SLA stats query via `issuesApi.getSlaStats()`

**Files changed:**
- `backend/src/services/issue.service.ts` (added SLA escalation logic)
- `backend/src/routes/issuesRoutes.ts` (added SLA endpoints)
- `frontend/src/api/issuesApi.ts` (added SLA API methods)
- `frontend/src/components/issueManagement/IssueListPage.tsx` (SLA UI + live timer)

**Risk:**
- MEDIUM - Backend logic changes issue priority/status automatically
- Mitigation: Only affects open/in_progress issues; creates audit history
- All changes are additive; existing functionality preserved

**How to verify:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login at `http://localhost:5173`
4. Navigate to Issues page (`/issues`)
5. Verify SLA stats in header (top-right, hidden on mobile)
6. Create an issue with past due date to see countdown turn red
7. Click "Run SLA Check" to trigger manual escalation
8. Check issue history for SLA escalation entries
9. Verify priority/status changes per escalation rules

---

## 2026-04-25

### Issue: Issue File Attachments UI (Phase 1.9)

**Issue:**
- Issue file attachments backend was ready (`POST/GET/DELETE /api/issues/:id/attachments` routes + service functions), but the frontend UI for listing, previewing, and deleting attachments was missing.
- `IssueListPage.tsx` had no attachment panel, upload controls, or attachment list.
- Users could not see or manage file attachments for issues.

**Fix:**
1. **Updated IssueListPage.tsx** with full attachment UI:
   - Added attachment expand/collapse toggle per issue card with `Paperclip` icon.
   - Added file upload controls (file input + upload button) using `issuesApi.uploadAttachment`.
   - Added attachment list display with file type icons (`Image` for images, `FileText` for documents).
   - Added attachment deletion with confirmation via `issuesApi.deleteAttachment`.
   - Integrated `useQuery` for fetching attachments when panel is expanded.
   - Added `useMutation` for upload and delete operations with cache invalidation.
2. **Updated imports** to include `useQuery` from TanStack Query and attachment-related icons.
3. **Added state management** for expanded issue ID and selected file for upload.

**Files changed:**
- `frontend/src/components/issueManagement/IssueListPage.tsx` (added attachment UI, upload/list/delete functionality, updated imports)

**Risk:**
- LOW - Frontend-only changes adding UI for existing backend functionality. No database or API changes.
- The attachment panel is opt-in (users click to expand), so it doesn't affect existing issue display.
- File uploads use existing backend `storage.service.ts` which saves to `backend/storage/issues/`.

**How to verify:**
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login at `http://localhost:5173`
4. Navigate to Issues page (`/issues`)
5. Click "Show Attachments" on any issue card
6. Select a file using the file input and click "Upload"
7. Verify the file appears in the attachment list with correct icon
8. Click the trash icon to delete an attachment
9. Verify the attachment is removed from the list

---
