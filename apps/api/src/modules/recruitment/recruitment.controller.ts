import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { RecruitmentService } from "./recruitment.service";
import {
  CreateJobApplicationDto,
  CreateJobRequisitionDto,
  HireApplicationDto,
  UpdateApplicationStageDto,
  UpdateJobRequisitionDto,
} from "./dto/recruitment.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("recruitment")
@Controller()
export class RecruitmentController {
  constructor(private readonly service: RecruitmentService) {}

  @Get("job-requisitions")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  listRequisitions() {
    return this.service.listRequisitions();
  }

  @Get("job-requisitions/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  getRequisition(@Param("id") id: string) {
    return this.service.getRequisition(id);
  }

  @Post("job-requisitions")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  createRequisition(@Body() dto: CreateJobRequisitionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createRequisition(dto, actor.id);
  }

  @Patch("job-requisitions/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateRequisition(@Param("id") id: string, @Body() dto: UpdateJobRequisitionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateRequisition(id, dto, actor.id);
  }

  @Get("job-applications")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  listApplications(@Query("requisitionId") requisitionId?: string) {
    return this.service.listApplications(requisitionId);
  }

  @Post("job-requisitions/:id/applications")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  createApplication(@Param("id") requisitionId: string, @Body() dto: CreateJobApplicationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createApplication(requisitionId, dto, actor.id);
  }

  @Patch("job-applications/:id/stage")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateStage(@Param("id") id: string, @Body() dto: UpdateApplicationStageDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateStage(id, dto, actor.id);
  }

  @Post("job-applications/:id/hire")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  hire(@Param("id") id: string, @Body() dto: HireApplicationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.hire(id, dto, actor.id);
  }
}
