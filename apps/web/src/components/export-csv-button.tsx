"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportToCsv } from "@/lib/csv-export";

export function ExportCsvButton({ filename, rows }: { filename: string; rows: Record<string, unknown>[] }) {
  return (
    <Button variant="outline" size="sm" disabled={!rows.length} onClick={() => exportToCsv(filename, rows)}>
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  );
}
