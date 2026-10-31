// One day's prayer. The intention moment is the Figma "Intention Card"; silence is a quiet gap.
import { LinearGradient } from 'expo-linear-gradient';
import { Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { DayBlock } from '@/content/types';
import { Icon } from '../Icon';
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

export function PrayerPassage({ blocks, onViewIntention }: { blocks: DayBlock[]; onViewIntention: () => void }) {
  return (
    <>
      {blocks.map((b, i) => (
        <Fragment key={i}>
          {b.type === 'intention' ? <IntentionPrompt onPress={onViewIntention} />
            : b.type === 'silence' ? <View accessibilityLabel="A moment of silence" style={{ height: 24 }} />
            : <PrayerParagraph text={b.text} />}
        </Fragment>
      ))}
    </>
  );
}
