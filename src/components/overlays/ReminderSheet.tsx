// "Set a reminder time". Built as a floating card (never a bottom sheet).
import { useState } from 'react';
import { View } from 'react-native';
import { colors, radius, space } from '@/constants/theme';
import { strings } from '@/copy/strings';
import { Button } from '../actions/Button';
import { WheelPicker } from '../inputs/WheelPicker';
import { FloatingCard } from './FloatingCard';

type Props = { visible: boolean; time: string; onClose: () => void; onSave: (hhmm: string) => void; onTurnOffForNovena?: () => void };

const hourLabels = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minuteLabels = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export function ReminderSheet({ visible, time, onClose, onSave, onTurnOffForNovena }: Props) {
  const [h24, m0] = time.split(':').map(Number);
  const [hour, setHour] = useState(((h24 + 11) % 12) + 1);
  const [minute, setMinute] = useState(m0);
  const [pm, setPm] = useState(h24 >= 12);
  const hhmm = () => `${String(((hour % 12) + (pm ? 12 : 0))).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <FloatingCard visible={visible} onClose={onClose} title={strings.reminders.setReminder}>
      <View style={{ height: 180, borderRadius: radius.m, backgroundColor: colors.surface.subtle, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[8], overflow: 'hidden' }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: space[8], right: space[8], top: 72, height: 36, borderRadius: radius.s, backgroundColor: 'rgba(0,0,0,0.06)' }} />
        <WheelPicker items={hourLabels} index={hour - 1} onChange={(i) => setHour(i + 1)} />
        <WheelPicker items={minuteLabels} index={minute} onChange={setMinute} />
        <WheelPicker items={['AM', 'PM']} index={pm ? 1 : 0} onChange={(i) => setPm(i === 1)} />
      </View>
      <Button label={strings.reminders.save} onPress={() => onSave(hhmm())} />
      {onTurnOffForNovena ? <Button label={strings.reminders.turnOffForNovena} variant="secondary" onPress={onTurnOffForNovena} /> : null}
    </FloatingCard>
  );
}
