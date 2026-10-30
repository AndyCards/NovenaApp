// One day in the Novena page's days list: prayed, today, missed or upcoming.
import { Pressable, Text, View } from 'react-native';
import { colors, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { DayState } from '@/utils/dayRules';
import { DayMarker } from './DayMarker';

type Props = { day: number; title: string; meta?: string; state: DayState; viewing?: boolean; onPress: () => void };

export function NovenaDayRow({ day, title, meta, state, viewing, onPress }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Day ${day}. ${title}. ${state}`} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space[12], paddingHorizontal: screenMargin, backgroundColor: pressed || viewing ? colors.surface.subtle : 'transparent' })}>
      <DayMarker state={state} />
      <View style={{ flex: 1 }}>
        <Text style={[type.titleSmall, { color: state === 'upcoming' ? colors.text.secondary : colors.text.primary }]}>{title}</Text>
        {meta ? <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{meta}</Text> : null}
      </View>
    </Pressable>
  );
}
