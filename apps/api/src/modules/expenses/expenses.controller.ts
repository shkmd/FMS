import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto, CreatePettyCashDto } from "./dto/expenses.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("expenses")
@Controller()
export class ExpensesController {
  constructor(private readonly service: ExpensesService) {}

  @Get("expenses")
  @RequirePermissions(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_APPROVE)
  listExpenses(@Query("status") status?: string) {
    return this.service.listExpenses(status);
  }

  @Post("expenses")
  @RequirePermissions(PERMISSIONS.EXPENSES_MANAGE)
  createExpense(@Body() dto: CreateExpenseDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createExpense(dto, actor);
  }

  @Patch("expenses/:id/decide")
  @RequirePermissions(PERMISSIONS.EXPENSES_APPROVE)
  decideExpense(@Param("id") id: string, @Body("approve") approve: boolean, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.decideExpense(id, approve, actor);
  }

  @Get("petty-cash")
  @RequirePermissions(PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_APPROVE)
  listPettyCash(@Query("farmId") farmId?: string) {
    return this.service.listPettyCash(farmId);
  }

  @Post("petty-cash")
  @RequirePermissions(PERMISSIONS.EXPENSES_MANAGE)
  recordPettyCash(@Body() dto: CreatePettyCashDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.recordPettyCash(dto, actor);
  }
}
