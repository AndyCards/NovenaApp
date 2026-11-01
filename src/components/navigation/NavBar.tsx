// Figma "Nav Bar" (1429:4753): one top bar for every inner screen. White, 6 padding all round (56 tall).
// Back on the left, an optional centred title (Title/Medium, secondary grey), up to two actions on the right.
// Buttons are 38 x 44 with just the icon (no circle), 6 apart.
import { Text, View } from 'react-native';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { IconButton } from '../actions/IconButton';
import type { IconName } from '../Icon';

type Action = { icon: IconName; label: string; onPress: () => void };
type Props = { title?: string; onBack?: () => void; backLabel?: string; primaryAction?: Action; secondaryAction?: Action };

export function NavBar({ title, onBack, backLabel = 'Back', primaryAction, secondaryAction }: Props) {
  return (
    <View style={{ padding: 6, backgroundColor: colors.surface.default }}>
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {onBack ? <IconButton icon="back" label={backLabel} size="plain" onPress={onBack} /> : <View style={{ width: 38 }} />}
        <View style={{ flex: 1, alignItems: 'center' }}>
          {title ? <Text accessibilityRole="header" numberOfLines={1} style={[type.titleMedium, { textAlign: 'center', color: colors.text.secondary }]}>{title}</Text> : null}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, minWidth: 38 }}>
          {secondaryAction ? <IconButton size="plain" {...secondaryAction} /> : null}
          {primaryAction ? <IconButton size="plain" {...primaryAction} /> : null}
        </View>
      </View>
    </View>
  );
}
