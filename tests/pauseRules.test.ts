// Automatic checks for when "Take a pause?" may appear, and for reading saved prayer progress safely.
import { parseProgress, shouldOfferPause } from '../src/utils/pauseRules';

const rules = { minEngagedSeconds: 30, scrollEngagedPx: 400, minSecondsWithScroll: 10 };

describe('shouldOfferPause', () => {
  it('a quick look and Back leaves straight away', () => {
    expect(shouldOfferPause({ activeSeconds: 5, maxScrollPx: 0, done: false }, rules)).toBe(false);
    expect(shouldOfferPause({ activeSeconds: 29.9, maxScrollPx: 100, done: false }, rules)).toBe(false);
  });
  it('30 seconds or more in the prayer asks first', () => {
    expect(shouldOfferPause({ activeSeconds: 30, maxScrollPx: 0, done: false }, rules)).toBe(true);
    expect(shouldOfferPause({ activeSeconds: 600, maxScrollPx: 0, done: false }, rules)).toBe(true);
  });
  it('scrolling through the prayer counts, but not a quick flick', () => {
    expect(shouldOfferPause({ activeSeconds: 12, maxScrollPx: 450, done: false }, rules)).toBe(true);
    expect(shouldOfferPause({ activeSeconds: 4, maxScrollPx: 2000, done: false }, rules)).toBe(false);
    expect(shouldOfferPause({ activeSeconds: 20, maxScrollPx: 399, done: false }, rules)).toBe(false);
  });
  it('never asks once the day is prayed (or in a preview)', () => {
    expect(shouldOfferPause({ activeSeconds: 900, maxScrollPx: 5000, done: true }, rules)).toBe(false);
  });
  it('uses the app settings when no rules are given', () => {
    expect(shouldOfferPause({ activeSeconds: 0, maxScrollPx: 0, done: false })).toBe(false);
  });
});

describe('parseProgress', () => {
  const saved = JSON.stringify({ day: 3, scrollY: 820, readFraction: 0.6, audioSec: 42.5, savedAt: 1 });
  it('restores the same day exactly', () => {
    expect(parseProgress(saved, 3)).toEqual({ day: 3, scrollY: 820, readFraction: 0.6, audioSec: 42.5, savedAt: 1 });
  });
  it('ignores progress from another day', () => {
    expect(parseProgress(saved, 4)).toBeNull();
  });
  it('ignores missing or broken data instead of crashing', () => {
    expect(parseProgress(undefined, 1)).toBeNull();
    expect(parseProgress('not json', 1)).toBeNull();
    expect(parseProgress(JSON.stringify({ day: 1, scrollY: -5, audioSec: 'x', readFraction: 3 }), 1))
      .toEqual({ day: 1, scrollY: 0, readFraction: 1, audioSec: 0, savedAt: 0 });
  });
});
