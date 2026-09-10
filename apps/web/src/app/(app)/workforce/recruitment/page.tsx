"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import {
  useFarms,
  useDepartments,
  useDesignations,
  useJobRequisitions,
  useJobRequisition,
  useRecruitmentMutations,
} from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GenericStatusBadge } from "@/components/status-badges";
import { EmploymentCategory, PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const REQUISITION_VARIANT: Record<string, any> = { OPEN: "success", IN_PROGRESS: "default", ON_HOLD: "warning", CLOSED: "muted", CANCELLED: "destructive" };
const STAGE_VARIANT: Record<string, any> = {
  APPLIED: "muted", SCREENING: "secondary", INTERVIEW: "default", OFFER: "warning", HIRED: "success", REJECTED: "destructive", WITHDRAWN: "muted",
};
const NEXT_STAGES: Record<string, string[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["REJECTED"],
};

function NewRequisitionDialog({ farmId }: { farmId: string }) {
  const { data: departments } = useDepartments();
  const { data: designations } = useDesignations();
  const { createRequisition } = useRecruitmentMutations();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState("");
  const [designationId, setDesignationId] = React.useState("");
  const [openings, setOpenings] = React.useState("1");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createRequisition.mutateAsync({
        farmId, title, departmentId: departmentId || undefined, designationId: designationId || undefined,
        openings: Number(openings) || 1, description: description || undefined,
      });
      setOpen(false);
      setTitle(""); setDepartmentId(""); setDesignationId(""); setOpenings("1"); setDescription("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New requisition</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New job requisition</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{departments?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Designation</Label>
              <Select value={designationId} onValueChange={setDesignationId}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>{designations?.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>Openings</Label><Input type="number" min={1} value={openings} onChange={(e) => setOpenings(e.target.value)} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!title}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewApplicationDialog({ requisitionId }: { requisitionId: string }) {
  const { createApplication } = useRecruitmentMutations();
  const [open, setOpen] = React.useState(false);
  const [candidateName, setCandidateName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createApplication.mutateAsync({ requisitionId, candidateName, phone: phone || undefined, email: email || undefined });
      setOpen(false);
      setCandidateName(""); setPhone(""); setEmail("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Add candidate</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New application</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Candidate name</Label><Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} /></div>
          <div className="space-y-1"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="space-y-1"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!candidateName}>Add</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HireDialog({ applicationId, candidateName }: { applicationId: string; candidateName: string }) {
  const { hireApplication } = useRecruitmentMutations();
  const [open, setOpen] = React.useState(false);
  const [employeeCode, setEmployeeCode] = React.useState("");
  const [employmentCategory, setEmploymentCategory] = React.useState<string>("PERMANENT");
  const [phone, setPhone] = React.useState("");
  const [joinDate, setJoinDate] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await hireApplication.mutateAsync({ id: applicationId, employeeCode, employmentCategory, phone: phone || undefined, joinDate: joinDate || undefined });
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Hire</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Hire {candidateName}</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <p className="text-sm text-muted-foreground">Creates the employee record, starts onboarding automatically, and links this application.</p>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Employee code</Label><Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} /></div>
          <div className="space-y-1">
            <Label>Employment category</Label>
            <Select value={employmentCategory} onValueChange={setEmploymentCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{EmploymentCategory.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="space-y-1"><Label>Join date</Label><Input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!employeeCode}>Hire</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequisitionDetail({ id }: { id: string }) {
  const { data: req } = useJobRequisition(id);
  const { hasPermission } = useAuth();
  const { updateApplicationStage } = useRecruitmentMutations();
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);
  const [error, setError] = React.useState<string | null>(null);

  if (!req) return null;

  const setStage = async (id: string, stage: string) => {
    setError(null);
    try { await updateApplicationStage.mutateAsync({ id, stage }); } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {req.title} <GenericStatusBadge status={req.status} map={REQUISITION_VARIANT} />
        </DialogTitle>
      </DialogHeader>
      {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><div className="text-muted-foreground">Department</div><div>{req.department?.name ?? "—"}</div></div>
        <div><div className="text-muted-foreground">Designation</div><div>{req.designation?.title ?? "—"}</div></div>
        <div><div className="text-muted-foreground">Openings</div><div>{req.openings}</div></div>
        <div><div className="text-muted-foreground">Hired</div><div>{req.applications?.filter((a: any) => a.stage === "HIRED").length ?? 0}</div></div>
      </div>
      {req.description && <p className="text-sm text-muted-foreground">{req.description}</p>}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Candidates</h3>
        {canManage && <NewApplicationDialog requisitionId={req.id} />}
      </div>
      <div className="space-y-2">
        {req.applications?.map((a: any) => (
          <Card key={a.id}>
            <CardContent className="flex items-center justify-between gap-3 p-3">
              <div>
                <div className="font-medium">{a.candidateName}</div>
                <div className="text-xs text-muted-foreground">{[a.phone, a.email].filter(Boolean).join(" · ") || "No contact info"}</div>
              </div>
              <div className="flex items-center gap-2">
                <GenericStatusBadge status={a.stage} map={STAGE_VARIANT} />
                {canManage && a.stage === "OFFER" && <HireDialog applicationId={a.id} candidateName={a.candidateName} />}
                {canManage &&
                  NEXT_STAGES[a.stage]?.map((next) => (
                    <Button key={next} size="sm" variant="outline" onClick={() => setStage(a.id, next)}>
                      {next === "REJECTED" ? "Reject" : `Move to ${next.toLowerCase()}`}
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {!req.applications?.length && <p className="text-sm text-muted-foreground">No candidates yet.</p>}
      </div>
    </div>
  );
}

export default function RecruitmentPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: requisitions, isLoading } = useJobRequisitions();
  const [selected, setSelected] = React.useState<string | null>(null);
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Recruitment</h1>
        {canManage && farmId && <NewRequisitionDialog farmId={farmId} />}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {requisitions?.map((r: any) => (
          <Card key={r.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(r.id)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{r.title}</CardTitle>
                <GenericStatusBadge status={r.status} map={REQUISITION_VARIANT} />
              </div>
              <CardDescription>{r.department?.name ?? "Unassigned"} · {r.openings} opening{r.openings === 1 ? "" : "s"}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{r._count?.applications ?? 0} candidate(s)</CardContent>
          </Card>
        ))}
        {!isLoading && !requisitions?.length && <p className="text-sm text-muted-foreground">No job requisitions yet.</p>}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && <RequisitionDetail id={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
