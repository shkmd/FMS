import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { TasksService } from "../tasks/tasks.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateActivityDto, CreateCropCalendarDto } from "./dto/crop-calendar.dto";

@Injectable()
export class CropCalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly tasks: TasksService,
  ) {}

  listCalendars(cropId?: string) {
    return this.prisma.cropCalendar.findMany({
      where: { ...(cropId ? { cropId } : {}) },
      include: { crop: true, variety: true, activities: { orderBy: { dayOffset: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async createCalendar(dto: CreateCropCalendarDto, actor: AuthenticatedUser) {
    const calendar = await this.prisma.cropCalendar.create({ data: { ...dto, createdById: actor.id, updatedById: actor.id } });
    await this.audit.write({ entityType: "CropCalendar", entityId: calendar.id, action: "CREATE", userId: actor.id, after: calendar });
    return calendar;
  }

  createActivity(dto: CreateActivityDto) {
    return this.prisma.cropActivity.create({ data: dto });
  }

  /**
   * Turns a calendar's activity templates into real, schedulable Task rows for one crop cycle — reuses
   * TasksService.create() (not a parallel task-creation path) so every generated task gets the same
   * numbering, audit trail, and approval workflow as a manually created one.
   */
  async generateTasksForCropCycle(cropCycleId: string, actor: AuthenticatedUser) {
    const cycle = await this.prisma.cropCycle.findUnique({
      where: { id: cropCycleId },
      include: { cultivationBlock: { include: { plot: true, subPlot: true } }, cropCalendar: { include: { activities: true } } },
    });
    if (!cycle) throw new BadRequestException("Crop cycle not found");
    if (!cycle.cropCalendarId || !cycle.cropCalendar) {
      throw new BadRequestException("This crop cycle has no crop calendar attached — link one before generating tasks");
    }
    if (!cycle.sownDate) {
      throw new BadRequestException("This crop cycle has no sown date yet — set one before generating calendar tasks");
    }

    const farmAreaId = cycle.cultivationBlock.plot.farmAreaId;
    if (!farmAreaId) {
      throw new BadRequestException("The plot for this crop cycle has no farm area linked — cannot place tasks on the board");
    }

    const created = [];
    for (const activity of cycle.cropCalendar.activities) {
      const dueDate = new Date(cycle.sownDate);
      dueDate.setUTCDate(dueDate.getUTCDate() + activity.dayOffset);

      const task = await this.tasks.create(
        {
          date: dueDate.toISOString().slice(0, 10),
          farmAreaId,
          plotId: cycle.cultivationBlock.plotId,
          subPlotId: cycle.cultivationBlock.subPlotId ?? undefined,
          cropCycleId: cycle.id,
          category: activity.activityName,
          description: activity.description ?? `${activity.stageName}: ${activity.activityName}`,
          priority: "MEDIUM",
          requiredInputsNotes: activity.inputsNeeded ?? undefined,
        },
        actor,
      );
      created.push(task);
    }

    await this.audit.write({
      entityType: "CropCycle",
      entityId: cropCycleId,
      action: "GENERATE_CALENDAR_TASKS",
      userId: actor.id,
      after: { count: created.length },
    });

    return created;
  }

  /** Simple compliance view: of the tasks tied to this crop cycle, how many finished on time vs. are overdue. */
  async calendarCompliance(cropCycleId: string) {
    const tasks = await this.prisma.task.findMany({ where: { cropCycleId } });
    const total = tasks.length;
    const completed = tasks.filter((t) => ["COMPLETED", "VERIFIED"].includes(t.status)).length;
    const overdue = tasks.filter((t) => !["COMPLETED", "VERIFIED", "CANCELLED"].includes(t.status) && t.plannedEnd && t.plannedEnd < new Date()).length;
    return {
      total,
      completed,
      overdue,
      compliancePercent: total > 0 ? Math.round((completed / total) * 100) : null,
    };
  }
}
