// Reader screens only: Source Serif 4, 17/24, never smaller.
// While the prayer is read aloud, the sentence being spoken gets a soft warm-paper marker behind it
// (colors.surface.reading), like following along in a prayer book. The type itself never changes, so lines
// don't re-wrap or jump while the highlight moves. VoiceOver also hears "Now being read aloud" on that
// paragraph, so the highlight never depends on seeing the colour.
import { memo } from 'react';
import { Text, type LayoutChangeEvent } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';

type Props = {
  text: string;
  // The part being read aloud, as character positions [from, to). Leave out for no highlight.
  highlightFrom?: number;
  highlightTo?: number;
  onLayout?: (e: LayoutChangeEvent) => void;
};

// memo: during playback only the paragraph whose highlight changes is re-drawn.
export const PrayerParagraph = memo(function PrayerParagraph({ text, highlightFrom, highlightTo, onLayout }: Props) {
  const active = highlightFrom !== undefined && highlightTo !== undefined && highlightTo > highlightFrom;
  const from = active ? Math.max(0, highlightFrom) : 0;
  const to = active ? Math.min(text.length, highlightTo) : 0;
  return (
    <Text
      selectable
      onLayout={onLayout}
      accessibilityValue={active ? { text: strings.reader.nowReading } : undefined}
      style={[type.readerProse, { color: colors.text.primary }]}>
      {active ? (
        <>
          {text.slice(0, from)}
          {/* Nested text: the marker follows the words line by line, like a highlighter pen. */}
          <Text style={{ backgroundColor: colors.surface.reading }}>{text.slice(from, to)}</Text>
          {text.slice(to)}
        </>
      ) : text}
    </Text>
  );
});
