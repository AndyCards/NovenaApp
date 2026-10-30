import { Pressable, Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { SaintAvatar } from '../content/SaintAvatar';

type Props = {
  day: number | null;
  state?: 'default' | 'today' | 'prayed' | 'scheduled' | 'feast' | 'novenaStart';
  saintName?: string;
  saintAvatar?: string;
  onPress?: () => void;
};

export function CalendarDate({ day, state = 'default', saintName, saintAvatar, onPress }: Props) {
  if (day === null) return <View style={{ flex: 1, aspectRatio: 1 / 1.2 }} />;
  const today = state === 'today';
  const prayed = state === 'prayed';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${day}${saintName ? `, ${saintName} feast day` : ''}${prayed ? ', prayed' : ''}${today ? ', today' : ''}`} onPress={onPress}
      style={{ flex: 1, aspectRatio: 1 / 1.2, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: prayed ? colors.action.selected : today ? colors.surface.strong : 'transparent' }}>
        <Text style={[type.calendarDay, { color: prayed ? colors.text.onAction : colors.text.primary }]}>{day}</Text>
      </View>
      {saintName ? <SaintAvatar name={saintName} file={saintAvatar} size="small" /> : null}
    </Pressable>
  );
}
