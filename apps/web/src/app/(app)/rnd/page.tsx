"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useCrops, useTrials, useRndMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GenericStatusBadge } from "@/components/status-badges";
import { TrialOutcome, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const OUTCOME_VARIANT: Record<string, any> = { CONTINUE: "secondary", MODIFY: "warning", SCALE: "success", COMMERCIALIZE: "success", DISCONTINUE: "destructive" };

function NewTrialDialog({ farmId }: { farmId: string }) {
  const { data: crops } = useCrops();
  const { createTrial } = useRndMutations();
  const [open, setOpen] = React.useState(false);
  const [objective, setObjective] = React.useState("");
  const [cropId, setCropId] = React.useState("");
  const [startDate, setStartDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createTrial.mutateAsync({ farmId, objective, cropId, startDate });
      setOpen(false);
      setObjective("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New trial</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New R&D trial</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Crop</Label>
            <Select value={cropId} onValueChange={setCropId}>
              <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
              <SelectContent>{crops?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Objective</Label><Textarea value={objective} onChange={(e) => setObjective(e.target.value)} /></div>
          <div className="space-y-1"><Label>Start date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!cropId || !objective}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RndPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: trials, isLoading } = useTrials(farmId);
  const { decideTrial } = useRndMutations();
  const canManage = hasPermission(PERMISSIONS.RND_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">R&D</h1>
        {canManage && farmId && <NewTrialDialog farmId={farmId} />}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {trials?.map((t: any) => (
          <Card key={t.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.crop?.name} — {t.trialCode}</CardTitle>
                {t.outcome && <GenericStatusBadge status={t.outcome} map={OUTCOME_VARIANT} />}
              </div>
              <CardDescription>{t.objective}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-muted-foreground">Status: {t.status} · {t.observations?.length ?? 0} observation(s)</div>
              {canManage && t.status === "active" && (
                <div className="flex flex-wrap gap-1">
                  {TrialOutcome.map((o) => (
                    <Button key={o} size="sm" variant="outline" onClick={() => decideTrial.mutate({ id: t.id, outcome: o })}>
                      {o}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!trials?.length && !isLoading && <p className="text-sm text-muted-foreground">No trials recorded yet.</p>}
      </div>
    </div>
  );
}
