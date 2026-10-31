// Figma "Novena Card": portrait picture with title and tagline underneath.
import { Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { NovenaImage } from './NovenaImage';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

export function NovenaCard({ novena, onPress, width = 126 }: { novena: Novena; onPress: () => void; width?: number }) {
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress} style={{ width, gap: 6 }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width, height: 160, borderRadius: radius.xs }} />
      <View style={{ gap: 2 }}>
        <Text style={[type.titleMedium, { color: colors.text.secondary }]}>{novena.title}</Text>
        <Text numberOfLines={3} style={[type.bodyMedium, { color: colors.text.secondary }]}>{novena.tagline}</Text>
      </View>
    </PressableScale>
  );
}
