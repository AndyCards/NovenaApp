import { Pressable, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

export function WeekdayToggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} hitSlop={4}
      style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.action.selected : colors.surface.subtle }}>
      <Text style={[type.labelMedium, { color: on ? colors.text.onAction : colors.text.secondary }]}>{label.slice(0, 1)}</Text>
    </Pressable>
  );
}
