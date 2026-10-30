import { Pressable, Text, View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { formatMonthDay } from '@/utils/dateUtils';
import { SaintAvatar } from './SaintAvatar';

export function FeastDayItem({ saintName, avatar, feastDate, onPress }: { saintName: string; avatar?: string; feastDate: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${saintName}, ${formatMonthDay(feastDate)}`} onPress={onPress}
      style={{ width: 96, alignItems: 'center', gap: space[6], padding: space[8], borderRadius: radius.m, backgroundColor: colors.surface.raised }}>
      <Text style={[type.labelCaption, { color: colors.text.tertiary }]}>{formatMonthDay(feastDate)}</Text>
      <SaintAvatar name={saintName} file={avatar} />
      <Text numberOfLines={1} style={[type.bodySmall, { color: colors.text.primary }]}>{saintName}</Text>
    </Pressable>
  );
}
