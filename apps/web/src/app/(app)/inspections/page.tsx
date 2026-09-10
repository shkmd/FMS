"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useFarmAreas, useIssues, useInspectionMutations } from "@/lib/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GenericStatusBadge } from "@/components/status-badges";
import { IssueSeverity, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const SEVERITY_VARIANT: Record<string, any> = { OBSERVATION: "muted", MINOR: "secondary", MAJOR: "warning", CRITICAL: "destructive" };
const STATUS_VARIANT: Record<string, any> = { OPEN: "warning", IN_PROGRESS: "secondary", RESOLVED: "success", ESCALATED: "destructive", CLOSED: "muted" };

function NewIssueDialog({ farmId }: { farmId: string }) {
  const { data: areas } = useFarmAreas(farmId);
  const { createIssue } = useInspectionMutations();
  const [open, setOpen] = React.useState(false);
  const [farmAreaId, setFarmAreaId] = React.useState("");
  const [severity, setSeverity] = React.useState("MINOR");
  const [category, setCategory] = React.useState("General");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createIssue.mutateAsync({ farmId, farmAreaId, severity, category, description });
      setOpen(false);
      setDescription("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New issue</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Report an issue</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <Select value={farmAreaId} onValueChange={setFarmAreaId}>
            <SelectTrigger><SelectValue placeholder="Farm area" /></SelectTrigger>
            <SelectContent>{areas?.map((a: any) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{IssueSeverity.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <DialogFooter><Button onClick={submit} disabled={!farmAreaId || !description}>Report</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function InspectionsPage() {
  const { user, hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: issues, isLoading } = useIssues();
  const { resolveMinor, escalate, close } = useInspectionMutations();
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  const [resolution, setResolution] = React.useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Inspections</h1>
        {hasPermission(PERMISSIONS.ISSUE_CREATE) && farmId && <NewIssueDialog farmId={farmId} />}
      </div>

      <div className="space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {issues?.map((i: any) => {
          const isOwnCritical = i.severity === "CRITICAL" && i.reportedById === user?.id;
          return (
            <Card key={i.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium">{i.category}</div>
                    <div className="text-sm text-muted-foreground">{i.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <GenericStatusBadge status={i.severity} map={SEVERITY_VARIANT} />
                    <GenericStatusBadge status={i.status} map={STATUS_VARIANT} />
                  </div>
                </div>
                {i.status === "OPEN" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["OBSERVATION", "MINOR"].includes(i.severity) && hasPermission(PERMISSIONS.ISSUE_RESOLVE_MINOR) && (
                      <Button size="sm" variant="outline" onClick={() => setResolvingId(resolvingId === i.id ? null : i.id)}>
                        Resolve
                      </Button>
                    )}
                    {["MAJOR", "CRITICAL"].includes(i.severity) && hasPermission(PERMISSIONS.ISSUE_ESCALATE) && (
                      <Button size="sm" variant="warning" onClick={() => escalate.mutate(i.id)}>Escalate</Button>
                    )}
                  </div>
                )}
                {i.status === "ESCALATED" && hasPermission(PERMISSIONS.ISSUE_VERIFY) && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      disabled={isOwnCritical}
                      title={isOwnCritical ? "You reported this critical issue — someone else must close it" : undefined}
                      onClick={() => close.mutate(i.id)}
                    >
                      {isOwnCritical ? "Cannot close your own critical issue" : "Verify & close"}
                    </Button>
                  </div>
                )}
                {resolvingId === i.id && (
                  <div className="mt-2 flex gap-2">
                    <Textarea placeholder="Resolution notes" value={resolution} onChange={(e) => setResolution(e.target.value)} />
                    <Button
                      size="sm"
                      onClick={() => resolveMinor.mutate({ id: i.id, description: resolution }, { onSuccess: () => { setResolvingId(null); setResolution(""); } })}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {!issues?.length && !isLoading && <p className="text-sm text-muted-foreground">No issues reported yet.</p>}
      </div>
    </div>
  );
}
