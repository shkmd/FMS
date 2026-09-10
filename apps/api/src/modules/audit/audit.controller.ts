import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PERMISSIONS } from "@fms/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";

@ApiTags("audit")
@Controller("audit-logs")
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_VIEW)
  async list(
    @Query("entityType") entityType?: string,
    @Query("entityId") entityId?: string,
    @Query("take") take?: string,
  ) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(entityType ? { entityType } : {}),
        ...(entityId ? { entityId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: take ? Number(take) : 100,
    });
  }
}
