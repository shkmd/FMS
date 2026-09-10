import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { PlantHealthService } from "./plant-health.service";
import { CreatePestTreatmentDto, CreatePlantHealthRecordDto, CreateSoilTestDto } from "./dto/plant-health.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("plant-health")
@Controller()
export class PlantHealthController {
  constructor(private readonly service: PlantHealthService) {}

  @Get("soil-tests")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE, PERMISSIONS.FARM_VIEW)
  listSoilTests(@Query("plotId") plotId?: string) {
    return this.service.listSoilTests(plotId);
  }

  @Post("soil-tests")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE)
  createSoilTest(@Body() dto: CreateSoilTestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createSoilTest(dto, actor);
  }

  @Get("plant-health-records")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE, PERMISSIONS.FARM_VIEW)
  listPlantHealthRecords(@Query("cropCycleId") cropCycleId?: string) {
    return this.service.listPlantHealthRecords(cropCycleId);
  }

  @Post("plant-health-records")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE)
  createPlantHealthRecord(@Body() dto: CreatePlantHealthRecordDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createPlantHealthRecord(dto, actor);
  }

  @Get("pest-treatments")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE)
  listPestTreatments(@Query("cropCycleId") cropCycleId?: string) {
    return this.service.listPestTreatments(cropCycleId);
  }

  @Post("pest-treatments")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE)
  createPestTreatment(@Body() dto: CreatePestTreatmentDto) {
    return this.service.createPestTreatment(dto);
  }

  @Patch("pest-treatments/:id/complete")
  @RequirePermissions(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE)
  completePestTreatment(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.completePestTreatment(id, actor);
  }
}
