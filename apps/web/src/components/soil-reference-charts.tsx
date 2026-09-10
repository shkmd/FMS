import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { NITROGEN_BANDS, PHOSPHORUS_BANDS, POTASSIUM_BANDS, PH_CHART, type NutrientBand } from "@fms/shared";

// Approximate swatches only — for quick visual recognition, not a colorimetric match to the physical kit.
const N_COLORS = ["#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#ea580c", "#c2410c"];
const P_COLORS = ["#fefce8", "#fef9c3", "#fef08a", "#fde047", "#facc15", "#eab308"];
const K_COLORS = ["#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"];
const PH_COLORS = ["#eab308", "#ca8a04", "#84a334", "#65a30d", "#4d7c0f", "#0f766e", "#0d9488", "#7e22ce", "#7e22ce", "#6b21a8", "#581c87", "#4c1d95", "#3b0764"];

function NutrientChart({ title, unit, bands, colors }: { title: string; unit: string; bands: NutrientBand[]; colors: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Approximate quantity present in {unit}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {bands.map((b, i) => (
          <div key={b.code} className="flex items-center gap-3 text-sm">
            <span className="h-4 w-10 rounded-sm border" style={{ backgroundColor: colors[i] }} />
            <span className="w-8 font-medium">{b.code}</span>
            <span className="flex-1 text-muted-foreground">{b.label}</span>
            <span className="text-xs text-muted-foreground">{b.level}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SoilReferenceCharts() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Transcribed from the farm&apos;s NICE Soil Testing Kit manual. Match the tube colour against the physical
        kit, find the code (L1/L2/M1/M2/H1/H2), then enter the corresponding kg/Acre value from this table when
        recording a soil test — the app classifies it and suggests a recommendation automatically.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <NutrientChart title="Nitrogen" unit="kg/Acre" bands={NITROGEN_BANDS} colors={N_COLORS} />
        <NutrientChart title="Phosphorus" unit="kg/Acre" bands={PHOSPHORUS_BANDS} colors={P_COLORS} />
        <NutrientChart title="Potassium" unit="kg/Acre" bands={POTASSIUM_BANDS} colors={K_COLORS} />
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">pH</CardTitle>
            <CardDescription>Below 7.0 acidic, above 7.0 alkaline, 6.5-8.0 generally suitable</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {PH_CHART.map((row, i) => (
              <div key={row.ph} className="flex items-center gap-3 text-sm">
                <span className="h-4 w-10 rounded-sm border" style={{ backgroundColor: PH_COLORS[i] }} />
                <span className="w-10 font-medium">{row.ph.toFixed(1)}</span>
                <span className="flex-1 text-muted-foreground">{row.reaction}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Nitrogen:</span> Urea, Ammonium Nitrate. Low → add 25% more than the recommended dose; Medium → recommended dose; High → less than the recommended dose.</p>
          <p><span className="font-medium text-foreground">Phosphorus:</span> Super Phosphate, same Low/Medium/High dosing rule as above.</p>
          <p><span className="font-medium text-foreground">Potassium:</span> Muriate of Potash, or Sulphate of Potash for chloride-sensitive crops (Tomato, Tobacco, Chillies).</p>
          <p><span className="font-medium text-foreground">pH:</span> Below 5.0 — avoid Ammonium Sulphate, use Ammonium Nitrate/CAN, treat with lime (0.5-1.0 t/Acre). Above 8.0 — treat with Gypsum (0.5-1.0 t/Acre).</p>
        </CardContent>
      </Card>
    </div>
  );
}
