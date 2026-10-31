// Figma "Novena Row": tall picture, title, description and up to two tags.
import { Pressable, Text, View } from 'react-native';
import { colors, radius, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { Pill } from '../inputs/Pill';
import { NovenaImage } from './NovenaImage';

export function NovenaRow({ novena, onPress }: { novena: Novena; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'stretch', gap: 12, paddingHorizontal: screenMargin, paddingVertical: 4, backgroundColor: pressed ? colors.surface.subtle : colors.surface.default })}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 96, height: 114, borderRadius: radius.xs }} />
      <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 4 }}>
        <View style={{ gap: 2 }}>
          <Text style={[type.titleMedium, { color: colors.text.secondary }]}>{novena.title}</Text>
          <Text numberOfLines={3} style={[type.bodyMedium, { color: colors.text.secondary }]}>{novena.tagline}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {novena.tags.slice(0, 2).map((t) => <Pill key={t} label={t} />)}
        </View>
      </View>
    </Pressable>
  );
}
