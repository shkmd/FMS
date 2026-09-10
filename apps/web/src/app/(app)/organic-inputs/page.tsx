"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, usePlots, useOrganicRecipes, useOrganicBatches, useOrganicInputMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const RECIPE_PRESETS = ["Jeevamritham", "Panchagavya", "Fermented Rice Water", "Neem Oil Mixture", "Cow Dung Slurry", "Compost"];

function NewRecipeDialog() {
  const { createRecipe } = useOrganicInputMutations();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">New recipe</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New recipe</DialogTitle></DialogHeader>
        <div className="space-y-1">
          <Label>Name</Label>
          <Select value={name} onValueChange={setName}>
            <SelectTrigger><SelectValue placeholder="Select or type below" /></SelectTrigger>
            <SelectContent>{RECIPE_PRESETS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button disabled={!name} onClick={() => createRecipe.mutate({ name, category: name }, { onSuccess: () => { setOpen(false); setName(""); } })}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewBatchDialog({ farmId }: { farmId: string }) {
  const { data: recipes } = useOrganicRecipes();
  const { createBatch } = useOrganicInputMutations();
  const [open, setOpen] = React.useState(false);
  const [recipeId, setRecipeId] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [unit, setUnit] = React.useState("litre");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createBatch.mutateAsync({ farmId, recipeId, availableQuantity: Number(qty), unit });
      setOpen(false);
      setRecipeId(""); setQty("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New batch</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New preparation batch</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Recipe</Label>
            <Select value={recipeId} onValueChange={setRecipeId}>
              <SelectTrigger><SelectValue placeholder="Select recipe" /></SelectTrigger>
              <SelectContent>{recipes?.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Quantity produced</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
            <div className="space-y-1"><Label>Unit</Label><Input value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!recipeId || !qty}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplyBatchDialog({ batch, farmId }: { batch: any; farmId: string }) {
  const { data: plots } = usePlots(farmId);
  const { createApplication } = useOrganicInputMutations();
  const [open, setOpen] = React.useState(false);
  const [targetId, setTargetId] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createApplication.mutateAsync({ farmId, batchId: batch.id, targetType: "plot", targetId, quantity: Number(qty), unit: batch.unit });
      setOpen(false);
      setQty("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Apply</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Apply {batch.recipe?.name}</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Plot</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger><SelectValue placeholder="Select plot" /></SelectTrigger>
              <SelectContent>{plots?.map((p: any) => <SelectItem key={p.id} value={p.id}>Plot {p.code}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Quantity ({batch.unit}) — {batch.availableQuantity} available</Label><Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!targetId || !qty}>Apply</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrganicInputsPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: batches, isLoading } = useOrganicBatches();
  const canManage = hasPermission(PERMISSIONS.ORGANIC_INPUTS_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Organic Inputs</h1>
        {canManage && (
          <div className="flex gap-2">
            <NewRecipeDialog />
            {farmId && <NewBatchDialog farmId={farmId} />}
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {batches?.map((b: any) => (
          <Card key={b.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{b.recipe?.name}</CardTitle>
              <CardDescription>{b.batchNumber} · prepared {new Date(b.preparationDate).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <span>{b.availableQuantity} {b.unit} available</span>
              {canManage && farmId && <ApplyBatchDialog batch={b} farmId={farmId} />}
            </CardContent>
          </Card>
        ))}
        {!batches?.length && !isLoading && <p className="text-sm text-muted-foreground">No batches prepared yet.</p>}
      </div>
    </div>
  );
}
