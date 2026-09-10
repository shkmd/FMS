import { canCloseIssue, canResolveDirectly } from "./issue-rules.util";

describe("issue rules", () => {
  describe("canResolveDirectly", () => {
    it("allows observation and minor severities", () => {
      expect(canResolveDirectly("OBSERVATION")).toBe(true);
      expect(canResolveDirectly("MINOR")).toBe(true);
    });
    it("rejects major and critical severities", () => {
      expect(canResolveDirectly("MAJOR")).toBe(false);
      expect(canResolveDirectly("CRITICAL")).toBe(false);
    });
  });

  describe("canCloseIssue", () => {
    it("rejects the reporter closing their own critical issue", () => {
      expect(canCloseIssue({ severity: "CRITICAL", reportedById: "u1", actorId: "u1", hasOverride: false })).toBe(false);
    });
    it("allows the reporter to close their own critical issue with an override", () => {
      expect(canCloseIssue({ severity: "CRITICAL", reportedById: "u1", actorId: "u1", hasOverride: true })).toBe(true);
    });
    it("allows someone else to close a critical issue they didn't report", () => {
      expect(canCloseIssue({ severity: "CRITICAL", reportedById: "u1", actorId: "u2", hasOverride: false })).toBe(true);
    });
    it("allows the reporter to close their own non-critical issue", () => {
      expect(canCloseIssue({ severity: "MAJOR", reportedById: "u1", actorId: "u1", hasOverride: false })).toBe(true);
    });
  });
});
