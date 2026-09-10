import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { NurseryService } from "./nursery.service";
import {
  AddStorageReadingDto,
  CreateGerminationTrialDto,
  CreateNurseryBatchDto,
  CreateSeedLotDto,
  DecideGerminationTrialDto,
  UpdateNurseryStageDto,
} from "./dto/nursery.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("nursery")
@Controller()
export class NurseryController {
  constructor(private readonly service: NurseryService) {}

  @Get("seed-lots")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE, PERMISSIONS.FARM_VIEW)
  listSeedLots(@Query("farmId") farmId?: string) {
    return this.service.listSeedLots(farmId);
  }

  @Get("seed-lots/expiring")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  expiringLots(@Query("farmId") farmId?: string) {
    return this.service.expiringLots(farmId);
  }

  @Get("seed-lots/:id")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE, PERMISSIONS.FARM_VIEW)
  getSeedLot(@Param("id") id: string) {
    return this.service.getSeedLot(id);
  }

  @Post("seed-lots")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  createSeedLot(@Body() dto: CreateSeedLotDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createSeedLot(dto, actor);
  }

  @Post("seed-storage-readings")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  addStorageReading(@Body() dto: AddStorageReadingDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.addStorageReading(dto, actor);
  }

  @Get("germination-trials")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  listGerminationTrials(@Query("seedLotId") seedLotId?: string) {
    return this.service.listGerminationTrials(seedLotId);
  }

  @Post("germination-trials")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  createGerminationTrial(@Body() dto: CreateGerminationTrialDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createGerminationTrial(dto, actor);
  }

  @Patch("germination-trials/:id/decide")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  decideGerminationTrial(@Param("id") id: string, @Body() dto: DecideGerminationTrialDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.decideGerminationTrial(id, dto, actor);
  }

  @Get("nursery-batches")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE, PERMISSIONS.FARM_VIEW)
  listNurseryBatches(@Query("seedLotId") seedLotId?: string) {
    return this.service.listNurseryBatches(seedLotId);
  }

  @Post("nursery-batches")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  createNurseryBatch(@Body() dto: CreateNurseryBatchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createNurseryBatch(dto, actor);
  }

  @Patch("nursery-batches/:id/stage")
  @RequirePermissions(PERMISSIONS.NURSERY_SEEDS_MANAGE)
  updateNurseryStage(@Param("id") id: string, @Body() dto: UpdateNurseryStageDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateNurseryStage(id, dto, actor);
  }
}
