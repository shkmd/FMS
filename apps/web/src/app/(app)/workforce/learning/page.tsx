"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useEmployees, useTrainingPrograms, useTrainingProgram, useLearningMutations } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GenericStatusBadge } from "@/components/status-badges";
import { PERMISSIONS } from "@fms/shared";
import { ApiError } from "@/lib/api-client";

const SESSION_VARIANT: Record<string, any> = { SCHEDULED: "default", COMPLETED: "success", CANCELLED: "muted" };
const ENROLLMENT_VARIANT: Record<string, any> = { ENROLLED: "secondary", COMPLETED: "success", NO_SHOW: "destructive", CANCELLED: "muted" };

function NewProgramDialog({ farmId }: { farmId: string }) {
  const { createProgram } = useLearningMutations();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createProgram.mutateAsync({ farmId, title, category: category || undefined, description: description || undefined });
      setOpen(false);
      setTitle(""); setCategory(""); setDescription("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>New training program</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New training program</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-1"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Compliance, Safety" /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!title}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewSessionDialog({ programId }: { programId: string }) {
  const { createSession } = useLearningMutations();
  const [open, setOpen] = React.useState(false);
  const [scheduledDate, setScheduledDate] = React.useState("");
  const [trainer, setTrainer] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await createSession.mutateAsync({ programId, scheduledDate, trainer: trainer || undefined, location: location || undefined });
      setOpen(false);
      setScheduledDate(""); setTrainer(""); setLocation("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">New session</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New training session</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Date</Label><Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} /></div>
          <div className="space-y-1"><Label>Trainer</Label><Input value={trainer} onChange={(e) => setTrainer(e.target.value)} /></div>
          <div className="space-y-1"><Label>Location</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!scheduledDate}>Create</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EnrollDialog({ sessionId }: { sessionId: string }) {
  const { data: employees } = useEmployees();
  const { enroll } = useLearningMutations();
  const [open, setOpen] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    try {
      await enroll.mutateAsync({ sessionId, employeeId });
      setOpen(false);
      setEmployeeId("");
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Enroll</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Enroll employee</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-1">
          <Label>Employee</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
            <SelectContent>{employees?.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <DialogFooter><Button onClick={submit} disabled={!employeeId}>Enroll</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompleteEnrollmentDialog({ enrollmentId, employeeName }: { enrollmentId: string; employeeName: string }) {
  const { updateEnrollment } = useLearningMutations();
  const [open, setOpen] = React.useState(false);
  const [score, setScore] = React.useState("");
  const [feedback, setFeedback] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const submit = async (status: string) => {
    setError(null);
    try {
      await updateEnrollment.mutateAsync({ id: enrollmentId, status, score: score ? Number(score) : undefined, feedback: feedback || undefined });
      setOpen(false);
    } catch (e) { setError(e instanceof ApiError ? e.message : "Failed"); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline">Update</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{employeeName}</DialogTitle></DialogHeader>
        {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div className="space-y-1"><Label>Score (optional)</Label><Input type="number" value={score} onChange={(e) => setScore(e.target.value)} /></div>
          <div className="space-y-1"><Label>Feedback</Label><Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => submit("NO_SHOW")}>No-show</Button>
          <Button onClick={() => submit("COMPLETED")}>Mark completed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProgramDetail({ id }: { id: string }) {
  const { data: program } = useTrainingProgram(id);
  const { hasPermission } = useAuth();
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  if (!program) return null;

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>{program.title}</DialogTitle>
      </DialogHeader>
      {program.description && <p className="text-sm text-muted-foreground">{program.description}</p>}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Sessions</h3>
        {canManage && <NewSessionDialog programId={program.id} />}
      </div>
      <div className="space-y-3">
        {program.sessions?.map((s: any) => (
          <Card key={s.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{new Date(s.scheduledDate).toLocaleDateString()}</CardTitle>
                <GenericStatusBadge status={s.status} map={SESSION_VARIANT} />
              </div>
              <CardDescription>{[s.trainer, s.location].filter(Boolean).join(" · ") || "No details"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{s.enrollments?.length ?? 0} enrolled</span>
                {canManage && <EnrollDialog sessionId={s.id} />}
              </div>
              {s.enrollments?.map((en: any) => (
                <div key={en.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>
                    <div>{en.employee?.name}</div>
                    {en.score != null && <div className="text-xs text-muted-foreground">Score: {en.score}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <GenericStatusBadge status={en.status} map={ENROLLMENT_VARIANT} />
                    {canManage && en.status === "ENROLLED" && <CompleteEnrollmentDialog enrollmentId={en.id} employeeName={en.employee?.name} />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        {!program.sessions?.length && <p className="text-sm text-muted-foreground">No sessions scheduled yet.</p>}
      </div>
    </div>
  );
}

export default function LearningPage() {
  const { hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: programs, isLoading } = useTrainingPrograms();
  const [selected, setSelected] = React.useState<string | null>(null);
  const canManage = hasPermission(PERMISSIONS.EMPLOYEE_MANAGE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Learning</h1>
        {canManage && farmId && <NewProgramDialog farmId={farmId} />}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {programs?.map((p: any) => (
          <Card key={p.id} className="cursor-pointer hover:border-primary" onClick={() => setSelected(p.id)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{p.title}</CardTitle>
              <CardDescription>{p.category ?? "General"}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{p._count?.sessions ?? 0} session(s)</CardContent>
          </Card>
        ))}
        {!isLoading && !programs?.length && <p className="text-sm text-muted-foreground">No training programs yet.</p>}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selected && <ProgramDetail id={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
