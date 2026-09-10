import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { DesignationsService } from "./designations.service";
import { CreateDesignationDto, UpdateDesignationDto } from "./dto/designation.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("designations")
@Controller("designations")
export class DesignationsController {
  constructor(private readonly service: DesignationsService) {}

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
  create(@Body() dto: CreateDesignationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.create(dto, actor.id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  update(@Param("id") id: string, @Body() dto: UpdateDesignationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.update(id, dto, actor.id);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  remove(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.remove(id, actor.id);
  }
}
