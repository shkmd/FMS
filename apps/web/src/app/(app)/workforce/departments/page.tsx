"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useDepartments, useDepartmentMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

function DepartmentDialog({
  farmId,
  department,
  trigger,
}: {
  farmId: string;
  department?: any;
  trigger: React.ReactNode;
}) {
  const { createDepartment, updateDepartment } = useDepartmentMutations();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(department?.name ?? "");
  const [code, setCode] = React.useState(department?.code ?? "");
  const [description, setDescription] = React.useState(department?.description ?? "");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      if (department) {
        await updateDepartment.mutateAsync({ id: department.id, name, code, description });
      } else {
        await createDepartment.mutateAsync({ farmId, name, code, description });
        setName(""); setCode(""); setDescription("");
      }
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{department ? "Edit department" : "New department"}</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="space-y-1"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={!name || !code}>{department ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DepartmentsPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: departments, isLoading } = useDepartments();
  const { deleteDepartment } = useDepartmentMutations();
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>
        {canManage && farmId && <DepartmentDialog farmId={farmId} trigger={<Button>New department</Button>} />}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {departments?.map((d: any) => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{d.name}</CardTitle>
              <CardDescription>{d.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {d.description && <p className="text-muted-foreground">{d.description}</p>}
              <div className="text-muted-foreground">
                {d._count?.employees ?? 0} employee{d._count?.employees === 1 ? "" : "s"} · {d._count?.designations ?? 0} designation
                {d._count?.designations === 1 ? "" : "s"}
              </div>
              {canManage && (
                <div className="flex gap-2 pt-1">
                  <DepartmentDialog farmId={farmId} department={d} trigger={<Button size="sm" variant="outline">Edit</Button>} />
                  <ConfirmDeleteDialog
                    triggerLabel="Delete"
                    title="Delete department?"
                    description={`This will remove "${d.name}". Employees keep their record but lose this department link.`}
                    onConfirm={() => deleteDepartment.mutateAsync(d.id)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!isLoading && !departments?.length && <p className="text-sm text-muted-foreground">No departments yet.</p>}
      </div>
    </div>
  );
}
