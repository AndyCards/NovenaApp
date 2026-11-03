// The day rules (Andy, 2026-10-13). Pure logic, no screens.
// - A run starts on a calendar date. Day N is due on start + (N - 1) days.
// - A past day not prayed is Missed. Continue moves to today's day.
// - Reading a later day does NOT mark it prayed.
import { NOVENA_LENGTH } from '@/constants/config';
import { daysBetween } from './dateUtils';

export type DayState = 'prayed' | 'today' | 'missed' | 'upcoming';

/** The day number due today (1..9), counted from the start date. */
export function dueDay(startedOn: string, today: string): number {
  const n = daysBetween(today, startedOn) + 1;
  return Math.max(1, Math.min(NOVENA_LENGTH, n));
}

/** True if today is past the last day of the novena. */
export const isPastEnd = (startedOn: string, today: string) =>
  daysBetween(today, startedOn) + 1 > NOVENA_LENGTH;

export function dayState(day: number, prayedDays: number[], startedOn: string, today: string): DayState {
  if (prayedDays.includes(day)) return 'prayed';
  const due = daysBetween(today, startedOn) + 1;
  if (day === due) return 'today';
  if (day < due) return 'missed';
  return 'upcoming';
}

export function missedDays(prayedDays: number[], startedOn: string, today: string): number[] {
  const upto = Math.min(NOVENA_LENGTH, daysBetween(today, startedOn)); // days strictly before today
  const out: number[] = [];
  for (let d = 1; d <= upto; d++) if (!prayedDays.includes(d)) out.push(d);
  return out;
}

/** The day "Continue" should open: today's day, or the next unprayed day in order if finished early. */
export function continueDay(prayedDays: number[], startedOn: string, today: string): number {
  const due = dueDay(startedOn, today);
  if (!prayedDays.includes(due)) return due;
  for (let d = due + 1; d <= NOVENA_LENGTH; d++) if (!prayedDays.includes(d)) return d;
  for (let d = 1; d <= NOVENA_LENGTH; d++) if (!prayedDays.includes(d)) return d;
  return NOVENA_LENGTH;
}

/** The day "Start / Pray Day N" goes to: in order from the last day prayed. */
export function nextDayInOrder(prayedDays: number[]): number {
  const last = prayedDays.length ? Math.max(...prayedDays) : 0;
  return Math.min(NOVENA_LENGTH, last + 1);
}

/** Done when Day 9 is prayed. Missed days do not block completion. */
export const isCompleted = (prayedDays: number[]) => prayedDays.includes(NOVENA_LENGTH);

/** Prayed after its due date? */
export const isLate = (day: number, startedOn: string, today: string) =>
  daysBetween(today, startedOn) + 1 > day;
