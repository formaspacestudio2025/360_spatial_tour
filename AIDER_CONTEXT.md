# Aider Context - 360 Spatial Tours

## Important Files (Priority Order)

### Must Read Before Any Fix
1. `backend/src/index.ts` - Route registration, middleware, server startup
2. `frontend/src/App.tsx` - Route definitions, component mounting
3. `frontend/src/stores/authStore.ts` - Auth state, role checks
4. `backend/src/config/database.ts` - DB emulation layer (CRITICAL)

### Dependency Relationships
- `frontend/src/api/client.ts` → all frontend API files (walkthroughs.ts, auth.ts, etc.)
- `frontend/src/stores/authStore.ts` → `api/client.ts` (token injection)
- `backend/src/index.ts` → all `backend/src/routes/*.ts`
- `backend/src/routes/issuesRoutes.ts` → `backend/src/services/issue.service.ts`
- `backend/src/services/issue.service.ts` → `backend/src/config/database.ts`

### Debugging Checkpoints

#### Frontend Not Loading
1. Check `frontend/src/main.tsx` - React root mount
2. Check `frontend/src/App.tsx` - Routes defined
3. Check browser console - network errors, React errors
4. Check `frontend/.env` - VITE_API_URL set correctly

#### Backend Not Responding
1. Check `backend/src/index.ts` - PORT, middleware order
2. Check terminal - "Server running" message
3. Check `backend/.env` - PORT, CORS settings
4. Check `backend/data/db.json` - exists, valid JSON

#### Auth Issues
1. Check `frontend/src/stores/authStore.ts` - token, isAuthenticated
2. Check `frontend/src/api/client.ts` - Authorization header
3. Check `backend/src/routes/auth.ts` - credential validation
4. Clear localStorage if stuck

#### Issue Management Not Working
1. Check `frontend/src/App.tsx` - `/issues` route exists
2. Check `frontend/src/components/layout/Header.tsx` - nav link present
3. Check `backend/src/routes/issuesRoutes.ts` - route handlers
4. Check `backend/src/services/issue.service.ts` - DB queries
5. Check `backend/data/db.json` - issues array exists

### Files to Inspect Before Making Fixes

#### Before Changing Frontend Routes
- `frontend/src/App.tsx`
- `frontend/src/components/auth/ProtectedRoute.tsx`

#### Before Changing Backend Routes
- `backend/src/index.ts` (route mounting)
- `backend/src/routes/index.ts` (sub-route aggregation)

#### Before Changing Database Logic
- `backend/src/config/database.ts` (whole file, custom emulation)
- `backend/data/db.json` (data structure)

#### Before Changing Auth
- `frontend/src/stores/authStore.ts`
- `frontend/src/api/client.ts` (interceptor)
- `backend/src/routes/auth.ts`

#### Before Changing Issue Management
- `frontend/src/components/issueManagement/IssueListPage.tsx`
- `backend/src/routes/issuesRoutes.ts`
- `backend/src/services/issue.service.ts`

### Aider-Specific Notes
- Use `.aiderignore` to exclude `node_modules/`, `dist/`, `storage/`
- Commit after each logical change
- Test backend with `curl` before frontend changes
- JSON DB changes are immediate (no migration needed)
- React Router v6 - use `Link` not `a` tags
