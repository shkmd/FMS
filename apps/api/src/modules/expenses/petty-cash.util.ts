/** Spec §5.18: opening balance → expense/reimbursement entries → running closing balance, never negative. */
export function nextPettyCashBalance(currentBalance: number, type: string, amount: number): number {
  const increasing = type === "opening" || type === "reimbursement";
  const next = increasing ? currentBalance + amount : currentBalance - amount;
  if (next < 0) {
    throw new Error(`This ${type} of ${amount} would take the petty cash balance negative (current balance: ${currentBalance})`);
  }
  return next;
}
