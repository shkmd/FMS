import type { RoleCode } from "./enums";

/**
 * Permission codes, `module:action`. Fine-grained for the Milestone 1 modules (actually enforced by
 * NestJS guards); coarse `module:manage` / `module:view` for modules that exist in the schema but don't
 * have a wired API yet — kept here so the role/permission matrix is complete from day one and later
 * modules only need to add finer-grained codes, not invent the coarse ones from scratch.
 */
export const PERMISSIONS = {
  // Platform / RBAC
  PLATFORM_MANAGE: "platform:manage",
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",
  AUDIT_VIEW: "audit:view",

  // Farm structure
  FARM_MANAGE: "farm:manage",
  FARM_VIEW: "farm:view",

  // Workforce
  EMPLOYEE_MANAGE: "employee:manage",
  EMPLOYEE_VIEW: "employee:view",

  // Daily planning & tasks
  TASK_CREATE: "task:create",
  TASK_SUBMIT: "task:submit",
  TASK_APPROVE: "task:approve",
  TASK_APPROVE_CRITICAL: "task:approve_critical",
  TASK_ASSIGN: "task:assign",
  TASK_UPDATE_PROGRESS: "task:update_progress",
  TASK_COMPLETE: "task:complete",
  TASK_VERIFY: "task:verify",
  TASK_CANCEL: "task:cancel",
  TASK_VIEW: "task:view",
  TASK_VIEW_OWN: "task:view_own",

  // Labour & reassignment
  LABOUR_ALLOCATE: "labour:allocate",
  LABOUR_REQUEST: "labour:request",
  REASSIGNMENT_REQUEST: "reassignment:request",
  REASSIGNMENT_APPROVE: "reassignment:approve",

  // Attendance
  ATTENDANCE_MARK_OWN: "attendance:mark_own",
  ATTENDANCE_MARK_OTHERS: "attendance:mark_others",
  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_CORRECT: "attendance:correct",
  ATTENDANCE_APPROVE_CORRECTION: "attendance:approve_correction",

  // Media
  MEDIA_UPLOAD: "media:upload",

  // Dashboards
  DASHBOARD_MANAGEMENT: "dashboard:management",
  DASHBOARD_FARM_MANAGER: "dashboard:farm_manager",
  DASHBOARD_SUPERVISOR: "dashboard:supervisor",
  DASHBOARD_STORES: "dashboard:stores",

  // Reports
  REPORT_VIEW: "report:view",

  // Inspections / issues (schema-ready, coarse until Phase 2)
  INSPECTION_CREATE: "inspection:create",
  ISSUE_CREATE: "issue:create",
  ISSUE_RESOLVE_MINOR: "issue:resolve_minor",
  ISSUE_ESCALATE: "issue:escalate",
  ISSUE_VERIFY: "issue:verify",

  // Coarse, Phase 2/3 modules — seeded now so the matrix is complete
  CROP_CALENDAR_MANAGE: "crop_calendar:manage",
  NURSERY_SEEDS_MANAGE: "nursery_seeds:manage",
  SOIL_PLANT_HEALTH_MANAGE: "soil_plant_health:manage",
  ORGANIC_INPUTS_MANAGE: "organic_inputs:manage",
  INVENTORY_MANAGE: "inventory:manage",
  INVENTORY_VIEW: "inventory:view",
  PROCUREMENT_MANAGE: "procurement:manage",
  PROCUREMENT_APPROVE: "procurement:approve",
  MACHINERY_MANAGE: "machinery:manage",
  MACHINERY_VIEW: "machinery:view",
  HARVEST_MANAGE: "harvest:manage",
  DISTRIBUTION_MANAGE: "distribution:manage",
  DAIRY_MANAGE: "dairy:manage",
  PROCESSING_MANAGE: "processing:manage",
  RND_MANAGE: "rnd:manage",
  EXPENSES_MANAGE: "expenses:manage",
  EXPENSES_APPROVE: "expenses:approve",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const P = PERMISSIONS;

/** Seeded verbatim into role_permissions — this *is* the role–permission matrix, not just a doc. */
export const ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  SUPER_ADMIN: [P.PLATFORM_MANAGE], // platform:manage short-circuits every guard check

  TOP_MANAGEMENT: [
    P.FARM_VIEW,
    P.EMPLOYEE_VIEW,
    P.TASK_VIEW,
    P.ATTENDANCE_VIEW,
    P.DASHBOARD_MANAGEMENT,
    P.REPORT_VIEW,
    P.AUDIT_VIEW,
    P.PROCUREMENT_APPROVE,
    P.EXPENSES_APPROVE,
    P.INVENTORY_VIEW,
    P.MACHINERY_VIEW,
  ],

  FARM_MANAGER: [
    P.FARM_MANAGE,
    P.FARM_VIEW,
    P.EMPLOYEE_VIEW,
    P.TASK_CREATE,
    P.TASK_SUBMIT,
    P.TASK_APPROVE,
    P.TASK_APPROVE_CRITICAL,
    P.TASK_ASSIGN,
    P.TASK_UPDATE_PROGRESS,
    P.TASK_COMPLETE,
    P.TASK_VERIFY,
    P.TASK_CANCEL,
    P.TASK_VIEW,
    P.LABOUR_ALLOCATE,
    P.LABOUR_REQUEST,
    P.REASSIGNMENT_APPROVE,
    P.ATTENDANCE_VIEW,
    P.ATTENDANCE_APPROVE_CORRECTION,
    P.DASHBOARD_FARM_MANAGER,
    P.DASHBOARD_MANAGEMENT,
    P.REPORT_VIEW,
    P.AUDIT_VIEW,
    P.ISSUE_ESCALATE,
    P.ISSUE_VERIFY,
    P.MEDIA_UPLOAD,
    P.MACHINERY_MANAGE,
    P.MACHINERY_VIEW,
    P.INVENTORY_VIEW,
    P.PROCUREMENT_APPROVE,
    P.EXPENSES_APPROVE,
  ],

  CHIEF_COORDINATOR: [
    P.FARM_VIEW,
    P.EMPLOYEE_VIEW,
    P.TASK_CREATE,
    P.TASK_SUBMIT,
    P.TASK_ASSIGN,
    P.TASK_UPDATE_PROGRESS,
    P.TASK_VIEW,
    P.LABOUR_ALLOCATE,
    P.LABOUR_REQUEST,
    P.REASSIGNMENT_REQUEST,
    P.ATTENDANCE_VIEW,
    P.DASHBOARD_SUPERVISOR,
    P.MACHINERY_VIEW,
    P.MEDIA_UPLOAD,
  ],

  FARM_OFFICER: [
    P.FARM_VIEW,
    P.EMPLOYEE_MANAGE,
    P.ATTENDANCE_MARK_OTHERS,
    P.ATTENDANCE_VIEW,
    P.ATTENDANCE_CORRECT,
    P.TASK_VIEW,
    P.PROCUREMENT_MANAGE,
    P.INVENTORY_MANAGE,
    P.EXPENSES_MANAGE,
    P.REPORT_VIEW,
    P.MEDIA_UPLOAD,
    P.MACHINERY_MANAGE,
    P.MACHINERY_VIEW,
  ],

  SENIOR_RESEARCH_OFFICER: [
    P.FARM_VIEW,
    P.TASK_CREATE,
    P.TASK_VIEW,
    P.CROP_CALENDAR_MANAGE,
    P.NURSERY_SEEDS_MANAGE,
    P.SOIL_PLANT_HEALTH_MANAGE,
    P.ORGANIC_INPUTS_MANAGE,
    P.RND_MANAGE,
    P.REPORT_VIEW,
    P.MEDIA_UPLOAD,
  ],

  PLOT_SUPERVISOR: [
    P.FARM_VIEW,
    P.TASK_CREATE,
    P.TASK_SUBMIT,
    P.TASK_ASSIGN,
    P.TASK_UPDATE_PROGRESS,
    P.TASK_COMPLETE,
    P.TASK_VIEW,
    P.LABOUR_REQUEST,
    P.REASSIGNMENT_REQUEST,
    P.ATTENDANCE_MARK_OTHERS,
    P.ATTENDANCE_VIEW,
    P.DASHBOARD_SUPERVISOR,
    P.HARVEST_MANAGE,
    P.MACHINERY_VIEW,
    P.MEDIA_UPLOAD,
  ],

  GARDEN_SUPERVISOR: [
    P.FARM_VIEW,
    P.TASK_CREATE,
    P.TASK_SUBMIT,
    P.TASK_ASSIGN,
    P.TASK_UPDATE_PROGRESS,
    P.TASK_COMPLETE,
    P.TASK_VIEW,
    P.LABOUR_REQUEST,
    P.ATTENDANCE_MARK_OTHERS,
    P.ATTENDANCE_VIEW,
    P.DASHBOARD_SUPERVISOR,
    P.MACHINERY_VIEW,
    P.MEDIA_UPLOAD,
  ],

  FIELD_INSPECTOR: [
    P.FARM_VIEW,
    P.TASK_VIEW,
    P.INSPECTION_CREATE,
    P.ISSUE_CREATE,
    P.ISSUE_RESOLVE_MINOR,
    P.ISSUE_ESCALATE,
    P.MEDIA_UPLOAD,
  ],

  DISTRIBUTION_INCHARGE: [
    P.FARM_VIEW,
    P.TASK_VIEW,
    P.HARVEST_MANAGE,
    P.DISTRIBUTION_MANAGE,
    P.INVENTORY_VIEW,
    P.MEDIA_UPLOAD,
  ],

  DAIRY_RND_ASSISTANT: [
    P.FARM_VIEW,
    P.TASK_VIEW,
    P.DAIRY_MANAGE,
    P.PROCESSING_MANAGE,
    P.MEDIA_UPLOAD,
  ],

  WORKER: [
    P.TASK_VIEW_OWN,
    P.TASK_UPDATE_PROGRESS,
    P.ATTENDANCE_MARK_OWN,
    P.MEDIA_UPLOAD,
  ],

  AUDITOR: [P.FARM_VIEW, P.TASK_VIEW, P.AUDIT_VIEW, P.REPORT_VIEW, P.INVENTORY_VIEW],
};
