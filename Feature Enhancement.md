# Executable Engineering Tasks v2 — Feature Enhancement Roadmap

> Comprehensive conversion of `Feature Enhancement.md` into executable engineering tasks.
> Each task is scoped to limited files, independently testable, and has clear acceptance criteria.
> Builds on completed Modules 1–3. References real file paths from the existing codebase.

---

## ✅ STATUS: Modules 1–3 Complete

| Module | Status | Key Files |
|---|---|---|
| Module 1: Core Viewer | ✅ Done | `InspectionSidebar.tsx`, `MaintenanceOverlay.tsx`, `EmergencyOverlay.tsx`, `TourControls.tsx`, `FloorSelector.tsx`, `Minimap.tsx`, `MarkerCluster.tsx` |
| Module 2: Issue Management | ✅ Done | `issue.service.ts`, `issuesRoutes.ts`, `IssueFormModal.tsx`, `IssueListPage.tsx` |
| Module 3: Asset Management | ✅ Done | `asset.service.ts`, `assets.ts`, `AssetManagement.tsx`, `AssetFormModal.tsx`, `AssetMarker.tsx`, `ChecklistBuilder.tsx`, `Inspections.tsx` |

---

## MODULE 4: Asset Intelligence Core

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **4.1** | **Asset Context API** | `backend/src/routes/assets.ts`, `backend/src/services/asset.service.ts` | 1. `GET /api/assets/:id/context` returns asset + linked issues + work orders + inspections in one payload.<br>2. Response < 500ms for 50 linked records.<br>3. 404 for missing asset. | ✅ Yes |
| **4.2** | **Frontend Context Hook** | `frontend/src/api/assetsApi.ts`, `frontend/src/hooks/useAssetContext.ts` [NEW] | 1. `useAssetContext(id)` hook returns `{ asset, issues, workOrders, inspections, isLoading }`.<br>2. Uses TanStack Query with 30s stale time.<br>3. Refetches on window focus. | ✅ Yes |
| **4.3** | **Asset Quick Panel** | `frontend/src/components/assets/AssetQuickPanel.tsx` [NEW] | 1. Slide-out panel opens on asset click in viewer.<br>2. Tabs: Overview, Issues, Maintenance, Documents.<br>3. Close button and outside-click dismiss. | ✅ Yes |
| **4.4** | **Asset Marker Upgrade** | `frontend/src/components/viewer/AssetMarker.tsx` | 1. Marker color reflects status (`active`=green, `maintenance`=amber, `retired`=gray).<br>2. Badge shows open issue count.<br>3. Tooltip on hover shows name + health score. | ✅ Yes |
| **4.5** | **Asset Search & Filter** | `frontend/src/pages/AssetManagement.tsx`, `backend/src/routes/assets.ts` | 1. `GET /api/assets?type=&status=&health_min=&q=` filters work.<br>2. Frontend search bar with type/status dropdowns.<br>3. Debounced search (300ms). | ✅ Yes |
| **4.6** | **Asset Bulk Import** | `backend/src/routes/assets.ts`, `frontend/src/components/assets/BulkImport.tsx` [NEW] | 1. `POST /api/assets/import` accepts CSV.<br>2. Validates required columns (name, type).<br>3. Returns created count + error rows. | ✅ Yes |
| **4.7** | **Asset Export** | `backend/src/routes/assets.ts`, `frontend/src/pages/AssetManagement.tsx` | 1. `GET /api/assets/export/csv` returns full registry CSV.<br>2. Includes health score, location, dates.<br>3. Frontend download button. | ✅ Yes |
| **4.8** | **Asset Depreciation Calc** | `backend/src/services/asset.service.ts`, `frontend/src/components/assets/LifecycleTab.tsx` | 1. Service calculates straight-line depreciation from `purchase_date` + `useful_life`.<br>2. Returns `current_value`, `depreciation_rate`.<br>3. UI shows depreciation chart. | ✅ Yes |

---

## MODULE 5: Inspection System + AI

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **5.1** | **Inspection Session Model** | `backend/src/types/inspection.ts` | 1. Add `inspector_id`, `started_at`, `completed_at`, `location_data`, `weather_conditions`.<br>2. Status enum: `scheduled → in_progress → completed → signed_off → rejected`.<br>3. Types exported correctly. | ✅ Yes |
| **5.2** | **Start Inspection API** | `backend/src/routes/inspections.ts`, `backend/src/services/inspection.service.ts` | 1. `POST /api/inspections/:id/start` sets status to `in_progress` + `started_at`.<br>2. Only assigned inspector or admin can start.<br>3. Returns updated inspection. | ✅ Yes |
| **5.3** | **Checklist Auto-Binding** | `backend/src/services/inspection.service.ts`, `backend/src/services/checklist.service.ts` | 1. When inspection created for asset, auto-select checklist template matching `asset.type`.<br>2. Fall back to "General" template if no match.<br>3. Clone template items into inspection. | ✅ Yes |
| **5.4** | **Inspection Sidebar Upgrade** | `frontend/src/components/viewer/InspectionSidebar.tsx` | 1. Loads real checklist items from API (not hardcoded).<br>2. Toggle items persists via `PUT /api/inspections/:id/toggle/:itemId`.<br>3. Photo capture per item with upload. | ✅ Yes |
| **5.5** | **Auto Issue on Failure** | `backend/src/services/inspection.service.ts`, `backend/src/services/issue.service.ts` | 1. Checklist item marked "fail" → auto-create issue linked to asset + scene.<br>2. Issue title = "Inspection failure: {item_label}".<br>3. Issue severity derived from item category. | ✅ Yes |
| **5.6** | **Inspection History Panel** | `frontend/src/pages/AssetDetail.tsx` | 1. New "Inspections" tab showing past inspections for asset.<br>2. Each row: date, inspector, pass/fail count, status badge.<br>3. Click to expand checklist details. | ✅ Yes |
| **5.7** | **AI Image Defect Detection** | `backend/src/services/ai.service.ts`, `backend/src/routes/ai.ts` | 1. `POST /api/ai/detect-defect` accepts image base64.<br>2. Returns `{ defect_type, severity, confidence, description }`.<br>3. Supports crack, leak, corrosion, mold. | ✅ Yes |
| **5.8** | **AI Checklist Suggestions** | `backend/src/services/ai.service.ts` | 1. `POST /api/ai/suggest-checklist` accepts `{ asset_type, asset_history }`.<br>2. Returns additional checklist items based on past failures.<br>3. Confidence score per suggestion. | ✅ Yes |
| **5.9** | **AI Issue Pre-fill** | `frontend/src/components/viewer/IssueFormModal.tsx`, `frontend/src/api/ai.ts` | 1. "AI Assist" button in issue form.<br>2. Sends asset context + photo to AI.<br>3. Pre-fills title, description, severity, type. | ✅ Yes |
| **5.10** | **Inspection PDF Report** | `backend/src/services/report.service.ts`, `backend/src/routes/reports.ts` | 1. `GET /api/reports/inspection/:id` returns PDF.<br>2. Includes checklist results, photos, sign-off.<br>3. Company header from org settings. | ✅ Yes |

---

## MODULE 6: Maintenance Execution + AI

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **6.1** | **Work Order Model** | `backend/src/types/workOrder.ts` [NEW] | 1. Fields: `id`, `asset_id`, `title`, `priority`, `status`, `assigned_to`, `vendor_id`, `estimated_hours`, `actual_hours`, `parts_used`, `cost`, `due_date`.<br>2. Status: `open → assigned → in_progress → completed → verified`.<br>3. Type exported. | ✅ Yes |
| **6.2** | **Work Order CRUD API** | `backend/src/routes/workOrders.ts` [NEW], `backend/src/services/workOrder.service.ts` [NEW] | 1. `GET/POST/PUT/DELETE /api/work-orders`.<br>2. Filter by `asset_id`, `status`, `assigned_to`.<br>3. Auto-log status changes in history. | ✅ Yes |
| **6.3** | **Work Order Frontend** | `frontend/src/pages/WorkOrders.tsx` [NEW], `frontend/src/api/workOrdersApi.ts` [NEW] | 1. List view with status filters + search.<br>2. Create form linked to asset/issue.<br>3. Kanban view (open → assigned → in_progress → done). | ✅ Yes |
| **6.4** | **Maintenance Overlay Binding** | `frontend/src/components/viewer/MaintenanceOverlay.tsx` | 1. Fetches real work orders from API (replace mock data).<br>2. Clicking asset shows its WOs.<br>3. "Start Work" / "Complete" buttons update backend. | ✅ Yes |
| **6.5** | **Maintenance Timeline** | `frontend/src/pages/AssetDetail.tsx` | 1. New "Maintenance" tab with chronological timeline.<br>2. Shows WOs, PM schedules, cost summaries.<br>3. Total maintenance cost per asset. | ✅ Yes |
| **6.6** | **AI Troubleshooting** | `backend/src/services/ai.service.ts`, `backend/src/routes/ai.ts` | 1. `POST /api/ai/troubleshoot` accepts `{ asset_type, symptom, history }`.<br>2. Returns step-by-step diagnostic guide.<br>3. Suggests parts and estimated time. | ✅ Yes |
| **6.7** | **AI Work Order Suggestions** | `backend/src/services/ai.service.ts` | 1. `POST /api/ai/suggest-work-order` accepts asset context.<br>2. Returns suggested priority, estimated hours, required parts.<br>3. Based on asset type + failure history. | ✅ Yes |
| **6.8** | **AI SOP Generator** | `backend/src/services/ai.service.ts`, `backend/src/routes/ai.ts` | 1. `POST /api/ai/generate-sop` accepts `{ asset_type, procedure_type }`.<br>2. Returns numbered step-by-step repair guide.<br>3. Includes safety warnings and tool requirements. | ✅ Yes |

---

## MODULE 7: Emergency Intelligence + AI

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **7.1** | **Asset Criticality Field** | `backend/src/types/asset.ts`, `backend/src/services/asset.service.ts` | 1. Add `criticality` field: `low`, `medium`, `high`, `critical`.<br>2. Stored in db.json.<br>3. Returned in all asset API responses. | ✅ Yes |
| **7.2** | **Impact Analysis Service** | `backend/src/services/asset.service.ts` | 1. `getImpactAnalysis(assetId)` returns affected scenes, dependent assets.<br>2. Calculates blast radius (affected area count).<br>3. Returns impact severity score. | ✅ Yes |
| **7.3** | **Emergency Overlay Upgrade** | `frontend/src/components/viewer/EmergencyOverlay.tsx` | 1. Highlights critical assets with pulsing red markers.<br>2. Shows impact radius visualization.<br>3. "Affected Assets" list with criticality badges. | ✅ Yes |
| **7.4** | **Emergency Issue Trigger** | `backend/src/routes/issuesRoutes.ts`, `backend/src/services/issue.service.ts` | 1. `POST /api/issues/emergency` creates issue with `priority: critical`.<br>2. Auto-notifies all admins.<br>3. Sets SLA to 1 hour. | ✅ Yes |
| **7.5** | **AI Risk Prediction** | `backend/src/services/ai.service.ts` | 1. `POST /api/ai/predict-risk` accepts asset data + history.<br>2. Returns failure probability (0-100%) + time to failure.<br>3. Identifies top 3 risk factors. | ✅ Yes |
| **7.6** | **AI Scenario Simulation** | `backend/src/services/ai.service.ts`, `frontend/src/components/viewer/EmergencyOverlay.tsx` | 1. "What if?" input in Emergency mode.<br>2. AI returns impact assessment.<br>3. Displays affected zones on viewer. | ✅ Yes |

---

## MODULE 8: Asset State Machine

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **8.1** | **Extended Status Enum** | `backend/src/types/asset.ts`, `frontend/src/types/index.ts` | 1. Expand: `commissioning → active → maintenance → repair → decommissioned → disposed`.<br>2. Both backend/frontend types updated.<br>3. Backwards compatible. | ✅ Yes |
| **8.2** | **State Transition Logic** | `backend/src/services/asset.service.ts` | 1. `transitionState(assetId, newStatus)` validates allowed transitions.<br>2. Invalid transitions return 400 with allowed states.<br>3. Transition logged in history. | ✅ Yes |
| **8.3** | **Transition API** | `backend/src/routes/assets.ts` | 1. `PUT /api/assets/:id/transition` accepts `{ status, reason }`.<br>2. Enforces state machine rules.<br>3. Returns updated asset. | ✅ Yes |
| **8.4** | **Viewer State UI** | `frontend/src/components/viewer/AssetMarker.tsx` | 1. Marker icon changes per state (circle=active, wrench=maintenance, x=decommissioned).<br>2. Quick panel shows available transitions.<br>3. Transition button with reason input. | ✅ Yes |
| **8.5** | **State History Log** | `frontend/src/pages/AssetDetail.tsx` | 1. "State History" section showing all transitions.<br>2. Each entry: date, from→to, reason, user.<br>3. Visual state flow diagram. | ✅ Yes |

---

## MODULE 9: Asset Timeline (Digital Twin)

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **9.1** | **Asset Event Model** | `backend/src/types/assetEvent.ts` [NEW] | 1. Fields: `id`, `asset_id`, `event_type`, `title`, `description`, `metadata`, `user_id`, `created_at`.<br>2. Types: `created`, `inspected`, `maintained`, `issue_opened`, `issue_resolved`, `state_changed`, `document_added`.<br>3. Type exported. | ✅ Yes |
| **9.2** | **Event Logging Service** | `backend/src/services/assetEvent.service.ts` [NEW] | 1. `logEvent(asset_id, event_type, details)` creates event record.<br>2. Auto-called from issue/inspection/asset services.<br>3. Stored in `db.json` `asset_events` array. | ✅ Yes |
| **9.3** | **Timeline API** | `backend/src/routes/assets.ts` | 1. `GET /api/assets/:id/timeline?limit=50&offset=0` returns paginated events.<br>2. Filter by `event_type` and date range.<br>3. Sorted newest-first. | ✅ Yes |
| **9.4** | **Timeline UI** | `frontend/src/pages/AssetDetail.tsx`, `frontend/src/components/assets/AssetTimeline.tsx` [NEW] | 1. Visual vertical timeline with icons per event type.<br>2. Color-coded: green=positive, amber=maintenance, red=issues.<br>3. Expandable details per event. | ✅ Yes |
| **9.5** | **Digital Twin Summary** | `backend/src/services/asset.service.ts` | 1. `getDigitalTwinSummary(assetId)` returns lifecycle metrics.<br>2. Total inspections, maintenance cost, uptime %, MTBF.<br>3. Returned as part of asset context API. | ✅ Yes |

---

## MODULE 10: Rules Engine (Automation)

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **10.1** | **Rules Engine Service** | `backend/src/services/rules.engine.ts` [NEW] | 1. `evaluateRules(trigger, context)` checks all active rules.<br>2. Rule structure: `{ trigger, condition, action }`.<br>3. Triggers: `health_changed`, `inspection_failed`, `pm_overdue`, `sla_breached`. | ✅ Yes |
| **10.2** | **Health Score Trigger** | `backend/src/services/asset.service.ts`, `backend/src/services/rules.engine.ts` | 1. Health < 40 → auto-schedule inspection.<br>2. Health < 20 → auto-create critical work order.<br>3. Threshold configurable. | ✅ Yes |
| **10.3** | **SLA Escalation Rule** | `backend/src/services/issue.service.ts`, `backend/src/services/rules.engine.ts` | 1. Critical issues unresolved in 4h → escalate to admin.<br>2. High issues unresolved in 24h → escalate priority.<br>3. Logged in issue history. | ✅ Yes |
| **10.4** | **PM Overdue Rule** | `backend/src/services/maintenance.service.ts`, `backend/src/services/rules.engine.ts` | 1. Overdue PM auto-creates WO with priority=high.<br>2. 7 days overdue → priority critical.<br>3. Asset health reduced by 10. | ✅ Yes |
| **10.5** | **Rules Management API** | `backend/src/routes/rules.ts` [NEW] | 1. `GET/POST/PUT/DELETE /api/rules`.<br>2. Enable/disable individual rules.<br>3. Admin-only access. | ✅ Yes |
| **10.6** | **Rules Dashboard UI** | `frontend/src/pages/RulesEngine.tsx` [NEW] | 1. List rules with enable/disable toggle.<br>2. Show trigger count.<br>3. Create custom rule form. | ✅ Yes |

---

## MODULE 11: AI Core Platform

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **11.1** | **AI Provider Abstraction** | `backend/src/services/ai.service.ts` | 1. `AIProvider` interface: `complete()`, `analyze()`, `embed()`.<br>2. Support OpenAI, Gemini, LMStudio backends.<br>3. Provider via env `AI_PROVIDER`. | ✅ Yes |
| **11.2** | **AI Routes Expansion** | `backend/src/routes/ai.ts` | 1. Unified `/api/ai/*` namespace.<br>2. Rate limiting: 10 req/min per user.<br>3. Request/response logging. | ✅ Yes |
| **11.3** | **Natural Language Query** | `backend/src/routes/ai.ts`, `frontend/src/components/layout/GlobalSearch.tsx` [NEW] | 1. Search bar accepts: "Show me assets with low health in Bedroom".<br>2. AI converts to structured query.<br>3. Returns matching records. | ✅ Yes |
| **11.4** | **AI Document Q&A** | `backend/src/services/ai.service.ts`, `frontend/src/components/assets/DocumentUpload.tsx` | 1. Upload PDF → backend extracts text.<br>2. "Ask a question" returns AI answer grounded in document.<br>3. Cites page/section. | ✅ Yes |
| **11.5** | **AI Auto-Tagging** | `backend/src/services/ai.service.ts` | 1. `POST /api/ai/auto-tag` accepts document text.<br>2. Returns extracted tags: equipment type, manufacturer, certifications.<br>3. Auto-applied to linked asset. | ✅ Yes |
| **11.6** | **AI Chat Interface** | `frontend/src/components/ai/AIChatPanel.tsx` [NEW] | 1. Floating chat button in bottom-right.<br>2. Context-aware: current scene, asset, user role.<br>3. Supports follow-up questions. | ✅ Yes |
| **11.7** | **AI Analytics Insights** | `backend/src/services/ai.service.ts`, `frontend/src/pages/Dashboard.tsx` | 1. Weekly AI summary of portfolio health.<br>2. Top 3 risk areas identified.<br>3. Recommends prioritized actions. | ✅ Yes |

---

## MODULE 12: Data Layer Upgrade

| Task ID | Description | Affected Files | Acceptance Criteria | Testable |
|---|---|---|---|---|
| **12.1** | **DB Abstraction Layer** | `backend/src/config/database.ts` | 1. `DatabaseAdapter` interface: `read()`, `write()`, `query()`.<br>2. Current JSON wrapped as `JsonAdapter`.<br>3. All services use adapter (no direct db.json). | ✅ Yes |
| **12.2** | **SQLite Adapter** | `backend/src/config/sqlite.ts` [NEW] | 1. `SqliteAdapter` implements `DatabaseAdapter`.<br>2. Auto-creates tables on init.<br>3. Selectable via `DB_DRIVER=sqlite|json`. | ✅ Yes |
| **12.3** | **Migration System** | `backend/src/config/migrations.ts` [NEW] | 1. Versioned migration files.<br>2. `runMigrations()` on boot.<br>3. Tracks applied migrations. | ✅ Yes |
| **12.4** | **Data Seeder** | `backend/src/config/seed.ts` [NEW] | 1. `seedDatabase()` populates demo data.<br>2. Includes sample assets, inspections, WOs.<br>3. Idempotent (safe to rerun). | ✅ Yes |
| **12.5** | **Backup & Restore** | `backend/src/routes/admin.ts` [NEW] | 1. `POST /api/admin/backup` creates timestamped backup.<br>2. `POST /api/admin/restore` loads backup.<br>3. Admin-only access. | ✅ Yes |

---

## 🧭 Execution Order

```text
Phase 1 (Foundation):     Module 4 → Module 8 → Module 12
Phase 2 (Intelligence):   Module 5 → Module 6 → Module 9
Phase 3 (Automation):     Module 7 → Module 10 → Module 11
```

---

## Summary

| Module | Tasks | New Files | Modified Files |
|---|---|---|---|
| 4: Asset Intelligence | 8 | 3 | 4 |
| 5: Inspection + AI | 10 | 0 | 7 |
| 6: Maintenance + AI | 8 | 4 | 4 |
| 7: Emergency + AI | 6 | 0 | 4 |
| 8: State Machine | 5 | 0 | 5 |
| 9: Timeline | 5 | 3 | 2 |
| 10: Rules Engine | 6 | 3 | 3 |
| 11: AI Core | 7 | 2 | 4 |
| 12: Data Layer | 5 | 4 | 1 |
| **Total** | **60** | **19** | **34** |
