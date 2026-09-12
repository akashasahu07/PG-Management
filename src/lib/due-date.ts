/**
 * Due Date & Billing Cycle Calculation Logic for Elite Homes
 * Calculates anniversary-based cycles with robust month-end clamping (e.g. Jan 31 -> Feb 28/29).
 */

export interface BillingCycle {
  cycleIndex: number;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
  status: 'PAID' | 'DUE_TODAY' | 'DUE_SOON' | 'PENDING' | 'OVERDUE';
  daysRemaining: number;
}

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

/**
 * Returns the exact date clamped to the max days of the target month
 */
export function getClampedAnniversaryDate(originalDate: Date, targetYear: number, targetMonthZeroIndexed: number): Date {
  const originalDay = originalDate.getDate();
  const maxDays = getDaysInMonth(targetYear, targetMonthZeroIndexed);
  const clampedDay = Math.min(originalDay, maxDays);
  return new Date(targetYear, targetMonthZeroIndexed, clampedDay, 0, 0, 0, 0);
}

/**
 * Computes the current billing cycle and next due date for a resident based on their joining date and payment history
 */
export function computeResidentRentStatus(
  joiningDateInput: Date | string,
  latestPaymentDate?: Date | string | null,
  now: Date = new Date()
): BillingCycle {
  const joining = new Date(joiningDateInput);
  joining.setHours(0, 0, 0, 0);

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Find which cycle we are currently in
  // Compare year and month delta
  const yearDiff = today.getFullYear() - joining.getFullYear();
  const monthDiff = today.getMonth() - joining.getMonth();
  let estimatedCycle = yearDiff * 12 + monthDiff;

  if (estimatedCycle < 0) {
    estimatedCycle = 0;
  }

  // Calculate start of estimated cycle
  const currentTargetYear = joining.getFullYear() + Math.floor((joining.getMonth() + estimatedCycle) / 12);
  const currentTargetMonth = (joining.getMonth() + estimatedCycle) % 12;
  let cycleStart = getClampedAnniversaryDate(joining, currentTargetYear, currentTargetMonth);

  // If today is before this cycle start date, step back 1 cycle
  if (today < cycleStart && estimatedCycle > 0) {
    estimatedCycle -= 1;
    const prevTargetYear = joining.getFullYear() + Math.floor((joining.getMonth() + estimatedCycle) / 12);
    const prevTargetMonth = (joining.getMonth() + estimatedCycle) % 12;
    cycleStart = getClampedAnniversaryDate(joining, prevTargetYear, prevTargetMonth);
  }

  // Next cycle start
  const nextTargetYear = joining.getFullYear() + Math.floor((joining.getMonth() + estimatedCycle + 1) / 12);
  const nextTargetMonth = (joining.getMonth() + estimatedCycle + 1) % 12;
  const nextCycleStart = getClampedAnniversaryDate(joining, nextTargetYear, nextTargetMonth);

  // Cycle end is 1 day before next cycle start
  const cycleEnd = new Date(nextCycleStart.getTime() - 24 * 60 * 60 * 1000);
  cycleEnd.setHours(23, 59, 59, 999);

  // Due date is nextCycleStart
  const dueDate = new Date(nextCycleStart);

  // Calculate days remaining until due date
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.round((dueDate.getTime() - today.getTime()) / msPerDay);

  let status: 'PAID' | 'DUE_TODAY' | 'DUE_SOON' | 'PENDING' | 'OVERDUE' = 'PENDING';

  // Check latest payment
  if (latestPaymentDate) {
    const payDate = new Date(latestPaymentDate);
    // If paid on or after cycleStart, this current cycle is paid
    if (payDate >= cycleStart) {
      status = 'PAID';
    }
  }

  if (status !== 'PAID') {
    if (daysRemaining < 0) {
      status = 'OVERDUE';
    } else if (daysRemaining === 0) {
      status = 'DUE_TODAY';
    } else if (daysRemaining <= 3) {
      status = 'DUE_SOON';
    } else {
      status = 'PENDING';
    }
  }

  return {
    cycleIndex: estimatedCycle,
    startDate: cycleStart,
    endDate: cycleEnd,
    dueDate,
    status,
    daysRemaining,
  };
}

export function formatDate(dateInput?: Date | string | null): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
