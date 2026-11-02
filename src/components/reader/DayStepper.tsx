// "Day 4 of 9" with an arrow on each side. Day 1 disables the left arrow, the last day the right.
// NOT USED ON ANY SCREEN RIGHT NOW: nothing imports this file, so changing it has no visible effect (see UX_DESIGNER_GUIDE.md).
import { Text, View } from 'react-native';
import { colors, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { strings } from '@/copy/strings';
import { StepperButton } from '../actions/StepperButton';

export function DayStepper({ day, total, onChange }: { day: number; total: number; onChange: (d: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[12], minHeight: 44 }}>
      <StepperButton direction="previous" disabled={day <= 1} onPress={() => onChange(day - 1)} />
      <Text accessibilityRole="adjustable" style={[type.titleSmall, { color: colors.text.primary }]}>{strings.reader.dayOf(day, total)}</Text>
      <StepperButton direction="next" disabled={day >= total} onPress={() => onChange(day + 1)} />
    </View>
  );
}
