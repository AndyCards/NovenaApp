// Reader screens only: Source Serif 4, 17/24, never smaller.
// Follow-along look, while the prayer is read aloud:
// - The sentence being spoken keeps the full dark text colour and gets a soft sand marker behind it
//   (colors.surface.reading), like a gentle highlighter in a prayer book.
// - Everything else softens to a lighter grey (Text/Tertiary, still easy to read: 5:1 contrast), so the eye
//   rests on the line being read. The softening fades in and out slowly (320ms; instant with Reduce Motion).
// - The type itself never changes, so lines don't re-wrap or jump while the highlight moves.
// - VoiceOver hears "Now being read aloud" on that paragraph, so the highlight never depends on colour.
// When the audio finishes or is closed, all text returns to its normal dark colour.
import { memo, useEffect } from 'react';
import { Text, type LayoutChangeEvent } from 'react-native';
import Animated, { interpolateColor, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { ease } from '@/motion/tokens';

type Props = {
  text: string;
  // The part being read aloud, as character positions [from, to). Leave out for no highlight.
  highlightFrom?: number;
  highlightTo?: number;
  // True while the prayer is being read aloud (or paused part-way): the text not being read softens.
  listening?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
};

const SOFTEN = { duration: 320, easing: ease.inOut, reduceMotion: ReduceMotion.System };

// memo: during playback only the paragraphs whose highlight changes are re-drawn.
export const PrayerParagraph = memo(function PrayerParagraph({ text, highlightFrom, highlightTo, listening = false, onLayout }: Props) {
  const active = highlightFrom !== undefined && highlightTo !== undefined && highlightTo > highlightFrom;
  const from = active ? Math.max(0, highlightFrom) : 0;
  const to = active ? Math.min(text.length, highlightTo) : 0;

  // 0 = normal dark text, 1 = softened grey.
  const soft = useSharedValue(listening ? 1 : 0);
  useEffect(() => { soft.value = withTiming(listening ? 1 : 0, SOFTEN); }, [listening]); // eslint-disable-line react-hooks/exhaustive-deps
  const tone = useAnimatedStyle(() => ({ color: interpolateColor(soft.value, [0, 1], [colors.text.primary, colors.text.tertiary]) }));

  return (
    <Animated.Text
      selectable
      onLayout={onLayout}
      accessibilityValue={active ? { text: strings.reader.nowReading } : undefined}
      style={[type.readerProse, tone]}>
      {active ? (
        <>
          {text.slice(0, from)}
          {/* Nested text: the marker follows the words line by line, like a highlighter pen. */}
          <Text style={{ color: colors.text.primary, backgroundColor: colors.surface.reading }}>{text.slice(from, to)}</Text>
          {text.slice(to)}
        </>
      ) : text}
    </Animated.Text>
  );
});
