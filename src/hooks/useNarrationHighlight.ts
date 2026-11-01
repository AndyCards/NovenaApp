// Follow-along: tells the Reader which sentence is being read aloud right now, so it can be highlighted.
// It watches the real audio position (from the phone's player), not a stopwatch, so it stays right through
// pause, resume, seeking, replay and buffering. The screen only re-draws when the paragraph changes,
// not on every position update. Only the sentence changes cause a re-draw.
//
// What it returns, in each player state:
// - Not started yet (the player opens paused at 0:00): nothing highlighted.
// - Playing / buffering: the paragraph at the current position.
// - Paused: stays on the paragraph where it was paused. Seeking while paused moves it.
// - Finished, closed, error, or the audio belongs to another day or novena: nothing highlighted.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DayBlock, NarrationCue } from '@/content/types';
import { usePlayerStore, type PlayerState } from '@/state/playerStore';
import { activeCueAt, buildTimeline } from '@/utils/narrationCues';

const following: PlayerState[] = ['playing', 'loading', 'paused'];

// What is highlighted: the paragraph (block index) and the sentence inside it (character positions).
export type ActiveSpan = { block: number; from: number; to: number };
const NONE: ActiveSpan = { block: -1, from: 0, to: 0 };

export function useNarrationHighlight(novenaId: string | undefined, day: number, blocks: DayBlock[] | undefined, recordedCues?: NarrationCue[]) {
  // The real length of the recording, once the player knows it (only changes when new audio loads).
  const durationSec = usePlayerStore((s) => (s.novenaId === novenaId && s.day === day ? s.durationSec : 0));
  const timeline = useMemo(() => buildTimeline(blocks ?? [], recordedCues, durationSec), [blocks, recordedCues, durationSec]);
  const [active, setActive] = useState<ActiveSpan>(NONE);
  const started = useRef(false); // has this day's audio been played at least once since it was opened?

  // "started" resets by itself whenever the audio is closed, finishes, or switches to another day or novena.
  useEffect(() => {
    const update = () => {
      const s = usePlayerStore.getState();
      const mine = !!novenaId && s.novenaId === novenaId && s.day === day;
      if (!mine || !following.includes(s.state)) started.current = false;
      else if (s.state === 'playing' || s.positionSec > 0) started.current = true; // > 0: e.g. coming back to a paused prayer
      const cue = started.current ? activeCueAt(timeline.cues, s.positionSec) : null;
      const next = cue ? { block: cue.block, from: cue.from ?? 0, to: cue.to ?? Number.MAX_SAFE_INTEGER } : NONE;
      // Same sentence as before: keep the old value, so nothing re-draws.
      setActive((prev) => (prev.block === next.block && prev.from === next.from && prev.to === next.to ? prev : next));
    };
    update();
    return usePlayerStore.subscribe(update);
  }, [novenaId, day, timeline]);

  return { activeIndex: active.block, active, precise: timeline.precise };
}
