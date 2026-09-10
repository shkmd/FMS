"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useAssets, useAsset, useMaintenanceRequests, useMachineryMutations, useWorkers } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssetStatusBadge } from "@/components/status-badges";
import { AssetType, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function NewAssetDialog({ farmId }: { farmId: string }) {
  const { createAsset } = useMachineryMutations();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ assetCode: "", name: "", type: "TRACTOR" });

  const submit = async () => {
    setError(null);
    try {
      await createAsset.mutateAsync({ ...form, farmId });
      setOpen(false);
      setForm({ assetCode: "", name: "", type: "TRACTOR" });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create asset");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New asset</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Register asset</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Asset code</Label><Input value={form.assetCode} onChange={(e) => setForm({ ...form, assetCode: e.target.value })} /></div>
          <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-1">
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{AssetType.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!form.assetCode || !form.name || createAsset.isPending}>
            {createAsset.isPending ? "Creating…" : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AssetDetail({ assetId, onClose }: { assetId: string; onClose: () => void }) {
  const { data: asset } = useAsset(assetId);
  const { data: workers } = useWorkers();
  const { hasPermission } = useAuth();
  const { logUsage, reportIssue } = useMachineryMutations();
  const [error, setError] = React.useState<string | null>(null);
  const [hours, setHours] = React.useState("");
  const [operatorId, setOperatorId] = React.useState("");
  const [issueText, setIssueText] = React.useState("");

  if (!asset) return null;

  const run = async (fn: () => Promise<any>) => {
    setError(null);
    try { await fn(); } catch (e) { setError(e instanceof ApiError ? e.message : "Something went wrong"); }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {asset.name} <AssetStatusBadge status={asset.operationalStatus} />
        </DialogTitle>
      </DialogHeader>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><div className="text-muted-foreground">Code</div><div>{asset.assetCode}</div></div>
        <div><div className="text-muted-foreground">Type</div><div>{asset.type.replace(/_/g, " ")}</div></div>
        <div><div className="text-muted-foreground">Meter hours</div><div>{asset.meterHours?.toFixed(1) ?? 0}</div></div>
        <div><div className="text-muted-foreground">Service interval</div><div>{asset.serviceIntervalHours ?? "—"}</div></div>
      </div>

      {hasPermission(PERMISSIONS.MACHINERY_MANAGE) && asset.operationalStatus !== "UNDER_REPAIR" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Log usage</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Select value={operatorId} onValueChange={setOperatorId}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Operator" /></SelectTrigger>
              <SelectContent>{workers?.map((w: any) => <SelectItem key={w.id} value={w.id}>{w.employee?.name}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="Hours" type="number" className="w-24" value={hours} onChange={(e) => setHours(e.target.value)} />
            <Button
              disabled={!operatorId || !hours}
              onClick={() =>
                run(() => logUsage.mutateAsync({ assetId, operatorId, hoursUsed: Number(hours) }).then(() => { setHours(""); setOperatorId(""); }))
              }
            >
              Log
            </Button>
          </CardContent>
        </Card>
      )}

      {asset.operationalStatus !== "UNDER_REPAIR" && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Report an issue</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Textarea placeholder="Describe the issue" value={issueText} onChange={(e) => setIssueText(e.target.value)} />
            <Button
              variant="destructive"
              disabled={!issueText}
              onClick={() => run(() => reportIssue.mutateAsync({ assetId, issueDescription: issueText }).then(() => setIssueText("")))}
            >
              Report
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent usage</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {asset.usageLogs?.map((u: any) => (
            <div key={u.id} className="flex justify-between text-sm">
              <span>{new Date(u.date).toLocaleDateString()}</span>
              <span>{u.hoursUsed}h</span>
            </div>
          ))}
          {!asset.usageLogs?.length && <p className="text-sm text-muted-foreground">No usage logged yet.</p>}
        </CardContent>
      </Card>

      {asset.maintenanceRequests?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Maintenance history</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {asset.maintenanceRequests.map((r: any) => (
              <div key={r.id} className="rounded-md border p-2 text-sm">
                <div className="flex justify-between">
                  <span>{r.issueDescription}</span>
                  <Badge variant={r.status === "completed" ? "success" : "warning"}>{r.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MaintenanceTab() {
  const { hasPermission } = useAuth();
  const { data: requests } = useMaintenanceRequests();
  const { completeMaintenance } = useMachineryMutations();
  const open = requests?.filter((r: any) => r.status !== "completed") ?? [];

  return (
    <div className="space-y-2">
      {open.map((r: any) => (
        <Card key={r.id}>
          <CardContent className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{r.asset?.name}</div>
              <div className="text-sm text-muted-foreground">{r.issueDescription}</div>
            </div>
            {hasPermission(PERMISSIONS.MACHINERY_MANAGE) && (
              <Button size="sm" onClick={() => completeMaintenance.mutate({ id: r.id, type: "breakdown" })}>
                Mark repaired
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      {open.length === 0 && <p className="text-sm text-muted-foreground">No open maintenance requests.</p>}
    </div>
  );
}

export default function MachineryPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: assets, isLoading } = useAssets(farmId);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Machinery</h1>
        {hasPermission(PERMISSIONS.MACHINERY_MANAGE) && farmId && <NewAssetDialog farmId={farmId} />}
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        <TabsContent value="assets">
          <div className="grid gap-3 md:grid-cols-3">
            {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {assets?.map((a: any) => (
              <Card key={a.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(a.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{a.name}</CardTitle>
                    <AssetStatusBadge status={a.operationalStatus} />
                  </div>
                  <CardDescription>{a.assetCode} · {a.type.replace(/_/g, " ")}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {a.meterHours?.toFixed(1) ?? 0}h on meter
                  {a.dueForService && <Badge variant="warning" className="ml-2">Service due</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="maintenance"><MaintenanceTab /></TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && <AssetDetail assetId={selected} onClose={() => setSelected(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
