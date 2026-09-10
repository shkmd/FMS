import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { InventoryService } from "../inventory/inventory.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateForecastDto, CreateHarvestBatchDto, CreateQualityRecordDto } from "./dto/harvest.dto";

@Injectable()
export class HarvestService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
  ) {}

  // ---- Forecasts ----
  listForecasts(cropCycleId?: string) {
    return this.prisma.harvestForecast.findMany({
      where: { ...(cropCycleId ? { cropCycleId } : {}) },
      include: { cropCycle: { include: { crop: true, variety: true } } },
      orderBy: { expectedDate: "asc" },
    });
  }

  async createForecast(dto: CreateForecastDto, actor: AuthenticatedUser) {
    const forecast = await this.prisma.harvestForecast.create({
      data: { ...dto, expectedDate: new Date(dto.expectedDate), unit: dto.unit ?? "kg", createdById: actor.id },
    });
    await this.audit.write({ entityType: "HarvestForecast", entityId: forecast.id, action: "CREATE", userId: actor.id, after: forecast });
    return forecast;
  }

  // ---- Batches ----
  listBatches(cropCycleId?: string) {
    return this.prisma.harvestBatch.findMany({
      where: { ...(cropCycleId ? { cropCycleId } : {}) },
      include: { cropCycle: { include: { crop: true, variety: true } }, cultivationBlock: true, qualityRecords: true },
      orderBy: { harvestDate: "desc" },
    });
  }

  /** Spec §13: every harvest batch links to a crop cycle + cultivation block (schema-enforced), and
   * pushes real inventory (spec §11: "Transfer stock to storage, processing or distribution"). */
  async createHarvestBatch(dto: CreateHarvestBatchDto, actor: AuthenticatedUser) {
    const cropCycle = await this.prisma.cropCycle.findUniqueOrThrow({ where: { id: dto.cropCycleId }, include: { crop: true } });
    const unit = dto.unit ?? "kg";
    const damaged = dto.damagedQuantity ?? 0;
    const netQuantity = dto.grossQuantity - damaged;
    const batchNumber = `HB-${Date.now().toString(36).toUpperCase()}`;

    const batch = await this.prisma.harvestBatch.create({
      data: {
        farmId: dto.farmId,
        batchNumber,
        cropCycleId: dto.cropCycleId,
        cultivationBlockId: dto.cultivationBlockId,
        harvestDate: dto.harvestDate ? new Date(dto.harvestDate) : new Date(),
        grossQuantity: dto.grossQuantity,
        damagedQuantity: damaged,
        netQuantity,
        unit,
        recordedById: actor.id,
        storageLocationId: dto.storageLocationId,
      },
    });

    // Push the harvested produce into inventory so it's tracked like any other stock from here on.
    let item = await this.prisma.inventoryItem.findFirst({ where: { farmId: dto.farmId, name: `Harvested ${cropCycle.crop.name}` } });
    if (!item) {
      item = await this.prisma.inventoryItem.create({
        data: { farmId: dto.farmId, name: `Harvested ${cropCycle.crop.name}`, category: "HARVESTED_PRODUCE", unit },
      });
    }
    if (netQuantity > 0) {
      // batchNumber mirrors the harvest batch number so Distribution can find the right inventory batch to dispatch against.
      await this.inventory.receiveStock(
        { itemId: item.id, quantity: netQuantity, unit, batchNumber, storageLocationId: dto.storageLocationId, movementType: "INTERNAL_PRODUCTION" },
        actor,
      );
    }

    await this.audit.write({ entityType: "HarvestBatch", entityId: batch.id, action: "CREATE", userId: actor.id, after: batch });
    return batch;
  }

  async addQualityRecord(dto: CreateQualityRecordDto, actor: AuthenticatedUser) {
    const record = await this.prisma.harvestQualityRecord.create({
      data: { harvestBatchId: dto.harvestBatchId, grade: dto.grade, notes: dto.notes, rejectionReason: dto.rejectionReason, gradedById: actor.id },
    });
    await this.audit.write({ entityType: "HarvestQualityRecord", entityId: record.id, action: "CREATE", userId: actor.id, after: record });
    return record;
  }

  /** Forecast vs. actual + yield/rejection, per spec §5.11. */
  async forecastVsActual(cropCycleId: string) {
    const [forecasts, batches, cultivationBlock] = await Promise.all([
      this.prisma.harvestForecast.findMany({ where: { cropCycleId } }),
      this.prisma.harvestBatch.findMany({ where: { cropCycleId } }),
      this.prisma.cropCycle.findUnique({ where: { id: cropCycleId }, include: { cultivationBlock: true } }),
    ]);
    const expectedTotal = forecasts.reduce((s, f) => s + f.expectedQuantity, 0);
    const grossTotal = batches.reduce((s, b) => s + b.grossQuantity, 0);
    const netTotal = batches.reduce((s, b) => s + b.netQuantity, 0);
    const damagedTotal = batches.reduce((s, b) => s + b.damagedQuantity, 0);
    const area = cultivationBlock?.cultivationBlock?.area;
    return {
      expectedTotal,
      grossTotal,
      netTotal,
      damagedTotal,
      rejectionPercent: grossTotal > 0 ? (damagedTotal / grossTotal) * 100 : 0,
      variancePercent: expectedTotal > 0 ? ((netTotal - expectedTotal) / expectedTotal) * 100 : null,
      yieldPerUnitArea: area ? netTotal / area : null,
    };
  }
}
