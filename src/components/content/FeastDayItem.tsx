// Figma "Feast Day Item" (1172:9477): round saint avatar, name and feast date.
import { Pressable, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { formatMonthDay } from '@/utils/dateUtils';
import { SaintAvatar } from './SaintAvatar';

export function FeastDayItem({ saintName, avatar, feastDate, onPress }: { saintName: string; avatar?: string; feastDate: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${saintName}, ${formatMonthDay(feastDate)}`} onPress={onPress}
      style={{ width: 88, alignItems: 'center', gap: 6 }}>
      <SaintAvatar name={saintName} file={avatar} size="large" />
      <Text numberOfLines={2} style={{ fontFamily: fonts.semibold, fontSize: 14, textAlign: 'center', color: colors.text.body }}>{saintName}</Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 12, textAlign: 'center', color: colors.text.secondary }}>{formatMonthDay(feastDate)}</Text>
    </Pressable>
  );
}
