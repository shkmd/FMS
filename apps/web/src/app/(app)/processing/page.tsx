"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useHarvestBatches, useProductionBatches, useProcessingMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function NewProductionBatchDialog({ farmId }: { farmId: string }) {
  const { data: harvestBatches } = useHarvestBatches();
  const { createProductionBatch } = useProcessingMutations();
  const [open, setOpen] = React.useState(false);
  const [productName, setProductName] = React.useState("");
  const [harvestBatchId, setHarvestBatchId] = React.useState("");
  const [rawQty, setRawQty] = React.useState("");
  const [rawUnit, setRawUnit] = React.useState("litre");
  const [outQty, setOutQty] = React.useState("");
  const [outUnit, setOutUnit] = React.useState("kg");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createProductionBatch.mutateAsync({
        farmId,
        productName,
        inputs: [{ sourceType: "harvestBatch", harvestBatchId, quantity: Number(rawQty), unit: rawUnit }],
        outputs: [{ productName, quantity: Number(outQty), unit: outUnit }],
      });
      setOpen(false);
      setProductName(""); setHarvestBatchId(""); setRawQty(""); setOutQty("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New production batch</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New production batch</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Product name (e.g. Ghee, Butter)</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
          <div className="space-y-1">
            <Label>Raw material source (harvest batch)</Label>
            <Select value={harvestBatchId} onValueChange={setHarvestBatchId}>
              <SelectTrigger><SelectValue placeholder="Select source batch" /></SelectTrigger>
              <SelectContent>{harvestBatches?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.batchNumber}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Raw qty</Label><Input type="number" value={rawQty} onChange={(e) => setRawQty(e.target.value)} /></div>
            <div className="space-y-1"><Label>Raw unit</Label><Input value={rawUnit} onChange={(e) => setRawUnit(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Finished qty</Label><Input type="number" value={outQty} onChange={(e) => setOutQty(e.target.value)} /></div>
            <div className="space-y-1"><Label>Finished unit</Label><Input value={outUnit} onChange={(e) => setOutUnit(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!productName || !harvestBatchId || !rawQty || !outQty}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProcessingPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: batches, isLoading } = useProductionBatches(farmId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Processing</h1>
        {hasPermission(PERMISSIONS.PROCESSING_MANAGE) && farmId && <NewProductionBatchDialog farmId={farmId} />}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {batches?.map((b: any) => (
          <Card key={b.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{b.productName}</CardTitle>
              <CardDescription>{b.batchNumber} · {new Date(b.productionDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Raw: {b.rawQuantity} → Finished: {b.finishedQuantity} (waste: {b.wasteQuantity})
            </CardContent>
          </Card>
        ))}
        {!batches?.length && !isLoading && <p className="text-sm text-muted-foreground">No production batches yet.</p>}
      </div>
    </div>
  );
}
