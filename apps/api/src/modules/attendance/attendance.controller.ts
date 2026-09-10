import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { AttendanceService } from "./attendance.service";
import { CorrectAttendanceDto, MarkAttendanceDto } from "./dto/attendance.dto";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

@ApiTags("attendance")
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.ATTENDANCE_VIEW)
  list(@Query("date") date?: string, @Query("workerId") workerId?: string, @Query("farmAreaId") farmAreaId?: string) {
    return this.service.list({ date, workerId, farmAreaId });
  }

  @Get("pending-corrections")
  @RequirePermissions(PERMISSIONS.ATTENDANCE_APPROVE_CORRECTION)
  pendingCorrections() {
    return this.service.pendingCorrections();
  }

  @Post("mark")
  @RequirePermissions(PERMISSIONS.ATTENDANCE_MARK_OWN, PERMISSIONS.ATTENDANCE_MARK_OTHERS)
  mark(@Body() dto: MarkAttendanceDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.mark(dto, actor.id);
  }

  @Patch(":id/correct")
  @RequirePermissions(PERMISSIONS.ATTENDANCE_CORRECT, PERMISSIONS.ATTENDANCE_MARK_OTHERS)
  correct(@Param("id") id: string, @Body() dto: CorrectAttendanceDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.correct(id, dto, actor.id);
  }

  @Patch(":id/approve-correction")
  @RequirePermissions(PERMISSIONS.ATTENDANCE_APPROVE_CORRECTION)
  approveCorrection(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.service.approveCorrection(id, actor.id);
  }
}
