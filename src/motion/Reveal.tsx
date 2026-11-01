// Fades a piece of a page in while sliding it up a little. Pass `index` so neighbours appear one after another.
// Plays once when the piece first appears, never on later updates. Skipped when Reduce Motion is on.
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeOut, LinearTransition, ReduceMotion, useReducedMotion, withDelay, withTiming } from 'react-native-reanimated';
import { duration, ease, revealDistance, staggerDelay } from './tokens';

// The "entering" recipe for the Nth item. Runs on the UI thread.
export function revealIn(index: number, withSlide = true, fromX = 0, fromScale = 1) {
  const delay = staggerDelay(index);
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ translateY: withSlide ? revealDistance : 0 }, { translateX: fromX }, { scale: fromScale }] },
      animations: {
        opacity: withDelay(delay, withTiming(1, { duration: duration.reveal, easing: ease.out })),
        transform: [{ translateY: withDelay(delay, withTiming(0, { duration: duration.reveal, easing: ease.push })) }, { translateX: withDelay(delay, withTiming(0, { duration: duration.reveal, easing: ease.push })) }, { scale: withDelay(delay, withTiming(1, { duration: duration.sheetIn, easing: ease.sheet })) }],
      },
    };
  };
}

// For items in a list that can be removed: neighbours glide into the gap and the removed item fades out.
const listMove = LinearTransition.duration(duration.sheetIn).easing(ease.sheet).reduceMotion(ReduceMotion.System);
const listLeave = FadeOut.duration(duration.fade).reduceMotion(ReduceMotion.System);

type Props = { index?: number; slide?: boolean; fromX?: number; fromScale?: number; list?: boolean; children: ReactNode; style?: StyleProp<ViewStyle> };

export function Reveal({ index = 0, slide = true, fromX = 0, fromScale = 1, list = false, children, style }: Props) {
  const reduced = useReducedMotion();
  return (
    <Animated.View entering={reduced ? undefined : revealIn(index, slide, fromX, fromScale)} layout={list && !reduced ? listMove : undefined} exiting={list && !reduced ? listLeave : undefined} style={style}>
      {children}
    </Animated.View>
  );
}
