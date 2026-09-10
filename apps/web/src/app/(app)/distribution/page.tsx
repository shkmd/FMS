"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useRecipients, useDispatches, useDistributionMutations, useHarvestBatches } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipientType, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const STATUS_VARIANT: Record<string, any> = { PENDING: "warning", IN_TRANSIT: "secondary", DELIVERED: "success", FAILED: "destructive" };

function NewRecipientDialog({ farmId }: { farmId: string }) {
  const { createRecipient } = useDistributionMutations();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState("CLIENT");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">New recipient</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New recipient</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{RecipientType.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button disabled={!name} onClick={() => createRecipient.mutate({ name, type, farmId }, { onSuccess: () => { setOpen(false); setName(""); } })}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewDispatchDialog({ farmId }: { farmId: string }) {
  const { data: recipients } = useRecipients(farmId);
  const { data: batches } = useHarvestBatches();
  const { createDispatch } = useDistributionMutations();
  const [open, setOpen] = React.useState(false);
  const [recipientId, setRecipientId] = React.useState("");
  const [harvestBatchId, setHarvestBatchId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createDispatch.mutateAsync({
        farmId, recipientId,
        items: [{ harvestBatchId, quantity: Number(quantity), unit: "kg" }],
      });
      setOpen(false);
      setRecipientId(""); setHarvestBatchId(""); setQuantity("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New dispatch</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New dispatch</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Recipient</Label>
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
              <SelectContent>{recipients?.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Harvest batch</Label>
            <Select value={harvestBatchId} onValueChange={setHarvestBatchId}>
              <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>{batches?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.batchNumber} ({b.netQuantity}kg net)</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Quantity (kg)</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!recipientId || !harvestBatchId || !quantity}>Dispatch</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DistributionPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: recipients } = useRecipients(farmId);
  const { data: dispatches } = useDispatches();
  const { recordPod } = useDistributionMutations();
  const canManage = hasPermission(PERMISSIONS.DISTRIBUTION_MANAGE);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Distribution</h1>

      <Tabs defaultValue="dispatches">
        <TabsList>
          <TabsTrigger value="dispatches">Dispatches</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
        </TabsList>

        <TabsContent value="dispatches" className="space-y-3">
          {canManage && farmId && <NewDispatchDialog farmId={farmId} />}
          <div className="space-y-2">
            {dispatches?.map((d: any) => (
              <Card key={d.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{d.dispatchNumber} → {d.recipient?.name}</div>
                    <div className="text-sm text-muted-foreground">{d.items.length} item(s) · {new Date(d.dispatchDate).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[d.deliveryStatus]}>{d.deliveryStatus.replace(/_/g, " ")}</Badge>
                    {canManage && d.deliveryStatus !== "DELIVERED" && (
                      <Button size="sm" onClick={() => recordPod.mutate({ id: d.id, receivedByName: d.recipient?.name })}>
                        Mark delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!dispatches?.length && <p className="text-sm text-muted-foreground">No dispatches yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="recipients" className="space-y-3">
          {canManage && farmId && <NewRecipientDialog farmId={farmId} />}
          <div className="grid gap-2 md:grid-cols-3">
            {recipients?.map((r: any) => (
              <Card key={r.id}>
                <CardHeader className="pb-2"><CardTitle className="text-base">{r.name}</CardTitle><CardDescription>{r.type.replace(/_/g, " ")}</CardDescription></CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
