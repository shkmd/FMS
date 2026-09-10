import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type {
  CompleteMaintenanceDto,
  CreateAssetDto,
  CreateMaintenanceRequestDto,
  LogUsageDto,
  UpdateAssetDto,
} from "./dto/machinery.dto";

@Injectable()
export class MachineryService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async listAssets(farmId?: string) {
    const assets = await this.prisma.asset.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}) },
      orderBy: { name: "asc" },
    });
    // Simple due-for-service signal: meterHours has passed the configured interval.
    return assets.map((a) => ({
      ...a,
      dueForService: a.serviceIntervalHours != null && (a.meterHours ?? 0) >= a.serviceIntervalHours,
    }));
  }

  async getAsset(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        usageLogs: { orderBy: { date: "desc" }, take: 20 },
        maintenanceRequests: { orderBy: { reportedAt: "desc" }, include: { records: true } },
      },
    });
    if (!asset || asset.deletedAt) throw new NotFoundException("Asset not found");
    return asset;
  }

  async createAsset(dto: CreateAssetDto, actorId: string) {
    const asset = await this.prisma.asset.create({
      data: {
        ...dto,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        createdById: actorId,
        updatedById: actorId,
      },
    });
    await this.audit.write({ entityType: "Asset", entityId: asset.id, action: "CREATE", userId: actorId, after: asset });
    return asset;
  }

  async updateAsset(id: string, dto: UpdateAssetDto, actorId: string) {
    const before = await this.prisma.asset.findUniqueOrThrow({ where: { id } });
    const asset = await this.prisma.asset.update({
      where: { id },
      data: {
        ...dto,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : undefined,
        updatedById: actorId,
      },
    });
    await this.audit.write({ entityType: "Asset", entityId: id, action: "UPDATE", userId: actorId, before, after: asset });
    return asset;
  }

  async logUsage(dto: LogUsageDto, actor: AuthenticatedUser) {
    const asset = await this.prisma.asset.findUniqueOrThrow({ where: { id: dto.assetId } });
    if (asset.operationalStatus === "UNDER_REPAIR" || asset.operationalStatus === "RETIRED") {
      throw new BadRequestException(`Asset is ${asset.operationalStatus.toLowerCase().replace("_", " ")} and cannot log usage`);
    }
    const hoursUsed = dto.meterEnd != null && dto.meterStart != null ? dto.meterEnd - dto.meterStart : dto.hoursUsed;
    if (hoursUsed <= 0) throw new BadRequestException("Hours used must be positive");

    const [usage] = await this.prisma.$transaction([
      this.prisma.machineryUsage.create({
        data: {
          assetId: dto.assetId,
          taskId: dto.taskId,
          operatorId: dto.operatorId,
          date: dto.date ? new Date(dto.date) : undefined,
          hoursUsed,
          meterStart: dto.meterStart,
          meterEnd: dto.meterEnd,
          fuelUsed: dto.fuelUsed,
          notes: dto.notes,
        },
      }),
      this.prisma.asset.update({
        where: { id: dto.assetId },
        data: { meterHours: { increment: hoursUsed }, updatedById: actor.id },
      }),
    ]);

    await this.audit.write({ entityType: "MachineryUsage", entityId: usage.id, action: "CREATE", userId: actor.id, after: usage });
    return usage;
  }

  listMaintenanceRequests(status?: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { ...(status ? { status } : {}) },
      include: { asset: true, records: true },
      orderBy: { reportedAt: "desc" },
    });
  }

  async createMaintenanceRequest(dto: CreateMaintenanceRequestDto, actor: AuthenticatedUser) {
    const [request] = await this.prisma.$transaction([
      this.prisma.maintenanceRequest.create({
        data: {
          assetId: dto.assetId,
          reportedById: actor.id,
          issueDescription: dto.issueDescription,
          priority: dto.priority ?? "MEDIUM",
        },
      }),
      this.prisma.asset.update({ where: { id: dto.assetId }, data: { operationalStatus: "UNDER_REPAIR", updatedById: actor.id } }),
    ]);
    await this.audit.write({ entityType: "MaintenanceRequest", entityId: request.id, action: "CREATE", userId: actor.id, after: request });
    return request;
  }

  async completeMaintenance(requestId: string, dto: CompleteMaintenanceDto, actor: AuthenticatedUser) {
    const request = await this.prisma.maintenanceRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new NotFoundException("Maintenance request not found");
    if (request.status === "completed") throw new BadRequestException("This request is already completed");

    const [record] = await this.prisma.$transaction([
      this.prisma.maintenanceRecord.create({
        data: {
          assetId: request.assetId,
          maintenanceRequestId: requestId,
          type: dto.type,
          description: dto.description,
          cost: dto.cost,
          partsUsedJson: dto.partsUsed,
          performedById: actor.id,
          downtimeHours: dto.downtimeHours,
        },
      }),
      this.prisma.maintenanceRequest.update({ where: { id: requestId }, data: { status: "completed" } }),
      this.prisma.asset.update({ where: { id: request.assetId }, data: { operationalStatus: "AVAILABLE", updatedById: actor.id } }),
    ]);

    await this.audit.write({ entityType: "MaintenanceRecord", entityId: record.id, action: "CREATE", userId: actor.id, after: record });
    return record;
  }
}
