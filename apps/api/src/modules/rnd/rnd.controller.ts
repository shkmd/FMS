import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { RndService } from "./rnd.service";
import { AddObservationDto, CreateTrialDto, DecideTrialDto } from "./dto/rnd.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("rnd")
@Controller()
export class RndController {
  constructor(private readonly service: RndService) {}

  @Get("rnd-trials")
  @RequirePermissions(PERMISSIONS.RND_MANAGE, PERMISSIONS.FARM_VIEW)
  listTrials(@Query("farmId") farmId?: string) {
    return this.service.listTrials(farmId);
  }

  @Post("rnd-trials")
  @RequirePermissions(PERMISSIONS.RND_MANAGE)
  createTrial(@Body() dto: CreateTrialDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createTrial(dto, actor);
  }

  @Post("rnd-trial-observations")
  @RequirePermissions(PERMISSIONS.RND_MANAGE)
  addObservation(@Body() dto: AddObservationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.addObservation(dto, actor);
  }

  @Patch("rnd-trials/:id/decide")
  @RequirePermissions(PERMISSIONS.RND_MANAGE)
  decideTrial(@Param("id") id: string, @Body() dto: DecideTrialDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.decideTrial(id, dto, actor);
  }
}
