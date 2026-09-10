import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { TasksService } from "./tasks.service";
import {
  AddEvidenceDto,
  AssignWorkerDto,
  CancelTaskDto,
  CarryForwardDto,
  CreateTaskDto,
  RecordProgressDto,
  UpdateTaskDto,
} from "./dto/task.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  list(
    @CurrentUser() actor: AuthenticatedUser,
    @Query("farmId") farmId?: string,
    @Query("date") date?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
    @Query("status") status?: string,
    @Query("farmAreaId") farmAreaId?: string,
    @Query("supervisorId") supervisorId?: string,
    @Query("mine") mine?: string,
  ) {
    const workerId = mine === "true" ? actor.employeeId ?? undefined : undefined;
    return this.service.list({ farmId, date, dateFrom, dateTo, status, farmAreaId, supervisorId, workerId });
  }

  @Get(":id")
  getOne(@Param("id") id: string) {
    return this.service.getOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.TASK_CREATE)
  create(@Body() dto: CreateTaskDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.create(dto, actor);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.TASK_CREATE)
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.update(id, dto, actor);
  }

  @Post(":id/submit")
  @RequirePermissions(PERMISSIONS.TASK_SUBMIT)
  submit(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.submit(id, actor);
  }

  @Post(":id/approve")
  @RequirePermissions(PERMISSIONS.TASK_APPROVE)
  approve(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.approve(id, actor);
  }

  @Post(":id/reject")
  @RequirePermissions(PERMISSIONS.TASK_APPROVE)
  reject(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.rejectToDraft(id, actor);
  }

  @Post(":id/assignments")
  @RequirePermissions(PERMISSIONS.TASK_ASSIGN, PERMISSIONS.LABOUR_ALLOCATE)
  assignWorker(@Param("id") id: string, @Body() dto: AssignWorkerDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.assignWorker(id, dto, actor);
  }

  @Delete(":id/assignments/:assignmentId")
  @RequirePermissions(PERMISSIONS.TASK_ASSIGN, PERMISSIONS.LABOUR_ALLOCATE)
  removeAssignment(@Param("id") id: string, @Param("assignmentId") assignmentId: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.removeAssignment(id, assignmentId, actor);
  }

  @Post(":id/progress")
  @RequirePermissions(PERMISSIONS.TASK_UPDATE_PROGRESS, PERMISSIONS.TASK_VIEW_OWN)
  recordProgress(@Param("id") id: string, @Body() dto: RecordProgressDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.recordProgress(id, dto, actor);
  }

  @Post(":id/evidence")
  @RequirePermissions(PERMISSIONS.MEDIA_UPLOAD)
  addEvidence(@Param("id") id: string, @Body() dto: AddEvidenceDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.addEvidence(id, dto, actor);
  }

  @Post(":id/cancel")
  @RequirePermissions(PERMISSIONS.TASK_CANCEL)
  cancel(@Param("id") id: string, @Body() dto: CancelTaskDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.cancel(id, dto, actor);
  }

  @Post(":id/verify")
  @RequirePermissions(PERMISSIONS.TASK_VERIFY)
  verify(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.verify(id, actor);
  }

  @Post(":id/carry-forward")
  @RequirePermissions(PERMISSIONS.TASK_APPROVE)
  carryForward(@Param("id") id: string, @Body() dto: CarryForwardDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.carryForward(id, dto, actor);
  }
}
