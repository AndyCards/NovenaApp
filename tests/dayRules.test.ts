// Automatic checks for the day rules (which day is due, which are missed, when a novena is complete).
import { continueDay, dayState, dueDay, isCompleted, isLate, missedDays, nextDayInOrder } from '../src/utils/dayRules';

const start = '2026-10-01';

describe('dayRules', () => {
  it('Day N is due on start + (N - 1) days', () => {
    expect(dueDay(start, '2026-10-01')).toBe(1);
    expect(dueDay(start, '2026-10-04')).toBe(4);
    expect(dueDay(start, '2026-10-20')).toBe(9); // capped
  });
  it('a past day not prayed is missed', () => {
    expect(dayState(2, [1], start, '2026-10-04')).toBe('missed');
    expect(dayState(4, [1], start, '2026-10-04')).toBe('today');
    expect(dayState(5, [1], start, '2026-10-04')).toBe('upcoming');
    expect(dayState(1, [1], start, '2026-10-04')).toBe('prayed');
  });
  it('lists the missed days before today', () => {
    expect(missedDays([1], start, '2026-10-04')).toEqual([2, 3]);
    expect(missedDays([1, 2, 3], start, '2026-10-04')).toEqual([]);
  });
  it('Continue moves to today and reading ahead does not count', () => {
    expect(continueDay([1], start, '2026-10-05')).toBe(5);
    expect(continueDay([1, 2, 3, 4, 5], start, '2026-10-05')).toBe(6);
  });
  it('Start / Pray goes in order from the last day prayed', () => {
    expect(nextDayInOrder([])).toBe(1);
    expect(nextDayInOrder([1, 2])).toBe(3);
  });
  it('completes when Day 9 is prayed, even with missed days', () => {
    expect(isCompleted([1, 9])).toBe(true);
    expect(isCompleted([1, 2, 3])).toBe(false);
  });
  it('knows when a day is prayed late', () => {
    expect(isLate(2, start, '2026-10-04')).toBe(true);
    expect(isLate(4, start, '2026-10-04')).toBe(false);
  });
});
