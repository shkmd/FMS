import type { StockMovementType } from "@fms/shared";

/** Movement types that decrease a batch's balance; everything else increases it. */
export const DECREASING_MOVEMENT_TYPES: StockMovementType[] = [
  "ISSUE_TO_TASK",
  "CONSUMPTION",
  "DAMAGE",
  "SPOILAGE",
  "EXPIRY",
  "DISPATCH",
];

export function isDecreasing(type: StockMovementType): boolean {
  return DECREASING_MOVEMENT_TYPES.includes(type);
}

/**
 * Spec §13: "Inventory must never silently become negative." Pure so it's unit-testable without a
 * database — returns the resulting balance, or throws a plain Error the caller turns into a 409.
 */
export function applyMovement(currentBalance: number, quantity: number, type: StockMovementType): number {
  if (quantity <= 0) throw new Error("Movement quantity must be positive");
  const next = isDecreasing(type) ? currentBalance - quantity : currentBalance + quantity;
  if (next < 0) {
    throw new Error(
      `This ${type.toLowerCase().replace(/_/g, " ")} of ${quantity} would take the batch balance negative (current balance: ${currentBalance})`,
    );
  }
  return next;
}

/** For ADJUSTMENT movements, which carry an explicit signed delta rather than a movement-type sign. */
export function applyAdjustment(currentBalance: number, delta: number): number {
  const next = currentBalance + delta;
  if (next < 0) {
    throw new Error(`This adjustment of ${delta} would take the batch balance negative (current balance: ${currentBalance})`);
  }
  return next;
}
