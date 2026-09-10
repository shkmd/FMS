import * as crypto from "crypto";

/** T-YYYYMMDD-XXXX — date-scoped and short-random rather than sequential, so concurrent creates never race. */
export function generateTaskNumber(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `T-${y}${m}${d}-${suffix}`;
}
