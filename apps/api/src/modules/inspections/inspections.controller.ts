import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { InspectionsService } from "./inspections.service";
import { CreateInspectionDto, CreateIssueDto, ResolveIssueDto } from "./dto/inspections.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("inspections")
@Controller()
export class InspectionsController {
  constructor(private readonly service: InspectionsService) {}

  @Get("inspections")
  @RequirePermissions(PERMISSIONS.INSPECTION_CREATE, PERMISSIONS.FARM_VIEW)
  listInspections(@Query("farmAreaId") farmAreaId?: string) {
    return this.service.listInspections(farmAreaId);
  }

  @Post("inspections")
  @RequirePermissions(PERMISSIONS.INSPECTION_CREATE)
  createInspection(@Body() dto: CreateInspectionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createInspection(dto, actor);
  }

  @Get("issues")
  @RequirePermissions(PERMISSIONS.ISSUE_CREATE, PERMISSIONS.FARM_VIEW)
  listIssues(@Query("status") status?: string, @Query("severity") severity?: string) {
    return this.service.listIssues({ status, severity });
  }

  @Post("issues")
  @RequirePermissions(PERMISSIONS.ISSUE_CREATE)
  createIssue(@Body() dto: CreateIssueDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createIssue(dto, actor);
  }

  @Patch("issues/:id/resolve-minor")
  @RequirePermissions(PERMISSIONS.ISSUE_RESOLVE_MINOR)
  resolveMinorIssue(@Param("id") id: string, @Body() dto: ResolveIssueDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.resolveMinorIssue(id, dto, actor);
  }

  @Patch("issues/:id/escalate")
  @RequirePermissions(PERMISSIONS.ISSUE_ESCALATE)
  escalateIssue(@Param("id") id: string, @Body("escalatedToId") escalatedToId: string | undefined, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.escalateIssue(id, escalatedToId, actor);
  }

  @Patch("issues/:id/close")
  @RequirePermissions(PERMISSIONS.ISSUE_VERIFY, PERMISSIONS.ISSUE_ESCALATE)
  closeIssue(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.closeIssue(id, actor);
  }
}
