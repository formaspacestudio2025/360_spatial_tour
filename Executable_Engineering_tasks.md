# Executable Engineering Tasks — Full Roadmap

> Comprehensive conversion of `docs/roadmap.md` into executable engineering tasks.
> Each task is scoped to limited files, independently testable, and has clear acceptance criteria.
> *Note: Completed Phase 1 items (like Issue CRUD, Comments, SLA Timer, Basic RBAC) are excluded.*

---

## MODULE 1: Core Viewer Enhancements

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **1.1** | **Inspection Mode** | `frontend/src/pages/WalkthroughViewer.tsx`, `frontend/src/components/viewer/InspectionSidebar.tsx` | 1. Red overlay UI activates.<br>2. Edit tools disabled.<br>3. Checklist sidebar appears. | ✅ Yes |
| **1.2** | **Maintenance Mode** | `frontend/src/pages/WalkthroughViewer.tsx`, `frontend/src/components/viewer/MaintenanceOverlay.tsx` | 1. Mode toggle activates.<br>2. Asset tags highlighted.<br>3. Work order context shown. | ✅ Yes |
| **1.3** | **Emergency Mode** | `frontend/src/pages/WalkthroughViewer.tsx`, `frontend/src/components/viewer/EmergencyOverlay.tsx` | 1. Red banners active.<br>2. Evacuation paths shown.<br>3. Emergency contacts displayed. | ✅ Yes |
| **1.4** | **Guided Tour Mode** | `frontend/src/pages/WalkthroughViewer.tsx`, `frontend/src/components/viewer/TourControls.tsx` | 1. Auto-advances scenes.<br>2. Displays narration text.<br>3. Step counter increments. | ✅ Yes |
| **1.5** | **Floor Navigation** | `backend/src/types/scene.ts`, `frontend/src/components/viewer/FloorSelector.tsx` | 1. Scenes have `floor_number`.<br>2. UI shows floor selector.<br>3. Selecting floor filters scenes. | ✅ Yes |
| **1.6** | **Hotspot Permissions** | `backend/src/routes/hotspots.ts`, `frontend/src/components/viewer/HotspotMarker.tsx` | 1. Hotspots have role field.<br>2. Backend filters by role.<br>3. PIN prompt for restricted hotspots. | ✅ Yes |
| **1.7** | **Hotspot Categories** | `backend/src/types/hotspot.ts`, `frontend/src/components/viewer/HotspotFilters.tsx` | 1. Hotspots have category enum.<br>2. UI filters by category.<br>3. Map updates dynamically. | ✅ Yes |
| **1.8** | **Smart Scene Switch** | `frontend/src/components/viewer/Breadcrumbs.tsx`, `frontend/src/utils/navigation.ts` | 1. Suggests nearest scene.<br>2. Shows breadcrumb trail.<br>3. Back button works. | ✅ Yes |
| **1.9** | **Minimap** | `frontend/src/components/viewer/Minimap.tsx`, `frontend/src/pages/WalkthroughViewer.tsx` | 1. 2D floor plan renders.<br>2. Position dot updates on move.<br>3. Click map to jump scene. | ✅ Yes |
| **1.10** | **Hotspot Clustering** | `frontend/src/components/viewer/MarkerCluster.tsx` | 1. Overlapping markers group into cluster icon.<br>2. Displays count.<br>3. Zoom unclusters. | ✅ Yes |

---

## MODULE 2: Issue Management (Remaining gaps)

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **2.13** | **Resolution Proof** | `backend/src/types/issue.ts`, `frontend/src/components/issueManagement/ResolutionForm.tsx` | 1. Closure requires image upload.<br>2. Timestamp added.<br>3. Images viewable in history. | ✅ Yes |
| **2.14** | **Approval Workflow** | `backend/src/routes/issuesRoutes.ts`, `frontend/src/components/issueManagement/ApprovalActions.tsx` | 1. Status changes to `pending_approval`.<br>2. Manager sees approve/reject.<br>3. Rejection reverts status. | ✅ Yes |

---

## MODULE 3: Asset Management

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **3.1** | **Asset Registry** | `backend/src/routes/assetsRoutes.ts`, `frontend/src/pages/AssetManagement.tsx` | 1. CRUD API for assets.<br>2. UI form with brand/serial.<br>3. List view with pagination. | ✅ Yes |
| **3.2** | **Asset-Scene Mapping** | `backend/src/types/asset.ts`, `frontend/src/pages/WalkthroughViewer.tsx` | 1. Asset has yaw/pitch/scene_id.<br>2. Marker renders in viewer.<br>3. Marker clickable. | ✅ Yes |
| **3.3** | **Asset QR Codes** | `backend/src/routes/assetsRoutes.ts`, `frontend/src/components/assets/QRModal.tsx` | 1. GET /qr returns PNG.<br>2. Modal displays QR.<br>3. QR links to asset view. | ✅ Yes |
| **3.4** | **Asset Lifecycle** | `backend/src/types/asset.ts`, `frontend/src/components/assets/LifecycleTab.tsx` | 1. Purchase/warranty dates.<br>2. UI calculates age.<br>3. Alerts if warranty expired. | ✅ Yes |
| **3.5** | **Asset Documents** | `backend/src/routes/assetsRoutes.ts`, `frontend/src/components/assets/DocumentUpload.tsx` | 1. API accepts files.<br>2. Linked to asset ID.<br>3. Download links work. | ✅ Yes |
| **3.6** | **Asset Health Score** | `backend/src/services/asset.service.ts`, `frontend/src/components/assets/HealthBadge.tsx` | 1. Service calculates score (0-100).<br>2. UI shows color badge.<br>3. Factors open issues. | ✅ Yes |
| **3.7** | **Preventive Maint.** | `backend/src/routes/maintenance.ts`, `frontend/src/components/assets/PMSchedule.tsx` | 1. Schedule created per asset.<br>2. Auto-creates WOs.<br>3. UI shows upcoming PMs. | ✅ Yes |
| **3.8** | **Inspection Schedule** | `backend/src/services/inspection.service.ts`, `frontend/src/pages/Inspections.tsx` | 1. Auto-generates checklist.<br>2. Assigns due date.<br>3. Triggers notifications. | ✅ Yes |
| **3.9** | **Checklist Engine** | `backend/src/routes/checklists.ts`, `frontend/src/components/assets/ChecklistBuilder.tsx` | 1. Build template via UI.<br>2. Assign to asset.<br>3. Inspector can complete it. | ✅ Yes |
| **3.10** | **Compliance Tagging** | `backend/src/types/asset.ts`, `frontend/src/components/assets/ComplianceTags.tsx` | 1. Asset has compliance array.<br>2. UI shows pass/fail tags.<br>3. Links to regulation. | ✅ Yes |
| **3.11** | **Asset Dashboard** | `backend/src/routes/dashboard.ts`, `frontend/src/components/dashboard/AssetWidgets.tsx` | 1. API returns asset risk counts.<br>2. Warranty expiries charted.<br>3. Overdue PMs highlighted. | ✅ Yes |

---

## MODULE 4: Vendor & Maintenance Operations

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **4.1** | **Vendor Registry** | `backend/src/routes/vendors.ts`, `frontend/src/pages/Vendors.tsx` | 1. CRUD API for vendors.<br>2. SLA terms field.<br>3. List view with categories. | ✅ Yes |
| **4.2** | **Vendor Portal** | `backend/src/routes/auth.ts`, `frontend/src/layouts/VendorLayout.tsx` | 1. Vendor login role.<br>2. Restricted dashboard (own WOs).<br>3. Strict data isolation. | ✅ Yes |
| **4.3** | **Work Orders** | `backend/src/routes/workorders.ts`, `frontend/src/pages/WorkOrders.tsx` | 1. Create WO from issue/asset.<br>2. Assign to vendor.<br>3. Track status lifecycle. | ✅ Yes |
| **4.4** | **Service Requests** | `backend/src/routes/requests.ts`, `frontend/src/pages/ServiceRequests.tsx` | 1. Internal request form.<br>2. Manager approval queue.<br>3. Converts to WO on approve. | ✅ Yes |
| **4.5** | **AMC Contracts** | `backend/src/routes/contracts.ts`, `frontend/src/components/vendors/ContractsTab.tsx` | 1. Link vendor to asset.<br>2. Track expiry.<br>3. Alert 30 days before expiry. | ✅ Yes |
| **4.6** | **Vendor Performance**| `backend/src/services/vendor.service.ts`, `frontend/src/components/vendors/PerformanceStats.tsx`| 1. Calculates on-time %.<br>2. Calculates avg resolution time.<br>3. Displays on profile. | ✅ Yes |
| **4.7** | **Invoice Tracking** | `backend/src/routes/invoices.ts`, `frontend/src/components/workorders/InvoiceUploader.tsx` | 1. Upload invoice PDF.<br>2. Link to WO.<br>3. Track paid/unpaid status. | ✅ Yes |
| **4.8** | **Contractor Access** | `backend/src/services/auth.service.ts`, `frontend/src/components/vendors/TemporaryAccess.tsx`| 1. Generate temp token.<br>2. Expires after X hours.<br>3. Grants view-only access. | ✅ Yes |

---

## MODULE 5: Dashboard System (BI Layer)

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **5.1** | **Executive Dashboard**| `frontend/src/pages/ExecutiveDashboard.tsx`, `backend/src/services/dashboard.service.ts` | 1. Aggregate portfolio KPIs.<br>2. Show SLA health across properties.<br>3. High-level charts. | ✅ Yes |
| **5.2** | **Operations Dashboard**|`frontend/src/pages/OpsDashboard.tsx`, `backend/src/services/dashboard.service.ts` | 1. Show today's tasks.<br>2. Highlight overdue items.<br>3. Show team workload. | ✅ Yes |
| **5.3** | **Issue Dashboard** | `frontend/src/components/dashboard/IssueHeatmaps.tsx` | 1. Render heatmaps.<br>2. Show issue trend charts.<br>3. Drill-down by status. | ✅ Yes |
| **5.4** | **Asset Dashboard** | `frontend/src/components/dashboard/AssetRiskCharts.tsx` | 1. Show risk scores.<br>2. Alert on upcoming PMs.<br>3. Warranty timeline. | ✅ Yes |
| **5.5** | **Compliance Dash** | `frontend/src/pages/ComplianceDashboard.tsx` | 1. Show pass/fail rates.<br>2. Upcoming audit deadlines.<br>3. Red/Green indicators. | ✅ Yes |
| **5.6** | **Property Dashboard** | `frontend/src/pages/PropertyDashboard.tsx` | 1. Specific stats per walkthrough.<br>2. Issues filtered by property.<br>3. Inspection history. | ✅ Yes |
| **5.7** | **Multi-Property View**| `frontend/src/components/dashboard/PortfolioMap.tsx` | 1. Map with property pins.<br>2. Issue counts on hover.<br>3. Click to drill down. | ✅ Yes |
| **5.8** | **Real-Time Updates** | `backend/src/utils/websockets.ts`, `frontend/src/hooks/useRealTime.ts` | 1. WebSocket server active.<br>2. Frontend subscribes.<br>3. Counters update instantly. | ✅ Yes |

---

## MODULE 6: Reporting Engine

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **6.1** | **Issue Report PDF** | `backend/src/services/report.service.ts`, `frontend/src/components/reports/IssueExport.tsx` | 1. Generate PDF with filters.<br>2. Include stats.<br>3. Include location snapshots. | ✅ Yes |
| **6.2** | **Inspection Report** | `backend/src/services/report.service.ts`, `frontend/src/components/reports/InspectionExport.tsx` | 1. Checklist completion.<br>2. Render photos.<br>3. Show sign-off signature. | ✅ Yes |
| **6.3** | **Asset Report** | `backend/src/services/report.service.ts`, `frontend/src/components/reports/AssetExport.tsx` | 1. Export full registry.<br>2. Health scores included.<br>3. Maintenance history. | ✅ Yes |
| **6.4** | **Audit Trail Report** | `backend/src/services/report.service.ts`, `frontend/src/components/reports/AuditExport.tsx` | 1. Export user actions.<br>2. Show before/after diffs.<br>3. Filter by date/user. | ✅ Yes |
| **6.5** | **Compliance Report** | `backend/src/services/report.service.ts`, `frontend/src/components/reports/ComplianceExport.tsx` | 1. Export regulatory checks.<br>2. Evidence attachments.<br>3. Pass/fail markings. | ✅ Yes |
| **6.6** | **Executive Summary** | `backend/src/services/report.service.ts`, `frontend/src/components/reports/ExecSummary.tsx` | 1. 1-page PDF.<br>2. High-level KPI charts.<br>3. Auto-layout formatting. | ✅ Yes |
| **6.7** | **Scheduled Reports** | `backend/src/services/cron.service.ts`, `backend/src/routes/reports.ts` | 1. Cron job emails PDF.<br>2. Configurable frequency.<br>3. Configurable recipients. | ✅ Yes |
| **6.8** | **Custom Builder** | `frontend/src/pages/ReportBuilder.tsx`, `backend/src/services/report.service.ts` | 1. Drag-drop field selection.<br>2. Preview report.<br>3. Save template. | ✅ Yes |

---

## MODULE 7: Enterprise Platform Features

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **7.4** | **SSO Ready** | `backend/src/routes/auth.ts`, `backend/src/services/sso.service.ts` | 1. OAuth2/SAML endpoints.<br>2. Auto-provision user.<br>3. Map IdP groups to roles. | ✅ Yes |
| **7.5** | **Audit Log** | `backend/src/middleware/audit.ts`, `frontend/src/pages/AuditLogs.tsx` | 1. Every write logged.<br>2. UI to view logs.<br>3. Searchable by entity/user. | ✅ Yes |
| **7.6** | **White-Label** | `backend/src/routes/orgs.ts`, `frontend/src/components/layout/ThemeProvider.tsx` | 1. Upload custom logo.<br>2. Set colors.<br>3. CSS variables update. | ✅ Yes |
| **7.7** | **Multi-Tenant** | `backend/src/config/database.ts`, `backend/src/middleware/tenant.ts` | 1. Queries scope to org_id.<br>2. Strict isolation.<br>3. Cross-tenant blocked. | ✅ Yes |
| **7.8** | **API Keys** | `backend/src/routes/apikeys.ts`, `frontend/src/pages/DeveloperSettings.tsx` | 1. Generate token.<br>2. Revoke token.<br>3. Tokens auth as org/role. | ✅ Yes |
| **7.9** | **Webhooks** | `backend/src/services/webhook.service.ts`, `frontend/src/pages/Webhooks.tsx` | 1. Register URL.<br>2. Select events.<br>3. Fire POST request. | ✅ Yes |
| **7.10** | **Data Export** | `backend/src/routes/export.ts`, `frontend/src/components/settings/DataExport.tsx` | 1. Download full org JSON.<br>2. Includes relationships.<br>3. Secure link. | ✅ Yes |

---

## MODULE 8: Integration Readiness

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **8.1** | **REST API Docs** | `backend/src/docs/swagger.yml`, `backend/src/routes/docs.ts` | 1. Swagger UI at /api/docs.<br>2. Endpoints documented.<br>3. Schema definitions. | ✅ Yes |
| **8.3** | **ERP Connector** | `backend/src/services/integrations/erp.ts` | 1. Mapping layer.<br>2. Sync job.<br>3. Error logging for failures. | ✅ Yes |
| **8.4** | **IoT Data Bridge** | `backend/src/routes/iot.ts`, `backend/src/services/iot.service.ts` | 1. Ingest webhook.<br>2. Evaluate threshold.<br>3. Auto-create issue. | ✅ Yes |
| **8.5** | **Email Integration** | `backend/src/services/email.service.ts`, `backend/src/routes/orgs.ts` | 1. SMTP config per org.<br>2. Send via custom SMTP.<br>3. Fallback to default. | ✅ Yes |
| **8.6** | **Ticketing Sync** | `backend/src/services/integrations/jira.ts` | 1. Connect Jira.<br>2. Issue creation mirrors.<br>3. Status syncs bidirectionally. | ✅ Yes |
| **8.7** | **Maps Integration** | `frontend/src/components/dashboard/GoogleMap.tsx` | 1. Enter API key.<br>2. Map renders markers.<br>3. Requires lat/long. | ✅ Yes |

---

## MODULE 9: AI Intelligence Layer

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **9.1** | **Issue Auto-Classify**| `backend/src/services/ai.service.ts`, `backend/src/routes/issuesRoutes.ts` | 1. OpenAI prompt evaluates.<br>2. Returns type/severity.<br>3. Auto-fills in UI. | ✅ Yes |
| **9.2** | **Maintenance Predict**| `backend/src/services/ai.service.ts`, `frontend/src/components/assets/PredictionBadge.tsx` | 1. Predicts failure date.<br>2. Displayed on asset.<br>3. Alert 30 days before. | ✅ Yes |
| **9.3** | **Risk Scoring** | `backend/src/services/ai.service.ts` | 1. Composite score 0-100.<br>2. Factors age, open issues.<br>3. Updated nightly. | ✅ Yes |
| **9.4** | **Anomaly Detection** | `backend/src/services/ai.service.ts`, `backend/src/services/cron.service.ts` | 1. Detects >2 std dev spikes.<br>2. Logs anomaly.<br>3. Admin email alert. | ✅ Yes |
| **9.5** | **Smart Suggestions** | `backend/src/services/ai.service.ts`, `frontend/src/components/issues/SimilarIssues.tsx` | 1. Embedding search.<br>2. Top 3 similar shown.<br>3. Helps prevent duplicates. | ✅ Yes |
| **9.6** | **NLP Search** | `backend/src/routes/search.ts`, `frontend/src/components/layout/GlobalSearch.tsx` | 1. Text to SQL/JSON.<br>2. Natural queries work.<br>3. Structured results. | ✅ Yes |
| **9.7** | **Executive Insights** | `backend/src/services/ai.service.ts`, `backend/src/services/report.service.ts` | 1. Weekly digest via LLM.<br>2. Summarizes risks.<br>3. Emailed as PDF/HTML. | ✅ Yes |
| **9.8** | **Image Analysis** | `backend/src/services/ai.service.ts`, `backend/src/routes/issuesRoutes.ts` | 1. Photo sent to Vision API.<br>2. Detects crack/leak.<br>3. Adds AI tags to issue. | ✅ Yes |

---

## MODULE 10: Revenue & Monetization

| Task ID | Description | Affected Files | Acceptance Criteria | Independently Testable |
|---|---|---|---|---|
| **10.1**| **Subscription Plans** | `backend/src/types/plan.ts`, `backend/src/middleware/billing.ts` | 1. Free/Pro/Enterprise flags.<br>2. Blocks gated features.<br>3. Returns 402. | ✅ Yes |
| **10.2**| **Seat-Based Billing** | `backend/src/services/billing.service.ts` | 1. Count active users.<br>2. Sync quantity to Stripe.<br>3. Prevent creation if limit met. | ✅ Yes |
| **10.3**| **Usage Metering** | `backend/src/middleware/metering.ts` | 1. Track API calls, storage.<br>2. Store in usage table.<br>3. Reset monthly. | ✅ Yes |
| **10.4**| **Billing Dashboard** | `frontend/src/pages/Billing.tsx`, `backend/src/routes/billing.ts` | 1. Show current plan.<br>2. Show usage vs limits.<br>3. Link to Stripe portal. | ✅ Yes |
| **10.5**| **Stripe Integration** | `backend/src/services/stripe.service.ts`, `backend/src/routes/webhooks/stripe.ts`| 1. Checkout session.<br>2. Handle payment webhook.<br>3. Handle cancellation. | ✅ Yes |
| **10.6**| **White-Label License**| `backend/src/types/plan.ts`, `frontend/src/components/settings/Branding.tsx` | 1. Flag `can_whitelabel`.<br>2. UI disabled if false.<br>3. Upsell prompt. | ✅ Yes |
| **10.7**| **Module Licensing** | `backend/src/types/plan.ts` | 1. Add-on flags.<br>2. Hide menus if false.<br>3. Modular pricing. | ✅ Yes |
| **10.8**| **Usage Analytics** | `backend/src/services/analytics.service.ts`, `frontend/src/pages/Analytics.tsx` | 1. Track feature clicks.<br>2. Dashboard shows usage.<br>3. Exportable. | ✅ Yes |