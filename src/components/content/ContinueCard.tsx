// Figma "Continue Card" (985:35289): art on the left, day eyebrow, title, Pray Day N.
import { Pressable, Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { PrayButton } from '../actions/PrayButton';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; day: number; missed?: number; width?: number; onContinue: () => void; onOpen: () => void };

export function ContinueCard({ novena, day, missed = 0, width = 340, onContinue, onOpen }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}, day ${day} of 9`} onPress={onOpen}
      style={{ width, height: 150, flexDirection: 'row', padding: 9.6, gap: 12, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 104, height: 130, borderRadius: radius.s }} />
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 10, paddingBottom: 6 }}>
        <View style={{ gap: 2 }}>
          <Text style={[type.labelEyebrow, { color: colors.icon.secondary, letterSpacing: 1.2, textTransform: 'uppercase' }]}>{`Day ${day} of 9`}</Text>
          <Text numberOfLines={2} style={[type.titleMedium, { color: colors.text.secondary }]}>{novena.title}</Text>
        </View>
        <PrayButton label={missed > 0 ? strings.novena.continueDay(day) : strings.novena.prayDay(day)} onPress={onContinue} />
      </View>
    </Pressable>
  );
}
