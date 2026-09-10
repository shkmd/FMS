import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { FarmStructureService } from "./farm-structure.service";
import {
  CreateFarmDto,
  UpdateFarmDto,
  CreateFarmAreaDto,
  UpdateFarmAreaDto,
  CreatePlotDto,
  UpdatePlotDto,
  CreateSubPlotDto,
  UpdateSubPlotDto,
  CreateCultivationBlockDto,
} from "./dto/farm-structure.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("farm-structure")
@Controller()
export class FarmStructureController {
  constructor(private readonly service: FarmStructureService) {}

  @Get("farms")
  listFarms() {
    return this.service.listFarms();
  }

  @Post("farms")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  createFarm(@Body() dto: CreateFarmDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createFarm(dto, actor.id);
  }

  @Patch("farms/:id")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  updateFarm(@Param("id") id: string, @Body() dto: UpdateFarmDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateFarm(id, dto, actor.id);
  }

  @Get("farm-areas")
  listFarmAreas(@Query("farmId") farmId?: string) {
    return this.service.listFarmAreas(farmId);
  }

  @Get("farm-areas/:id")
  getFarmArea(@Param("id") id: string) {
    return this.service.getFarmArea(id);
  }

  @Post("farm-areas")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  createFarmArea(@Body() dto: CreateFarmAreaDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createFarmArea(dto, actor.id);
  }

  @Patch("farm-areas/:id")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  updateFarmArea(@Param("id") id: string, @Body() dto: UpdateFarmAreaDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateFarmArea(id, dto, actor.id);
  }

  @Get("plots")
  listPlots(@Query("farmId") farmId?: string) {
    return this.service.listPlots(farmId);
  }

  @Get("plots/:id")
  getPlot(@Param("id") id: string) {
    return this.service.getPlot(id);
  }

  @Post("plots")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  createPlot(@Body() dto: CreatePlotDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createPlot(dto, actor.id);
  }

  @Patch("plots/:id")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  updatePlot(@Param("id") id: string, @Body() dto: UpdatePlotDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updatePlot(id, dto, actor.id);
  }

  @Get("sub-plots")
  listSubPlots(@Query("plotId") plotId?: string) {
    return this.service.listSubPlots(plotId);
  }

  @Post("sub-plots")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  createSubPlot(@Body() dto: CreateSubPlotDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createSubPlot(dto, actor.id);
  }

  @Patch("sub-plots/:id")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  updateSubPlot(@Param("id") id: string, @Body() dto: UpdateSubPlotDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateSubPlot(id, dto, actor.id);
  }

  @Get("cultivation-blocks")
  listCultivationBlocks(@Query("plotId") plotId?: string, @Query("subPlotId") subPlotId?: string) {
    return this.service.listCultivationBlocks(plotId, subPlotId);
  }

  @Post("cultivation-blocks")
  @RequirePermissions(PERMISSIONS.FARM_MANAGE)
  createCultivationBlock(@Body() dto: CreateCultivationBlockDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createCultivationBlock(dto, actor.id);
  }

  @Get("farm-map")
  mapData(@Query("farmId") farmId: string) {
    return this.service.mapData(farmId);
  }
}
