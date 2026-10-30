import { View } from 'react-native';
import { colors, stroke } from '@/constants/theme';
import type { DayState } from '@/utils/dayRules';
import { Icon } from '../Icon';

export function DayMarker({ state }: { state: DayState }) {
  const filled = state === 'prayed';
  return (
    <View accessibilityLabel={state} style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: filled ? colors.action.selected : 'transparent',
      borderWidth: filled ? 0 : state === 'today' ? 2 : stroke.default,
      borderColor: state === 'today' ? colors.border.focus : state === 'missed' ? colors.border.strong : colors.border.default,
      borderStyle: state === 'missed' ? 'dashed' : 'solid' }}>
      {filled ? <Icon name="check" size={14} color={colors.text.onAction} /> : null}
    </View>
  );
}
