import { Badge } from "@/components/ui/badge";
import type { NutrientLevel } from "@fms/shared";

const LEVEL_VARIANT: Record<NutrientLevel, "warning" | "secondary" | "success"> = {
  LOW: "warning",
  MEDIUM: "secondary",
  HIGH: "success",
};

export function NutrientBadge({ code, level }: { code: string; level: NutrientLevel }) {
  return <Badge variant={LEVEL_VARIANT[level]}>{code} · {level}</Badge>;
}
