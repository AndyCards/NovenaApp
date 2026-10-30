// "Set a reminder time". Built as a floating card (never a bottom sheet).
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { Button } from '../actions/Button';
import { FloatingCard } from './FloatingCard';

type Props = { visible: boolean; time: string; onClose: () => void; onSave: (hhmm: string) => void; onTurnOffForNovena?: () => void };

const hours = Array.from({ length: 12 }, (_, i) => i + 1);
const minutes = [0, 15, 30, 45];

export function ReminderSheet({ visible, time, onClose, onSave, onTurnOffForNovena }: Props) {
  const [h24, m0] = time.split(':').map(Number);
  const [hour, setHour] = useState(((h24 + 11) % 12) + 1);
  const [minute, setMinute] = useState(m0);
  const [pm, setPm] = useState(h24 >= 12);
  const hhmm = () => `${String(((hour % 12) + (pm ? 12 : 0))).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const chip = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
      style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: selected ? colors.action.selected : colors.surface.subtle }}>
      <Text style={[type.labelMedium, { color: selected ? colors.text.onAction : colors.text.secondary }]}>{label}</Text>
    </Pressable>
  );

  return (
    <FloatingCard visible={visible} onClose={onClose} title={strings.reminders.setReminder}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>{hours.map((h) => chip(String(h), h === hour, () => setHour(h)))}</View>
      <View style={{ flexDirection: 'row', gap: space[8] }}>
        {minutes.map((m) => chip(String(m).padStart(2, '0'), m === minute, () => setMinute(m)))}
        {chip('AM', !pm, () => setPm(false))}
        {chip('PM', pm, () => setPm(true))}
      </View>
      <Button label={strings.reminders.save} onPress={() => onSave(hhmm())} />
      {onTurnOffForNovena ? <Button label={strings.reminders.turnOffForNovena} variant="secondary" onPress={onTurnOffForNovena} /> : null}
    </FloatingCard>
  );
}
