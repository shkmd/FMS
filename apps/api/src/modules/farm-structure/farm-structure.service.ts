import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type {
  CreateFarmDto,
  UpdateFarmDto,
  CreateFarmAreaDto,
  UpdateFarmAreaDto,
  CreatePlotDto,
  UpdatePlotDto,
  CreateSubPlotDto,
  UpdateSubPlotDto,
  CreateCultivationBlockDto,
} from "./dto/farm-structure.dto";

@Injectable()
export class FarmStructureService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ---- Farms ----
  listFarms() {
    return this.prisma.farm.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } });
  }

  async createFarm(dto: CreateFarmDto, actorId: string) {
    const farm = await this.prisma.farm.create({ data: { ...dto, createdById: actorId, updatedById: actorId } });
    await this.audit.write({ entityType: "Farm", entityId: farm.id, action: "CREATE", userId: actorId, after: farm });
    return farm;
  }

  async updateFarm(id: string, dto: UpdateFarmDto, actorId: string) {
    const before = await this.prisma.farm.findUniqueOrThrow({ where: { id } });
    const farm = await this.prisma.farm.update({ where: { id }, data: { ...dto, updatedById: actorId } });
    await this.audit.write({ entityType: "Farm", entityId: id, action: "UPDATE", userId: actorId, before, after: farm });
    return farm;
  }

  // ---- Farm areas ----
  listFarmAreas(farmId?: string) {
    return this.prisma.farmArea.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}) },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  async getFarmArea(id: string) {
    const area = await this.prisma.farmArea.findUnique({ where: { id } });
    if (!area || area.deletedAt) throw new NotFoundException("Farm area not found");
    return area;
  }

  async createFarmArea(dto: CreateFarmAreaDto, actorId: string) {
    const area = await this.prisma.farmArea.create({
      data: { ...dto, boundary: dto.boundary as any, createdById: actorId, updatedById: actorId },
    });
    await this.audit.write({ entityType: "FarmArea", entityId: area.id, action: "CREATE", userId: actorId, after: area });
    return area;
  }

  async updateFarmArea(id: string, dto: UpdateFarmAreaDto, actorId: string) {
    const before = await this.getFarmArea(id);
    const area = await this.prisma.farmArea.update({
      where: { id },
      data: { ...dto, boundary: dto.boundary as any, updatedById: actorId },
    });
    await this.audit.write({ entityType: "FarmArea", entityId: id, action: "UPDATE", userId: actorId, before, after: area });
    return area;
  }

  // ---- Plots ----
  listPlots(farmId?: string) {
    return this.prisma.plot.findMany({
      where: { deletedAt: null, ...(farmId ? { farmId } : {}) },
      include: { subPlots: { where: { deletedAt: null } } },
      orderBy: { code: "asc" },
    });
  }

  async getPlot(id: string) {
    const plot = await this.prisma.plot.findUnique({
      where: { id },
      include: { subPlots: { where: { deletedAt: null } }, cultivationBlocks: true },
    });
    if (!plot || plot.deletedAt) throw new NotFoundException("Plot not found");
    return plot;
  }

  async createPlot(dto: CreatePlotDto, actorId: string) {
    const plot = await this.prisma.plot.create({
      data: { ...dto, boundary: dto.boundary as any, createdById: actorId, updatedById: actorId },
    });
    await this.audit.write({ entityType: "Plot", entityId: plot.id, action: "CREATE", userId: actorId, after: plot });
    return plot;
  }

  async updatePlot(id: string, dto: UpdatePlotDto, actorId: string) {
    const before = await this.getPlot(id);
    const plot = await this.prisma.plot.update({
      where: { id },
      data: { ...dto, boundary: dto.boundary as any, updatedById: actorId },
    });
    await this.audit.write({ entityType: "Plot", entityId: id, action: "UPDATE", userId: actorId, before, after: plot });
    return plot;
  }

  // ---- Sub-plots ----
  listSubPlots(plotId?: string) {
    return this.prisma.subPlot.findMany({
      where: { deletedAt: null, ...(plotId ? { plotId } : {}) },
      orderBy: { code: "asc" },
    });
  }

  async createSubPlot(dto: CreateSubPlotDto, actorId: string) {
    const subPlot = await this.prisma.subPlot.create({
      data: { ...dto, boundary: dto.boundary as any, createdById: actorId, updatedById: actorId },
    });
    await this.audit.write({ entityType: "SubPlot", entityId: subPlot.id, action: "CREATE", userId: actorId, after: subPlot });
    return subPlot;
  }

  async updateSubPlot(id: string, dto: UpdateSubPlotDto, actorId: string) {
    const before = await this.prisma.subPlot.findUniqueOrThrow({ where: { id } });
    const subPlot = await this.prisma.subPlot.update({
      where: { id },
      data: { ...dto, boundary: dto.boundary as any, updatedById: actorId },
    });
    await this.audit.write({ entityType: "SubPlot", entityId: id, action: "UPDATE", userId: actorId, before, after: subPlot });
    return subPlot;
  }

  // ---- Cultivation blocks ----
  listCultivationBlocks(plotId?: string, subPlotId?: string) {
    return this.prisma.cultivationBlock.findMany({
      where: { deletedAt: null, ...(plotId ? { plotId } : {}), ...(subPlotId ? { subPlotId } : {}) },
      include: { cropCycles: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { code: "asc" },
    });
  }

  async createCultivationBlock(dto: CreateCultivationBlockDto, actorId: string) {
    const block = await this.prisma.cultivationBlock.create({
      data: { ...dto, createdById: actorId, updatedById: actorId },
    });
    await this.audit.write({ entityType: "CultivationBlock", entityId: block.id, action: "CREATE", userId: actorId, after: block });
    return block;
  }

  /** Combined feed for the Leaflet farm map — farm areas + plots with boundary/status/center. */
  async mapData(farmId: string) {
    const [areas, plots] = await Promise.all([
      this.prisma.farmArea.findMany({ where: { farmId, deletedAt: null } }),
      this.prisma.plot.findMany({ where: { farmId, deletedAt: null }, include: { subPlots: true } }),
    ]);
    return { areas, plots };
  }
}
