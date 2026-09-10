"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ApiError } from "@/lib/api-client";

export function ConfirmDeleteDialog({
  triggerLabel = "Delete",
  title,
  description,
  onConfirm,
}: {
  triggerLabel?: string;
  title: string;
  description: string;
  onConfirm: () => Promise<unknown>;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const confirm = async () => {
    setError(null);
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete");
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
          <Trash2 className="h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
          <Button variant="destructive" onClick={confirm} disabled={pending}>{pending ? "Deleting…" : "Delete"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
