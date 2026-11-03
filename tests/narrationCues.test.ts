// Automatic checks for follow-along timing: which paragraph is highlighted at each moment of the audio.
import type { DayBlock, NarrationCue } from '../src/content/types';
import { activeBlockAt, activeCueAt, buildTimeline, splitSentences, TTS_GAP_AFTER_TEXT_SEC, TTS_INTENTION_PAUSE_SEC } from '../src/utils/narrationCues';

const blocksOf = (cues: NarrationCue[]) => [...new Set(cues.map((c) => c.block))];

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
    expect(blocksOf(t.cues)).toEqual([0, 1, 4]);
  });
  it('keeps a paragraph-only cue\'s real start and end, sharing it between its sentences', () => {
    const p = t.cues.filter((c) => c.block === 1);
    expect(p.length).toBe(6);
    expect(p[0].start).toBe(2.3);
    expect(p[5].end).toBeCloseTo(40);
    expect(long.slice(p[1].from, p[1].to)).toBe('Dear Lord, we thank You for giving us Our Lady of Sorrows to be our loving mother.');
  });
  it('uses sentence cues exactly as recorded', () => {
    const exact = buildTimeline(blocks, [{ block: 1, start: 3, end: 5, from: 0, to: 10 }, { block: 1, start: 5.5, end: 9, from: 11, to: 20 }], 50);
    expect(exact.cues).toEqual([{ block: 1, start: 3, end: 5, from: 0, to: 10 }, { block: 1, start: 5.5, end: 9, from: 11, to: 20 }]);
    expect(activeCueAt(exact.cues, 6)).toEqual({ block: 1, start: 5.5, end: 9, from: 11, to: 20 });
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
    expect(blocksOf(t.cues)).toEqual([0, 1, 4]);
    const span = (b: number) => { const c = t.cues.filter((q) => q.block === b); return { start: c[0].start, end: c[c.length - 1].end }; };
    // The long paragraph gets far more time than "Amen."
    expect(span(1).end - span(1).start).toBeGreaterThan((span(0).end - span(0).start) * 50);
    // The last paragraph starts after the intention and silence pauses, and ends at the end of the audio.
    expect(span(4).start - span(1).end).toBeCloseTo(TTS_GAP_AFTER_TEXT_SEC + TTS_INTENTION_PAUSE_SEC + 5);
    expect(span(4).end + TTS_GAP_AFTER_TEXT_SEC).toBeCloseTo(duration);
    // Every cue is a sentence.
    t.cues.forEach((c) => expect(c.to! > c.from!).toBe(true));
  });

  it('still works when the audio is shorter than the pauses (a short test tone)', () => {
    const t = buildTimeline(blocks, undefined, 8);
    expect(blocksOf(t.cues)).toEqual([0, 1, 4]);
    expect(t.cues[t.cues.length - 1].end).toBeLessThanOrEqual(8);
    t.cues.forEach((c) => expect(c.end).toBeGreaterThan(c.start));
  });

  it('nothing is highlighted before the first paragraph, and a day without text has no cues', () => {
    expect(activeBlockAt([{ block: 0, start: 1, end: 2 }], 0.5)).toBe(-1);
    expect(buildTimeline([{ type: 'silence', seconds: 3 }], undefined, 10).cues).toEqual([]);
  });
});

describe('sentences', () => {
  it('splits on . ! ? followed by a space, keeping closing quotes, leaving out spaces', () => {
    const text = 'In the name of the Father. Amen!  \u201CHail Mary.\u201D And then? the end';
    expect(splitSentences(text).map(([f, t]) => text.slice(f, t))).toEqual(['In the name of the Father.', 'Amen!', '\u201CHail Mary.\u201D', 'And then?', 'the end']);
  });
  it('does not split after St. or Bl., and a single sentence stays whole', () => {
    const t = 'O St. Anthony, pray for us. Bl. Carlo, pray for us.';
    expect(splitSentences(t).map(([f, e]) => t.slice(f, e))).toEqual(['O St. Anthony, pray for us.', 'Bl. Carlo, pray for us.']);
    expect(splitSentences('Amen.')).toEqual([[0, 5]]);
    expect(splitSentences('Pray for us...')).toEqual([[0, 14]]);
  });
});
