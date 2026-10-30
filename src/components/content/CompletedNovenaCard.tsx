import { Pressable, Text, View } from 'react-native';
import { colors, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Button } from '../actions/Button';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; prayedRange: string; compact?: boolean; onOpen: () => void; onPrayAgain: () => void };

export function CompletedNovenaCard({ novena, prayedRange, compact, onOpen, onPrayAgain }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}. ${strings.library.prayedRange(prayedRange)}`} onPress={onOpen}
      style={{ marginHorizontal: screenMargin, padding: space[12], flexDirection: 'row', gap: space[12], alignItems: 'center', borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: compact ? 48 : 72, height: compact ? 48 : 72, borderRadius: radius.s }} />
      <View style={{ flex: 1, gap: space[4] }}>
        <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{novena.title}</Text>
        <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.library.prayedRange(prayedRange)}</Text>
      </View>
      <Button size="small" variant="secondary" label={strings.alerts.prayAgain} onPress={onPrayAgain} />
    </Pressable>
  );
}
