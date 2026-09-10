import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateCropCycleDto, UpdateCropCycleStageDto } from "./dto/crops.dto";

function monthDay(d: Date): number {
  return (d.getMonth() + 1) * 100 + d.getDate();
}

function parseMonthDay(s: string): number | null {
  const [m, d] = s.split("-").map(Number);
  if (!m || !d) return null;
  return m * 100 + d;
}

function isWithinSeason(sownAt: Date, windowStart: string, windowEnd: string): boolean {
  const value = monthDay(sownAt);
  const start = parseMonthDay(windowStart);
  const end = parseMonthDay(windowEnd);
  if (start === null || end === null) return true;
  if (start <= end) return value >= start && value <= end;
  return value >= start || value <= end; // window wraps across the new year
}

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  listCrops() {
    return this.prisma.crop.findMany({ include: { varieties: true }, orderBy: { name: "asc" } });
  }

  listCropCycles(filters: { cultivationBlockId?: string; stage?: string }) {
    return this.prisma.cropCycle.findMany({
      where: {
        deletedAt: null,
        ...(filters.cultivationBlockId ? { cultivationBlockId: filters.cultivationBlockId } : {}),
        ...(filters.stage ? { stage: filters.stage as any } : {}),
      },
      include: { crop: true, variety: true, cultivationBlock: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createCropCycle(dto: CreateCropCycleDto, actor: AuthenticatedUser) {
    const block = await this.prisma.cultivationBlock.findUniqueOrThrow({
      where: { id: dto.cultivationBlockId },
      include: { plot: true },
    });

    let isOutOfSeason = false;
    if (dto.sownDate) {
      const calendar = await this.prisma.cropCalendar.findFirst({
        where: { cropId: dto.cropId, ...(dto.varietyId ? { varietyId: dto.varietyId } : {}) },
      });
      if (calendar) {
        const withinSeason = isWithinSeason(new Date(dto.sownDate), calendar.sowingWindowStart, calendar.sowingWindowEnd);
        if (!withinSeason) {
          isOutOfSeason = true;
          if (!dto.outOfSeasonOverride || !dto.outOfSeasonReason) {
            throw new BadRequestException(
              `Sowing date falls outside the recommended window (${calendar.sowingWindowStart} to ${calendar.sowingWindowEnd}). Set outOfSeasonOverride with a reason to proceed.`,
            );
          }
        }
      }
    }

    const cycle = await this.prisma.cropCycle.create({
      data: {
        farmId: block.plot.farmId,
        cultivationBlockId: dto.cultivationBlockId,
        cropId: dto.cropId,
        varietyId: dto.varietyId,
        sownDate: dto.sownDate ? new Date(dto.sownDate) : undefined,
        expectedHarvestStart: dto.expectedHarvestStart ? new Date(dto.expectedHarvestStart) : undefined,
        expectedHarvestEnd: dto.expectedHarvestEnd ? new Date(dto.expectedHarvestEnd) : undefined,
        expectedYield: dto.expectedYield,
        isOutOfSeason,
        outOfSeasonApprovedById: isOutOfSeason ? actor.id : undefined,
        outOfSeasonReason: isOutOfSeason ? dto.outOfSeasonReason : undefined,
        stage: dto.sownDate ? "SOWING" : "PLANNED",
        createdById: actor.id,
        updatedById: actor.id,
      },
      include: { crop: true, variety: true },
    });
    await this.audit.write({ entityType: "CropCycle", entityId: cycle.id, action: "CREATE", userId: actor.id, after: cycle });
    return cycle;
  }

  async updateStage(id: string, dto: UpdateCropCycleStageDto, actor: AuthenticatedUser) {
    const before = await this.prisma.cropCycle.findUniqueOrThrow({ where: { id } });
    const cycle = await this.prisma.cropCycle.update({
      where: { id },
      data: { stage: dto.stage, updatedById: actor.id },
    });
    await this.audit.write({ entityType: "CropCycle", entityId: id, action: "STAGE_CHANGE", userId: actor.id, before, after: cycle });
    return cycle;
  }
}
