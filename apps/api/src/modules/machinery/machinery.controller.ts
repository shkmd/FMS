import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { MachineryService } from "./machinery.service";
import {
  CompleteMaintenanceDto,
  CreateAssetDto,
  CreateMaintenanceRequestDto,
  LogUsageDto,
  UpdateAssetDto,
} from "./dto/machinery.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("machinery")
@Controller()
export class MachineryController {
  constructor(private readonly service: MachineryService) {}

  @Get("assets")
  @RequirePermissions(PERMISSIONS.MACHINERY_VIEW, PERMISSIONS.MACHINERY_MANAGE)
  listAssets(@Query("farmId") farmId?: string) {
    return this.service.listAssets(farmId);
  }

  @Get("assets/:id")
  @RequirePermissions(PERMISSIONS.MACHINERY_VIEW, PERMISSIONS.MACHINERY_MANAGE)
  getAsset(@Param("id") id: string) {
    return this.service.getAsset(id);
  }

  @Post("assets")
  @RequirePermissions(PERMISSIONS.MACHINERY_MANAGE)
  createAsset(@Body() dto: CreateAssetDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createAsset(dto, actor.id);
  }

  @Patch("assets/:id")
  @RequirePermissions(PERMISSIONS.MACHINERY_MANAGE)
  updateAsset(@Param("id") id: string, @Body() dto: UpdateAssetDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateAsset(id, dto, actor.id);
  }

  @Post("machinery-usage")
  @RequirePermissions(PERMISSIONS.MACHINERY_VIEW, PERMISSIONS.MACHINERY_MANAGE, PERMISSIONS.TASK_UPDATE_PROGRESS)
  logUsage(@Body() dto: LogUsageDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.logUsage(dto, actor);
  }

  @Get("maintenance-requests")
  @RequirePermissions(PERMISSIONS.MACHINERY_VIEW, PERMISSIONS.MACHINERY_MANAGE)
  listMaintenanceRequests(@Query("status") status?: string) {
    return this.service.listMaintenanceRequests(status);
  }

  @Post("maintenance-requests")
  @RequirePermissions(PERMISSIONS.MACHINERY_VIEW, PERMISSIONS.MACHINERY_MANAGE)
  createMaintenanceRequest(@Body() dto: CreateMaintenanceRequestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createMaintenanceRequest(dto, actor);
  }

  @Patch("maintenance-requests/:id/complete")
  @RequirePermissions(PERMISSIONS.MACHINERY_MANAGE)
  completeMaintenance(@Param("id") id: string, @Body() dto: CompleteMaintenanceDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.completeMaintenance(id, dto, actor);
  }
}
