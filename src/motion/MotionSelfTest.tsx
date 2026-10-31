// Temporary check: prints to the Metro terminal whether motion is running. Remove once motion is confirmed on the phone.
import { useEffect } from 'react';
import { useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { spring } from './tokens';

export function MotionSelfTest() {
  const reduced = useReducedMotion();
  const v = useSharedValue(0);
  const sp = useSharedValue(0);
  useEffect(() => {
    console.log(`[motion] Reduce Motion seen by the app: ${reduced}`);
    const log = (msg: string) => console.log(`[motion] ${msg}`);
    v.value = withTiming(1, { duration: 600 }, (finished) => {
      'worklet';
      scheduleOnRN(log, `test animation finished=${finished}`);
    });
    sp.value = withSpring(1, spring.settle);
    const t2 = setTimeout(() => console.log(`[motion] spring value 100ms after start: ${sp.value}`), 100);
    const t3 = setTimeout(() => console.log(`[motion] spring value 600ms after start: ${sp.value}`), 600);
    const t = setTimeout(() => console.log(`[motion] value 400ms after start: ${v.value} (a number between 0 and 1 means it animates; exactly 1 means it jumps)`), 300);
    return () => { clearTimeout(t); clearTimeout(t2); clearTimeout(t3); };
  }, [reduced, v, sp]);
  return null;
}
