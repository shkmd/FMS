import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateOffboardingCaseDto, UpdateOffboardingTaskDto } from "./dto/offboarding.dto";

const DEFAULT_TASKS = [
  "Return company property / equipment",
  "Knowledge transfer and handover",
  "Clear pending dues / final settlement",
  "Revoke system access",
];

const caseInclude = { employee: true, tasks: { orderBy: { title: "asc" as const } } };

@Injectable()
export class OffboardingService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list() {
    return this.prisma.offboardingCase.findMany({ include: caseInclude, orderBy: { createdAt: "desc" } });
  }

  async get(id: string) {
    const found = await this.prisma.offboardingCase.findUnique({ where: { id }, include: caseInclude });
    if (!found) throw new NotFoundException("Offboarding case not found");
    return found;
  }

  async create(dto: CreateOffboardingCaseDto, actorId: string) {
    const titles = dto.taskTitles?.length ? dto.taskTitles : DEFAULT_TASKS;
    const created = await this.prisma.offboardingCase.create({
      data: {
        employeeId: dto.employeeId,
        reason: dto.reason,
        lastWorkingDay: new Date(dto.lastWorkingDay),
        notes: dto.notes,
        createdById: actorId,
        tasks: { create: titles.map((title) => ({ title })) },
      },
      include: caseInclude,
    });
    await this.audit.write({ entityType: "OffboardingCase", entityId: created.id, action: "CREATE", userId: actorId, after: created });
    return created;
  }

  /** Marking the last open task DONE completes the case and deactivates the employee. */
  async updateTask(taskId: string, dto: UpdateOffboardingTaskDto, actorId: string) {
    const task = await this.prisma.offboardingTask.findUniqueOrThrow({ where: { id: taskId } });
    const updated = await this.prisma.offboardingTask.update({
      where: { id: taskId },
      data: { status: dto.status, completedAt: dto.status === "DONE" ? new Date() : null },
    });

    const siblings = await this.prisma.offboardingTask.findMany({ where: { caseId: task.caseId } });
    const allDone = siblings.every((t) => (t.id === taskId ? dto.status === "DONE" : t.status === "DONE"));
    if (allDone) {
      const hrCase = await this.prisma.offboardingCase.update({
        where: { id: task.caseId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
      await this.prisma.employee.update({ where: { id: hrCase.employeeId }, data: { status: "INACTIVE", updatedById: actorId } });
    }

    await this.audit.write({ entityType: "OffboardingTask", entityId: taskId, action: "UPDATE", userId: actorId, before: task, after: updated });
    return this.get(task.caseId);
  }
}
