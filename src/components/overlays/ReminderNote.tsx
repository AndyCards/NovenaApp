// A small grey note box, for example "Reminders are off. Turn on notifications in Settings".
import { Text, View } from 'react-native';
import { colors, radius, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';

export function ReminderNote({ text }: { text: string }) {
  return (
    <View style={{ marginHorizontal: screenMargin, paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{text}</Text>
    </View>
  );
}
