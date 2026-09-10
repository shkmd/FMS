"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useEmployees, useEmployee, useSkills, useEmployeeMutations, useDepartments, useDesignations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { EmploymentCategory, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

type EmployeeForm = {
  employeeCode: string;
  name: string;
  phone: string;
  departmentId: string;
  designationId: string;
  employmentCategory: string;
  joinDate: string;
  isFieldWorker: boolean;
  availability: boolean;
  workRestrictions: string;
  skillIds: string[];
};

const emptyForm: EmployeeForm = {
  employeeCode: "",
  name: "",
  phone: "",
  departmentId: "",
  designationId: "",
  employmentCategory: "DAILY_WAGE",
  joinDate: "",
  isFieldWorker: false,
  availability: true,
  workRestrictions: "",
  skillIds: [],
};

function SkillPicker({ selected, onChange }: { selected: string[]; onChange: (ids: string[]) => void }) {
  const { data: skills } = useSkills();
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills?.map((s: any) => (
        <button
          type="button"
          key={s.id}
          onClick={() => toggle(s.id)}
          className={`rounded-full border px-2.5 py-0.5 text-xs ${selected.includes(s.id) ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground"}`}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}

function EmployeeFormFields({ form, setForm }: { form: EmployeeForm; setForm: (f: EmployeeForm) => void }) {
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const filteredDesignations = form.departmentId ? designations?.filter((d: any) => d.departmentId === form.departmentId) : designations;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Employee code</Label><Input value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} /></div>
        <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1">
          <Label>Department</Label>
          <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>{departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Designation</Label>
          <Select value={form.designationId} onValueChange={(v) => setForm({ ...form, designationId: v })}>
            <SelectTrigger><SelectValue placeholder="Select designation" /></SelectTrigger>
            <SelectContent>{filteredDesignations?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Employment category</Label>
          <Select value={form.employmentCategory} onValueChange={(v) => setForm({ ...form, employmentCategory: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{EmploymentCategory.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1"><Label>Join date</Label><Input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} /></div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isFieldWorker} onChange={(e) => setForm({ ...form, isFieldWorker: e.target.checked })} />
        This person is a field worker (assignable to tasks, marks attendance)
      </label>
      {form.isFieldWorker && (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.checked })} />
            Currently available for assignment
          </label>
          <div className="space-y-1">
            <Label>Work restrictions (optional)</Label>
            <Textarea placeholder="e.g. no heavy lifting, no pesticide handling" value={form.workRestrictions} onChange={(e) => setForm({ ...form, workRestrictions: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Skills</Label>
            <SkillPicker selected={form.skillIds} onChange={(skillIds) => setForm({ ...form, skillIds })} />
          </div>
        </>
      )}
    </div>
  );
}

function NewEmployeeDialog({ farmId }: { farmId: string }) {
  const { createEmployee } = useEmployeeMutations();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<EmployeeForm>(emptyForm);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createEmployee.mutateAsync({ ...form, farmId, joinDate: form.joinDate || undefined });
      setOpen(false);
      setForm(emptyForm);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create employee");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New employee</Button></DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>New employee</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <EmployeeFormFields form={form} setForm={setForm} />
        <DialogFooter>
          <Button onClick={submit} disabled={!form.employeeCode || !form.name || createEmployee.isPending}>
            {createEmployee.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmployeeDetailDialog({ employeeId, open, onOpenChange }: { employeeId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: employee } = useEmployee(employeeId);
  const { updateEmployee, deleteEmployee } = useEmployeeMutations();
  const [form, setForm] = React.useState<EmployeeForm | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (employee) {
      setForm({
        employeeCode: employee.employeeCode,
        name: employee.name,
        phone: employee.phone ?? "",
        departmentId: employee.departmentId ?? "",
        designationId: employee.designationId ?? "",
        employmentCategory: employee.employmentCategory,
        joinDate: employee.joinDate ? employee.joinDate.slice(0, 10) : "",
        isFieldWorker: !!employee.worker,
        availability: employee.worker?.availability ?? true,
        workRestrictions: employee.worker?.workRestrictions ?? "",
        skillIds: employee.worker?.skills?.map((s: any) => s.skillId) ?? [],
      });
    }
  }, [employee]);

  if (!employee || !form) return null;

  const currentTask = employee.worker?.taskAssignments?.[0]?.task;

  const save = async () => {
    setError(null);
    try {
      await updateEmployee.mutateAsync({ id: employeeId, ...form, joinDate: form.joinDate || undefined });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update employee");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader className="flex-row items-center justify-between space-y-0">
          <DialogTitle>{employee.name}</DialogTitle>
        </DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}

        <div className="space-y-2 rounded-md border p-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={employee.status === "ACTIVE" ? "success" : "muted"}>{employee.status}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Current task</span><span>{currentTask ? `${currentTask.taskNumber} — ${currentTask.category}` : "None"}</span></div>
        </div>

        <EmployeeFormFields form={form} setForm={setForm} />

        <DialogFooter className="justify-between sm:justify-between">
          <ConfirmDeleteDialog
            title={`Remove ${employee.name}?`}
            description="This deactivates the employee record. Their task/attendance history is preserved."
            onConfirm={() => deleteEmployee.mutateAsync(employeeId).then(() => onOpenChange(false))}
          />
          <Button onClick={save} disabled={updateEmployee.isPending}>{updateEmployee.isPending ? "Saving…" : "Save changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function WorkforcePage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: employees, isLoading } = useEmployees();
  const [selected, setSelected] = React.useState<string | null>(null);
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Workforce</h1>
        {canManage && farmId && <NewEmployeeDialog farmId={farmId} />}
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Department</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Category</th>
                <th className="p-3">Availability</th>
                <th className="p-3">Skills</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={8} className="p-4 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {employees?.map((e: any) => (
                <tr key={e.id} className="cursor-pointer border-b last:border-0 hover:bg-accent" onClick={() => setSelected(e.id)}>
                  <td className="p-3 text-muted-foreground">{e.employeeCode}</td>
                  <td className="p-3 font-medium">{e.name}</td>
                  <td className="p-3 text-muted-foreground">{e.phone || "—"}</td>
                  <td className="p-3">{e.department?.name || "—"}</td>
                  <td className="p-3">{e.designation?.title || "—"}</td>
                  <td className="p-3">{e.employmentCategory.replace(/_/g, " ")}</td>
                  <td className="p-3">
                    {e.worker ? <Badge variant={e.worker.availability ? "success" : "muted"}>{e.worker.availability ? "Available" : "Unavailable"}</Badge> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {e.worker?.skills?.map((s: any) => (
                        <Badge key={s.skillId} variant="muted">{s.skill.name}</Badge>
                      ))}
                      {!e.worker?.skills?.length && <span className="text-muted-foreground">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {selected && <EmployeeDetailDialog employeeId={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />}
    </div>
  );
}
