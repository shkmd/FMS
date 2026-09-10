import { Badge } from "@/components/ui/badge";

const TASK_STATUS_VARIANT: Record<string, "default" | "secondary" | "muted" | "warning" | "destructive" | "success"> = {
  DRAFT: "muted",
  SUBMITTED: "secondary",
  APPROVED: "secondary",
  ASSIGNED: "default",
  IN_PROGRESS: "default",
  PAUSED: "warning",
  BLOCKED: "destructive",
  COMPLETED: "success",
  VERIFIED: "success",
  CANCELLED: "muted",
  CARRIED_FORWARD: "warning",
};

export function TaskStatusBadge({ status }: { status: string }) {
  return <Badge variant={TASK_STATUS_VARIANT[status] ?? "muted"}>{status.replace(/_/g, " ")}</Badge>;
}

const PRIORITY_VARIANT: Record<string, "default" | "secondary" | "muted" | "warning" | "destructive" | "success"> = {
  CRITICAL: "destructive",
  HIGH: "warning",
  MEDIUM: "secondary",
  LOW: "muted",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return <Badge variant={PRIORITY_VARIANT[priority] ?? "muted"}>{priority}</Badge>;
}

const AREA_STATUS_VARIANT: Record<string, "default" | "secondary" | "muted" | "warning" | "destructive" | "success"> = {
  ACTIVE: "success",
  FALLOW: "muted",
  UNDER_PREPARATION: "secondary",
  ISSUE: "destructive",
  INACTIVE: "muted",
};

export function AreaStatusBadge({ status }: { status: string }) {
  return <Badge variant={AREA_STATUS_VARIANT[status] ?? "muted"}>{status.replace(/_/g, " ")}</Badge>;
}

export type BadgeVariant = "default" | "secondary" | "muted" | "warning" | "destructive" | "success";

/** Generic status badge for any enum — pass a variant map once per module and reuse. */
export function GenericStatusBadge({ status, map }: { status: string; map: Record<string, BadgeVariant> }) {
  return <Badge variant={map[status] ?? "muted"}>{status.replace(/_/g, " ")}</Badge>;
}

const ASSET_STATUS_VARIANT: Record<string, BadgeVariant> = {
  AVAILABLE: "success",
  ASSIGNED: "secondary",
  IN_USE: "default",
  UNDER_REPAIR: "destructive",
  AWAITING_PARTS: "warning",
  RETIRED: "muted",
};
export function AssetStatusBadge({ status }: { status: string }) {
  return <Badge variant={ASSET_STATUS_VARIANT[status] ?? "muted"}>{status.replace(/_/g, " ")}</Badge>;
}
