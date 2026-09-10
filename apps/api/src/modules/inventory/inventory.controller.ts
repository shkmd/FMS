import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { InventoryService } from "./inventory.service";
import {
  ApplyStockCountDto,
  CreateInventoryItemDto,
  CreateLocationDto,
  CreateStockCountDto,
  IssueStockDto,
  ReceiveStockDto,
  TransferStockDto,
} from "./dto/inventory.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("inventory")
@Controller()
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Get("inventory-items")
  @RequirePermissions(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE)
  listItems(@Query("farmId") farmId?: string) {
    return this.service.listItems(farmId);
  }

  @Post("inventory-items")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  createItem(@Body() dto: CreateInventoryItemDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createItem(dto, actor.id);
  }

  @Get("stock-locations")
  @RequirePermissions(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE)
  listLocations() {
    return this.service.listLocations();
  }

  @Post("stock-locations")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  createLocation(@Body() dto: CreateLocationDto) {
    return this.service.createLocation(dto);
  }

  @Get("inventory-batches")
  @RequirePermissions(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE)
  listBatches(@Query("itemId") itemId?: string) {
    return this.service.listBatches(itemId);
  }

  @Get("stock-movements")
  @RequirePermissions(PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE)
  listMovements(@Query("itemId") itemId?: string, @Query("batchId") batchId?: string) {
    return this.service.listMovements({ itemId, batchId });
  }

  @Post("stock-movements/receive")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  receiveStock(@Body() dto: ReceiveStockDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.receiveStock(dto, actor);
  }

  @Post("stock-movements/issue")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  issueStock(@Body() dto: IssueStockDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.issueStock(dto, actor);
  }

  @Post("stock-movements/transfer")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  transferBatch(@Body() dto: TransferStockDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.transferBatch(dto, actor);
  }

  @Get("stock-counts")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  listStockCounts() {
    return this.service.listStockCounts();
  }

  @Post("stock-counts")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  createStockCount(@Body() dto: CreateStockCountDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createStockCount(dto, actor);
  }

  @Patch("stock-counts/:id/apply")
  @RequirePermissions(PERMISSIONS.INVENTORY_MANAGE)
  applyStockCount(@Param("id") id: string, @Body() dto: ApplyStockCountDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.applyStockCount(id, dto, actor);
  }
}
