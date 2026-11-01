// One day's prayer. The intention moment is the Figma "Intention Card"; silence is a quiet gap.
// `active` is the sentence being read aloud (paragraph + character range; block -1 = none), see useNarrationHighlight. `onBlockLayout` tells the
// Reader where each paragraph sits, so it can gently scroll the one being read into view (useFollowAlong).
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, memo, useMemo } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { DayBlock } from '@/content/types';
import { Icon } from '../Icon';
import type { ActiveSpan } from '@/hooks/useNarrationHighlight';
import { PrayerParagraph } from './PrayerParagraph';

export function IntentionPrompt({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${strings.reader.viewIntention}. ${strings.reader.intentionPrompt}`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, minHeight: 79,
        borderRadius: radius.m, borderWidth: 0.6, borderColor: colors.border.default, backgroundColor: pressed ? colors.surface.subtle : colors.surface.default })}>
      <LinearGradient colors={['#EFEFEF', '#FBFBFB']} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 0.5, borderColor: colors.border.subtle, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="handsPraying" size={20} />
      </LinearGradient>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[type.labelSmall, { color: colors.text.body }]}>{strings.reader.viewIntention}</Text>
        <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.reader.intentionPrompt}</Text>
      </View>
      <Icon name="chevronRight" size={20} color={colors.icon.secondary} />
    </Pressable>
  );
}

type PassageProps = {
  blocks: DayBlock[];
  onViewIntention: () => void;
  active?: ActiveSpan;
  onBlockLayout?: (index: number, e: LayoutChangeEvent) => void;
};

// memo: the passage only re-draws when the sentence being read changes, not on every audio tick.
export const PrayerPassage = memo(function PrayerPassage({ blocks, onViewIntention, active, onBlockLayout }: PassageProps) {
  // One unchanging layout handler per paragraph, so the paragraphs themselves don't re-draw needlessly.
  const layoutHandlers = useMemo(() => blocks.map((_, i) => (e: LayoutChangeEvent) => onBlockLayout?.(i, e)), [blocks, onBlockLayout]);
  return (
    <>
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {b.type === 'intention' ? <IntentionPrompt onPress={onViewIntention} />
            : b.type === 'silence' ? null // a pause is for the narration only; drawing it would add a second gap (Figma: 24 between every paragraph)
            : <PrayerParagraph text={b.text} onLayout={layoutHandlers[i]}
                highlightFrom={active?.block === i ? active.from : undefined} highlightTo={active?.block === i ? active.to : undefined} />}
        </Fragment>
      ))}
    </>
  );
});
