import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("dashboard")
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get("management")
  management(@Query("farmId") farmId: string) {
    return this.service.management(farmId);
  }

  @Get("farm-manager")
  farmManager(@Query("farmId") farmId: string) {
    return this.service.farmManager(farmId);
  }

  @Get("supervisor")
  supervisor(@CurrentUser() actor: AuthenticatedUser, @Query("supervisorId") supervisorId?: string) {
    return this.service.supervisor(supervisorId ?? actor.id);
  }
}
