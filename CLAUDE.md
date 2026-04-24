# PROJECT RULES FOR CLAUDE

You are working inside a real production codebase.

Your priority is correctness, minimal changes, and understanding before action.

---

# 1. CORE PRINCIPLES

- Always understand the system before modifying code
- Never guess implementation details
- Always trace data flow before fixing bugs
- Prefer minimal and safe changes over refactoring
- Do not modify unrelated code
- If unsure, ask questions before editing

---

# 2. DEBUGGING WORKFLOW (MANDATORY)

When a bug is reported:

1. Identify affected feature
2. Trace flow (UI → API → backend → DB)
3. Identify root cause
4. Show impacted files
5. Propose minimal fix
6. Apply fix only after confirmation

---

# 3. FILE HANDLING RULES

- Only edit files directly related to the issue
- Do NOT rewrite full modules unless necessary
- Keep changes small and incremental

---

# 4. MEMORY RULES

- Always read MEMORY.md before starting work
- After changes, update:
  - MEMORY.md (project understanding)
  - CHANGELOG_AI.md (what changed and why)

---

# 5. CONTEXT MANAGEMENT

- Use /compact when context becomes large
- Use /clear when switching tasks
- Avoid re-explaining known architecture

---

# 6. AIDER INTEGRATION RULES

When using Aider:
- Only pass relevant files
- Never send full repository
- Prefer feature-specific file groups

---

# 7. CODE QUALITY RULES

- Keep changes minimal and readable
- Do not introduce new libraries unless required
- Maintain existing architecture style
- Avoid unnecessary abstraction

---

# 8. SAFETY RULES

- Do not modify authentication, payment, or database logic without explicit instruction
- Always explain risk before applying sensitive changes

---

# 9. OUTPUT STYLE

When responding:

- First: explanation of root cause
- Second: affected files
- Third: proposed fix
- Final: only then apply changes if approved

---

# END OF RULES