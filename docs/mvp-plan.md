# MVP Plan

Restates spec §16's phasing, with Milestone 1 as the delivered first slice of the MVP phase.

## MVP phase (spec §16)

| Item | Status |
|---|---|
| Authentication and RBAC | ✅ Milestone 1 |
| Employee and worker records | ✅ Milestone 1 |
| Farm, plot and sub-plot structure | ✅ Milestone 1 |
| Daily planning | ✅ Milestone 1 |
| Priority-based task management | ✅ Milestone 1 |
| Labour allocation | ✅ Milestone 1 |
| Reassignment approval | ✅ Milestone 1 |
| Attendance | ✅ Milestone 1 |
| Crop calendar | ⏳ Next — lightweight crop/variety/crop-cycle exists; the calendar engine (sowing windows driving recurring activities) doesn't yet |
| Crop-cycle tracking | ✅ Milestone 1 (basic stage tracking + out-of-season sowing guard) |
| Seed lots and germination | ⏳ Next — schema ready |
| Basic inventory | ⏳ Next — schema ready |
| Machinery status and usage | ⏳ Next — schema + `Task.machinery` link ready |
| Harvest forecast and actual harvest | ⏳ Next — schema ready |
| Inspections and issue escalation | ⏳ Next — schema ready |
| Photo and video evidence | ✅ Milestone 1 (task evidence + attendance photo) |
| Management dashboards | ✅ Milestone 1 |
| Essential reports | ⏳ Next — export/PDF pipeline not built; data is queryable via the API today |
| Audit log | ✅ Milestone 1 |
| PWA and basic offline capture | 🟡 Partial — installable PWA shell; offline task-progress queueing is Phase 2 |

## Phase 2 / Phase 3

Unchanged from spec §16 — procurement, soil/plant health, organic input batches, dairy/livestock,
value-added processing, distribution/POD, petty cash, advanced offline sync, and Malayalam localization
are Phase 2; PostGIS, IoT/weather integrations, QR traceability, certification reports, predictive
yield, R&D-to-market, and native mobile apps are Phase 3.

## Acceptance criteria (spec §19) — what Milestone 1 actually satisfies

| Criterion | Met by |
|---|---|
| Management sees all current farm activity in one dashboard | `/dashboard` (Management view) |
| Next day's work plan can be prepared and approved | Daily Planning Board, `Task` DRAFT→SUBMITTED→APPROVED |
| Workers allocated by priority and availability | Labour Allocation Board, `GET /workers/available` |
| Unauthorized mid-task reassignment is prevented | Overlap guard (`findOverlappingAssignment`) + reassignment-only transfer path |
| Supervisors update progress from a phone | Mobile-first `/tasks` progress screen |
| Photos connect to tasks, plots and inspections | `TaskEvidence`, `Attendance.photoMediaId` (inspections in Phase 2) |
| Crop activities checked against the crop calendar | Out-of-season sowing guard on `CropCycle` creation |
| Seeds traced through germination → nursery → cultivation | Schema ready, not yet wired (Phase 2) |
| Inventory in/out is verified | Schema ready, not yet wired (Phase 2) |
| Harvest forecast vs. actual | Schema ready, not yet wired (Phase 2) |
| Machinery usage/repair visible | Schema ready, not yet wired (Phase 2) |
| Incomplete/overdue work auto-highlighted | Farm Manager dashboard + `ScheduledJobsService` cron alerts |
| Reports exportable | Not yet — Phase 2 |
| Important changes captured in audit log | `AuditService.write()` at every approval/reassignment/RBAC mutation |
| Core field functions survive brief connectivity loss | PWA shell installable; full offline write-queue is Phase 2 |
