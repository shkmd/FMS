import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { CropCalendarService } from "./crop-calendar.service";
import { CreateActivityDto, CreateCropCalendarDto } from "./dto/crop-calendar.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("crop-calendar")
@Controller()
export class CropCalendarController {
  constructor(private readonly service: CropCalendarService) {}

  @Get("crop-calendars")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE, PERMISSIONS.FARM_VIEW)
  listCalendars(@Query("cropId") cropId?: string) {
    return this.service.listCalendars(cropId);
  }

  @Post("crop-calendars")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE)
  createCalendar(@Body() dto: CreateCropCalendarDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.createCalendar(dto, actor);
  }

  @Post("crop-activities")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE)
  createActivity(@Body() dto: CreateActivityDto) {
    return this.service.createActivity(dto);
  }

  @Post("crop-cycles/:cropCycleId/generate-calendar-tasks")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE)
  generateTasks(@Param("cropCycleId") cropCycleId: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.generateTasksForCropCycle(cropCycleId, actor);
  }

  @Get("crop-cycles/:cropCycleId/calendar-compliance")
  @RequirePermissions(PERMISSIONS.CROP_CALENDAR_MANAGE, PERMISSIONS.FARM_VIEW)
  calendarCompliance(@Param("cropCycleId") cropCycleId: string) {
    return this.service.calendarCompliance(cropCycleId);
  }
}
