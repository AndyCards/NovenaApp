import { Pressable, Text } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';

type Props = { label: string; icon: IconName; active: boolean; onPress: () => void };

export function TabItem({ label, icon, active, onPress }: Props) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} accessibilityLabel={label} onPress={onPress}
      style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <Icon name={icon} color={active ? colors.icon.default : colors.icon.secondary} />
      <Text style={[active ? type.labelTabActive : type.labelTab, { color: active ? colors.text.primary : colors.text.tertiary }]}>{label}</Text>
    </Pressable>
  );
}
