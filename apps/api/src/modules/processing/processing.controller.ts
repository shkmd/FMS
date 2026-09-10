import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { ProcessingService } from "./processing.service";
import { CreateProductionBatchDto } from "./dto/processing.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("processing")
@Controller("production-batches")
export class ProcessingController {
  constructor(private readonly service: ProcessingService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.PROCESSING_MANAGE, PERMISSIONS.FARM_VIEW)
  listBatches(@Query("farmId") farmId?: string) {
    return this.service.listBatches(farmId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.PROCESSING_MANAGE)
  createProductionBatch(@Body() dto: CreateProductionBatchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createProductionBatch(dto, actor);
  }
}
