# Page Map

Navigation source: `apps/web/src/lib/nav-config.ts` (the `built` flag on each entry drives whether the
route renders the real screen or a `<ComingSoon>` placeholder — nothing 404s).

| Nav item | Route | Status | Notes |
|---|---|---|---|
| Dashboard | `/dashboard` | ✅ Built | Renders Management / Farm Manager / Supervisor / Worker view based on the caller's role |
| Daily Plan | `/daily-plan` | ✅ Built | Daily Planning Board — submit → approve → publish workflow |
| Tasks | `/tasks` | ✅ Built | Full task list/detail, all statuses, filters |
| Labour Allocation | `/labour-allocation` | ✅ Built | Labour Allocation Board |
| Reassignments | `/reassignments` | ✅ Built | Reassignment request + approval screen |
| Workforce | `/workforce` | ✅ Built | Employee/worker directory, skills |
| Attendance | `/attendance` | ✅ Built | Attendance register, correction approval |
| Farm Map | `/farm-map` | ✅ Built | Leaflet, colour-coded by `FarmAreaStatus` |
| Cultivation | `/cultivation` | ✅ Built | Plots, sub-plots, cultivation blocks, crop cycles (lightweight) |
| Crop Calendar | `/crop-calendar` | ⏳ Phase 2 | Schema ready (`CropCalendar`, `CropActivity`) |
| Nursery and Seeds | `/nursery-seeds` | ⏳ Phase 2 | Schema ready (`SeedLot`, `GerminationTrial`, `NurseryBatch`) |
| Soil and Plant Health | `/soil-plant-health` | ⏳ Phase 2 | Schema ready |
| Organic Inputs | `/organic-inputs` | ⏳ Phase 2 | Schema ready |
| Harvest | `/harvest` | ⏳ Phase 2 | Schema ready |
| Inventory | `/inventory` | ⏳ Phase 2 | Schema ready |
| Procurement | `/procurement` | ⏳ Phase 2 | Schema ready |
| Machinery | `/machinery` | ⏳ Phase 2 | Schema ready |
| Livestock | `/livestock` | ⏳ Phase 2 | Schema ready (`Animal`, `AnimalHealthRecord`) |
| Dairy | `/dairy` | ⏳ Phase 2 | Schema ready (`MilkCollection`, `MilkQualityTest`) |
| Processing | `/processing` | ⏳ Phase 2 | Schema ready (`ProductionBatch`) |
| Distribution | `/distribution` | ⏳ Phase 2 | Schema ready (`Dispatch`, `ProofOfDelivery`) |
| Inspections | `/inspections` | ⏳ Phase 2 | Schema ready (`Issue`, `CorrectiveAction`) |
| R&D | `/rnd` | ⏳ Phase 3 | Schema ready (`RAndDTrial`) |
| Expenses | `/expenses` | ⏳ Phase 2 | Schema ready (`Expense`, `PettyCashTransaction`) |
| Reports | `/reports` | ⏳ Phase 2 | Export/report generation not yet built |
| Administration | `/admin` | ✅ Built | User & role management, Audit log |

## Screens not in the top-level nav (spec §15)

| Screen | Where it lives | Status |
|---|---|---|
| Login / password reset | `/login` | ✅ Built (reset request/confirm wired to `/api/auth/*`, email delivery not yet connected) |
| Worker daily-task screen | `/tasks` (worker-scoped view) + `/dashboard` for Worker role | ✅ Built |
| Plot and sub-plot details | `/cultivation/[plotId]` | ✅ Built |
| Reassignment approval | `/reassignments` | ✅ Built |
| Machinery usage entry | `/machinery` | ⏳ Phase 2 |
| Harvest forecast / counting & grading | `/harvest` | ⏳ Phase 2 |
| Dairy quality entry | `/dairy` | ⏳ Phase 2 |
| Petty cash | `/expenses` | ⏳ Phase 2 |
| System settings | `/admin` | ⏳ Phase 2 (only user/role admin is built today) |
