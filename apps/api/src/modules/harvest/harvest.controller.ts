import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { HarvestService } from "./harvest.service";
import { CreateForecastDto, CreateHarvestBatchDto, CreateQualityRecordDto } from "./dto/harvest.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("harvest")
@Controller()
export class HarvestController {
  constructor(private readonly service: HarvestService) {}

  @Get("harvest-forecasts")
  @RequirePermissions(PERMISSIONS.HARVEST_MANAGE, PERMISSIONS.FARM_VIEW)
  listForecasts(@Query("cropCycleId") cropCycleId?: string) {
    return this.service.listForecasts(cropCycleId);
  }

  @Post("harvest-forecasts")
  @RequirePermissions(PERMISSIONS.HARVEST_MANAGE)
  createForecast(@Body() dto: CreateForecastDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createForecast(dto, actor);
  }

  @Get("harvest-batches")
  @RequirePermissions(PERMISSIONS.HARVEST_MANAGE, PERMISSIONS.FARM_VIEW)
  listBatches(@Query("cropCycleId") cropCycleId?: string) {
    return this.service.listBatches(cropCycleId);
  }

  @Post("harvest-batches")
  @RequirePermissions(PERMISSIONS.HARVEST_MANAGE)
  createHarvestBatch(@Body() dto: CreateHarvestBatchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createHarvestBatch(dto, actor);
  }

  @Post("harvest-quality-records")
  @RequirePermissions(PERMISSIONS.HARVEST_MANAGE)
  addQualityRecord(@Body() dto: CreateQualityRecordDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.addQualityRecord(dto, actor);
  }

  @Get("harvest-forecasts/:cropCycleId/vs-actual")
  @RequirePermissions(PERMISSIONS.HARVEST_MANAGE, PERMISSIONS.FARM_VIEW)
  forecastVsActual(@Param("cropCycleId") cropCycleId: string) {
    return this.service.forecastVsActual(cropCycleId);
  }
}
