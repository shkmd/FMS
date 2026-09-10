import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { WorkforceService } from "./workforce.service";
import { CreateEmployeeDto, UpdateEmployeeDto, CreateSkillDto } from "./dto/workforce.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("workforce")
@Controller()
export class WorkforceController {
  constructor(private readonly service: WorkforceService) {}

  @Get("employees")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  listEmployees() {
    return this.service.listEmployees();
  }

  @Get("employees/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_VIEW, PERMISSIONS.EMPLOYEE_MANAGE)
  getEmployee(@Param("id") id: string) {
    return this.service.getEmployee(id);
  }

  @Post("employees")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  createEmployee(@Body() dto: CreateEmployeeDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createEmployee(dto, actor.id);
  }

  @Patch("employees/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  updateEmployee(@Param("id") id: string, @Body() dto: UpdateEmployeeDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.updateEmployee(id, dto, actor.id);
  }

  @Delete("employees/:id")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  removeEmployee(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.removeEmployee(id, actor.id);
  }

  @Get("workers")
  listWorkers() {
    return this.service.listWorkers();
  }

  @Get("workers/available")
  availableWorkers(@Query("farmId") farmId: string) {
    return this.service.availableWorkers(farmId);
  }

  @Get("skills")
  listSkills() {
    return this.service.listSkills();
  }

  @Post("skills")
  @RequirePermissions(PERMISSIONS.EMPLOYEE_MANAGE)
  createSkill(@Body() dto: CreateSkillDto) {
    return this.service.createSkill(dto);
  }
}
