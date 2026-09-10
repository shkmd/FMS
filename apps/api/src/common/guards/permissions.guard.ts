import { ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import { PERMISSIONS } from "@fms/shared";
import type { AuthenticatedUser } from "../types/authenticated-user";

@Injectable()
export class PermissionsGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user) throw new ForbiddenException("Not authenticated");

    if (user.permissions.includes(PERMISSIONS.PLATFORM_MANAGE)) return true;
    const allowed = required.some((code) => user.permissions.includes(code));
    if (!allowed) {
      throw new ForbiddenException(`Missing required permission: ${required.join(" or ")}`);
    }
    return true;
  }
}
