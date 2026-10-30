import { Pressable, Text } from 'react-native';
import { colors, elevation, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';

export function IntentionTile({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      style={[{ minHeight: 72, minWidth: 140, justifyContent: 'center', paddingHorizontal: space[16], borderRadius: radius.m, backgroundColor: colors.surface.default }, elevation.card]}>
      <Text style={[type.titleSmall, { color: colors.text.primary }]}>{label}</Text>
    </Pressable>
  );
}
