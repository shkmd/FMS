import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { nextPettyCashBalance } from "./petty-cash.util";
import type { CreateExpenseDto, CreatePettyCashDto } from "./dto/expenses.dto";

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  listExpenses(status?: string) {
    return this.prisma.expense.findMany({
      where: { ...(status ? { financeStatus: status as any } : {}) },
      include: { vendor: true },
      orderBy: { date: "desc" },
    });
  }

  async createExpense(dto: CreateExpenseDto, actor: AuthenticatedUser) {
    const expenseNumber = `EXP-${Date.now().toString(36).toUpperCase()}`;
    const expense = await this.prisma.expense.create({
      data: { ...dto, expenseNumber, date: dto.date ? new Date(dto.date) : new Date(), submittedById: actor.id, financeStatus: "PENDING" },
    });
    await this.audit.write({ entityType: "Expense", entityId: expense.id, action: "CREATE", userId: actor.id, after: expense });

    if (!dto.receiptMediaId) {
      await this.notifications.notify(actor.id, {
        type: "MISSING_RECEIPT",
        title: `Expense ${expenseNumber} submitted without a receipt`,
        entityType: "Expense",
        entityId: expense.id,
      });
    }
    return expense;
  }

  async decideExpense(id: string, approve: boolean, actor: AuthenticatedUser) {
    const before = await this.prisma.expense.findUniqueOrThrow({ where: { id } });
    const expense = await this.prisma.expense.update({
      where: { id },
      data: { financeStatus: approve ? "APPROVED" : "REJECTED", approvedById: actor.id },
    });
    await this.audit.write({ entityType: "Expense", entityId: id, action: approve ? "APPROVE" : "REJECT", userId: actor.id, before, after: expense });
    return expense;
  }

  listPettyCash(farmId?: string) {
    return this.prisma.pettyCashTransaction.findMany({ where: { ...(farmId ? { farmId } : {}) }, orderBy: { date: "desc" } });
  }

  async recordPettyCash(dto: CreatePettyCashDto, actor: AuthenticatedUser) {
    const last = await this.prisma.pettyCashTransaction.findFirst({ where: { farmId: dto.farmId }, orderBy: { date: "desc" } });
    const currentBalance = last ? Number(last.balanceAfter) : 0;

    let balanceAfter: number;
    try {
      balanceAfter = nextPettyCashBalance(currentBalance, dto.type, dto.amount);
    } catch (e) {
      throw new ConflictException(e instanceof Error ? e.message : "Petty cash update failed");
    }

    const tx = await this.prisma.pettyCashTransaction.create({
      data: { farmId: dto.farmId, type: dto.type, amount: dto.amount, relatedExpenseId: dto.relatedExpenseId, balanceAfter, recordedById: actor.id },
    });
    await this.audit.write({ entityType: "PettyCashTransaction", entityId: tx.id, action: "CREATE", userId: actor.id, after: tx });
    return tx;
  }
}
