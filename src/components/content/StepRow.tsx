import { Text, View } from 'react-native';
import { colors, space } from '@/constants/theme';
import { type } from '@/constants/typography';

export function StepRow({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: space[12] }}>
      <Text style={[type.titleSmall, { width: 84, color: colors.text.primary }]}>{title}</Text>
      <Text style={[type.bodyLarge, { flex: 1, color: colors.text.tertiary }]}>{body}</Text>
    </View>
  );
}
