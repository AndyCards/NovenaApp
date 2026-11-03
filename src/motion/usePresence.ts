// Drives a pop-up's arrival: `progress` goes 0 -> 1 as it appears (the card rises and settles).
// Leaving is handled by the phone's own fade on the Modal, which closes instantly in the system's eyes. That matters:
// a pop-up that lingers for a moment after a tap can freeze the screen if the tap also navigates somewhere.
import { useEffect } from 'react';
import { useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { duration, ease, settle } from './tokens';

export function usePresence(visible: boolean) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);
  useEffect(() => {
    if (visible) {
      progress.value = reduced ? withTiming(1, { duration: duration.fade, easing: ease.out }) : withTiming(1, settle);
    } else {
      // Stay fully shown while the system fades the pop-up away, then reset quietly for next time.
      progress.value = withDelay(500, withTiming(0, { duration: 0 }));
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  return { mounted: visible, progress, reduced };
}
