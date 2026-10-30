import { Pressable, Text, View } from 'react-native';
import { colors, radius, screenMargin, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import type { Novena } from '@/content/types';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { NovenaImage } from './NovenaImage';

type Props = { novena: Novena; day: number; paused?: boolean; onOpen: () => void; onPray: () => void; onMenu: () => void };

export function ActiveNovenaCard({ novena, day, paused, onOpen, onPray, onMenu }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${novena.title}, day ${day} of 9${paused ? ', paused' : ''}`} onPress={onOpen}
      style={{ marginHorizontal: screenMargin, padding: space[12], flexDirection: 'row', gap: space[12], borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <NovenaImage image={novena.image} label={novena.title} style={{ width: 72, height: 72, borderRadius: radius.s }} />
      <View style={{ flex: 1, gap: space[4] }}>
        <Text style={[type.labelCaption, { color: colors.text.tertiary }]}>{paused ? 'Paused' : strings.library.dayOf(day)}</Text>
        <Text numberOfLines={1} style={[type.titleSmall, { color: colors.text.primary }]}>{novena.title}</Text>
        <Button size="small" label={strings.novena.prayDay(day)} onPress={onPray} style={{ alignSelf: 'flex-start' }} />
      </View>
      <IconButton icon="more" label="More options" onPress={onMenu} />
    </Pressable>
  );
}
