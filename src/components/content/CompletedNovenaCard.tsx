// Figma "Completed Novena Card": art 60×70, title, dates, Done badge; divider; "Pray it again".
import { Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { NovenaImage } from './NovenaImage';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { novena: Novena; prayedRange: string; compact?: boolean; onOpen: () => void; onPrayAgain: () => void };

export function CompletedNovenaCard({ novena, prayedRange, onOpen, onPrayAgain }: Props) {
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${novena.title}. ${strings.library.prayedRange(prayedRange)}`} onPress={onOpen}
      style={{ padding: 10, gap: 10, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <NovenaImage image={novena.image} label={novena.title} style={{ width: 60, height: 70, borderRadius: radius.s }} />
        <View style={{ flex: 1, gap: 6 }}>
          <Text numberOfLines={1} style={[type.titleMedium, { color: colors.text.secondary }]}>{novena.title}</Text>
          <Text style={[type.bodyMedium, { color: colors.text.secondary }]}>{strings.library.prayedRange(prayedRange)}</Text>
        </View>
        <View accessibilityLabel="Completed" style={{ width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
          <Icon name="check" size={16} />
        </View>
      </View>
      <View style={{ height: stroke.hairline, backgroundColor: colors.border.subtle }} />
      <PressableScale scaleTo={pressScale.button} accessibilityRole="button" onPress={onPrayAgain}
        style={({ pressed }) => ({ height: 34, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: pressed ? colors.surface.strong : '#F2F2F2', borderWidth: 0.2, borderColor: colors.border.strong })}>
        <Text style={[type.labelSmall, { color: colors.text.body }]}>{strings.alerts.prayAgain}</Text>
      </PressableScale>
    </PressableScale>
  );
}
