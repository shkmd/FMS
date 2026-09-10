-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FarmAreaType" AS ENUM ('PLOT', 'GARDEN_ZONE', 'NURSERY', 'RAIN_SHELTER', 'DAIRY', 'LIVESTOCK', 'STORE', 'PROCESSING_UNIT', 'APIARY', 'OTHER');

-- CreateEnum
CREATE TYPE "FarmAreaStatus" AS ENUM ('ACTIVE', 'FALLOW', 'UNDER_PREPARATION', 'ISSUE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CropCategory" AS ENUM ('RICE', 'VEGETABLE', 'SPICE', 'FRUIT', 'FLORICULTURE', 'HERB', 'OTHER');

-- CreateEnum
CREATE TYPE "VarietyClassification" AS ENUM ('NATIVE', 'EXPERIMENTAL', 'COMMERCIAL');

-- CreateEnum
CREATE TYPE "CropCycleStage" AS ENUM ('PLANNED', 'LAND_PREPARATION', 'SEED_SELECTION', 'SOWING', 'GERMINATION', 'NURSERY', 'TRANSPLANTING', 'VEGETATIVE_GROWTH', 'FLOWERING', 'FRUITING', 'HARVEST_READY', 'HARVESTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EmploymentCategory" AS ENUM ('PERMANENT', 'CONTRACT', 'DAILY_WAGE', 'SEASONAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "AttendanceMethod" AS ENUM ('BIOMETRIC', 'MANUAL', 'PHOTO');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'OVERTIME');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'BLOCKED', 'COMPLETED', 'VERIFIED', 'CANCELLED', 'CARRIED_FORWARD');

-- CreateEnum
CREATE TYPE "RequestUrgency" AS ENUM ('LOW', 'NORMAL', 'URGENT');

-- CreateEnum
CREATE TYPE "LabourRequestStatus" AS ENUM ('PENDING', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReassignmentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReassignmentEffect" AS ENUM ('PAUSED', 'TRANSFERRED', 'COMPLETED_PARTIAL');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('OBSERVATION', 'MINOR', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NurseryStage" AS ENUM ('SEED_TRAY', 'SMALL_GROW_BAG', 'LARGE_GROW_BAG', 'RAIN_SHELTER', 'READY_FOR_FIELD');

-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('SEEDS', 'ORGANIC_INPUTS', 'MANURE', 'CATTLE_FEED', 'POULTRY_FEED', 'PET_FOOD', 'TOOLS', 'SPARE_PARTS', 'PACKAGING', 'KITCHEN_SUPPLIES', 'HARVESTED_PRODUCE', 'VALUE_ADDED_PRODUCTS', 'CLEANING_MATERIALS', 'OTHER_CONSUMABLES');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE_RECEIPT', 'INTERNAL_PRODUCTION', 'ISSUE_TO_TASK', 'TRANSFER', 'RETURN', 'CONSUMPTION', 'DAMAGE', 'SPOILAGE', 'EXPIRY', 'ADJUSTMENT', 'DISPATCH');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('TRACTOR', 'GRASS_CUTTER', 'TROLLEY_CUTTER', 'SPRAYER', 'PUMP', 'PROCESSING_EQUIPMENT', 'REFRIGERATOR', 'COLD_STORAGE', 'DAIRY_EQUIPMENT', 'VEHICLE', 'OTHER');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'IN_USE', 'UNDER_REPAIR', 'AWAITING_PARTS', 'RETIRED');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('INTERNAL', 'CLIENT', 'FRIENDS_FAMILY', 'PROCESSING', 'EXTERNAL_ORG', 'COURIER', 'DEPARTMENT');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'DELIVERED', 'FAILED');

-- CreateEnum
CREATE TYPE "AnimalSpecies" AS ENUM ('COW', 'BUFFALO', 'GOAT', 'POULTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "MilkSession" AS ENUM ('MORNING', 'EVENING');

-- CreateEnum
CREATE TYPE "TrialOutcome" AS ENUM ('CONTINUE', 'MODIFY', 'SCALE', 'COMMERCIALIZE', 'DISCONTINUE');

-- CreateEnum
CREATE TYPE "FinanceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'PUSH', 'EMAIL', 'WHATSAPP');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarMediaId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId","roleId")
);

-- CreateTable
CREATE TABLE "UserAreaAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmAreaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAreaAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "userId" TEXT,
    "farmId" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION,
    "areaUnit" TEXT NOT NULL DEFAULT 'acre',
    "address" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmArea" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "FarmAreaType" NOT NULL,
    "areaSize" DOUBLE PRECISION,
    "areaUnit" TEXT NOT NULL DEFAULT 'acre',
    "boundary" JSONB,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "soilType" TEXT,
    "irrigationMethod" TEXT,
    "currentCropId" TEXT,
    "supervisorId" TEXT,
    "status" "FarmAreaStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FarmArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plot" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "farmAreaId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalArea" DOUBLE PRECISION,
    "areaUnit" TEXT NOT NULL DEFAULT 'acre',
    "soilType" TEXT,
    "irrigationMethod" TEXT,
    "supervisorId" TEXT,
    "boundary" JSONB,
    "centerLat" DOUBLE PRECISION,
    "centerLng" DOUBLE PRECISION,
    "status" "FarmAreaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Plot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubPlot" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "areaUnit" TEXT NOT NULL DEFAULT 'acre',
    "boundary" JSONB,
    "status" "FarmAreaStatus" NOT NULL DEFAULT 'ACTIVE',
    "currentCropCycleId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SubPlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CultivationBlock" (
    "id" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "subPlotId" TEXT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION,
    "areaUnit" TEXT NOT NULL DEFAULT 'acre',
    "status" "FarmAreaStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CultivationBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Crop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CropCategory" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropVariety" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classification" "VarietyClassification" NOT NULL,
    "daysToMaturity" INTEGER,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CropVariety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropCalendar" (
    "id" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "varietyId" TEXT,
    "season" TEXT NOT NULL,
    "nurseryPeriodDays" INTEGER,
    "sowingWindowStart" TEXT NOT NULL,
    "sowingWindowEnd" TEXT NOT NULL,
    "transplantingWindowStart" TEXT,
    "transplantingWindowEnd" TEXT,
    "irrigationSchedule" TEXT,
    "manuringSchedule" TEXT,
    "pestControlSchedule" TEXT,
    "expectedGrowthStages" JSONB,
    "expectedHarvestWindowStart" TEXT,
    "expectedHarvestWindowEnd" TEXT,
    "expectedYieldPerUnitArea" DOUBLE PRECISION,
    "requiredLabourNotes" TEXT,
    "requiredInputsNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CropCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropActivity" (
    "id" TEXT NOT NULL,
    "cropCalendarId" TEXT NOT NULL,
    "stageName" TEXT NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "activityName" TEXT NOT NULL,
    "description" TEXT,
    "inputsNeeded" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropCycle" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cultivationBlockId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "varietyId" TEXT,
    "cropCalendarId" TEXT,
    "stage" "CropCycleStage" NOT NULL DEFAULT 'PLANNED',
    "sownDate" TIMESTAMP(3),
    "transplantDate" TIMESTAMP(3),
    "expectedHarvestStart" TIMESTAMP(3),
    "expectedHarvestEnd" TIMESTAMP(3),
    "expectedYield" DOUBLE PRECISION,
    "actualYield" DOUBLE PRECISION,
    "yieldUnit" TEXT DEFAULT 'kg',
    "isOutOfSeason" BOOLEAN NOT NULL DEFAULT false,
    "outOfSeasonApprovedById" TEXT,
    "outOfSeasonReason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CropCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT,
    "employeeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "department" TEXT,
    "employmentCategory" "EmploymentCategory" NOT NULL,
    "joinDate" TIMESTAMP(3),
    "photoMediaId" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "availability" BOOLEAN NOT NULL DEFAULT true,
    "workRestrictions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerSkill" (
    "workerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiency" TEXT,

    CONSTRAINT "WorkerSkill_pkey" PRIMARY KEY ("workerId","skillId")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "method" "AttendanceMethod" NOT NULL DEFAULT 'MANUAL',
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "farmAreaId" TEXT,
    "photoMediaId" TEXT,
    "lateMinutes" INTEGER DEFAULT 0,
    "overtimeMinutes" INTEGER DEFAULT 0,
    "correctionOfId" TEXT,
    "correctionReason" TEXT,
    "correctionApprovedById" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "taskNumber" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "farmAreaId" TEXT NOT NULL,
    "plotId" TEXT,
    "subPlotId" TEXT,
    "cropCycleId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "requestedWorkers" INTEGER NOT NULL DEFAULT 1,
    "requiredSkills" TEXT[],
    "plannedStart" TIMESTAMP(3),
    "plannedEnd" TIMESTAMP(3),
    "expectedOutput" TEXT,
    "requiredInputsNotes" TEXT,
    "assignedSupervisorId" TEXT,
    "safetyNotes" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "requiresEvidence" BOOLEAN NOT NULL DEFAULT false,
    "carriedForwardFromId" TEXT,
    "carriedForwardReason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "dependentTaskId" TEXT NOT NULL,
    "prerequisiteTaskId" TEXT NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskMachinery" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "TaskMachinery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unassignedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "roleOnTask" TEXT,
    "hoursPlanned" DOUBLE PRECISION,
    "hoursActual" DOUBLE PRECISION,
    "notes" TEXT,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskProgress" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "recordedById" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusFrom" "TaskStatus",
    "statusTo" "TaskStatus" NOT NULL,
    "quantityCompleted" DOUBLE PRECISION,
    "unit" TEXT,
    "notes" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,

    CONSTRAINT "TaskProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskEvidence" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "mediaFileId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "caption" TEXT,

    CONSTRAINT "TaskEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabourRequest" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "requestedCount" INTEGER NOT NULL,
    "skillsNeeded" TEXT[],
    "urgency" "RequestUrgency" NOT NULL DEFAULT 'NORMAL',
    "status" "LabourRequestStatus" NOT NULL DEFAULT 'PENDING',
    "fulfilledCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabourRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReassignmentRequest" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "fromTaskId" TEXT NOT NULL,
    "toTaskId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "urgency" "RequestUrgency" NOT NULL DEFAULT 'NORMAL',
    "requestedById" TEXT NOT NULL,
    "approverId" TEXT,
    "status" "ReassignmentStatus" NOT NULL DEFAULT 'PENDING',
    "effectOnOriginalTask" "ReassignmentEffect",
    "replacementWorkerId" TEXT,
    "decidedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReassignmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspection" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "farmAreaId" TEXT NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "inspectionId" TEXT,
    "farmAreaId" TEXT NOT NULL,
    "plotId" TEXT,
    "category" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "assignedToId" TEXT,
    "dueDate" TIMESTAMP(3),
    "recommendedAction" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionEvidence" TEXT,
    "verifiedById" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "escalatedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorrectiveAction" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionById" TEXT NOT NULL,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidenceMediaId" TEXT,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CorrectiveAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedLot" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "classification" "VarietyClassification" NOT NULL,
    "source" TEXT,
    "procurementDate" TIMESTAMP(3),
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "storageLocationId" TEXT,
    "container" TEXT,
    "storageTemperature" DOUBLE PRECISION,
    "storageHumidity" DOUBLE PRECISION,
    "expiryDate" TIMESTAMP(3),
    "initialQualityNotes" TEXT,
    "certificationDetails" TEXT,
    "photoMediaId" TEXT,
    "currentBalance" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "SeedLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeedStorageReading" (
    "id" TEXT NOT NULL,
    "seedLotId" TEXT NOT NULL,
    "readingAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "recordedById" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "SeedStorageReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GerminationTrial" (
    "id" TEXT NOT NULL,
    "seedLotId" TEXT NOT NULL,
    "trialDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seedsTested" INTEGER NOT NULL,
    "seedsGerminated" INTEGER NOT NULL,
    "growingMedium" TEXT,
    "temperature" DOUBLE PRECISION,
    "moistureConditions" TEXT,
    "staffId" TEXT NOT NULL,
    "photoMediaId" TEXT,
    "observations" TEXT,
    "correctiveAction" TEXT,
    "approvedForSowing" BOOLEAN NOT NULL DEFAULT false,
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "quarantined" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GerminationTrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NurseryBatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "seedLotId" TEXT,
    "germinationTrialId" TEXT,
    "cropId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "stage" "NurseryStage" NOT NULL DEFAULT 'SEED_TRAY',
    "quantity" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReadyDate" TIMESTAMP(3),
    "currentLocation" TEXT,
    "movedToCropCycleId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "NurseryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoilTest" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "plotId" TEXT,
    "subPlotId" TEXT,
    "sampleLocation" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nitrogen" DOUBLE PRECISION,
    "phosphorus" DOUBLE PRECISION,
    "potassium" DOUBLE PRECISION,
    "ph" DOUBLE PRECISION,
    "moisture" DOUBLE PRECISION,
    "testMethod" TEXT,
    "testedById" TEXT NOT NULL,
    "observations" TEXT,
    "recommendation" TEXT,
    "correctiveAction" TEXT,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoilTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlantHealthRecord" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropCycleId" TEXT NOT NULL,
    "growthStage" TEXT,
    "symptoms" TEXT,
    "affectedArea" TEXT,
    "severity" "IssueSeverity",
    "suspectedCause" TEXT,
    "photoMediaId" TEXT,
    "recommendedTreatment" TEXT,
    "organicInputBatchId" TEXT,
    "applicationRate" TEXT,
    "followUpResult" TEXT,
    "recordedById" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlantHealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PestTreatment" (
    "id" TEXT NOT NULL,
    "plantHealthRecordId" TEXT,
    "cropCycleId" TEXT,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "method" TEXT,
    "inputBatchId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PestTreatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganicInputRecipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "ingredientsJson" JSONB,
    "standardYield" DOUBLE PRECISION,
    "unit" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganicInputRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganicInputBatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "ingredientsUsedJson" JSONB,
    "preparationDate" TIMESTAMP(3) NOT NULL,
    "preparedById" TEXT NOT NULL,
    "fermentationPeriodDays" INTEGER,
    "availableQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'litre',
    "expiryDate" TIMESTAMP(3),
    "qualityObservations" TEXT,
    "storageLocationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganicInputBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputApplication" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "dilutionRatio" TEXT,
    "method" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedById" TEXT NOT NULL,
    "purpose" TEXT,
    "result" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InputApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockLocation" (
    "id" TEXT NOT NULL,
    "farmAreaId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "capacity" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "unit" TEXT NOT NULL,
    "minStockLevel" DOUBLE PRECISION,
    "trackBatches" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryBatch" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchNumber" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "storageLocationId" TEXT,
    "receivedDate" TIMESTAMP(3),
    "costPerUnit" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "batchId" TEXT,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "movementType" "StockMovementType" NOT NULL,
    "requestedById" TEXT,
    "issuedById" TEXT,
    "receivedById" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relatedTaskId" TEXT,
    "attachmentMediaId" TEXT,
    "reason" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCount" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "countDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "countedById" TEXT NOT NULL,
    "varianceNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockCountLine" (
    "id" TEXT NOT NULL,
    "stockCountId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "systemQty" DOUBLE PRECISION NOT NULL,
    "countedQty" DOUBLE PRECISION NOT NULL,
    "varianceQty" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StockCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "category" TEXT,
    "gstin" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequisition" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "farmAreaId" TEXT,
    "neededBy" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequisitionLine" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PurchaseRequisitionLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "requisitionId" TEXT,
    "vendorId" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "totalAmount" DECIMAL(12,2),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "orderedById" TEXT NOT NULL,
    "expectedDeliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderLine" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "PurchaseOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceipt" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "receivedById" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invoiceRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'received',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptLine" (
    "id" TEXT NOT NULL,
    "goodsReceiptId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantityReceived" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "batchNumber" TEXT,

    CONSTRAINT "GoodsReceiptLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "purchaseDate" TIMESTAMP(3),
    "purchaseCost" DECIMAL(12,2),
    "currentLocationId" TEXT,
    "assignedToId" TEXT,
    "operationalStatus" "AssetStatus" NOT NULL DEFAULT 'AVAILABLE',
    "meterHours" DOUBLE PRECISION DEFAULT 0,
    "serviceIntervalHours" DOUBLE PRECISION,
    "warrantyExpiry" TIMESTAMP(3),
    "documentMediaIds" TEXT[],
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineryUsage" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "taskId" TEXT,
    "operatorId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursUsed" DOUBLE PRECISION NOT NULL,
    "meterStart" DOUBLE PRECISION,
    "meterEnd" DOUBLE PRECISION,
    "fuelUsed" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MachineryUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "issueDescription" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'open',
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRecord" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "maintenanceRequestId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "cost" DECIMAL(12,2),
    "partsUsedJson" JSONB,
    "performedById" TEXT,
    "downtimeHours" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestForecast" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "cropCycleId" TEXT NOT NULL,
    "forecastDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3) NOT NULL,
    "expectedGrade" TEXT,
    "expectedQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HarvestForecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestBatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "cropCycleId" TEXT NOT NULL,
    "cultivationBlockId" TEXT NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grossQuantity" DOUBLE PRECISION NOT NULL,
    "damagedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netQuantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "gradeBreakdownJson" JSONB,
    "labourTaskId" TEXT,
    "photoMediaIds" TEXT[],
    "recordedById" TEXT NOT NULL,
    "storageLocationId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'harvested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HarvestBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HarvestQualityRecord" (
    "id" TEXT NOT NULL,
    "harvestBatchId" TEXT NOT NULL,
    "gradedById" TEXT NOT NULL,
    "gradeDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" TEXT NOT NULL,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HarvestQualityRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipient" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RecipientType" NOT NULL,
    "contactInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "dispatchNumber" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "packingDate" TIMESTAMP(3),
    "dispatchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleOrCourier" TEXT,
    "destination" TEXT,
    "preparedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchItem" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "harvestBatchId" TEXT,
    "productionBatchId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "DispatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofOfDelivery" (
    "id" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "receivedByName" TEXT,
    "signatureMediaId" TEXT,
    "photoMediaId" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofOfDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Animal" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalTag" TEXT NOT NULL,
    "name" TEXT,
    "species" "AnimalSpecies" NOT NULL,
    "breed" TEXT,
    "sex" TEXT,
    "birthDate" TIMESTAMP(3),
    "parentMaleId" TEXT,
    "parentFemaleId" TEXT,
    "healthStatus" TEXT,
    "photoMediaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Animal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimalHealthRecord" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "performedById" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnimalHealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilkCollection" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "session" "MilkSession" NOT NULL,
    "quantityLitres" DOUBLE PRECISION NOT NULL,
    "collectedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MilkCollection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MilkQualityTest" (
    "id" TEXT NOT NULL,
    "milkCollectionId" TEXT NOT NULL,
    "fat" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "lactose" DOUBLE PRECISION,
    "snf" DOUBLE PRECISION,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "testedById" TEXT NOT NULL,
    "abnormality" TEXT,
    "correctiveAction" TEXT,

    CONSTRAINT "MilkQualityTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatch" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawQuantity" DOUBLE PRECISION,
    "finishedQuantity" DOUBLE PRECISION,
    "wasteQuantity" DOUBLE PRECISION,
    "processingDurationMinutes" INTEGER,
    "staffIds" TEXT[],
    "equipmentAssetId" TEXT,
    "qualityResult" TEXT,
    "packingDetails" TEXT,
    "storageLocationId" TEXT,
    "expiryDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatchInput" (
    "id" TEXT NOT NULL,
    "productionBatchId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "harvestBatchId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,

    CONSTRAINT "ProductionBatchInput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionBatchOutput" (
    "id" TEXT NOT NULL,
    "productionBatchId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "storageLocationId" TEXT,

    CONSTRAINT "ProductionBatchOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RAndDTrial" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "trialCode" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "varietyId" TEXT,
    "hypothesis" TEXT,
    "cultivationBlockId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "methodology" TEXT,
    "inputProtocol" TEXT,
    "observationSchedule" TEXT,
    "yieldResult" DOUBLE PRECISION,
    "qualityResult" TEXT,
    "cost" DECIMAL(12,2),
    "outcome" "TrialOutcome",
    "recommendation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RAndDTrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrialObservation" (
    "id" TEXT NOT NULL,
    "trialId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measurementsJson" JSONB,
    "photoMediaIds" TEXT[],
    "observedById" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrialObservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "expenseNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" TEXT NOT NULL,
    "department" TEXT,
    "vendorId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "tax" DECIMAL(12,2),
    "paymentMethod" TEXT,
    "relatedTaskId" TEXT,
    "relatedPurchaseOrderId" TEXT,
    "receiptMediaId" TEXT,
    "submittedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "financeStatus" "FinanceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PettyCashTransaction" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "relatedExpenseId" TEXT,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PettyCashTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaFile" (
    "id" TEXT NOT NULL,
    "farmId" TEXT,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityType" TEXT,
    "entityId" TEXT,
    "caption" TEXT,
    "gpsLat" DOUBLE PRECISION,
    "gpsLng" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3),

    CONSTRAINT "MediaFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "taskId" TEXT,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "mentionsUserIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approverRole" TEXT,
    "approverId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comments" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingRecord" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendeeIds" TEXT[],
    "notes" TEXT,
    "minutesMediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "meetingRecordId" TEXT,
    "description" TEXT NOT NULL,
    "assignedToId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'open',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserAreaAccess_userId_farmAreaId_key" ON "UserAreaAccess"("userId", "farmAreaId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Farm_code_key" ON "Farm"("code");

-- CreateIndex
CREATE UNIQUE INDEX "FarmArea_farmId_code_key" ON "FarmArea"("farmId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Plot_farmId_code_key" ON "Plot"("farmId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SubPlot_plotId_code_key" ON "SubPlot"("plotId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Crop_name_key" ON "Crop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CropVariety_cropId_name_key" ON "CropVariety"("cropId", "name");

-- CreateIndex
CREATE INDEX "CropCycle_cultivationBlockId_idx" ON "CropCycle"("cultivationBlockId");

-- CreateIndex
CREATE INDEX "CropCycle_stage_idx" ON "CropCycle"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_userId_key" ON "Employee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employeeCode_key" ON "Employee"("employeeCode");

-- CreateIndex
CREATE INDEX "Employee_farmId_idx" ON "Employee"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_employeeId_key" ON "Worker"("employeeId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_workerId_date_key" ON "Attendance"("workerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Task_taskNumber_key" ON "Task"("taskNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Task_carriedForwardFromId_key" ON "Task"("carriedForwardFromId");

-- CreateIndex
CREATE INDEX "Task_farmId_date_idx" ON "Task"("farmId", "date");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "Task"("status");

-- CreateIndex
CREATE INDEX "Task_farmAreaId_idx" ON "Task"("farmAreaId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_dependentTaskId_prerequisiteTaskId_key" ON "TaskDependency"("dependentTaskId", "prerequisiteTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskMachinery_taskId_assetId_key" ON "TaskMachinery"("taskId", "assetId");

-- CreateIndex
CREATE INDEX "TaskAssignment_workerId_isActive_idx" ON "TaskAssignment"("workerId", "isActive");

-- CreateIndex
CREATE INDEX "TaskAssignment_taskId_idx" ON "TaskAssignment"("taskId");

-- CreateIndex
CREATE INDEX "TaskProgress_taskId_idx" ON "TaskProgress"("taskId");

-- CreateIndex
CREATE INDEX "TaskEvidence_taskId_idx" ON "TaskEvidence"("taskId");

-- CreateIndex
CREATE INDEX "ReassignmentRequest_status_idx" ON "ReassignmentRequest"("status");

-- CreateIndex
CREATE INDEX "ReassignmentRequest_workerId_idx" ON "ReassignmentRequest"("workerId");

-- CreateIndex
CREATE INDEX "Issue_status_idx" ON "Issue"("status");

-- CreateIndex
CREATE INDEX "Issue_severity_idx" ON "Issue"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "SeedLot_lotNumber_key" ON "SeedLot"("lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "OrganicInputBatch_batchNumber_key" ON "OrganicInputBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_assetCode_key" ON "Asset"("assetCode");

-- CreateIndex
CREATE UNIQUE INDEX "HarvestBatch_batchNumber_key" ON "HarvestBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Dispatch_dispatchNumber_key" ON "Dispatch"("dispatchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ProofOfDelivery_dispatchId_key" ON "ProofOfDelivery"("dispatchId");

-- CreateIndex
CREATE UNIQUE INDEX "Animal_animalTag_key" ON "Animal"("animalTag");

-- CreateIndex
CREATE UNIQUE INDEX "MilkCollection_animalId_date_session_key" ON "MilkCollection"("animalId", "date", "session");

-- CreateIndex
CREATE UNIQUE INDEX "MilkQualityTest_milkCollectionId_key" ON "MilkQualityTest"("milkCollectionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionBatch_batchNumber_key" ON "ProductionBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "RAndDTrial_trialCode_key" ON "RAndDTrial"("trialCode");

-- CreateIndex
CREATE UNIQUE INDEX "Expense_expenseNumber_key" ON "Expense"("expenseNumber");

-- CreateIndex
CREATE INDEX "MediaFile_entityType_entityId_idx" ON "MediaFile"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Comment_entityType_entityId_idx" ON "Comment"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Approval_entityType_entityId_idx" ON "Approval"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreaAccess" ADD CONSTRAINT "UserAreaAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreaAccess" ADD CONSTRAINT "UserAreaAccess_farmAreaId_fkey" FOREIGN KEY ("farmAreaId") REFERENCES "FarmArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmArea" ADD CONSTRAINT "FarmArea_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Plot" ADD CONSTRAINT "Plot_farmAreaId_fkey" FOREIGN KEY ("farmAreaId") REFERENCES "FarmArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubPlot" ADD CONSTRAINT "SubPlot_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultivationBlock" ADD CONSTRAINT "CultivationBlock_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CultivationBlock" ADD CONSTRAINT "CultivationBlock_subPlotId_fkey" FOREIGN KEY ("subPlotId") REFERENCES "SubPlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropVariety" ADD CONSTRAINT "CropVariety_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCalendar" ADD CONSTRAINT "CropCalendar_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCalendar" ADD CONSTRAINT "CropCalendar_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "CropVariety"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropActivity" ADD CONSTRAINT "CropActivity_cropCalendarId_fkey" FOREIGN KEY ("cropCalendarId") REFERENCES "CropCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCycle" ADD CONSTRAINT "CropCycle_cultivationBlockId_fkey" FOREIGN KEY ("cultivationBlockId") REFERENCES "CultivationBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCycle" ADD CONSTRAINT "CropCycle_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCycle" ADD CONSTRAINT "CropCycle_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "CropVariety"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCycle" ADD CONSTRAINT "CropCycle_cropCalendarId_fkey" FOREIGN KEY ("cropCalendarId") REFERENCES "CropCalendar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSkill" ADD CONSTRAINT "WorkerSkill_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSkill" ADD CONSTRAINT "WorkerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_cropCycleId_fkey" FOREIGN KEY ("cropCycleId") REFERENCES "CropCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependentTaskId_fkey" FOREIGN KEY ("dependentTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_prerequisiteTaskId_fkey" FOREIGN KEY ("prerequisiteTaskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMachinery" ADD CONSTRAINT "TaskMachinery_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMachinery" ADD CONSTRAINT "TaskMachinery_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskProgress" ADD CONSTRAINT "TaskProgress_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskEvidence" ADD CONSTRAINT "TaskEvidence_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabourRequest" ADD CONSTRAINT "LabourRequest_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReassignmentRequest" ADD CONSTRAINT "ReassignmentRequest_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReassignmentRequest" ADD CONSTRAINT "ReassignmentRequest_fromTaskId_fkey" FOREIGN KEY ("fromTaskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReassignmentRequest" ADD CONSTRAINT "ReassignmentRequest_toTaskId_fkey" FOREIGN KEY ("toTaskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorrectiveAction" ADD CONSTRAINT "CorrectiveAction_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedLot" ADD CONSTRAINT "SeedLot_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "CropVariety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeedStorageReading" ADD CONSTRAINT "SeedStorageReading_seedLotId_fkey" FOREIGN KEY ("seedLotId") REFERENCES "SeedLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GerminationTrial" ADD CONSTRAINT "GerminationTrial_seedLotId_fkey" FOREIGN KEY ("seedLotId") REFERENCES "SeedLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseryBatch" ADD CONSTRAINT "NurseryBatch_seedLotId_fkey" FOREIGN KEY ("seedLotId") REFERENCES "SeedLot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseryBatch" ADD CONSTRAINT "NurseryBatch_germinationTrialId_fkey" FOREIGN KEY ("germinationTrialId") REFERENCES "GerminationTrial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NurseryBatch" ADD CONSTRAINT "NurseryBatch_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "CropVariety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoilTest" ADD CONSTRAINT "SoilTest_plotId_fkey" FOREIGN KEY ("plotId") REFERENCES "Plot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlantHealthRecord" ADD CONSTRAINT "PlantHealthRecord_cropCycleId_fkey" FOREIGN KEY ("cropCycleId") REFERENCES "CropCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PestTreatment" ADD CONSTRAINT "PestTreatment_plantHealthRecordId_fkey" FOREIGN KEY ("plantHealthRecordId") REFERENCES "PlantHealthRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PestTreatment" ADD CONSTRAINT "PestTreatment_cropCycleId_fkey" FOREIGN KEY ("cropCycleId") REFERENCES "CropCycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganicInputBatch" ADD CONSTRAINT "OrganicInputBatch_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "OrganicInputRecipe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputApplication" ADD CONSTRAINT "InputApplication_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "OrganicInputBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLocation" ADD CONSTRAINT "StockLocation_farmAreaId_fkey" FOREIGN KEY ("farmAreaId") REFERENCES "FarmArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "InventoryBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockCountLine" ADD CONSTRAINT "StockCountLine_stockCountId_fkey" FOREIGN KEY ("stockCountId") REFERENCES "StockCount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisitionLine" ADD CONSTRAINT "PurchaseRequisitionLine_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "PurchaseRequisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "PurchaseRequisition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderLine" ADD CONSTRAINT "PurchaseOrderLine_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptLine" ADD CONSTRAINT "GoodsReceiptLine_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryUsage" ADD CONSTRAINT "MachineryUsage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRecord" ADD CONSTRAINT "MaintenanceRecord_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestForecast" ADD CONSTRAINT "HarvestForecast_cropCycleId_fkey" FOREIGN KEY ("cropCycleId") REFERENCES "CropCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestBatch" ADD CONSTRAINT "HarvestBatch_cropCycleId_fkey" FOREIGN KEY ("cropCycleId") REFERENCES "CropCycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestBatch" ADD CONSTRAINT "HarvestBatch_cultivationBlockId_fkey" FOREIGN KEY ("cultivationBlockId") REFERENCES "CultivationBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HarvestQualityRecord" ADD CONSTRAINT "HarvestQualityRecord_harvestBatchId_fkey" FOREIGN KEY ("harvestBatchId") REFERENCES "HarvestBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchItem" ADD CONSTRAINT "DispatchItem_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "Dispatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchItem" ADD CONSTRAINT "DispatchItem_harvestBatchId_fkey" FOREIGN KEY ("harvestBatchId") REFERENCES "HarvestBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofOfDelivery" ADD CONSTRAINT "ProofOfDelivery_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "Dispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimalHealthRecord" ADD CONSTRAINT "AnimalHealthRecord_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilkCollection" ADD CONSTRAINT "MilkCollection_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "Animal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilkQualityTest" ADD CONSTRAINT "MilkQualityTest_milkCollectionId_fkey" FOREIGN KEY ("milkCollectionId") REFERENCES "MilkCollection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatchInput" ADD CONSTRAINT "ProductionBatchInput_productionBatchId_fkey" FOREIGN KEY ("productionBatchId") REFERENCES "ProductionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatchInput" ADD CONSTRAINT "ProductionBatchInput_harvestBatchId_fkey" FOREIGN KEY ("harvestBatchId") REFERENCES "HarvestBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionBatchOutput" ADD CONSTRAINT "ProductionBatchOutput_productionBatchId_fkey" FOREIGN KEY ("productionBatchId") REFERENCES "ProductionBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAndDTrial" ADD CONSTRAINT "RAndDTrial_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "Crop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAndDTrial" ADD CONSTRAINT "RAndDTrial_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "CropVariety"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RAndDTrial" ADD CONSTRAINT "RAndDTrial_cultivationBlockId_fkey" FOREIGN KEY ("cultivationBlockId") REFERENCES "CultivationBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrialObservation" ADD CONSTRAINT "TrialObservation_trialId_fkey" FOREIGN KEY ("trialId") REFERENCES "RAndDTrial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PettyCashTransaction" ADD CONSTRAINT "PettyCashTransaction_relatedExpenseId_fkey" FOREIGN KEY ("relatedExpenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_meetingRecordId_fkey" FOREIGN KEY ("meetingRecordId") REFERENCES "MeetingRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;
