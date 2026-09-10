"use client";

import * as React from "react";
import { useAttendance, useWorkers, useMarkAttendance } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AttendanceStatus } from "@fms/shared";
import { PERMISSIONS } from "@fms/shared";

const STATUS_VARIANT: Record<string, "success" | "destructive" | "warning" | "muted"> = {
  PRESENT: "success",
  ABSENT: "destructive",
  HALF_DAY: "warning",
  ON_LEAVE: "muted",
  OVERTIME: "success",
};

export default function AttendancePage() {
  const { hasPermission } = useAuth();
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0, 10));
  const { data: records } = useAttendance(date);
  const { data: workers } = useWorkers();
  const markAttendance = useMarkAttendance();

  const recordByWorker = new Map((records ?? []).map((r: any) => [r.workerId, r]));

  const setStatus = (workerId: string, status: string) => {
    markAttendance.mutate({ workerId, date, status });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Attendance Register</h1>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-40" />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="p-3">Worker</th>
                <th className="p-3">Status</th>
                <th className="p-3">Check-in</th>
                <th className="p-3">Check-out</th>
                {hasPermission(PERMISSIONS.ATTENDANCE_MARK_OTHERS) && <th className="p-3">Mark</th>}
              </tr>
            </thead>
            <tbody>
              {(workers ?? []).map((w: any) => {
                const r = recordByWorker.get(w.id);
                return (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{w.employee?.name}</td>
                    <td className="p-3">
                      {r ? <Badge variant={STATUS_VARIANT[r.status] ?? "muted"}>{r.status.replace(/_/g, " ")}</Badge> : <span className="text-muted-foreground">Not marked</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{r?.checkInAt ? new Date(r.checkInAt).toLocaleTimeString() : "—"}</td>
                    <td className="p-3 text-muted-foreground">{r?.checkOutAt ? new Date(r.checkOutAt).toLocaleTimeString() : "—"}</td>
                    {hasPermission(PERMISSIONS.ATTENDANCE_MARK_OTHERS) && (
                      <td className="p-3">
                        <Select value={r?.status ?? ""} onValueChange={(v) => setStatus(w.id, v)}>
                          <SelectTrigger className="w-36"><SelectValue placeholder="Mark…" /></SelectTrigger>
                          <SelectContent>
                            {AttendanceStatus.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
