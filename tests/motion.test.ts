// Checks the motion rules that can be tested without a phone: the stagger timing and the token values.
import { duration, pressScale, staggerDelay, staggerMax, staggerStep } from '../src/motion/timing';

describe('motion tokens', () => {
  it('staggers neighbours one step apart', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(1)).toBe(staggerStep);
    expect(staggerDelay(3)).toBe(3 * staggerStep);
  });
  it('caps the stagger so long lists never make anyone wait', () => {
    expect(staggerDelay(50)).toBe(staggerMax * staggerStep);
    expect(staggerDelay(-2)).toBe(0);
  });
  it('keeps the longest possible entrance under half a second', () => {
    expect(staggerDelay(100) + duration.reveal).toBeLessThan(600);
  });
  it('only shrinks pressed things a little', () => {
    for (const s of Object.values(pressScale)) { expect(s).toBeGreaterThanOrEqual(0.9); expect(s).toBeLessThan(1); }
  });
});
