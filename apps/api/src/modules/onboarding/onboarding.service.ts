import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateOnboardingCaseDto, UpdateOnboardingTaskDto } from "./dto/onboarding.dto";

const DEFAULT_TASKS = [
  "Collect HR paperwork and identity documents",
  "Issue equipment / uniform / access",
  "Site induction and safety briefing",
  "Assign supervisor and first task",
];

const caseInclude = { employee: true, tasks: { orderBy: { title: "asc" as const } } };

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list() {
    return this.prisma.onboardingCase.findMany({ include: caseInclude, orderBy: { createdAt: "desc" } });
  }

  async get(id: string) {
    const found = await this.prisma.onboardingCase.findUnique({ where: { id }, include: caseInclude });
    if (!found) throw new NotFoundException("Onboarding case not found");
    return found;
  }

  async create(dto: CreateOnboardingCaseDto, actorId: string) {
    const titles = dto.taskTitles?.length ? dto.taskTitles : DEFAULT_TASKS;
    const created = await this.prisma.onboardingCase.create({
      data: {
        employeeId: dto.employeeId,
        startDate: new Date(dto.startDate),
        createdById: actorId,
        tasks: { create: titles.map((title) => ({ title })) },
      },
      include: caseInclude,
    });
    await this.audit.write({ entityType: "OnboardingCase", entityId: created.id, action: "CREATE", userId: actorId, after: created });
    return created;
  }

  /** Marking the last open task DONE completes the case. */
  async updateTask(taskId: string, dto: UpdateOnboardingTaskDto, actorId: string) {
    const task = await this.prisma.onboardingTask.findUniqueOrThrow({ where: { id: taskId } });
    const updated = await this.prisma.onboardingTask.update({
      where: { id: taskId },
      data: { status: dto.status, completedAt: dto.status === "DONE" ? new Date() : null },
    });

    const siblings = await this.prisma.onboardingTask.findMany({ where: { caseId: task.caseId } });
    const allDone = siblings.every((t) => (t.id === taskId ? dto.status === "DONE" : t.status === "DONE"));
    if (allDone) {
      await this.prisma.onboardingCase.update({ where: { id: task.caseId }, data: { status: "COMPLETED", completedAt: new Date() } });
    }

    await this.audit.write({ entityType: "OnboardingTask", entityId: taskId, action: "UPDATE", userId: actorId, before: task, after: updated });
    return this.get(task.caseId);
  }
}
