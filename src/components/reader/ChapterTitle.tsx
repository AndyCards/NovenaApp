import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

export function ChapterTitle({ title, meta }: { title: string; meta?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[type.titleMedium, { color: colors.text.primary }]}>{title}</Text>
      {meta ? <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{meta}</Text> : null}
    </View>
  );
}
