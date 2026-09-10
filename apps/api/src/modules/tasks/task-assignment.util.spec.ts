import { findOverlappingAssignment, type ExistingAssignmentForOverlapCheck } from "./task-assignment.util";

const day = (s: string) => new Date(`${s}T00:00:00.000Z`);
const time = (s: string) => new Date(`2026-03-10T${s}:00.000Z`);

describe("findOverlappingAssignment", () => {
  it("returns undefined when the worker has no other active assignments", () => {
    const result = findOverlappingAssignment([], { taskId: "t2", date: day("2026-03-10"), plannedStart: null, plannedEnd: null });
    expect(result).toBeUndefined();
  });

  it("flags a conflict when both tasks are on the same day with no time window set (whole day occupied)", () => {
    const existing: ExistingAssignmentForOverlapCheck[] = [
      { taskId: "t1", taskDate: day("2026-03-10"), taskStatus: "ASSIGNED", plannedStart: null, plannedEnd: null },
    ];
    const conflict = findOverlappingAssignment(existing, {
      taskId: "t2",
      date: day("2026-03-10"),
      plannedStart: null,
      plannedEnd: null,
    });
    expect(conflict?.taskId).toBe("t1");
  });

  it("does not flag a conflict on different days", () => {
    const existing: ExistingAssignmentForOverlapCheck[] = [
      { taskId: "t1", taskDate: day("2026-03-10"), taskStatus: "IN_PROGRESS", plannedStart: null, plannedEnd: null },
    ];
    const conflict = findOverlappingAssignment(existing, {
      taskId: "t2",
      date: day("2026-03-11"),
      plannedStart: null,
      plannedEnd: null,
    });
    expect(conflict).toBeUndefined();
  });

  it("ignores assignments on non-active task statuses (completed, cancelled, verified)", () => {
    const existing: ExistingAssignmentForOverlapCheck[] = [
      { taskId: "t1", taskDate: day("2026-03-10"), taskStatus: "COMPLETED", plannedStart: null, plannedEnd: null },
      { taskId: "t3", taskDate: day("2026-03-10"), taskStatus: "CANCELLED", plannedStart: null, plannedEnd: null },
    ];
    const conflict = findOverlappingAssignment(existing, {
      taskId: "t2",
      date: day("2026-03-10"),
      plannedStart: null,
      plannedEnd: null,
    });
    expect(conflict).toBeUndefined();
  });

  it("ignores the same task (re-checking an existing assignment against itself)", () => {
    const existing: ExistingAssignmentForOverlapCheck[] = [
      { taskId: "t1", taskDate: day("2026-03-10"), taskStatus: "ASSIGNED", plannedStart: null, plannedEnd: null },
    ];
    const conflict = findOverlappingAssignment(existing, { taskId: "t1", date: day("2026-03-10"), plannedStart: null, plannedEnd: null });
    expect(conflict).toBeUndefined();
  });

  it("flags overlapping time windows on the same day", () => {
    const existing: ExistingAssignmentForOverlapCheck[] = [
      { taskId: "t1", taskDate: day("2026-03-10"), taskStatus: "IN_PROGRESS", plannedStart: time("08:00"), plannedEnd: time("12:00") },
    ];
    const conflict = findOverlappingAssignment(existing, {
      taskId: "t2",
      date: day("2026-03-10"),
      plannedStart: time("11:00"),
      plannedEnd: time("15:00"),
    });
    expect(conflict?.taskId).toBe("t1");
  });

  it("does not flag back-to-back, non-overlapping time windows on the same day", () => {
    const existing: ExistingAssignmentForOverlapCheck[] = [
      { taskId: "t1", taskDate: day("2026-03-10"), taskStatus: "IN_PROGRESS", plannedStart: time("08:00"), plannedEnd: time("12:00") },
    ];
    const conflict = findOverlappingAssignment(existing, {
      taskId: "t2",
      date: day("2026-03-10"),
      plannedStart: time("12:00"),
      plannedEnd: time("16:00"),
    });
    expect(conflict).toBeUndefined();
  });
});
