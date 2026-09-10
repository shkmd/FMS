import { BadRequestException } from "@nestjs/common";
import type { TaskStatus } from "@fms/shared";

/**
 * The daily-planning workflow from spec §5.2, encoded as an explicit transition table so "can this task
 * move from A to B" is a pure, unit-testable question instead of logic buried in the service.
 */
export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["APPROVED", "DRAFT", "CANCELLED"],
  APPROVED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["PAUSED", "BLOCKED", "COMPLETED", "CANCELLED"],
  PAUSED: ["IN_PROGRESS", "CANCELLED", "CARRIED_FORWARD"],
  BLOCKED: ["IN_PROGRESS", "CANCELLED", "CARRIED_FORWARD"],
  COMPLETED: ["VERIFIED"],
  VERIFIED: [],
  CANCELLED: [],
  CARRIED_FORWARD: [],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return false;
  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new BadRequestException(`Task cannot move from ${from} to ${to}`);
  }
}

export const TERMINAL_STATUSES: TaskStatus[] = ["VERIFIED", "CANCELLED", "CARRIED_FORWARD"];
export const ACTIVE_ASSIGNMENT_STATUSES: TaskStatus[] = ["ASSIGNED", "IN_PROGRESS", "PAUSED", "BLOCKED"];

export function isTerminal(status: TaskStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
