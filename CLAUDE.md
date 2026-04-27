# CLAUDE.md

# PROJECT RULES FOR CLAUDE

You are working inside a real production codebase.

This is NOT a greenfield project.

Your priority is:

correctness,
minimal changes,
architecture safety,
and understanding before action.

You must improve the existing system —
never rebuild it.

---

# 1. CORE PRINCIPLES

* Always understand the system before modifying code
* Never guess implementation details
* Always trace data flow before fixing bugs
* Prefer minimal and safe changes over refactoring
* Do not modify unrelated code
* Never rebuild working modules from scratch
* Protect production stability at all times
* If unsure, ask questions before editing

---

# 2. ROADMAP RULE (MANDATORY)

Always read:

* /docs/roadmap.md
* /tasks/current-sprint.md

before starting implementation.

The roadmap is the source of truth.

Never invent features outside roadmap scope.

Never change sprint priorities without approval.

---

# 3. DEBUGGING WORKFLOW (MANDATORY)

When a bug is reported:

1. Identify affected feature
2. Trace full flow:
   UI → Store → API → Backend → DB
3. Identify root cause
4. Show impacted files
5. Propose minimal fix
6. Apply fix only after confirmation

Never patch blindly.

Always diagnose first.

---

# 4. FEATURE IMPLEMENTATION WORKFLOW

When building new features:

1. Understand current module behavior
2. Check roadmap requirements
3. Identify affected files
4. Protect working modules
5. Implement smallest safe version first
6. Preserve backward compatibility
7. Validate against acceptance criteria

Never rewrite entire systems.

Always extend existing architecture.

---

# 5. FILE HANDLING RULES

* Only edit files directly related to the issue
* Do NOT rewrite full modules unless necessary
* Keep changes small and incremental
* Avoid touching Viewer360, Hotspots, Auth, or Issue Management unless required

These are critical stability modules.

---

# 6. ARCHITECTURE RULES

Frontend must follow:

* React + Vite + TypeScript
* Zustand
* TanStack Query
* TailwindCSS
* existing reusable component patterns

Backend must follow:

* Node.js + Express + TypeScript
* route → controller → service pattern
* existing class-based services
* JWT auth structure
* JSON DB compatibility

Mandatory for all new entities:

* org_id
* property_id

RBAC must be:

middleware-based

NOT component-only checks.

---

# 7. MEMORY RULES

Always read:

* MEMORY.md

before starting work.

After changes, update:

* MEMORY.md
* CHANGELOG_AI.md

Required:

MEMORY.md = project understanding
CHANGELOG_AI.md = what changed and why

Do not skip this.

---

# 8. CONTEXT MANAGEMENT

Use:

/compact

when context becomes large.

Use:

/clear

when switching tasks.

Avoid re-explaining known architecture.

Preserve important context in files —
not chat memory.

---

# 9. AIDER INTEGRATION RULES

When using Aider:

* Only pass relevant files
* Never send full repository
* Prefer feature-specific file groups
* Never allow large blind refactors

Small controlled changes only.

---

# 10. SAFETY RULES

Do not modify:

* authentication
* payment logic
* RBAC
* database layer
* report generation
* billing
* file storage

without explicit instruction.

Always explain risk before touching sensitive systems.

---

# 11. OUTPUT STYLE

When responding:

First:
Root cause / architecture understanding

Second:
Affected files

Third:
Proposed minimal fix

Final:
Apply changes only after approval

Never jump directly to code.

Explain first.

---

# 12. FINAL RULE

Your job is:

to improve this app

NOT to reinvent this app.

The existing platform is valuable.

Protect it.
Extend it.
Do not replace it.

# END OF RULES
