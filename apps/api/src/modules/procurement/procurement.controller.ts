import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { ProcurementService } from "./procurement.service";
import { CreateGoodsReceiptDto, CreatePurchaseOrderDto, CreateRequisitionDto, CreateVendorDto } from "./dto/procurement.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("procurement")
@Controller()
export class ProcurementController {
  constructor(private readonly service: ProcurementService) {}

  @Get("vendors")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE, PERMISSIONS.PROCUREMENT_APPROVE)
  listVendors(@Query("farmId") farmId?: string) {
    return this.service.listVendors(farmId);
  }

  @Post("vendors")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE)
  createVendor(@Body() dto: CreateVendorDto) {
    return this.service.createVendor(dto);
  }

  @Get("purchase-requisitions")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE, PERMISSIONS.PROCUREMENT_APPROVE)
  listRequisitions(@Query("status") status?: string) {
    return this.service.listRequisitions(status);
  }

  @Post("purchase-requisitions")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE)
  createRequisition(@Body() dto: CreateRequisitionDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createRequisition(dto, actor);
  }

  @Patch("purchase-requisitions/:id/decide")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_APPROVE)
  decideRequisition(@Param("id") id: string, @Body("approve") approve: boolean, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.decideRequisition(id, approve, actor);
  }

  @Get("purchase-orders")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE, PERMISSIONS.PROCUREMENT_APPROVE)
  listPurchaseOrders(@Query("status") status?: string) {
    return this.service.listPurchaseOrders(status);
  }

  @Post("purchase-orders")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE)
  createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createPurchaseOrder(dto, actor);
  }

  @Post("goods-receipts")
  @RequirePermissions(PERMISSIONS.PROCUREMENT_MANAGE, PERMISSIONS.INVENTORY_MANAGE)
  createGoodsReceipt(@Body() dto: CreateGoodsReceiptDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createGoodsReceipt(dto, actor);
  }
}
