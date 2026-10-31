// Figma "Weekday Toggle": 44 high circle. On = solid grey, Off = soft gradient.
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';

export function WeekdayToggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  const text = <Text style={[type.labelSmall, { color: on ? colors.surface.raised : colors.text.body }]}>{label.slice(0, 1)}</Text>;
  const shape = { flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: colors.border.subtle } as const;
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} style={{ flex: 1 }}>
      {on ? <LinearGradient colors={[colors.action.selected, colors.action.selected]} style={shape}>{text}</LinearGradient>
        : <LinearGradient colors={['#EFEFEF', '#FBFBFB']} style={shape}>{text}</LinearGradient>}
    </Pressable>
  );
}
