// One day's prayer. The intention moment is the Figma "Intention Card"; silence is a quiet gap.
// `active` is the sentence being read aloud (paragraph + character range; block -1 = none), see useNarrationHighlight. `onBlockLayout` tells the
// Reader where each paragraph sits, so it can gently scroll the one being read into view (useFollowAlong).
import { Fragment, memo, useMemo } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { DayBlock } from '@/content/types';
import { Icon } from '../Icon';
import type { ActiveSpan } from '@/hooks/useNarrationHighlight';
import { PrayerParagraph } from './PrayerParagraph';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

// The "View Intention" card inside the prayer. Refined 2026-11-02 (Andy: "improve the aesthetics subtly"):
// a lighter hairline and a whisper of shadow instead of a grey outline, a calm solid icon circle, the subtitle on one line,
// a smaller, lighter chevron, and a gentle shrink when pressed.
export function IntentionPrompt({ onPress }: { onPress: () => void }) {
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${strings.reader.viewIntention}. ${strings.reader.intentionPrompt}`} onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 14, paddingVertical: 12,
        borderRadius: radius.m, borderWidth: 0.5, borderColor: colors.border.default, backgroundColor: colors.surface.default,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
      {/* Icon circle: soft grey, no outline. */}
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface.raised, borderWidth: 0.5, borderColor: colors.border.subtle, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="handsPraying" size={20} color={colors.icon.default} />
      </View>
      {/* Title and one-line subtitle. */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type.labelMedium, { color: colors.text.primary }]}>{strings.reader.viewIntention}</Text>
        <Text numberOfLines={1} style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.reader.intentionPrompt}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={colors.text.muted} />
    </PressableScale>
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
  const listening = (active?.block ?? -1) >= 0; // something is being read: soften the rest
  return (
    <>
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {b.type === 'intention' ? <IntentionPrompt onPress={onViewIntention} />
            : b.type === 'silence' ? null // a pause is for the narration only; drawing it would add a second gap (Figma: 24 between every paragraph)
            : <PrayerParagraph text={b.text} onLayout={layoutHandlers[i]} listening={listening}
                highlightFrom={active?.block === i ? active.from : undefined} highlightTo={active?.block === i ? active.to : undefined} />}
        </Fragment>
      ))}
    </>
  );
});
