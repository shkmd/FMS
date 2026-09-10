import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type {
  AddStorageReadingDto,
  CreateGerminationTrialDto,
  CreateNurseryBatchDto,
  CreateSeedLotDto,
  DecideGerminationTrialDto,
  UpdateNurseryStageDto,
} from "./dto/nursery.dto";

const LOW_GERMINATION_THRESHOLD = 60;

@Injectable()
export class NurseryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---- Seed lots ----
  listSeedLots(farmId?: string) {
    return this.prisma.seedLot.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}) },
      include: { variety: { include: { crop: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSeedLot(id: string) {
    const lot = await this.prisma.seedLot.findUnique({
      where: { id },
      include: {
        variety: { include: { crop: true } },
        storageReadings: { orderBy: { readingAt: "desc" }, take: 20 },
        germinationTrials: { orderBy: { trialDate: "desc" } },
        nurseryBatches: true,
      },
    });
    if (!lot || lot.deletedAt) throw new NotFoundException("Seed lot not found");
    return lot;
  }

  async createSeedLot(dto: CreateSeedLotDto, actor: AuthenticatedUser) {
    const lotNumber = `SL-${dto.classification.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;
    const lot = await this.prisma.seedLot.create({
      data: {
        ...dto,
        lotNumber,
        currentBalance: dto.quantity,
        procurementDate: dto.procurementDate ? new Date(dto.procurementDate) : undefined,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        createdById: actor.id,
        updatedById: actor.id,
      },
    });
    await this.audit.write({ entityType: "SeedLot", entityId: lot.id, action: "CREATE", userId: actor.id, after: lot });
    return lot;
  }

  async addStorageReading(dto: AddStorageReadingDto, actor: AuthenticatedUser) {
    const reading = await this.prisma.seedStorageReading.create({
      data: { seedLotId: dto.seedLotId, temperature: dto.temperature, humidity: dto.humidity, notes: dto.notes, recordedById: actor.id },
    });
    return reading;
  }

  /** Lots past expiry or expiring within 14 days — surfaced on the nursery dashboard. */
  async expiringLots(farmId?: string) {
    const soon = new Date();
    soon.setDate(soon.getDate() + 14);
    return this.prisma.seedLot.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}), expiryDate: { lte: soon }, currentBalance: { gt: 0 } },
      include: { variety: { include: { crop: true } } },
      orderBy: { expiryDate: "asc" },
    });
  }

  // ---- Germination trials ----
  listGerminationTrials(seedLotId?: string) {
    return this.prisma.germinationTrial.findMany({
      where: { ...(seedLotId ? { seedLotId } : {}) },
      include: { seedLot: { include: { variety: { include: { crop: true } } } } },
      orderBy: { trialDate: "desc" },
    });
  }

  async createGerminationTrial(dto: CreateGerminationTrialDto, actor: AuthenticatedUser) {
    if (dto.seedsGerminated > dto.seedsTested) {
      throw new BadRequestException("Seeds germinated cannot exceed seeds tested");
    }
    const percent = (dto.seedsGerminated / dto.seedsTested) * 100;
    const trial = await this.prisma.germinationTrial.create({
      data: {
        seedLotId: dto.seedLotId,
        trialDate: dto.trialDate ? new Date(dto.trialDate) : undefined,
        seedsTested: dto.seedsTested,
        seedsGerminated: dto.seedsGerminated,
        growingMedium: dto.growingMedium,
        temperature: dto.temperature,
        moistureConditions: dto.moistureConditions,
        observations: dto.observations,
        staffId: actor.id,
      },
    });
    await this.audit.write({ entityType: "GerminationTrial", entityId: trial.id, action: "CREATE", userId: actor.id, after: trial });

    if (percent < LOW_GERMINATION_THRESHOLD) {
      const lot = await this.prisma.seedLot.findUnique({ where: { id: dto.seedLotId } });
      await this.notifications.notify(actor.id, {
        type: "LOW_GERMINATION",
        title: `Low germination (${percent.toFixed(0)}%) on lot ${lot?.lotNumber ?? dto.seedLotId}`,
        entityType: "GerminationTrial",
        entityId: trial.id,
      });
    }

    return { ...trial, germinationPercent: percent };
  }

  async decideGerminationTrial(id: string, dto: DecideGerminationTrialDto, actor: AuthenticatedUser) {
    const before = await this.prisma.germinationTrial.findUniqueOrThrow({ where: { id } });
    const trial = await this.prisma.germinationTrial.update({
      where: { id },
      data: {
        approvedForSowing: dto.approvedForSowing,
        rejected: dto.rejected ?? false,
        quarantined: dto.quarantined ?? false,
        correctiveAction: dto.correctiveAction,
      },
    });
    await this.audit.write({ entityType: "GerminationTrial", entityId: id, action: "DECIDE", userId: actor.id, before, after: trial });
    return trial;
  }

  // ---- Nursery batches ----
  listNurseryBatches(seedLotId?: string) {
    return this.prisma.nurseryBatch.findMany({
      where: { deletedAt: null, ...(seedLotId ? { seedLotId } : {}) },
      include: { variety: { include: { crop: true } }, seedLot: true },
      orderBy: { startDate: "desc" },
    });
  }

  /** Spec §13: a nursery batch must originate from a seed lot, or record an explicit external source. */
  async createNurseryBatch(dto: CreateNurseryBatchDto, actor: AuthenticatedUser) {
    if (!dto.seedLotId && !dto.externalSourceNote) {
      throw new BadRequestException("A nursery batch needs either a seed lot or an explicit external-source note");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (dto.seedLotId) {
        const lot = await tx.seedLot.findUniqueOrThrow({ where: { id: dto.seedLotId } });
        if (lot.currentBalance < dto.quantity) {
          throw new ConflictException(`Seed lot ${lot.lotNumber} only has ${lot.currentBalance} ${lot.unit} remaining`);
        }
        await tx.seedLot.update({ where: { id: dto.seedLotId }, data: { currentBalance: lot.currentBalance - dto.quantity } });
      }
      return tx.nurseryBatch.create({
        data: {
          farmId: dto.farmId,
          seedLotId: dto.seedLotId,
          germinationTrialId: dto.germinationTrialId,
          cropId: dto.cropId,
          varietyId: dto.varietyId,
          quantity: dto.quantity,
          expectedReadyDate: dto.expectedReadyDate ? new Date(dto.expectedReadyDate) : undefined,
          currentLocation: dto.externalSourceNote ? `External source: ${dto.externalSourceNote}` : dto.currentLocation,
          createdById: actor.id,
          updatedById: actor.id,
        },
      });
    });

    await this.audit.write({ entityType: "NurseryBatch", entityId: result.id, action: "CREATE", userId: actor.id, after: result });
    return result;
  }

  async updateNurseryStage(id: string, dto: UpdateNurseryStageDto, actor: AuthenticatedUser) {
    const before = await this.prisma.nurseryBatch.findUniqueOrThrow({ where: { id } });
    const batch = await this.prisma.nurseryBatch.update({ where: { id }, data: { stage: dto.stage, updatedById: actor.id } });
    await this.audit.write({ entityType: "NurseryBatch", entityId: id, action: "STAGE_CHANGE", userId: actor.id, before, after: batch });
    return batch;
  }
}
