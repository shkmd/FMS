import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { OnboardingService } from "./onboarding.service";
import { CreateOnboardingCaseDto, UpdateOnboardingTaskDto } from "./dto/onboarding.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("onboarding")
@Controller("onboarding-cases")
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  list() {
    return this.service.list();
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  get(@Param("id") id: string) {
    return this.service.get(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  create(@Body() dto: CreateOnboardingCaseDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.create(dto, actor.id);
  }

  @Patch("tasks/:taskId")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateTask(@Param("taskId") taskId: string, @Body() dto: UpdateOnboardingTaskDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateTask(taskId, dto, actor.id);
  }
}
