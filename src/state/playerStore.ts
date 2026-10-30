// What audio is playing right now. Audio never starts by itself: the first state is "paused".
import { create } from 'zustand';

export type PlayerState = 'hidden' | 'loading' | 'paused' | 'playing' | 'finished' | 'offline' | 'error';

interface PlayerStore {
  novenaId: string | null;
  novenaTitle: string;
  day: number;
  state: PlayerState;
  positionSec: number;
  durationSec: number;
  load: (novenaId: string, novenaTitle: string, day: number) => void;
  set: (patch: Partial<Pick<PlayerStore, 'state' | 'positionSec' | 'durationSec'>>) => void;
  dismiss: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  novenaId: null,
  novenaTitle: '',
  day: 1,
  state: 'hidden',
  positionSec: 0,
  durationSec: 0,
  load: (novenaId, novenaTitle, day) => set({ novenaId, novenaTitle, day, state: 'paused', positionSec: 0 }),
  set: (patch) => set(patch),
  dismiss: () => set({ state: 'hidden', novenaId: null }),
}));
