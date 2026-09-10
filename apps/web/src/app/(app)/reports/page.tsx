"use client";

import * as React from "react";
import { useFarms, useDailyActivityReport, useInventoryMovementReport, useHarvestForecastReport, useExpenseSummaryReport } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExportCsvButton } from "@/components/export-csv-button";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: daily } = useDailyActivityReport(farmId);
  const { data: movements } = useInventoryMovementReport();
  const { data: harvestFva } = useHarvestForecastReport(farmId);
  const { data: expenseSummary } = useExpenseSummaryReport(farmId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">A focused set of cross-cutting reports, each exportable as CSV. Most list screens (Tasks, Inventory, …) also have their own export button.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Daily Activity</CardTitle>
              {daily && <ExportCsvButton filename="daily-activity" rows={daily.tasks} />}
            </div>
            <CardDescription>{daily ? new Date(daily.date).toLocaleDateString() : "—"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {daily && (
              <>
                <div>{daily.taskCount} task(s) · {daily.workersPresent}/{daily.workersTotal} workers present</div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(daily.byStatus).map(([s, c]) => <Badge key={s} variant="secondary">{s}: {c as number}</Badge>)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Inventory Movement</CardTitle>
              {movements && (
                <ExportCsvButton
                  filename="inventory-movement"
                  rows={movements.map((m: any) => ({ date: new Date(m.occurredAt).toLocaleString(), item: m.itemName, type: m.movementType, quantity: m.quantity, unit: m.unit }))}
                />
              )}
            </div>
            <CardDescription>Last {movements?.length ?? 0} movements across all items</CardDescription>
          </CardHeader>
          <CardContent className="max-h-48 space-y-1 overflow-y-auto text-sm">
            {movements?.slice(0, 15).map((m: any) => (
              <div key={m.id} className="flex justify-between">
                <span>{m.itemName} — {m.movementType.replace(/_/g, " ")}</span>
                <span className="text-muted-foreground">{m.quantity} {m.unit}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Harvest Forecast vs. Actual</CardTitle>
              {harvestFva && <ExportCsvButton filename="harvest-forecast-vs-actual" rows={harvestFva} />}
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {harvestFva?.map((h: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span>{h.crop} {h.variety ? `— ${h.variety}` : ""}</span>
                <span className="text-muted-foreground">{h.expected}kg expected · {h.actual}kg actual{h.variancePercent != null ? ` (${h.variancePercent}%)` : ""}</span>
              </div>
            ))}
            {!harvestFva?.length && <p className="text-muted-foreground">No forecasts recorded yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Expense Summary</CardTitle>
              {expenseSummary && (
                <ExportCsvButton
                  filename="expense-summary"
                  rows={Object.entries(expenseSummary.byCategory).map(([category, amount]) => ({ category, amount }))}
                />
              )}
            </div>
            <CardDescription>{expenseSummary?.count ?? 0} expense(s) · ₹{expenseSummary ? Number(expenseSummary.total).toLocaleString() : 0} total</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {expenseSummary && Object.entries(expenseSummary.byCategory).map(([cat, amt]) => (
              <div key={cat} className="flex justify-between"><span>{cat}</span><span>₹{Number(amt).toLocaleString()}</span></div>
            ))}
            {expenseSummary?.missingReceiptCount > 0 && (
              <Badge variant="warning">{expenseSummary.missingReceiptCount} missing receipt(s)</Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
