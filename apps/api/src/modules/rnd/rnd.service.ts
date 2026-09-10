import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { AddObservationDto, CreateTrialDto, DecideTrialDto } from "./dto/rnd.dto";

@Injectable()
export class RndService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  listTrials(farmId?: string) {
    return this.prisma.rAndDTrial.findMany({
      where: { ...(farmId ? { farmId } : {}) },
      include: { crop: true, variety: true, observations: true },
      orderBy: { startDate: "desc" },
    });
  }

  async createTrial(dto: CreateTrialDto, actor: AuthenticatedUser) {
    const trialCode = `TRIAL-${Date.now().toString(36).toUpperCase()}`;
    const trial = await this.prisma.rAndDTrial.create({
      data: { ...dto, trialCode, startDate: new Date(dto.startDate), status: "active", createdById: actor.id, updatedById: actor.id },
    });
    await this.audit.write({ entityType: "RAndDTrial", entityId: trial.id, action: "CREATE", userId: actor.id, after: trial });
    return trial;
  }

  addObservation(dto: AddObservationDto, actor: AuthenticatedUser) {
    return this.prisma.trialObservation.create({
      data: { trialId: dto.trialId, measurementsJson: dto.measurementsJson as any, notes: dto.notes, observedById: actor.id },
    });
  }

  async decideTrial(id: string, dto: DecideTrialDto, actor: AuthenticatedUser) {
    const before = await this.prisma.rAndDTrial.findUniqueOrThrow({ where: { id } });
    const statusMap: Record<string, string> = { CONTINUE: "active", MODIFY: "active", SCALE: "scaling", COMMERCIALIZE: "commercialized", DISCONTINUE: "closed" };
    const trial = await this.prisma.rAndDTrial.update({
      where: { id },
      data: {
        outcome: dto.outcome,
        recommendation: dto.recommendation,
        yieldResult: dto.yieldResult,
        qualityResult: dto.qualityResult,
        status: statusMap[dto.outcome],
        endDate: dto.outcome === "DISCONTINUE" || dto.outcome === "COMMERCIALIZE" ? new Date() : undefined,
        updatedById: actor.id,
      },
    });
    await this.audit.write({ entityType: "RAndDTrial", entityId: id, action: "DECIDE", userId: actor.id, before, after: trial });
    return trial;
  }
}
