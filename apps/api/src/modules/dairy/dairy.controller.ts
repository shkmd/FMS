import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { DairyService } from "./dairy.service";
import { CreateAnimalDto, CreateAnimalHealthRecordDto, RecordMilkCollectionDto, RecordMilkQualityDto } from "./dto/dairy.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("dairy")
@Controller()
export class DairyController {
  constructor(private readonly service: DairyService) {}

  @Get("animals")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE, PERMISSIONS.FARM_VIEW)
  listAnimals(@Query("farmId") farmId?: string) {
    return this.service.listAnimals(farmId);
  }

  @Get("animals/:id")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE, PERMISSIONS.FARM_VIEW)
  getAnimal(@Param("id") id: string) {
    return this.service.getAnimal(id);
  }

  @Post("animals")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE)
  createAnimal(@Body() dto: CreateAnimalDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createAnimal(dto, actor);
  }

  @Post("animal-health-records")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE)
  addHealthRecord(@Body() dto: CreateAnimalHealthRecordDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.addHealthRecord(dto, actor);
  }

  @Get("milk-collections")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE)
  listMilkCollections(@Query("animalId") animalId?: string) {
    return this.service.listMilkCollections(animalId);
  }

  @Post("milk-collections")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE)
  recordMilkCollection(@Body() dto: RecordMilkCollectionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.recordMilkCollection(dto, actor);
  }

  @Post("milk-quality-tests")
  @RequirePermissions(PERMISSIONS.DAIRY_MANAGE)
  recordMilkQuality(@Body() dto: RecordMilkQualityDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.recordMilkQuality(dto, actor);
  }
}
