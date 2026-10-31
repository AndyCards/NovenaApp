// Figma "Novena Card": portrait picture with title and tagline underneath.
import { Pressable, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { NovenaImage } from './NovenaImage';

export function NovenaCard({ novena, onPress, width = 126 }: { novena: Novena; onPress: () => void; width?: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress} style={{ width, gap: 6 }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width, height: 160, borderRadius: radius.xs }} />
      <View style={{ gap: 2 }}>
        <Text style={[type.titleMedium, { color: colors.text.tertiary }]}>{novena.title}</Text>
        <Text numberOfLines={3} style={[type.bodyMedium, { color: colors.text.secondary }]}>{novena.tagline}</Text>
      </View>
    </Pressable>
  );
}
