import { Pressable, Text } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';

export function RecentChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Search ${label}`} onPress={onPress}
      style={{ minHeight: 36, justifyContent: 'center', paddingHorizontal: space[12], borderRadius: radius.full, backgroundColor: colors.surface.subtle }}>
      <Text style={[type.labelChip, { color: colors.text.secondary }]}>{label}</Text>
    </Pressable>
  );
}
