# 🔍 FEATURE VISUAL TEST GUIDE

## Current Status
✅ Backend running on: http://localhost:3000  
✅ Frontend running on: http://localhost:5173  
✅ All code integrated and ready

---

## 🧪 HOW TO TEST EACH FEATURE

### Step 1: Open the App
```
1. Open browser: http://localhost:5173
2. Login with your admin account
3. Click on any walkthrough to open it
```

---

## Feature 1: View/Edit/Share Mode Toolbar ⭐ NEW

**Where**: Top-right corner of the walkthrough viewer header

**What You Should See**:
```
┌─────────────────────────────────────────────────────┐
│ [←] My Walkthrough              [View] [Edit] [Share]│
│ Living Room • Floor 1           [Upload] 3 scenes   │
└─────────────────────────────────────────────────────┘
```

**Test Steps**:
1. Look at the header - you should see 3 buttons: **View**, **Edit**, **Share**
2. Click "Edit" button
   - Button turns AMBER color
   - Hotspot tab now shows "Enter Edit Mode" message
3. Click "Share" button  
   - Button turns EMERALD color
   - A dropdown panel appears with:
     - Share link with "Copy Link" button
     - Embed code with "Copy Embed" button
     - QR code placeholder
4. Click "Copy Link"
   - Shows "✓ Copied!" message
5. Click "View" to return to view mode
   - Button turns BLUE

**If You DON'T See It**:
- Hard refresh browser: Ctrl+Shift+R
- Check browser console for errors: F12
- Verify you're logged in

---

## Feature 2: Enterprise Hotspot Editor

**Where**: Sidebar → Hotspots tab (when in Edit mode)

**What You Should See**:
```
┌─────────────────────────────────────┐
│ 🎯 Hotspot Editor                   │
├─────────────────────────────────────┤
│ [+ Add Hotspot]                     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ My Hotspot                      │ │
│ │ To: Kitchen                     │ │
│ │ [✏️] [📋] [🗑️]                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📍 Edit Hotspot                 │ │
│ │                                 │ │
│ │ Title: [My Hotspot          ]   │ │
│ │ Description: [Go to kitchen ]   │ │
│ │                                 │ │
│ │ Icon Type:                      │ │
│ │ [🧭] [ℹ️] [⚠️] [🔴]            │ │
│ │ [🖼️] [🎥] [📄] [🔗]            │ │
│ │                                 │ │
│ │ Icon Color:                     │ │
│ │ [🟢] [🔵] [🟡] [🔴] [🟣]      │ │
│ │                                 │ │
│ │ Target Scene: [Kitchen      ▼]  │ │
│ │                                 │ │
│ │ [Cancel] [💾 Save] [📋 Duplicate]│ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Test Steps**:
1. Click "Edit" mode in the ViewModeToolbar
2. Go to Hotspots tab in sidebar
3. Click on any existing hotspot
4. Edit panel appears with:
   - Title field
   - Description field  
   - 8 icon types to choose from
   - 10 color swatches
   - Target scene dropdown
5. Change the title to "Test Hotspot"
6. Wait 1.5 seconds
7. Look at bottom of panel - you should see:
   ```
   ⏳ Saving...
   ```
   Then:
   ```
   ✓ Saved 3:45:23 PM
   ```
8. Click "Duplicate" button
   - New hotspot appears with "(Copy)" suffix
9. Click different icon types
   - Icon preview changes in real-time
10. Click different colors
    - Color swatch highlights

**If Hotspot List is Empty**:
- Create a hotspot first by clicking "+ Add Hotspot"
- Then click on the 360° viewer to place it

---

## Feature 3: Autosave Status Indicator ⭐ NEW

**Where**: Bottom of the hotspot edit form

**What You Should See**:

**State 1 - Idle**:
```
┌──────────────────────────┐
│ ● Last saved: 3:45:23 PM │
└──────────────────────────┘
```

**State 2 - Saving**:
```
┌──────────────────────────┐
│ ⏳ Saving...             │
└──────────────────────────┘
```

**State 3 - Saved**:
```
┌──────────────────────────┐
│ ✓ Saved 3:45:25 PM       │
└──────────────────────────┘
```

**State 4 - Error**:
```
┌──────────────────────────────────┐
│ ✗ Save failed: Network error [Retry] │
└──────────────────────────────────┘
```

**Test Steps**:
1. Edit a hotspot (must be in Edit mode)
2. Change the title
3. Stop typing and wait
4. After 1.5 seconds, status changes to "Saving..."
5. Then changes to "Saved [timestamp]"
6. Refresh browser (F5)
7. Open the same hotspot
8. Title should still be your changed value ✓

**Test Error Recovery**:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Edit hotspot title
5. Status shows: "✗ Save failed"
6. Click "Retry" button
7. Set Network back to "No throttling"
8. Click "Retry" again
9. Status shows: "✓ Saved" ✓

---

## Feature 4: Graph Panel Connection Saving

**Where**: Sidebar → Graph tab

**What You Should See**:
```
┌──────────────────────────────────────────┐
│ [🏠 Living Room] ──── [🍳 Kitchen]       │
│        │                      │           │
│        │                      │           │
│     [🛏️ Bedroom] ──── [🚿 Bathroom]      │
│                                          │
│ [Drag from dot to dot to create link]   │
└──────────────────────────────────────────┘
```

**Test Steps**:
1. Go to Graph tab
2. You should see scene nodes connected by lines
3. Hover over a node - a small dot appears on the edge
4. Drag from the dot to another node
5. A dialog appears asking for hotspot label
6. Enter "Test Connection"
7. Click "Create"
8. **NEW LINE APPEARS** connecting the nodes ✓
9. Refresh browser (F5)
10. Go back to Graph tab
11. **Connection still exists** ✓
12. Click on the connection line (select it)
13. Press Backspace or Delete key
14. Connection disappears ✓
15. Refresh browser
16. **Connection is gone** ✓

---

## Feature 5: Hotspot Orientation Control

**Where**: When clicking navigation hotspots

**What You Should See**:
- Click a hotspot to go to another scene
- Camera automatically faces the direction you came from
- No need to manually look around to find the entry point

**Test Steps**:
1. Create a hotspot in "Living Room" pointing to "Kitchen"
2. Click the hotspot
3. You arrive in "Kitchen"
4. Camera should be facing toward where you came from
5. Look around to verify you're oriented correctly
6. Create a hotspot in "Kitchen" pointing back to "Living Room"
7. Click it
8. Camera should face the entry point from "Kitchen"

---

## Feature 6: Lock/Unlock Hotspots

**Where**: Hotspot edit panel

**Test Steps**:
1. Edit a hotspot
2. Look for the lock icon 🔒/🔓
3. Click it to lock the hotspot
4. Hotspot list shows "🔒 Locked" label
5. Delete button is hidden for locked hotspots
6. Click lock again to unlock
7. Delete button reappears

---

## Feature 7: Share Panel

**Where**: Click "Share" button in ViewModeToolbar

**What You Should See**:
```
┌────────────────────────────────────────────┐
│ 📤 Share Walkthrough                       │
├────────────────────────────────────────────┤
│                                            │
│ 🔗 Share Link                              │
│ ┌──────────────────────────────────────┐   │
│ │ http://localhost:5173/walkthrough/.. │   │
│ └──────────────────────────────────────┘   │
│ [📋 Copy Link]                             │
│                                            │
│ 📺 Embed Code                              │
│ ┌──────────────────────────────────────┐   │
│ │ <iframe src="http://localhost:5173.. │   │
│ └──────────────────────────────────────┘   │
│ [📋 Copy Embed]                            │
│                                            │
│ 📱 QR Code                                 │
│ ┌──────┐                                   │
│ │ ████ │                                   │
│ │ █  █ │                                   │
│ │ ████ │                                   │
│ └──────┘                                   │
│                                            │
└────────────────────────────────────────────┘
```

**Test Steps**:
1. Click "Share" button in header
2. Panel slides down
3. Shows share link with walkthrough ID
4. Shows embed iframe code
5. Click "Copy Link"
6. Paste in notepad - link is correct ✓
7. Click "Copy Embed"
8. Paste in notepad - iframe code is correct ✓

---

## 🎯 QUICK VERIFICATION CHECKLIST

Open http://localhost:5173 and verify:

- [ ] Login works
- [ ] Can see walkthrough list
- [ ] Can open a walkthrough
- [ ] **See View/Edit/Share buttons** in header (top-right)
- [ ] Can switch between modes
- [ ] Edit mode shows hotspot editor
- [ ] View mode hides hotspot editor
- [ ] Share panel shows link and embed code
- [ ] **See autosave status** when editing hotspots
- [ ] Can create new hotspots
- [ ] Can edit existing hotspots
- [ ] Can duplicate hotspots
- [ ] Can change icon types (8 types)
- [ ] Can change icon colors (10 colors)
- [ ] Can lock/unlock hotspots
- [ ] Graph connections persist after refresh
- [ ] Camera orientation correct after navigation
- [ ] Copy link works in share panel
- [ ] Copy embed works in share panel

---

## 🐛 TROUBLESHOOTING

### "I don't see View/Edit/Share buttons"
```
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check browser console (F12) for errors
4. Verify you're logged in with admin/editor role
```

### "Hotspot editor doesn't show"
```
1. Make sure you clicked "Edit" mode first
2. Check that you have scenes uploaded
3. Go to Hotspots tab in sidebar
4. If in View mode, you'll see "Enter Edit Mode" button
```

### "Autosave doesn't work"
```
1. Must be in Edit mode
2. Must select an existing hotspot (not creating new one)
3. Check browser console for errors
4. Verify backend is running on port 3000
```

### "Graph connections don't persist"
```
1. Backend MUST be restarted (we did this)
2. Create a new connection
3. Refresh browser
4. Connection should still be there
5. If not, check backend console for errors
```

### "Hotspots disappear after navigation"
```
1. This was fixed in previous session
2. Verify backend is running the new code
3. Check browser console: hotspots should be fetched
4. Check network tab: GET /api/hotspots/scene/:id
```

---

## 📊 EXPECTED BEHAVIOR

### ✅ What Should Work Now:
1. Hotspots persist across scene changes
2. Hotspots persist after browser refresh
3. Graph connections save to database
4. Graph connections persist after refresh
5. Camera faces correct direction on navigation
6. 8 different hotspot icon types
7. Custom colors for hotspots
8. Edit existing hotspots
9. Duplicate hotspots
10. Lock/unlock hotspots
11. **View/Edit/Share mode switching**
12. **Autosave with status indicator**
13. **Share link and embed code copying**
14. **Delete connections with Backspace key**

---

## 🎬 SCREENSHOT WHAT YOU SEE

If you still don't see the features after hard refresh, please share:
1. Screenshot of the walkthrough viewer header
2. Screenshot of the sidebar Hotspots tab
3. Browser console output (F12 → Console tab)

This will help identify exactly what's missing!
