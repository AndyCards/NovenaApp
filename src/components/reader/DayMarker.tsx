// Figma "Day Marker": 32 circle with praying hands. Solid when prayed, dashed otherwise.
import { View } from 'react-native';
import { colors } from '@/constants/theme';
import type { DayState } from '@/utils/dayRules';
import { Icon } from '../Icon';

export function DayMarker({ state, size = 32 }: { state: DayState; size?: number }) {
  const prayed = state === 'prayed';
  const border = state === 'today' ? colors.text.secondary : state === 'missed' ? colors.border.strong : colors.border.default;
  const hands = prayed ? colors.text.onAction : state === 'upcoming' ? colors.border.default : state === 'missed' ? colors.text.tertiary : colors.text.secondary;
  return (
    <View accessibilityLabel={state} style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center',
      backgroundColor: prayed ? colors.action.primary : 'transparent',
      borderWidth: prayed ? 0 : 1, borderStyle: 'dashed', borderColor: border }}>
      <Icon name="handsPraying" size={Math.round(size * 0.56)} color={hands} weight={prayed ? 'fill' : 'light'} />
    </View>
  );
}
