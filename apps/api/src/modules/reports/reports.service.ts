import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { dateOnly } from "../../common/util/date-only";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dailyActivity(farmId: string, date?: string) {
    const day = date ? new Date(date) : dateOnly();
    const [tasks, attendance] = await Promise.all([
      this.prisma.task.findMany({ where: { farmId, date: day }, include: { assignments: { where: { isActive: true } } } }),
      this.prisma.attendance.findMany({ where: { farmId, date: day } }),
    ]);
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      byCategory[t.category] = (byCategory[t.category] ?? 0) + 1;
    }
    const present = attendance.filter((a) => ["PRESENT", "OVERTIME"].includes(a.status)).length;
    return {
      date: day,
      taskCount: tasks.length,
      byStatus,
      byCategory,
      workersPresent: present,
      workersTotal: attendance.length,
      tasks: tasks.map((t) => ({ taskNumber: t.taskNumber, category: t.category, status: t.status, priority: t.priority, assignedCount: t.assignments.length })),
    };
  }

  async inventoryMovement(params: { itemId?: string; dateFrom?: string; dateTo?: string }) {
    const movements = await this.prisma.stockMovement.findMany({
      where: {
        ...(params.itemId ? { itemId: params.itemId } : {}),
        ...(params.dateFrom || params.dateTo
          ? { occurredAt: { ...(params.dateFrom ? { gte: new Date(params.dateFrom) } : {}), ...(params.dateTo ? { lte: new Date(params.dateTo) } : {}) } }
          : {}),
      },
      orderBy: { occurredAt: "desc" },
      take: 500,
    });
    const itemIds = [...new Set(movements.map((m) => m.itemId))];
    const items = await this.prisma.inventoryItem.findMany({ where: { id: { in: itemIds } } });
    const itemById = new Map(items.map((i) => [i.id, i]));
    return movements.map((m) => ({ ...m, itemName: itemById.get(m.itemId)?.name ?? m.itemId }));
  }

  async harvestForecastVsActual(farmId: string) {
    const cycles = await this.prisma.cropCycle.findMany({
      where: { farmId },
      include: { crop: true, variety: true, harvestForecasts: true, harvestBatches: true },
    });
    return cycles
      .filter((c) => c.harvestForecasts.length || c.harvestBatches.length)
      .map((c) => {
        const expected = c.harvestForecasts.reduce((s, f) => s + f.expectedQuantity, 0);
        const net = c.harvestBatches.reduce((s, b) => s + b.netQuantity, 0);
        return {
          crop: c.crop.name,
          variety: c.variety?.name ?? null,
          expected,
          actual: net,
          variancePercent: expected > 0 ? Math.round(((net - expected) / expected) * 1000) / 10 : null,
        };
      });
  }

  async expenseSummary(farmId: string, dateFrom?: string, dateTo?: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        farmId,
        ...(dateFrom || dateTo ? { date: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } } : {}),
      },
    });
    const byCategory: Record<string, number> = {};
    let total = 0;
    let missingReceipt = 0;
    for (const e of expenses) {
      const amount = Number(e.amount);
      byCategory[e.category] = (byCategory[e.category] ?? 0) + amount;
      total += amount;
      if (!e.receiptMediaId) missingReceipt++;
    }
    return { total, byCategory, count: expenses.length, missingReceiptCount: missingReceipt };
  }
}
