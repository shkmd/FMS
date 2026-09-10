"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useAllCropCycles, useHarvestForecasts, useHarvestBatches, useHarvestMutations, useForecastVsActual } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function CropCycleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data: cycles } = useAllCropCycles();
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue placeholder="Select crop cycle" /></SelectTrigger>
      <SelectContent>
        {cycles?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.crop?.name} — {c.variety?.name ?? "—"} ({c.cultivationBlock?.name})</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

function NewForecastDialog({ farmId }: { farmId: string }) {
  const { createForecast } = useHarvestMutations();
  const [open, setOpen] = React.useState(false);
  const [cropCycleId, setCropCycleId] = React.useState("");
  const [expectedDate, setExpectedDate] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createForecast.mutateAsync({ farmId, cropCycleId, expectedDate, expectedQuantity: Number(qty) });
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">New forecast</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New harvest forecast</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <CropCycleSelect value={cropCycleId} onChange={setCropCycleId} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Expected date</Label><Input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} /></div>
            <div className="space-y-1"><Label>Expected qty (kg)</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!cropCycleId || !expectedDate || !qty}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewHarvestBatchDialog({ farmId }: { farmId: string }) {
  const { data: cycles } = useAllCropCycles();
  const { createHarvestBatch } = useHarvestMutations();
  const [open, setOpen] = React.useState(false);
  const [cropCycleId, setCropCycleId] = React.useState("");
  const [gross, setGross] = React.useState("");
  const [damaged, setDamaged] = React.useState("0");
  const [error, setError] = React.useState<string | null>(null);

  const cycle = cycles?.find((c: any) => c.id === cropCycleId);

  const submit = async () => {
    setError(null);
    try {
      await createHarvestBatch.mutateAsync({
        farmId, cropCycleId, cultivationBlockId: cycle.cultivationBlockId,
        grossQuantity: Number(gross), damagedQuantity: Number(damaged),
      });
      setOpen(false);
      setGross(""); setDamaged("0");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Record harvest</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Record harvest batch</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <CropCycleSelect value={cropCycleId} onChange={setCropCycleId} />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Gross quantity (kg)</Label><Input type="number" value={gross} onChange={(e) => setGross(e.target.value)} /></div>
            <div className="space-y-1"><Label>Damaged/rejected (kg)</Label><Input type="number" value={damaged} onChange={(e) => setDamaged(e.target.value)} /></div>
          </div>
          {gross && <p className="text-sm text-muted-foreground">Net: {(Number(gross) - Number(damaged || 0)).toFixed(1)} kg → added to inventory</p>}
        </div>
        <DialogFooter><Button onClick={submit} disabled={!cropCycleId || !gross}>Record</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ForecastVsActualCard({ cropCycleId }: { cropCycleId: string }) {
  const { data } = useForecastVsActual(cropCycleId);
  if (!data) return null;
  return (
    <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
      <div><div className="text-muted-foreground">Expected</div><div className="font-medium">{data.expectedTotal} kg</div></div>
      <div><div className="text-muted-foreground">Actual (net)</div><div className="font-medium">{data.netTotal} kg</div></div>
      <div><div className="text-muted-foreground">Variance</div><div className="font-medium">{data.variancePercent != null ? `${data.variancePercent.toFixed(1)}%` : "—"}</div></div>
      <div><div className="text-muted-foreground">Rejection</div><div className="font-medium">{data.rejectionPercent.toFixed(1)}%</div></div>
      <div><div className="text-muted-foreground">Yield/area</div><div className="font-medium">{data.yieldPerUnitArea != null ? data.yieldPerUnitArea.toFixed(1) : "—"}</div></div>
    </div>
  );
}

export default function HarvestPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: forecasts } = useHarvestForecasts();
  const { data: batches, isLoading } = useHarvestBatches();
  const canManage = hasPermission(PERMISSIONS.HARVEST_MANAGE);
  const [comparing, setComparing] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Harvest</h1>
        {canManage && farmId && (
          <div className="flex gap-2">
            <NewForecastDialog farmId={farmId} />
            <NewHarvestBatchDialog farmId={farmId} />
          </div>
        )}
      </div>

      <Tabs defaultValue="batches">
        <TabsList>
          <TabsTrigger value="batches">Harvest Batches</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="batches" className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {batches?.map((b: any) => (
            <Card key={b.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{b.cropCycle?.crop?.name} — {b.batchNumber}</CardTitle>
                <CardDescription>{b.cultivationBlock?.name} · {new Date(b.harvestDate).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">Gross: {b.grossQuantity}kg · Damaged: {b.damagedQuantity}kg · Net: {b.netQuantity}kg</div>
                <Button size="sm" variant="outline" onClick={() => setComparing(comparing === b.cropCycleId ? null : b.cropCycleId)}>
                  {comparing === b.cropCycleId ? "Hide" : "Show"} forecast vs. actual
                </Button>
                {comparing === b.cropCycleId && <ForecastVsActualCard cropCycleId={b.cropCycleId} />}
              </CardContent>
            </Card>
          ))}
          {!batches?.length && !isLoading && <p className="text-sm text-muted-foreground">No harvest batches recorded yet.</p>}
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-2">
          {forecasts?.map((f: any) => (
            <Card key={f.id}>
              <CardContent className="flex items-center justify-between p-3">
                <div>
                  <div className="font-medium">{f.cropCycle?.crop?.name} — {f.cropCycle?.variety?.name ?? "—"}</div>
                  <div className="text-sm text-muted-foreground">Expected {new Date(f.expectedDate).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-medium">{f.expectedQuantity} {f.unit}</div>
              </CardContent>
            </Card>
          ))}
          {!forecasts?.length && <p className="text-sm text-muted-foreground">No forecasts recorded yet.</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
}
