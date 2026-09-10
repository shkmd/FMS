"use client";

import { useParams } from "next/navigation";
import { usePlot, useCultivationBlocks, useCropCycles } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaStatusBadge } from "@/components/status-badges";
import { Badge } from "@/components/ui/badge";

export default function PlotDetailPage() {
  const { plotId } = useParams<{ plotId: string }>();
  const { data: plot, isLoading } = usePlot(plotId);
  const { data: blocks } = useCultivationBlocks(plotId);
  const { data: cycles } = useCropCycles();

  if (isLoading || !plot) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const cyclesByBlock = new Map<string, any[]>();
  (cycles ?? []).forEach((c: any) => {
    const list = cyclesByBlock.get(c.cultivationBlockId) ?? [];
    list.push(c);
    cyclesByBlock.set(c.cultivationBlockId, list);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Plot {plot.code} — {plot.name}</h1>
          <p className="text-sm text-muted-foreground">
            {plot.totalArea ? `${plot.totalArea} ${plot.areaUnit}` : "Area not set"} · Soil: {plot.soilType || "—"} · Irrigation: {plot.irrigationMethod || "—"}
          </p>
        </div>
        <AreaStatusBadge status={plot.status} />
      </div>

      {plot.subPlots?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Sub-plots</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {plot.subPlots.map((sp: any) => (
              <Badge key={sp.id} variant="secondary">{sp.name} ({sp.area ? `${sp.area.toFixed(2)} acre` : "—"})</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cultivation blocks & crop cycles</CardTitle>
          <CardDescription>Rolling/staggered cultivation blocks under this plot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(blocks ?? plot.cultivationBlocks ?? []).map((b: any) => (
            <div key={b.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{b.name} ({b.code})</span>
                <span className="text-xs text-muted-foreground">{b.area ? `${b.area} acre` : ""}</span>
              </div>
              <div className="mt-2 space-y-1">
                {(cyclesByBlock.get(b.id) ?? []).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded bg-muted/50 px-2 py-1 text-sm">
                    <span>{c.crop?.name} {c.variety ? `— ${c.variety.name}` : ""}</span>
                    <Badge variant="secondary">{c.stage.replace(/_/g, " ")}</Badge>
                  </div>
                ))}
                {!(cyclesByBlock.get(b.id) ?? []).length && (
                  <p className="text-xs text-muted-foreground">No active crop cycle on this block.</p>
                )}
              </div>
            </div>
          ))}
          {!(blocks ?? plot.cultivationBlocks ?? []).length && (
            <p className="text-sm text-muted-foreground">No cultivation blocks recorded yet for this plot.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
