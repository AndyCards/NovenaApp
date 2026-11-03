// True once a scroll view has moved off the top. Top bars use it to show their shadow only while the page is scrolled.
import { useCallback, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export function useScrolled(threshold = 2) {
  const [scrolled, setScrolled] = useState(false);
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const past = e.nativeEvent.contentOffset.y > threshold;
    setScrolled((was) => (was === past ? was : past));
  }, [threshold]);
  return { scrolled, onScroll };
}
