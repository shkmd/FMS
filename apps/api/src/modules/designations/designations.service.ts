import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateDesignationDto, UpdateDesignationDto } from "./dto/designation.dto";

@Injectable()
export class DesignationsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list() {
    return this.prisma.designation.findMany({
      where: { deletedAt: null },
      include: { department: true, _count: { select: { employees: true } } },
      orderBy: { title: "asc" },
    });
  }

  async get(id: string) {
    const designation = await this.prisma.designation.findUnique({
      where: { id },
      include: { department: true, employees: { where: { deletedAt: null } } },
    });
    if (!designation || designation.deletedAt) throw new NotFoundException("Designation not found");
    return designation;
  }

  async create(dto: CreateDesignationDto, actorId: string) {
    const designation = await this.prisma.designation.create({ data: { ...dto, createdById: actorId, updatedById: actorId } });
    await this.audit.write({ entityType: "Designation", entityId: designation.id, action: "CREATE", userId: actorId, after: designation });
    return designation;
  }

  async update(id: string, dto: UpdateDesignationDto, actorId: string) {
    const before = await this.get(id);
    const designation = await this.prisma.designation.update({ where: { id }, data: { ...dto, updatedById: actorId } });
    await this.audit.write({ entityType: "Designation", entityId: id, action: "UPDATE", userId: actorId, before, after: designation });
    return designation;
  }

  async remove(id: string, actorId: string) {
    await this.get(id);
    await this.prisma.designation.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } });
    await this.audit.write({ entityType: "Designation", entityId: id, action: "DELETE", userId: actorId });
    return { success: true };
  }
}
