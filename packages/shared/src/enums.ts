// Mirrors the Prisma enums relevant to Milestone 1. Kept as plain TS so the web app never needs to
// depend on @prisma/client. If you change one of these, change the matching enum in
// apps/api/prisma/schema.prisma in the same commit.

export const TaskPriority = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type TaskPriority = (typeof TaskPriority)[number];

export const TaskStatus = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "ASSIGNED",
  "IN_PROGRESS",
  "PAUSED",
  "BLOCKED",
  "COMPLETED",
  "VERIFIED",
  "CANCELLED",
  "CARRIED_FORWARD",
] as const;
export type TaskStatus = (typeof TaskStatus)[number];

export const RequestUrgency = ["LOW", "NORMAL", "URGENT"] as const;
export type RequestUrgency = (typeof RequestUrgency)[number];

export const ReassignmentStatus = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"] as const;
export type ReassignmentStatus = (typeof ReassignmentStatus)[number];

export const ReassignmentEffect = ["PAUSED", "TRANSFERRED", "COMPLETED_PARTIAL"] as const;
export type ReassignmentEffect = (typeof ReassignmentEffect)[number];

export const LabourRequestStatus = ["PENDING", "PARTIALLY_FULFILLED", "FULFILLED", "CANCELLED"] as const;
export type LabourRequestStatus = (typeof LabourRequestStatus)[number];

export const AttendanceStatus = ["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "OVERTIME"] as const;
export type AttendanceStatus = (typeof AttendanceStatus)[number];

export const AttendanceMethod = ["BIOMETRIC", "MANUAL", "PHOTO"] as const;
export type AttendanceMethod = (typeof AttendanceMethod)[number];

export const FarmAreaType = [
  "PLOT",
  "GARDEN_ZONE",
  "NURSERY",
  "RAIN_SHELTER",
  "DAIRY",
  "LIVESTOCK",
  "STORE",
  "PROCESSING_UNIT",
  "APIARY",
  "OTHER",
] as const;
export type FarmAreaType = (typeof FarmAreaType)[number];

export const FarmAreaStatus = ["ACTIVE", "FALLOW", "UNDER_PREPARATION", "ISSUE", "INACTIVE"] as const;
export type FarmAreaStatus = (typeof FarmAreaStatus)[number];

export const CropCycleStage = [
  "PLANNED",
  "LAND_PREPARATION",
  "SEED_SELECTION",
  "SOWING",
  "GERMINATION",
  "NURSERY",
  "TRANSPLANTING",
  "VEGETATIVE_GROWTH",
  "FLOWERING",
  "FRUITING",
  "HARVEST_READY",
  "HARVESTED",
  "CLOSED",
] as const;
export type CropCycleStage = (typeof CropCycleStage)[number];

export const IssueSeverity = ["OBSERVATION", "MINOR", "MAJOR", "CRITICAL"] as const;
export type IssueSeverity = (typeof IssueSeverity)[number];

export const IssueStatus = ["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED", "CLOSED"] as const;
export type IssueStatus = (typeof IssueStatus)[number];

export const EmploymentCategory = ["PERMANENT", "CONTRACT", "DAILY_WAGE", "SEASONAL", "EXTERNAL"] as const;
export type EmploymentCategory = (typeof EmploymentCategory)[number];

export const UserStatus = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof UserStatus)[number];

export const AssetType = [
  "TRACTOR",
  "GRASS_CUTTER",
  "TROLLEY_CUTTER",
  "SPRAYER",
  "PUMP",
  "PROCESSING_EQUIPMENT",
  "REFRIGERATOR",
  "COLD_STORAGE",
  "DAIRY_EQUIPMENT",
  "VEHICLE",
  "OTHER",
] as const;
export type AssetType = (typeof AssetType)[number];

export const AssetStatus = ["AVAILABLE", "ASSIGNED", "IN_USE", "UNDER_REPAIR", "AWAITING_PARTS", "RETIRED"] as const;
export type AssetStatus = (typeof AssetStatus)[number];

export const InventoryCategory = [
  "SEEDS",
  "ORGANIC_INPUTS",
  "MANURE",
  "CATTLE_FEED",
  "POULTRY_FEED",
  "PET_FOOD",
  "TOOLS",
  "SPARE_PARTS",
  "PACKAGING",
  "KITCHEN_SUPPLIES",
  "HARVESTED_PRODUCE",
  "VALUE_ADDED_PRODUCTS",
  "CLEANING_MATERIALS",
  "OTHER_CONSUMABLES",
] as const;
export type InventoryCategory = (typeof InventoryCategory)[number];

export const StockMovementType = [
  "PURCHASE_RECEIPT",
  "INTERNAL_PRODUCTION",
  "ISSUE_TO_TASK",
  "TRANSFER",
  "RETURN",
  "CONSUMPTION",
  "DAMAGE",
  "SPOILAGE",
  "EXPIRY",
  "ADJUSTMENT",
  "DISPATCH",
] as const;
export type StockMovementType = (typeof StockMovementType)[number];

export const VarietyClassification = ["NATIVE", "EXPERIMENTAL", "COMMERCIAL"] as const;
export type VarietyClassification = (typeof VarietyClassification)[number];

export const NurseryStage = ["SEED_TRAY", "SMALL_GROW_BAG", "LARGE_GROW_BAG", "RAIN_SHELTER", "READY_FOR_FIELD"] as const;
export type NurseryStage = (typeof NurseryStage)[number];

export const AnimalSpecies = ["COW", "BUFFALO", "GOAT", "POULTRY", "OTHER"] as const;
export type AnimalSpecies = (typeof AnimalSpecies)[number];

export const MilkSession = ["MORNING", "EVENING"] as const;
export type MilkSession = (typeof MilkSession)[number];

export const RecipientType = [
  "INTERNAL",
  "CLIENT",
  "FRIENDS_FAMILY",
  "PROCESSING",
  "EXTERNAL_ORG",
  "COURIER",
  "DEPARTMENT",
] as const;
export type RecipientType = (typeof RecipientType)[number];

export const DeliveryStatus = ["PENDING", "IN_TRANSIT", "DELIVERED", "FAILED"] as const;
export type DeliveryStatus = (typeof DeliveryStatus)[number];

export const TrialOutcome = ["CONTINUE", "MODIFY", "SCALE", "COMMERCIALIZE", "DISCONTINUE"] as const;
export type TrialOutcome = (typeof TrialOutcome)[number];

export const FinanceStatus = ["PENDING", "APPROVED", "REJECTED", "REIMBURSED"] as const;
export type FinanceStatus = (typeof FinanceStatus)[number];

export const RequisitionStatus = ["OPEN", "IN_PROGRESS", "ON_HOLD", "CLOSED", "CANCELLED"] as const;
export type RequisitionStatus = (typeof RequisitionStatus)[number];

export const ApplicationStage = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"] as const;
export type ApplicationStage = (typeof ApplicationStage)[number];

export const TrainingSessionStatus = ["SCHEDULED", "COMPLETED", "CANCELLED"] as const;
export type TrainingSessionStatus = (typeof TrainingSessionStatus)[number];

export const EnrollmentStatus = ["ENROLLED", "COMPLETED", "NO_SHOW", "CANCELLED"] as const;
export type EnrollmentStatus = (typeof EnrollmentStatus)[number];

export const ChecklistTaskStatus = ["PENDING", "IN_PROGRESS", "DONE"] as const;
export type ChecklistTaskStatus = (typeof ChecklistTaskStatus)[number];

export const OffboardingReason = ["RESIGNATION", "TERMINATION", "CONTRACT_END", "RETIREMENT", "OTHER"] as const;
export type OffboardingReason = (typeof OffboardingReason)[number];

export const HrCaseStatus = ["IN_PROGRESS", "COMPLETED"] as const;
export type HrCaseStatus = (typeof HrCaseStatus)[number];

/** The 13 demo/system roles from spec §4. */
export const RoleCode = [
  "SUPER_ADMIN",
  "TOP_MANAGEMENT",
  "FARM_MANAGER",
  "CHIEF_COORDINATOR",
  "FARM_OFFICER",
  "SENIOR_RESEARCH_OFFICER",
  "PLOT_SUPERVISOR",
  "GARDEN_SUPERVISOR",
  "FIELD_INSPECTOR",
  "DISTRIBUTION_INCHARGE",
  "DAIRY_RND_ASSISTANT",
  "WORKER",
  "AUDITOR",
] as const;
export type RoleCode = (typeof RoleCode)[number];
