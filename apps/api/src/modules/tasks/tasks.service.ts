import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PERMISSIONS, TaskStatus as TaskStatusValues } from "@fms/shared";
import type { TaskStatus } from "@fms/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { assertTransition } from "./task-state-machine";
import { findOverlappingAssignment } from "./task-assignment.util";
import { generateTaskNumber } from "./task-number.util";
import type {
  AddEvidenceDto,
  AssignWorkerDto,
  CancelTaskDto,
  CarryForwardDto,
  CreateTaskDto,
  RecordProgressDto,
  UpdateTaskDto,
} from "./dto/task.dto";

const taskInclude = {
  assignments: { include: { worker: { include: { employee: true } } } },
  progressLogs: { orderBy: { recordedAt: "desc" as const } },
  evidence: true,
  dependsOn: { include: { prerequisiteTask: true } },
  machinery: { include: { asset: true } },
} as const;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(filters: {
    farmId?: string;
    date?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    farmAreaId?: string;
    supervisorId?: string;
    workerId?: string;
  }) {
    const where: any = {
      deletedAt: null,
      ...(filters.farmId ? { farmId: filters.farmId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.farmAreaId ? { farmAreaId: filters.farmAreaId } : {}),
      ...(filters.supervisorId ? { assignedSupervisorId: filters.supervisorId } : {}),
    };
    if (filters.date) where.date = new Date(filters.date);
    else if (filters.dateFrom || filters.dateTo) {
      where.date = {
        ...(filters.dateFrom ? { gte: new Date(filters.dateFrom) } : {}),
        ...(filters.dateTo ? { lte: new Date(filters.dateTo) } : {}),
      };
    }
    if (filters.workerId) {
      where.assignments = { some: { workerId: filters.workerId, isActive: true } };
    }

    return this.prisma.task.findMany({
      where,
      include: taskInclude,
      orderBy: [{ date: "desc" }, { priority: "asc" }],
    });
  }

  async getOne(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id }, include: taskInclude });
    if (!task || task.deletedAt) throw new NotFoundException("Task not found");
    return task;
  }

  async create(dto: CreateTaskDto, actor: AuthenticatedUser) {
    const farmArea = await this.prisma.farmArea.findUniqueOrThrow({ where: { id: dto.farmAreaId } });
    const date = new Date(dto.date);

    const task = await this.prisma.task.create({
      data: {
        farmId: farmArea.farmId,
        taskNumber: generateTaskNumber(date),
        date,
        farmAreaId: dto.farmAreaId,
        plotId: dto.plotId,
        subPlotId: dto.subPlotId,
        cropCycleId: dto.cropCycleId,
        category: dto.category,
        description: dto.description,
        priority: dto.priority ?? "MEDIUM",
        requestedWorkers: dto.requestedWorkers ?? 1,
        requiredSkills: dto.requiredSkills ?? [],
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        expectedOutput: dto.expectedOutput,
        requiredInputsNotes: dto.requiredInputsNotes,
        assignedSupervisorId: dto.assignedSupervisorId,
        safetyNotes: dto.safetyNotes,
        requiresEvidence: dto.requiresEvidence ?? false,
        status: "DRAFT",
        createdById: actor.id,
        updatedById: actor.id,
        dependsOn: dto.dependsOnTaskIds?.length
          ? { create: dto.dependsOnTaskIds.map((prerequisiteTaskId) => ({ prerequisiteTaskId })) }
          : undefined,
        machinery: dto.machineryAssetIds?.length
          ? { create: dto.machineryAssetIds.map((assetId) => ({ assetId })) }
          : undefined,
      },
      include: taskInclude,
    });
    await this.audit.write({ entityType: "Task", entityId: task.id, action: "CREATE", userId: actor.id, farmId: task.farmId, after: task });
    return task;
  }

  async update(id: string, dto: UpdateTaskDto, actor: AuthenticatedUser) {
    const before = await this.getOne(id);
    if (!["DRAFT", "SUBMITTED"].includes(before.status)) {
      throw new BadRequestException("Only draft or submitted tasks can be edited directly; use progress/reassignment actions instead");
    }
    const task = await this.prisma.task.update({
      where: { id },
      data: {
        category: dto.category,
        description: dto.description,
        priority: dto.priority,
        requestedWorkers: dto.requestedWorkers,
        requiredSkills: dto.requiredSkills,
        plannedStart: dto.plannedStart ? new Date(dto.plannedStart) : undefined,
        plannedEnd: dto.plannedEnd ? new Date(dto.plannedEnd) : undefined,
        expectedOutput: dto.expectedOutput,
        requiredInputsNotes: dto.requiredInputsNotes,
        assignedSupervisorId: dto.assignedSupervisorId,
        safetyNotes: dto.safetyNotes,
        requiresEvidence: dto.requiresEvidence,
        updatedById: actor.id,
      },
      include: taskInclude,
    });
    await this.audit.write({ entityType: "Task", entityId: id, action: "UPDATE", userId: actor.id, before, after: task });
    return task;
  }

  async submit(id: string, actor: AuthenticatedUser) {
    return this.transition(id, "SUBMITTED", actor, "SUBMIT");
  }

  async approve(id: string, actor: AuthenticatedUser) {
    const task = await this.getOne(id);
    if (task.priority === "CRITICAL" && !actor.permissions.includes(PERMISSIONS.TASK_APPROVE_CRITICAL) && !actor.permissions.includes(PERMISSIONS.PLATFORM_MANAGE)) {
      throw new ForbiddenException("Critical-priority tasks require Farm Manager approval");
    }
    assertTransition(task.status as TaskStatus, "APPROVED");
    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: "APPROVED", approvedById: actor.id, approvedAt: new Date(), updatedById: actor.id },
      include: taskInclude,
    });
    await this.audit.write({ entityType: "Task", entityId: id, action: "APPROVE", userId: actor.id, before: task, after: updated });
    if (task.createdById) await this.notifications.notify(task.createdById, { type: "TASK_APPROVED", title: `Task ${task.taskNumber} approved`, entityType: "Task", entityId: id });
    return updated;
  }

  async rejectToDraft(id: string, actor: AuthenticatedUser) {
    return this.transition(id, "DRAFT", actor, "REJECT");
  }

  private async transition(id: string, to: TaskStatus, actor: AuthenticatedUser, action: string) {
    const task = await this.getOne(id);
    assertTransition(task.status as TaskStatus, to);
    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: to, updatedById: actor.id },
      include: taskInclude,
    });
    await this.audit.write({ entityType: "Task", entityId: id, action, userId: actor.id, before: task, after: updated });
    return updated;
  }

  async assignWorker(taskId: string, dto: AssignWorkerDto, actor: AuthenticatedUser) {
    const task = await this.getOne(taskId);
    if (!["APPROVED", "ASSIGNED"].includes(task.status)) {
      throw new BadRequestException("Workers can only be assigned to approved tasks");
    }

    const activeAssignments = await this.prisma.taskAssignment.findMany({
      where: { workerId: dto.workerId, isActive: true },
      include: { task: true },
    });
    const conflict = findOverlappingAssignment(
      activeAssignments.map((a) => ({
        taskId: a.taskId,
        taskDate: a.task.date,
        taskStatus: a.task.status as TaskStatus,
        plannedStart: a.task.plannedStart,
        plannedEnd: a.task.plannedEnd,
      })),
      { taskId, date: task.date, plannedStart: task.plannedStart, plannedEnd: task.plannedEnd },
    );
    if (conflict) {
      throw new ConflictException(
        `Worker is already actively assigned to task ${conflict.taskId} on this date/time. Use a reassignment request to move them.`,
      );
    }

    const assignment = await this.prisma.taskAssignment.create({
      data: {
        taskId,
        workerId: dto.workerId,
        assignedById: actor.id,
        roleOnTask: dto.roleOnTask,
        hoursPlanned: dto.hoursPlanned,
      },
    });

    if (task.status === "APPROVED") {
      await this.prisma.task.update({ where: { id: taskId }, data: { status: "ASSIGNED", updatedById: actor.id } });
    }

    await this.audit.write({ entityType: "TaskAssignment", entityId: assignment.id, action: "CREATE", userId: actor.id, after: assignment });
    return this.getOne(taskId);
  }

  async removeAssignment(taskId: string, assignmentId: string, actor: AuthenticatedUser) {
    const task = await this.getOne(taskId);
    if (!["APPROVED", "ASSIGNED"].includes(task.status)) {
      throw new BadRequestException("An in-progress or paused assignment can only be moved via a reassignment request");
    }
    const assignment = await this.prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false, unassignedAt: new Date() },
    });
    await this.audit.write({ entityType: "TaskAssignment", entityId: assignmentId, action: "REMOVE", userId: actor.id, before: assignment });
    return this.getOne(taskId);
  }

  async recordProgress(taskId: string, dto: RecordProgressDto, actor: AuthenticatedUser) {
    const task = await this.getOne(taskId);
    const statusTo = dto.statusTo as TaskStatus;
    if (!(TaskStatusValues as readonly string[]).includes(statusTo)) {
      throw new BadRequestException(`Unknown status: ${dto.statusTo}`);
    }
    assertTransition(task.status as TaskStatus, statusTo);

    if (statusTo === "COMPLETED" && task.requiresEvidence && task.evidence.length === 0) {
      throw new BadRequestException("This task requires photo/quantity evidence before it can be marked complete");
    }

    const [progress, updated] = await this.prisma.$transaction([
      this.prisma.taskProgress.create({
        data: {
          taskId,
          recordedById: actor.id,
          statusFrom: task.status,
          statusTo,
          quantityCompleted: dto.quantityCompleted,
          unit: dto.unit,
          notes: dto.notes,
          gpsLat: dto.gpsLat,
          gpsLng: dto.gpsLng,
        },
      }),
      this.prisma.task.update({ where: { id: taskId }, data: { status: statusTo, updatedById: actor.id }, include: taskInclude }),
    ]);

    await this.audit.write({
      entityType: "Task",
      entityId: taskId,
      action: `PROGRESS_${statusTo}`,
      userId: actor.id,
      before: { status: task.status },
      after: { status: statusTo, progress },
    });

    if (statusTo === "COMPLETED" && task.assignedSupervisorId) {
      await this.notifications.notify(task.assignedSupervisorId, {
        type: "TASK_COMPLETED",
        title: `Task ${task.taskNumber} marked complete`,
        entityType: "Task",
        entityId: taskId,
      });
    }
    if (statusTo === "BLOCKED" && task.assignedSupervisorId) {
      await this.notifications.notify(task.assignedSupervisorId, {
        type: "TASK_BLOCKED",
        title: `Task ${task.taskNumber} is blocked`,
        body: dto.notes,
        entityType: "Task",
        entityId: taskId,
      });
    }

    return updated;
  }

  async addEvidence(taskId: string, dto: AddEvidenceDto, actor: AuthenticatedUser) {
    await this.getOne(taskId);
    const evidence = await this.prisma.taskEvidence.create({
      data: { taskId, mediaFileId: dto.mediaFileId, uploadedById: actor.id, caption: dto.caption },
    });
    return evidence;
  }

  async cancel(taskId: string, dto: CancelTaskDto, actor: AuthenticatedUser) {
    const task = await this.transition(taskId, "CANCELLED", actor, "CANCEL");
    await this.audit.write({ entityType: "Task", entityId: taskId, action: "CANCEL_REASON", userId: actor.id, after: { reason: dto.reason } });
    return task;
  }

  async verify(taskId: string, actor: AuthenticatedUser) {
    return this.transition(taskId, "VERIFIED", actor, "VERIFY");
  }

  /**
   * End-of-day: an incomplete task (paused/blocked) is marked carried_forward and a fresh task is
   * spawned for the next day, already approved (the work was vetted once), needing fresh assignment.
   */
  async carryForward(taskId: string, dto: CarryForwardDto, actor: AuthenticatedUser) {
    const task = await this.getOne(taskId);
    assertTransition(task.status as TaskStatus, "CARRIED_FORWARD");

    // task.date is a UTC-midnight-anchored @db.Date value — advance it with UTC methods, not local
    // setDate(), so this is correct regardless of the server's timezone.
    const nextDate = new Date(task.date);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);

    const [, newTask] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: { status: "CARRIED_FORWARD", carriedForwardReason: dto.reason, updatedById: actor.id },
      }),
      this.prisma.task.create({
        data: {
          farmId: task.farmId,
          taskNumber: generateTaskNumber(nextDate),
          date: nextDate,
          farmAreaId: task.farmAreaId,
          plotId: task.plotId,
          subPlotId: task.subPlotId,
          cropCycleId: task.cropCycleId,
          category: task.category,
          description: task.description,
          priority: task.priority,
          requestedWorkers: task.requestedWorkers,
          requiredSkills: task.requiredSkills,
          expectedOutput: task.expectedOutput,
          requiredInputsNotes: task.requiredInputsNotes,
          assignedSupervisorId: task.assignedSupervisorId,
          safetyNotes: task.safetyNotes,
          requiresEvidence: task.requiresEvidence,
          status: "APPROVED",
          approvedById: actor.id,
          approvedAt: new Date(),
          carriedForwardFromId: taskId,
          createdById: actor.id,
          updatedById: actor.id,
        },
      }),
    ]);

    await this.audit.write({
      entityType: "Task",
      entityId: taskId,
      action: "CARRY_FORWARD",
      userId: actor.id,
      before: { status: task.status },
      after: { status: "CARRIED_FORWARD", newTaskId: newTask.id, reason: dto.reason },
    });

    return this.getOne(taskId);
  }
}
