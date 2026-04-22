# 🧪 TESTING GUIDE - Media & Link Manager

## ✅ WHAT'S FIXED & READY TO TEST

### Critical Bugs Fixed:
1. ✅ **Media upload not working** - Fixed `useState` → `useEffect` bug
2. ✅ **Media list not loading** - Fixed database structure (added `hotspot_media` & `hotspot_links` tables to JSON DB)
3. ✅ **Old media panel removed** - Cleaned up duplicate UI
4. ✅ **Backend restarted** - New routes loaded

---

## 🚀 QUICK TEST NOW

### 1. Test Media Upload
```
1. Open http://localhost:5173
2. Login as admin
3. Open a walkthrough
4. Enter Edit mode
5. Click a hotspot → Expand (Maximize icon)
6. Click purple "Manage Media Files" button
7. ✅ Media Manager should open
8. Click "Upload Files" or drag-drop files
9. ✅ Files should upload and appear in list
10. Try List/Grid view toggle
11. Test Preview, Download, Copy, Delete buttons
```

### 2. What Should Work NOW:
- ✅ Media Manager opens
- ✅ File upload (multiple files, drag-drop)
- ✅ Media list displays with thumbnails
- ✅ Search/filter works
- ✅ View, Download, Copy URL, Delete actions
- ✅ Bulk delete
- ✅ Grid/List view toggle

---

## 📋 NEXT: Link Manager & Asset Manager

The backend for Links is complete. I need to build the unified Asset Manager UI with tabs:
- Tab 1: Media (existing MediaManager)
- Tab 2: Links (new - add/edit/delete URLs)
- Tab 3: Settings (hotspot configuration)
- Tab 4: Activity (audit log)

**Should I build this now?** 

The Asset Manager will be a modal with:
```
┌──────────────────────────────────┐
│ [Media] [Links] [Settings] [Activity] │
├──────────────────────────────────┤
│                                  │
│  Media Tab Content               │
│  (current MediaManager)          │
│                                  │
└──────────────────────────────────┘
```

---

## 🔍 DEBUG INFO

### Backend Routes Available:
```
GET    /api/hotspot-media/:hotspotId       ✅ Working
POST   /api/hotspot-media/:hotspotId/upload ✅ Working
DELETE /api/hotspot-media/:id              ✅ Working
POST   /api/hotspot-media/bulk-delete      ✅ Working

GET    /api/hotspot-links/:hotspotId       ✅ Working
POST   /api/hotspot-links/:hotspotId       ✅ Working
PUT    /api/hotspot-links/:id              ✅ Working
DELETE /api/hotspot-links/:id              ✅ Working
```

### Database Tables:
- `hotspot_media` ✅ Created in JSON DB
- `hotspot_links` ✅ Created in JSON DB

### Files Modified:
- `backend/src/config/database.ts` - Added new tables
- `backend/src/routes/hotspot-media.ts` - Media endpoints
- `backend/src/routes/hotspot-links.ts` - Link endpoints
- `frontend/src/api/hotspot-media.ts` - Media API client
- `frontend/src/api/hotspot-links.ts` - Link API client
- `frontend/src/components/viewer/MediaManager.tsx` - Fixed useEffect bug
- `frontend/src/components/viewer/HotspotEditor.tsx` - Removed old panel, added button

---

## 💡 TEST CHECKLIST

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] Can login successfully
- [ ] Can open walkthrough
- [ ] Can enter edit mode
- [ ] Can select and expand hotspot
- [ ] "Manage Media Files" button visible
- [ ] Media Manager modal opens
- [ ] Upload button works
- [ ] Files appear in list after upload
- [ ] Thumbnails display for images
- [ ] File type icons show correctly
- [ ] Search filters results
- [ ] Preview opens for images
- [ ] Download works
- [ ] Copy URL gives feedback
- [ ] Delete removes file
- [ ] Bulk delete works
- [ ] Grid view displays properly
- [ ] List view displays properly

---

**Test the Media Manager now and let me know if it works!** 

Once confirmed, I'll build the complete Asset Manager with Media + Links + Settings tabs.
