import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type {
  CreateTrainingProgramDto,
  CreateTrainingSessionDto,
  EnrollEmployeeDto,
  UpdateEnrollmentDto,
  UpdateTrainingProgramDto,
  UpdateTrainingSessionDto,
} from "./dto/learning.dto";

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  // ---- Programs ----
  listPrograms() {
    return this.prisma.trainingProgram.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { sessions: true } } },
      orderBy: { title: "asc" },
    });
  }

  async getProgram(id: string) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id },
      include: { sessions: { include: { enrollments: { include: { employee: true } } }, orderBy: { scheduledDate: "desc" } } },
    });
    if (!program || program.deletedAt) throw new NotFoundException("Training program not found");
    return program;
  }

  async createProgram(dto: CreateTrainingProgramDto, actorId: string) {
    const program = await this.prisma.trainingProgram.create({ data: { ...dto, createdById: actorId, updatedById: actorId } });
    await this.audit.write({ entityType: "TrainingProgram", entityId: program.id, action: "CREATE", userId: actorId, after: program });
    return program;
  }

  async updateProgram(id: string, dto: UpdateTrainingProgramDto, actorId: string) {
    const before = await this.getProgram(id);
    const program = await this.prisma.trainingProgram.update({ where: { id }, data: { ...dto, updatedById: actorId } });
    await this.audit.write({ entityType: "TrainingProgram", entityId: id, action: "UPDATE", userId: actorId, before, after: program });
    return program;
  }

  // ---- Sessions ----
  listSessions(programId?: string) {
    return this.prisma.trainingSession.findMany({
      where: { deletedAt: null, ...(programId ? { programId } : {}) },
      include: { program: true, enrollments: { include: { employee: true } } },
      orderBy: { scheduledDate: "desc" },
    });
  }

  async createSession(programId: string, dto: CreateTrainingSessionDto, actorId: string) {
    await this.getProgram(programId);
    const session = await this.prisma.trainingSession.create({
      data: { ...dto, programId, scheduledDate: new Date(dto.scheduledDate), createdById: actorId },
    });
    await this.audit.write({ entityType: "TrainingSession", entityId: session.id, action: "CREATE", userId: actorId, after: session });
    return session;
  }

  async updateSession(id: string, dto: UpdateTrainingSessionDto, actorId: string) {
    const before = await this.prisma.trainingSession.findUniqueOrThrow({ where: { id } });
    const session = await this.prisma.trainingSession.update({
      where: { id },
      data: { ...dto, scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : undefined },
    });
    await this.audit.write({ entityType: "TrainingSession", entityId: id, action: "UPDATE", userId: actorId, before, after: session });
    return session;
  }

  // ---- Enrollments ----
  async enroll(sessionId: string, dto: EnrollEmployeeDto, actorId: string) {
    const enrollment = await this.prisma.trainingEnrollment.create({ data: { sessionId, employeeId: dto.employeeId } });
    await this.audit.write({ entityType: "TrainingEnrollment", entityId: enrollment.id, action: "CREATE", userId: actorId, after: enrollment });
    return enrollment;
  }

  async updateEnrollment(id: string, dto: UpdateEnrollmentDto, actorId: string) {
    const before = await this.prisma.trainingEnrollment.findUniqueOrThrow({ where: { id } });
    const enrollment = await this.prisma.trainingEnrollment.update({ where: { id }, data: dto });
    await this.audit.write({ entityType: "TrainingEnrollment", entityId: id, action: "UPDATE", userId: actorId, before, after: enrollment });
    return enrollment;
  }
}
