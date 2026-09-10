import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateDepartmentDto, UpdateDepartmentDto } from "./dto/department.dto";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list() {
    return this.prisma.department.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { employees: true, designations: true } } },
      orderBy: { name: "asc" },
    });
  }

  async get(id: string) {
    const dept = await this.prisma.department.findUnique({
      where: { id },
      include: { designations: { where: { deletedAt: null } }, employees: { where: { deletedAt: null } } },
    });
    if (!dept || dept.deletedAt) throw new NotFoundException("Department not found");
    return dept;
  }

  async create(dto: CreateDepartmentDto, actorId: string) {
    const dept = await this.prisma.department.create({ data: { ...dto, createdById: actorId, updatedById: actorId } });
    await this.audit.write({ entityType: "Department", entityId: dept.id, action: "CREATE", userId: actorId, after: dept });
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto, actorId: string) {
    const before = await this.get(id);
    const dept = await this.prisma.department.update({ where: { id }, data: { ...dto, updatedById: actorId } });
    await this.audit.write({ entityType: "Department", entityId: id, action: "UPDATE", userId: actorId, before, after: dept });
    return dept;
  }

  async remove(id: string, actorId: string) {
    await this.get(id);
    await this.prisma.department.update({ where: { id }, data: { deletedAt: new Date(), updatedById: actorId } });
    await this.audit.write({ entityType: "Department", entityId: id, action: "DELETE", userId: actorId });
    return { success: true };
  }
}
