import { ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { applyMovement } from "../inventory/stock-balance.util";
import type { CreateApplicationDto, CreateInputBatchDto, CreateRecipeDto } from "./dto/organic-inputs.dto";

@Injectable()
export class OrganicInputsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  listRecipes() {
    return this.prisma.organicInputRecipe.findMany({ orderBy: { name: "asc" } });
  }

  createRecipe(dto: CreateRecipeDto) {
    return this.prisma.organicInputRecipe.create({ data: dto as any });
  }

  listBatches(recipeId?: string) {
    return this.prisma.organicInputBatch.findMany({
      where: { ...(recipeId ? { recipeId } : {}) },
      include: { recipe: true },
      orderBy: { preparationDate: "desc" },
    });
  }

  async createBatch(dto: CreateInputBatchDto, actor: AuthenticatedUser) {
    const batchNumber = `OIB-${Date.now().toString(36).toUpperCase()}`;
    const batch = await this.prisma.organicInputBatch.create({
      data: {
        farmId: dto.farmId,
        recipeId: dto.recipeId,
        batchNumber,
        ingredientsUsedJson: dto.ingredientsUsedJson as any,
        preparationDate: dto.preparationDate ? new Date(dto.preparationDate) : new Date(),
        preparedById: actor.id,
        fermentationPeriodDays: dto.fermentationPeriodDays,
        availableQuantity: dto.availableQuantity,
        unit: dto.unit ?? "litre",
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
        storageLocationId: dto.storageLocationId,
      },
    });
    await this.audit.write({ entityType: "OrganicInputBatch", entityId: batch.id, action: "CREATE", userId: actor.id, after: batch });
    return batch;
  }

  listApplications(batchId?: string) {
    return this.prisma.inputApplication.findMany({
      where: { ...(batchId ? { batchId } : {}) },
      include: { batch: { include: { recipe: true } } },
      orderBy: { date: "desc" },
    });
  }

  /** Every application draws down the batch's available quantity — never lets it go negative. */
  async createApplication(dto: CreateApplicationDto, actor: AuthenticatedUser) {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const batch = await tx.organicInputBatch.findUniqueOrThrow({ where: { id: dto.batchId } });
        const newBalance = applyMovement(batch.availableQuantity, dto.quantity, "CONSUMPTION");
        await tx.organicInputBatch.update({ where: { id: dto.batchId }, data: { availableQuantity: newBalance } });
        return tx.inputApplication.create({
          data: {
            farmId: dto.farmId,
            batchId: dto.batchId,
            targetType: dto.targetType,
            targetId: dto.targetId,
            quantity: dto.quantity,
            unit: dto.unit,
            dilutionRatio: dto.dilutionRatio,
            method: dto.method,
            purpose: dto.purpose,
            appliedById: actor.id,
          },
        });
      });
      await this.audit.write({ entityType: "InputApplication", entityId: result.id, action: "CREATE", userId: actor.id, after: result });
      return result;
    } catch (e) {
      if (e instanceof Error && e.message.includes("negative")) throw new ConflictException(e.message);
      throw e;
    }
  }
}
