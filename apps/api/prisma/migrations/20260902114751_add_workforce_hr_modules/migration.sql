-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStage" AS ENUM ('APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TrainingSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'COMPLETED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChecklistTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "OffboardingReason" AS ENUM ('RESIGNATION', 'TERMINATION', 'CONTRACT_END', 'RETIREMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "HrCaseStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "department",
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "designationId" TEXT;

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentId" TEXT,
    "grade" TEXT,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequisition" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "departmentId" TEXT,
    "designationId" TEXT,
    "openings" INTEGER NOT NULL DEFAULT 1,
    "status" "RequisitionStatus" NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "targetJoinDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JobRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "requisitionId" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'APPLIED',
    "notes" TEXT,
    "appliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hiredEmployeeId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingProgram" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TrainingProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "trainer" TEXT,
    "location" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" "TrainingSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingEnrollment" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingCase" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "status" "HrCaseStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedToId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "ChecklistTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffboardingCase" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reason" "OffboardingReason" NOT NULL,
    "lastWorkingDay" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "HrCaseStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffboardingCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffboardingTask" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedToId" TEXT,
    "dueDate" TIMESTAMP(3),
    "status" "ChecklistTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "OffboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_farmId_idx" ON "Department"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_code_key" ON "Designation"("code");

-- CreateIndex
CREATE INDEX "Designation_farmId_idx" ON "Designation"("farmId");

-- CreateIndex
CREATE INDEX "Designation_departmentId_idx" ON "Designation"("departmentId");

-- CreateIndex
CREATE INDEX "JobRequisition_farmId_idx" ON "JobRequisition"("farmId");

-- CreateIndex
CREATE INDEX "JobRequisition_status_idx" ON "JobRequisition"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_hiredEmployeeId_key" ON "JobApplication"("hiredEmployeeId");

-- CreateIndex
CREATE INDEX "JobApplication_requisitionId_idx" ON "JobApplication"("requisitionId");

-- CreateIndex
CREATE INDEX "JobApplication_stage_idx" ON "JobApplication"("stage");

-- CreateIndex
CREATE INDEX "TrainingProgram_farmId_idx" ON "TrainingProgram"("farmId");

-- CreateIndex
CREATE INDEX "TrainingSession_programId_idx" ON "TrainingSession"("programId");

-- CreateIndex
CREATE INDEX "TrainingEnrollment_employeeId_idx" ON "TrainingEnrollment"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingEnrollment_sessionId_employeeId_key" ON "TrainingEnrollment"("sessionId", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingCase_employeeId_key" ON "OnboardingCase"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingCase_employeeId_idx" ON "OnboardingCase"("employeeId");

-- CreateIndex
CREATE INDEX "OnboardingTask_caseId_idx" ON "OnboardingTask"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "OffboardingCase_employeeId_key" ON "OffboardingCase"("employeeId");

-- CreateIndex
CREATE INDEX "OffboardingCase_employeeId_idx" ON "OffboardingCase"("employeeId");

-- CreateIndex
CREATE INDEX "OffboardingTask_caseId_idx" ON "OffboardingTask"("caseId");

-- CreateIndex
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

-- CreateIndex
CREATE INDEX "Employee_designationId_idx" ON "Employee"("designationId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequisition" ADD CONSTRAINT "JobRequisition_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequisition" ADD CONSTRAINT "JobRequisition_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "JobRequisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_hiredEmployeeId_fkey" FOREIGN KEY ("hiredEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_programId_fkey" FOREIGN KEY ("programId") REFERENCES "TrainingProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEnrollment" ADD CONSTRAINT "TrainingEnrollment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingCase" ADD CONSTRAINT "OnboardingCase_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OnboardingCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingCase" ADD CONSTRAINT "OffboardingCase_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingTask" ADD CONSTRAINT "OffboardingTask_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "OffboardingCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

