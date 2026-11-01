// Figma "Nav Bar" (1429:4753): one top bar for every inner screen. White, 10 at the sides and 4 above and below (52 tall).
// Back on the left, an optional centred title (Title/Medium, secondary grey), up to two actions on the right.
// Back and the main action are 38 x 44 with just the icon (no circle); the second action is 44 wide; the two actions are 6 apart.
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { IconButton } from '../actions/IconButton';
import type { IconName } from '../Icon';

type Action = { icon: IconName; label: string; onPress: () => void };
type Props = { title?: string; onBack?: () => void; backLabel?: string; primaryAction?: Action; secondaryAction?: Action };

export function NavBar({ title, onBack, backLabel = 'Back', primaryAction, secondaryAction }: Props) {
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.surface.default }}>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}>
        {onBack ? <IconButton icon="back" label={backLabel} size="plain" onPress={onBack} /> : <View style={{ width: 38 }} />}
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title ? <Text accessibilityRole="header" numberOfLines={1} style={[type.titleMedium, { textAlign: 'center', color: colors.text.secondary }]}>{title}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, minWidth: 38 }}>
          {secondaryAction ? <View style={{ width: 44, alignItems: 'center' }}><IconButton size="plain" {...secondaryAction} /></View> : null}
          {primaryAction ? <IconButton size="plain" {...primaryAction} /> : null}
        </View>
      </View>
    </View>
  );
}
