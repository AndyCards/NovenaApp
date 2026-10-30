import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { colors, space, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';

export function SettingRow({ title, body, control }: { title: string; body?: string; control?: ReactNode }) {
  return (
    <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space[12], paddingVertical: space[12], borderBottomWidth: stroke.hairline, borderColor: colors.border.default }}>
      <View style={{ flex: 1 }}>
        <Text style={[type.titleSmall, { color: colors.text.primary }]}>{title}</Text>
        {body ? <Text style={[type.bodyMedium, { color: colors.text.tertiary }]}>{body}</Text> : null}
      </View>
      {control}
    </View>
  );
}
