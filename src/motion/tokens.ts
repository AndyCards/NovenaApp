// The app's motion language: how fast and how soft everything moves.
// Calm and quick, with no bounce, so nothing makes the person wait. Matches the Figma motion tokens
// (out = enter, in = exit, push = screen reveal, sheet = card rising from the bottom).
import { Easing, ReduceMotion } from 'react-native-reanimated';
import { duration } from './timing';

// Curves. Each is a "smooth out" shape: fast start, soft landing.
export const ease = {
  out: Easing.bezier(0, 0, 0.2, 1),
  in: Easing.bezier(0.4, 0, 1, 1),
  inOut: Easing.bezier(0.45, 0, 0.25, 1),
  push: Easing.bezier(0.2, 0.8, 0.2, 1),
  sheet: Easing.bezier(0.32, 0.72, 0, 1),
};

// Soft landings. These are smooth timed curves (no bounce) rather than physics springs: they behave the same on every
// phone, and match the calm tone of the app. "System" means: with iPhone's Reduce Motion on, the movement is skipped.
export const settle = { duration: duration.sheetIn, easing: ease.sheet, reduceMotion: ReduceMotion.System };
export const release = { duration: 180, easing: ease.out, reduceMotion: ReduceMotion.System };

export * from './timing';
