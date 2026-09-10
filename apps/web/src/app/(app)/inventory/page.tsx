"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useFarms,
  useInventoryItems,
  useInventoryMutations,
  useStockLocations,
  useStockMovements,
} from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportCsvButton } from "@/components/export-csv-button";
import { InventoryCategory, StockMovementType, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function balanceOf(item: any): number {
  return (item.batches ?? []).reduce((sum: number, b: any) => sum + b.quantity, 0);
}

function NewItemDialog({ farmId }: { farmId: string }) {
  const { createItem } = useInventoryMutations();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: "", category: "TOOLS", unit: "kg", minStockLevel: "" });

  const submit = async () => {
    setError(null);
    try {
      await createItem.mutateAsync({ ...form, farmId, minStockLevel: form.minStockLevel ? Number(form.minStockLevel) : undefined });
      setOpen(false);
      setForm({ name: "", category: "TOOLS", unit: "kg", minStockLevel: "" });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New item</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New inventory item</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{InventoryCategory.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            <div className="space-y-1"><Label>Min stock level</Label><Input type="number" value={form.minStockLevel} onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!form.name || createItem.isPending}>{createItem.isPending ? "Creating…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ItemDetail({ item }: { item: any }) {
  const { data: movements } = useStockMovements(item.id);
  const { data: locations } = useStockLocations();
  const { hasPermission } = useAuth();
  const { receiveStock, issueStock } = useInventoryMutations();
  const [error, setError] = React.useState<string | null>(null);
  const [receiveQty, setReceiveQty] = React.useState("");
  const [receiveLocation, setReceiveLocation] = React.useState("");
  const [issueBatchId, setIssueBatchId] = React.useState("");
  const [issueQty, setIssueQty] = React.useState("");
  const [issueType, setIssueType] = React.useState<string>("CONSUMPTION");

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    try { await fn(); } catch (e) { setError(e instanceof ApiError ? e.message : "Something went wrong"); }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {item.name}
          {item.minStockLevel != null && balanceOf(item) <= item.minStockLevel && <Badge variant="warning">Low stock</Badge>}
        </DialogTitle>
      </DialogHeader>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div><div className="text-muted-foreground">Balance</div><div className="font-medium">{balanceOf(item)} {item.unit}</div></div>
        <div><div className="text-muted-foreground">Category</div><div>{item.category.replace(/_/g, " ")}</div></div>
        <div><div className="text-muted-foreground">Min level</div><div>{item.minStockLevel ?? "—"}</div></div>
      </div>

      {hasPermission(PERMISSIONS.INVENTORY_MANAGE) && (
        <>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Receive stock</CardTitle></CardHeader>
            <CardContent className="flex gap-2">
              <Input placeholder="Quantity" type="number" value={receiveQty} onChange={(e) => setReceiveQty(e.target.value)} />
              <Select value={receiveLocation} onValueChange={setReceiveLocation}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>{locations?.map((l: any) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button
                disabled={!receiveQty}
                onClick={() =>
                  run(() =>
                    receiveStock
                      .mutateAsync({ itemId: item.id, quantity: Number(receiveQty), unit: item.unit, storageLocationId: receiveLocation || undefined })
                      .then(() => setReceiveQty("")),
                  )
                }
              >
                Receive
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Issue / consume stock</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Select value={issueBatchId} onValueChange={setIssueBatchId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Batch" /></SelectTrigger>
                  <SelectContent>
                    {item.batches?.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.batchNumber ?? b.id.slice(0, 8)} ({b.quantity} {b.unit})</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {StockMovementType.filter((t) => !["PURCHASE_RECEIPT", "INTERNAL_PRODUCTION", "TRANSFER"].includes(t)).map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Quantity" type="number" value={issueQty} onChange={(e) => setIssueQty(e.target.value)} />
                <Button
                  variant="outline"
                  disabled={!issueBatchId || !issueQty}
                  onClick={() =>
                    run(() =>
                      issueStock
                        .mutateAsync({ batchId: issueBatchId, quantity: Number(issueQty), movementType: issueType })
                        .then(() => setIssueQty("")),
                    )
                  }
                >
                  Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent movements</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {movements?.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between text-sm">
              <span>{m.movementType.replace(/_/g, " ")}</span>
              <span className="text-muted-foreground">{m.quantity} {m.unit} · {new Date(m.occurredAt).toLocaleString()}</span>
            </div>
          ))}
          {!movements?.length && <p className="text-sm text-muted-foreground">No movements yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function LocationsTab() {
  const { data: locations } = useStockLocations();
  const { createLocation } = useInventoryMutations();
  const [name, setName] = React.useState("");
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="New location name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
        <Button disabled={!name} onClick={() => createLocation.mutate({ name }, { onSuccess: () => setName("") })}>Add</Button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {locations?.map((l: any) => (
          <Card key={l.id}><CardContent className="p-3 text-sm">{l.name}</CardContent></Card>
        ))}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: items, isLoading } = useInventoryItems(farmId);
  const [selected, setSelected] = React.useState<any>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <div className="flex gap-2">
          <ExportCsvButton
            filename="inventory-items"
            rows={(items ?? []).map((it: any) => ({
              name: it.name,
              category: it.category,
              balance: balanceOf(it),
              unit: it.unit,
              minStockLevel: it.minStockLevel ?? "",
            }))}
          />
          {hasPermission(PERMISSIONS.INVENTORY_MANAGE) && farmId && <NewItemDialog farmId={farmId} />}
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                  <tr><th className="p-3">Item</th><th className="p-3">Category</th><th className="p-3">Balance</th><th className="p-3">Min level</th></tr>
                </thead>
                <tbody>
                  {isLoading && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Loading…</td></tr>}
                  {items?.map((it: any) => {
                    const bal = balanceOf(it);
                    const low = it.minStockLevel != null && bal <= it.minStockLevel;
                    return (
                      <tr key={it.id} className="cursor-pointer border-b last:border-0 hover:bg-accent" onClick={() => setSelected(it)}>
                        <td className="p-3 font-medium">{it.name}</td>
                        <td className="p-3">{it.category.replace(/_/g, " ")}</td>
                        <td className="p-3">{bal} {it.unit} {low && <Badge variant="warning" className="ml-2">Low</Badge>}</td>
                        <td className="p-3 text-muted-foreground">{it.minStockLevel ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations"><LocationsTab /></TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          {selected && <ItemDetail item={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
