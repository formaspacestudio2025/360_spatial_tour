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

## Template for Future Entries

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
