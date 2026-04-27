# QUALITY GATES (MANDATORY BEFORE COMPLETION)

No feature is complete unless ALL pass:

## GATE 1 — BUILD

* app compiles
* no runtime crash

## GATE 2 — TYPE SAFETY

* no TS errors

## GATE 3 — FEATURE CORRECTNESS

* matches acceptance criteria

## GATE 4 — INTEGRATION

* no regression in:

  * Viewer360
  * Hotspots
  * Issues
  * Auth

## GATE 5 — ARCHITECTURE

* follows existing patterns
* no duplicate logic
* no bypass of services

FAIL ANY GATE → MUST FIX
