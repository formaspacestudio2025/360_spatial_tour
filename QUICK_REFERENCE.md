# 🚀 QUICK REFERENCE - 360 SPATIAL TOURS

## Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## Quick Feature Access

### View/Edit/Share Modes
**Location**: Header (top-right)
- 🔵 **View** - Navigate and explore
- 🟡 **Edit** - Modify hotspots and scenes
- 🟢 **Share** - Get links and embed codes

### Hotspot Editor
**Path**: Edit Mode → Hotspots tab
- Click **"+ Add"** → Create new hotspot
- Click **hotspot** → Select
- Click **"⛶"** → Expand edit form
- Change fields → **Autosaves** after 1.5s

### Scene Settings
**Path**: Scenes tab → Hover scene → Click **"⚙️"**
- Edit room name
- Change floor
- Upload nadir image
- Configure nadir (scale/rotation/opacity)
- Delete scene

### Graph Editor
**Path**: Graph tab
- **Drag** from dot to dot → Create connection
- **Click** connection + **Delete** key → Remove
- **Refresh** browser → Connections persist

---

## Hotspot Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| Navigation | 🧭 | Green | Link to scene |
| Info | ℹ️ | Blue | Information |
| Warning | ⚠️ | Amber | Caution |
| Issue | 🔴 | Red | Defect/problem |
| Image | 🖼️ | Purple | Photo attachment |
| Video | 🎥 | Pink | Video attachment |
| Document | 📄 | Indigo | PDF/file |
| Custom | 🔗 | Teal | URL/custom icon |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Delete/Backspace** | Delete selected connection (graph view) |
| **Escape** | Cancel hotspot placement |
| **F5** | Refresh (everything persists!) |

---

## Common Workflows

### Create Walkthrough
```
1. Dashboard → "Create Walkthrough"
2. Enter name, client, address
3. Upload 360° scenes
4. Edit mode → Add hotspots
5. Graph view → Verify connections
6. Share mode → Get link
```

### Add Hotspot with Media
```
1. Edit mode → Hotspots tab
2. "+ Add" → Click viewer to place
3. Fill title, description
4. Select icon type & color
5. "Show Media Attachment"
6. Select type (image/video/PDF)
7. Enter media URL
8. Save
```

### Configure Nadir Patch
```
1. Scenes tab → Hover scene
2. Click ⚙️ settings icon
3. Upload nadir image
4. Adjust scale (0.5-2.0x)
5. Adjust rotation (0-360°)
6. Adjust opacity (0-100%)
7. Save Changes
8. Look down in viewer
```

### Edit Scene
```
1. Scenes tab → Hover scene
2. Click ⚙️ settings icon
3. Change room name
4. Change floor number
5. Adjust position if needed
6. Save Changes
```

---

## Data Structure

### Walkthrough
```typescript
{
  id: string
  name: string
  client?: string
  address?: string
  description?: string
  status: 'draft' | 'active' | 'archived'
  scene_count: number  // Auto-calculated
}
```

### Scene
```typescript
{
  id: string
  walkthrough_id: string
  room_name?: string
  floor: number
  position_x/y/z: number
  image_url: string
  thumbnail_url?: string
  nadir_image_path?: string
  nadir_scale: number      // 0.5-2.0
  nadir_rotation: number   // 0-360
  nadir_opacity: number    // 0-1
}
```

### Hotspot
```typescript
{
  id: string
  from_scene_id: string
  to_scene_id: string
  yaw: number
  pitch: number
  target_yaw?: number
  target_pitch?: number
  label?: string
  title?: string
  description?: string
  icon_type: string        // 8 types
  icon_color: string       // Hex color
  icon_size: number        // 0.5-2.0
  custom_icon_url?: string
  media_type?: string      // image/video/pdf/document/url/text
  media_url?: string
  is_locked?: boolean
  metadata?: any
}
```

---

## Troubleshooting

### Features not showing?
```
→ Hard refresh: Ctrl+Shift+R
→ Check console: F12
→ Restart backend
```

### Hotspots disappearing?
```
→ Verify backend running on port 3000
→ Check network tab for API errors
→ Hotspots auto-save, just wait 1.5s
```

### Scene count showing 0?
```
→ Restart backend to load new code
→ Count auto-calculates from database
```

### Nadir not showing?
```
→ Must upload nadir image in scene settings
→ Look DOWN in viewer (drag mouse down)
→ Check browser console for image errors
```

---

## API Endpoints

### Walkthroughs
```
GET    /api/walkthroughs          # List all
POST   /api/walkthroughs          # Create
GET    /api/walkthroughs/:id      # Get one
PUT    /api/walkthroughs/:id      # Update
DELETE /api/walkthroughs/:id      # Delete
```

### Scenes
```
GET    /api/walkthroughs/:id/scenes  # List scenes
POST   /api/scenes                   # Create
PUT    /api/scenes/:id               # Update
DELETE /api/scenes/:id               # Delete
```

### Hotspots
```
GET    /api/hotspots/scene/:sceneId  # Get by scene
POST   /api/hotspots/:sceneId        # Create
PUT    /api/hotspots/:id             # Update
DELETE /api/hotspots/:id             # Delete
```

---

## File Locations

### Frontend Components
```
frontend/src/components/viewer/
├── HotspotEditor.tsx      # Enterprise hotspot editor
├── SceneSettings.tsx      # Scene settings modal
├── ViewModeToolbar.tsx    # View/Edit/Share modes
├── Viewer360.tsx          # Main 360 viewer
├── NadirPatch.tsx         # Nadir overlay
└── SceneList.tsx          # Scene list with settings
```

### Backend Services
```
backend/src/services/
├── walkthrough.service.ts # Walkthrough CRUD + scene_count
├── scene.service.ts       # Scene CRUD
└── hotspot.service.ts     # Hotspot CRUD with all fields
```

---

## Version History

- **v3.0.0** (2026-04-20) - Enterprise Complete
  - 10/10 features implemented
  - Full hotspot editor
  - Rich media support
  - Nadir patch with UI
  - Scene management
  - Walkthrough counts

- **v2.0.0** - Graph & Persistence
  - Graph editor
  - Hotspot persistence
  - Orientation control

- **v1.0.0** - Foundation
  - Basic 360 viewer
  - Scene upload
  - Simple hotspots

---

**Need Help?**
- Check `COMPLETE_FEATURES_SUMMARY.md` for full docs
- Check `VISUAL_TEST_GUIDE.md` for testing steps
- Check browser console (F12) for errors
- Restart backend if features missing
