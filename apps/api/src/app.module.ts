import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuditModule } from "./common/audit/audit.module";
import { NotificationsModule } from "./common/notifications/notifications.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { FarmStructureModule } from "./modules/farm-structure/farm-structure.module";
import { WorkforceModule } from "./modules/workforce/workforce.module";
import { DepartmentsModule } from "./modules/departments/departments.module";
import { DesignationsModule } from "./modules/designations/designations.module";
import { RecruitmentModule } from "./modules/recruitment/recruitment.module";
import { LearningModule } from "./modules/learning/learning.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { OffboardingModule } from "./modules/offboarding/offboarding.module";
import { AttendanceModule } from "./modules/attendance/attendance.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { LabourModule } from "./modules/labour/labour.module";
import { CropsModule } from "./modules/crops/crops.module";
import { MachineryModule } from "./modules/machinery/machinery.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { ProcurementModule } from "./modules/procurement/procurement.module";
import { NurseryModule } from "./modules/nursery/nursery.module";
import { PlantHealthModule } from "./modules/plant-health/plant-health.module";
import { OrganicInputsModule } from "./modules/organic-inputs/organic-inputs.module";
import { HarvestModule } from "./modules/harvest/harvest.module";
import { DistributionModule } from "./modules/distribution/distribution.module";
import { DairyModule } from "./modules/dairy/dairy.module";
import { ProcessingModule } from "./modules/processing/processing.module";
import { InspectionsModule } from "./modules/inspections/inspections.module";
import { RndModule } from "./modules/rnd/rnd.module";
import { ExpensesModule } from "./modules/expenses/expenses.module";
import { CropCalendarModule } from "./modules/crop-calendar/crop-calendar.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { MediaModule } from "./modules/media/media.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { AuditReadModule } from "./modules/audit/audit.module";
import { HealthModule } from "./modules/health/health.module";
import { JobsModule } from "./jobs/jobs.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    NotificationsModule,
    JobsModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FarmStructureModule,
    WorkforceModule,
    DepartmentsModule,
    DesignationsModule,
    RecruitmentModule,
    LearningModule,
    OnboardingModule,
    OffboardingModule,
    AttendanceModule,
    TasksModule,
    LabourModule,
    CropsModule,
    MachineryModule,
    InventoryModule,
    ProcurementModule,
    NurseryModule,
    PlantHealthModule,
    OrganicInputsModule,
    HarvestModule,
    DistributionModule,
    DairyModule,
    ProcessingModule,
    InspectionsModule,
    RndModule,
    ExpensesModule,
    CropCalendarModule,
    ReportsModule,
    MediaModule,
    DashboardModule,
    AuditReadModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
