import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { ReportsService } from "./reports.service";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get("daily-activity")
  @RequirePermissions(PERMISSIONS.REPORT_VIEW, PERMISSIONS.DASHBOARD_MANAGEMENT, PERMISSIONS.DASHBOARD_FARM_MANAGER)
  dailyActivity(@Query("farmId") farmId: string, @Query("date") date?: string) {
    return this.service.dailyActivity(farmId, date);
  }

  @Get("inventory-movement")
  @RequirePermissions(PERMISSIONS.REPORT_VIEW, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE)
  inventoryMovement(@Query("itemId") itemId?: string, @Query("dateFrom") dateFrom?: string, @Query("dateTo") dateTo?: string) {
    return this.service.inventoryMovement({ itemId, dateFrom, dateTo });
  }

  @Get("harvest-forecast-vs-actual")
  @RequirePermissions(PERMISSIONS.REPORT_VIEW, PERMISSIONS.HARVEST_MANAGE)
  harvestForecastVsActual(@Query("farmId") farmId: string) {
    return this.service.harvestForecastVsActual(farmId);
  }

  @Get("expense-summary")
  @RequirePermissions(PERMISSIONS.REPORT_VIEW, PERMISSIONS.EXPENSES_MANAGE, PERMISSIONS.EXPENSES_APPROVE)
  expenseSummary(@Query("farmId") farmId: string, @Query("dateFrom") dateFrom?: string, @Query("dateTo") dateTo?: string) {
    return this.service.expenseSummary(farmId, dateFrom, dateTo);
  }
}
