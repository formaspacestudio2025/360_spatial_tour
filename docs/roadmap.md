# 🏢 Enterprise Spatial Intelligence Platform — Master Roadmap
## "The Operating System for Physical Spaces"

> **Document Purpose**: Complete feature planning memory for enterprise platform development.
> **Status**: Living document — update after every sprint/session.
> **Rules**: Do NOT rebuild from scratch. Improve, fix, extend the existing app only.

---

## SECTION 1: EXISTING APP UNDERSTANDING

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| 3D Viewer | React Three Fiber + Three.js + @react-three/drei |
| State | Zustand |
| Data Fetching | TanStack Query |
| Backend | Node.js + Express + TypeScript |
| Database | JSON file emulation (SQLite-style API via `database.ts`) |
| Auth | JWT tokens via `authStore.ts` |
| File Storage | Local `storage.service.ts` |

### Existing Modules (Built)
| Module | Status | Quality |
|---|---|---|
| 360 Viewer (`Viewer360.tsx`) | ✅ Working | Good — Three.js sphere, orbit controls |
| Panorama Scene Upload | ✅ Working | Basic |
| Hotspot System | ✅ Working | Strong — 20+ icon types, animations, media overlays |
| Scene Transitions | ✅ Working | Good — zoom-fade, crossfade, pan-slide, instant cut |
| Issue Management | ✅ Working | Full CRUD + comments + attachments + history + CSV export; SLA/approval workflow |
| Dashboard | ⚠️ Weak | Basic stat cards (count-only), no charts, no KPIs |
| Authentication | ✅ Working | JWT, role-based (admin/editor/viewer) |
| User Management | ✅ Completed | Listed in dashboard team section; no full CRUD UI |
| Walkthrough CRUD | ✅ Working | Create/edit/delete/search walkthroughs |
| AI Tag System | ✅ Working | Tags placed on scene, filter/visibility toggle |
| Hotspot Media Manager | ✅ Working | Upload/manage images, videos, documents per hotspot |
| View Modes | ⚠️ Weak | View/Edit/Share — no Inspection, Maintenance, Emergency modes |
| Scene Settings | ⚠️ Partial | Limited metadata (no floor number, room type, area sqft) |
| Reports | ❌ Missing | No PDF generation, no scheduled reports |
| Asset Management | ❌ Missing | Entirely absent |
| Vendor Management | ❌ Missing | Entirely absent |
| Notification System | ❌ Missing | No email/push/in-app notifications |
| Compliance Engine | ❌ Missing | Entirely absent |
| Multi-Property Support | ⚠️ Partial | `client` field on walkthroughs only |
| QR Code Support | ⚠️ Placeholder | UI placeholder exists, no functional QR generation |
| Embed Support | ⚠️ Partial | Embed URL exists in SharePanel, no iframe security/auth |

---

## SECTION 2: MISSING CRITICAL FEATURES

### 🔴 Blockers (Cannot ship enterprise without these)
1. **Issue Comments & Attachments** — ✅ Done (threaded comments + file upload/list/delete UI)
2. **Role-Based Access Control (RBAC)** — current roles are flat (admin/editor/viewer); no property-level permissions
3. **Asset Management** — zero implementation; critical for FM/maintenance market
4. **Notifications** — no alerting on assignments, SLA breaches, status changes
5. **Report Generation** — no PDF export of any kind
6. **Multi-Property Dashboard** — no org-level aggregation across walkthroughs
7. **Issue SLA Escalation** — ✅ Done (SLA timer + auto-escalation with audit trail)
8. **Floor Plan Navigation** — no floor-aware scene switching; only flat hotspot linking
9. **Work Order System** — vendors/technicians need actionable task assignments

### 🟡 Gaps (Required for enterprise tier)
1. Issue attachments (before/after proof images)
2. Guided navigation / tour mode
3. Inspection checklists
4. Recurring maintenance scheduling
5. Vendor portal
6. Audit trail export
7. Organization hierarchy (org → branch → property → floor → room)
8. White-label support
9. Usage analytics and billing readiness

---

## SECTION 3: WEAK CURRENT MODULES

| Module | Weakness | Fix Priority |
|---|---|---|
| Dashboard | Only counts, no charts, no trends, no KPIs | HIGH |
| Issue Management | No approval workflow | MEDIUM |
| User Management | No UI to create/edit/delete users, assign roles | HIGH |
| View Modes | Only view/edit/share — missing Inspection/Maintenance modes | MEDIUM |
| Scene Settings | Limited metadata (no floor number, room type, area sqft) | MEDIUM |
| AI Tags | UI exists but no structured AI pipeline integration | LOW |
| Database Layer | JSON emulation works but limits query complexity and scale | MEDIUM (defer) |
| Storage | Local file storage, no CDN/cloud storage | LOW (defer) |

---

## SECTION 4: FULL FEATURE PLANNING ROADMAP

### MODULE 1: Core Viewer Enhancements
```
1.1  Inspection Mode     — Red overlay UI, checklist sidebar, no edit capability
1.2  Maintenance Mode    — Work order overlay, asset tag overlay, technician view
1.3  Emergency Mode      — Alert banners, evacuation route overlays, emergency contacts
1.4  Guided Tour Mode    — Auto-advance scenes, narration text, step counter
1.5  Floor Navigation    — Floor selector UI, scenes tagged with floor_number field
1.6  Hotspot Permissions — per-role visibility, restricted hotspots (PIN/role gated)
1.7  Hotspot Categories  — group by: navigation / info / asset / issue / safety / media
1.8  Smart Scene Switch  — suggest nearest scene, breadcrumb trail, back button
1.9  Minimap            — 2D floor plan thumbnail with current position dot
1.10 Hotspot Clustering  — group overlapping hotspots at zoom-out levels
```

### MODULE 2: Issue Management (Complete)
```
2.1  Comments System     — threaded comments on each issue with user avatar + timestamp
2.2  File Attachments    — upload before/after photos, documents per issue
2.3  Notification Hooks  — on create/assign/status change → trigger notification
2.4  SLA Timer           — countdown display, auto-escalate when breach detected
2.5  Escalation Rules    — define: if open > X days → escalate to manager email
2.6  Issue Filters       — by status, type, priority, date range, assignee, property
2.7  Issue Search        — full-text search across title, description, location
2.8  Issue Export        — export to CSV/PDF with filters applied
2.9  Bulk Actions        — bulk assign, bulk status change, bulk delete
2.10 Issue Templates     — predefined issue types with default fields
2.11 Hotspot-Issue Link  — pin issue to exact hotspot location in scene
2.12 Recurrence          — mark issue as recurring, auto-reopen after X days
2.13 Resolution Proof    — upload before + after image with timestamp on closure
2.14 Approval Workflow   — resolved → pending_approval → verified by manager
```

### MODULE 3: Asset Management
```
3.1  Asset Registry      — create assets with: name, type, brand, model, serial, location
3.2  Asset-Scene Mapping — pin asset to exact 360 scene + hotspot position
3.3  Asset QR Codes      — generate QR per asset, scan to jump to asset view
3.4  Asset Lifecycle     — purchase date, warranty expiry, end-of-life tracking
3.5  Asset Documents     — attach manuals, warranties, invoices to each asset
3.6  Asset Health Score  — composite: age + maintenance frequency + open issues
3.7  Preventive Maint.   — schedule recurring PM tasks per asset (monthly/quarterly)
3.8  Inspection Schedule — auto-create inspection checklists based on asset type
3.9  Checklist Engine    — define checklist templates → assign → complete → sign-off
3.10 Compliance Tagging  — mark asset as compliant/non-compliant with regulation ref
3.11 Asset Dashboard     — total assets, due for maintenance, warranty expiries, risk score
```

### MODULE 4: Vendor & Maintenance Operations
```
4.1  Vendor Registry     — company name, contact, service categories, SLA terms
4.2  Vendor Portal       — limited-access login for vendors (view/update assigned work)
4.3  Work Orders         — create from issue/asset → assign to vendor/tech → track
4.4  Service Requests    — internal request form → approve → convert to work order
4.5  AMC Contracts       — Annual Maintenance Contract tracking per vendor per asset
4.6  Vendor Performance  — on-time %, re-open rate, avg resolution time
4.7  Invoice Tracking    — link vendor invoices to work orders
4.8  Contractor Access   — temporary QR/token-based access to specific walkthroughs
```

### MODULE 5: Dashboard System (Rebuild as BI Layer)
```
5.1  Executive Dashboard — portfolio KPIs: total properties, open issues, SLA health
5.2  Operations Dashboard— daily work: today's tasks, overdue items, team workload
5.3  Issue Dashboard     — by status, by type, by property, trend charts, heatmaps
5.4  Asset Dashboard     — risk scores, upcoming PM, warranty alerts
5.5  Compliance Dash     — pass/fail rates, upcoming audit deadlines
5.6  Property Dashboard  — per-walkthrough: scenes, issues, assets, last inspection
5.7  Multi-Property View — map view with property pins + issue count indicators
5.8  Real-Time Updates   — WebSocket push for live counter updates
5.9  Date Filters        — last 7d / 30d / 90d / custom range on all dashboards
5.10 Chart Library       — bar, line, pie, donut, gauge, heatmap charts (Recharts)
```

### MODULE 6: Reporting Engine
```
6.1  Issue Report PDF    — filtered list + summary stats + location snapshots
6.2  Inspection Report   — checklist completion + findings + photos + sign-off
6.3  Asset Report        — full asset registry + health scores + maintenance history
6.4  Audit Trail Report  — all actions with user, timestamp, before/after
6.5  Compliance Report   — regulatory checks: pass/fail + evidence attachments
6.6  Executive Summary   — 1-page KPI summary with charts (PDF)
6.7  Scheduled Reports   — cron-based email delivery (weekly/monthly)
6.8  Custom Report Builder — drag-and-drop field selection for power users
```

### MODULE 7: Enterprise Platform Features
```
7.1  Org Hierarchy       — Organization → Division → Property → Floor → Room/Zone
7.2  RBAC Engine         — permissions at org/property level (not just global role)
7.3  Permission Matrix   — define: what each role can see/create/edit/delete/approve
7.4  SSO Ready           — OAuth2 / SAML integration hooks (Google, Azure AD)
7.5  Audit Log           — every write action logged: user, entity, timestamp, diff
7.6  White-Label         — custom logo, colors, domain, email sender per org
7.7  Multi-Tenant        — data isolation per organization in the JSON/DB layer
7.8  API Keys            — generate API tokens per org for external integrations
7.9  Webhooks            — outbound webhooks on events (issue created, resolved, etc.)
7.10 Data Export         — full org data export as JSON/CSV for portability
```

### MODULE 8: Integration Readiness
```
8.1  REST API Docs       — OpenAPI/Swagger spec auto-generated from routes
8.2  Webhook Engine      — event-driven outbound HTTP hooks
8.3  ERP Connector       — data mapping layer for SAP / Oracle FM modules
8.4  IoT Data Bridge     — receive sensor data → auto-create issues if threshold breach
8.5  Email Integration   — SMTP config per org for transactional emails
8.6  Ticketing Sync      — Jira / ServiceNow / Zendesk bidirectional issue sync
8.7  Maps Integration    — Google Maps / Mapbox for property location views
```

### MODULE 9: AI Intelligence Layer
```
9.1  Issue Auto-Classify — on create: auto-suggest type/severity based on description
9.2  Maintenance Predict — based on asset age + history: predict next failure date
9.3  Risk Scoring        — composite AI risk score per asset/property
9.4  Anomaly Detection   — flag unusual issue patterns (spike in type X at property Y)
9.5  Smart Suggestions   — suggest similar issues, related assets, past resolutions
9.6  NLP Search          — natural language query: "show all critical HVAC issues last month"
9.7  Executive Insights  — weekly AI digest: top risks, trends, recommendations
9.8  Image Analysis      — analyze uploaded photos to detect issue type (crack, leak, etc.)
```

### MODULE 10: Revenue & Monetization
```
10.1 Subscription Plans  — Free / Pro / Enterprise tiers with feature gating
10.2 Seat-Based Billing  — per-user pricing for editor/manager seats
10.3 Usage Metering      — track: walkthroughs, scenes, storage, API calls
10.4 Billing Dashboard   — admin view of usage vs plan limits
10.5 Stripe Integration  — payment processing for SaaS subscriptions
10.6 White-Label License — premium tier: full white-labeling for agencies
10.7 Module Licensing    — sell Asset Module / Vendor Module as add-ons
10.8 Usage Analytics     — feature usage tracking for product decisions
```

---

## SECTION 5: PHASE-WISE IMPLEMENTATION PLAN

### 🟢 PHASE 1 — Foundation & Enterprise Core (Weeks 1–8)
> Goal: Make existing app production-ready. Fix all broken modules. Add must-have enterprise features.

| Sprint | Focus | Deliverables |
|---|---|---|
| W1–2 | Issue Management Complete | Comments, file attachments, SLA timer, bulk actions, CSV export |
| W2–3 | Dashboard Upgrade | Charts (Recharts), trend lines, date filters, property dashboard |
| W3–4 | User Management UI | Create/edit/delete users, assign roles, invite via email |
| W4–5 | Org Hierarchy + RBAC | Org model, property-level permissions, permission matrix |
| W5–6 | Inspection Mode | Viewer mode: checklist sidebar, inspection sign-off, findings |
| W6–7 | Asset Registry | Basic asset CRUD, asset-scene pin, QR generation |
| W7–8 | Report Engine V1 | Issue PDF report, inspection report, basic asset report |

**Phase 1 Exit Criteria:**
- [X] Issues: full CRUD + comments + attachments + SLA + approval workflow
- [X] Dashboard: charts showing trends, not just counts
- [X] User Management: full admin UI
- [ ] RBAC: org/property-level permissions enforced
- [ ] Inspection Mode: usable in the viewer
- [ ] Asset Registry: assets pinned to scenes (basic CRUD implemented, scene pin in progress)
- [ ] PDF reports: issue + inspection exportable

---

### 🟡 PHASE 2 — Operational Depth (Weeks 9–18)
> Goal: Build the core enterprise modules that drive daily operations.

| Sprint | Focus | Deliverables |
|---|---|---|
| W9–10 | Notification System | In-app + email: assignments, SLA breach, status changes |
| W10–11 | Asset Management Deep | Lifecycle, PM schedules, checklist engine, health scoring |
| W11–12 | Vendor Management | Vendor registry, work orders, service request flow |
| W12–13 | Maintenance Mode | Viewer mode: work order overlay, asset tag visibility |
| W13–14 | Multi-Property Dashboard | Portfolio map, cross-property KPIs, executive summary |
| W14–15 | Compliance Engine | Compliance checks, audit trail, compliance reports |
| W15–16 | Guided Tour Mode | Auto-advance, narration, step counter, share-as-tour |
| W16–17 | Floor Navigation | Floor selector, scenes tagged to floors, minimap |
| W17–18 | Report Engine V2 | Scheduled reports, compliance report, executive 1-pager |

**Phase 2 Exit Criteria:**
- [ ] Notifications working for all critical events
- [ ] Full PM/checklist cycle: schedule → complete → sign-off
- [ ] Vendor portal: vendors can log in, see assigned work orders
- [ ] All viewer modes working (view/edit/inspection/maintenance)
- [ ] Executive dashboard: multi-property KPIs with trends
- [ ] Scheduled PDF reports emailed weekly

---

### 🔵 PHASE 3 — Intelligence & Scale (Weeks 19–28)
> Goal: AI layer, API readiness, monetization, white-label, enterprise scale.

| Sprint | Focus | Deliverables |
|---|---|---|
| W19–20 | AI Classification | Auto-classify issues, smart suggestions, NLP search |
| W20–21 | API + Webhooks | REST API docs (Swagger), webhook engine, API keys |
| W21–22 | Integration Layer | Email SMTP per org, IoT data bridge, ticketing sync hooks |
| W22–23 | White-Label | Custom branding, domain mapping, email sender config |
| W23–24 | Multi-Tenant | Data isolation, per-org limits, tenant admin controls |
| W24–25 | Subscription + Billing | Stripe integration, plan tiers, usage metering |
| W25–26 | AI Risk + Predictions | Maintenance prediction, risk scoring, anomaly detection |
| W26–27 | Mobile Optimization | Responsive audit of all modules, mobile-first inspection flow |
| W27–28 | Performance + Security | DB migration to SQLite/Postgres, file CDN, security audit |

---

## SECTION 6: MVP → ENTERPRISE ROADMAP

### Tier 1: Viewer MVP (Shippable Now)
- ✅ 360 scene viewer
- ✅ Hotspot navigation
- ✅ Scene transitions
- ✅ Basic issue pin + form
- ✅ User auth + basic roles
- ✅ Issue comments + attachments
- ✅ Dashboard charts
- ❌ Need: PDF export

### Tier 2: Operations MVP (Phase 1 Complete)
- Issue management: full workflow with attachments + comments
- Inspection mode in viewer
- Basic asset registry
- PDF report export
- Dashboard with charts
- User/org management

### Tier 3: Enterprise Ready (Phase 2 Complete)
- Vendor + work order management
- Maintenance scheduling + checklists
- Compliance engine
- Multi-property executive dashboard
- Notification system
- Scheduled reporting
- Full RBAC

### Tier 4: Platform Play (Phase 3 Complete)
- AI intelligence layer
- API + webhooks for integrations
- White-label
- Multi-tenant SaaS
- Subscription billing

---

## SECTION 7: REVENUE-IMPACT FEATURES

### Immediate Revenue Enablers (Phase 1)
| Feature | Revenue Impact | Why |
|---|---|---|
| PDF Report Export | HIGH | Clients will pay extra for professional exports |
| Inspection Mode | HIGH | Enables selling to FM companies for site audits |
| User Management | HIGH | Required to onboard teams, seat-based billing |
| Issue Workflow + Approvals | HIGH | FM operations companies need approval chains |
| Asset Registry | HIGH | Unlocks FM / Maintenance market segment |

### Medium-Term Revenue (Phase 2)
| Feature | Revenue Impact | Why |
|---|---|---|
| Vendor Portal | HIGH | Vendor management is a separate paid module |
| Scheduled Reports | HIGH | Automation = premium feature = upsell |
| Executive Dashboard | HIGH | C-suite users → enterprise contracts |
| Compliance Engine | VERY HIGH | Regulated industries pay premium for compliance tools |

### Platform Revenue (Phase 3)
| Feature | Revenue Impact | Why |
|---|---|---|
| White-Label | VERY HIGH | Agencies / resellers pay licensing fees |
| API Access | HIGH | Charge for API seat / call volume |
| AI Features | VERY HIGH | AI-powered tier = 3x price multiplier |
| Subscription Plans | CRITICAL | Converts the tool into SaaS MRR |

---

## SECTION 8: COMPETITIVE MOAT FEATURES

| Differentiator | Competitor Gap | Our Advantage |
|---|---|---|
| 360 spatial context for every issue | Generic ticketing tools (CMMS) have no spatial layer | Issues pinned to exact 360 location |
| Operational modes in viewer | Matterport is tour-only; no FM workflow | Inspection / Maintenance / Emergency modes inside viewer |
| Asset + Issue + Vendor in one spatial view | 3 separate tools typically needed | Single platform with visual spatial context |
| AI-powered spatial intelligence | No CMMS/FM tool has spatial AI | Anomaly detection, prediction with visual context |
| White-label for integrators | Most FM platforms cannot be white-labeled | Property managers and integrators pay premium |
| QR-to-scene linking | No competitor does this well | Scan QR → opens exact 360 view of that asset/location |
| Offline inspection mode (future) | Most tools require connectivity | Offline PWA inspection that syncs when back online |

---

## SECTION 9: FINAL STRATEGIC RECOMMENDATIONS

### CTO: Architecture Decisions
- **Keep** JSON DB emulation for Phase 1; **migrate** to SQLite → Postgres in Phase 3
- **Keep** React/Three.js stack — genuine differentiator vs competitors using iframe embeds
- **Add** Recharts for dashboards (zero friction, React-native)
- **Add** background job queue (cron or BullMQ) in Phase 2 for scheduled reports + SLA escalations
- **Defer** WebSocket real-time until Phase 2; polling is sufficient for Phase 1

### Product: What to Build First
1. Fix Issue Management completely — #1 enterprise rejection reason
2. PDF Reports — alone can justify a paid plan
3. Dashboard Charts — makes product feel enterprise, required for demos
4. Inspection Mode — primary use case for FM companies, zero-to-revenue unlock
5. Asset Registry — second biggest enterprise market unlock

### Enterprise Architect: Scale Readiness Rules
- All new DB tables must include `org_id` and `property_id` columns (multi-tenant readiness)
- All new backend services follow the existing class-based, typed service pattern
- All new frontend pages use the existing Zustand + TanStack Query pattern
- Design RBAC as an Express middleware layer, not scattered if/else checks in components
- Keep the JSON emulation layer backward-compatible — write migration scripts before changing it

### Investor: The Pitch
> "We built the operating system for physical spaces. Every facility manager currently juggles 4–7 disconnected tools: CMMS for maintenance, separate ticketing, spreadsheets for assets, monthly PDFs for reports. We replace all of them with a single spatial intelligence platform — every workflow anchored to the exact physical location in 360°. Our visual spatial layer is the moat. No competitor can replicate this without rebuilding from scratch."

---

## SECTION 10: IMPLEMENTATION DECISION LOG

| Date | Decision | Rationale |
|---|---|---|
| 2026-04-25 | Keep JSON DB emulation for Phase 1 | Zero migration risk |
| 2026-04-25 | Use Recharts for dashboards | React-native, no extra complexity |
| 2026-04-25 | Issue management fix-first before new features | Core module must be stable |
| 2026-04-25 | Add `floor_number`, `room_type`, `area_sqft` to scene schema | Foundation for floor navigation and assets |
| 2026-04-25 | RBAC at middleware level, not component level | Scalable and auditable |

---

## SECTION 11: SPRINT TRACKER

### Current Sprint Overview
- **Sprint 1.12** – Issue SLA Timer + Auto‑Escalation – ✅ Completed (2026‑04‑26)
- **Sprint 1.13** – User Management UI (full CRUD) – ✅ Completed (2026‑04‑26)
- **Sprint 1.14** – Asset Registry (Basic CRUD + scene pin) – 🔴 Planned
- **Sprint 1.15** – TypeScript Build Fix (AssetFormModal, AssetManagement) – ✅ Completed (2026‑04‑26)

### Phase 1 Status

| # | Feature | Status | Priority |
|---|---|---|---|
| 1.1 | Fix Issue CREATE bug | ✅ Done | - |
| 1.2 | Issue Form tabs (Details, Workflow, History) | ✅ Done | - |
| 1.3 | Issue SLA Priority fields | ✅ Done | - |
| 1.4 | Issue automated history tracking | ✅ Done | - |
| 1.5 | Scene Transition: custom styles per hotspot | ✅ Done | - |
| 1.6 | Directional transitions (target_yaw/pitch) | ✅ Done | - |
| 1.7 | Smart Preview Tooltips on hotspots | ✅ Done | - |
| 1.8 | Issue Comments (threaded) | ✅ Done | - |
| 1.8.1 | Fix IssueListPage blackout | ✅ Done | - |
| 1.9 | Issue File Attachments (before/after photos) | ✅ Done | - |
| 1.10 | Issue CSV Export | ✅ Done | - |
| 1.11 | Dashboard Charts (Recharts) | ✅ Done | - |
| 1.12 | Issue SLA Timer + Auto-Escalation | ✅ Done | P1 |
| 1.13 | User Management UI (full CRUD) | ✅ Done | P2 |
| 1.14 | Asset Registry (Basic CRUD + scene pin) | 🔴 Planned | P2 |
| 1.14.1 | Asset TypeScript Build Fix | ✅ Done | - |
| 1.15 | Inspection Mode in Viewer | 🔴 Planned | P2 |
| 1.16 | PDF Report Export | 🔴 Planned | P2 |
| 1.17 | Issue PDF Export | 🔴 Planned | P2 |
| 1.18 | QR Code Generation (asset/walkthrough) | 🔴 Planned | P3 |

---

*Last Updated: 2026-04-26 | Document Owner: CTO / Lead Developer*
