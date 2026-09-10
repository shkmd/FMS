import type { IssueSeverity } from "@fms/shared";

/** Spec §5.16: only observation/minor issues may be self-resolved without escalation. */
export function canResolveDirectly(severity: IssueSeverity): boolean {
  return severity === "OBSERVATION" || severity === "MINOR";
}

/**
 * Spec §13: "Critical issues cannot be closed by the person who reported them unless authorized."
 * `hasOverride` is the platform-manage bypass — the same one every other guard in the app honours.
 */
export function canCloseIssue(params: { severity: IssueSeverity; reportedById: string; actorId: string; hasOverride: boolean }): boolean {
  const isOwnCritical = params.severity === "CRITICAL" && params.reportedById === params.actorId;
  return !isOwnCritical || params.hasOverride;
}
