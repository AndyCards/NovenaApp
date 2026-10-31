// Small dark pill with the praying-hands icon ("Pray Day 4" on the Continue Card).
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';

export function PrayButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <PressableScale dimTo={0.92} accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ alignSelf: 'flex-start' }}>
      <LinearGradient colors={colors.gradient.button} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16, paddingRight: 18, paddingVertical: 13, borderRadius: radius.full }}>
        <Text style={[type.labelSmall, { fontSize: 15, color: colors.text.onAction }]}>{label}</Text>
        <Icon name="handsPraying" size={18} color={colors.text.onAction} />
      </LinearGradient>
    </PressableScale>
  );
}
