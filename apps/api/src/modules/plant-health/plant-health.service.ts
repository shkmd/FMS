import { Injectable } from "@nestjs/common";
import { buildSoilRecommendation } from "@fms/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreatePestTreatmentDto, CreatePlantHealthRecordDto, CreateSoilTestDto } from "./dto/plant-health.dto";

@Injectable()
export class PlantHealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---- Soil tests ----
  listSoilTests(plotId?: string) {
    return this.prisma.soilTest.findMany({
      where: { ...(plotId ? { plotId } : {}) },
      include: { plot: true },
      orderBy: { date: "desc" },
    });
  }

  /** Auto-fills `recommendation` from the soil testing kit's N/P/K/pH charts when one isn't given manually. */
  async createSoilTest(dto: CreateSoilTestDto, actor: AuthenticatedUser) {
    const recommendation =
      dto.recommendation ??
      buildSoilRecommendation({ nitrogen: dto.nitrogen, phosphorus: dto.phosphorus, potassium: dto.potassium, ph: dto.ph }) ??
      undefined;
    const test = await this.prisma.soilTest.create({
      data: {
        ...dto,
        recommendation: recommendation || undefined,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : undefined,
        testedById: actor.id,
      },
    });
    await this.audit.write({ entityType: "SoilTest", entityId: test.id, action: "CREATE", userId: actor.id, after: test });
    return test;
  }

  // ---- Plant health ----
  listPlantHealthRecords(cropCycleId?: string) {
    return this.prisma.plantHealthRecord.findMany({
      where: { ...(cropCycleId ? { cropCycleId } : {}) },
      include: { cropCycle: { include: { crop: true, variety: true } }, pestTreatments: true },
      orderBy: { date: "desc" },
    });
  }

  async createPlantHealthRecord(dto: CreatePlantHealthRecordDto, actor: AuthenticatedUser) {
    const record = await this.prisma.plantHealthRecord.create({
      data: { ...dto, recordedById: actor.id },
    });
    await this.audit.write({ entityType: "PlantHealthRecord", entityId: record.id, action: "CREATE", userId: actor.id, after: record });

    if (dto.severity === "MAJOR" || dto.severity === "CRITICAL") {
      await this.notifications.notify(actor.id, {
        type: "PLANT_HEALTH_ALERT",
        title: `${dto.severity} plant health issue recorded${dto.symptoms ? `: ${dto.symptoms}` : ""}`,
        entityType: "PlantHealthRecord",
        entityId: record.id,
      });
    }

    return record;
  }

  // ---- Pest treatments (spraying schedule) ----
  listPestTreatments(cropCycleId?: string) {
    return this.prisma.pestTreatment.findMany({
      where: { ...(cropCycleId ? { cropCycleId } : {}) },
      orderBy: { scheduleDate: "asc" },
    });
  }

  createPestTreatment(dto: CreatePestTreatmentDto) {
    return this.prisma.pestTreatment.create({
      data: { ...dto, scheduleDate: new Date(dto.scheduleDate), status: "scheduled" },
    });
  }

  async completePestTreatment(id: string, actor: AuthenticatedUser) {
    const before = await this.prisma.pestTreatment.findUniqueOrThrow({ where: { id } });
    const treatment = await this.prisma.pestTreatment.update({
      where: { id },
      data: { status: "completed", completedById: actor.id, completedAt: new Date() },
    });
    await this.audit.write({ entityType: "PestTreatment", entityId: id, action: "COMPLETE", userId: actor.id, before, after: treatment });
    return treatment;
  }
}
