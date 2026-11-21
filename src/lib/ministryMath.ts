// Shared hour rules for the goal card (and later the Home tab and service year view).

export const CREDIT_CAP = 55;

// Credit only tops a month up to 55h; it never takes away ministry hours.
// No credit → no cap. Ministry already over 55 → credit adds nothing.
export function countedHours(ministry: number, credit: number): number {
  return ministry + Math.min(credit, Math.max(0, CREDIT_CAP - ministry));
}

// "2h 30m", "20h", "45m". Rounds to the nearest 5 minutes so the numbers read cleanly.
export function fmtHours(h: number): string {
  const total = Math.round((h * 60) / 5) * 5;
  const hrs = Math.floor(total / 60);
  const mins = total % 60;
  if (!total) return '0h';
  if (!hrs) return `${mins}m`;
  return mins ? `${hrs}h ${mins}m` : `${hrs}h`;
}
