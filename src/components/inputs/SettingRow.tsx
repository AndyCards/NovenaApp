// Figma "Setting Row": optional 22 icon, title (16 SemiBold, 22 line) + one-line explanation (12 grey), then a control.
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon, type IconName } from '../Icon';

export function SettingRow({ title, body, icon, control }: { title: string; body?: string; icon?: IconName; control?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
      {icon ? <Icon name={icon} size={22} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[type.titleMedium, { color: colors.text.secondary, lineHeight: 22 }]}>{title}</Text>
        {body ? <Text style={[type.bodySmall, { color: colors.text.tertiary }]}>{body}</Text> : null}
      </View>
      {control}
    </View>
  );
}
