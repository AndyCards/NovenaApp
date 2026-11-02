// Figma "Nav Bar" (1429:4753): one top bar for every inner screen. Frosted glass like the tab bar, 10 at the sides and 4 above and below (52 tall).
// Back on the left, an optional centred title (Title/Medium, secondary grey), up to two actions on the right.
// Back and the main action are 38 x 44 with just the icon (no circle); the second action is 44 wide; the two actions are 6 apart.
// `overlay` floats the bar over the top of the screen (it also covers the status bar area) so the page scrolls underneath it and shows through the glass;
// that screen then leaves NAV_BAR_HEIGHT + the top safe area free at the top of its scrolling content.
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { type } from '@/constants/typography';
import { GlassSurface } from '../GlassSurface';
import { IconButton } from '../actions/IconButton';
import type { IconName } from '../Icon';

export const NAV_BAR_HEIGHT = 52;

type Action = { icon: IconName; label: string; onPress: () => void };
type Props = { title?: string; onBack?: () => void; backLabel?: string; primaryAction?: Action; secondaryAction?: Action; overlay?: boolean };

export function NavBar({ title, onBack, backLabel = 'Back', primaryAction, secondaryAction, overlay }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <GlassSurface edge="top" style={overlay ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2, paddingTop: insets.top } : { zIndex: 2 }}>
      <View style={{ paddingHorizontal: 10, paddingVertical: 4 }}>
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
    </GlassSurface>
  );
}
