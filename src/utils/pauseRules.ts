// The rule for when to show the gentle "Take a pause?" card. Kept as a plain function so it can be tested
// on its own, and so the numbers live in one place (PAUSE_PROMPT in constants/config.ts).
//
// The card never appears just because time passed: it is only ever checked when the person tries to leave.
import { PAUSE_PROMPT } from '@/constants/config';

export type PauseRules = typeof PAUSE_PROMPT;

export type Engagement = {
  activeSeconds: number; // time spent on the screen while the app was open (time in the background doesn't count)
  maxScrollPx: number; // the furthest the person has scrolled down
  done: boolean; // the day is already prayed, or this is a read-only preview: never ask
};

// True when leaving should first ask "Take a pause?".
export function shouldOfferPause(e: Engagement, rules: PauseRules = PAUSE_PROMPT): boolean {
  if (e.done) return false;
  if (e.activeSeconds >= rules.minEngagedSeconds) return true;
  return e.maxScrollPx >= rules.scrollEngagedPx && e.activeSeconds >= rules.minSecondsWithScroll;
}

// What is remembered about a prayer the person stepped away from, so it opens again exactly where they were.
export type PrayerProgress = {
  day: number; // which day of the novena (e.g. Day 3 of 9)
  scrollY: number; // how far down the prayer they had scrolled
  readFraction: number; // 0 to 1, how much of the prayer they have scrolled through
  audioSec: number; // where the audio was, in seconds (0 if no audio was playing)
  savedAt: number; // when it was saved
};

// Reads saved progress safely: anything broken or from another day is ignored rather than crashing.
export function parseProgress(raw: string | undefined | null, day: number): PrayerProgress | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<PrayerProgress>;
    if (p.day !== day) return null;
    const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
    return { day, scrollY: num(p.scrollY), readFraction: Math.min(1, num(p.readFraction)), audioSec: num(p.audioSec), savedAt: num(p.savedAt) };
  } catch {
    return null;
  }
}
