import { Pressable, Text, View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { Pill } from '../inputs/Pill';
import { DurationLabel } from './DurationLabel';
import { NovenaImage } from './NovenaImage';

export function FeaturedNovenaCard({ novena, onPress, width }: { novena: Novena; onPress: () => void; width: number }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress}
      style={{ width, borderRadius: radius.m, overflow: 'hidden', backgroundColor: colors.surface.raised }}>
      <NovenaImage image={novena.image} size="full" label={novena.title} style={{ width, height: width * 0.7 }} />
      <View style={{ padding: space[12], gap: space[4] }}>
        <Text style={[type.titleCard, { color: colors.text.primary }]}>{novena.title}</Text>
        <Text style={[type.bodyLarge, { color: colors.text.tertiary }]}>{novena.tagline}</Text>
        <View style={{ flexDirection: 'row', gap: space[8], alignItems: 'center' }}>
          <DurationLabel minutes={novena.minutesPerDay} />
          {novena.tags[0] ? <Pill label={novena.tags[0]} size="small" /> : null}
        </View>
      </View>
    </Pressable>
  );
}
