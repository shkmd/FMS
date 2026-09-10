"use client";

import dynamic from "next/dynamic";
import { useFarms, useFarmMap } from "@/lib/hooks";
import { Card, CardContent } from "@/components/ui/card";

const FarmMapLeaflet = dynamic(() => import("@/components/farm-map-leaflet").then((m) => m.FarmMapLeaflet), {
  ssr: false,
  loading: () => <div className="flex h-[600px] items-center justify-center text-sm text-muted-foreground">Loading map…</div>,
});

const LEGEND = [
  { label: "Active", color: "#1b4332" },
  { label: "Fallow", color: "#94a3b8" },
  { label: "Under preparation", color: "#b08968" },
  { label: "Issue", color: "#b91c1c" },
  { label: "Inactive", color: "#cbd5e1" },
];

export default function FarmMapPage() {
  const { data: farms } = useFarms();
  const farmId = farms?.[0]?.id;
  const { data, isLoading } = useFarmMap(farmId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Farm Map</h1>
        <div className="flex flex-wrap gap-3 text-xs">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <Card>
        <CardContent className="p-2">
          {isLoading || !data ? (
            <div className="flex h-[600px] items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <FarmMapLeaflet areas={data.areas} plots={data.plots} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
