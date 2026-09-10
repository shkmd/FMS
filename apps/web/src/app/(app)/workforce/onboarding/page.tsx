"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useEmployees, useOnboardingCases, useOnboardingMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GenericStatusBadge } from "@/components/status-badges";
import { CheckCircle2, Circle } from "lucide-react";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const CASE_VARIANT: Record<string, any> = { IN_PROGRESS: "warning", COMPLETED: "success" };

function StartOnboardingDialog() {
  const { data: employees } = useEmployees();
  const { data: cases } = useOnboardingCases();
  const { createCase } = useOnboardingMutations();
  const [open, setOpen] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState("");
  const [startDate, setStartDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = React.useState<string | null>(null);

  const alreadyOnboarding = new Set(cases?.map((c: any) => c.employeeId));
  const eligible = employees?.filter((e: any) => !alreadyOnboarding.has(e.id));

  const submit = async () => {
    setError(null);
    try {
      await createCase.mutateAsync({ employeeId, startDate });
      setOpen(false);
      setEmployeeId("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Start onboarding</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Start onboarding</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
              <SelectContent>{eligible?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        </div>
        <p className="text-xs text-muted-foreground">Uses the standard checklist: paperwork, equipment/access, induction, supervisor assignment.</p>
        <DialogFooter><Button onClick={submit} disabled={!employeeId}>Start</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TaskRow({ task, caseId, canManage }: { task: any; caseId: string; canManage: boolean }) {
  const { updateTask } = useOnboardingMutations();
  const done = task.status === "DONE";

  const toggle = () => {
    if (!canManage) return;
    updateTask.mutate({ taskId: task.id, status: done ? "PENDING" : "DONE" });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canManage}
      className={cn("flex w-full items-center gap-2 rounded-md border p-2 text-left text-sm", canManage && "hover:bg-accent")}
    >
      {done ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />}
      <span className={cn(done && "text-muted-foreground line-through")}>{task.title}</span>
    </button>
  );
}

export default function OnboardingPage() {
  const { hasPermission } = useAuth();
  const { data: cases, isLoading } = useOnboardingCases();
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
        {canManage && <StartOnboardingDialog />}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {cases?.map((c: any) => {
          const doneCount = c.tasks?.filter((t: any) => t.status === "DONE").length ?? 0;
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{c.employee?.name}</CardTitle>
                  <GenericStatusBadge status={c.status} map={CASE_VARIANT} />
                </div>
                <CardDescription>
                  Started {new Date(c.startDate).toLocaleDateString()} · {doneCount}/{c.tasks?.length ?? 0} tasks done
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {c.tasks?.map((t: any) => <TaskRow key={t.id} task={t} caseId={c.id} canManage={canManage} />)}
              </CardContent>
            </Card>
          );
        })}
        {!isLoading && !cases?.length && <p className="text-sm text-muted-foreground">No onboarding cases yet.</p>}
      </div>
    </div>
  );
}
