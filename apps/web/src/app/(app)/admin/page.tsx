"use client";

import * as React from "react";
import { useUsers, useRoles, useUserMutations, useAuditLogs } from "@/lib/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

function UsersTab() {
  const { user: currentUser } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const { createUser, deleteUser } = useUserMutations();
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ email: "", name: "", password: "Demo@1234", roleCode: "" });

  const submit = async () => {
    setError(null);
    try {
      await createUser.mutateAsync({ email: form.email, name: form.name, password: form.password, roleCodes: [form.roleCode] });
      setOpen(false);
      setForm({ email: "", name: "", password: "Demo@1234", roleCode: "" });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to create user");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button>New user</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New user</DialogTitle></DialogHeader>
            {error && <p className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}
            <div className="space-y-3">
              <div className="space-y-1"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1"><Label>Temporary password</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <div className="space-y-1">
                <Label>Role</Label>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={form.roleCode}
                  onChange={(e) => setForm({ ...form, roleCode: e.target.value })}
                >
                  <option value="">Select role…</option>
                  {roles?.map((r: any) => <option key={r.id} value={r.code}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit} disabled={!form.email || !form.name || !form.roleCode || createUser.isPending}>
                {createUser.isPending ? "Creating…" : "Create user"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Roles</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {isLoading && <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Loading…</td></tr>}
              {users?.map((u: any) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3 text-muted-foreground">{u.email}</td>
                  <td className="p-3"><div className="flex flex-wrap gap-1">{u.roles.map((r: any) => <Badge key={r.roleId} variant="secondary">{r.role.name}</Badge>)}</div></td>
                  <td className="p-3"><Badge variant={u.status === "ACTIVE" ? "success" : "muted"}>{u.status}</Badge></td>
                  <td className="p-3 text-right">
                    {u.id !== currentUser?.id && (
                      <ConfirmDeleteDialog
                        title={`Delete ${u.name}?`}
                        description={`This deactivates ${u.email} and revokes their access. This can't be undone from the UI.`}
                        onConfirm={() => deleteUser.mutateAsync(u.id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditLogTab() {
  const { data: logs, isLoading } = useAuditLogs();
  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left text-muted-foreground">
            <tr><th className="p-3">When</th><th className="p-3">Entity</th><th className="p-3">Action</th><th className="p-3">User</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-4 text-center text-muted-foreground">Loading…</td></tr>}
            {logs?.map((l: any) => (
              <tr key={l.id} className="border-b last:border-0">
                <td className="p-3 text-muted-foreground">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="p-3">{l.entityType} <span className="text-muted-foreground">#{l.entityId.slice(0, 8)}</span></td>
                <td className="p-3"><Badge variant="secondary">{l.action}</Badge></td>
                <td className="p-3 text-muted-foreground">{l.userId ? l.userId.slice(0, 8) : "system"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="audit"><AuditLogTab /></TabsContent>
      </Tabs>
    </div>
  );
}
