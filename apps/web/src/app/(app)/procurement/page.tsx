"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useFarms,
  useVendors,
  useRequisitions,
  usePurchaseOrders,
  useProcurementMutations,
  useInventoryItems,
} from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const STATUS_VARIANT: Record<string, "success" | "destructive" | "warning" | "secondary" | "muted"> = {
  submitted: "warning",
  approved: "success",
  rejected: "destructive",
  converted: "secondary",
  ordered: "warning",
  received: "success",
};

function NewVendorDialog({ farmId }: { farmId: string }) {
  const { createVendor } = useProcurementMutations();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">New vendor</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New vendor</DialogTitle></DialogHeader>
        <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter>
          <Button disabled={!name} onClick={() => createVendor.mutate({ name, farmId }, { onSuccess: () => { setOpen(false); setName(""); } })}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewRequisitionDialog({ farmId }: { farmId: string }) {
  const { data: items } = useInventoryItems(farmId);
  const { createRequisition } = useProcurementMutations();
  const [open, setOpen] = React.useState(false);
  const [itemId, setItemId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("kg");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createRequisition.mutateAsync({ farmId, lines: [{ itemId, quantity: Number(quantity), unit }] });
      setOpen(false);
      setItemId(""); setQuantity("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New requisition</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New purchase requisition</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Item</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
              <SelectContent>{items?.map((it: any) => <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Quantity</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div className="space-y-1"><Label>Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!itemId || !quantity}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewPurchaseOrderDialog({ farmId, requisitionId, onDone }: { farmId: string; requisitionId?: string; onDone?: () => void }) {
  const { data: items } = useInventoryItems(farmId);
  const { data: vendors } = useVendors(farmId);
  const { createPurchaseOrder } = useProcurementMutations();
  const [open, setOpen] = React.useState(false);
  const [vendorId, setVendorId] = React.useState("");
  const [itemId, setItemId] = React.useState("");
  const [quantity, setQuantity] = React.useState("");
  const [unit, setUnit] = React.useState("kg");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createPurchaseOrder.mutateAsync({
        farmId,
        requisitionId,
        vendorId,
        lines: [{ itemId, quantity: Number(quantity), unit, unitPrice: Number(unitPrice) }],
      });
      setOpen(false);
      onDone?.();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size={requisitionId ? "sm" : "default"}>{requisitionId ? "Convert to PO" : "New purchase order"}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New purchase order</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Vendor</Label>
            <Select value={vendorId} onValueChange={setVendorId}>
              <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
              <SelectContent>{vendors?.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Item</Label>
            <Select value={itemId} onValueChange={setItemId}>
              <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
              <SelectContent>{items?.map((it: any) => <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1"><Label>Qty</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></div>
            <div className="space-y-1"><Label>Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
            <div className="space-y-1"><Label>Unit price</Label><Input type="number" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!vendorId || !itemId || !quantity || !unitPrice}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ReceiveGoodsDialog({ order }: { order: any }) {
  const { createGoodsReceipt } = useProcurementMutations();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createGoodsReceipt.mutateAsync({
        purchaseOrderId: order.id,
        lines: order.lines.map((l: any) => ({ itemId: l.itemId, quantityReceived: l.quantity, unit: l.unit })),
      });
      setOpen(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Receive goods</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Receive against {order.poNumber}</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <p className="text-sm text-muted-foreground">Confirms full receipt of all {order.lines.length} line(s) into inventory.</p>
        <DialogFooter><Button onClick={submit}>Confirm receipt</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function ProcurementPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: vendors } = useVendors(farmId);
  const { data: requisitions } = useRequisitions();
  const { data: orders } = usePurchaseOrders();
  const { decideRequisition } = useProcurementMutations();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Procurement</h1>

      <Tabs defaultValue="requisitions">
        <TabsList>
          <TabsTrigger value="requisitions">Requisitions</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="requisitions" className="space-y-3">
          {hasPermission(PERMISSIONS.PROCUREMENT_MANAGE) && farmId && <NewRequisitionDialog farmId={farmId} />}
          <div className="space-y-2">
            {requisitions?.map((r: any) => (
              <Card key={r.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{r.lines.length} line item(s)</div>
                    <div className="text-sm text-muted-foreground">Needed by {r.neededBy ? new Date(r.neededBy).toLocaleDateString() : "—"}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "muted"}>{r.status}</Badge>
                    {r.status === "submitted" && hasPermission(PERMISSIONS.PROCUREMENT_APPROVE) && (
                      <>
                        <Button size="sm" onClick={() => decideRequisition.mutate({ id: r.id, approve: true })}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => decideRequisition.mutate({ id: r.id, approve: false })}>Reject</Button>
                      </>
                    )}
                    {r.status === "approved" && farmId && <NewPurchaseOrderDialog farmId={farmId} requisitionId={r.id} />}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!requisitions?.length && <p className="text-sm text-muted-foreground">No requisitions yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-3">
          {hasPermission(PERMISSIONS.PROCUREMENT_MANAGE) && farmId && <NewPurchaseOrderDialog farmId={farmId} />}
          <div className="space-y-2">
            {orders?.map((o: any) => (
              <Card key={o.id}>
                <CardContent className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium">{o.poNumber} — {o.vendor?.name}</div>
                    <div className="text-sm text-muted-foreground">₹{Number(o.totalAmount).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANT[o.status] ?? "muted"}>{o.status}</Badge>
                    {o.status === "ordered" && hasPermission(PERMISSIONS.INVENTORY_MANAGE) && <ReceiveGoodsDialog order={o} />}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!orders?.length && <p className="text-sm text-muted-foreground">No purchase orders yet.</p>}
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-3">
          {hasPermission(PERMISSIONS.PROCUREMENT_MANAGE) && farmId && <NewVendorDialog farmId={farmId} />}
          <div className="grid gap-2 md:grid-cols-3">
            {vendors?.map((v: any) => <Card key={v.id}><CardContent className="p-3 text-sm">{v.name}</CardContent></Card>)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
