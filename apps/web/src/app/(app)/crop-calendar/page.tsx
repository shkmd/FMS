"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useCrops, useAllCropCycles, useCropCalendars, useCropCalendarMutations, useCalendarCompliance } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function NewCalendarDialog() {
  const { data: crops } = useCrops();
  const { createCalendar } = useCropCalendarMutations();
  const [open, setOpen] = React.useState(false);
  const [cropId, setCropId] = React.useState("");
  const [season, setSeason] = React.useState("");
  const [start, setStart] = React.useState("06-01");
  const [end, setEnd] = React.useState("07-15");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createCalendar.mutateAsync({ cropId, season, sowingWindowStart: start, sowingWindowEnd: end });
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New calendar</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New crop calendar</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Crop</Label>
            <Select value={cropId} onValueChange={setCropId}>
              <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
              <SelectContent>{crops?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Season name</Label><Input value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g. Kharif" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Sowing window start (MM-DD)</Label><Input value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div className="space-y-1"><Label>Sowing window end (MM-DD)</Label><Input value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!cropId || !season}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddActivityDialog({ cropCalendarId }: { cropCalendarId: string }) {
  const { createActivity } = useCropCalendarMutations();
  const [open, setOpen] = React.useState(false);
  const [stageName, setStageName] = React.useState("");
  const [dayOffset, setDayOffset] = React.useState("0");
  const [activityName, setActivityName] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Add activity</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add recurring activity</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Stage name</Label><Input value={stageName} onChange={(e) => setStageName(e.target.value)} /></div>
          <div className="space-y-1"><Label>Days after sowing</Label><Input type="number" value={dayOffset} onChange={(e) => setDayOffset(e.target.value)} /></div>
          <div className="space-y-1"><Label>Activity</Label><Input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="e.g. Apply Jeevamritham" /></div>
        </div>
        <DialogFooter>
          <Button
            disabled={!stageName || !activityName}
            onClick={() =>
              createActivity.mutate(
                { cropCalendarId, stageName, dayOffset: Number(dayOffset), activityName },
                { onSuccess: () => { setOpen(false); setStageName(""); setActivityName(""); } },
              )
            }
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GenerateTasksCard() {
  const { data: cycles } = useAllCropCycles();
  const { generateTasks } = useCropCalendarMutations();
  const [cropCycleId, setCropCycleId] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { data: compliance } = useCalendarCompliance(cropCycleId || undefined);

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Generate tasks from calendar</CardTitle><CardDescription>Turns a crop cycle&apos;s calendar activities into real tasks on the planning board</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        {result && <p className="rounded-md bg-primary/10 p-2 text-sm">{result}</p>}
        <Select value={cropCycleId} onValueChange={setCropCycleId}>
          <SelectTrigger><SelectValue placeholder="Select crop cycle" /></SelectTrigger>
          <SelectContent>{cycles?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.crop?.name} — {c.variety?.name ?? "—"}</SelectItem>)}</SelectContent>
        </Select>
        {compliance && (
          <div className="text-sm text-muted-foreground">
            {compliance.total} calendar task(s) · {compliance.completed} completed · {compliance.overdue} overdue
            {compliance.compliancePercent != null && ` · ${compliance.compliancePercent}% compliance`}
          </div>
        )}
        <Button
          disabled={!cropCycleId}
          onClick={async () => {
            setError(null); setResult(null);
            try {
              const tasks: any = await generateTasks.mutateAsync(cropCycleId);
              setResult(`${tasks.length} task(s) created on the Daily Planning Board.`);
            } catch (e) { setError(e instanceof ApiError ? e.message : "Failed — does this crop cycle have a calendar and sown date?"); }
          }}
        >
          Generate tasks
        </Button>
      </CardContent>
    </Card>
  );
}

export default function CropCalendarPage() {
  const { hasPermission } = useAuth();
  const { data: calendars, isLoading } = useCropCalendars();
  const canManage = hasPermission(PERMISSIONS.CROP_CALENDAR_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Crop Calendar</h1>
        {canManage && <NewCalendarDialog />}
      </div>

      {canManage && <GenerateTasksCard />}

      <div className="grid gap-3 md:grid-cols-2">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {calendars?.map((cal: any) => (
          <Card key={cal.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{cal.crop?.name} — {cal.season}</CardTitle>
              <CardDescription>Sowing window: {cal.sowingWindowStart} to {cal.sowingWindowEnd}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {cal.activities?.map((a: any) => (
                <div key={a.id} className="flex justify-between text-sm">
                  <span>Day {a.dayOffset}: {a.activityName}</span>
                  <span className="text-muted-foreground">{a.stageName}</span>
                </div>
              ))}
              {canManage && <AddActivityDialog cropCalendarId={cal.id} />}
            </CardContent>
          </Card>
        ))}
        {!calendars?.length && !isLoading && <p className="text-sm text-muted-foreground">No crop calendars defined yet.</p>}
      </div>
    </div>
  );
}
