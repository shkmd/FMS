import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";
import { CurrentUser } from "../decorators/current-user.decorator";
import type { AuthenticatedUser } from "../types/authenticated-user";

@ApiTags("notifications")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query("unreadOnly") unreadOnly?: string) {
    return this.prisma.notification.findMany({
      where: { userId: user.id, ...(unreadOnly === "true" ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  @Patch(":id/read")
  markRead(@Param("id") id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.prisma.notification.updateMany({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
  }

  @Patch("read-all")
  markAllRead(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } });
  }
}
