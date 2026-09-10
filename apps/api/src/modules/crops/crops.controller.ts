import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { CropsService } from "./crops.service";
import { CreateCropCycleDto, UpdateCropCycleStageDto } from "./dto/crops.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("crops")
@Controller()
export class CropsController {
  constructor(private readonly service: CropsService) {}

  @Get("crops")
  listCrops() {
    return this.service.listCrops();
  }

  @Get("crop-cycles")
  listCropCycles(@Query("cultivationBlockId") cultivationBlockId?: string, @Query("stage") stage?: string) {
    return this.service.listCropCycles({ cultivationBlockId, stage });
  }

  @Post("crop-cycles")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE, PERMISSIONS.FARM_MANAGE)
  createCropCycle(@Body() dto: CreateCropCycleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createCropCycle(dto, actor);
  }

  @Patch("crop-cycles/:id/stage")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE, PERMISSIONS.FARM_MANAGE)
  updateStage(@Param("id") id: string, @Body() dto: UpdateCropCycleStageDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateStage(id, dto, actor);
  }
}
