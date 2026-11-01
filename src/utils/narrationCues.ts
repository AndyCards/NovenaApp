// Follow-along timing: which paragraph of the prayer is being read aloud at a given moment of the audio.
//
// There are two ways to know this:
// 1. PRECISE: the audio-making tool (pipeline/tts.py) writes down exactly when each paragraph starts and ends
//    in the recording (`audio.cues` in catalog.json). The highlight then follows the real recording.
// 2. ESTIMATED: when a day has no cues yet (today: the placeholder tone, or recordings made before cues
//    existed), we share the real length of the recording between the paragraphs by how long their text is,
//    after taking out the pauses we know about (silence blocks, the 10-second intention pause, the short gap
//    after each paragraph). It still follows the real playback position, so pause, seek and replay all work,
//    but WHERE one paragraph ends and the next begins is a guess and can drift by a few seconds.
// Pure maths, no app code, so it is easy to test (tests/narrationCues.test.ts).
import type { DayBlock, NarrationCue } from '@/content/types';

// The pauses pipeline/tts.py puts into the recording. Keep these in step with that file.
export const TTS_GAP_AFTER_TEXT_SEC = 0.8;
export const TTS_INTENTION_PAUSE_SEC = 10;

export interface NarrationTimeline {
  cues: NarrationCue[]; // in the order they are spoken
  precise: boolean; // true = timings come from the recording itself; false = estimated
}

const isText = (b: DayBlock): b is Extract<DayBlock, { text: string }> => 'text' in b;

// Builds the timeline for one day. `recorded` is audio.cues from the catalog (if any); `durationSec` is the
// real length the audio player reports. Returns no cues when there is nothing trustworthy to work from.
export function buildTimeline(blocks: DayBlock[], recorded: NarrationCue[] | undefined, durationSec: number): NarrationTimeline {
  // 1. Real timings: use them as they are, as long as they point at text paragraphs that exist.
  const valid = (recorded ?? []).filter((c) => blocks[c.block] && isText(blocks[c.block]) && c.end > c.start);
  if (valid.length) return { cues: [...valid].sort((a, b) => a.start - b.start), precise: true };

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
      cues.push({ block: i, start: t, end });
      t = end + TTS_GAP_AFTER_TEXT_SEC * pauseScale;
    }
  });
  return { cues, precise: false };
}

// Which paragraph (block index) is being read at `positionSec`, or -1 for none.
// During a pause between paragraphs, the paragraph just read stays highlighted until the next one begins,
// like a reader resting before the next line. Before the first paragraph starts, nothing is highlighted.
export function activeBlockAt(cues: NarrationCue[], positionSec: number): number {
  let active = -1;
  for (const c of cues) {
    if (c.start <= positionSec + 0.05) active = c.block;
    else break;
  }
  return active;
}
