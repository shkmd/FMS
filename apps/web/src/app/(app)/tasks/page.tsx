"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTasks, useFarmAreas, useTaskMutations, useFarms } from "@/lib/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { TaskStatusBadge, PriorityBadge } from "@/components/status-badges";
import { TaskDetailPanel } from "@/components/task-detail-panel";
import { ExportCsvButton } from "@/components/export-csv-button";
import { PERMISSIONS, TaskPriority } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: areas } = useFarmAreas(farmId);

  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [dateFilter, setDateFilter] = React.useState<string>(() => new Date().toISOString().slice(0, 10));
  const [createOpen, setCreateOpen] = React.useState(false);

  const { data: tasks, isLoading } = useTasks({ farmId, date: dateFilter || undefined, status: statusFilter || undefined });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="tasks"
            rows={(tasks ?? []).map((t: any) => ({
              taskNumber: t.taskNumber,
              date: new Date(t.date).toLocaleDateString(),
              category: t.category,
              status: t.status,
              priority: t.priority,
              assigned: t.assignments?.filter((a: any) => a.isActive).length ?? 0,
              requestedWorkers: t.requestedWorkers,
            }))}
          />
          {hasPermission(PERMISSIONS.TASK_CREATE) && farmId && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>New task</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <CreateTaskForm farmId={farmId} areas={areas ?? []} onDone={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
        <Button variant="outline" size="sm" onClick={() => setDateFilter("")}>All dates</Button>
        <Select value={statusFilter || "ALL"} onValueChange={(v) => setStatusFilter(v === "ALL" ? "" : v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {["DRAFT", "SUBMITTED", "APPROVED", "ASSIGNED", "IN_PROGRESS", "PAUSED", "BLOCKED", "COMPLETED", "VERIFIED", "CANCELLED", "CARRIED_FORWARD"].map((s) => (
              <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading tasks…</p>}
        {tasks?.map((t: any) => (
          <Card key={t.id} className="cursor-pointer hover:border-primary" onClick={() => router.push(`/tasks?taskId=${t.id}`)}>
            <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <div className="text-xs text-muted-foreground">{t.taskNumber} · {new Date(t.date).toLocaleDateString()}</div>
                <div className="font-medium">{t.description || t.category}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {t.assignments?.filter((a: any) => a.isActive).length ?? 0}/{t.requestedWorkers} assigned
                </span>
                <PriorityBadge priority={t.priority} />
                <TaskStatusBadge status={t.status} />
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks?.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No tasks match these filters.</p>}
      </div>

      <Dialog open={!!taskId} onOpenChange={(open) => !open && router.push("/tasks")}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          {taskId && <TaskDetailPanel taskId={taskId} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateTaskForm({ farmId, areas, onDone }: { farmId: string; areas: any[]; onDone: () => void }) {
  const { createTask } = useTaskMutations();
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    farmAreaId: "",
    category: "",
    description: "",
    priority: "MEDIUM",
    requestedWorkers: 1,
    expectedOutput: "",
    safetyNotes: "",
  });

  const submit = async () => {
    setError(null);
    try {
      await createTask.mutateAsync({ ...form, requestedWorkers: Number(form.requestedWorkers) });
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create task");
    }
  };

  return (
    <div className="space-y-3">
      <DialogHeader>
        <DialogTitle>New task</DialogTitle>
      </DialogHeader>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Date</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TaskPriority.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Farm area</Label>
        <Select value={form.farmAreaId} onValueChange={(v) => setForm({ ...form, farmAreaId: v })}>
          <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
          <SelectContent>
            {areas.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Category / activity</Label>
        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Weeding, Irrigation" />
      </div>
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Requested workers</Label>
          <Input type="number" min={1} value={form.requestedWorkers} onChange={(e) => setForm({ ...form, requestedWorkers: Number(e.target.value) })} />
        </div>
        <div className="space-y-1">
          <Label>Expected output</Label>
          <Input value={form.expectedOutput} onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Safety notes</Label>
        <Textarea value={form.safetyNotes} onChange={(e) => setForm({ ...form, safetyNotes: e.target.value })} />
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={!form.farmAreaId || !form.category || createTask.isPending}>
          {createTask.isPending ? "Creating…" : "Create task"}
        </Button>
      </DialogFooter>
    </div>
  );
}
