import { Text, View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';

const sizes = { small: { h: 22, t: type.labelXSmall }, medium: { h: 28, t: type.labelCaption }, large: { h: 36, t: type.labelChip } } as const;

export function Pill({ label, size = 'medium' }: { label: string; size?: keyof typeof sizes }) {
  const s = sizes[size];
  return (
    <View style={{ height: s.h, justifyContent: 'center', paddingHorizontal: space[10], borderRadius: radius.full, backgroundColor: colors.surface.subtle, alignSelf: 'flex-start' }}>
      <Text style={[s.t, { color: colors.text.secondary }]}>{label}</Text>
    </View>
  );
}
