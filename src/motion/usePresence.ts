// Lets a pop-up animate OUT before it is removed. `mounted` stays true until the leaving animation has finished.
// `progress` goes 0 -> 1 as the pop-up arrives and 1 -> 0 as it leaves.
import { useEffect, useState } from 'react';
import { useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { duration, ease, spring } from './tokens';

export function usePresence(visible: boolean) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = reduced ? withTiming(1, { duration: duration.fade, easing: ease.out }) : withSpring(1, spring.sheet);
    } else {
      progress.value = withTiming(0, { duration: reduced ? duration.quick : duration.sheetOut, easing: ease.in }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  return { mounted, progress, reduced };
}
