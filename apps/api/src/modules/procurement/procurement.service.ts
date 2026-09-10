import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as crypto from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { InventoryService } from "../inventory/inventory.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateGoodsReceiptDto, CreatePurchaseOrderDto, CreateRequisitionDto, CreateVendorDto } from "./dto/procurement.dto";

function shortCode(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

@Injectable()
export class ProcurementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
  ) {}

  // ---- Vendors ----
  listVendors(farmId?: string) {
    return this.prisma.vendor.findMany({ where: { ...(farmId ? { farmId } : {}) }, orderBy: { name: "asc" } });
  }
  createVendor(dto: CreateVendorDto) {
    return this.prisma.vendor.create({ data: dto });
  }

  // ---- Requisitions ----
  listRequisitions(status?: string) {
    return this.prisma.purchaseRequisition.findMany({
      where: { ...(status ? { status } : {}) },
      include: { lines: true, purchaseOrders: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createRequisition(dto: CreateRequisitionDto, actor: AuthenticatedUser) {
    const requisition = await this.prisma.purchaseRequisition.create({
      data: {
        farmId: dto.farmId,
        farmAreaId: dto.farmAreaId,
        requestedById: actor.id,
        neededBy: dto.neededBy ? new Date(dto.neededBy) : undefined,
        status: "submitted",
        lines: { create: dto.lines },
      },
      include: { lines: true },
    });
    await this.audit.write({ entityType: "PurchaseRequisition", entityId: requisition.id, action: "CREATE", userId: actor.id, after: requisition });
    return requisition;
  }

  async decideRequisition(id: string, approve: boolean, actor: AuthenticatedUser) {
    const before = await this.prisma.purchaseRequisition.findUniqueOrThrow({ where: { id } });
    if (before.status !== "submitted") throw new BadRequestException("Only a submitted requisition can be approved or rejected");
    const requisition = await this.prisma.purchaseRequisition.update({
      where: { id },
      data: { status: approve ? "approved" : "rejected", approvedById: actor.id },
    });
    await this.audit.write({ entityType: "PurchaseRequisition", entityId: id, action: approve ? "APPROVE" : "REJECT", userId: actor.id, before, after: requisition });
    return requisition;
  }

  // ---- Purchase orders ----
  listPurchaseOrders(status?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { ...(status ? { status } : {}) },
      include: { vendor: true, lines: true, goodsReceipts: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createPurchaseOrder(dto: CreatePurchaseOrderDto, actor: AuthenticatedUser) {
    if (dto.requisitionId) {
      const req = await this.prisma.purchaseRequisition.findUniqueOrThrow({ where: { id: dto.requisitionId } });
      if (req.status !== "approved") throw new BadRequestException("The requisition must be approved before converting it to a purchase order");
    }
    const totalAmount = dto.lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

    const order = await this.prisma.purchaseOrder.create({
      data: {
        farmId: dto.farmId,
        requisitionId: dto.requisitionId,
        vendorId: dto.vendorId,
        poNumber: shortCode("PO"),
        totalAmount,
        status: "ordered",
        orderedById: actor.id,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : undefined,
        lines: { create: dto.lines },
      },
      include: { lines: true, vendor: true },
    });

    if (dto.requisitionId) {
      await this.prisma.purchaseRequisition.update({ where: { id: dto.requisitionId }, data: { status: "converted" } });
    }

    await this.audit.write({ entityType: "PurchaseOrder", entityId: order.id, action: "CREATE", userId: actor.id, after: order });
    return order;
  }

  // ---- Goods receipts ----
  async createGoodsReceipt(dto: CreateGoodsReceiptDto, actor: AuthenticatedUser) {
    const order = await this.prisma.purchaseOrder.findUnique({ where: { id: dto.purchaseOrderId }, include: { lines: true } });
    if (!order) throw new NotFoundException("Purchase order not found");
    if (order.status === "received") throw new BadRequestException("This purchase order has already been fully received");

    const receipt = await this.prisma.goodsReceipt.create({
      data: {
        purchaseOrderId: dto.purchaseOrderId,
        receivedById: actor.id,
        invoiceRef: dto.invoiceRef,
        status: "received",
        lines: { create: dto.lines },
      },
      include: { lines: true },
    });

    // Every line becomes real inventory — request→issue→receive verification (spec §5.9).
    for (const line of dto.lines) {
      await this.inventory.receiveStock(
        {
          itemId: line.itemId,
          quantity: line.quantityReceived,
          unit: line.unit,
          batchNumber: line.batchNumber,
          storageLocationId: dto.storageLocationId,
          movementType: "PURCHASE_RECEIPT",
        },
        actor,
      );
    }

    await this.prisma.purchaseOrder.update({ where: { id: dto.purchaseOrderId }, data: { status: "received" } });
    await this.audit.write({ entityType: "GoodsReceipt", entityId: receipt.id, action: "CREATE", userId: actor.id, after: receipt });
    return receipt;
  }
}
