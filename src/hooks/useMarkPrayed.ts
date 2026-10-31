// What happens when someone taps "Mark Day N as prayed": the day is stored, and if it was the
// last day the whole novena is marked complete.
import { markDayPrayed, setRunStatus } from '@/data/queries';
import { todayString } from '@/utils/dateUtils';
import { isCompleted, isLate } from '@/utils/dayRules';

/** Marks a day as prayed. Completes the run when Day 9 is prayed (missed days do not block it). */
export async function markPrayed(runId: string, day: number, startedOn: string, prayedDays: number[]) {
  const today = todayString();
  await markDayPrayed(runId, day, today, isLate(day, startedOn, today));
  const completed = isCompleted([...prayedDays, day]);
  if (completed) await setRunStatus(runId, 'completed', today);
  return { completed };
}
