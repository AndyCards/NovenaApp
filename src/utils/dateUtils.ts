// Dates are handled as local calendar days ("YYYY-MM-DD"), never as timestamps.
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';

export const toDayString = (d: Date) => format(d, 'yyyy-MM-dd');
export const todayString = () => toDayString(new Date());
export const fromDayString = (s: string) => parseISO(s);
export const addDaysTo = (s: string, n: number) => toDayString(addDays(parseISO(s), n));
export const daysBetween = (later: string, earlier: string) =>
  differenceInCalendarDays(parseISO(later), parseISO(earlier));

/** "10 to 18 August" or "28 Aug to 5 Sep" */
export function formatRange(start: string, end: string) {
  const a = parseISO(start);
  const b = parseISO(end);
  return a.getMonth() === b.getMonth()
    ? `${format(a, 'd')} to ${format(b, 'd MMMM')}`
    : `${format(a, 'd MMM')} to ${format(b, 'd MMM')}`;
}

export const formatShortDate = (s: string) => format(parseISO(s), 'd MMM');
export const formatMonthDay = (s: string) => format(parseISO(s), 'MMM d');
export const formatTime12 = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return format(d, 'h:mm a');
};
