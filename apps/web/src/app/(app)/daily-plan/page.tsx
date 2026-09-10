"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useFarms, useTasks, useTaskMutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "@/components/status-badges";
import { PERMISSIONS } from "@fms/shared";

const COLUMNS = [
  { status: "DRAFT", label: "Draft" },
  { status: "SUBMITTED", label: "Submitted — awaiting approval" },
  { status: "APPROVED", label: "Approved" },
  { status: "ASSIGNED", label: "Assigned" },
];

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function DailyPlanPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const [date, setDate] = React.useState(tomorrowISO());
  const { data: tasks } = useTasks({ farmId, date });
  const { submitTask, approveTask } = useTaskMutations();

  const byStatus = (status: string) => tasks?.filter((t: any) => t.status === status) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily Planning Board</h1>
          <p className="text-sm text-muted-foreground">Prepare, review and approve the plan before work starts.</p>
        </div>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <Card key={col.status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{col.label} ({byStatus(col.status).length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byStatus(col.status).map((t: any) => (
                <div
                  key={t.id}
                  className="cursor-pointer rounded-md border p-2 text-sm hover:bg-accent"
                  onClick={() => router.push(`/tasks?taskId=${t.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t.category}</span>
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="text-xs text-muted-foreground">{t.description}</div>
                  <div className="mt-1 flex gap-1">
                    {t.status === "DRAFT" && hasPermission(PERMISSIONS.TASK_SUBMIT) && (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); submitTask.mutate(t.id); }}>
                        Submit
                      </Button>
                    )}
                    {t.status === "SUBMITTED" && hasPermission(PERMISSIONS.TASK_APPROVE) && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); approveTask.mutate(t.id); }}>
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {byStatus(col.status).length === 0 && <p className="text-xs text-muted-foreground">Nothing here.</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
