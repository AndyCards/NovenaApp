// Gentle auto-scroll for the Reader while a prayer is read aloud.
// - Only moves when the paragraph being read changes AND that paragraph is not comfortably on screen.
//   If it is already visible, nothing moves.
// - Scrolls with the normal smooth iOS scroll so the paragraph lands about a fifth of the way down the page
//   (never a jump to the top). With Reduce Motion on it moves without the glide.
// - Never fights the person: while their finger is on the page, and for 8 seconds after they scroll,
//   it does nothing. It also stays still while VoiceOver is on, so it never pulls the VoiceOver cursor away.
// - Paused audio: no scrolling (the highlight just stays where it is).
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent, type ScrollViewInstance } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

const HANDS_OFF_MS = 8000; // after the person scrolls, wait this long before following again
const TOP_FADE = 12; // the white fade at the top of the Reader
const BOTTOM_FADE = 46; // the white fade at the bottom of the Reader
const LANDING = 0.2; // where the paragraph lands: 20% down the visible page
const MIN_VISIBLE = 72; // "comfortably visible" = at least about three lines of the paragraph can be seen

type Box = { y: number; height: number };

export function useFollowAlong(activeIndex: number, playing: boolean, resetKey: unknown) {
  const scrollRef = useRef<ScrollViewInstance>(null);
  const boxes = useRef<Record<number, Box>>({}); // where each paragraph sits inside the page
  const view = useRef({ offset: 0, height: 0 }); // how far the page is scrolled, and how tall the visible part is
  const touching = useRef(false);
  const userMoved = useRef(false); // the current scroll was started by the person's finger
  const handsOffUntil = useRef(0);
  const reduced = useReducedMotion();
  const [screenReader, setScreenReader] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader);
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => sub.remove();
  }, []);

  // A new day or novena: forget the old paragraph positions and any "hands off" from the last page.
  useEffect(() => { boxes.current = {}; handsOffUntil.current = 0; view.current.offset = 0; }, [resetKey]);

  useEffect(() => {
    if (!playing || activeIndex < 0 || screenReader) return;
    // Wait a moment so the page has settled before we measure.
    const t = setTimeout(() => {
      const box = boxes.current[activeIndex];
      const { offset, height } = view.current;
      if (!box || !height || touching.current || Date.now() < handsOffUntil.current) return;
      const top = offset + TOP_FADE;
      const bottom = offset + height - BOTTOM_FADE;
      const seen = Math.min(box.height, MIN_VISIBLE);
      if (box.y >= top && box.y + seen <= bottom) return; // already comfortably visible: stay still
      const y = Math.max(0, box.y - height * LANDING);
      scrollRef.current?.scrollTo({ y, animated: !reduced });
    }, 80);
    return () => clearTimeout(t);
  }, [activeIndex, playing, screenReader, reduced]);

  // Each paragraph reports where it is (paragraphs sit directly inside the scrolling page).
  const onBlockLayout = useCallback((index: number, e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    boxes.current[index] = { y, height };
  }, []);

  const handsOff = () => { handsOffUntil.current = Date.now() + HANDS_OFF_MS; };
  const scrollProps = {
    ref: scrollRef,
    scrollEventThrottle: 32,
    onLayout: (e: LayoutChangeEvent) => { view.current.height = e.nativeEvent.layout.height; },
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => { view.current.offset = e.nativeEvent.contentOffset.y; },
    onScrollBeginDrag: () => { touching.current = true; userMoved.current = true; handsOff(); },
    onScrollEndDrag: () => { touching.current = false; handsOff(); },
    // Fires after a flick settles (and after our own glides; those don't count as the person scrolling).
    onMomentumScrollEnd: () => { if (userMoved.current) handsOff(); userMoved.current = false; },
  };

  return { scrollProps, onBlockLayout };
}
