import { Text, View } from 'react-native';
import { colors, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';

export function ReminderNote({ text }: { text: string }) {
  return (
    <View style={{ marginHorizontal: screenMargin, padding: space[12], borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{text}</Text>
    </View>
  );
}
