import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateAnimalDto, CreateAnimalHealthRecordDto, RecordMilkCollectionDto, RecordMilkQualityDto } from "./dto/dairy.dto";

@Injectable()
export class DairyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  listAnimals(farmId?: string) {
    return this.prisma.animal.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}) },
      orderBy: { animalTag: "asc" },
    });
  }

  async getAnimal(id: string) {
    return this.prisma.animal.findUnique({
      where: { id },
      include: {
        healthRecords: { orderBy: { date: "desc" } },
        milkCollections: { orderBy: { date: "desc" }, take: 30, include: { qualityTest: true } },
      },
    });
  }

  async createAnimal(dto: CreateAnimalDto, actor: AuthenticatedUser) {
    const animal = await this.prisma.animal.create({
      data: { ...dto, birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined, status: "active", createdById: actor.id, updatedById: actor.id },
    });
    await this.audit.write({ entityType: "Animal", entityId: animal.id, action: "CREATE", userId: actor.id, after: animal });
    return animal;
  }

  addHealthRecord(dto: CreateAnimalHealthRecordDto, actor: AuthenticatedUser) {
    return this.prisma.animalHealthRecord.create({ data: { ...dto, performedById: actor.id } });
  }

  listMilkCollections(animalId?: string) {
    return this.prisma.milkCollection.findMany({
      where: { ...(animalId ? { animalId } : {}) },
      include: { animal: true, qualityTest: true },
      orderBy: { date: "desc" },
    });
  }

  async recordMilkCollection(dto: RecordMilkCollectionDto, actor: AuthenticatedUser) {
    const collection = await this.prisma.milkCollection.upsert({
      where: { animalId_date_session: { animalId: dto.animalId, date: new Date(dto.date), session: dto.session } },
      create: { farmId: dto.farmId, animalId: dto.animalId, date: new Date(dto.date), session: dto.session, quantityLitres: dto.quantityLitres, collectedById: actor.id },
      update: { quantityLitres: dto.quantityLitres },
    });
    await this.audit.write({ entityType: "MilkCollection", entityId: collection.id, action: "CREATE", userId: actor.id, after: collection });
    return collection;
  }

  async recordMilkQuality(dto: RecordMilkQualityDto, actor: AuthenticatedUser) {
    const abnormal = !!dto.abnormality || (dto.fat != null && dto.fat < 3.0);
    const test = await this.prisma.milkQualityTest.upsert({
      where: { milkCollectionId: dto.milkCollectionId },
      create: { ...dto, testedById: actor.id },
      update: { fat: dto.fat, protein: dto.protein, lactose: dto.lactose, snf: dto.snf, abnormality: dto.abnormality, testedById: actor.id },
    });

    if (abnormal) {
      const collection = await this.prisma.milkCollection.findUnique({ where: { id: dto.milkCollectionId }, include: { animal: true } });
      await this.notifications.notify(actor.id, {
        type: "MILK_QUALITY_ABNORMAL",
        title: `Abnormal milk quality reading for ${collection?.animal?.name ?? collection?.animal?.animalTag}`,
        entityType: "MilkQualityTest",
        entityId: test.id,
      });
    }

    return test;
  }
}
