import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../common/prisma/prisma.service";
import { NotificationsService } from "../common/notifications/notifications.service";
import { dateOnly } from "../common/util/date-only";

const ACTIVE_STATUSES = ["ASSIGNED", "IN_PROGRESS", "PAUSED", "BLOCKED"] as const;

/**
 * Background jobs run in-process via @nestjs/schedule rather than a Redis-backed queue — Milestone 1
 * only needs two lightweight, farm-scale cron sweeps, and this keeps the alert pipeline working even if
 * Redis/BullMQ (already wired for Phase 2 job types) is briefly unavailable.
 */
@Injectable()
export class ScheduledJobsService {
  private readonly logger = new Logger(ScheduledJobsService.name);

  constructor(private readonly prisma: PrismaService, private readonly notifications: NotificationsService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async scanOverdueTasks() {
    const overdue = await this.prisma.task.findMany({
      where: { status: { in: ACTIVE_STATUSES as any }, plannedEnd: { lt: new Date() } },
    });

    for (const task of overdue) {
      const already = await this.prisma.notification.findFirst({
        where: { type: "TASK_OVERDUE", entityType: "Task", entityId: task.id },
      });
      if (already || !task.assignedSupervisorId) continue;
      await this.notifications.notify(task.assignedSupervisorId, {
        type: "TASK_OVERDUE",
        title: `Task ${task.taskNumber} is overdue`,
        entityType: "Task",
        entityId: task.id,
      });
    }
    if (overdue.length) this.logger.log(`Overdue task scan: ${overdue.length} task(s) past planned end`);
  }

  @Cron("0 21 * * *")
  async remindIncompleteTasksAtEndOfDay() {
    const incomplete = await this.prisma.task.findMany({
      where: { date: dateOnly(), status: { in: ACTIVE_STATUSES as any } },
    });

    for (const task of incomplete) {
      if (!task.assignedSupervisorId) continue;
      await this.notifications.notify(task.assignedSupervisorId, {
        type: "TASK_NEEDS_CARRY_FORWARD",
        title: `Task ${task.taskNumber} is still open — mark complete or carry it forward`,
        entityType: "Task",
        entityId: task.id,
      });
    }
    if (incomplete.length) this.logger.log(`End-of-day sweep: ${incomplete.length} task(s) still open`);
  }
}
