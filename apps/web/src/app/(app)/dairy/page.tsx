"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useAnimals, useAnimal, useDairyMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimalSpecies, MilkSession, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function NewAnimalDialog({ farmId }: { farmId: string }) {
  const { createAnimal } = useDairyMutations();
  const [open, setOpen] = React.useState(false);
  const [animalTag, setAnimalTag] = React.useState("");
  const [name, setName] = React.useState("");
  const [species, setSpecies] = React.useState("COW");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createAnimal.mutateAsync({ farmId, animalTag, name, species });
      setOpen(false);
      setAnimalTag(""); setName("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New animal</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New animal</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Tag</Label><Input value={animalTag} onChange={(e) => setAnimalTag(e.target.value)} /></div>
            <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </div>
          <div className="space-y-1">
            <Label>Species</Label>
            <Select value={species} onValueChange={setSpecies}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{AnimalSpecies.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!animalTag}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnimalDetail({ animalId }: { animalId: string }) {
  const { data: animal } = useAnimal(animalId);
  const { recordMilkCollection, recordMilkQuality } = useDairyMutations();
  const [session, setSession] = React.useState("MORNING");
  const [qty, setQty] = React.useState("");
  const [fat, setFat] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [lastCollectionId, setLastCollectionId] = React.useState<string | null>(null);

  if (!animal) return null;

  return (
    <div className="space-y-4">
      <DialogHeader><DialogTitle>{animal.name ?? animal.animalTag} ({animal.species})</DialogTitle></DialogHeader>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Record milk collection</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Select value={session} onValueChange={setSession}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{MilkSession.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Litres" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          <Button
            disabled={!qty}
            onClick={async () => {
              setError(null);
              try {
                const c: any = await recordMilkCollection.mutateAsync({
                  farmId: animal.farmId, animalId, date: new Date().toISOString().slice(0, 10), session, quantityLitres: Number(qty),
                });
                setLastCollectionId(c.id);
                setQty("");
              } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
            }}
          >
            Record
          </Button>
        </CardContent>
      </Card>

      {lastCollectionId && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Quality test for last collection</CardTitle></CardHeader>
          <CardContent className="flex gap-2">
            <Input placeholder="Fat %" type="number" value={fat} onChange={(e) => setFat(e.target.value)} />
            <Button
              onClick={() => recordMilkQuality.mutate({ milkCollectionId: lastCollectionId, fat: Number(fat) }, { onSuccess: () => setFat("") })}
            >
              Save
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Recent collections</CardTitle></CardHeader>
        <CardContent className="space-y-1">
          {animal.milkCollections?.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span>{new Date(c.date).toLocaleDateString()} {c.session}</span>
              <span>{c.quantityLitres}L {c.qualityTest?.fat != null && `· Fat ${c.qualityTest.fat}%`}</span>
            </div>
          ))}
          {!animal.milkCollections?.length && <p className="text-sm text-muted-foreground">No collections yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DairyPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: animals, isLoading } = useAnimals(farmId);
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dairy</h1>
        {hasPermission(PERMISSIONS.DAIRY_MANAGE) && farmId && <NewAnimalDialog farmId={farmId} />}
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {animals?.map((a: any) => (
          <Card key={a.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(a.id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{a.name ?? a.animalTag}</CardTitle>
              <CardDescription>{a.animalTag} · {a.breed ?? a.species}</CardDescription>
            </CardHeader>
            <CardContent><Badge variant="success">{a.status}</Badge></CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && <AnimalDetail animalId={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
