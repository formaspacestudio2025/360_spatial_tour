# Testing Guide - Spatial Tours App

## ✅ Current Status

| Component | Status | Details |
|-----------|--------|---------|
| Backend API | ✅ Running | http://localhost:3000 |
| Frontend App | ✅ Running | http://localhost:5173 |
| Database | ✅ Working | JSON file-based (no compilation) |
| Walkthrough Creation | ✅ Fixed | Modal form added |

---

## 🧪 How to Test Walkthrough Creation

### Method 1: From Dashboard
1. Open http://localhost:5173
2. Click the "Create Walkthrough" button in the center
3. Fill in the form:
   - **Name**: "My First Tour" (required)
   - **Description**: "Testing the app" (optional)
4. Click "Create"
5. You should see the walkthrough appear in the grid

### Method 2: From Header
1. Click "New Walkthrough" button in the top-right header
2. Fill in the form
3. Click "Create"

---

## 🔍 API Testing (Optional)

### Test with curl/PowerShell:

```powershell
# Create walkthrough
Invoke-RestMethod -Uri http://localhost:3000/api/walkthroughs -Method POST -ContentType "application/json" -Body '{"name":"Test Tour","description":"API Test"}'

# Get all walkthroughs
Invoke-RestMethod -Uri http://localhost:3000/api/walkthroughs -Method GET

# Health check
Invoke-RestMethod -Uri http://localhost:3000/health -Method GET
```

---

## 📝 What Was Fixed

### 1. **Missing Viewer360 Component**
- Created `frontend/src/components/viewer/Viewer360.tsx`
- Added Three.js canvas with 360° sphere rendering

### 2. **Walkthrough Creation Not Working**
- Created `WalkthroughForm.tsx` modal component
- Added form with name and description fields
- Integrated with React Query for API calls
- Connected buttons in Dashboard and Header to open the form

### 3. **Database Compatibility**
- Replaced better-sqlite3 (requires VS Build Tools) with JSON file database
- Created SQL-compatible wrapper that parses INSERT/SELECT/UPDATE/DELETE
- Auto-saves to `backend/data/db.json`

### 4. **Startup Scripts**
- Created `start-backend.ps1` - sets Node.js PATH and starts backend
- Created `start-frontend.ps1` - sets Node.js PATH and starts frontend
- Created `install-openai.ps1` - installs missing packages

---

## 🐛 If Something Doesn't Work

### Backend Issues:
```powershell
# Restart backend
cd C:\Users\H68618\Downloads\360_spatial_tours
.\start-backend.ps1
```

### Frontend Issues:
```powershell
# Restart frontend
cd C:\Users\H68618\Downloads\360_spatial_tours
.\start-frontend.ps1
```

### Clear Database:
```powershell
# Delete database file (will recreate on next start)
Remove-Item C:\Users\H68618\Downloads\360_spatial_tours\backend\data\db.json
```

### Check Logs:
- Backend: Terminal running `start-backend.ps1`
- Frontend: Terminal running `start-frontend.ps1`
- Browser: Press F12 → Console tab

---

## 📂 Important Files

### Frontend Components Created:
- `frontend/src/components/walkthrough/WalkthroughForm.tsx` - Creation modal
- `frontend/src/components/viewer/Viewer360.tsx` - 360° viewer

### Frontend Components Modified:
- `frontend/src/pages/Dashboard.tsx` - Added form integration
- `frontend/src/components/layout/Header.tsx` - Added form integration

### Backend Files Modified:
- `backend/src/config/database.ts` - JSON database with SQL wrapper
- `backend/package.json` - Removed better-sqlite3, added openai

### Database Location:
- `backend/data/db.json` - Your data is saved here

---

## 🎯 Next Steps

After walkthroughs are working, you can:
1. Add scenes to walkthroughs (upload 360° images)
2. Test AI object detection (requires LM Studio)
3. Add navigation between scenes
4. Create issues and tags

---

## 💡 Quick Commands

```powershell
# Start both servers
.\start-backend.ps1    # Terminal 1
.\start-frontend.ps1   # Terminal 2

# Install new package
.\install-openai.ps1   # Example

# View database
notepad backend\data\db.json
```
