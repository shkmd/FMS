import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { DistributionService } from "./distribution.service";
import { CreateDispatchDto, CreateRecipientDto, RecordPodDto } from "./dto/distribution.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("distribution")
@Controller()
export class DistributionController {
  constructor(private readonly service: DistributionService) {}

  @Get("recipients")
  @RequirePermissions(PERMISSIONS.DISTRIBUTION_MANAGE, PERMISSIONS.FARM_VIEW)
  listRecipients(@Query("farmId") farmId?: string) {
    return this.service.listRecipients(farmId);
  }

  @Post("recipients")
  @RequirePermissions(PERMISSIONS.DISTRIBUTION_MANAGE)
  createRecipient(@Body() dto: CreateRecipientDto) {
    return this.service.createRecipient(dto);
  }

  @Get("dispatches")
  @RequirePermissions(PERMISSIONS.DISTRIBUTION_MANAGE, PERMISSIONS.FARM_VIEW)
  listDispatches(@Query("status") status?: string) {
    return this.service.listDispatches(status);
  }

  @Post("dispatches")
  @RequirePermissions(PERMISSIONS.DISTRIBUTION_MANAGE)
  createDispatch(@Body() dto: CreateDispatchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createDispatch(dto, actor);
  }

  @Patch("dispatches/:id/proof-of-delivery")
  @RequirePermissions(PERMISSIONS.DISTRIBUTION_MANAGE)
  recordProofOfDelivery(@Param("id") id: string, @Body() dto: RecordPodDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.recordProofOfDelivery(id, dto, actor);
  }
}
