// Figma "Filter Chip": outlined pill; selected = solid dark grey with white text.
import { Pressable, Text } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';

export function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({
        height: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.full,
        borderWidth: selected ? 0 : stroke.hairline * 2, borderColor: colors.border.default,
        backgroundColor: selected ? colors.action.primary : pressed ? colors.surface.subtle : colors.surface.default,
      })}>
      <Text style={[type.labelChip, { color: selected ? colors.text.onAction : colors.text.body }]}>{label}</Text>
    </Pressable>
  );
}
