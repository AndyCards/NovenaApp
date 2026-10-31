// Temporary check: prints to the Metro terminal whether motion is running. Remove once motion is confirmed on the phone.
import { useEffect } from 'react';
import { useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export function MotionSelfTest() {
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  useEffect(() => {
    console.log(`[motion] Reduce Motion seen by the app: ${reduced}`);
    const log = (msg: string) => console.log(`[motion] ${msg}`);
    v.value = withTiming(1, { duration: 600 }, (finished) => {
      'worklet';
      scheduleOnRN(log, `test animation finished=${finished}`);
    });
    const t = setTimeout(() => console.log(`[motion] value 400ms after start: ${v.value} (a number between 0 and 1 means it animates; exactly 1 means it jumps)`), 300);
    return () => clearTimeout(t);
  }, [reduced, v]);
  return null;
}
