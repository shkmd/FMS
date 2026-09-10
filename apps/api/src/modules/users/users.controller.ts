import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  list() {
    return this.users.list();
  }

  @Get("roles")
  @RequirePermissions(PERMISSIONS.USER_MANAGE, PERMISSIONS.ROLE_MANAGE)
  listRoles() {
    return this.users.listRoles();
  }

  @Get(":id")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  findOne(@Param("id") id: string) {
    return this.users.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.create(dto, actor.id);
  }

  @Patch(":id")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  update(@Param("id") id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.update(id, dto, actor.id);
  }

  @Delete(":id")
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  remove(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.remove(id, actor.id);
  }
}
