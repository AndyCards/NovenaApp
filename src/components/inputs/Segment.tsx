import { Pressable, Text } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';

export function Segment({ label, count, selected, onPress }: { label: string; count?: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={count === undefined ? label : `${label}, ${count}`} onPress={onPress}
      style={{ flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: selected ? colors.surface.default : 'transparent' }}>
      <Text style={[selected ? type.labelTabActive : type.labelTab, { fontSize: 14, color: selected ? colors.text.primary : colors.text.tertiary }]}>
        {label}{count === undefined ? '' : `  ${count}`}
      </Text>
    </Pressable>
  );
}
