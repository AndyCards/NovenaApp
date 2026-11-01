// Automatic checks for follow-along timing: which paragraph is highlighted at each moment of the audio.
import type { DayBlock, NarrationCue } from '../src/content/types';
import { activeBlockAt, buildTimeline, TTS_GAP_AFTER_TEXT_SEC, TTS_INTENTION_PAUSE_SEC } from '../src/utils/narrationCues';

const short = 'Amen.';
const long = 'Dear Lord, we thank You for giving us Our Lady of Sorrows to be our loving mother. '.repeat(6);
const blocks: DayBlock[] = [
  { type: 'opening', text: short },
  { type: 'prayer', text: long },
  { type: 'intention' },
  { type: 'silence', seconds: 5 },
  { type: 'closing', text: long.slice(0, 120) },
];

describe('precise timings from the recording', () => {
  const recorded: NarrationCue[] = [
    { block: 4, start: 60, end: 70 }, // out of order on purpose
    { block: 0, start: 0, end: 1.5 },
    { block: 1, start: 2.3, end: 40 },
  ];
  const t = buildTimeline(blocks, recorded, 999);

  it('uses the recorded cues, in spoken order, and says they are precise', () => {
    expect(t.precise).toBe(true);
    expect(t.cues.map((c) => c.block)).toEqual([0, 1, 4]);
  });
  it('follows the position: start, mid-paragraph, gaps, seek back and forward', () => {
    expect(activeBlockAt(t.cues, 0)).toBe(0);
    expect(activeBlockAt(t.cues, 1.9)).toBe(0); // short gap: last paragraph stays
    expect(activeBlockAt(t.cues, 2.3)).toBe(1);
    expect(activeBlockAt(t.cues, 45)).toBe(1); // intention + silence pause: still the prayer just read
    expect(activeBlockAt(t.cues, 61)).toBe(4); // seek forward
    expect(activeBlockAt(t.cues, 10)).toBe(1); // seek back
  });
  it('ignores cues that point at a missing or non-text block', () => {
    const bad = buildTimeline(blocks, [{ block: 2, start: 0, end: 3 }, { block: 99, start: 0, end: 3 }], 100);
    expect(bad.precise).toBe(false); // falls back to the estimate
  });
});

describe('estimate when the recording has no cues', () => {
  it('has nothing to highlight until the real duration is known', () => {
    expect(buildTimeline(blocks, undefined, 0).cues).toEqual([]);
  });

  it('shares the real duration by text length, keeping the known pauses', () => {
    const duration = 120;
    const t = buildTimeline(blocks, undefined, duration);
    expect(t.precise).toBe(false);
    expect(t.cues.map((c) => c.block)).toEqual([0, 1, 4]);
    // The long paragraph gets far more time than "Amen."
    const len = (i: number) => t.cues[i].end - t.cues[i].start;
    expect(len(1)).toBeGreaterThan(len(0) * 50);
    // The last paragraph starts after the intention and silence pauses, and ends at the end of the audio.
    expect(t.cues[2].start - t.cues[1].end).toBeCloseTo(TTS_GAP_AFTER_TEXT_SEC + TTS_INTENTION_PAUSE_SEC + 5);
    expect(t.cues[2].end + TTS_GAP_AFTER_TEXT_SEC).toBeCloseTo(duration);
  });

  it('still works when the audio is shorter than the pauses (a short test tone)', () => {
    const t = buildTimeline(blocks, undefined, 8);
    expect(t.cues.length).toBe(3);
    expect(t.cues[2].end).toBeLessThanOrEqual(8);
    t.cues.forEach((c) => expect(c.end).toBeGreaterThan(c.start));
  });

  it('nothing is highlighted before the first paragraph, and a day without text has no cues', () => {
    expect(activeBlockAt([{ block: 0, start: 1, end: 2 }], 0.5)).toBe(-1);
    expect(buildTimeline([{ type: 'silence', seconds: 3 }], undefined, 10).cues).toEqual([]);
  });
});
