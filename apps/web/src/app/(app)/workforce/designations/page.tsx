"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useDepartments, useDesignations, useDesignationMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function DesignationDialog({
  farmId,
  designation,
  trigger,
}: {
  farmId: string;
  designation?: any;
  trigger: React.ReactNode;
}) {
  const { data: departments } = useDepartments();
  const { createDesignation, updateDesignation } = useDesignationMutations();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState(designation?.title ?? "");
  const [code, setCode] = React.useState(designation?.code ?? "");
  const [departmentId, setDepartmentId] = React.useState(designation?.departmentId ?? "");
  const [grade, setGrade] = React.useState(designation?.grade ?? "");
  const [description, setDescription] = React.useState(designation?.description ?? "");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      const payload = { title, code, departmentId: departmentId || undefined, grade: grade || undefined, description: description || undefined };
      if (designation) {
        await updateDesignation.mutateAsync({ id: designation.id, ...payload });
      } else {
        await createDesignation.mutateAsync({ farmId, ...payload });
        setTitle(""); setCode(""); setDepartmentId(""); setGrade(""); setDescription("");
      }
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{designation ? "Edit designation" : "New designation"}</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
          <div className="space-y-1">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Grade</Label><Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="e.g. L3" /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!title || !code}>{designation ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DesignationsPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: designations, isLoading } = useDesignations();
  const { deleteDesignation } = useDesignationMutations();
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Designations</h1>
        {canManage && farmId && <DesignationDialog farmId={farmId} trigger={<Button>New designation</Button>} />}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {designations?.map((d: any) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{d.title}</CardTitle>
              <CardDescription>{d.code}{d.grade ? ` · ${d.grade}` : ""}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="text-muted-foreground">{d.department?.name ?? "No department"}</div>
              {d.description && <p className="text-muted-foreground">{d.description}</p>}
              <div className="text-muted-foreground">{d._count?.employees ?? 0} employee{d._count?.employees === 1 ? "" : "s"}</div>
              {canManage && (
                <div className="flex gap-2 pt-1">
                  <DesignationDialog farmId={farmId} designation={d} trigger={<Button size="sm" variant="outline">Edit</Button>} />
                  <ConfirmDeleteDialog
                    triggerLabel="Delete"
                    title="Delete designation?"
                    description={`This will remove "${d.title}". Employees keep their record but lose this designation link.`}
                    onConfirm={() => deleteDesignation.mutateAsync(d.id)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!isLoading && !designations?.length && <p className="text-sm text-muted-foreground">No designations yet.</p>}
      </div>
    </div>
  );
}
