// Follow-along timing: which sentence of the prayer is being read aloud at a given moment of the audio.
//
// There are two ways to know this:
// 1. PRECISE: the audio-making tool (pipeline/tts.py) writes down exactly when each sentence starts and ends
//    in the recording (`audio.cues` in catalog.json, each with the sentence's position in the paragraph text).
//    The highlight then follows the real recording. Older paragraph-only cues still work: the paragraph's
//    real start and end are kept, and its sentences share that time by length.
// 2. ESTIMATED: when a day has no cues yet (today: the placeholder tone), we share the real length of the
//    recording between the sentences by how long their text is, after taking out the pauses we know about
//    (silence blocks, the 10-second intention pause, the short gap after each paragraph). It still follows the
//    real playback position, so pause, seek and replay all work, but where one sentence ends and the next
//    begins is a guess and can drift by a few seconds.
// Pure maths, no app code, so it is easy to test (tests/narrationCues.test.ts).
import type { DayBlock, NarrationCue } from '@/content/types';

// The pauses pipeline/tts.py puts into the recording. Keep these in step with that file.
export const TTS_GAP_AFTER_TEXT_SEC = 0.8;
export const TTS_INTENTION_PAUSE_SEC = 10;

export interface NarrationTimeline {
  cues: NarrationCue[]; // in the order they are spoken; every cue has from/to (a sentence)
  precise: boolean; // true = timings come from the recording itself; false = estimated
}

const isText = (b: DayBlock): b is Extract<DayBlock, { text: string }> => 'text' in b;

// Where each sentence sits in a paragraph, as [from, to) character positions (trailing spaces left out).
// A sentence ends at . ! or ? (plus any closing quote or bracket) followed by a space or line break.
// Short titles like "St." or "Bl." don't end a sentence.
// pipeline/tts.py and pipeline/test-narration.py split sentences with the same rule.
export const NOT_SENTENCE_ENDS = ['St', 'Sts', 'Bl', 'Mt', 'Fr', 'Dr', 'Mr', 'Mrs', 'Ms', 'Sr', 'Br'];
const titleBefore = (text: string, dot: number) => {
  const word = /([A-Za-z]+)$/.exec(text.slice(0, dot));
  return !!word && NOT_SENTENCE_ENDS.includes(word[1]);
};

export function splitSentences(text: string): [number, number][] {
  const out: [number, number][] = [];
  const end = /[.!?]+["'”’)]*(?=\s)/g;
  let from = 0;
  let m: RegExpExecArray | null;
  while ((m = end.exec(text))) {
    if (m[0] === '.' && titleBefore(text, m.index)) continue; // "St. Anthony"
    const to = m.index + m[0].length;
    if (text.slice(from, to).trim()) out.push([from, to]);
    from = to;
    while (from < text.length && /\s/.test(text[from])) from++;
  }
  const rest = text.slice(from).trimEnd();
  if (rest.trim()) out.push([from, from + rest.length]);
  // Leave out any leading spaces of a sentence.
  return out.map(([f, t]) => { while (f < t && /\s/.test(text[f])) f++; return [f, t]; });
}

// Shares a paragraph's [start, end] time between its sentences by their length.
function spreadOverSentences(block: number, text: string, start: number, end: number): NarrationCue[] {
  const parts = splitSentences(text);
  const total = parts.reduce((n, [f, t]) => n + (t - f), 0) || 1;
  let t = start;
  return parts.map(([from, to]) => {
    const s = t;
    t += ((to - from) / total) * (end - start);
    return { block, start: s, end: t, from, to };
  });
}

// Builds the timeline for one day. `recorded` is audio.cues from the catalog (if any); `durationSec` is the
// real length the audio player reports. Returns no cues when there is nothing trustworthy to work from.
export function buildTimeline(blocks: DayBlock[], recorded: NarrationCue[] | undefined, durationSec: number): NarrationTimeline {
  // 1. Real timings: use them, as long as they point at text paragraphs that exist.
  const valid = (recorded ?? []).filter((c) => blocks[c.block] && isText(blocks[c.block]) && c.end > c.start);
  if (valid.length) {
    const cues = [...valid].sort((a, b) => a.start - b.start).flatMap((c) => {
      const text = (blocks[c.block] as { text: string }).text;
      if (c.from !== undefined && c.to !== undefined && c.to > c.from && c.to <= text.length) return [c];
      return spreadOverSentences(c.block, text, c.start, c.end); // paragraph-only cue
    });
    return { cues, precise: true };
  }

  // 2. Estimate from the real duration. Without a duration (audio not loaded yet) there is nothing to go on.
  if (!(durationSec > 0)) return { cues: [], precise: false };
  let fixed = 0; // seconds of known pauses
  let chars = 0; // total length of the spoken text
  for (const b of blocks) {
    if (b.type === 'silence') fixed += b.seconds;
    else if (b.type === 'intention') fixed += TTS_INTENTION_PAUSE_SEC;
    else { fixed += TTS_GAP_AFTER_TEXT_SEC; chars += b.text.length; }
  }
  if (!chars) return { cues: [], precise: false };
  // If the recording is shorter than the pauses alone (e.g. a short test tone), shrink everything evenly.
  const pauseScale = fixed < durationSec * 0.9 ? 1 : (durationSec * 0.3) / fixed;
  const perChar = (durationSec - fixed * pauseScale) / chars;
  const cues: NarrationCue[] = [];
  let t = 0;
  blocks.forEach((b, i) => {
    if (b.type === 'silence') t += b.seconds * pauseScale;
    else if (b.type === 'intention') t += TTS_INTENTION_PAUSE_SEC * pauseScale;
    else {
      const end = t + b.text.length * perChar;
      cues.push(...spreadOverSentences(i, b.text, t, end));
      t = end + TTS_GAP_AFTER_TEXT_SEC * pauseScale;
    }
  });
  return { cues, precise: false };
}

// The sentence being read at `positionSec`, or null for none.
// During a pause, the sentence just read stays highlighted until the next one begins, like a reader resting
// before the next line. Before the first sentence starts, nothing is highlighted.
export function activeCueAt(cues: NarrationCue[], positionSec: number): NarrationCue | null {
  let active: NarrationCue | null = null;
  for (const c of cues) {
    if (c.start <= positionSec + 0.05) active = c;
    else break;
  }
  return active;
}

// Which paragraph (block index) is being read at `positionSec`, or -1 for none.
export const activeBlockAt = (cues: NarrationCue[], positionSec: number) => activeCueAt(cues, positionSec)?.block ?? -1;
