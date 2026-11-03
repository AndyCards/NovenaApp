// Figma "Featured Novena Card" (1217:11437): full-bleed art, dark scrim, white text, glass Start Novena button.
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { colors, elevation, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { NovenaImage } from './NovenaImage';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { novena: Novena; width: number; onPress: () => void; onStart: () => void };

export function FeaturedNovenaCard({ novena, width, onPress, onStart }: Props) {
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${novena.title}. ${novena.tagline}`} onPress={onPress}
      style={[{ width, height: 327, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end', borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }, elevation.card]}>
      <NovenaImage image={novena.image} size="full" label={novena.title} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <LinearGradient colors={colors.gradient.imageScrim} locations={[0, 0.3, 0.6, 0.85, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 260 }} />
      <View style={{ paddingHorizontal: 18, paddingBottom: 18, gap: 2 }}>
        <Text style={[type.headingH2, { color: colors.text.onAction, textTransform: 'capitalize' }]}>{novena.title}</Text>
        <Text style={[type.bodyMedium, { color: 'rgba(255,255,255,0.85)' }]}>{`${novena.tagline} · ${novena.minutesPerDay} Mins`}</Text>
        <View style={{ height: 12 }} />
        <PressableScale dimTo={0.92} accessibilityRole="button" accessibilityLabel={`Start ${novena.title}`} onPress={onStart} style={{ borderRadius: radius.full, overflow: 'hidden' }}>
          <BlurView intensity={20} tint="light" style={{ height: 48, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.45)', backgroundColor: 'rgba(255,255,255,0.22)' }}>
            <Text style={[type.labelLarge, { color: colors.text.onAction }]}>Start Novena</Text>
            <Icon name="handsPraying" size={20} color={colors.text.onAction} />
          </BlurView>
        </PressableScale>
      </View>
    </PressableScale>
  );
}
