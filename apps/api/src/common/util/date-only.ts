/**
 * All `@db.Date` columns (Task.date, Attendance.date, ...) are timezone-less calendar dates. Prisma
 * reads/writes them via a JS Date's *UTC* year/month/day. `new Date(); d.setHours(0,0,0,0)` zeroes the
 * time in the *server's local* timezone — on a server running IST (UTC+5:30) that silently shifts local
 * midnight back to the previous UTC calendar day, causing "today"/"tomorrow" filters to miss rows by one
 * day. Always build date-only values through here instead.
 */
export function dateOnly(offsetDays = 0, from: Date = new Date()): Date {
  const utc = new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()));
  if (offsetDays) utc.setUTCDate(utc.getUTCDate() + offsetDays);
  return utc;
}

export function endOfDateOnly(offsetDays = 0, from: Date = new Date()): Date {
  const d = dateOnly(offsetDays, from);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}
