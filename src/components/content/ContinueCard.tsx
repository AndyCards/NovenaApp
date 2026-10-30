import { Pressable, Text, View } from 'react-native';
import { colors, elevation, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Button } from '../actions/Button';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; day: number; missed?: number; onContinue: () => void; onOpen: () => void };

export function ContinueCard({ novena, day, missed = 0, onContinue, onOpen }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}, day ${day} of 9`} onPress={onOpen}
      style={[{ marginHorizontal: screenMargin, borderRadius: radius.m, backgroundColor: colors.surface.raised, overflow: 'hidden' }, elevation.card]}>
      <NovenaImage image={novena.image} size="full" label={novena.title} style={{ width: '100%', height: 140 }} />
      <View style={{ padding: space[12], gap: space[8] }}>
        <Text style={[type.labelEyebrowCaps, { color: colors.text.tertiary }]}>{`Day ${day} of 9`}</Text>
        <Text style={[type.titleCard, { color: colors.text.primary }]}>{novena.title}</Text>
        {missed > 0 ? <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{strings.alerts.missedTitle(missed)}</Text> : null}
        <Button label={missed > 0 ? strings.novena.continueDay(day) : strings.novena.prayDay(day)} onPress={onContinue} />
      </View>
    </Pressable>
  );
}
