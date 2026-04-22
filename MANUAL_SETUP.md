# Manual Setup Guide - No Admin Rights Required

## Issue
`better-sqlite3` requires Visual Studio Build Tools which you don't have.

## Solution Options

### Option 1: Use Node.js 20.x (Recommended)

Node.js 20.x has better pre-built binary support:

```powershell
# Switch to Node.js 20.11.0 (if you have it downloaded)
$env:Path = "C:\Users\H68618\Downloads\node-v20.11.0-win-x64;$env:Path"

# Verify
node --version  # Should show v20.x.x

# Clean and reinstall
cd C:\Users\H68618\Downloads\360_spatial_tours\backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

npm.cmd install
```

---

### Option 2: Download Pre-built Binary Manually

1. Go to: https://github.com/WiseLibs/better-sqlite3/releases
2. Download the pre-built binary for your Node version
3. Place it in: `node_modules/better-sqlite3/build/Release/`

---

### Option 3: Use SQL.js (Pure JavaScript)

I can migrate the entire codebase to use `sql.js` instead.
This requires updating ~15 files but needs NO compilation.

**Just say "switch to sql.js"** and I'll do it for you.

---

### Option 4: Use SQLite3 Package (Alternative)

Switch to `sqlite3` npm package which has better pre-build support:

```powershell
# I can update package.json and all database code
# Just say "switch to sqlite3"
```

---

## Quickest Test

Try this first - it might work:

```powershell
# Force npm to use prebuild only
cd C:\Users\H68618\Downloads\360_spatial_tours\backend
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue

$env: npm_config_build_from_source=false
npm.cmd install --prefer-offline
```

---

## What Do You Want To Do?

1. **Try Node.js 20.x** (if you have it downloaded)
2. **Switch to sql.js** (no compilation, I'll update all code)
3. **Switch to sqlite3** (alternative package)
4. **Download VS Build Tools** (may work without admin)

Tell me which option and I'll help you proceed!
