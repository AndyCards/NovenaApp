// Figma "Action Bar" (Novena page): a round Save button and the dark gradient pray button, 50 high.
import { LinearGradient } from 'expo-linear-gradient';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { haptics } from '@/motion/haptics';
import { usePulse } from '@/motion/usePulse';
import { colors, gradients, elevation, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon } from '../Icon';
import { PressableScale } from '@/motion/PressableScale';
import { pressScale } from '@/motion/tokens';

type Props = { primaryLabel: string; onPrimary: () => void; saved: boolean; onToggleSave: () => void };

export function ActionBar({ primaryLabel, onPrimary, saved, onToggleSave }: Props) {
  const pulse = usePulse(saved); // the bookmark swells slightly when saved or unsaved
  return (
    <View style={{ height: 50, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <PressableScale scaleTo={pressScale.icon} accessibilityRole="button" accessibilityLabel={saved ? 'Remove from saved' : 'Save'} accessibilityState={{ selected: saved }} onPress={() => { haptics.tap(); onToggleSave(); }}
        style={({ pressed }) => ({ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center',
          backgroundColor: pressed ? colors.surface.subtle : colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.subtle, ...elevation.card })}>
        <Animated.View style={pulse}><Icon name="bookmark" size={28} weight={saved ? 'fill' : 'light'} /></Animated.View>
      </PressableScale>
      <PressableScale dimTo={0.92} accessibilityRole="button" accessibilityLabel={primaryLabel} onPress={() => { haptics.confirm(); onPrimary(); }} style={{ flex: 1 }}>
        <LinearGradient {...gradients.button} style={{ height: 50, borderRadius: radius.full, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Text style={[type.labelLarge, { color: colors.text.onAction }]}>{primaryLabel}</Text>
          <Icon name="handsPraying" size={20} color={colors.text.onAction} />
        </LinearGradient>
      </PressableScale>
    </View>
  );
}
