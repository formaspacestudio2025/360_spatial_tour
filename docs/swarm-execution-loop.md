# SWARM EXECUTION LOOP (MANDATORY)

Every sprint execution must follow this cycle:

## 1. STATE READ

* Read /docs/roadmap.md
* Read /tasks/current-sprint.md
* Read MEMORY.md

## 2. PLAN

Lead Agent produces:

* task breakdown
* frontend tasks
* backend tasks
* risks
* dependencies

## 3. DISPATCH

Frontend + Backend agents execute independently

## 4. VERIFY

Lead Agent checks:

* architecture compliance
* regression risk
* correctness
* completeness vs acceptance criteria

## 5. WRITE STATE

Update:

* MEMORY.md
* CHANGELOG_AI.md
* /tasks/current-sprint.md progress

## 6. STOP OR CONTINUE

* If incomplete → loop again
* If complete → mark DONE and move sprint

NO STEP CAN BE SKIPPED.
