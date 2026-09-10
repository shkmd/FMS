import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type {
  CreateJobApplicationDto,
  CreateJobRequisitionDto,
  HireApplicationDto,
  UpdateApplicationStageDto,
  UpdateJobRequisitionDto,
} from "./dto/recruitment.dto";

const ONBOARDING_TASK_TITLES = [
  "Collect HR paperwork and identity documents",
  "Issue equipment / uniform / access",
  "Site induction and safety briefing",
  "Assign supervisor and first task",
];

@Injectable()
export class RecruitmentService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ---- Requisitions ----
  listRequisitions() {
    return this.prisma.jobRequisition.findMany({
      where: { deletedAt: null },
      include: { department: true, designation: true, _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getRequisition(id: string) {
    const req = await this.prisma.jobRequisition.findUnique({
      where: { id },
      include: { department: true, designation: true, applications: { orderBy: { appliedDate: "desc" } } },
    });
    if (!req || req.deletedAt) throw new NotFoundException("Job requisition not found");
    return req;
  }

  async createRequisition(dto: CreateJobRequisitionDto, actorId: string) {
    const req = await this.prisma.jobRequisition.create({
      data: {
        ...dto,
        targetJoinDate: dto.targetJoinDate ? new Date(dto.targetJoinDate) : undefined,
        createdById: actorId,
        updatedById: actorId,
      },
    });
    await this.audit.write({ entityType: "JobRequisition", entityId: req.id, action: "CREATE", userId: actorId, after: req });
    return req;
  }

  async updateRequisition(id: string, dto: UpdateJobRequisitionDto, actorId: string) {
    const before = await this.getRequisition(id);
    const req = await this.prisma.jobRequisition.update({
      where: { id },
      data: { ...dto, targetJoinDate: dto.targetJoinDate ? new Date(dto.targetJoinDate) : undefined, updatedById: actorId },
    });
    await this.audit.write({ entityType: "JobRequisition", entityId: id, action: "UPDATE", userId: actorId, before, after: req });
    return req;
  }

  // ---- Applications ----
  listApplications(requisitionId?: string) {
    return this.prisma.jobApplication.findMany({
      where: { deletedAt: null, ...(requisitionId ? { requisitionId } : {}) },
      include: { requisition: true, hiredEmployee: true },
      orderBy: { appliedDate: "desc" },
    });
  }

  async createApplication(requisitionId: string, dto: CreateJobApplicationDto, actorId: string) {
    await this.getRequisition(requisitionId);
    const app = await this.prisma.jobApplication.create({
      data: { ...dto, requisitionId, createdById: actorId, updatedById: actorId },
    });
    await this.audit.write({ entityType: "JobApplication", entityId: app.id, action: "CREATE", userId: actorId, after: app });
    return app;
  }

  /** Generic stage transitions — HIRED must go through `hire()` since it also creates the Employee. */
  async updateStage(id: string, dto: UpdateApplicationStageDto, actorId: string) {
    const before = await this.prisma.jobApplication.findUnique({ where: { id } });
    if (!before || before.deletedAt) throw new NotFoundException("Application not found");
    if (before.hiredEmployeeId) throw new BadRequestException("This candidate has already been hired");
    if (dto.stage === "HIRED") throw new BadRequestException("Use the hire endpoint to move a candidate to HIRED");

    const app = await this.prisma.jobApplication.update({ where: { id }, data: { stage: dto.stage, updatedById: actorId } });
    await this.audit.write({ entityType: "JobApplication", entityId: id, action: "STAGE_CHANGE", userId: actorId, before, after: app });
    return app;
  }

  /** Hiring creates the Employee, links the application, starts onboarding, and auto-closes a filled requisition. */
  async hire(id: string, dto: HireApplicationDto, actorId: string) {
    const application = await this.prisma.jobApplication.findUnique({ where: { id }, include: { requisition: true } });
    if (!application || application.deletedAt) throw new NotFoundException("Application not found");
    if (application.hiredEmployeeId) throw new BadRequestException("This candidate has already been hired");
    if (application.stage === "REJECTED" || application.stage === "WITHDRAWN") {
      throw new BadRequestException(`Cannot hire a candidate whose application is ${application.stage}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          farmId: application.requisition.farmId,
          employeeCode: dto.employeeCode,
          name: application.candidateName,
          phone: dto.phone ?? application.phone,
          departmentId: application.requisition.departmentId,
          designationId: application.requisition.designationId,
          employmentCategory: dto.employmentCategory,
          joinDate: dto.joinDate ? new Date(dto.joinDate) : new Date(),
          createdById: actorId,
          updatedById: actorId,
        },
      });

      const updatedApplication = await tx.jobApplication.update({
        where: { id },
        data: { stage: "HIRED", hiredEmployeeId: employee.id, updatedById: actorId },
      });

      const onboarding = await tx.onboardingCase.create({
        data: {
          employeeId: employee.id,
          startDate: employee.joinDate ?? new Date(),
          createdById: actorId,
          tasks: { create: ONBOARDING_TASK_TITLES.map((title) => ({ title })) },
        },
      });

      const hiredCount = await tx.jobApplication.count({
        where: { requisitionId: application.requisitionId, stage: "HIRED", deletedAt: null },
      });
      if (hiredCount >= application.requisition.openings) {
        await tx.jobRequisition.update({ where: { id: application.requisitionId }, data: { status: "CLOSED", updatedById: actorId } });
      } else {
        await tx.jobRequisition.update({ where: { id: application.requisitionId }, data: { status: "IN_PROGRESS", updatedById: actorId } });
      }

      return { employee, application: updatedApplication, onboarding };
    });

    await this.audit.write({
      entityType: "JobApplication",
      entityId: id,
      action: "HIRE",
      userId: actorId,
      after: { employeeId: result.employee.id, onboardingCaseId: result.onboarding.id },
    });
    return result;
  }
}
