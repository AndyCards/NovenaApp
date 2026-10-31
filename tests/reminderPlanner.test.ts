// Automatic checks that reminders are planned for the right days and times, and skip quiet hours.
import { inQuietHours, planReminders } from '../src/utils/reminderPlanner';

const settings = { enabled: true, time: '08:00', weekdays: 127, missedDayNote: true, quietStart: '22:00', quietEnd: '07:00' };
const run = { runId: 'r1', novenaTitle: 'St. Anthony Novena', startedOn: '2026-10-01', prayedDays: [1], remindersOn: true };

describe('reminderPlanner', () => {
  it('handles quiet hours that wrap past midnight', () => {
    expect(inQuietHours('23:00', '22:00', '07:00')).toBe(true);
    expect(inQuietHours('06:00', '22:00', '07:00')).toBe(true);
    expect(inQuietHours('08:00', '22:00', '07:00')).toBe(false);
  });
  it('plans nothing when reminders are off', () => {
    expect(planReminders({ ...settings, enabled: false }, [run], '2026-10-02')).toEqual([]);
  });
  it('skips prayed days and days outside the novena', () => {
    const planned = planReminders(settings, [run], '2026-10-02').filter((p) => p.kind === 'daily');
    expect(planned.map((p) => p.day)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('plans one missed-day note the morning after each unprayed day', () => {
    const missed = planReminders(settings, [run], '2026-10-02').filter((p) => p.kind === 'missed');
    // Day 2 is 2 Oct, so its note is on 3 Oct at 9:00; day 8 is the last one that can be followed by a note.
    expect(missed[0]).toMatchObject({ date: '2026-10-03', time: '09:00' });
    expect(missed).toHaveLength(7);
    expect(planReminders({ ...settings, missedDayNote: false }, [run], '2026-10-02').some((p) => p.kind === 'missed')).toBe(false);
  });
  it('respects the per-novena switch', () => {
    expect(planReminders(settings, [{ ...run, remindersOn: false }], '2026-10-02')).toEqual([]);
  });
});
