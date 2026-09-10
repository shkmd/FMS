import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../common/prisma/prisma.service";
import { AuditService } from "../../common/audit/audit.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";

const userInclude = {
  roles: { include: { role: true } },
  areaAccess: { include: { farmArea: true } },
  employee: true,
} as const;

/** Never let a password hash leave this service — not in API responses, not in audit log snapshots. */
function sanitizeUser<T extends { passwordHash: string }>(user: T): Omit<T, "passwordHash"> {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: userInclude,
      orderBy: { name: "asc" },
    });
    return users.map(sanitizeUser);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: userInclude });
    if (!user || user.deletedAt) throw new NotFoundException("User not found");
    return sanitizeUser(user);
  }

  private async findOneRaw(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: userInclude });
    if (!user || user.deletedAt) throw new NotFoundException("User not found");
    return user;
  }

  async create(dto: CreateUserDto, actorId: string) {
    const roles = await this.prisma.role.findMany({ where: { code: { in: dto.roleCodes } } });
    if (roles.length !== dto.roleCodes.length) {
      throw new BadRequestException("One or more role codes do not exist");
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        phone: dto.phone,
        passwordHash,
        createdById: actorId,
        updatedById: actorId,
        roles: { create: roles.map((r) => ({ roleId: r.id })) },
        areaAccess: dto.farmAreaIds?.length
          ? { create: dto.farmAreaIds.map((farmAreaId) => ({ farmAreaId })) }
          : undefined,
      },
      include: userInclude,
    });
    const safe = sanitizeUser(user);
    await this.audit.write({ entityType: "User", entityId: user.id, action: "CREATE", userId: actorId, after: safe });
    return safe;
  }

  async update(id: string, dto: UpdateUserDto, actorId: string) {
    const existing = await this.findOneRaw(id);

    if (dto.roleCodes) {
      const roles = await this.prisma.role.findMany({ where: { code: { in: dto.roleCodes } } });
      if (roles.length !== dto.roleCodes.length) throw new BadRequestException("One or more role codes do not exist");
      await this.prisma.userRole.deleteMany({ where: { userId: id } });
      await this.prisma.userRole.createMany({ data: roles.map((r) => ({ userId: id, roleId: r.id })) });
    }

    if (dto.farmAreaIds) {
      await this.prisma.userAreaAccess.deleteMany({ where: { userId: id } });
      if (dto.farmAreaIds.length) {
        await this.prisma.userAreaAccess.createMany({
          data: dto.farmAreaIds.map((farmAreaId) => ({ userId: id, farmAreaId })),
        });
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        phone: dto.phone,
        status: dto.status,
        updatedById: actorId,
        ...(dto.password ? { passwordHash: await bcrypt.hash(dto.password, 10) } : {}),
      },
      include: userInclude,
    });

    const safe = sanitizeUser(user);
    await this.audit.write({
      entityType: "User",
      entityId: id,
      action: "UPDATE",
      userId: actorId,
      before: sanitizeUser(existing),
      after: safe,
    });
    return safe;
  }

  async remove(id: string, actorId: string) {
    const target = await this.findOneRaw(id);
    if (id === actorId) {
      throw new BadRequestException("You cannot delete your own account while signed in");
    }
    const isSuperAdmin = target.roles.some((ur) => ur.role.code === "SUPER_ADMIN");
    if (isSuperAdmin) {
      const otherActiveSuperAdmins = await this.prisma.user.count({
        where: {
          id: { not: id },
          deletedAt: null,
          status: "ACTIVE",
          roles: { some: { role: { code: "SUPER_ADMIN" } } },
        },
      });
      if (otherActiveSuperAdmins === 0) {
        throw new BadRequestException("Cannot delete the last active Super Admin — promote another user first");
      }
    }
    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: "INACTIVE" } });
    await this.audit.write({ entityType: "User", entityId: id, action: "DELETE", userId: actorId });
    return { success: true };
  }

  listRoles() {
    return this.prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { name: "asc" },
    });
  }
}
