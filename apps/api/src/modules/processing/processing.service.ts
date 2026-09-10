import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { InventoryService } from "../inventory/inventory.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateProductionBatchDto } from "./dto/processing.dto";

@Injectable()
export class ProcessingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
  ) {}

  listBatches(farmId?: string) {
    return this.prisma.productionBatch.findMany({
      where: { ...(farmId ? { farmId } : {}) },
      include: { inputs: true, outputs: true },
      orderBy: { productionDate: "desc" },
    });
  }

  /** Spec §13: every value-added batch must link to its raw-material batches (DTO enforces >=1 input). */
  async createProductionBatch(dto: CreateProductionBatchDto, actor: AuthenticatedUser) {
    const rawQuantity = dto.inputs.reduce((s, i) => s + i.quantity, 0);
    const finishedQuantity = dto.outputs.reduce((s, o) => s + o.quantity, 0);
    const batchNumber = `PB-${Date.now().toString(36).toUpperCase()}`;

    const batch = await this.prisma.productionBatch.create({
      data: {
        farmId: dto.farmId,
        batchNumber,
        productName: dto.productName,
        productionDate: dto.productionDate ? new Date(dto.productionDate) : new Date(),
        rawQuantity,
        finishedQuantity,
        wasteQuantity: Math.max(rawQuantity - finishedQuantity, 0),
        processingDurationMinutes: dto.processingDurationMinutes,
        inputs: { create: dto.inputs.map((i) => ({ sourceType: i.sourceType, harvestBatchId: i.harvestBatchId, quantity: i.quantity, unit: i.unit })) },
        outputs: { create: dto.outputs.map((o) => ({ productName: o.productName, quantity: o.quantity, unit: o.unit })) },
        createdById: actor.id,
        updatedById: actor.id,
      },
      include: { inputs: true, outputs: true },
    });

    // Each finished output becomes tracked, sellable inventory.
    for (const output of dto.outputs) {
      let item = await this.prisma.inventoryItem.findFirst({ where: { farmId: dto.farmId, name: output.productName } });
      if (!item) {
        item = await this.prisma.inventoryItem.create({
          data: { farmId: dto.farmId, name: output.productName, category: "VALUE_ADDED_PRODUCTS", unit: output.unit },
        });
      }
      await this.inventory.receiveStock(
        { itemId: item.id, quantity: output.quantity, unit: output.unit, batchNumber, movementType: "INTERNAL_PRODUCTION" },
        actor,
      );
    }

    await this.audit.write({ entityType: "ProductionBatch", entityId: batch.id, action: "CREATE", userId: actor.id, after: batch });
    return batch;
  }
}
