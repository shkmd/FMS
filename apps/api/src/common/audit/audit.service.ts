import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface AuditWriteInput {
  entityType: string;
  entityId: string;
  action: string;
  userId?: string | null;
  farmId?: string | null;
  before?: unknown;
  after?: unknown;
}

/** Explicit audit trail writes — called from service-layer mutations, not inferred generically, so the
 * before/after snapshots are always meaningful (spec §13: important approvals/edits must be audited). */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async write(input: AuditWriteInput) {
    await this.prisma.auditLog.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        action: input.action,
        userId: input.userId ?? null,
        farmId: input.farmId ?? null,
        beforeJson: input.before === undefined ? undefined : (input.before as any),
        afterJson: input.after === undefined ? undefined : (input.after as any),
      },
    });
  }
}
