import { SetMetadata } from "@nestjs/common";
import type { PermissionCode } from "@fms/shared";

export const PERMISSIONS_KEY = "requiredPermissions";
/** Route requires the current user to hold ANY of the given permission codes (or platform:manage). */
export const RequirePermissions = (...permissions: PermissionCode[]) => SetMetadata(PERMISSIONS_KEY, permissions);
