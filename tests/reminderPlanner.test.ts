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
    const planned = planReminders(settings, [run], '2026-10-02');
    expect(planned.map((p) => p.day)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('respects the per-novena switch', () => {
    expect(planReminders(settings, [{ ...run, remindersOn: false }], '2026-10-02')).toEqual([]);
  });
});
