import { assertTransition, canTransition, isTerminal } from "./task-state-machine";

describe("task state machine", () => {
  it("allows the standard daily-planning happy path", () => {
    expect(canTransition("DRAFT", "SUBMITTED")).toBe(true);
    expect(canTransition("SUBMITTED", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "ASSIGNED")).toBe(true);
    expect(canTransition("ASSIGNED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "COMPLETED")).toBe(true);
    expect(canTransition("COMPLETED", "VERIFIED")).toBe(true);
  });

  it("allows pausing and resuming in-progress work", () => {
    expect(canTransition("IN_PROGRESS", "PAUSED")).toBe(true);
    expect(canTransition("PAUSED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "BLOCKED")).toBe(true);
    expect(canTransition("BLOCKED", "IN_PROGRESS")).toBe(true);
  });

  it("allows carrying forward paused or blocked work, but not assigned/approved work", () => {
    expect(canTransition("PAUSED", "CARRIED_FORWARD")).toBe(true);
    expect(canTransition("BLOCKED", "CARRIED_FORWARD")).toBe(true);
    expect(canTransition("ASSIGNED", "CARRIED_FORWARD")).toBe(false);
    expect(canTransition("APPROVED", "CARRIED_FORWARD")).toBe(false);
  });

  it("rejects skipping straight from draft to in-progress", () => {
    expect(canTransition("DRAFT", "IN_PROGRESS")).toBe(false);
    expect(canTransition("DRAFT", "COMPLETED")).toBe(false);
  });

  it("rejects moving out of a terminal status", () => {
    expect(canTransition("VERIFIED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("CANCELLED", "DRAFT")).toBe(false);
    expect(canTransition("CARRIED_FORWARD", "IN_PROGRESS")).toBe(false);
  });

  it("rejects a no-op transition to the same status", () => {
    expect(canTransition("IN_PROGRESS", "IN_PROGRESS")).toBe(false);
  });

  it("assertTransition throws BadRequestException with a readable message for an invalid move", () => {
    expect(() => assertTransition("DRAFT", "VERIFIED")).toThrow("Task cannot move from DRAFT to VERIFIED");
  });

  it("assertTransition does not throw for a valid move", () => {
    expect(() => assertTransition("SUBMITTED", "APPROVED")).not.toThrow();
  });

  it("flags VERIFIED, CANCELLED and CARRIED_FORWARD as terminal", () => {
    expect(isTerminal("VERIFIED")).toBe(true);
    expect(isTerminal("CANCELLED")).toBe(true);
    expect(isTerminal("CARRIED_FORWARD")).toBe(true);
    expect(isTerminal("IN_PROGRESS")).toBe(false);
  });
});
