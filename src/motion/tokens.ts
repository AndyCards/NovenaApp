// The app's motion language: how fast and how soft everything moves.
// Calm and quick, with no bounce, so nothing makes the person wait. Matches the Figma motion tokens
// (out = enter, in = exit, push = screen reveal, sheet = card rising from the bottom).
import { Easing, ReduceMotion } from 'react-native-reanimated';

// Curves. Each is a "smooth out" shape: fast start, soft landing.
export const ease = {
  out: Easing.bezier(0, 0, 0.2, 1),
  in: Easing.bezier(0.4, 0, 1, 1),
  inOut: Easing.bezier(0.45, 0, 0.25, 1),
  push: Easing.bezier(0.2, 0.8, 0.2, 1),
  sheet: Easing.bezier(0.32, 0.72, 0, 1),
};

// Springs. Heavily damped, so they settle softly without wobbling.
// "System" means: if iPhone Settings > Accessibility > Reduce Motion is on, the movement is skipped.
export const spring = {
  release: { damping: 28, stiffness: 420, mass: 1, overshootClamping: true, reduceMotion: ReduceMotion.System },
  settle: { damping: 30, stiffness: 320, mass: 1, overshootClamping: true, reduceMotion: ReduceMotion.System },
  sheet: { damping: 32, stiffness: 300, mass: 1, overshootClamping: true, reduceMotion: ReduceMotion.System },
};

export * from './timing';
