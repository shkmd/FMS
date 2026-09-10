import { ACTIVE_ASSIGNMENT_STATUSES } from "./task-state-machine";
import type { TaskStatus } from "@fms/shared";

export interface ExistingAssignmentForOverlapCheck {
  taskId: string;
  taskDate: Date;
  taskStatus: TaskStatus;
  plannedStart: Date | null;
  plannedEnd: Date | null;
}

export interface CandidateTask {
  taskId: string;
  date: Date;
  plannedStart: Date | null;
  plannedEnd: Date | null;
}

function sameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

function timeRangesOverlap(aStart: Date | null, aEnd: Date | null, bStart: Date | null, bEnd: Date | null): boolean {
  // If either side has no planned window, treat the whole day as occupied (conservative — the whole
  // point of this guard is to force an explicit, audited reassignment rather than a silent double-book).
  if (!aStart || !aEnd || !bStart || !bEnd) return true;
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Spec §13: "A worker cannot have two overlapping active task assignments." Returns the conflicting
 * assignment, if any, so the caller can produce a useful error message.
 */
export function findOverlappingAssignment(
  existing: ExistingAssignmentForOverlapCheck[],
  candidate: CandidateTask,
): ExistingAssignmentForOverlapCheck | undefined {
  return existing.find((a) => {
    if (a.taskId === candidate.taskId) return false;
    if (!ACTIVE_ASSIGNMENT_STATUSES.includes(a.taskStatus)) return false;
    if (!sameDay(a.taskDate, candidate.date)) return false;
    return timeRangesOverlap(a.plannedStart, a.plannedEnd, candidate.plannedStart, candidate.plannedEnd);
  });
}
