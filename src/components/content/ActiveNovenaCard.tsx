// Figma "Active Novena Card": art 104×130, "DAY 4 OF 9" eyebrow + menu, title, Pray button.
// Once today's day is prayed the button turns light with a check and names tomorrow's day.
import { Pressable, Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; day: number; prayedToday?: boolean; paused?: boolean; onOpen: () => void; onPray: () => void; onMenu: () => void };

export function ActiveNovenaCard({ novena, day, prayedToday, paused, onOpen, onPray, onMenu }: Props) {
  const nextDay = prayedToday ? Math.min(day + 1, novena.days.length) : day;
  const done = prayedToday;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}, day ${day} of 9${paused ? ', paused' : ''}`} onPress={onOpen}
      style={{ padding: 10, flexDirection: 'row', gap: 12, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 104, height: 130, borderRadius: radius.s }} />
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[type.labelEyebrowCaps, { color: colors.icon.secondary, letterSpacing: 1.2 }]}>{paused ? 'Paused' : strings.library.dayOf(day)}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="More options" onPress={onMenu} hitSlop={12}>
              <Icon name="more" size={22} />
            </Pressable>
          </View>
          <Text numberOfLines={2} style={[type.titleMedium, { color: colors.text.secondary, paddingRight: 33 }]}>{novena.title}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={strings.novena.prayDay(nextDay)} onPress={onPray}
          style={({ pressed }) => ({ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 18, paddingVertical: 13, borderRadius: radius.l,
            backgroundColor: done ? '#F2F2F2' : colors.action.primary, opacity: pressed ? 0.85 : 1 })}>
          <Text style={[type.labelSmall, { color: done ? colors.text.secondary : colors.text.onAction }]}>{strings.novena.prayDay(nextDay)}</Text>
          <Icon name={done ? 'check' : 'handsPraying'} size={18} color={done ? colors.text.secondary : colors.text.onAction} />
        </Pressable>
      </View>
    </Pressable>
  );
}
