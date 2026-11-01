// One configurable top bar: back button, title, up to two actions on the right.
import { Text, View } from 'react-native';
import { colors, screenMargin } from '@/constants/theme';
import { type } from '@/constants/typography';
import { IconButton } from '../actions/IconButton';
import type { IconName } from '../Icon';

type Action = { icon: IconName; label: string; onPress: () => void };
type Props = { title?: string; onBack?: () => void; primaryAction?: Action; secondaryAction?: Action };

export function NavBar({ title, onBack, primaryAction, secondaryAction }: Props) {
  return (
    <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: screenMargin, backgroundColor: colors.surface.page }}>
      <View style={{ width: 80, alignItems: 'flex-start' }}>
        {onBack ? <IconButton icon="back" label="Back" size="plain" onPress={onBack} /> : null}
      </View>
      <Text accessibilityRole="header" numberOfLines={1} style={[type.titleMedium, { flex: 1, textAlign: 'center', color: colors.text.primary }]}>{title}</Text>
      <View style={{ width: 80, flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
        {secondaryAction ? <IconButton size="plain" {...secondaryAction} /> : null}
        {primaryAction ? <IconButton size="plain" {...primaryAction} /> : null}
      </View>
    </View>
  );
}
