// One day's prayer. The intention moment is the Figma "Intention Card"; silence is a quiet gap.
// `active` is the sentence being read aloud (paragraph + character range; block -1 = none), see useNarrationHighlight. `onBlockLayout` tells the
// Reader where each paragraph sits, so it can gently scroll the one being read into view (useFollowAlong).
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment, memo, useMemo } from 'react';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
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

// The "View Intention" card inside the prayer. Refined 2026-11-02 (Andy: "improve the aesthetics subtly", then "cute subtle polishes"):
// - a soft hairline and a whisper of shadow instead of a grey outline
// - the praying hands sit in a softly lit circle (white at the top, pale grey at the bottom)
// - when an intention is written, the card shows it as the subtitle, in quotes, so the person sees their own words
// - on tap the card shrinks gently and the praying hands lift and tilt a little, then settle back
export function IntentionPrompt({ onPress, intention }: { onPress: () => void; intention?: string }) {
  const reduced = useReducedMotion();
  const lift = useSharedValue(0); // 0 = resting, 1 = finger down
  const hands = useAnimatedStyle(() => ({
    transform: reduced ? [] : [{ translateY: -1.5 * lift.value }, { rotate: `${-8 * lift.value}deg` }, { scale: 1 + 0.08 * lift.value }],
  }));
  const written = intention?.trim();
  const subtitle = written ? `\u201C${written}\u201D` : strings.reader.intentionPrompt;
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${strings.reader.viewIntention}. ${subtitle}`} onPress={onPress}
      onPressIn={() => { lift.value = withTiming(1, { duration: 180 }); }}
      onPressOut={() => { lift.value = withSpring(0, { damping: 12, stiffness: 180 }); }}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12, paddingRight: 14, paddingVertical: 12,
        borderRadius: radius.m, borderWidth: 0.5, borderColor: colors.border.default, backgroundColor: colors.surface.default,
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
      {/* Icon circle: softly lit from above, with a faint edge. */}
      <LinearGradient colors={['#FFFFFF', '#F3F3F3']} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 0.5, borderColor: colors.border.subtle, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={hands}><Icon name="handsPraying" size={20} color={colors.icon.default} /></Animated.View>
      </LinearGradient>
      {/* Title, then a one-line subtitle: the person's own intention once written, otherwise a gentle prompt. */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type.labelMedium, { color: colors.text.primary }]}>{strings.reader.viewIntention}</Text>
        <Text numberOfLines={2} style={[type.bodyMedium, { color: written ? colors.text.body : colors.text.tertiary }]}>{subtitle}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={colors.text.muted} />
    </PressableScale>
  );
}

type PassageProps = {
  blocks: DayBlock[];
  onViewIntention?: () => void; // left out in preview mode: nothing can be saved there, so the intention card isn't shown
  intention?: string; // what the person wrote, shown on the intention card
  active?: ActiveSpan;
  onBlockLayout?: (index: number, e: LayoutChangeEvent) => void;
};

// memo: the passage only re-draws when the sentence being read changes, not on every audio tick.
export const PrayerPassage = memo(function PrayerPassage({ blocks, onViewIntention, intention, active, onBlockLayout }: PassageProps) {
  // One unchanging layout handler per paragraph, so the paragraphs themselves don't re-draw needlessly.
  const layoutHandlers = useMemo(() => blocks.map((_, i) => (e: LayoutChangeEvent) => onBlockLayout?.(i, e)), [blocks, onBlockLayout]);
  const listening = (active?.block ?? -1) >= 0; // something is being read: soften the rest
  return (
    <>
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {b.type === 'intention' ? (onViewIntention ? <IntentionPrompt onPress={onViewIntention} intention={intention} /> : null)
            : b.type === 'silence' ? null // a pause is for the narration only; drawing it would add a second gap (Figma: 24 between every paragraph)
            : <PrayerParagraph text={b.text} onLayout={layoutHandlers[i]} listening={listening}
                highlightFrom={active?.block === i ? active.from : undefined} highlightTo={active?.block === i ? active.to : undefined} />}
        </Fragment>
      ))}
    </>
  );
});
