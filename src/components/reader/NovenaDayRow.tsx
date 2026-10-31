// Figma "Day" row on the Novena page: marker, "Day N · title", time, caret.
import { Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { DayState } from '@/utils/dayRules';
import { Icon } from '../Icon';
import { DayMarker } from './DayMarker';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { day: number; title: string; meta?: string; state: DayState; viewing?: boolean; onPress: () => void };

export function NovenaDayRow({ day, title, meta, state, viewing, onPress }: Props) {
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`Day ${day}. ${title}. ${state}`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12,
        borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default,
        backgroundColor: pressed || viewing ? colors.surface.subtle : colors.surface.default })}>
      <DayMarker state={state} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={1} style={[type.titleMedium, { color: colors.text.body }]}>{`Day ${day} · ${title}`}</Text>
        {meta ? <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{meta}</Text> : null}
      </View>
      <Icon name="chevronRight" size={18} color={colors.icon.secondary} />
    </PressableScale>
  );
}
