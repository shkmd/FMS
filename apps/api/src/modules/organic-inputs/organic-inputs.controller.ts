import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { OrganicInputsService } from "./organic-inputs.service";
import { CreateApplicationDto, CreateInputBatchDto, CreateRecipeDto } from "./dto/organic-inputs.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("organic-inputs")
@Controller()
export class OrganicInputsController {
  constructor(private readonly service: OrganicInputsService) {}

  @Get("organic-input-recipes")
  @RequirePermissions(PERMISSIONS.ORGANIC_INPUTS_MANAGE, PERMISSIONS.FARM_VIEW)
  listRecipes() {
    return this.service.listRecipes();
  }

  @Post("organic-input-recipes")
  @RequirePermissions(PERMISSIONS.ORGANIC_INPUTS_MANAGE)
  createRecipe(@Body() dto: CreateRecipeDto) {
    return this.service.createRecipe(dto);
  }

  @Get("organic-input-batches")
  @RequirePermissions(PERMISSIONS.ORGANIC_INPUTS_MANAGE, PERMISSIONS.FARM_VIEW)
  listBatches(@Query("recipeId") recipeId?: string) {
    return this.service.listBatches(recipeId);
  }

  @Post("organic-input-batches")
  @RequirePermissions(PERMISSIONS.ORGANIC_INPUTS_MANAGE)
  createBatch(@Body() dto: CreateInputBatchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createBatch(dto, actor);
  }

  @Get("input-applications")
  @RequirePermissions(PERMISSIONS.ORGANIC_INPUTS_MANAGE, PERMISSIONS.FARM_VIEW)
  listApplications(@Query("batchId") batchId?: string) {
    return this.service.listApplications(batchId);
  }

  @Post("input-applications")
  @RequirePermissions(PERMISSIONS.ORGANIC_INPUTS_MANAGE)
  createApplication(@Body() dto: CreateApplicationDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createApplication(dto, actor);
  }
}
