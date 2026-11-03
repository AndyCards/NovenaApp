// Figma "Day Marker" (784:4412): 32 circle with praying hands.
// Prayed: solid dark. Today: soft light disc. Missed: dashed dark-grey ring, stronger hands. Upcoming: dashed light ring, faded hands.
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { colors, gradients } from '@/constants/theme';
import type { DayState } from '@/utils/dayRules';
import { Icon } from '../Icon';

export function DayMarker({ state, size = 32 }: { state: DayState; size?: number }) {
  const icon = Math.round(size * 0.56);
  const base = { width: size, height: size, borderRadius: size / 2, alignItems: 'center' as const, justifyContent: 'center' as const };
  if (state === 'today') {
    return (
      <LinearGradient accessibilityLabel={state} {...gradients.iconCircle} style={[base, { borderWidth: 0.5, borderColor: colors.border.subtle }]}>
        <Icon name="handsPraying" size={icon} color={colors.icon.default} />
      </LinearGradient>
    );
  }
  const prayed = state === 'prayed';
  return (
    <View accessibilityLabel={state} style={[base, {
      backgroundColor: prayed ? colors.action.primary : 'transparent',
      borderWidth: prayed ? 0 : 1, borderStyle: 'dashed', borderColor: state === 'missed' ? colors.progress.fill : colors.border.default }]}>
      <Icon name="handsPraying" size={icon} weight={prayed ? 'fill' : 'light'}
        color={prayed ? colors.text.onAction : state === 'missed' ? colors.icon.secondary : colors.border.default} />
    </View>
  );
}
