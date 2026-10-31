// Figma "Recent Chip": outlined pill with the last search and a small × to remove it.
import { Pressable, Text, View } from 'react-native';
import { colors, radius, stroke } from '@/constants/theme';
import { type } from '@/constants/typography';
import { Icon } from '../Icon';

export function RecentChip({ label, onPress, onRemove }: { label: string; onPress: () => void; onRemove?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Search ${label}`} onPress={onPress}
      style={{ height: 36, flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: onRemove ? 8 : 12, borderRadius: radius.full, borderWidth: stroke.hairline * 2, borderColor: colors.border.default, backgroundColor: colors.surface.default }}>
      <Text style={[type.labelSmall, { color: colors.text.body }]}>{label}</Text>
      {onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${label}`} onPress={onRemove} hitSlop={8}>
          <View style={{ width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface.subtle }}>
            <Icon name="clear" size={10} color={colors.text.secondary} />
          </View>
        </Pressable>
      ) : null}
    </Pressable>
  );
}
