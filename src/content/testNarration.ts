// TEMPORARY TEST AID (only while PLACEHOLDER_AUDIO is on in constants/config.ts).
// A computer voice (espeak-ng) reading Day 1 of every novena, so the follow-along highlight can be checked
// against a real voice before the proper recordings exist. The timings below were measured from the same
// audio as it was made, so the highlight on these days is exact, not estimated.
// Other days still play the placeholder tone (estimated highlight). Delete this file and
// assets/audio/test-narration/ once real narration is ready.
import type { NarrationCue } from './types';

type TestNarration = { source: number; cues: NarrationCue[] };

const narrations: Record<string, TestNarration> = {
  'st-anthony': { source: require('../../assets/audio/test-narration/st-anthony-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.04 }, { block: 1, start: 12.84, end: 26.944 }, { block: 2, start: 27.744, end: 41.391 }, { block: 5, start: 62.191, end: 71.75 }] },
  'st-joseph': { source: require('../../assets/audio/test-narration/st-joseph-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.005 }, { block: 1, start: 12.805, end: 26.91 }, { block: 2, start: 27.71, end: 41.32 }, { block: 5, start: 62.12, end: 71.685 }] },
  'st-therese': { source: require('../../assets/audio/test-narration/st-therese-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.571 }, { block: 1, start: 13.371, end: 27.476 }, { block: 2, start: 28.276, end: 42.413 }, { block: 5, start: 63.213, end: 73.319 }] },
  'divine-mercy': { source: require('../../assets/audio/test-narration/divine-mercy-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.079 }, { block: 1, start: 12.879, end: 26.984 }, { block: 2, start: 27.784, end: 41.427 }, { block: 5, start: 62.227, end: 71.855 }] },
  'st-monica': { source: require('../../assets/audio/test-narration/st-monica-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.017 }, { block: 1, start: 12.817, end: 26.922 }, { block: 2, start: 27.722, end: 41.333 }, { block: 5, start: 62.133, end: 71.667 }] },
  'st-dymphna': { source: require('../../assets/audio/test-narration/st-dymphna-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 11.986 }, { block: 1, start: 12.786, end: 26.89 }, { block: 2, start: 27.69, end: 41.242 }, { block: 5, start: 62.042, end: 71.548 }] },
  'st-joan-of-arc': { source: require('../../assets/audio/test-narration/st-joan-of-arc-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.308 }, { block: 1, start: 13.108, end: 27.212 }, { block: 2, start: 28.012, end: 41.905 }, { block: 5, start: 62.705, end: 72.542 }] },
  'st-cajetan': { source: require('../../assets/audio/test-narration/st-cajetan-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.197 }, { block: 1, start: 12.997, end: 27.101 }, { block: 2, start: 27.901, end: 41.635 }, { block: 5, start: 62.435, end: 72.124 }] },
  'st-jude': { source: require('../../assets/audio/test-narration/st-jude-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 11.876 }, { block: 1, start: 12.676, end: 26.78 }, { block: 2, start: 27.58, end: 41.052 }, { block: 5, start: 61.852, end: 71.259 }] },
  'mary-undoer-of-knots': { source: require('../../assets/audio/test-narration/mary-undoer-of-knots-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.822 }, { block: 1, start: 13.622, end: 27.726 }, { block: 2, start: 28.526, end: 42.956 }, { block: 5, start: 63.756, end: 74.118 }] },
  'perpetual-succour': { source: require('../../assets/audio/test-narration/perpetual-succour-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.992 }, { block: 1, start: 13.792, end: 27.897 }, { block: 2, start: 28.697, end: 43.273 }, { block: 5, start: 64.073, end: 74.609 }] },
  'mount-carmel': { source: require('../../assets/audio/test-narration/mount-carmel-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.748 }, { block: 1, start: 13.548, end: 27.654 }, { block: 2, start: 28.454, end: 42.777 }, { block: 5, start: 63.577, end: 73.855 }] },
  'sacred-heart': { source: require('../../assets/audio/test-narration/sacred-heart-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.733 }, { block: 1, start: 13.533, end: 27.637 }, { block: 2, start: 28.437, end: 42.74 }, { block: 5, start: 63.54, end: 73.796 }] },
  'surrender-novena': { source: require('../../assets/audio/test-narration/surrender-novena-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 11.792 }, { block: 1, start: 12.592, end: 26.697 }, { block: 2, start: 27.497, end: 40.89 }, { block: 5, start: 61.69, end: 71.028 }] },
  'st-john-bosco': { source: require('../../assets/audio/test-narration/st-john-bosco-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 12.398 }, { block: 1, start: 13.198, end: 27.302 }, { block: 2, start: 28.102, end: 42.083 }, { block: 5, start: 62.883, end: 72.815 }] },
  'bl-carlo-acutis': { source: require('../../assets/audio/test-narration/bl-carlo-acutis-day-1.m4a'), cues: [{ block: 0, start: 0.0, end: 13.094 }, { block: 1, start: 13.894, end: 27.999 }, { block: 2, start: 28.799, end: 43.432 }, { block: 5, start: 64.232, end: 74.851 }] },
};

// The test voice for this novena and day, if there is one (Day 1 only).
export const testNarration = (novenaId: string | undefined, day: number): TestNarration | undefined =>
  novenaId && day === 1 ? narrations[novenaId] : undefined;
