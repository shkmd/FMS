import { UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { AuthenticatedUser } from "../../common/types/authenticated-user";

export async function buildAuthenticatedUser(prisma: PrismaService, userId: string): Promise<AuthenticatedUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      areaAccess: true,
      employee: true,
    },
  });

  if (!user || user.status !== "ACTIVE" || user.deletedAt) {
    throw new UnauthorizedException("Account is no longer active");
  }

  const roles = user.roles.map((ur) => ur.role.code);
  const permissions = Array.from(
    new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code))),
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles,
    permissions,
    areaIds: user.areaAccess.map((a) => a.farmAreaId),
    employeeId: user.employee?.id ?? null,
  };
}
