import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { LabourService } from "./labour.service";
import {
  CreateLabourRequestDto,
  CreateReassignmentRequestDto,
  DecideLabourRequestDto,
  DecideReassignmentRequestDto,
} from "./dto/labour.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("labour")
@Controller()
export class LabourController {
  constructor(private readonly service: LabourService) {}

  @Get("labour-requests")
  @RequirePermissions(PERMISSIONS.LABOUR_ALLOCATE, PERMISSIONS.LABOUR_REQUEST)
  listLabourRequests(@Query("status") status?: string) {
    return this.service.listLabourRequests(status);
  }

  @Post("labour-requests")
  @RequirePermissions(PERMISSIONS.LABOUR_REQUEST)
  createLabourRequest(@Body() dto: CreateLabourRequestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createLabourRequest(dto, actor);
  }

  @Patch("labour-requests/:id/decide")
  @RequirePermissions(PERMISSIONS.LABOUR_ALLOCATE)
  decideLabourRequest(@Param("id") id: string, @Body() dto: DecideLabourRequestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.decideLabourRequest(id, dto, actor);
  }

  @Get("reassignment-requests")
  @RequirePermissions(PERMISSIONS.REASSIGNMENT_APPROVE, PERMISSIONS.REASSIGNMENT_REQUEST)
  listReassignmentRequests(@Query("status") status?: string) {
    return this.service.listReassignmentRequests(status);
  }

  @Post("reassignment-requests")
  @RequirePermissions(PERMISSIONS.REASSIGNMENT_REQUEST)
  createReassignmentRequest(@Body() dto: CreateReassignmentRequestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createReassignmentRequest(dto, actor);
  }

  @Patch("reassignment-requests/:id/decide")
  @RequirePermissions(PERMISSIONS.REASSIGNMENT_APPROVE)
  decideReassignmentRequest(@Param("id") id: string, @Body() dto: DecideReassignmentRequestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.decideReassignmentRequest(id, dto, actor);
  }
}
