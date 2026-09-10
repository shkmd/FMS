/**
 * Reference data transcribed from the farm's NICE Soil Testing Kit manual (pH/N/P/K colour charts).
 * Kept in `shared` so both the API (auto-filling a recommendation) and the web app (live classification
 * while entering a reading) use exactly the same table — no risk of the two drifting apart.
 */

export type NutrientLevel = "LOW" | "MEDIUM" | "HIGH";

export interface NutrientBand {
  /** The colour-chart code printed in the kit (L1/L2/M1/M2/H1/H2). */
  code: string;
  level: NutrientLevel;
  min: number;
  max: number | null; // null = open-ended ("> max of previous band")
  label: string;
}

function bandFor(bands: NutrientBand[], kgPerAcre: number): NutrientBand {
  const found = bands.find((b) => kgPerAcre >= b.min && (b.max === null || kgPerAcre <= b.max));
  return found ?? bands[bands.length - 1];
}

// ---- Nitrogen (kg/Acre) — kit Chart No.2 ----
export const NITROGEN_BANDS: NutrientBand[] = [
  { code: "L1", level: "LOW", min: 0, max: 49.9, label: "< 50 kg/Acre" },
  { code: "L2", level: "LOW", min: 50, max: 99.9, label: "50 - 99 kg/Acre" },
  { code: "M1", level: "MEDIUM", min: 100, max: 150, label: "100 - 150 kg/Acre" },
  { code: "M2", level: "MEDIUM", min: 150.1, max: 200, label: "151 - 200 kg/Acre" },
  { code: "H1", level: "HIGH", min: 200.1, max: 300, label: "201 - 300 kg/Acre" },
  { code: "H2", level: "HIGH", min: 300.1, max: null, label: "> 300 kg/Acre" },
];
export const classifyNitrogen = (kgPerAcre: number) => bandFor(NITROGEN_BANDS, kgPerAcre);

// ---- Phosphorus (kg/Acre) — kit Chart No.3 ----
export const PHOSPHORUS_BANDS: NutrientBand[] = [
  { code: "L1", level: "LOW", min: 0, max: 0.9, label: "< 1 kg/Acre" },
  { code: "L2", level: "LOW", min: 1, max: 3, label: "1 - 3 kg/Acre" },
  { code: "M1", level: "MEDIUM", min: 3.1, max: 7, label: "4 - 7 kg/Acre" },
  { code: "M2", level: "MEDIUM", min: 7.1, max: 10, label: "8 - 10 kg/Acre" },
  { code: "H1", level: "HIGH", min: 10.1, max: 15, label: "11 - 15 kg/Acre" },
  { code: "H2", level: "HIGH", min: 15.1, max: null, label: "> 15 kg/Acre" },
];
export const classifyPhosphorus = (kgPerAcre: number) => bandFor(PHOSPHORUS_BANDS, kgPerAcre);

// ---- Potassium (kg/Acre) — kit Chart No.4 ----
export const POTASSIUM_BANDS: NutrientBand[] = [
  { code: "L1", level: "LOW", min: 0, max: 24.9, label: "< 25 kg/Acre" },
  { code: "L2", level: "LOW", min: 25, max: 49, label: "25 - 49 kg/Acre" },
  { code: "M1", level: "MEDIUM", min: 50, max: 80, label: "50 - 80 kg/Acre" },
  { code: "M2", level: "MEDIUM", min: 80.1, max: 120, label: "81 - 120 kg/Acre" },
  { code: "H1", level: "HIGH", min: 120.1, max: 150, label: "121 - 150 kg/Acre" },
  { code: "H2", level: "HIGH", min: 150.1, max: null, label: "> 150 kg/Acre" },
];
export const classifyPotassium = (kgPerAcre: number) => bandFor(POTASSIUM_BANDS, kgPerAcre);

// ---- pH — kit Chart No.1 ----
export const PH_CHART: { ph: number; reaction: string }[] = [
  { ph: 4.0, reaction: "Intensely Acidic" },
  { ph: 4.5, reaction: "Very Strongly Acidic" },
  { ph: 5.0, reaction: "Strongly Acidic" },
  { ph: 5.5, reaction: "Medium Acidic" },
  { ph: 6.0, reaction: "Slightly Acidic" },
  { ph: 6.5, reaction: "Very Slightly Acidic" },
  { ph: 7.0, reaction: "Neutral" },
  { ph: 7.5, reaction: "Slightly Alkaline" },
  { ph: 8.0, reaction: "Medium Alkaline" },
  { ph: 8.5, reaction: "Strongly Alkaline" },
  { ph: 9.0, reaction: "Very Strongly Alkaline" },
  { ph: 9.5, reaction: "Intensely Alkaline" },
  { ph: 10.0, reaction: "Very Intensely Alkaline" },
];

export function classifyPh(ph: number): { reaction: string; isAcidic: boolean; isAlkaline: boolean; isNeutral: boolean } {
  let nearest = PH_CHART[0];
  for (const row of PH_CHART) {
    if (Math.abs(row.ph - ph) < Math.abs(nearest.ph - ph)) nearest = row;
  }
  return { reaction: nearest.reaction, isAcidic: ph < 7, isAlkaline: ph > 7, isNeutral: ph === 7 };
}

export function phRecommendation(ph: number): string {
  if (ph < 5.0) {
    return "Highly acidic — avoid Ammonium Sulphate; use only Ammonium Nitrate or Calcium Ammonium Nitrate (CAN). Treat with lime, 0.5-1.0 tonnes/Acre, to bring toward neutral.";
  }
  if (ph > 8.0) {
    return "Alkaline — treat with Gypsum, 0.5-1.0 tonnes/Acre, to bring down alkalinity toward neutral.";
  }
  if (ph >= 6.5 && ph <= 8.0) {
    return "Within the generally suitable range (6.5-8.0) for most common crops — no pH correction needed.";
  }
  return ph < 7 ? "Acidic — monitor; correction only usually needed below pH 5.0." : "Alkaline — monitor; correction only usually needed above pH 8.0.";
}

export function nitrogenRecommendation(level: NutrientLevel): string {
  const dose = level === "LOW" ? "Add 25% more than the recommended dose" : level === "HIGH" ? "Add less than the recommended dose" : "Apply the standard recommended dose";
  return `${dose} of a nitrogen fertilizer (commonly Urea or Ammonium Nitrate).`;
}

export function phosphorusRecommendation(level: NutrientLevel): string {
  const dose = level === "LOW" ? "Add 25% more than the recommended dose" : level === "HIGH" ? "Add less than the recommended dose" : "Add the recommended dose";
  return `${dose} of Super Phosphate.`;
}

export function potassiumRecommendation(level: NutrientLevel): string {
  const dose = level === "LOW" ? "Add 25% more than the recommended dose" : level === "HIGH" ? "Add less than the recommended dose" : "Add the recommended dose";
  return `${dose} of Muriate of Potash. For chloride-sensitive crops (Tomato, Tobacco, Chillies), use Sulphate of Potash instead.`;
}

/** Builds the same free-text recommendation the API auto-fills onto a SoilTest when one isn't given manually. */
export function buildSoilRecommendation(params: { nitrogen?: number | null; phosphorus?: number | null; potassium?: number | null; ph?: number | null }): string {
  const parts: string[] = [];
  if (params.ph != null) parts.push(`pH ${params.ph} (${classifyPh(params.ph).reaction}): ${phRecommendation(params.ph)}`);
  if (params.nitrogen != null) parts.push(`Nitrogen ${classifyNitrogen(params.nitrogen).level}: ${nitrogenRecommendation(classifyNitrogen(params.nitrogen).level)}`);
  if (params.phosphorus != null) parts.push(`Phosphorus ${classifyPhosphorus(params.phosphorus).level}: ${phosphorusRecommendation(classifyPhosphorus(params.phosphorus).level)}`);
  if (params.potassium != null) parts.push(`Potassium ${classifyPotassium(params.potassium).level}: ${potassiumRecommendation(classifyPotassium(params.potassium).level)}`);
  return parts.join(" ");
}
