// Figma "Action Bar" (Novena page): a round Save button and the dark gradient pray button, 50 high.
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import { colors, elevation, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { primaryLabel: string; onPrimary: () => void; saved: boolean; onToggleSave: () => void };

export function ActionBar({ primaryLabel, onPrimary, saved, onToggleSave }: Props) {
  return (
    <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save'} accessibilityState={{ selected: saved }} onPress={onToggleSave}
        style={({ pressed }) => ({ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
          backgroundColor: pressed ? colors.surface.subtle : colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...elevation.card })}>
        <Icon name="bookmark" size={28} weight={saved ? 'fill' : 'light'} />
      </PressableScale>
      <PressableScale dimTo={0.92} accessibilityRole="button" accessibilityLabel={primaryLabel} onPress={onPrimary} style={{ flex: 1 }}>
        <LinearGradient colors={colors.gradient.button} style={{ height: 50, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={[type.labelLarge, { color: colors.text.onAction }]}>{primaryLabel}</Text>
          <Icon name="handsPraying" size={20} color={colors.text.onAction} />
        </LinearGradient>
      </PressableScale>
    </View>
  );
}
