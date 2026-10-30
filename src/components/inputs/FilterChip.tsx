import { Pressable, Text } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';

export function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 36, justifyContent: 'center', paddingHorizontal: space[14], borderRadius: radius.full,
        backgroundColor: selected ? colors.action.selected : pressed ? colors.surface.strong : colors.surface.subtle,
      })}>
      <Text style={[type.labelChip, { color: selected ? colors.text.onAction : colors.text.secondary }]}>{label}</Text>
    </Pressable>
  );
}
