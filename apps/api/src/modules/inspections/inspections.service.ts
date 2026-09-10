import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PERMISSIONS } from "@fms/shared";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import { NotificationsService } from "../../common/notifications/notifications.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";
import { canCloseIssue, canResolveDirectly } from "./issue-rules.util";
import type { CreateInspectionDto, CreateIssueDto, ResolveIssueDto } from "./dto/inspections.dto";

@Injectable()
export class InspectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
  ) {}

  listInspections(farmAreaId?: string) {
    return this.prisma.inspection.findMany({ where: { ...(farmAreaId ? { farmAreaId } : {}) }, orderBy: { date: "desc" } });
  }

  createInspection(dto: CreateInspectionDto, actor: AuthenticatedUser) {
    return this.prisma.inspection.create({ data: { ...dto, inspectorId: actor.id } });
  }

  listIssues(params: { status?: string; severity?: string }) {
    return this.prisma.issue.findMany({
      where: { ...(params.status ? { status: params.status as any } : {}), ...(params.severity ? { severity: params.severity as any } : {}) },
      include: { correctiveActions: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async createIssue(dto: CreateIssueDto, actor: AuthenticatedUser) {
    const issue = await this.prisma.issue.create({
      data: { ...dto, dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined, reportedById: actor.id, status: "OPEN" },
    });
    await this.audit.write({ entityType: "Issue", entityId: issue.id, action: "CREATE", userId: actor.id, after: issue });

    if (issue.severity === "MAJOR" || issue.severity === "CRITICAL") {
      await this.notifications.notify(actor.id, {
        type: "ISSUE_CRITICAL",
        title: `${issue.severity} issue reported: ${issue.description}`,
        entityType: "Issue",
        entityId: issue.id,
      });
    }
    return issue;
  }

  /** Spec §13/§5.16: only OBSERVATION/MINOR issues can be self-resolved by an authorized inspector. */
  async resolveMinorIssue(id: string, dto: ResolveIssueDto, actor: AuthenticatedUser) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException("Issue not found");
    if (!canResolveDirectly(issue.severity)) {
      throw new BadRequestException("Only observation/minor issues can be resolved directly — major/critical issues need escalation and verification");
    }

    const [action, updated] = await this.prisma.$transaction([
      this.prisma.correctiveAction.create({ data: { issueId: id, description: dto.description, actionById: actor.id, result: dto.result } }),
      this.prisma.issue.update({ where: { id }, data: { status: "RESOLVED", resolutionEvidence: dto.description } }),
    ]);
    await this.audit.write({ entityType: "Issue", entityId: id, action: "RESOLVE_MINOR", userId: actor.id, after: { action, updated } });
    return updated;
  }

  async escalateIssue(id: string, escalatedToId: string | undefined, actor: AuthenticatedUser) {
    const before = await this.prisma.issue.findUniqueOrThrow({ where: { id } });
    const issue = await this.prisma.issue.update({
      where: { id },
      data: { status: "ESCALATED", escalatedAt: new Date(), escalatedToId },
    });
    await this.audit.write({ entityType: "Issue", entityId: id, action: "ESCALATE", userId: actor.id, before, after: issue });
    if (escalatedToId) {
      await this.notifications.notify(escalatedToId, { type: "ISSUE_ESCALATED", title: `Issue escalated to you: ${issue.description}`, entityType: "Issue", entityId: id });
    }
    return issue;
  }

  /** Spec §13: a critical issue cannot be closed by the person who reported it, unless they hold platform-wide authority. */
  async closeIssue(id: string, actor: AuthenticatedUser) {
    const issue = await this.prisma.issue.findUnique({ where: { id } });
    if (!issue) throw new NotFoundException("Issue not found");
    const hasOverride = actor.permissions.includes(PERMISSIONS.PLATFORM_MANAGE);
    if (!canCloseIssue({ severity: issue.severity, reportedById: issue.reportedById, actorId: actor.id, hasOverride })) {
      throw new ForbiddenException("A critical issue cannot be closed by the person who reported it");
    }
    const updated = await this.prisma.issue.update({ where: { id }, data: { status: "CLOSED", verifiedById: actor.id } });
    await this.audit.write({ entityType: "Issue", entityId: id, action: "CLOSE", userId: actor.id, before: issue, after: updated });
    return updated;
  }
}
