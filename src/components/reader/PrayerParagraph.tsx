// Reader screens only: Source Serif 4, 17/24, never smaller.
// While the prayer is read aloud, the paragraph being spoken is set in Source Serif 4 SemiBold (Andy's Reader
// design); everything before and after it stays Regular. The change is softened with a short fade (200ms,
// skipped with Reduce Motion). VoiceOver also announces "Now being read aloud" on that paragraph, so the
// highlight never depends on seeing the heavier type.
import { memo, useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { fonts, type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { duration, ease } from '@/motion/tokens';

type Props = { text: string; active?: boolean; onLayout?: (e: LayoutChangeEvent) => void };

// memo: during playback only the two paragraphs whose highlight changes are re-drawn.
export const PrayerParagraph = memo(function PrayerParagraph({ text, active = false, onLayout }: Props) {
  const opacity = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    opacity.value = 0.7;
    opacity.value = withTiming(1, { duration: duration.fade, easing: ease.out, reduceMotion: ReduceMotion.System });
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps
  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.Text
      selectable
      onLayout={onLayout}
      accessibilityValue={active ? { text: strings.reader.nowReading } : undefined}
      style={[type.readerProse, { color: colors.text.primary }, active && { fontFamily: fonts.readerSemibold }, fade]}>
      {text}
    </Animated.Text>
  );
});
