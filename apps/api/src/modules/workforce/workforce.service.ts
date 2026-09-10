import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateEmployeeDto, UpdateEmployeeDto, CreateSkillDto } from "./dto/workforce.dto";

const employeeInclude = {
  department: true,
  designation: true,
  worker: {
    include: {
      skills: { include: { skill: true } },
      taskAssignments: { where: { isActive: true }, include: { task: true } },
    },
  },
} as const;

@Injectable()
export class WorkforceService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  listEmployees() {
    return this.prisma.employee.findMany({
      where: { deletedAt: null },
      include: employeeInclude,
      orderBy: { name: "asc" },
    });
  }

  async getEmployee(id: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id }, include: employeeInclude });
    if (!emp || emp.deletedAt) throw new NotFoundException("Employee not found");
    return emp;
  }

  async createEmployee(dto: CreateEmployeeDto, actorId: string) {
    const employee = await this.prisma.employee.create({
      data: {
        farmId: dto.farmId,
        employeeCode: dto.employeeCode,
        name: dto.name,
        phone: dto.phone,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        employmentCategory: dto.employmentCategory,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
        createdById: actorId,
        updatedById: actorId,
        worker: dto.isFieldWorker
          ? {
              create: {
                availability: dto.availability ?? true,
                workRestrictions: dto.workRestrictions,
                skills: dto.skillIds?.length
                  ? { create: dto.skillIds.map((skillId) => ({ skillId })) }
                  : undefined,
              },
            }
          : undefined,
      },
      include: employeeInclude,
    });
    await this.audit.write({ entityType: "Employee", entityId: employee.id, action: "CREATE", userId: actorId, after: employee });
    return employee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto, actorId: string) {
    const before = await this.getEmployee(id);

    if (dto.skillIds && before.worker) {
      await this.prisma.workerSkill.deleteMany({ where: { workerId: before.worker.id } });
      if (dto.skillIds.length) {
        await this.prisma.workerSkill.createMany({
          data: dto.skillIds.map((skillId) => ({ workerId: before.worker!.id, skillId })),
        });
      }
    }

    if (before.worker && (dto.availability !== undefined || dto.workRestrictions !== undefined)) {
      await this.prisma.worker.update({
        where: { id: before.worker.id },
        data: { availability: dto.availability, workRestrictions: dto.workRestrictions },
      });
    }

    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        departmentId: dto.departmentId,
        designationId: dto.designationId,
        employmentCategory: dto.employmentCategory,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : undefined,
        status: dto.status,
        updatedById: actorId,
      },
      include: employeeInclude,
    });
    await this.audit.write({ entityType: "Employee", entityId: id, action: "UPDATE", userId: actorId, before, after: employee });
    return employee;
  }

  async removeEmployee(id: string, actorId: string) {
    await this.getEmployee(id);
    await this.prisma.employee.update({ where: { id }, data: { deletedAt: new Date(), status: "INACTIVE" } });
    await this.audit.write({ entityType: "Employee", entityId: id, action: "DELETE", userId: actorId });
    return { success: true };
  }

  listSkills() {
    return this.prisma.skill.findMany({ orderBy: { name: "asc" } });
  }

  createSkill(dto: CreateSkillDto) {
    return this.prisma.skill.create({ data: dto });
  }

  listWorkers() {
    return this.prisma.worker.findMany({
      where: { deletedAt: null },
      include: { employee: true, skills: { include: { skill: true } } },
      orderBy: { employee: { name: "asc" } },
    });
  }

  /** Workers with no *active* task assignment right now — used by the labour allocation board. */
  async availableWorkers(farmId: string) {
    const workers = await this.prisma.worker.findMany({
      where: { deletedAt: null, availability: true, employee: { farmId, status: "ACTIVE" } },
      include: {
        employee: true,
        skills: { include: { skill: true } },
        taskAssignments: { where: { isActive: true }, include: { task: true } },
      },
    });
    return workers.map((w) => ({ ...w, isBusy: w.taskAssignments.length > 0 }));
  }
}
