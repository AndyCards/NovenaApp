// A quiet "that worked" cue: the thing swells a little and settles back whenever `trigger` changes (not on first show).
// Used for saving a novena. No bounce, and skipped when Reduce Motion is on.
import { useEffect, useRef } from 'react';
import { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { duration, ease } from './tokens';

export function usePulse(trigger: unknown, peak = 1.18) {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (reduced) return;
    s.value = withSequence(withTiming(peak, { duration: duration.quick, easing: ease.out }), withTiming(1, { duration: duration.fade, easing: ease.inOut }));
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}
