import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CorrectAttendanceDto, MarkAttendanceDto } from "./dto/attendance.dto";

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(params: { date?: string; workerId?: string; farmAreaId?: string }) {
    return this.prisma.attendance.findMany({
      where: {
        ...(params.date ? { date: new Date(params.date) } : {}),
        ...(params.workerId ? { workerId: params.workerId } : {}),
        ...(params.farmAreaId ? { farmAreaId: params.farmAreaId } : {}),
      },
      include: { worker: { include: { employee: true } } },
      orderBy: { date: "desc" },
    });
  }

  async mark(dto: MarkAttendanceDto, actorId: string) {
    const date = new Date(dto.date);
    const record = await this.prisma.attendance.upsert({
      where: { workerId_date: { workerId: dto.workerId, date } },
      create: {
        farmId: (await this.workerFarmId(dto.workerId)),
        workerId: dto.workerId,
        date,
        method: dto.method ?? "MANUAL",
        status: dto.status ?? "PRESENT",
        checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : undefined,
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : undefined,
        farmAreaId: dto.farmAreaId,
        photoMediaId: dto.photoMediaId,
        createdById: actorId,
        updatedById: actorId,
      },
      update: {
        method: dto.method,
        status: dto.status,
        checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : undefined,
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : undefined,
        farmAreaId: dto.farmAreaId,
        photoMediaId: dto.photoMediaId,
        updatedById: actorId,
      },
    });
    await this.audit.write({ entityType: "Attendance", entityId: record.id, action: "MARK", userId: actorId, after: record });
    return record;
  }

  private async workerFarmId(workerId: string) {
    const worker = await this.prisma.worker.findUniqueOrThrow({ where: { id: workerId }, include: { employee: true } });
    return worker.employee.farmId;
  }

  async correct(id: string, dto: CorrectAttendanceDto, actorId: string) {
    const before = await this.prisma.attendance.findUnique({ where: { id } });
    if (!before) throw new NotFoundException("Attendance record not found");
    const record = await this.prisma.attendance.update({
      where: { id },
      data: {
        checkInAt: dto.checkInAt ? new Date(dto.checkInAt) : undefined,
        checkOutAt: dto.checkOutAt ? new Date(dto.checkOutAt) : undefined,
        status: dto.status,
        correctionOfId: id,
        correctionReason: dto.reason,
        correctionApprovedById: null,
        updatedById: actorId,
      },
    });
    await this.audit.write({
      entityType: "Attendance",
      entityId: id,
      action: "CORRECT",
      userId: actorId,
      before,
      after: record,
    });
    return record;
  }

  async approveCorrection(id: string, actorId: string) {
    const record = await this.prisma.attendance.update({
      where: { id },
      data: { correctionApprovedById: actorId },
    });
    await this.audit.write({ entityType: "Attendance", entityId: id, action: "APPROVE_CORRECTION", userId: actorId, after: record });
    return record;
  }

  pendingCorrections() {
    return this.prisma.attendance.findMany({
      where: { correctionReason: { not: null }, correctionApprovedById: null },
      include: { worker: { include: { employee: true } } },
    });
  }
}
