// Figma "Tab Item Detailed": active tab gets a soft pill behind a filled icon.
import { Pressable, Text, View } from 'react-native';
import { colors, radius } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';

type Props = { label: string; icon: IconName; active: boolean; onPress: () => void };

export function TabItem({ label, icon, active, onPress }: Props) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={onPress}
      style={{ flex: 1, alignItems: 'center', gap: 2, paddingHorizontal: 8, paddingVertical: 4 }}>
      <View style={{ height: 40, paddingHorizontal: 16, justifyContent: 'center', borderRadius: radius.m, backgroundColor: active ? colors.surface.subtle : 'transparent' }}>
        <Icon name={icon} size={28} weight={active ? 'fill' : 'light'} color={active ? colors.icon.default : colors.icon.secondary} />
      </View>
      <Text style={[active ? type.labelTabActive : type.labelTab, { color: active ? colors.text.primary : colors.text.tertiary }]}>{label}</Text>
    </Pressable>
  );
}
