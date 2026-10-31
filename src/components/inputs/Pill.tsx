// Figma "Pill": small grey tag with a hairline border.
import { Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';

export function Pill({ label }: { label: string; size?: 'small' | 'medium' | 'large' }) {
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full, borderWidth: stroke.hairline, borderColor: colors.border.strong, backgroundColor: colors.surface.subtle, alignSelf: 'flex-start' }}>
      <Text style={[type.bodySmall, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}
