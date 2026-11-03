// Figma "Active Novena Card": art 104×130, "DAY 4 OF 9" eyebrow + menu, title, Pray button.
// Pray button (Figma 1526:30535): light Action/Secondary pill, 130 x 35, 0.2 strong border, 15 body text + 18 icon, 10 apart.
// Once today's day is prayed the icon becomes a check and the button names tomorrow's day.
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { NovenaImage } from './NovenaImage';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';
import { haptics } from '@/motion/haptics';

type Props = { novena: Novena; day: number; prayedToday?: boolean; paused?: boolean; onOpen: () => void; onPray: () => void; onMenu: (anchorBottom: number) => void };

export function ActiveNovenaCard({ novena, day, prayedToday, paused, onOpen, onPray, onMenu }: Props) {
  const dots = useRef<{ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null>(null); // lets us find where the "..." button is, so the menu can pop up right under it
  const nextDay = prayedToday ? Math.min(day + 1, novena.days.length) : day;
  const done = prayedToday;
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${novena.title}, day ${day} of 9${paused ? ', paused' : ''}`} onPress={onOpen}
      style={{ padding: 10, flexDirection: 'row', gap: 12, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 104, height: 130, borderRadius: radius.s }} />
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[type.labelEyebrowCaps, { color: colors.icon.secondary, letterSpacing: 1.2 }]}>{paused ? 'Paused' : strings.library.dayOf(day)}</Text>
            <View ref={(r) => { dots.current = r; }} collapsable={false}>
              <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel="More options" hitSlop={12}
                onPress={() => dots.current?.measureInWindow((_x, y, _w, h) => onMenu(y + h))}>
                <Icon name="more" size={22} />
              </PressableScale>
            </View>
          </View>
          <Text numberOfLines={2} style={[type.titleMedium, { color: colors.text.secondary, paddingRight: 33 }]}>{novena.title}</Text>
        </View>
        <PressableScale dimTo={0.92} accessibilityRole="button" accessibilityLabel={strings.novena.prayDay(nextDay)} onPress={() => { haptics.confirm(); onPray(); }}
          style={{ width: 130, height: 35, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 6, paddingVertical: 6, borderRadius: 25,
            backgroundColor: '#F2F2F2', borderWidth: 0.2, borderColor: colors.border.strong }}>
          <Text style={[type.bodyCard, { color: colors.text.body }]}>{strings.novena.prayDay(nextDay)}</Text>
          <Icon name={done ? 'check' : 'handsPraying'} size={18} color={colors.text.body} />
        </PressableScale>
      </View>
    </PressableScale>
  );
}
