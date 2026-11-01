// Follow-along: tells the Reader which paragraph is being read aloud right now, so it can be highlighted.
// It watches the real audio position (from the phone's player), not a stopwatch, so it stays right through
// pause, resume, seeking, replay and buffering. The screen only re-draws when the paragraph changes,
// not on every position update.
//
// What it returns, in each player state:
// - Not started yet (the player opens paused at 0:00): nothing highlighted.
// - Playing / buffering: the paragraph at the current position.
// - Paused: stays on the paragraph where it was paused. Seeking while paused moves it.
// - Finished, closed, error, or the audio belongs to another day or novena: nothing highlighted.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { DayBlock, NarrationCue } from '@/content/types';
import { usePlayerStore, type PlayerState } from '@/state/playerStore';
import { activeBlockAt, buildTimeline } from '@/utils/narrationCues';

const following: PlayerState[] = ['playing', 'loading', 'paused'];

export function useNarrationHighlight(novenaId: string | undefined, day: number, blocks: DayBlock[] | undefined, recordedCues?: NarrationCue[]) {
  // The real length of the recording, once the player knows it (only changes when new audio loads).
  const durationSec = usePlayerStore((s) => (s.novenaId === novenaId && s.day === day ? s.durationSec : 0));
  const timeline = useMemo(() => buildTimeline(blocks ?? [], recordedCues, durationSec), [blocks, recordedCues, durationSec]);
  const [active, setActive] = useState(-1);
  const started = useRef(false); // has this day's audio been played at least once since it was opened?

  // "started" resets by itself whenever the audio is closed, finishes, or switches to another day or novena.
  useEffect(() => {
    const update = () => {
      const s = usePlayerStore.getState();
      const mine = !!novenaId && s.novenaId === novenaId && s.day === day;
      if (!mine || !following.includes(s.state)) started.current = false;
      else if (s.state === 'playing' || s.positionSec > 0) started.current = true; // > 0: e.g. coming back to a paused prayer
      const next = started.current ? activeBlockAt(timeline.cues, s.positionSec) : -1;
      setActive((prev) => (prev === next ? prev : next)); // same paragraph: no re-draw
    };
    update();
    return usePlayerStore.subscribe(update);
  }, [novenaId, day, timeline]);

  return { activeIndex: active, precise: timeline.precise };
}
