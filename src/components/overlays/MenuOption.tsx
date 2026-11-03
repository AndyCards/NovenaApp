// One tappable line inside a pop-up menu, with an optional icon.
// NOT USED ON ANY SCREEN RIGHT NOW: nothing imports this file, so changing it has no visible effect (see UX_DESIGNER_GUIDE.md).
import { Pressable, Text } from 'react-native';
import { colors, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';

export function MenuOption({ label, icon, onPress }: { label: string; icon?: IconName; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="menuitem" accessibilityLabel={label} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: space[12], paddingHorizontal: 16, paddingVertical: 14, backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      {icon ? <Icon name={icon} /> : null}
      <Text style={[type.bodyLarge, { flex: 1, color: colors.text.primary }]}>{label}</Text>
    </Pressable>
  );
}
