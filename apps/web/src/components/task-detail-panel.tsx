"use client";

import * as React from "react";
import { useTask, useTaskMutations, useAvailableWorkers, useLabourMutations, useFarms } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskStatusBadge, PriorityBadge } from "@/components/status-badges";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const NEXT_STATUS: Record<string, string[]> = {
  ASSIGNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["PAUSED", "BLOCKED", "COMPLETED"],
  PAUSED: ["IN_PROGRESS"],
  BLOCKED: ["IN_PROGRESS"],
  COMPLETED: [],
};

export function TaskDetailPanel({ taskId }: { taskId: string }) {
  const { data: task, isLoading } = useTask(taskId);
  const { user, hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: availableWorkers } = useAvailableWorkers(farmId);
  const {
    submitTask,
    approveTask,
    rejectTask,
    assignWorker,
    removeAssignment,
    recordProgress,
    cancelTask,
    verifyTask,
    carryForward,
  } = useTaskMutations();
  const { createReassignment } = useLabourMutations();

  const [error, setError] = React.useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = React.useState("");
  const [progressNotes, setProgressNotes] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [reassignWorkerId, setReassignWorkerId] = React.useState("");
  const [reassignToTaskId, setReassignToTaskId] = React.useState("");
  const [reassignReason, setReassignReason] = React.useState("");

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    }
  };

  if (isLoading || !task) return <p className="p-4 text-sm text-muted-foreground">Loading task…</p>;

  const activeAssignments = task.assignments?.filter((a: any) => a.isActive) ?? [];
  const nextStatuses = NEXT_STATUS[task.status] ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">{task.taskNumber}</div>
          <h2 className="text-lg font-semibold">{task.description || task.category}</h2>
          <div className="mt-1 flex gap-2">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{new Date(task.date).toLocaleDateString()}</div>
          <div>{task.category}</div>
        </div>
      </div>

      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">Requested workers</div>
          <div>{task.requestedWorkers}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Expected output</div>
          <div>{task.expectedOutput || "—"}</div>
        </div>
        {task.safetyNotes && (
          <div className="col-span-2">
            <div className="text-muted-foreground">Safety notes</div>
            <div>{task.safetyNotes}</div>
          </div>
        )}
      </div>

      {/* Approval workflow */}
      <div className="flex flex-wrap gap-2">
        {task.status === "DRAFT" && hasPermission(PERMISSIONS.TASK_SUBMIT) && (
          <Button size="sm" onClick={() => run(() => submitTask.mutateAsync(taskId))}>Submit for approval</Button>
        )}
        {task.status === "SUBMITTED" && hasPermission(PERMISSIONS.TASK_APPROVE) && (
          <>
            <Button size="sm" onClick={() => run(() => approveTask.mutateAsync(taskId))}>Approve</Button>
            <Button size="sm" variant="outline" onClick={() => run(() => rejectTask.mutateAsync(taskId))}>Send back to draft</Button>
          </>
        )}
        {["DRAFT", "SUBMITTED", "APPROVED", "ASSIGNED"].includes(task.status) && hasPermission(PERMISSIONS.TASK_CANCEL) && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => run(() => cancelTask.mutateAsync({ taskId, reason: "Cancelled from task detail" }))}
          >
            Cancel task
          </Button>
        )}
        {task.status === "COMPLETED" && hasPermission(PERMISSIONS.TASK_VERIFY) && (
          <Button size="sm" onClick={() => run(() => verifyTask.mutateAsync(taskId))}>Verify completion</Button>
        )}
        {["PAUSED", "BLOCKED"].includes(task.status) && hasPermission(PERMISSIONS.TASK_APPROVE) && (
          <Button
            size="sm"
            variant="warning"
            onClick={() => run(() => carryForward.mutateAsync({ taskId, reason: progressNotes || "Carried forward at end of day" }))}
          >
            Carry forward to tomorrow
          </Button>
        )}
      </div>

      {/* Progress update */}
      {nextStatuses.length > 0 && (hasPermission(PERMISSIONS.TASK_UPDATE_PROGRESS) || hasPermission(PERMISSIONS.TASK_VIEW_OWN)) && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Update progress</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run(() =>
                      recordProgress.mutateAsync({
                        taskId,
                        statusTo: s,
                        notes: progressNotes || undefined,
                        quantityCompleted: quantity ? Number(quantity) : undefined,
                      }),
                    )
                  }
                >
                  Mark {s.replace(/_/g, " ").toLowerCase()}
                </Button>
              ))}
            </div>
            <Textarea placeholder="Notes / obstacles" value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} />
            <Input placeholder="Quantity completed (optional)" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            {task.requiresEvidence && (
              <p className="text-xs text-warning">This task requires photo/quantity evidence before it can be completed.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Assignments */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Assigned workers ({activeAssignments.length}/{task.requestedWorkers})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {activeAssignments.map((a: any) => (
            <div key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <span>{a.worker?.employee?.name} {a.roleOnTask ? `(${a.roleOnTask})` : ""}</span>
              {["APPROVED", "ASSIGNED"].includes(task.status) && hasPermission(PERMISSIONS.TASK_ASSIGN) && (
                <Button size="sm" variant="ghost" onClick={() => run(() => removeAssignment.mutateAsync({ taskId, assignmentId: a.id }))}>
                  Remove
                </Button>
              )}
            </div>
          ))}
          {activeAssignments.length === 0 && <p className="text-sm text-muted-foreground">No workers assigned yet.</p>}

          {["APPROVED", "ASSIGNED"].includes(task.status) && hasPermission(PERMISSIONS.TASK_ASSIGN) && (
            <div className="flex gap-2 pt-1">
              <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select an available worker" /></SelectTrigger>
                <SelectContent>
                  {availableWorkers?.filter((w: any) => !w.isBusy).map((w: any) => (
                    <SelectItem key={w.id} value={w.id}>{w.employee?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                disabled={!selectedWorker}
                onClick={() => run(() => assignWorker.mutateAsync({ taskId, workerId: selectedWorker }).then(() => setSelectedWorker("")))}
              >
                Assign
              </Button>
            </div>
          )}

          {activeAssignments.length > 0 && hasPermission(PERMISSIONS.REASSIGNMENT_REQUEST) && (
            <div className="mt-3 space-y-2 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">Request reassignment (move an actively-assigned worker)</p>
              <Select value={reassignWorkerId} onValueChange={setReassignWorkerId}>
                <SelectTrigger><SelectValue placeholder="Worker to move" /></SelectTrigger>
                <SelectContent>
                  {activeAssignments.map((a: any) => (
                    <SelectItem key={a.workerId} value={a.workerId}>{a.worker?.employee?.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input placeholder="Destination task ID" value={reassignToTaskId} onChange={(e) => setReassignToTaskId(e.target.value)} />
              <Textarea placeholder="Reason (required)" value={reassignReason} onChange={(e) => setReassignReason(e.target.value)} />
              <Button
                size="sm"
                variant="outline"
                disabled={!reassignWorkerId || !reassignToTaskId || !reassignReason}
                onClick={() =>
                  run(() =>
                    createReassignment
                      .mutateAsync({ workerId: reassignWorkerId, fromTaskId: taskId, toTaskId: reassignToTaskId, reason: reassignReason, urgency: "URGENT" })
                      .then(() => {
                        setReassignWorkerId("");
                        setReassignToTaskId("");
                        setReassignReason("");
                      }),
                  )
                }
              >
                Submit reassignment request
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
