import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { StockMovementType } from "@fms/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { applyAdjustment, applyMovement } from "./stock-balance.util";
import type {
  ApplyStockCountDto,
  CreateInventoryItemDto,
  CreateLocationDto,
  CreateStockCountDto,
  IssueStockDto,
  ReceiveStockDto,
  TransferStockDto,
} from "./dto/inventory.dto";

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---- Items & locations ----
  listItems(farmId?: string) {
    return this.prisma.inventoryItem.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}) },
      include: { batches: { where: { status: "active" } } },
      orderBy: { name: "asc" },
    });
  }

  async createItem(dto: CreateInventoryItemDto, actorId: string) {
    const item = await this.prisma.inventoryItem.create({ data: dto });
    await this.audit.write({ entityType: "InventoryItem", entityId: item.id, action: "CREATE", userId: actorId, after: item });
    return item;
  }

  listLocations() {
    return this.prisma.stockLocation.findMany({ orderBy: { name: "asc" } });
  }

  createLocation(dto: CreateLocationDto) {
    return this.prisma.stockLocation.create({ data: dto });
  }

  // ---- Batches & movements ----
  listBatches(itemId?: string) {
    return this.prisma.inventoryBatch.findMany({
      where: { status: "active", ...(itemId ? { itemId } : {}) },
      include: { item: true },
      orderBy: { expiryDate: "asc" },
    });
  }

  listMovements(params: { itemId?: string; batchId?: string }) {
    return this.prisma.stockMovement.findMany({
      where: { ...(params.itemId ? { itemId: params.itemId } : {}), ...(params.batchId ? { batchId: params.batchId } : {}) },
      orderBy: { occurredAt: "desc" },
      take: 100,
    });
  }

  /** PURCHASE_RECEIPT / INTERNAL_PRODUCTION / RETURN — creates a batch if none is given, else tops it up. */
  async receiveStock(dto: ReceiveStockDto, actor: AuthenticatedUser) {
    const item = await this.prisma.inventoryItem.findUniqueOrThrow({ where: { id: dto.itemId } });
    const movementType: StockMovementType = dto.movementType ?? "PURCHASE_RECEIPT";

    const result = await this.prisma.$transaction(async (tx) => {
      let batch = dto.batchId ? await tx.inventoryBatch.findUniqueOrThrow({ where: { id: dto.batchId } }) : null;
      if (!batch) {
        batch = await tx.inventoryBatch.create({
          data: {
            itemId: dto.itemId,
            batchNumber: dto.batchNumber,
            quantity: 0,
            unit: dto.unit,
            expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
            storageLocationId: dto.storageLocationId,
            receivedDate: new Date(),
            costPerUnit: dto.costPerUnit,
          },
        });
      }
      const newBalance = applyMovement(batch.quantity, dto.quantity, movementType);
      const updated = await tx.inventoryBatch.update({ where: { id: batch.id }, data: { quantity: newBalance } });
      const movement = await tx.stockMovement.create({
        data: {
          farmId: item.farmId,
          itemId: dto.itemId,
          batchId: updated.id,
          toLocationId: dto.storageLocationId,
          quantity: dto.quantity,
          unit: dto.unit,
          movementType,
          receivedById: actor.id,
        },
      });
      return { batch: updated, movement };
    });

    await this.audit.write({
      entityType: "StockMovement",
      entityId: result.movement.id,
      action: movementType,
      userId: actor.id,
      after: result,
    });
    return result;
  }

  /** ISSUE_TO_TASK / CONSUMPTION / DAMAGE / SPOILAGE / EXPIRY / DISPATCH — always guarded against going negative. */
  async issueStock(dto: IssueStockDto, actor: AuthenticatedUser) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const batch = await tx.inventoryBatch.findUniqueOrThrow({ where: { id: dto.batchId } });
        const newBalance = applyMovement(batch.quantity, dto.quantity, dto.movementType);
        const updated = await tx.inventoryBatch.update({ where: { id: batch.id }, data: { quantity: newBalance } });
        const movement = await tx.stockMovement.create({
          data: {
            farmId: (await tx.inventoryItem.findUniqueOrThrow({ where: { id: batch.itemId } })).farmId,
            itemId: batch.itemId,
            batchId: batch.id,
            quantity: dto.quantity,
            unit: batch.unit,
            movementType: dto.movementType,
            relatedTaskId: dto.relatedTaskId,
            reason: dto.reason,
            issuedById: actor.id,
            requestedById: actor.id,
          },
        });
        return { batch: updated, movement };
      });

      await this.audit.write({
        entityType: "StockMovement",
        entityId: result.movement.id,
        action: dto.movementType,
        userId: actor.id,
        after: result,
      });

      if (result.batch.quantity <= 0) {
        // Best-effort low-stock signal; not a hard alert pipeline for Phase 2.
        const item = await this.prisma.inventoryItem.findUnique({ where: { id: result.batch.itemId } });
        if (item?.minStockLevel != null) {
          const total = await this.prisma.inventoryBatch.aggregate({ where: { itemId: item.id, status: "active" }, _sum: { quantity: true } });
          if ((total._sum.quantity ?? 0) <= item.minStockLevel) {
            await this.notifications.notify(actor.id, {
              type: "LOW_STOCK",
              title: `${item.name} is at or below its minimum stock level`,
              entityType: "InventoryItem",
              entityId: item.id,
            });
          }
        }
      }

      return result;
    } catch (e) {
      if (e instanceof Error && e.message.includes("negative")) throw new ConflictException(e.message);
      throw e;
    }
  }

  async transferBatch(dto: TransferStockDto, actor: AuthenticatedUser) {
    const batch = await this.prisma.inventoryBatch.findUniqueOrThrow({ where: { id: dto.batchId } });
    const [updated, movement] = await this.prisma.$transaction([
      this.prisma.inventoryBatch.update({ where: { id: dto.batchId }, data: { storageLocationId: dto.toLocationId } }),
      this.prisma.stockMovement.create({
        data: {
          farmId: (await this.prisma.inventoryItem.findUniqueOrThrow({ where: { id: batch.itemId } })).farmId,
          itemId: batch.itemId,
          batchId: batch.id,
          fromLocationId: batch.storageLocationId,
          toLocationId: dto.toLocationId,
          quantity: batch.quantity,
          unit: batch.unit,
          movementType: "TRANSFER",
          issuedById: actor.id,
        },
      }),
    ]);
    await this.audit.write({ entityType: "StockMovement", entityId: movement.id, action: "TRANSFER", userId: actor.id, after: { updated, movement } });
    return updated;
  }

  // ---- Physical stock verification ----
  async createStockCount(dto: CreateStockCountDto, actor: AuthenticatedUser) {
    const batches = await this.prisma.inventoryBatch.findMany({ where: { id: { in: dto.lines.map((l) => l.batchId) } } });
    const byId = new Map(batches.map((b) => [b.id, b]));

    const count = await this.prisma.stockCount.create({
      data: {
        locationId: dto.locationId,
        countedById: actor.id,
        status: "draft",
        lines: {
          create: dto.lines.map((l) => {
            const systemQty = byId.get(l.batchId)?.quantity ?? 0;
            return { itemId: byId.get(l.batchId)?.itemId ?? "", systemQty, countedQty: l.countedQty, varianceQty: l.countedQty - systemQty };
          }),
        },
      },
      include: { lines: true },
    });
    await this.audit.write({ entityType: "StockCount", entityId: count.id, action: "CREATE", userId: actor.id, after: count });
    return count;
  }

  listStockCounts() {
    return this.prisma.stockCount.findMany({ include: { lines: true }, orderBy: { countDate: "desc" } });
  }

  /** Turns each non-zero variance line into an approved ADJUSTMENT movement — spec §13: reason + approval required. */
  async applyStockCount(id: string, dto: ApplyStockCountDto, actor: AuthenticatedUser) {
    const count = await this.prisma.stockCount.findUnique({ where: { id }, include: { lines: true } });
    if (!count) throw new NotFoundException("Stock count not found");
    if (count.status === "applied") throw new BadRequestException("This stock count has already been applied");

    for (const line of count.lines) {
      if (line.varianceQty === 0) continue;
      const batchesForItem = await this.prisma.inventoryBatch.findMany({ where: { itemId: line.itemId, status: "active" } });
      const batch = batchesForItem[0];
      if (!batch) continue;
      let newBalance: number;
      try {
        newBalance = applyAdjustment(batch.quantity, line.varianceQty);
      } catch (e) {
        throw new ConflictException(e instanceof Error ? e.message : "Adjustment failed");
      }
      await this.prisma.$transaction([
        this.prisma.inventoryBatch.update({ where: { id: batch.id }, data: { quantity: newBalance } }),
        this.prisma.stockMovement.create({
          data: {
            farmId: (await this.prisma.inventoryItem.findUniqueOrThrow({ where: { id: line.itemId } })).farmId,
            itemId: line.itemId,
            batchId: batch.id,
            quantity: Math.abs(line.varianceQty),
            unit: batch.unit,
            movementType: "ADJUSTMENT",
            reason: dto.reason,
            approvedById: actor.id,
            issuedById: actor.id,
          },
        }),
      ]);
    }

    const updated = await this.prisma.stockCount.update({ where: { id }, data: { status: "applied", varianceNotes: dto.reason } });
    await this.audit.write({ entityType: "StockCount", entityId: id, action: "APPLY_VARIANCE", userId: actor.id, after: updated });
    return updated;
  }
}
