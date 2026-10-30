import { Pressable, View } from 'react-native';
import { colors } from '@/constants/theme';

export function Switch({ value, onValueChange, label }: { value: boolean; onValueChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={label} hitSlop={8} onPress={() => onValueChange(!value)}
      style={{ width: 51, height: 31, borderRadius: 16, padding: 2, justifyContent: 'center', backgroundColor: value ? colors.action.selected : colors.action.disabled }}>
      <View style={{ width: 27, height: 27, borderRadius: 14, backgroundColor: colors.surface.default, alignSelf: value ? 'flex-end' : 'flex-start' }} />
    </Pressable>
  );
}
