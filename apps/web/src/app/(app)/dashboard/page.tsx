"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useFarms, useManagementDashboard, useFarmManagerDashboard, useSupervisorDashboard, useTasks } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TaskStatusBadge, PriorityBadge } from "@/components/status-badges";
import { PERMISSIONS } from "@fms/shared";

function StatTile({ label, value, tone }: { label: string; value: number | string; tone?: "warning" | "destructive" }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`text-2xl font-semibold ${tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : ""}`}>
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function ManagementDashboard({ farmId }: { farmId: string }) {
  const { data, isLoading } = useManagementDashboard(farmId);
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  const statusCounts = data.taskStatusCounts ?? {};
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Workers present today" value={`${data.workforce.presentToday}/${data.workforce.total}`} />
        <StatTile label="Pending approvals" value={data.pendingApprovals} tone={data.pendingApprovals ? "warning" : undefined} />
        <StatTile label="Reassignments today" value={data.reassignmentsToday} />
        <StatTile label="Tasks today" value={Object.values(statusCounts).reduce((a: any, b: any) => a + b, 0) as number} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s tasks by status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm">
                <TaskStatusBadge status={status} />
                <span className="font-medium">{count as number}</span>
              </div>
            ))}
            {Object.keys(statusCounts).length === 0 && <p className="text-sm text-muted-foreground">No tasks planned for today.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Farm area status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(data.farmAreaStatusCounts ?? {}).map(([status, count]) => (
              <div key={status} className="rounded-md border px-2 py-1 text-sm">
                {status.replace(/_/g, " ")}: <span className="font-medium">{count as number}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent field photos</CardTitle>
          <CardDescription>Latest task evidence uploads</CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentEvidence?.length ? (
            <ul className="space-y-1 text-sm">
              {data.recentEvidence.map((e: any) => (
                <li key={e.id} className="flex justify-between border-b py-1 last:border-0">
                  <span>{e.task?.taskNumber} — {e.task?.description}</span>
                  <span className="text-muted-foreground">{new Date(e.uploadedAt).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FarmManagerDashboard({ farmId }: { farmId: string }) {
  const { data, isLoading } = useFarmManagerDashboard(farmId);
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Pending approvals" value={data.pendingApprovals.length} tone={data.pendingApprovals.length ? "warning" : undefined} />
        <StatTile label="Pending reassignments" value={data.pendingReassignments.length} tone={data.pendingReassignments.length ? "warning" : undefined} />
        <StatTile label="Overdue tasks" value={data.overdueTasks.length} tone={data.overdueTasks.length ? "destructive" : undefined} />
        <StatTile label="Blocked tasks" value={data.blockedTasks.length} tone={data.blockedTasks.length ? "destructive" : undefined} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Awaiting your approval</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.pendingApprovals.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
            {data.pendingApprovals.map((t: any) => (
              <Link key={t.id} href={`/tasks?taskId=${t.id}`} className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-accent">
                <span>{t.taskNumber} — {t.description}</span>
                <PriorityBadge priority={t.priority} />
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending reassignment requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.pendingReassignments.length === 0 && <p className="text-sm text-muted-foreground">Nothing pending.</p>}
            {data.pendingReassignments.map((r: any) => (
              <Link key={r.id} href="/reassignments" className="block rounded-md border p-2 text-sm hover:bg-accent">
                {r.worker?.employee?.name}: {r.fromTask?.taskNumber} → {r.toTask?.taskNumber}
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SupervisorDashboard() {
  const { data, isLoading } = useSupervisorDashboard();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Today's tasks" value={data.todayTasks.length} />
        <StatTile label="Completion rate" value={`${data.completionRate}%`} />
        <StatTile label="Open issues" value={data.openIssuesCount} tone={data.openIssuesCount ? "warning" : undefined} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My team&apos;s tasks today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.todayTasks.map((t: any) => (
            <Link key={t.id} href={`/tasks?taskId=${t.id}`} className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-accent">
              <span>{t.taskNumber} — {t.description}</span>
              <div className="flex gap-2">
                <PriorityBadge priority={t.priority} />
                <TaskStatusBadge status={t.status} />
              </div>
            </Link>
          ))}
          {data.todayTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks assigned to your supervision today.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function WorkerDashboard() {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useTasks({ mine: "true" });
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {user?.name?.split(" ")[0]}</CardTitle>
          <CardDescription>Your assigned tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {tasks?.map((t: any) => (
            <Link key={t.id} href={`/tasks?taskId=${t.id}`} className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-accent">
              <span>{t.description}</span>
              <TaskStatusBadge status={t.status} />
            </Link>
          ))}
          {tasks?.length === 0 && <p className="text-sm text-muted-foreground">No tasks assigned yet today.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;

  const title = "Dashboard";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">Athachi Farms — {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {hasPermission(PERMISSIONS.DASHBOARD_MANAGEMENT) && farmId && <ManagementDashboard farmId={farmId} />}
      {hasPermission(PERMISSIONS.DASHBOARD_FARM_MANAGER) && farmId && (
        <div className="pt-2">
          <h2 className="mb-2 text-lg font-medium">Farm Manager view</h2>
          <FarmManagerDashboard farmId={farmId} />
        </div>
      )}
      {hasPermission(PERMISSIONS.DASHBOARD_SUPERVISOR) && !hasPermission(PERMISSIONS.DASHBOARD_MANAGEMENT) && <SupervisorDashboard />}
      {user?.roles.includes("WORKER") && <WorkerDashboard />}
    </div>
  );
}
