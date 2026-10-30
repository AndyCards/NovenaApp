import { Pressable, Text } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { DayState } from '@/utils/dayRules';

export function DayChip({ day, state, onPress }: { day: number; state: DayState; onPress?: () => void }) {
  const prayed = state === 'prayed';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Day ${day}, ${state}`} onPress={onPress} hitSlop={4}
      style={{ minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full,
        backgroundColor: prayed ? colors.action.selected : state === 'today' ? colors.surface.strong : colors.surface.subtle }}>
      <Text style={[type.labelMedium, { color: prayed ? colors.text.onAction : colors.text.secondary }]}>{day}</Text>
    </Pressable>
  );
}
