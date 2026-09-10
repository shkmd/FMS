"use client";

import Link from "next/link";
import { useFarms, usePlots } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaStatusBadge } from "@/components/status-badges";

export default function CultivationPage() {
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data: plots, isLoading } = usePlots(farmId);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Cultivation</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading plots…</p>}
        {plots?.map((p: any) => (
          <Link key={p.id} href={`/cultivation/${p.id}`}>
            <Card className="h-full hover:border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Plot {p.code}</CardTitle>
                  <AreaStatusBadge status={p.status} />
                </div>
                <CardDescription>{p.name}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {p.totalArea ? `${p.totalArea} ${p.areaUnit}` : "Area not set"} · {p.subPlots?.length ?? 0} sub-plot(s)
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
