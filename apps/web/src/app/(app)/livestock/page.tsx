"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useAnimals, useAnimal, useDairyMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function HealthRecordDialog({ animalId, open, onOpenChange }: { animalId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: animal } = useAnimal(animalId);
  const { addHealthRecord } = useDairyMutations();
  const [type, setType] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await addHealthRecord.mutateAsync({ animalId, type, description });
      setType(""); setDescription("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{animal?.name ?? animal?.animalTag} — Health records</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Type</Label><Input placeholder="Vaccination, Treatment…" value={type} onChange={(e) => setType(e.target.value)} /></div>
            <div className="space-y-1"><Label>Description</Label><Input value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          </div>
          <Button size="sm" onClick={submit} disabled={!type}>Add record</Button>
        </div>
        <div className="space-y-1 border-t pt-3">
          {animal?.healthRecords?.map((r: any) => (
            <div key={r.id} className="flex justify-between text-sm">
              <span>{r.type} — {r.description}</span>
              <span className="text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
            </div>
          ))}
          {!animal?.healthRecords?.length && <p className="text-sm text-muted-foreground">No health records yet.</p>}
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}

export default function LivestockPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: animals, isLoading } = useAnimals(farmId);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Livestock</h1>
        <p className="text-sm text-muted-foreground">Health, vaccination and husbandry records across all animals. Milk collection lives under Dairy.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {animals?.map((a: any) => (
          <Card key={a.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(a.id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{a.name ?? a.animalTag}</CardTitle>
              <CardDescription>{a.species} · {a.breed ?? "—"}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{a.healthStatus ?? "No known issues"}</CardContent>
          </Card>
        ))}
        {!animals?.length && !isLoading && <p className="text-sm text-muted-foreground">No animals recorded yet. Add one from the Dairy page.</p>}
      </div>
      {selected && <HealthRecordDialog animalId={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />}
    </div>
  );
}
