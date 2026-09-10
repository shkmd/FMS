import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { InventoryService } from "../inventory/inventory.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import type { CreateDispatchDto, CreateRecipientDto, RecordPodDto } from "./dto/distribution.dto";

function shortCode(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

@Injectable()
export class DistributionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly inventory: InventoryService,
  ) {}

  listRecipients(farmId?: string) {
    return this.prisma.recipient.findMany({ where: { ...(farmId ? { farmId } : {}) }, orderBy: { name: "asc" } });
  }

  createRecipient(dto: CreateRecipientDto) {
    return this.prisma.recipient.create({ data: dto });
  }

  listDispatches(status?: string) {
    return this.prisma.dispatch.findMany({
      where: { ...(status ? { deliveryStatus: status as any } : {}) },
      include: { recipient: true, items: true, pod: true },
      orderBy: { dispatchDate: "desc" },
    });
  }

  /** Spec §13: every dispatch must reduce available inventory. */
  async createDispatch(dto: CreateDispatchDto, actor: AuthenticatedUser) {
    const dispatch = await this.prisma.dispatch.create({
      data: {
        farmId: dto.farmId,
        dispatchNumber: shortCode("DSP"),
        recipientId: dto.recipientId,
        vehicleOrCourier: dto.vehicleOrCourier,
        destination: dto.destination,
        remarks: dto.remarks,
        preparedById: actor.id,
        items: { create: dto.items.map((i) => ({ harvestBatchId: i.harvestBatchId, productionBatchId: i.productionBatchId, quantity: i.quantity, unit: i.unit })) },
      },
      include: { items: true },
    });

    for (const item of dto.items) {
      if (!item.harvestBatchId) continue; // production-batch dispatch reduces finished-goods stock similarly, deferred
      const harvestBatch = await this.prisma.harvestBatch.findUnique({ where: { id: item.harvestBatchId } });
      if (!harvestBatch) continue;
      const invBatch = await this.prisma.inventoryBatch.findFirst({ where: { batchNumber: harvestBatch.batchNumber, status: "active" } });
      if (!invBatch) {
        throw new BadRequestException(`No inventory stock found for harvest batch ${harvestBatch.batchNumber} — has it been received into store yet?`);
      }
      await this.inventory.issueStock({ batchId: invBatch.id, quantity: item.quantity, movementType: "DISPATCH" }, actor);
    }

    await this.audit.write({ entityType: "Dispatch", entityId: dispatch.id, action: "CREATE", userId: actor.id, after: dispatch });
    return dispatch;
  }

  async recordProofOfDelivery(dispatchId: string, dto: RecordPodDto, actor: AuthenticatedUser) {
    const dispatch = await this.prisma.dispatch.findUnique({ where: { id: dispatchId } });
    if (!dispatch) throw new NotFoundException("Dispatch not found");

    const [pod] = await this.prisma.$transaction([
      this.prisma.proofOfDelivery.upsert({
        where: { dispatchId },
        create: { dispatchId, receivedByName: dto.receivedByName, notes: dto.notes, deliveredAt: new Date() },
        update: { receivedByName: dto.receivedByName, notes: dto.notes, deliveredAt: new Date() },
      }),
      this.prisma.dispatch.update({ where: { id: dispatchId }, data: { deliveryStatus: "DELIVERED" } }),
    ]);

    await this.audit.write({ entityType: "ProofOfDelivery", entityId: pod.id, action: "CREATE", userId: actor.id, after: pod });
    return pod;
  }
}
