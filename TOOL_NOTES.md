# Tool Notes for 360 Spatial Tours Project

## Claude Code (this environment)
- **File operations**: Use `Read`, `Edit`, `Write`, `Glob`, `Grep` – avoid raw `cat`/`sed`.
- **Git workflow**: Only create new commits when explicitly asked. Never amend or force‑push without permission.
- **Permissions**: The project has many deleted files; avoid touching them unless the user requests a cleanup.
- **Hooks**: No custom hooks are configured – all tool calls will prompt for permission.
- **Memory**: Use the `MEMORY.md` and `AIDER_CONTEXT.md` files as long‑term reference. Do **not** store duplicate info.
- **Testing**: Run `npm run dev` for both frontend and backend; verify routes with `curl` before UI testing.
- **Safety**: Do not modify the JSON DB wrapper (`backend/src/config/database.ts`) unless you understand the emulation logic – it can corrupt all persisted data.

## Aider (local LLM assistant)
- **Context files**: Include `MEMORY.md`, `AIDER_CONTEXT.md`, and any critical source files listed in the *Critical Files List*.
- **Ignore patterns**: Add `node_modules/`, `dist/`, `storage/`, `.aiderignore` is already present.
- **Commit style**: Follow conventional commits (e.g., `fix:`, `feat:`) and add `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>` when you commit via Claude Code.
- **Debugging**: Use `curl` or `httpie` to hit backend endpoints before changing UI code.

## OpenRouter / LM Studio
- **Model**: Currently using `claude-opus-4-7`. For faster iteration you can switch to `claude-sonnet-4-6` if you need quicker responses, but keep `opus` for final implementations.
- **Token limits**: Stay under ~128k tokens per request; keep documentation concise (as done in `MEMORY.md`).
- **Citations**: When providing external references (e.g., docs), include a "Sources:" section as required by the tool.

## Local Model Usage Notes
- **Node version**: Ensure Node >=18 (Vite and tsx rely on modern features).
- **Environment vars**: `VITE_API_URL` defaults to `http://localhost:3000`. Override in `.env` if needed.
- **Database**: JSON file (`backend/data/db.json`) is the single source of truth; back it up before any destructive DB changes.
- **Port conflicts**: Frontend runs on 5173, backend on 3000. Adjust if those ports are in use.
- **Testing workflow**:
  1. `cd backend && npm run dev`
  2. `cd ../frontend && npm run dev`
  3. Open `http://localhost:5173` in a browser.
  4. Use `curl http://localhost:3000/health` to confirm backend health.

---
*These notes are intended for both Claude Code and any local AI assistants (Aider, LM Studio) to ensure consistent, safe debugging and development across the 360 Spatial Tours codebase.*