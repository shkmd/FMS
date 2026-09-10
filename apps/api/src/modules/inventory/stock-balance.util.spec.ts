import { applyAdjustment, applyMovement, isDecreasing } from "./stock-balance.util";

describe("stock balance rules", () => {
  it("classifies decreasing vs increasing movement types correctly", () => {
    expect(isDecreasing("CONSUMPTION")).toBe(true);
    expect(isDecreasing("DISPATCH")).toBe(true);
    expect(isDecreasing("PURCHASE_RECEIPT")).toBe(false);
    expect(isDecreasing("INTERNAL_PRODUCTION")).toBe(false);
    expect(isDecreasing("RETURN")).toBe(false);
  });

  it("increases balance for a receiving movement", () => {
    expect(applyMovement(10, 5, "PURCHASE_RECEIPT")).toBe(15);
  });

  it("decreases balance for a consuming movement", () => {
    expect(applyMovement(10, 4, "CONSUMPTION")).toBe(6);
  });

  it("allows a decrease that exactly zeroes the balance", () => {
    expect(applyMovement(10, 10, "DISPATCH")).toBe(0);
  });

  it("rejects a decrease that would take the balance negative", () => {
    expect(() => applyMovement(10, 11, "DISPATCH")).toThrow(/negative/);
  });

  it("rejects a zero or negative quantity", () => {
    expect(() => applyMovement(10, 0, "CONSUMPTION")).toThrow("positive");
    expect(() => applyMovement(10, -5, "CONSUMPTION")).toThrow("positive");
  });

  it("applies a positive adjustment", () => {
    expect(applyAdjustment(10, 3)).toBe(13);
  });

  it("applies a negative adjustment within bounds", () => {
    expect(applyAdjustment(10, -3)).toBe(7);
  });

  it("rejects a negative adjustment that would go below zero", () => {
    expect(() => applyAdjustment(10, -11)).toThrow(/negative/);
  });
});
