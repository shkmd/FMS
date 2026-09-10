"use client";

import * as React from "react";
import { useReassignmentRequests, useLabourMutations } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PERMISSIONS } from "@fms/shared";

const STATUS_VARIANT: Record<string, "warning" | "success" | "destructive" | "muted"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
  CANCELLED: "muted",
};

export default function ReassignmentsPage() {
  const { hasPermission } = useAuth();
  const { data: requests, isLoading } = useReassignmentRequests();
  const { decideReassignment } = useLabourMutations();

  const pending = requests?.filter((r: any) => r.status === "PENDING") ?? [];
  const decided = requests?.filter((r: any) => r.status !== "PENDING") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reassignment Requests</h1>
        <p className="text-sm text-muted-foreground">
          Moving an actively-assigned worker always goes through this approval — the original task is paused/transferred and the move is fully audited.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Pending approval</h2>
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {pending.map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{r.worker?.employee?.name}</CardTitle>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </div>
              <CardDescription>
                {r.fromTask?.taskNumber} ({r.fromTask?.category}) → {r.toTask?.taskNumber} ({r.toTask?.category})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><span className="text-muted-foreground">Reason: </span>{r.reason}</p>
              <p className="text-xs text-muted-foreground">Urgency: {r.urgency} · Requested {new Date(r.createdAt).toLocaleString()}</p>
              {hasPermission(PERMISSIONS.REASSIGNMENT_APPROVE) && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => decideReassignment.mutate({ id: r.id, approve: true })}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => decideReassignment.mutate({ id: r.id, approve: false })}>
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {pending.length === 0 && !isLoading && <p className="text-sm text-muted-foreground">No pending reassignment requests.</p>}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">History</h2>
        <div className="space-y-1">
          {decided.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <span>
                {r.worker?.employee?.name}: {r.fromTask?.taskNumber} → {r.toTask?.taskNumber}
              </span>
              <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
            </div>
          ))}
          {decided.length === 0 && <p className="text-sm text-muted-foreground">No decided requests yet.</p>}
        </div>
      </section>
    </div>
  );
}
