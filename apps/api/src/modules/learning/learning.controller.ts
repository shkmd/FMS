import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { LearningService } from "./learning.service";
import {
  CreateTrainingProgramDto,
  CreateTrainingSessionDto,
  EnrollEmployeeDto,
  UpdateEnrollmentDto,
  UpdateTrainingProgramDto,
  UpdateTrainingSessionDto,
} from "./dto/learning.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("learning")
@Controller()
export class LearningController {
  constructor(private readonly service: LearningService) {}

  @Get("training-programs")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  listPrograms() {
    return this.service.listPrograms();
  }

  @Get("training-programs/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  getProgram(@Param("id") id: string) {
    return this.service.getProgram(id);
  }

  @Post("training-programs")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  createProgram(@Body() dto: CreateTrainingProgramDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createProgram(dto, actor.id);
  }

  @Patch("training-programs/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateProgram(@Param("id") id: string, @Body() dto: UpdateTrainingProgramDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateProgram(id, dto, actor.id);
  }

  @Get("training-sessions")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  listSessions(@Query("programId") programId?: string) {
    return this.service.listSessions(programId);
  }

  @Post("training-programs/:id/sessions")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  createSession(@Param("id") programId: string, @Body() dto: CreateTrainingSessionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createSession(programId, dto, actor.id);
  }

  @Patch("training-sessions/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateSession(@Param("id") id: string, @Body() dto: UpdateTrainingSessionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateSession(id, dto, actor.id);
  }

  @Post("training-sessions/:id/enrollments")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  enroll(@Param("id") sessionId: string, @Body() dto: EnrollEmployeeDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.enroll(sessionId, dto, actor.id);
  }

  @Patch("training-enrollments/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateEnrollment(@Param("id") id: string, @Body() dto: UpdateEnrollmentDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateEnrollment(id, dto, actor.id);
  }
}
