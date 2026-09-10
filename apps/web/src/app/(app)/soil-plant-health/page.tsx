"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, usePlots, useSoilTests, usePlantHealthRecords, useAllCropCycles, usePlantHealthMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenericStatusBadge } from "@/components/status-badges";
import { NutrientBadge } from "@/components/nutrient-badge";
import { SoilReferenceCharts } from "@/components/soil-reference-charts";
import {
  IssueSeverity,
  PERMISSIONS,
  classifyNitrogen,
  classifyPhosphorus,
  classifyPotassium,
  classifyPh,
  buildSoilRecommendation,
} from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const SEVERITY_VARIANT: Record<string, any> = { OBSERVATION: "muted", MINOR: "secondary", MAJOR: "warning", CRITICAL: "destructive" };

function NewSoilTestDialog({ farmId }: { farmId: string }) {
  const { data: plots } = usePlots(farmId);
  const { createSoilTest } = usePlantHealthMutations();
  const [open, setOpen] = React.useState(false);
  const [plotId, setPlotId] = React.useState("");
  const [n, setN] = React.useState(""); const [p, setP] = React.useState(""); const [k, setK] = React.useState(""); const [ph, setPh] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const nBand = n ? classifyNitrogen(Number(n)) : null;
  const pBand = p ? classifyPhosphorus(Number(p)) : null;
  const kBand = k ? classifyPotassium(Number(k)) : null;
  const phResult = ph ? classifyPh(Number(ph)) : null;
  const preview = buildSoilRecommendation({
    nitrogen: n ? Number(n) : undefined,
    phosphorus: p ? Number(p) : undefined,
    potassium: k ? Number(k) : undefined,
    ph: ph ? Number(ph) : undefined,
  });

  const submit = async () => {
    setError(null);
    try {
      await createSoilTest.mutateAsync({
        farmId, plotId: plotId || undefined,
        nitrogen: n ? Number(n) : undefined, phosphorus: p ? Number(p) : undefined, potassium: k ? Number(k) : undefined, ph: ph ? Number(ph) : undefined,
      });
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New soil test</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New soil test</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Plot</Label>
            <Select value={plotId} onValueChange={setPlotId}>
              <SelectTrigger><SelectValue placeholder="Select plot" /></SelectTrigger>
              <SelectContent>{plots?.map((p: any) => <SelectItem key={p.id} value={p.id}>Plot {p.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1"><Label>N (kg/Acre)</Label><Input type="number" value={n} onChange={(e) => setN(e.target.value)} /></div>
            <div className="space-y-1"><Label>P (kg/Acre)</Label><Input type="number" value={p} onChange={(e) => setP(e.target.value)} /></div>
            <div className="space-y-1"><Label>K (kg/Acre)</Label><Input type="number" value={k} onChange={(e) => setK(e.target.value)} /></div>
            <div className="space-y-1"><Label>pH</Label><Input type="number" value={ph} onChange={(e) => setPh(e.target.value)} /></div>
          </div>
          {(nBand || pBand || kBand || phResult) && (
            <div className="flex flex-wrap gap-2">
              {nBand && <NutrientBadge code={`N ${nBand.code}`} level={nBand.level} />}
              {pBand && <NutrientBadge code={`P ${pBand.code}`} level={pBand.level} />}
              {kBand && <NutrientBadge code={`K ${kBand.code}`} level={kBand.level} />}
              {phResult && <span className="rounded-md border px-2 py-0.5 text-xs">pH · {phResult.reaction}</span>}
            </div>
          )}
          {preview && <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">{preview}</p>}
        </div>
        <DialogFooter><Button onClick={submit} disabled={!plotId}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewPlantHealthDialog({ farmId }: { farmId: string }) {
  const { data: cycles } = useAllCropCycles();
  const { createPlantHealthRecord } = usePlantHealthMutations();
  const [open, setOpen] = React.useState(false);
  const [cropCycleId, setCropCycleId] = React.useState("");
  const [symptoms, setSymptoms] = React.useState("");
  const [severity, setSeverity] = React.useState("MINOR");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createPlantHealthRecord.mutateAsync({ farmId, cropCycleId, symptoms, severity });
      setOpen(false);
      setSymptoms("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New inspection</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Plant health inspection</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Crop cycle</Label>
            <Select value={cropCycleId} onValueChange={setCropCycleId}>
              <SelectTrigger><SelectValue placeholder="Select crop cycle" /></SelectTrigger>
              <SelectContent>{cycles?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.crop?.name} — {c.variety?.name ?? "—"}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Severity</Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{IssueSeverity.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Symptoms</Label><Textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!cropCycleId || !symptoms}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SoilPlantHealthPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: soilTests } = useSoilTests();
  const { data: records } = usePlantHealthRecords();
  const canManage = hasPermission(PERMISSIONS.SOIL_PLANT_HEALTH_MANAGE);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Soil and Plant Health</h1>

      <Tabs defaultValue="soil">
        <TabsList>
          <TabsTrigger value="soil">Soil Tests</TabsTrigger>
          <TabsTrigger value="health">Plant Health</TabsTrigger>
          <TabsTrigger value="charts">Reference Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="soil" className="space-y-3">
          {canManage && farmId && <NewSoilTestDialog farmId={farmId} />}
          <div className="grid gap-3 md:grid-cols-3">
            {soilTests?.map((t: any) => {
              const nBand = t.nitrogen != null ? classifyNitrogen(t.nitrogen) : null;
              const pBand = t.phosphorus != null ? classifyPhosphorus(t.phosphorus) : null;
              const kBand = t.potassium != null ? classifyPotassium(t.potassium) : null;
              const phResult = t.ph != null ? classifyPh(t.ph) : null;
              return (
                <Card key={t.id}>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Plot {t.plot?.code ?? "—"}</CardTitle><CardDescription>{new Date(t.date).toLocaleDateString()}</CardDescription></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-1.5">
                      {nBand && <NutrientBadge code={`N ${nBand.code}`} level={nBand.level} />}
                      {pBand && <NutrientBadge code={`P ${pBand.code}`} level={pBand.level} />}
                      {kBand && <NutrientBadge code={`K ${kBand.code}`} level={kBand.level} />}
                      {phResult && <span className="rounded-md border px-2 py-0.5 text-xs">pH {t.ph} · {phResult.reaction}</span>}
                      {!nBand && !pBand && !kBand && !phResult && <span className="text-muted-foreground">No readings recorded</span>}
                    </div>
                    {t.recommendation && <p className="text-xs text-muted-foreground">{t.recommendation}</p>}
                  </CardContent>
                </Card>
              );
            })}
            {!soilTests?.length && <p className="text-sm text-muted-foreground">No soil tests recorded yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-3">
          {canManage && farmId && <NewPlantHealthDialog farmId={farmId} />}
          <div className="space-y-2">
            {records?.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{r.cropCycle?.crop?.name} — {r.cropCycle?.variety?.name ?? "—"}</div>
                    <div className="text-sm text-muted-foreground">{r.symptoms}</div>
                  </div>
                  <GenericStatusBadge status={r.severity} map={SEVERITY_VARIANT} />
                </CardContent>
              </Card>
            ))}
            {!records?.length && <p className="text-sm text-muted-foreground">No inspections recorded yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <SoilReferenceCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
}
