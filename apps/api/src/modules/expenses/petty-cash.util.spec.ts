import { nextPettyCashBalance } from "./petty-cash.util";

describe("petty cash balance", () => {
  it("increases the balance on opening and reimbursement entries", () => {
    expect(nextPettyCashBalance(0, "opening", 25000)).toBe(25000);
    expect(nextPettyCashBalance(5000, "reimbursement", 10000)).toBe(15000);
  });

  it("decreases the balance on an expense entry", () => {
    expect(nextPettyCashBalance(25000, "expense", 1500)).toBe(23500);
  });

  it("allows an expense that exactly zeroes the balance", () => {
    expect(nextPettyCashBalance(1500, "expense", 1500)).toBe(0);
  });

  it("rejects an expense that would take the balance negative", () => {
    expect(() => nextPettyCashBalance(1000, "expense", 1500)).toThrow(/negative/);
  });
});
