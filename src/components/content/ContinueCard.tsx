// Figma "Continue Card" (985:35289): 10 padding (14 on the right), 104x130 art, 12 gap,
// text column 10 from the top and 6 from the bottom: day eyebrow, 2 gap, title; Pray Day N at the bottom.
// The "…" button floats in the top-right corner so it doesn't push the title down.
import { useRef } from 'react';
import { Text, View } from 'react-native';
import { colors, elevation, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Icon } from '../Icon';
import { PrayButton } from '../actions/PrayButton';
import { NovenaImage } from './NovenaImage';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { novena: Novena; day: number; missed?: number; width?: number; onContinue: () => void; onOpen: () => void; onMenu?: (anchorBottom: number) => void };

export function ContinueCard({ novena, day, missed = 0, width = 340, onContinue, onOpen, onMenu }: Props) {
  const dots = useRef<{ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null>(null); // finds the "…" button so the menu opens right under it
  return (
    <PressableScale scaleTo={pressScale.card} accessibilityRole="button" accessibilityLabel={`${novena.title}, day ${day} of 9`} onPress={onOpen}
      style={{ width, height: 150, flexDirection: 'row', padding: 10, paddingRight: 14, gap: 12, borderRadius: radius.m, borderWidth: stroke.hairline, borderColor: colors.border.default, backgroundColor: colors.surface.default, ...elevation.card }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 104, height: 130, borderRadius: radius.s }} />
      <View style={{ flex: 1, justifyContent: 'space-between', paddingTop: 10, paddingBottom: 6 }}>
        <View style={{ gap: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[type.labelEyebrow, { color: colors.icon.secondary, letterSpacing: 1.2, textTransform: 'uppercase' }]}>{`Day ${day} of 9`}</Text>
            {onMenu ? (
              <View ref={(r) => { dots.current = r; }} collapsable={false} style={{ position: 'absolute', right: 0, top: -5 }}>
                <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel="More options" hitSlop={12}
                  onPress={() => dots.current?.measureInWindow((_x, y, _w, h) => onMenu(y + h))}>
                  <Icon name="more" size={22} />
                </PressableScale>
              </View>
            ) : null}
          </View>
          <Text numberOfLines={2} style={[type.titleMedium, { color: colors.text.secondary, paddingRight: onMenu ? 26 : 0 }]}>{novena.title}</Text>
        </View>
        <PrayButton label={missed > 0 ? strings.novena.continueDay(day) : strings.novena.prayDay(day)} onPress={onContinue} />
      </View>
    </PressableScale>
  );
}
