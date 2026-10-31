// Figma "Segment": label + round count chip. Selected = white pill with hairline border and soft shadow.
import { Pressable, Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';

export function Segment({ label, count, selected, onPress }: { label: string; count?: number; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected }} accessibilityLabel={count === undefined ? label : `${label}, ${count}`} onPress={onPress}
      style={{ flex: 1, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, borderRadius: radius.m,
        ...(selected ? { backgroundColor: colors.surface.default, borderWidth: stroke.hairline, borderColor: colors.border.default, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 }, elevation: 1 } : null) }}>
      <Text style={[type.labelSmall, { color: selected ? colors.text.primary : colors.text.secondary }]}>{label}</Text>
      {count === undefined ? null : (
        <View style={{ width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.action.primary : colors.surface.strong }}>
          <Text style={[type.bodySmall, { color: selected ? colors.text.onAction : colors.text.secondary }]}>{count}</Text>
        </View>
      )}
    </Pressable>
  );
}
