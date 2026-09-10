import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { TaskStatus } from "@fms/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { findOverlappingAssignment } from "../tasks/task-assignment.util";
import type {
  CreateLabourRequestDto,
  CreateReassignmentRequestDto,
  DecideLabourRequestDto,
  DecideReassignmentRequestDto,
} from "./dto/labour.dto";

@Injectable()
export class LabourService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  // ---- Ad-hoc labour requests (more hands on an existing task) ----

  listLabourRequests(status?: string) {
    return this.prisma.labourRequest.findMany({
      where: { ...(status ? { status: status as any } : {}) },
      include: { task: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createLabourRequest(dto: CreateLabourRequestDto, actor: AuthenticatedUser) {
    const task = await this.prisma.task.findUniqueOrThrow({ where: { id: dto.taskId } });
    const request = await this.prisma.labourRequest.create({
      data: {
        farmId: task.farmId,
        taskId: dto.taskId,
        requestedById: actor.id,
        requestedCount: dto.requestedCount,
        skillsNeeded: dto.skillsNeeded ?? [],
        urgency: dto.urgency ?? "NORMAL",
        notes: dto.notes,
      },
    });
    await this.audit.write({ entityType: "LabourRequest", entityId: request.id, action: "CREATE", userId: actor.id, after: request });
    return request;
  }

  async decideLabourRequest(id: string, dto: DecideLabourRequestDto, actor: AuthenticatedUser) {
    const before = await this.prisma.labourRequest.findUniqueOrThrow({ where: { id } });
    const status = dto.fulfilledCount >= before.requestedCount ? "FULFILLED" : dto.fulfilledCount > 0 ? "PARTIALLY_FULFILLED" : before.status;
    const request = await this.prisma.labourRequest.update({
      where: { id },
      data: { fulfilledCount: dto.fulfilledCount, status: status as any, decidedById: actor.id, decidedAt: new Date(), notes: dto.notes },
    });
    await this.audit.write({ entityType: "LabourRequest", entityId: id, action: "DECIDE", userId: actor.id, before, after: request });
    return request;
  }

  // ---- Reassignment requests (moving an already-assigned worker) ----

  listReassignmentRequests(status?: string) {
    return this.prisma.reassignmentRequest.findMany({
      where: { ...(status ? { status: status as any } : {}) },
      include: { worker: { include: { employee: true } }, fromTask: true, toTask: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createReassignmentRequest(dto: CreateReassignmentRequestDto, actor: AuthenticatedUser) {
    const [fromTask, toTask] = await Promise.all([
      this.prisma.task.findUniqueOrThrow({ where: { id: dto.fromTaskId } }),
      this.prisma.task.findUniqueOrThrow({ where: { id: dto.toTaskId } }),
    ]);

    const activeAssignment = await this.prisma.taskAssignment.findFirst({
      where: { taskId: dto.fromTaskId, workerId: dto.workerId, isActive: true },
    });
    if (!activeAssignment) {
      throw new BadRequestException("This worker does not have an active assignment on the source task");
    }
    if (!["APPROVED", "ASSIGNED"].includes(toTask.status)) {
      throw new BadRequestException("The destination task must be approved before a worker can be moved onto it");
    }

    const request = await this.prisma.reassignmentRequest.create({
      data: {
        farmId: fromTask.farmId,
        workerId: dto.workerId,
        fromTaskId: dto.fromTaskId,
        toTaskId: dto.toTaskId,
        reason: dto.reason,
        urgency: dto.urgency ?? "NORMAL",
        requestedById: actor.id,
        replacementWorkerId: dto.replacementWorkerId,
      },
      include: { worker: { include: { employee: true } }, fromTask: true, toTask: true },
    });
    await this.audit.write({ entityType: "ReassignmentRequest", entityId: request.id, action: "CREATE", userId: actor.id, after: request });
    return request;
  }

  /**
   * Spec §5.3: approving a reassignment pauses/transfers the original task, preserves its assignment
   * history (we deactivate rather than delete the old TaskAssignment row), and notifies both
   * supervisors. Rejecting changes nothing about the underlying tasks.
   */
  async decideReassignmentRequest(id: string, dto: DecideReassignmentRequestDto, actor: AuthenticatedUser) {
    const request = await this.prisma.reassignmentRequest.findUnique({
      where: { id },
      include: { fromTask: true, toTask: true },
    });
    if (!request) throw new NotFoundException("Reassignment request not found");
    if (request.status !== "PENDING") throw new BadRequestException("This request has already been decided");

    if (!dto.approve) {
      const rejected = await this.prisma.reassignmentRequest.update({
        where: { id },
        data: { status: "REJECTED", approverId: actor.id, decidedAt: new Date(), notes: dto.notes },
      });
      await this.audit.write({ entityType: "ReassignmentRequest", entityId: id, action: "REJECT", userId: actor.id, before: request, after: rejected });
      return rejected;
    }

    const activeAssignment = await this.prisma.taskAssignment.findFirst({
      where: { taskId: request.fromTaskId, workerId: request.workerId, isActive: true },
    });
    if (!activeAssignment) {
      throw new ConflictException("The worker is no longer actively assigned to the source task — nothing to reassign");
    }

    // If a replacement is taking over, make sure they aren't double-booked either.
    if (request.replacementWorkerId) {
      const replacementActive = await this.prisma.taskAssignment.findMany({
        where: { workerId: request.replacementWorkerId, isActive: true },
        include: { task: true },
      });
      const conflict = findOverlappingAssignment(
        replacementActive.map((a) => ({
          taskId: a.taskId,
          taskDate: a.task.date,
          taskStatus: a.task.status as TaskStatus,
          plannedStart: a.task.plannedStart,
          plannedEnd: a.task.plannedEnd,
        })),
        { taskId: request.fromTaskId, date: request.fromTask.date, plannedStart: request.fromTask.plannedStart, plannedEnd: request.fromTask.plannedEnd },
      );
      if (conflict) throw new ConflictException("The proposed replacement worker is already actively assigned elsewhere at this time");
    }

    // Make sure moving the worker onto toTask doesn't create a conflict there either.
    const workerActive = await this.prisma.taskAssignment.findMany({
      where: { workerId: request.workerId, isActive: true },
      include: { task: true },
    });
    const destinationConflict = findOverlappingAssignment(
      workerActive
        .filter((a) => a.taskId !== request.fromTaskId)
        .map((a) => ({
          taskId: a.taskId,
          taskDate: a.task.date,
          taskStatus: a.task.status as TaskStatus,
          plannedStart: a.task.plannedStart,
          plannedEnd: a.task.plannedEnd,
        })),
      { taskId: request.toTaskId, date: request.toTask.date, plannedStart: request.toTask.plannedStart, plannedEnd: request.toTask.plannedEnd },
    );
    if (destinationConflict) {
      throw new ConflictException("Moving this worker to the destination task would create another overlapping assignment");
    }

    const effect = request.replacementWorkerId ? "TRANSFERRED" : "PAUSED";

    await this.prisma.$transaction(async (tx) => {
      await tx.taskAssignment.update({
        where: { id: activeAssignment.id },
        data: { isActive: false, unassignedAt: new Date() },
      });

      if (request.fromTask.status === "IN_PROGRESS" && effect === "PAUSED") {
        await tx.task.update({ where: { id: request.fromTaskId }, data: { status: "PAUSED", updatedById: actor.id } });
      }

      if (request.replacementWorkerId) {
        await tx.taskAssignment.create({
          data: { taskId: request.fromTaskId, workerId: request.replacementWorkerId, assignedById: actor.id, notes: "Replacement via reassignment" },
        });
      }

      await tx.taskAssignment.create({
        data: { taskId: request.toTaskId, workerId: request.workerId, assignedById: actor.id, notes: `Reassigned from task ${request.fromTaskId}` },
      });

      if (request.toTask.status === "APPROVED") {
        await tx.task.update({ where: { id: request.toTaskId }, data: { status: "ASSIGNED", updatedById: actor.id } });
      }

      await tx.reassignmentRequest.update({
        where: { id },
        data: { status: "APPROVED", approverId: actor.id, decidedAt: new Date(), effectOnOriginalTask: effect, notes: dto.notes },
      });
    });

    const updated = await this.prisma.reassignmentRequest.findUniqueOrThrow({
      where: { id },
      include: { worker: { include: { employee: true } }, fromTask: true, toTask: true },
    });

    await this.audit.write({
      entityType: "ReassignmentRequest",
      entityId: id,
      action: "APPROVE",
      userId: actor.id,
      before: request,
      after: updated,
    });

    const supervisorIds = [request.fromTask.assignedSupervisorId, request.toTask.assignedSupervisorId].filter(
      (v): v is string => !!v,
    );
    if (supervisorIds.length) {
      await this.notifications.notifyMany(supervisorIds, {
        type: "REASSIGNMENT_APPROVED",
        title: `Worker reassigned from ${request.fromTask.taskNumber} to ${request.toTask.taskNumber}`,
        entityType: "ReassignmentRequest",
        entityId: id,
      });
    }

    return updated;
  }
}
