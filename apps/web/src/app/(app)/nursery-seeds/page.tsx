"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useFarms,
  useCrops,
  useSeedLots,
  useSeedLot,
  useExpiringSeedLots,
  useGerminationTrials,
  useNurseryBatches,
  useNurseryMutations,
} from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VarietyClassification, NurseryStage, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function NewSeedLotDialog({ farmId }: { farmId: string }) {
  const { data: crops } = useCrops();
  const { createSeedLot } = useNurseryMutations();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cropId, setCropId] = React.useState("");
  const [varietyId, setVarietyId] = React.useState("");
  const [classification, setClassification] = React.useState("NATIVE");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("kg");

  const varieties = crops?.find((c: any) => c.id === cropId)?.varieties ?? [];

  const submit = async () => {
    setError(null);
    try {
      await createSeedLot.mutateAsync({ farmId, cropId, varietyId, classification, quantity: Number(quantity), unit });
      setOpen(false);
      setCropId(""); setVarietyId(""); setQuantity("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create seed lot");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New seed lot</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New seed lot</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Crop</Label>
            <Select value={cropId} onValueChange={(v) => { setCropId(v); setVarietyId(""); }}>
              <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
              <SelectContent>{crops?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Variety</Label>
            <Select value={varietyId} onValueChange={setVarietyId} disabled={!cropId}>
              <SelectTrigger><SelectValue placeholder="Select variety" /></SelectTrigger>
              <SelectContent>{varieties.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Classification</Label>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{VarietyClassification.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div className="space-y-1"><Label>Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!cropId || !varietyId || !quantity || createSeedLot.isPending}>
            {createSeedLot.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeedLotDetail({ seedLotId }: { seedLotId: string }) {
  const { data: lot } = useSeedLot(seedLotId);
  const { addStorageReading, createGerminationTrial } = useNurseryMutations();
  const [error, setError] = React.useState<string | null>(null);
  const [temp, setTemp] = React.useState("");
  const [humidity, setHumidity] = React.useState("");
  const [tested, setTested] = React.useState("");
  const [germinated, setGerminated] = React.useState("");

  if (!lot) return null;
  const run = async (fn: () => Promise<any>) => {
    setError(null);
    try { await fn(); } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{lot.variety?.crop?.name} — {lot.variety?.name}</DialogTitle>
      </DialogHeader>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div><div className="text-muted-foreground">Lot #</div><div>{lot.lotNumber}</div></div>
        <div><div className="text-muted-foreground">Balance</div><div>{lot.currentBalance} {lot.unit}</div></div>
        <div><div className="text-muted-foreground">Expiry</div><div>{lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : "—"}</div></div>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Storage reading</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Temp °C" type="number" value={temp} onChange={(e) => setTemp(e.target.value)} />
          <Input placeholder="Humidity %" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} />
          <Button onClick={() => run(() => addStorageReading.mutateAsync({ seedLotId, temperature: temp ? Number(temp) : undefined, humidity: humidity ? Number(humidity) : undefined }).then(() => { setTemp(""); setHumidity(""); }))}>
            Log
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Germination trial</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Seeds tested" type="number" value={tested} onChange={(e) => setTested(e.target.value)} />
          <Input placeholder="Germinated" type="number" value={germinated} onChange={(e) => setGerminated(e.target.value)} />
          <Button
            disabled={!tested || !germinated}
            onClick={() =>
              run(() =>
                createGerminationTrial
                  .mutateAsync({ seedLotId, seedsTested: Number(tested), seedsGerminated: Number(germinated) })
                  .then(() => { setTested(""); setGerminated(""); }),
              )
            }
          >
            Record
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Trial history</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {lot.germinationTrials?.map((t: any) => {
            const pct = (t.seedsGerminated / t.seedsTested) * 100;
            return (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <span>{new Date(t.trialDate).toLocaleDateString()}: {t.seedsGerminated}/{t.seedsTested}</span>
                <Badge variant={pct < 60 ? "destructive" : "success"}>{pct.toFixed(0)}%</Badge>
              </div>
            );
          })}
          {!lot.germinationTrials?.length && <p className="text-sm text-muted-foreground">No trials yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function NurseryBatchesTab({ farmId }: { farmId: string }) {
  const { data: crops } = useCrops();
  const { data: seedLots } = useSeedLots(farmId);
  const { data: batches } = useNurseryBatches();
  const { createNurseryBatch, updateNurseryStage } = useNurseryMutations();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [seedLotId, setSeedLotId] = React.useState("");
  const [externalSource, setExternalSource] = React.useState("");
  const [cropId, setCropId] = React.useState("");
  const [varietyId, setVarietyId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const varieties = crops?.find((c: any) => c.id === cropId)?.varieties ?? [];

  const submit = async () => {
    setError(null);
    try {
      await createNurseryBatch.mutateAsync({
        farmId, cropId, varietyId, quantity: Number(quantity),
        seedLotId: seedLotId || undefined,
        externalSourceNote: seedLotId ? undefined : externalSource || undefined,
      });
      setOpen(false);
      setSeedLotId(""); setExternalSource(""); setCropId(""); setVarietyId(""); setQuantity("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button>New nursery batch</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>New nursery batch</DialogTitle></DialogHeader>
          {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Crop</Label>
              <Select value={cropId} onValueChange={(v) => { setCropId(v); setVarietyId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                <SelectContent>{crops?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Variety</Label>
              <Select value={varietyId} onValueChange={setVarietyId} disabled={!cropId}>
                <SelectTrigger><SelectValue placeholder="Select variety" /></SelectTrigger>
                <SelectContent>{varieties.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Source seed lot (optional)</Label>
              <Select value={seedLotId} onValueChange={setSeedLotId}>
                <SelectTrigger><SelectValue placeholder="None — external source" /></SelectTrigger>
                <SelectContent>{seedLots?.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.lotNumber} ({l.currentBalance} {l.unit})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {!seedLotId && (
              <div className="space-y-1">
                <Label>External source (required if no seed lot)</Label>
                <Textarea value={externalSource} onChange={(e) => setExternalSource(e.target.value)} placeholder="e.g. Purchased seedlings from XYZ Nursery" />
              </div>
            )}
            <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button onClick={submit} disabled={!cropId || !varietyId || !quantity || (!seedLotId && !externalSource)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-3 md:grid-cols-3">
        {batches?.map((b: any) => (
          <Card key={b.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{b.variety?.crop?.name} — {b.variety?.name}</CardTitle>
              <CardDescription>{b.quantity} plants{b.seedLot ? ` · from ${b.seedLot.lotNumber}` : " · external source"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={b.stage} onValueChange={(v) => updateNurseryStage.mutate({ id: b.id, stage: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{NurseryStage.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function NurserySeedsPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: seedLots, isLoading } = useSeedLots(farmId);
  const { data: expiring } = useExpiringSeedLots(farmId);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Nursery and Seeds</h1>
        {hasPermission(PERMISSIONS.NURSERY_SEEDS_MANAGE) && farmId && <NewSeedLotDialog farmId={farmId} />}
      </div>

      {!!expiring?.length && (
        <Card className="border-warning">
          <CardContent className="p-3 text-sm">
            <span className="font-medium text-warning">Expiring soon: </span>
            {expiring.map((l: any) => l.lotNumber).join(", ")}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="lots">
        <TabsList>
          <TabsTrigger value="lots">Seed Lots</TabsTrigger>
          <TabsTrigger value="nursery">Nursery Batches</TabsTrigger>
        </TabsList>
        <TabsContent value="lots">
          <div className="grid gap-3 md:grid-cols-3">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {seedLots?.map((l: any) => (
              <Card key={l.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(l.id)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{l.variety?.crop?.name} — {l.variety?.name}</CardTitle>
                  <CardDescription>{l.lotNumber} · {l.classification}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{l.currentBalance} {l.unit} remaining</CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="nursery">{farmId && <NurseryBatchesTab farmId={farmId} />}</TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && <SeedLotDetail seedLotId={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
