import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/** DB-backed notifications for Milestone 1. Push/email/WhatsApp adapters are a Phase 2 addition — the
 * `channel` column already exists on the model so this service's callers don't need to change later. */
@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async notify(userId: string, params: { type: string; title: string; body?: string; entityType?: string; entityId?: string }) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: params.type,
        title: params.title,
        body: params.body,
        entityType: params.entityType,
        entityId: params.entityId,
      },
    });
  }

  async notifyMany(userIds: string[], params: { type: string; title: string; body?: string; entityType?: string; entityId?: string }) {
    const unique = Array.from(new Set(userIds));
    await Promise.all(unique.map((userId) => this.notify(userId, params)));
  }
}
