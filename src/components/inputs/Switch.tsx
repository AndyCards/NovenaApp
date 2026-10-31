// Figma "Switch": 46×28. On = dark track, Off = light grey track; white knob.
import { Pressable, View } from 'react-native';
import { colors, stroke } from '@/constants/theme';

export function Switch({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} hitSlop={8} onPress={() => onValueChange(!value)}
      style={{ width: 46, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center', backgroundColor: value ? colors.action.primary : colors.surface.subtle, borderWidth: value ? 0 : stroke.hairline, borderColor: colors.border.subtle }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: colors.surface.default, alignSelf: value ? 'flex-end' : 'flex-start',
        shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }} />
    </Pressable>
  );
}
