"use client";

import * as React from "react";
import { useFarms, useTasks, useAvailableWorkers, useTaskMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/status-badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LabourAllocationPage() {
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const today = new Date().toISOString().slice(0, 10);
  const { data: tasks } = useTasks({ farmId, date: today, status: undefined });
  const { data: workers } = useAvailableWorkers(farmId);
  const { assignWorker } = useTaskMutations();
  const [selections, setSelections] = React.useState<Record<string, string>>({});

  const needsWorkers = (tasks ?? []).filter(
    (t: any) =>
      ["APPROVED", "ASSIGNED"].includes(t.status) &&
      (t.assignments?.filter((a: any) => a.isActive).length ?? 0) < t.requestedWorkers,
  );
  // Priority-first ordering for allocation.
  const priorityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  needsWorkers.sort((a: any, b: any) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const availableCount = (workers ?? []).filter((w: any) => !w.isBusy).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Labour Allocation Board</h1>
        <p className="text-sm text-muted-foreground">
          {availableCount} worker{availableCount === 1 ? "" : "s"} available today · {needsWorkers.length} task{needsWorkers.length === 1 ? "" : "s"} short of requested headcount, ordered by priority
        </p>
      </div>

      <div className="space-y-3">
        {needsWorkers.map((t: any) => {
          const active = t.assignments?.filter((a: any) => a.isActive) ?? [];
          return (
            <Card key={t.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{t.category} — {t.description}</CardTitle>
                  <PriorityBadge priority={t.priority} />
                </div>
                <CardDescription>
                  {active.length}/{t.requestedWorkers} assigned
                  {t.requiredSkills?.length ? ` · skills needed: ${t.requiredSkills.join(", ")}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                <Select value={selections[t.id] ?? ""} onValueChange={(v) => setSelections((s) => ({ ...s, [t.id]: v }))}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select an available worker" /></SelectTrigger>
                  <SelectContent>
                    {(workers ?? []).filter((w: any) => !w.isBusy).map((w: any) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.employee?.name} {w.skills?.length ? `(${w.skills.map((s: any) => s.skill.name).join(", ")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selections[t.id]}
                  onClick={() =>
                    assignWorker.mutate(
                      { taskId: t.id, workerId: selections[t.id] },
                      { onSuccess: () => setSelections((s) => ({ ...s, [t.id]: "" })) },
                    )
                  }
                >
                  Allocate
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {needsWorkers.length === 0 && (
          <p className="text-sm text-muted-foreground">Every approved task today has its requested headcount.</p>
        )}
      </div>
    </div>
  );
}
