import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { dateOnly } from "../../common/util/date-only";

// "Today" as a real-time instant range (for DateTime columns like createdAt), anchored to the
// server's local timezone — distinct from `dateOnly()`, which is for @db.Date columns.
function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async management(farmId: string) {
    const today = startOfDay();
    const todayDate = dateOnly();
    const [statusCounts, farmAreaCounts, reassignmentsToday, workerCount, presentToday, recentEvidence, pendingApprovals] =
      await Promise.all([
        this.prisma.task.groupBy({ by: ["status"], where: { farmId, date: todayDate }, _count: true }),
        this.prisma.farmArea.groupBy({ by: ["status"], where: { farmId, deletedAt: null }, _count: true }),
        this.prisma.reassignmentRequest.count({ where: { farmId, createdAt: { gte: today, lte: endOfDay() } } }),
        this.prisma.worker.count({ where: { deletedAt: null, employee: { farmId, status: "ACTIVE" } } }),
        this.prisma.attendance.count({ where: { farmId, date: todayDate, status: { in: ["PRESENT", "OVERTIME"] } } }),
        this.prisma.taskEvidence.findMany({
          where: { task: { farmId } },
          orderBy: { uploadedAt: "desc" },
          take: 8,
          include: { task: true },
        }),
        this.prisma.task.count({ where: { farmId, status: "SUBMITTED" } }),
      ]);

    return {
      date: todayDate,
      taskStatusCounts: Object.fromEntries(statusCounts.map((s) => [s.status, s._count])),
      farmAreaStatusCounts: Object.fromEntries(farmAreaCounts.map((s) => [s.status, s._count])),
      reassignmentsToday,
      workforce: { total: workerCount, presentToday },
      recentEvidence,
      pendingApprovals,
    };
  }

  async farmManager(farmId: string) {
    const todayDate = dateOnly();
    const [pendingApprovals, pendingReassignments, overdueTasks, blockedTasks, carriedForwardToday, pendingLabourRequests] =
      await Promise.all([
        this.prisma.task.findMany({ where: { farmId, status: "SUBMITTED" }, orderBy: { priority: "asc" } }),
        this.prisma.reassignmentRequest.findMany({
          where: { farmId, status: "PENDING" },
          include: { worker: { include: { employee: true } }, fromTask: true, toTask: true },
        }),
        this.prisma.task.findMany({
          where: {
            farmId,
            status: { in: ["ASSIGNED", "IN_PROGRESS", "PAUSED", "BLOCKED"] },
            plannedEnd: { lt: new Date() },
          },
        }),
        this.prisma.task.findMany({ where: { farmId, status: "BLOCKED" } }),
        this.prisma.task.count({ where: { farmId, status: "CARRIED_FORWARD", date: todayDate } }),
        this.prisma.labourRequest.findMany({ where: { farmId, status: "PENDING" }, include: { task: true } }),
      ]);

    return { pendingApprovals, pendingReassignments, overdueTasks, blockedTasks, carriedForwardToday, pendingLabourRequests };
  }

  async supervisor(supervisorId: string) {
    const todayDate = dateOnly();
    const [todayTasks, openIssuesCount] = await Promise.all([
      this.prisma.task.findMany({
        where: { assignedSupervisorId: supervisorId, date: todayDate },
        include: { assignments: { where: { isActive: true }, include: { worker: { include: { employee: true } } } } },
        orderBy: { priority: "asc" },
      }),
      this.prisma.issue.count({ where: { assignedToId: supervisorId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    ]);

    const completed = todayTasks.filter((t) => ["COMPLETED", "VERIFIED"].includes(t.status)).length;
    const completionRate = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;

    return { todayTasks, completionRate, openIssuesCount };
  }
}
