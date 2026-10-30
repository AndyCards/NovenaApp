// A row in the Reader options menu: label, optional detail line, optional icon.
import { Pressable, Text, View } from 'react-native';
import { colors, space } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';

type Props = { label: string; detail?: string; icon?: IconName; onPress: () => void };

export function MenuRow({ label, detail, icon, onPress }: Props) {
  return (
    <Pressable accessibilityRole="menuitem" accessibilityLabel={detail ? `${label}. ${detail}` : label} onPress={onPress}
      style={({ pressed }) => ({ minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: space[12], paddingHorizontal: space[12], backgroundColor: pressed ? colors.surface.subtle : 'transparent' })}>
      {icon ? <Icon name={icon} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={[type.titleSmall, { color: colors.text.primary }]}>{label}</Text>
        {detail ? <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{detail}</Text> : null}
      </View>
    </Pressable>
  );
}
