# AIDER DEBUGGING MAP - 360 Spatial Tours

> Complete code tree for debugging with small AI models. Shows file relationships, data flow, and component dependencies.

---

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  Port: 5173  │  Proxy: /api → localhost:3000  │  State: Zustand │
├─────────────────────────────────────────────────────────────────┤
│  Pages → Components → API Client → Axios (with interceptors)    │
│  Stores: authStore, viewerStore, hotspotStore, aiTagStore       │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express + TypeScript)             │
│  Port: 3000  │  DB: JSON (db.json)  │  Storage: /storage        │
├─────────────────────────────────────────────────────────────────┤
│  Routes → Services → Database Wrapper → JSON File               │
│  Middleware: auth, error, upload (multer)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## FILE TREE BY LAYER

### BACKEND (`backend/src/`)

```
backend/src/
├── index.ts                      # ⭐ ENTRY POINT - Express app setup, route registration
├── database.ts                   # ⭐ JSON DB wrapper (prepare/get/all/run)
├── config/
│   ├── database.ts               # ⭐ Database module (JSON-based, same as above)
│   ├── database-simple.ts        # Mock DB (fallback)
│   ├── storage.ts                # ⭐ File paths, initializeStorage(), getFileUrl()
│   └── lmstudio.ts               # AI model config
├── middleware/
│   ├── auth.ts                   # ⭐ authenticate(), requireRole() - JWT validation
│   ├── error.ts                  # ⭐ errorHandler(), notFoundHandler(), AppError class
│   └── upload.ts                 # Multer config for file uploads
├── routes/
│   ├── index.ts                  # Sub-router (issues)
│   ├── auth.ts                   # ⭐ /api/auth/* - login, register, /me
│   ├── walkthroughs.ts           # ⭐ /api/walkthroughs/* - CRUD
│   ├── scenes.ts                 # ⭐ /api/walkthroughs/:id/scenes - upload, list
│   ├── hotspots.ts               # /api/hotspots/*
│   ├── hotspot-media.ts          # /api/hotspot-media/*
│   ├── hotspot-links.ts          # /api/hotspot-links/*
│   ├── dashboard.ts              # /api/dashboard/* - stats, activity
│   ├── ai.ts                     # /api/ai/* - tagging, processing
│   └── issuesRoutes.ts           # /api/issues/*
├── services/
│   ├── auth.service.ts           # ⭐ JWT generate/verify, password hash
│   ├── walkthrough.service.ts    # ⭐ CRUD walkthroughs, scene_count
│   ├── scene.service.ts          # ⭐ CRUD scenes, file management
│   ├── hotspot.service.ts        # ⭐ CRUD navigation_edges (hotspots)
│   ├── hotspot-media.service.ts  # Hotspot media attachments
│   ├── hotspot-links.service.ts  # Hotspot link management
│   ├── dashboard.service.ts      #  Stats aggregation, activity feed
│   ├── ai.service.ts             # AI processing, tagging
│   ├── issue.service.ts          # Issue CRUD
│   ├── storage.service.ts        # File save, thumbnail generation
│   └── auth.service.ts           # (duplicate - see above)
├── types/
│   ├── user.ts                   # ⭐ UserRole, Permission, hasRole()
│   └── issue.ts                  # Issue type definitions
├── utils/
│   ├── helpers.ts                # ⭐ generateId(), sanitizeFileName()
│   └── generateId.ts             # UUID wrapper
└── controllers/
    └── issueController.ts        # Issue handling logic
```

### FRONTEND (`frontend/src/`)

```
frontend/src/
├── main.tsx                      # ⭐ ENTRY POINT - React root, providers
├── App.tsx                       # ⭐ ROUTER - Dashboard, WalkthroughViewer, Login
├── vite.config.ts                # ⭐ Proxy config: /api → localhost:3000
├── api/
│   ├── client.ts                 # ⭐ Axios instance, interceptors (auth token)
│   ├── walkthroughs.ts           # walkhroughApi - getAll, getById, create, update
│   ├── scenes.ts                 # scenesApi - getByWalkthrough, upload, update
│   ├── hotspots.ts               # hotspotsApi - getByScene, create, update
│   ├── hotspot-media.ts          # Hotspot media API
│   ├── hotspot-links.ts          # Hotspot links API
│   ├── auth.ts                   # authApi - login, register
│   ├── dashboard.ts              # dashboardApi - getStats, getActivity
│   ├── ai.ts                     # aiApi - processScene, getTags
│   └── issuesApi.ts              # Issues API calls
├── pages/
│   ├── Dashboard.tsx             # ⭐ Main page - walkthrough list, stats
│   ├── WalkthroughViewer.tsx     # ⭐ 3D viewer, scene navigation, hotspots
│   ├── Login.tsx                 # Login form
│   └── Register.tsx              # Registration form
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # Top navigation
│   │   └── Sidebar.tsx           # Side panel (scenes, hotspots, AI, graph)
│   ├── auth/
│   │   └── ProtectedRoute.tsx    # ⭐ Auth guard - redirect if not logged in
│   ├── walkthrough/
│   │   ├── WalkthroughForm.tsx   # Create/edit walkthrough
│   │   ├── SearchFilterBar.tsx   # Filter controls
│   │   └── DeleteConfirmModal.tsx# Delete confirmation
│   ├── viewer/
│   │   ├── Viewer360.tsx         # ⭐ Three.js canvas, OrbitControls
│   │   ├── Sphere360.tsx         # 360 sphere mesh
│   │   ├── HotspotMarker.tsx     # ⭐ Hotspot 3D marker
│   │   ├── AnimatedHotspot.tsx   # Animated hotspot variant
│   │   ├── HotspotOverlay.tsx    # Hotspot UI overlay
│   │   ├── HotspotEditor.tsx     # Edit hotspot positions
│   │   ├── NavigationControls.tsx# Navigation UI
│   │   ├── SceneList.tsx         # Scene thumbnails
│   │   ├── SceneSettings.tsx     # Scene configuration
│   │   ├── BulkUpload.tsx        # Multi-image upload
│   │   ├── ViewModeToolbar.tsx   # View/Edit/Share mode toggle
│   │   ├── MediaManager.tsx      # Media attachments
│   │   └── NadirPatch.tsx        # Nadir image overlay
│   ├── graph/
│   │   ├── SceneGraphEditor.tsx  # Node graph visualization
│   │   ├── SceneNode.tsx         # Graph node component
│   │   └── GraphToolbar.tsx      # Graph controls
│   ├── ai/
│   │   ├── AITagMarker.tsx       # AI tag 3D marker
│   │   ├── AITagOverlay.tsx      # AI tag UI
│   │   ├── AITagFilter.tsx       # Filter by AI tags
│   │   ├── TagEditor.tsx         # Edit AI tags
│   │   ├── AIProcessingPanel.tsx # AI processing UI
│   │   ├── AIProcessingStatus.tsx# Processing indicator
│   │   └── ProcessingProgress.tsx# Progress bar
│   ├── dashboard/
│   │   ├── StatCards.tsx         # Dashboard statistics
│   │   └── ActivityFeed.tsx      # Recent activity
│   └── issueManagement/
│       ├── CreateIssueForm.tsx   # Create issue
│       ├── EditIssueStatus.tsx   # Edit issue status
│       └── IssueListPage.tsx     # Issue list view
├── stores/
│   ├── authStore.ts              # ⭐ User state, token, canEdit/canDelete
│   ├── viewerStore.ts            # Current scene, viewer state
│   ├── hotspotStore.ts           # ⭐ Hotspot state, pendingHotspot
│   ├── aiTagStore.ts             # AI tag filter state
│   └── issueStore.ts             # Issue state
├── hooks/
│   └── autosave.tsx              # Autosave hook
├── utils/
│   └── graphUtils.ts             # Graph helpers
└── types/
    └── index.ts                  # ⭐ TypeScript interfaces (Scene, Walkthrough, etc.)
```

### DATA LAYER (`backend/`)

```
backend/
├── data/
│   └── db.json                   # ⭐ DATABASE - All tables in JSON
└── storage/
    └── walkthroughs/
        └── {walkthrough_id}/
            ├── scenes/           # Original 360 images
            ├── thumbnails/       # Generated thumbnails
            ├── exports/          # Exported packages
            └── nadir/            # Nadir patch images
```

---

## DATA FLOW DIAGRAMS

### 1. WALKTHROUGH LIST (Dashboard)

```
User opens Dashboard
    ↓
Dashboard.tsx: useQuery(['walkthroughs', filters])
    ↓
api/walkthroughs.ts: walkthroughApi.getAll(filters)
    ↓
api/client.ts: axios.get('/api/walkthroughs?search=...')
    ↓
[HTTP GET /api/walkthroughs] → backend:3000
    ↓
backend/index.ts: app.use('/api/walkthroughs', walkthroughRoutes)
    ↓
routes/walkthroughs.ts: GET '/' → walkthroughService.getAll(query)
    ↓
services/walkthrough.service.ts: getAll()
    ↓
config/database.ts: db.prepare('SELECT * FROM walkthroughs').all()
    ↓
backend/data/db.json: Read walkthroughs array
    ↓
[Response] { success: true, data: [...] }
    ↓
Dashboard.tsx: walkthroughs = walkthroughsData?.data
    ↓
Render walkthrough cards
```

**Files involved (in order):**
1. `frontend/src/pages/Dashboard.tsx`
2. `frontend/src/api/walkthroughs.ts`
3. `frontend/src/api/client.ts`
4. `backend/src/index.ts`
5. `backend/src/routes/walkthroughs.ts`
6. `backend/src/services/walkthrough.service.ts`
7. `backend/src/config/database.ts`
8. `backend/data/db.json`

---

### 2. SCENE UPLOAD FLOW

```
User clicks "Upload Scenes" in WalkthroughViewer
    ↓
BulkUpload.tsx: Open file picker
    ↓
User selects images → formData.append('images', files)
    ↓
api/scenes.ts: scenesApi.upload(walkthroughId, formData)
    ↓
api/client.ts: axios.post(..., formData, { headers: multipart/form-data })
    ↓
[HTTP POST /api/walkthroughs/:id/scenes]
    ↓
backend/src/routes/scenes.ts: POST handler
    ↓
middleware/upload.ts: upload.array('images', 20) - Multer processes files
    ↓
middleware/auth.ts: authenticate → requireRole('editor')
    ↓
services/storage.service.ts: storageService.saveFile() - Move to storage/
    ↓
services/storage.service.ts: storageService.generateThumbnail() - Create thumb
    ↓
services/scene.service.ts: sceneService.create(sceneData) - DB insert
    ↓
config/database.ts: db.prepare('INSERT INTO scenes...').run()
    ↓
backend/data/db.json: scenes.push(newScene)
    ↓
[Response] { success: true, data: [createdScenes] }
    ↓
QueryClient invalidates ['scenes']
    ↓
Dashboard/WalkthroughViewer re-fetches scenes
```

**Files involved (in order):**
1. `frontend/src/components/viewer/BulkUpload.tsx`
2. `frontend/src/api/scenes.ts`
3. `backend/src/routes/scenes.ts`
4. `backend/src/middleware/upload.ts`
5. `backend/src/middleware/auth.ts`
6. `backend/src/services/storage.service.ts`
7. `backend/src/services/scene.service.ts`
8. `backend/src/config/database.ts`

---

### 3. AUTHENTICATION FLOW

```
User enters credentials on Login.tsx
    ↓
Login.tsx: loginMutation.mutate({ username, password })
    ↓
api/auth.ts: authApi.login(credentials)
    ↓
api/client.ts: axios.post('/api/auth/login', { username, password })
    ↓
[HTTP POST /api/auth/login]
    ↓
backend/src/routes/auth.ts: POST '/login'
    ↓
services/auth.service.ts: authService.login({ username, password })
    ↓
services/auth.service.ts: getUserByUsername(username)
    ↓
config/database.ts: db.prepare('SELECT * FROM users WHERE username = ?').get()
    ↓
backend/data/db.json: Find user in users[]
    ↓
services/auth.service.ts: bcrypt.compareSync(password, password_hash)
    ↓
services/auth.service.ts: generateToken(user) → jwt.sign()
    ↓
[Response] { success: true, data: { token, user } }
    ↓
frontend/src/pages/Login.tsx: useAuthStore.login(token, user)
    ↓
stores/authStore.ts: persist({ token, user, isAuthenticated: true })
    ↓
React Router: Navigate to '/'
    ↓
ProtectedRoute.tsx: isAuthenticated → render children
```

**Files involved (in order):**
1. `frontend/src/pages/Login.tsx`
2. `frontend/src/api/auth.ts`
3. `backend/src/routes/auth.ts`
4. `backend/src/services/auth.service.ts`
5. `backend/src/config/database.ts`
6. `frontend/src/stores/authStore.ts`
7. `frontend/src/components/auth/ProtectedRoute.tsx`

---

### 4. HOTSPOT CREATION (Navigation)

```
User in WalkthroughViewer clicks "Edit" mode
    ↓
User clicks "Add Hotspot" → isPlacingHotspot = true
    ↓
Viewer360.tsx: handleClick() on scene click
    ↓
Viewer360.tsx: onPlaceHotspot(yaw, pitch)
    ↓
stores/hotspotStore.ts: setPendingHotspot({ yaw, pitch })
    ↓
HotspotEditor.tsx: Shows target scene selector
    ↓
User selects target scene → hotspotsApi.create({ from_scene_id, to_scene_id, yaw, pitch })
    ↓
[HTTP POST /api/hotspots]
    ↓
backend/src/routes/hotspots.ts: POST handler
    ↓
services/hotspot.service.ts: hotspotService.create(data)
    ↓
config/database.ts: db.prepare('INSERT INTO navigation_edges...').run()
    ↓
backend/data/db.json: navigation_edges.push(newHotspot)
    ↓
[Response] { success: true, data: hotspot }
    ↓
QueryClient.invalidateQueries(['hotspots'])
    ↓
HotspotOverlay re-renders with new hotspot
```

**Files involved (in order):**
1. `frontend/src/components/viewer/Viewer360.tsx`
2. `frontend/src/stores/hotspotStore.ts`
3. `frontend/src/components/viewer/HotspotEditor.tsx`
4. `frontend/src/api/hotspots.ts`
5. `backend/src/routes/hotspots.ts`
6. `backend/src/services/hotspot.service.ts`
7. `backend/data/db.json`

---

### 5. SCENE NAVIGATION (3D Viewer)

```
User clicks scene thumbnail in SceneList
    ↓
SceneList.tsx: onSceneSelect(scene)
    ↓
WalkthroughViewer.tsx: handleSceneSelect(scene)
    ↓
stores/viewerStore.ts: setCurrentScene(scene)
    ↓
WalkthroughViewer.tsx: currentScene updates
    ↓
Viewer360.tsx: imageUrl prop changes
    ↓
Viewer360.tsx: useEffect - preload image, fade transition
    ↓
Sphere360.tsx: useTexture(imageUrl) - Three.js loads texture
    ↓
Sphere360.tsx: <mesh> with sphere geometry + texture
    ↓
User drags to look around
    ↓
OrbitControls: Update camera.rotation based on mouse
    ↓
User clicks hotspot
    ↓
HotspotMarker.tsx: handleClick() → onNavigate(to_scene_id, { yaw, pitch })
    ↓
WalkthroughViewer.tsx: handleSceneChange(sceneId, orientation)
    ↓
[Loop back to scene selection]
```

**Files involved (in order):**
1. `frontend/src/components/viewer/SceneList.tsx`
2. `frontend/src/pages/WalkthroughViewer.tsx`
3. `frontend/src/stores/viewerStore.ts`
4. `frontend/src/components/viewer/Viewer360.tsx`
5. `frontend/src/components/viewer/Sphere360.tsx`
6. `frontend/src/components/viewer/HotspotMarker.tsx`

---

## KEY INTERFACES (TypeScript)

### Core Data Types (`frontend/src/types/index.ts`)

```typescript
Walkthrough {
  id, name, client, address, status, description,
  created_at, updated_at, scene_count?
}

Scene {
  id, walkthrough_id, image_path, image_url,
  thumbnail_path?, thumbnail_url?,
  position_x, position_y, position_z, floor, room_name?,
  nadir_image_path?, nadir_image_url?, nadir_scale?, nadir_rotation?, nadir_opacity?
}

Hotspot (NavigationEdge) {
  id, from_scene_id, to_scene_id,
  yaw, pitch, target_yaw?, target_pitch?,
  label?, icon_type?, icon_color?, title?, description?,
  media_type?, media_url?,
  animation_type?, animation_speed?, animation_intensity?
}

AITag {
  id, scene_id, object_type, confidence,
  bounding_box?, tags?[], ai_model?, processed_at
}

Issue {
  id, walkthrough_id, scene_id, ai_tag_id?,
  type, severity, status, title, description?,
  view_angle?, coordinates_3d?, assigned_to?, due_date?
}
```

### API Response Format

```typescript
ApiResponse<T> {
  success: boolean,
  data: T,
  message?: string
}

ApiError {
  success: false,
  error: { message: string, statusCode: number }
}
```

---

## DEBUGGING ANCHORS (Where Logic Lives)

### Authentication Issues
| Symptom | Check This First | Related Files |
|---------|------------------|---------------|
| Can't login | `POST /api/auth/login` response | `backend/src/services/auth.service.ts:72-88` |
| 401 on every request | Token in localStorage, axios interceptor | `frontend/src/api/client.ts:13-31` |
| Redirect loop | ProtectedRoute auth check | `frontend/src/components/auth/ProtectedRoute.tsx:9-29` |
| Token expired | JWT expiration (7 days) | `backend/src/services/auth.service.ts:8-9` |

### Walkthrough/Scene Issues
| Symptom | Check This First | Related Files |
|---------|------------------|---------------|
| Walkthroughs not loading | `GET /api/walkthroughs` response | `backend/src/services/walkthrough.service.ts:66-103` |
| Scenes not showing | `GET /api/walkthroughs/:id/scenes` | `backend/src/routes/scenes.ts:12-37` |
| Image not rendering | imageUrl in Scene object | `frontend/src/components/viewer/Viewer360.tsx:125-168` |
| Upload fails | Multer middleware, storage directory | `backend/src/middleware/upload.ts`, `backend/src/config/storage.ts` |

### Hotspot/Navigation Issues
| Symptom | Check This First | Related Files |
|---------|------------------|---------------|
| Hotspots not appearing | `GET /api/hotspots?scene_id=` | `backend/src/services/hotspot.service.ts:126-169` |
| Can't create hotspot | Pending hotspot state | `frontend/src/stores/hotspotStore.ts` |
| Navigation doesn't work | handleSceneChange callback | `frontend/src/pages/WalkthroughViewer.tsx:109-119` |
| Hotspot in wrong position | yaw/pitch calculation | `frontend/src/components/viewer/Viewer360.tsx:74-97` |

### AI Tag Issues
| Symptom | Check This First | Related Files |
|---------|------------------|---------------|
| AI processing stuck | LM Studio connection | `backend/src/config/lmstudio.ts` |
| Tags not showing | Filter state in aiTagStore | `frontend/src/stores/aiTagStore.ts` |
| Tags in wrong position | bounding_box coordinates | `frontend/src/components/ai/AITagMarker.tsx` |

---

## TARGET FILES FOR COMMON BUGS

### Bug: "Walkthroughs not appearing on dashboard"

**Check these 5 files in order:**

1. `frontend/src/pages/Dashboard.tsx:24-27` - useQuery hook, error state
2. `frontend/src/api/walkthroughs.ts:6-16` - API call construction
3. `backend/src/routes/walkthroughs.ts:9-24` - Route handler
4. `backend/src/services/walkthrough.service.ts:66-103` - getAll() logic
5. `backend/data/db.json` - walkthroughs array has data

**Quick debug commands:**
```bash
# Check API directly
curl http://localhost:3000/api/walkthroughs

# Check DB file
cat backend/data/db.json | jq '.walkthroughs'
```

---

### Bug: "Scene upload fails"

**Check these 5 files in order:**

1. `frontend/src/components/viewer/BulkUpload.tsx` - FormData construction
2. `backend/src/middleware/upload.ts` - Multer config, file filter
3. `backend/src/routes/scenes.ts:40-99` - POST handler, error handling
4. `backend/src/services/storage.service.ts` - saveFile(), generateThumbnail()
5. `backend/src/config/storage.ts` - Directory paths exist

---

### Bug: "Can't navigate between scenes (hotspots not working)"

**Check these 5 files in order:**

1. `frontend/src/components/viewer/HotspotMarker.tsx` - Click handler
2. `frontend/src/stores/hotspotStore.ts` - Hotspot state
3. `backend/src/services/hotspot.service.ts:126-169` - getByScene()
4. `backend/data/db.json` - navigation_edges array
5. `frontend/src/pages/WalkthroughViewer.tsx:109-119` - handleSceneChange

---

### Bug: "401 Unauthorized on protected routes"

**Check these 5 files in order:**

1. `frontend/src/stores/authStore.ts` - Token persisted?
2. `frontend/src/api/client.ts:13-31` - Request interceptor adds Authorization header
3. `backend/src/middleware/auth.ts:22-49` - authenticate() middleware
4. `backend/src/services/auth.service.ts:94-101` - verifyToken()
5. `backend/data/db.json` - users array has user

---

## DATABASE SCHEMA (JSON Tables)

```json
{
  "users": ["id", "username", "email", "password_hash", "role", "created_at"],
  "walkthroughs": ["id", "name", "client", "address", "status", "description", "created_by", "latitude", "longitude", "created_at", "updated_at"],
  "scenes": ["id", "walkthrough_id", "image_path", "thumbnail_path", "position_x", "position_y", "position_z", "floor", "room_name", "notes", "metadata", "nadir_image_path", "nadir_scale", "nadir_rotation", "nadir_opacity", "created_at", "updated_at"],
  "navigation_edges": ["id", "from_scene_id", "to_scene_id", "hotspot_yaw", "hotspot_pitch", "target_yaw", "target_pitch", "label", "icon_type", "icon_color", "title", "description", "media_type", "media_url", "custom_icon_url", "is_locked", "metadata", "animation_type", "animation_speed", "animation_intensity", "icon_size", "opacity", "label_position", "hover_scale", "visible_distance", "always_visible", "background_color", "created_at", "updated_at"],
  "ai_tags": ["id", "scene_id", "walkthrough_id", "object_type", "confidence", "bounding_box", "tags", "ai_model", "processed_at"],
  "issues": ["id", "walkthrough_id", "scene_id", "ai_tag_id", "type", "severity", "status", "title", "description", "view_angle", "coordinates_3d", "assigned_to", "created_by", "due_date", "created_at", "updated_at"],
  "versions": ["id", "walkthrough_id", "version_number", "snapshot_data", "change_description", "created_by", "created_at"],
  "walkthrough_members": ["id", "walkthrough_id", "user_id", "role", "created_at"],
  "comments": ["id", "walkthrough_id", "scene_id", "user_id", "content", "position", "created_at"],
  "hotspot_media": ["id", "hotspot_id", "file_name", "file_type", "file_size", "file_path", "title", "description", "sort_order", "uploaded_by", "created_at", "updated_at"],
  "hotspot_links": ["id", "hotspot_id", "url", "title", "description", "created_at", "updated_at"]
}
```

---

## QUICK REFERENCE: Route → Service → DB Table

| Route | Service | DB Table |
|-------|---------|----------|
| POST /api/auth/login | authService.login() | users |
| POST /api/auth/register | authService.register() | users |
| GET /api/walkthroughs | walkthroughService.getAll() | walkthroughs |
| POST /api/walkthroughs | walkthroughService.create() | walkthroughs |
| GET /api/walkthroughs/:id/scenes | sceneService.getByWalkthrough() | scenes |
| POST /api/walkthroughs/:id/scenes | sceneService.create() | scenes |
| GET /api/hotspots?scene_id= | hotspotService.getByScene() | navigation_edges |
| POST /api/hotspots | hotspotService.create() | navigation_edges |
| GET /api/dashboard/stats | dashboardService.getStats() | (aggregates all) |
| POST /api/ai/process | aiService.processScene() | ai_tags |

---

## ENVIRONMENT CONFIGURATION

### Backend (`.env` or defaults)
```
PORT=3000
JWT_SECRET=spatial-tours-secret-key-2026
JWT_EXPIRES_IN=7d
```

### Frontend (`.env` or defaults)
```
VITE_API_URL=http://localhost:3000
```

### Proxy Config (`frontend/vite.config.ts:14-23`)
```typescript
proxy: {
  '/api': { target: 'http://localhost:3000', changeOrigin: true },
  '/storage': { target: 'http://localhost:3000', changeOrigin: true },
}
```

---

## STATE MANAGEMENT (Zustand Stores)

### authStore
```typescript
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  login(token, user),
  logout(),
  setUser(user),
  setLoading(loading)
}
```

### viewerStore
```typescript
{
  currentScene: Scene | null,
  setCurrentScene(scene)
}
```

### hotspotStore
```typescript
{
  hotspots: Hotspot[],
  pendingHotspot: { yaw, pitch } | null,
  isPlacingHotspot: boolean,
  setHotspots(hotspots),
  setPendingHotspot(hotspot),
  togglePlacingHotspot()
}
```

### aiTagStore
```typescript
{
  tags: AITag[],
  showTags: boolean,
  filter: { object_type?, confidence? },
  setTags(tags),
  toggleVisibility(),
  getFilteredTags()
}
```

---

## AIDER PROMPT TEMPLATES

Use these templates when debugging with AIDER:

```
# Bug: Walkthroughs not loading
"Check the walkthrough loading flow. Start at Dashboard.tsx:24-27, 
trace through api/walkthroughs.ts, backend routes/walkthroughs.ts, 
services/walkthrough.service.ts. The DB is at backend/data/db.json.
What's the expected response format?"

# Bug: Auth issues
"User gets 401 on protected routes. Check:
1. authStore has token
2. client.ts interceptor adds Authorization header  
3. auth.ts middleware verifies token
4. auth.service.ts verifyToken() works
Where does the flow break?"

# Bug: Hotspots not showing
"Hotspots not appearing in viewer. Check:
1. WalkthroughViewer.tsx fetches hotspots
2. hotspotStore receives data
3. Viewer360.tsx passes hotspots to HotspotOverlay
4. HotspotMarker.tsx renders markers
Is the scene_id matching correctly?"
```

---

## FILES MODIFIED IN CURRENT SESSION

Based on git status, these files were recently changed:

```
M backend/src/index.ts
M backend/src/services/ai.service.ts
M backend/src/services/issue.service.ts
M backend/src/routes/issuesRoutes.ts
M backend/data/db.json
```

**Recent commits:**
- `a241eb05` fix: add missing generateId import to issue.service.ts
- `361d84ba` fix: Add error and success message handling in CreateIssueForm and IssueListPage
- `75821d86` feat(frontend): add issue management components
- `2d24b481` feat(backend): add issue management routes and service functions

---

## DEBUGGING CHECKLIST

When a bug report comes in:

1. **Identify the layer**: Frontend UI? API call? Backend logic? Database?
2. **Find the entry point**: Which component/route handles this action?
3. **Trace the flow**: Follow the diagrams above
4. **Check state**: What do stores/DB contain at each step?
5. **Isolate the failure**: Where does expected ≠ actual?

**Golden rule**: Start at the symptom, work backwards through the flow.

---

*Generated for AIDER debugging session - 2026-04-23*
